"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, ExternalLink, Info, ShieldCheck, X } from "lucide-react";
import { PROVIDERS, getProvider } from "@/lib/llm/providers";
import { clearSettings, defaultSettings, saveSettings, type LlmSettings } from "@/lib/llm/settings";
import { useI18n } from "@/i18n/I18nProvider";
import { errorMessage } from "@/i18n/errors";

export interface ServerInfo {
  mode: "server" | "byo-key";
  provider: string | null;
  providerLabel: string | null;
  model: string | null;
  allowCustomBaseUrl: boolean;
  maxTokensCap: number;
}

interface SettingsDialogProps {
  /** Error code that made the app open this panel (e.g. "missing_key"). */
  reason?: string;
  initial: LlmSettings;
  serverInfo: ServerInfo | null;
  onClose: () => void;
}

/**
 * Rendered only while open, so the form starts from `initial` every time.
 * Portalled to <body> so no ancestor's stacking context or filter can trap it.
 */
export function SettingsDialog({ reason, initial, serverInfo, onClose }: SettingsDialogProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<LlmSettings>(initial);
  const [showKey, setShowKey] = useState(false);
  const [notice, setNotice] = useState<"storageBlocked" | "keyForgotten" | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ids = useId();

  // Escape closes, Tab stays inside the panel, page scroll is locked on <html>,
  // and focus returns to whatever opened the panel.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previous;
      opener?.focus?.();
    };
  }, [onClose]);

  const preset = getProvider(draft.provider) ?? PROVIDERS[0];
  const allowSelfHost = !!serverInfo?.allowCustomBaseUrl;
  const serverMode = serverInfo?.mode === "server";
  const needsBaseUrl = preset.selfHostOnly && allowSelfHost;

  const changeProvider = (id: string) => {
    const next = defaultSettings(id);
    setDraft({ ...next, apiKey: draft.apiKey, baseUrl: getProvider(id)?.selfHostOnly ? draft.baseUrl : "" });
  };

  const save = () => {
    const cleaned: LlmSettings = {
      provider: preset.id,
      model: draft.model.trim() || preset.defaultModel,
      apiKey: draft.apiKey.trim(),
      baseUrl: needsBaseUrl ? draft.baseUrl.trim() : "",
    };
    if (!saveSettings(cleaned)) {
      setNotice("storageBlocked");
      return;
    }
    onClose();
  };

  const forget = () => {
    clearSettings();
    setDraft({ ...draft, apiKey: "" });
    setNotice("keyForgotten");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        tabIndex={-1}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-ink shadow-raised outline-none sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={`${ids}-title`} className="font-display text-xl font-semibold">
              {t("settings.title")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{t("settings.subtitle")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("settings.closeLabel")} className="btn btn-ghost btn-sm -mr-1.5 h-9 w-9 p-0">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {reason && !serverMode && (
          <p className="mb-4 flex gap-2 rounded-xl border border-accent/30 bg-warning-soft px-3 py-2.5 text-sm text-warning-ink">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {errorMessage(t, reason)}
          </p>
        )}

        {serverMode ? (
          <div className="space-y-4">
            <p className="flex gap-2 rounded-xl border border-brand/30 bg-brand-soft px-3 py-2.5 text-sm text-brand-ink">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {t("settings.serverMode", {
                  detail: serverInfo?.providerLabel
                    ? ` (${serverInfo.providerLabel}${serverInfo.model ? `, ${serverInfo.model}` : ""})`
                    : "",
                })}
              </span>
            </p>
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="btn btn-primary">
                {t("common.done")}
              </button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div>
              <label htmlFor={`${ids}-provider`} className="label">
                {t("settings.provider")}
              </label>
              <select
                id={`${ids}-provider`}
                value={preset.id}
                onChange={(e) => changeProvider(e.target.value)}
                className="field"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.selfHostOnly && !allowSelfHost}>
                    {p.label}
                  </option>
                ))}
              </select>
              {!allowSelfHost && <p className="mt-1.5 text-xs text-ink-subtle">{t("settings.selfHostNote")}</p>}
            </div>

            {needsBaseUrl && (
              <div>
                <label htmlFor={`${ids}-base`} className="label">
                  {t("settings.baseUrl")}
                </label>
                <input
                  id={`${ids}-base`}
                  type="url"
                  inputMode="url"
                  value={draft.baseUrl}
                  onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
                  placeholder={preset.baseUrl || "https://your-server.example/v1"}
                  autoComplete="off"
                  spellCheck={false}
                  className="field"
                />
                <p className="mt-1.5 text-xs text-ink-subtle">
                  {preset.baseUrl ? t("settings.baseUrlDefault", { url: preset.baseUrl }) : t("settings.baseUrlAny")}
                </p>
              </div>
            )}

            <div>
              <label htmlFor={`${ids}-model`} className="label">
                {t("settings.model")}
              </label>
              <input
                id={`${ids}-model`}
                type="text"
                value={draft.model}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                placeholder={preset.defaultModel || t("settings.modelPlaceholder")}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="field font-mono"
              />
              {preset.defaultModel && (
                <p className="mt-1.5 text-xs text-ink-subtle">
                  {t("settings.modelDefault", { provider: preset.label })}{" "}
                  <span className="font-mono text-ink-muted">{preset.defaultModel}</span>
                  {draft.model.trim() !== preset.defaultModel && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        className="font-medium text-brand-ink underline underline-offset-2"
                        onClick={() => setDraft({ ...draft, model: preset.defaultModel })}
                      >
                        {t("settings.useDefault")}
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${ids}-key`} className="label">
                {t("settings.apiKey")}
                {!preset.keyRequired && <span className="font-normal text-ink-subtle"> {t("settings.optional")}</span>}
              </label>
              <div className="flex gap-2">
                <input
                  id={`${ids}-key`}
                  type={showKey ? "text" : "password"}
                  value={draft.apiKey}
                  onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                  placeholder={t("settings.keyPlaceholder")}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="field min-w-0 flex-1 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="btn btn-secondary shrink-0 px-3"
                  aria-pressed={showKey}
                >
                  {showKey ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  <span>{showKey ? t("settings.hide") : t("settings.show")}</span>
                </button>
              </div>
              {preset.keysUrl && (
                <p className="mt-1.5 text-xs">
                  <a
                    href={preset.keysUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-brand-ink underline underline-offset-2"
                  >
                    {t("settings.getKey", { provider: preset.label })}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </p>
              )}
            </div>

            <div className="rounded-xl bg-surface-2 px-4 py-3 text-xs leading-relaxed text-ink-muted">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                {t("settings.privacyTitle")}
              </p>
              {t("settings.privacyBody")}
            </div>

            {notice && (
              <p role="status" className="text-sm text-ink">
                {t(`settings.${notice}`)}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button type="button" onClick={forget} className="btn btn-ghost btn-sm text-danger-ink hover:bg-danger-soft hover:text-danger-ink">
                {t("settings.forget")}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t("common.save")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
