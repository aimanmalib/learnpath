/**
 * Light/dark theme.
 *
 * With nothing stored the page follows `prefers-color-scheme` (pure CSS).
 * A stored choice sets `data-theme` on <html>; the inline script below applies
 * it before first paint so there is no flash. Choosing the theme the system
 * already prefers clears the stored value, so the page follows the system again.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "learnpath.theme.v1";
const CHANGED_EVENT = "learnpath:theme-changed";

/** Runs in <head> before the body renders. Kept tiny and dependency-free. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

function systemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** The theme currently on screen. */
export function getEffectiveTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" || attr === "light" ? attr : systemTheme();
}

/**
 * Apply a colour change in one frame: without this, elements with a colour
 * transition (buttons, tabs) fade on their own schedule and the page is
 * briefly half light, half dark.
 */
function withoutTransitions(apply: () => void): void {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  apply();
  void window.getComputedStyle(document.body).backgroundColor; // flush styles while transitions are off
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => style.remove()));
}

export function setTheme(theme: Theme): void {
  withoutTransitions(() => applyTheme(theme));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const followSystem = theme === systemTheme();
  try {
    if (followSystem) window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // storage blocked: the choice still applies to this page
  }
  if (followSystem) root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function subscribeTheme(onChange: () => void): () => void {
  window.addEventListener(CHANGED_EVENT, onChange);
  let media: MediaQueryList | null = null;
  try {
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", onChange);
  } catch {
    media = null;
  }
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    media?.removeEventListener("change", onChange);
  };
}
