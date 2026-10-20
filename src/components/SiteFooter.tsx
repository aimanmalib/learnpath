"use client";
import { useI18n } from "@/i18n/I18nProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const [builtBefore, builtAfter = ""] = t("footer.builtBy").split("{name}");
  return (
    <footer className="mx-auto mt-8 max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-sm text-ink-subtle sm:flex-row">
        <p>
          {builtBefore}
          <a href="https://sasateguh.com" className="font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline">
            Sasa Teguh
          </a>
          {builtAfter}
          {" · "}
          {t("footer.tagline")}
        </p>
        <a
          href="https://github.com/aimanmalib/learnpath"
          className="font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {t("footer.source")}
        </a>
      </div>
    </footer>
  );
}
