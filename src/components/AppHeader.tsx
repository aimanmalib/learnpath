"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { OPEN_SETTINGS_EVENT } from "@/lib/api-client";
import { getProvider } from "@/lib/llm/providers";
import { parseSettings, readRawSettings, subscribeSettings } from "@/lib/llm/settings";
import { SettingsDialog, type ServerInfo } from "./SettingsDialog";

/** `undefined` during server render and hydration: settings not read yet. */
const serverSnapshot = () => undefined;

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const raw = useSyncExternalStore(subscribeSettings, readRawSettings, serverSnapshot);
  const loaded = raw !== undefined;
  const settings = useMemo(() => parseSettings(raw), [raw]);

  useEffect(() => {
    fetch("/api/llm-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((info: ServerInfo | null) => info && setServerInfo(info))
      .catch(() => undefined);

    const onOpen = (e: Event) => {
      setReason((e as CustomEvent<{ reason?: string }>).detail?.reason);
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setReason(undefined);
  }, []);

  const preset = getProvider(settings.provider);
  const serverMode = serverInfo?.mode === "server";
  const ready = serverMode || !!settings.apiKey || (!!preset && !preset.keyRequired);
  const status = !loaded ? "" : serverMode ? "Server key" : ready ? preset?.label ?? "Ready" : "Add API key";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden="true">🎓</span> LearnPath
        </Link>
        <button
          type="button"
          onClick={() => {
            setReason(undefined);
            setOpen(true);
          }}
          className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${!loaded ? "bg-gray-300" : ready ? "bg-emerald-500" : "bg-amber-400"}`}
          />
          <span>Settings</span>
          {status && <span className="hidden truncate text-gray-400 sm:inline">· {status}</span>}
        </button>
      </div>
      {open && <SettingsDialog reason={reason} initial={settings} serverInfo={serverInfo} onClose={close} />}
    </header>
  );
}
