/**
 * OpenAI-compatible LLM client for LearnPath.
 *
 * Works with any provider that speaks the OpenAI `/chat/completions` protocol
 * (OpenAI, OpenRouter, Ollama, llama.cpp, Xiaomi MiMo Token Plan, ...). The auth
 * header style (bearer vs api-key) is chosen automatically from the selected
 * provider preset.
 *
 * Configure with env vars:
 *   LLM_PROVIDER   one of: openai | openrouter | ollama | mimo   (default: mimo)
 *   LLM_API_KEY    API key (legacy MIMO_API_KEY still honored)
 *   LLM_BASE_URL   override the provider base URL (optional)
 *   LLM_MODEL      override the default model (optional)
 */

export interface MiMoMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MiMoResponse {
  content: string;
  reasoning_content: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  finish_reason: string;
}

export interface MiMoStreamChunk {
  delta?: {
    content?: string;
    reasoning_content?: string;
  };
  finish_reason?: string;
}

export type AuthStyle = "bearer" | "api-key";

export interface ProviderPreset {
  baseUrl: string;
  authStyle: AuthStyle;
  model: string;
  envKey: string;
  envBase: string;
}

export const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  mimo: {
    baseUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
    authStyle: "api-key",
    model: "mimo-v2.5-pro",
    envKey: "MIMO_API_KEY",
    envBase: "MIMO_BASE_URL",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    authStyle: "bearer",
    model: "gpt-4o-mini",
    envKey: "OPENAI_API_KEY",
    envBase: "OPENAI_BASE_URL",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    authStyle: "bearer",
    model: "openai/gpt-4o-mini",
    envKey: "OPENROUTER_API_KEY",
    envBase: "OPENROUTER_BASE_URL",
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    authStyle: "bearer",
    model: "llama3.1",
    envKey: "OLLAMA_API_KEY",
    envBase: "OLLAMA_BASE_URL",
  },
};

export const DEFAULT_PROVIDER = "mimo";

const DEFAULT_BASE_URL = PROVIDER_PRESETS[DEFAULT_PROVIDER].baseUrl;
const DEFAULT_MODEL = PROVIDER_PRESETS[DEFAULT_PROVIDER].model;

export class MiMoClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private authStyle: AuthStyle;

  /**
   * Backward-compatible positional constructor. The optional 4th/5th args add
   * provider/auth-style control; defaults preserve the original MiMo behavior.
   */
  constructor(
    apiKey: string = process.env.MIMO_API_KEY || "",
    baseUrl: string = process.env.MIMO_BASE_URL || DEFAULT_BASE_URL,
    model: string = process.env.MIMO_MODEL || DEFAULT_MODEL,
    authStyle: AuthStyle = "api-key",
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
    this.authStyle = authStyle;
  }

  /** Build headers — bearer or api-key depending on the provider. */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.authStyle === "bearer") {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    } else {
      headers["api-key"] = this.apiKey;
    }
    return headers;
  }

  /** Non-streaming chat completion */
  async chatCompletion(
    messages: MiMoMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<MiMoResponse> {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const usage = data.usage || {};

    return {
      content: choice?.message?.content || "",
      reasoning_content: choice?.message?.reasoning_content || "",
      model: data.model || this.model,
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
      finish_reason: choice?.finish_reason || "",
    };
  }

  /** Streaming chat completion via SSE */
  async *streamCompletion(
    messages: MiMoMessage[],
    options: { temperature?: number; maxTokens?: number } = {},
  ): AsyncGenerator<MiMoStreamChunk> {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`LLM stream error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const chunk = JSON.parse(data);
          const delta = chunk.choices?.[0]?.delta;
          if (delta) {
            yield {
              delta: {
                content: delta.content || undefined,
                reasoning_content: delta.reasoning_content || undefined,
              },
              finish_reason: chunk.choices?.[0]?.finish_reason || undefined,
            };
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}

/**
 * Create a client from environment variables, resolving the active provider
 * preset. Honors LLM_PROVIDER + provider-specific keys, with legacy MIMO_*
 * env vars as a fallback so existing deployments keep working.
 */
export function createMiMoClient(): MiMoClient {
  const provider = process.env.LLM_PROVIDER || DEFAULT_PROVIDER;
  const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS[DEFAULT_PROVIDER];

  const apiKey =
    process.env.LLM_API_KEY ||
    process.env[preset.envKey] ||
    process.env.MIMO_API_KEY ||
    "";
  const baseUrl =
    process.env.LLM_BASE_URL ||
    process.env[preset.envBase] ||
    process.env.MIMO_BASE_URL ||
    preset.baseUrl;
  const model = process.env.LLM_MODEL || process.env.MIMO_MODEL || preset.model;

  return new MiMoClient(apiKey, baseUrl, model, preset.authStyle);
}
