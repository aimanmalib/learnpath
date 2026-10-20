import type { MessageKey, TranslateParams } from "./messages";
import { en } from "./messages/en";

type T = (key: MessageKey, params?: TranslateParams) => string;

/** Localised message for an API error code; unknown codes get the generic message. */
export function errorMessage(t: T, code: string | undefined): string {
  if (code && code !== "title" && code !== "openSettings" && Object.prototype.hasOwnProperty.call(en.errors, code)) {
    return t(`errors.${code}` as MessageKey);
  }
  return t("errors.unknown");
}
