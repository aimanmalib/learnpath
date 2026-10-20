/**
 * Locale settings shared by the server, the browser and the API routes.
 * Pure data and pure functions: safe to import anywhere.
 */
export const LOCALES = ["en", "ms"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** localStorage key that holds the visitor's chosen UI language. */
export const LOCALE_STORAGE_KEY = "learnpath.locale.v1";
/** Mirror of the choice, read by the server so the first paint is already in the right language. */
export const LOCALE_COOKIE = "learnpath-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pick a locale from a list of browser language tags (navigator.languages or
 * Accept-Language). Malay (`ms`, `ms-MY`, `zsm`) maps to BM; anything else is English.
 */
export function detectLocale(languages: readonly string[] | null | undefined): Locale {
  for (const tag of languages ?? []) {
    const base = tag.trim().toLowerCase().split(/[-_;]/)[0];
    if (base === "ms" || base === "zsm") return "ms";
    if (base === "en") return "en";
  }
  return DEFAULT_LOCALE;
}

/** Parse an Accept-Language header into tags ordered by q-value. */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag: tag.trim(), weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((x) => x.tag && x.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
    .map((x) => x.tag);
}

/** BCP 47 tag for Intl number/date formatting. */
export function intlLocale(locale: Locale): string {
  return locale === "ms" ? "ms-MY" : "en-MY";
}
