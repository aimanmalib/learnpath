/**
 * Minimal OpenAI-compatible `/chat/completions` client (server side).
 *
 * Replaces the old MiMo-only client: the endpoint, auth header style and
 * model all come from a resolved `LlmConfig` (see `server.ts`).
 */
import type { AuthStyle } from "./providers";
import { LlmError, upstreamError } from "./errors";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmConfig {
  provider: string;
  baseUrl: string;
  /** May be empty for keyless local servers. */
  apiKey: string;
  model: string;
  authStyle: AuthStyle;
  /** Upper bound applied to every request's max_tokens. */
  maxTokensCap: number;
  /** Where the key came from: server environment or the visitor's request headers. */
  source: "env" | "request";
}

export interface ChatResult {
  content: string;
  reasoning_content: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  finish_reason: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export const DEFAULT_TIMEOUT_MS = 60_000;

export function buildHeaders(config: Pick<LlmConfig, "apiKey" | "authStyle">): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.apiKey) {
    if (config.authStyle === "api-key") headers["api-key"] = config.apiKey;
    else headers["Authorization"] = `Bearer ${config.apiKey}`;
  }
  return headers;
}

export function clampMaxTokens(requested: number | undefined, cap: number): number {
  const wanted = Number.isFinite(requested) && (requested as number) > 0 ? Math.floor(requested as number) : cap;
  return Math.max(1, Math.min(wanted, cap));
}

async function post(
  config: LlmConfig,
  messages: ChatMessage[],
  stream: boolean,
  options: CompletionOptions,
): Promise<Response> {
  const { temperature = 0.7, maxTokens, timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch } = options;
  let response: Response;
  try {
    response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(config),
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature,
        max_tokens: clampMaxTokens(maxTokens, config.maxTokensCap),
        stream,
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (err) {
    const name = typeof err === "object" && err !== null && "name" in err ? String(err.name) : "";
    if (name === "TimeoutError" || name === "AbortError") {
      throw new LlmError("provider_timeout", "The provider took too long to answer. Try again.", 504);
    }
    throw new LlmError("provider_unreachable", "Could not reach the provider. Check the provider in Settings.", 502);
  }
  if (!response.ok) {
    // Drain the body so the connection can be reused; never surface its text.
    await response.body?.cancel().catch(() => undefined);
    throw upstreamError(response.status, config.model);
  }
  return response;
}

/** Non-streaming completion. */
export async function chatCompletion(
  config: LlmConfig,
  messages: ChatMessage[],
  options: CompletionOptions = {},
): Promise<ChatResult> {
  const response = await post(config, messages, false, options);
  let data: {
    model?: string;
    choices?: { message?: { content?: string; reasoning_content?: string }; finish_reason?: string }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  try {
    data = await response.json();
  } catch {
    throw new LlmError("provider_unavailable", "The provider sent a reply that is not valid JSON.", 502);
  }
  const choice = data.choices?.[0];
  const usage = data.usage || {};
  return {
    content: choice?.message?.content || "",
    reasoning_content: choice?.message?.reasoning_content || "",
    model: data.model || config.model,
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0,
    finish_reason: choice?.finish_reason || "",
  };
}

/** Streaming completion: returns the upstream SSE body unchanged. */
export async function chatCompletionStream(
  config: LlmConfig,
  messages: ChatMessage[],
  options: CompletionOptions = {},
): Promise<ReadableStream<Uint8Array>> {
  const response = await post(config, messages, true, options);
  if (!response.body) {
    throw new LlmError("provider_unavailable", "The provider returned an empty stream.", 502);
  }
  return response.body;
}
