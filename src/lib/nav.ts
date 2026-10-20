import { ChartColumn, GalleryVerticalEnd, House, ListChecks, Network, Route, type LucideIcon } from "lucide-react";
import type { MessageKey } from "@/i18n/messages";

export interface NavItem {
  href: string;
  label: MessageKey;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar (space for five). */
  mobile: boolean;
}

/** One list for the desktop header, the mobile bar and the home page. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "nav.home", icon: House, mobile: true },
  { href: "/quiz", label: "nav.quiz", icon: ListChecks, mobile: true },
  { href: "/flashcards", label: "nav.flashcards", icon: GalleryVerticalEnd, mobile: true },
  { href: "/roadmap", label: "nav.roadmap", icon: Route, mobile: true },
  { href: "/progress", label: "nav.progress", icon: ChartColumn, mobile: true },
  { href: "/concepts", label: "nav.concepts", icon: Network, mobile: false },
];

export function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
