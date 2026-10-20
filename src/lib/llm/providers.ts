/**
 * Provider presets for LearnPath.
 *
 * Pure data, safe to import from both server code and the browser. Every
 * preset speaks the OpenAI `/chat/completions` protocol.
 *
 * The server only ever forwards requests to the `baseUrl` of one of these
 * presets. Presets marked `selfHostOnly` point at a local machine (or at a
 * URL the operator chooses), so a browser can only select them when the
 * server sets `LLM_ALLOW_CUSTOM_BASE_URL=1`.
 */

export type AuthStyle = "bearer" | "api-key";

export interface ProviderPreset {
  id: string;
  label: string;
  /** Base URL without trailing slash. Empty for `custom`. */
  baseUrl: string;
  authStyle: AuthStyle;
  defaultModel: string;
  /** Whether a request without an API key makes sense for this provider. */
  keyRequired: boolean;
  /** Local or operator-chosen endpoint: only selectable from the browser in self-host mode. */
  selfHostOnly: boolean;
  /** Where a visitor can create an API key. */
  keysUrl?: string;
}

export const PROVIDERS: readonly ProviderPreset[] = [
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    authStyle: "bearer",
    defaultModel: "gpt-4o-mini",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    authStyle: "bearer",
    defaultModel: "openai/gpt-4o-mini",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://openrouter.ai/keys",
  },
  {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    authStyle: "bearer",
    defaultModel: "llama-3.3-70b-versatile",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://console.groq.com/keys",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    authStyle: "bearer",
    defaultModel: "deepseek-chat",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "together",
    label: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    authStyle: "bearer",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://api.together.ai/settings/api-keys",
  },
  {
    id: "mistral",
    label: "Mistral",
    baseUrl: "https://api.mistral.ai/v1",
    authStyle: "bearer",
    defaultModel: "mistral-small-latest",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://console.mistral.ai/api-keys",
  },
  {
    id: "mimo",
    label: "Xiaomi MiMo",
    baseUrl: "https://api.xiaomimimo.com/v1",
    authStyle: "api-key",
    defaultModel: "mimo-v2.5-pro",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://platform.xiaomimimo.com/",
  },
  {
    id: "mimo-token-plan",
    label: "Xiaomi MiMo (Token Plan, Singapore)",
    baseUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
    authStyle: "api-key",
    defaultModel: "mimo-v2.5-pro",
    keyRequired: true,
    selfHostOnly: false,
    keysUrl: "https://platform.xiaomimimo.com/",
  },
  {
    id: "ollama",
    label: "Ollama (self-host)",
    baseUrl: "http://localhost:11434/v1",
    authStyle: "bearer",
    defaultModel: "llama3.1",
    keyRequired: false,
    selfHostOnly: true,
  },
  {
    id: "llamacpp",
    label: "llama.cpp server (self-host)",
    baseUrl: "http://localhost:8080/v1",
    authStyle: "bearer",
    defaultModel: "local-model",
    keyRequired: false,
    selfHostOnly: true,
  },
  {
    id: "custom",
    label: "Custom OpenAI-compatible URL (self-host)",
    baseUrl: "",
    authStyle: "bearer",
    defaultModel: "",
    keyRequired: false,
    selfHostOnly: true,
  },
];

export const DEFAULT_PROVIDER_ID = "openai";

export function getProvider(id: string | null | undefined): ProviderPreset | undefined {
  if (!id) return undefined;
  return PROVIDERS.find((p) => p.id === id);
}
