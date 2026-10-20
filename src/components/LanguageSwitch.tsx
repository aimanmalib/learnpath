"use client";
import { clsx } from "clsx";
import { LOCALES } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

/** BM | EN segmented switch. Each option names its language in that language. */
export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="group" aria-label={t("header.language")} className="flex rounded-lg border border-line bg-surface-2 p-0.5">
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={active}
            aria-label={t(l === "ms" ? "language.ms" : "language.en")}
            onClick={() => !active && setLocale(l)}
            className={clsx(
              "min-h-8 min-w-9 rounded-md px-2 text-xs font-bold tracking-wide transition-colors",
              active ? "bg-surface-raised text-ink shadow-card" : "text-ink-muted hover:text-ink",
            )}
          >
            {t(l === "ms" ? "language.msShort" : "language.enShort")}
          </button>
        );
      })}
    </div>
  );
}
