/**
 * Server-side provider resolution shared by every API route.
 *
 * Two modes:
 *  - Self-host mode: the server environment provides the credentials
 *    (`LLM_API_KEY`, or `LLM_PROVIDER` set to a keyless local server).
 *    Request headers are ignored.
 *  - Bring-your-own-key mode: the browser sends `x-llm-provider`,
 *    `x-llm-model` and `x-llm-key`. The key is used for that one upstream
 *    call and is never stored or logged.
 *
 * SSRF guard: requests from the browser can only reach the base URL of a
 * known public preset. Local presets and custom base URLs need
 * `LLM_ALLOW_CUSTOM_BASE_URL=1`.
 */
import { NextResponse } from "next/server";
import type { LlmConfig } from "./client";
import { LlmError } from "./errors";
import { DEFAULT_PROVIDER_ID, getProvider } from "./providers";

export const HEADER_PROVIDER = "x-llm-provider";
export const HEADER_MODEL = "x-llm-model";
export const HEADER_KEY = "x-llm-key";
export const HEADER_BASE_URL = "x-llm-base-url";

export const DEFAULT_MAX_TOKENS_CAP = 4096;
const MAX_KEY_LENGTH = 512;
const MODEL_PATTERN = /^[A-Za-z0-9._:/@+-]{1,200}$/;

type Env = Record<string, string | undefined>;

export interface HeaderSource {
  get(name: string): string | null;
}

function flag(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

export function maxTokensCap(env: Env): number {
  const n = Number.parseInt(env.LLM_MAX_TOKENS || "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_TOKENS_CAP;
}

export function customBaseUrlAllowed(env: Env): boolean {
  return flag(env.LLM_ALLOW_CUSTOM_BASE_URL);
}

/** True when the server environment supplies the LLM credentials. */
export function isServerConfigured(env: Env): boolean {
  if (env.LLM_API_KEY) return true;
  const preset = getProvider(env.LLM_PROVIDER);
  return !!preset && !preset.keyRequired;
}

function normaliseBaseUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new LlmError("invalid_base_url", "The base URL is not a valid URL.", 400);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new LlmError("invalid_base_url", "The base URL must start with http:// or https://.", 400);
  }
  if (url.username || url.password) {
    throw new LlmError("invalid_base_url", "The base URL must not contain credentials.", 400);
  }
  return url.toString().replace(/\/+$/, "");
}

function checkModel(model: string): string {
  if (!MODEL_PATTERN.test(model)) {
    throw new LlmError("invalid_model", "The model name contains characters that are not allowed.", 400);
  }
  return model;
}

function fromEnv(env: Env): LlmConfig {
  const providerId = env.LLM_PROVIDER || DEFAULT_PROVIDER_ID;
  const preset = getProvider(providerId);
  if (!preset) {
    throw new LlmError("server_misconfigured", `LLM_PROVIDER "${providerId}" is not a known provider.`, 500);
  }
  const rawBase = env.LLM_BASE_URL || preset.baseUrl;
  if (!rawBase) {
    throw new LlmError("server_misconfigured", "LLM_BASE_URL is required when LLM_PROVIDER=custom.", 500);
  }
  const model = env.LLM_MODEL || preset.defaultModel;
  if (!model) {
    throw new LlmError("server_misconfigured", "LLM_MODEL is required for this provider.", 500);
  }
  return {
    provider: preset.id,
    // The operator chose this URL, so it is trusted as-is.
    baseUrl: normaliseBaseUrl(rawBase),
    apiKey: env.LLM_API_KEY || "",
    model,
    authStyle: preset.authStyle,
    maxTokensCap: maxTokensCap(env),
    source: "env",
  };
}

function fromHeaders(headers: HeaderSource, env: Env): LlmConfig {
  const providerId = headers.get(HEADER_PROVIDER)?.trim() || DEFAULT_PROVIDER_ID;
  const preset = getProvider(providerId);
  if (!preset) {
    throw new LlmError("invalid_provider", `"${providerId.slice(0, 40)}" is not a supported provider.`, 400);
  }

  const allowCustom = customBaseUrlAllowed(env);
  if (preset.selfHostOnly && !allowCustom) {
    throw new LlmError(
      "provider_not_allowed",
      `${preset.label} is only available when you run LearnPath yourself.`,
      400,
    );
  }

  const requestedBase = headers.get(HEADER_BASE_URL)?.trim();
  let baseUrl = preset.baseUrl;
  if (requestedBase) {
    if (!allowCustom) {
      throw new LlmError(
        "custom_base_url_not_allowed",
        "This server only talks to the built-in providers. Custom base URLs are disabled.",
        400,
      );
    }
    baseUrl = normaliseBaseUrl(requestedBase);
  }
  if (!baseUrl) {
    throw new LlmError("invalid_base_url", "Enter a base URL for the custom provider in Settings.", 400);
  }

  const apiKey = headers.get(HEADER_KEY)?.trim() || "";
  if (apiKey.length > MAX_KEY_LENGTH || /[\r\n]/.test(apiKey)) {
    throw new LlmError("invalid_key_format", "That API key does not look valid.", 400);
  }
  if (preset.keyRequired && !apiKey) {
    throw new LlmError("missing_key", "Add your API key in Settings to use this feature.", 400);
  }

  const model = checkModel(headers.get(HEADER_MODEL)?.trim() || preset.defaultModel);

  return {
    provider: preset.id,
    baseUrl,
    apiKey,
    model,
    authStyle: preset.authStyle,
    maxTokensCap: maxTokensCap(env),
    source: "request",
  };
}

/**
 * Decide which provider, key and model a request uses.
 * Server environment wins; otherwise the visitor's headers are used.
 */
export function resolveLlmConfig(headers: HeaderSource, env: Env = process.env): LlmConfig {
  return isServerConfigured(env) ? fromEnv(env) : fromHeaders(headers, env);
}

/** Public (secret-free) description of how this server is configured. */
export function publicLlmInfo(env: Env = process.env) {
  const serverConfigured = isServerConfigured(env);
  const preset = serverConfigured ? getProvider(env.LLM_PROVIDER || DEFAULT_PROVIDER_ID) : undefined;
  return {
    mode: serverConfigured ? ("server" as const) : ("byo-key" as const),
    provider: preset?.id ?? null,
    providerLabel: preset?.label ?? null,
    model: serverConfigured ? env.LLM_MODEL || preset?.defaultModel || null : null,
    allowCustomBaseUrl: customBaseUrlAllowed(env),
    maxTokensCap: maxTokensCap(env),
  };
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof LlmError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  }
  // Unknown failure: say nothing specific. Nothing here is logged, so a key
  // that ended up inside an exception message cannot reach the logs.
  return NextResponse.json(
    { error: "Something went wrong on the server. Please try again.", code: "server_error" },
    { status: 500 },
  );
}

/** Read a JSON object body, or throw a 400. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new LlmError("invalid_request", "The request body must be a JSON object.", 400);
}

/** Trimmed string limited to `max` characters, or the fallback. */
export function textField(value: unknown, max: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : fallback;
}

export function intField(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Shared route wrapper: parses the body, resolves the provider and turns any
 * error into a JSON response `{ error, code }`.
 */
export async function handleLlmRoute(
  request: Request,
  handler: (ctx: { llm: LlmConfig; body: Record<string, unknown> }) => Promise<Response>,
  env: Env = process.env,
): Promise<Response> {
  try {
    const body = await readJsonBody(request);
    const llm = resolveLlmConfig(request.headers, env);
    return await handler({ llm, body });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Extract the first JSON array or object from a model reply. */
export function extractJson(content: string, kind: "array" | "object"): unknown {
  const fenced = content.replace(/```(?:json)?/gi, "");
  const match = kind === "array" ? fenced.match(/\[[\s\S]*\]/) : fenced.match(/\{[\s\S]*\}/);
  if (!match) return undefined;
  try {
    return JSON.parse(match[0]);
  } catch {
    return undefined;
  }
}

export function unreadable(what: string): LlmError {
  return new LlmError(
    "unreadable_output",
    `The model replied, but not in a format LearnPath could read as ${what}. Try again or pick a stronger model.`,
    502,
  );
}
