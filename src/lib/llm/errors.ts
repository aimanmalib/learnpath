/**
 * Error codes shared by the API routes and the browser.
 *
 * Messages are written for the person using the app. They never include the
 * upstream response body, because some providers echo part of the API key
 * back in their error text.
 */

export type LlmErrorCode =
  | "missing_key"
  | "invalid_provider"
  | "provider_not_allowed"
  | "custom_base_url_not_allowed"
  | "invalid_base_url"
  | "invalid_model"
  | "invalid_key_format"
  | "invalid_request"
  | "server_misconfigured"
  | "provider_rejected_key"
  | "provider_payment_required"
  | "provider_rate_limited"
  | "provider_model_not_found"
  | "provider_bad_request"
  | "provider_unavailable"
  | "provider_unreachable"
  | "provider_timeout"
  | "unreadable_output"
  | "server_error";

export class LlmError extends Error {
  readonly code: LlmErrorCode;
  readonly status: number;

  constructor(code: LlmErrorCode, message: string, status: number) {
    super(message);
    this.name = "LlmError";
    this.code = code;
    this.status = status;
  }
}

/** Translate an upstream HTTP status into a friendly LlmError. */
export function upstreamError(status: number, model: string): LlmError {
  if (status === 401 || status === 403) {
    return new LlmError(
      "provider_rejected_key",
      "The provider rejected your key. Check the API key and provider in Settings.",
      401,
    );
  }
  if (status === 402) {
    return new LlmError(
      "provider_payment_required",
      "The provider says this account has no credit or billing set up.",
      402,
    );
  }
  if (status === 429) {
    return new LlmError(
      "provider_rate_limited",
      "The provider is rate limiting this key or its quota is used up. Wait a moment and try again.",
      429,
    );
  }
  if (status === 404) {
    return new LlmError(
      "provider_model_not_found",
      `The provider could not find the model "${model}". Check the model name in Settings.`,
      502,
    );
  }
  if (status >= 400 && status < 500) {
    return new LlmError(
      "provider_bad_request",
      `The provider refused the request (HTTP ${status}). The model name may be wrong for this provider.`,
      502,
    );
  }
  return new LlmError(
    "provider_unavailable",
    `The provider is having trouble right now (HTTP ${status}). Try again later.`,
    502,
  );
}
