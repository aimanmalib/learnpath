"use client";
import { useEffect, useId, useRef, useState } from "react";
import { PROVIDERS, getProvider } from "@/lib/llm/providers";
import { clearSettings, defaultSettings, saveSettings, type LlmSettings } from "@/lib/llm/settings";

export interface ServerInfo {
  mode: "server" | "byo-key";
  provider: string | null;
  providerLabel: string | null;
  model: string | null;
  allowCustomBaseUrl: boolean;
  maxTokensCap: number;
}

interface SettingsDialogProps {
  reason?: string;
  initial: LlmSettings;
  serverInfo: ServerInfo | null;
  onClose: () => void;
}

/** Rendered only while open, so the form starts from `initial` every time. */
export function SettingsDialog({ reason, initial, serverInfo, onClose }: SettingsDialogProps) {
  const [draft, setDraft] = useState<LlmSettings>(initial);
  const [showKey, setShowKey] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ids = useId();

  // Escape closes; lock page scroll on <html> while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previous;
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
      setNotice("This browser blocked local storage, so the settings could not be saved (private mode?).");
      return;
    }
    onClose();
  };

  const forget = () => {
    clearSettings();
    setDraft({ ...draft, apiKey: "" });
    setNotice("Your key has been removed from this browser.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        tabIndex={-1}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl outline-none sm:max-w-lg sm:rounded-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={`${ids}-title`} className="text-lg font-semibold">
              AI provider settings
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">Bring your own API key to use the AI features.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="-mr-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {reason && !serverMode && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{reason}</p>
        )}

        {serverMode ? (
          <div className="space-y-4">
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              This server has its own API key configured
              {serverInfo?.providerLabel ? ` (${serverInfo.providerLabel}${serverInfo.model ? `, ${serverInfo.model}` : ""})` : ""}.
              There is nothing to set up here.
            </p>
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div>
              <label htmlFor={`${ids}-provider`} className="mb-1 block text-sm font-medium text-gray-700">
                Provider
              </label>
              <select
                id={`${ids}-provider`}
                value={preset.id}
                onChange={(e) => changeProvider(e.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-base"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.selfHostOnly && !allowSelfHost}>
                    {p.label}
                  </option>
                ))}
              </select>
              {!allowSelfHost && (
                <p className="mt-1 text-xs text-gray-500">Self-hosted options need your own copy of LearnPath.</p>
              )}
            </div>

            {needsBaseUrl && (
              <div>
                <label htmlFor={`${ids}-base`} className="mb-1 block text-sm font-medium text-gray-700">
                  Base URL
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
                  className="w-full rounded-lg border px-3 py-2 text-base"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {preset.baseUrl ? `Leave empty to use ${preset.baseUrl}.` : "Any OpenAI-compatible endpoint, ending in /v1."}
                </p>
              </div>
            )}

            <div>
              <label htmlFor={`${ids}-model`} className="mb-1 block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                id={`${ids}-model`}
                type="text"
                value={draft.model}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                placeholder={preset.defaultModel || "model name"}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full rounded-lg border px-3 py-2 font-mono text-base"
              />
              {preset.defaultModel && (
                <p className="mt-1 text-xs text-gray-500">
                  Default for {preset.label}: <span className="font-mono">{preset.defaultModel}</span>
                  {draft.model.trim() !== preset.defaultModel && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        className="text-blue-600 underline"
                        onClick={() => setDraft({ ...draft, model: preset.defaultModel })}
                      >
                        use default
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${ids}-key`} className="mb-1 block text-sm font-medium text-gray-700">
                API key{!preset.keyRequired && <span className="font-normal text-gray-400"> (optional)</span>}
              </label>
              <div className="flex gap-2">
                <input
                  id={`${ids}-key`}
                  type={showKey ? "text" : "password"}
                  value={draft.apiKey}
                  onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                  placeholder="Paste your key"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 rounded-lg border px-3 py-2 font-mono text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="shrink-0 rounded-lg border px-3 text-sm text-gray-600 hover:bg-gray-50"
                  aria-pressed={showKey}
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
              {preset.keysUrl && (
                <p className="mt-1 text-xs text-gray-500">
                  <a href={preset.keysUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Get an API key from {preset.label}
                  </a>
                </p>
              )}
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600">
              <p className="mb-1 font-medium text-gray-700">Where your key goes</p>
              Your key is saved only in this browser. It is sent with each request through this app&apos;s API route to
              the provider you chose, and is never stored or logged on the server. Use a key with a spending limit, and
              press &ldquo;Forget key&rdquo; on a shared device.
            </div>

            {notice && (
              <p role="status" className="text-sm text-gray-700">
                {notice}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={forget}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Forget key
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Save
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
