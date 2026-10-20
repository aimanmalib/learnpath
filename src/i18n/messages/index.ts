import type { Locale } from "../config";
import { en } from "./en";
import { ms } from "./ms";
import type { MessageKey, Messages } from "./types";

export type { MessageKey, Messages };

export const MESSAGES: Record<Locale, Messages> = { en, ms };

export type TranslateParams = Record<string, string | number>;

/** Look up a dotted key. Returns the key itself when it does not exist (never throws). */
export function lookup(messages: Messages, key: string): string | undefined {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (!node || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Replace {name} placeholders. Unknown placeholders are left as they are. */
export function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

export function translate(locale: Locale, key: MessageKey, params?: TranslateParams): string {
  const text = lookup(MESSAGES[locale], key) ?? lookup(MESSAGES.en, key) ?? key;
  return interpolate(text, params);
}

/** Flatten nested messages into dotted keys (used by tests and tooling). */
export function flattenMessages(node: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") out[key] = v;
      else Object.assign(out, flattenMessages(v, key));
    }
  }
  return out;
}
