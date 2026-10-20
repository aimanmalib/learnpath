"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { NAV_ITEMS, isActive } from "@/lib/nav";
import { useI18n } from "@/i18n/I18nProvider";

/** Bottom tab bar on small screens. */
export function MobileNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  return (
    <nav
      aria-label={t("nav.label")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.filter((item) => item.mobile).map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold leading-tight",
                  active ? "text-brand-ink" : "text-ink-muted",
                )}
              >
                <span
                  className={clsx(
                    "flex h-7 w-12 items-center justify-center rounded-full",
                    active && "bg-brand-soft",
                  )}
                >
                  <Icon className="h-[19px] w-[19px]" aria-hidden="true" strokeWidth={active ? 2.25 : 1.9} />
                </span>
                <span className="max-w-full truncate">{t(item.label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
