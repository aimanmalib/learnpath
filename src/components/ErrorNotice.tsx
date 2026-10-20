"use client";
import { CircleAlert, KeyRound } from "lucide-react";
import { ApiError, openSettings } from "@/lib/api-client";
import { useI18n } from "@/i18n/I18nProvider";
import { errorMessage } from "@/i18n/errors";

export function ErrorNotice({ error, onRetry }: { error: ApiError | null; onRetry?: () => void }) {
  const { t } = useI18n();
  if (!error) return null;
  return (
    <div role="alert" className="mt-4 flex gap-3 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger-ink">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold">{t("errors.title")}</p>
        <p className="mt-0.5 leading-relaxed">{errorMessage(t, error.code)}</p>
        {(error.fixableInSettings || onRetry) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {error.fixableInSettings && (
              <button type="button" onClick={() => openSettings()} className="btn btn-secondary btn-sm">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {t("errors.openSettings")}
              </button>
            )}
            {onRetry && !error.fixableInSettings && (
              <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm">
                {t("common.tryAgain")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
