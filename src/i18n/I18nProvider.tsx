"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { intlLocale, type Locale } from "./config";
import { translate, type MessageKey, type TranslateParams } from "./messages";
import { getClientLocale, setClientLocale, subscribeLocale, writeLocaleCookie } from "./locale-store";

export interface I18nValue {
  locale: Locale;
  /** BCP 47 tag for Intl formatting. */
  intl: string;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: TranslateParams) => string;
}

function makeValue(locale: Locale, setLocale: (l: Locale) => void): I18nValue {
  return {
    locale,
    intl: intlLocale(locale),
    setLocale,
    t: (key, params) => translate(locale, key, params),
  };
}

// Without a provider (unit tests, isolated components) everything renders in English.
const I18nContext = createContext<I18nValue>(makeValue("en", () => undefined));

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  // Server render and hydration use the locale the server picked; afterwards the browser's choice wins.
  const locale = useSyncExternalStore(subscribeLocale, getClientLocale, () => initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    writeLocaleCookie(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setClientLocale(next);
      // Re-render server parts (page title, <html lang>) with the new cookie.
      router.refresh();
    },
    [router],
  );

  const value = useMemo(() => makeValue(locale, setLocale), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
