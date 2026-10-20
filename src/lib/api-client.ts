/**
 * Browser helper for calling LearnPath's API routes with the visitor's
 * provider settings attached as headers.
 */
import { loadSettings, settingsHeaders } from "./llm/settings";
import { getClientLocale } from "@/i18n/locale-store";
import type { Locale } from "@/i18n/config";

export const OPEN_SETTINGS_EVENT = "learnpath:open-settings";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }

  /** Errors the visitor can fix in the Settings panel. */
  get fixableInSettings(): boolean {
    return [
      "missing_key",
      "provider_rejected_key",
      "provider_model_not_found",
      "provider_bad_request",
      "provider_payment_required",
      "provider_not_allowed",
      "custom_base_url_not_allowed",
      "invalid_base_url",
      "invalid_model",
      "invalid_key_format",
      "invalid_provider",
    ].includes(this.code);
  }
}

/**
 * Open the settings panel. `reason` is an error code (e.g. "missing_key");
 * the panel shows the matching message in the visitor's language.
 */
export function openSettings(reason?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT, { detail: { reason } }));
}

export async function toApiError(res: Response): Promise<ApiError> {
  let code = "http_error";
  let message = `Request failed (HTTP ${res.status}).`;
  try {
    const data = await res.json();
    if (typeof data?.error === "string") message = data.error;
    if (typeof data?.code === "string") code = data.code;
  } catch {
    // keep defaults
  }
  return new ApiError(code, message, res.status);
}

/** Headers for an API call: JSON + the visitor's provider settings. */
export function apiHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...settingsHeaders(loadSettings()) };
}

/**
 * Request body with the UI language added, so the model answers in the
 * language the visitor is reading. An explicit `language` in `body` wins.
 */
export function withLanguage<T extends object>(body: T, locale: Locale = getClientLocale()): T & { language: Locale } {
  return { language: locale, ...body };
}

export async function postJson<T>(path: string, body: object, fetchImpl: typeof fetch = fetch): Promise<T> {
  let res: Response;
  try {
    res = await fetchImpl(path, { method: "POST", headers: apiHeaders(), body: JSON.stringify(withLanguage(body)) });
  } catch {
    throw new ApiError("network", "Could not reach LearnPath's server. Check your connection.", 0);
  }
  if (!res.ok) {
    const err = await toApiError(res);
    if (err.code === "missing_key") openSettings(err.code);
    throw err;
  }
  return (await res.json()) as T;
}
