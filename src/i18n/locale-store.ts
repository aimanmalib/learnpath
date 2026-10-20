/**
 * Browser-side UI language.
 *
 * Source of truth: localStorage (`learnpath.locale.v1`). A cookie mirrors the
 * choice so the server can render the first paint in the same language.
 * Every storage access is wrapped in try/catch: storage can be blocked
 * (private mode, site data disabled), and then the choice lives in memory for
 * this tab only.
 */
import { LOCALE_COOKIE, LOCALE_STORAGE_KEY, detectLocale, isLocale, type Locale } from "./config";

const CHANGED_EVENT = "learnpath:locale-changed";
const ONE_YEAR = 60 * 60 * 24 * 365;

let memoryLocale: Locale | null = null;

export function readStoredLocale(): Locale | null {
  try {
    const value = typeof window === "undefined" ? null : window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function readCookieLocale(): Locale | null {
  try {
    if (typeof document === "undefined") return null;
    const match = document.cookie.split("; ").find((c) => c.startsWith(`${LOCALE_COOKIE}=`));
    const value = match?.slice(LOCALE_COOKIE.length + 1);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

/** Write the cookie the server reads. Harmless when cookies are blocked. */
export function writeLocaleCookie(locale: Locale): void {
  try {
    if (typeof document === "undefined") return;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  } catch {
    // cookies blocked: the server falls back to Accept-Language
  }
}

/** The language the UI should show right now in this browser. */
export function getClientLocale(): Locale {
  if (memoryLocale) return memoryLocale;
  const stored = readStoredLocale();
  if (stored) return stored;
  const cookie = readCookieLocale();
  if (cookie) return cookie;
  if (typeof navigator === "undefined") return detectLocale([]);
  return detectLocale(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

/** Persist a choice. Returns false when localStorage refused it (the choice still applies to this tab). */
export function setClientLocale(locale: Locale): boolean {
  memoryLocale = locale;
  let saved = false;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    saved = true;
  } catch {
    saved = false;
  }
  writeLocaleCookie(locale);
  try {
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    // not in a browser
  }
  return saved;
}

export function subscribeLocale(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOCALE_STORAGE_KEY) {
      memoryLocale = null;
      onChange();
    }
  };
  window.addEventListener(CHANGED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Test helper: forget the in-memory choice. */
export function resetLocaleMemory(): void {
  memoryLocale = null;
}
