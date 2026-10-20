/**
 * Browser-side LLM settings (bring-your-own-key).
 *
 * Stored only in this browser's localStorage. Every access is wrapped in
 * try/catch because storage can be unavailable (private mode, blocked site
 * data). The key leaves the browser only as a request header to this app's
 * own API routes, which forward it to the chosen provider.
 */
import { DEFAULT_PROVIDER_ID, getProvider } from "./providers";

export const SETTINGS_STORAGE_KEY = "learnpath.llm-settings.v1";
const CHANGED_EVENT = "learnpath:settings-changed";

export interface LlmSettings {
  provider: string;
  model: string;
  apiKey: string;
  /** Only used for self-host presets when the server allows custom base URLs. */
  baseUrl: string;
}

export function defaultSettings(providerId: string = DEFAULT_PROVIDER_ID): LlmSettings {
  const preset = getProvider(providerId) ?? getProvider(DEFAULT_PROVIDER_ID)!;
  return { provider: preset.id, model: preset.defaultModel, apiKey: "", baseUrl: "" };
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Raw stored value (a stable string, suitable for useSyncExternalStore). */
export function readRawSettings(): string | null {
  try {
    return storage()?.getItem(SETTINGS_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

/** Notify on changes from this tab (custom event) and other tabs (storage event). */
export function subscribeSettings(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => e.key === SETTINGS_STORAGE_KEY && onChange();
  window.addEventListener(CHANGED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function announce(): void {
  try {
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    // not in a browser
  }
}

export function parseSettings(raw: string | null | undefined): LlmSettings {
  const fallback = defaultSettings();
  try {
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<LlmSettings>;
    const preset = getProvider(parsed.provider);
    if (!preset) return fallback;
    return {
      provider: preset.id,
      model: typeof parsed.model === "string" && parsed.model.trim() ? parsed.model.trim() : preset.defaultModel,
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey.trim() : "",
      baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl.trim() : "",
    };
  } catch {
    return fallback;
  }
}

export function loadSettings(): LlmSettings {
  return parseSettings(readRawSettings());
}

/** Returns false when the browser refused to store the settings. */
export function saveSettings(settings: LlmSettings): boolean {
  try {
    const s = storage();
    if (!s) return false;
    s.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    announce();
    return true;
  } catch {
    return false;
  }
}

export function clearSettings(): void {
  try {
    storage()?.removeItem(SETTINGS_STORAGE_KEY);
  } catch {
    // nothing to do
  }
  announce();
}

/** Headers sent to this app's API routes. */
export function settingsHeaders(settings: LlmSettings): Record<string, string> {
  const headers: Record<string, string> = { "x-llm-provider": settings.provider };
  if (settings.model) headers["x-llm-model"] = settings.model;
  if (settings.apiKey) headers["x-llm-key"] = settings.apiKey;
  if (settings.baseUrl && getProvider(settings.provider)?.selfHostOnly) headers["x-llm-base-url"] = settings.baseUrl;
  return headers;
}
