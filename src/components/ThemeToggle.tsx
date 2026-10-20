"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { getEffectiveTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

const serverTheme = (): Theme | null => null;

export function ThemeToggle() {
  const { t } = useI18n();
  const theme = useSyncExternalStore(subscribeTheme, getEffectiveTheme, serverTheme);
  const label = theme === "dark" ? t("header.themeToLight") : t("header.themeToDark");
  return (
    <button
      type="button"
      onClick={() => setTheme(getEffectiveTheme() === "dark" ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="btn btn-ghost btn-sm h-9 w-9 p-0"
    >
      {/* Icons switch with CSS so the first paint is already right. */}
      <Moon className="only-light h-[18px] w-[18px]" aria-hidden="true" />
      <Sun className="only-dark h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );
}
