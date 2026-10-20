"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { clsx } from "clsx";
import { KeyRound } from "lucide-react";
import { OPEN_SETTINGS_EVENT } from "@/lib/api-client";
import { getProvider } from "@/lib/llm/providers";
import { parseSettings, readRawSettings, subscribeSettings } from "@/lib/llm/settings";
import { NAV_ITEMS, isActive } from "@/lib/nav";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { LogoMark } from "./Logo";
import { SettingsDialog, type ServerInfo } from "./SettingsDialog";
import { ThemeToggle } from "./ThemeToggle";

/** `undefined` during server render and hydration: settings not read yet. */
const serverSnapshot = () => undefined;

export function AppHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
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
  const status = !loaded
    ? ""
    : serverMode
      ? t("header.statusServer")
      : ready
        ? (preset?.label ?? t("header.statusReady"))
        : t("header.statusNeedsKey");

  // No backdrop-filter on the header: it would become the containing block of the fixed settings dialog.
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
      >
        {t("common.skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label={t("header.homeLink")} className="flex shrink-0 items-center gap-2.5 rounded-lg">
          <LogoMark />
          <span className="font-display text-[1.25rem] font-semibold tracking-tight">{t("common.appName")}</span>
        </Link>

        <nav aria-label={t("nav.label")} className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-soft text-brand-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitch />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              setReason(undefined);
              setOpen(true);
            }}
            aria-label={`${t("header.settings")}${status ? ` (${status})` : ""}`}
            className="btn btn-secondary btn-sm relative h-9 min-w-9 px-2.5 sm:px-3"
          >
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t("header.settings")}</span>
            {status && <span className="hidden max-w-[10rem] truncate font-normal text-ink-muted lg:inline">· {status}</span>}
            <span
              aria-hidden="true"
              className={clsx(
                "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-canvas",
                !loaded ? "bg-line-strong" : ready ? "bg-success" : "bg-accent",
              )}
            />
          </button>
        </div>
      </div>
      {open && <SettingsDialog reason={reason} initial={settings} serverInfo={serverInfo} onClose={close} />}
    </header>
  );
}
