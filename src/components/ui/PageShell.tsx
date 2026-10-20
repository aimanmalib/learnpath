import { clsx } from "clsx";

/** Page container. `id="main"` is the skip-link target. */
export function PageShell({ children, width = "default" }: { children: React.ReactNode; width?: "default" | "narrow" | "wide" }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className={clsx(
        "mx-auto w-full px-4 pt-8 outline-none sm:px-6 sm:pt-12",
        width === "narrow" && "max-w-2xl",
        width === "default" && "max-w-4xl",
        width === "wide" && "max-w-6xl",
      )}
    >
      {children}
    </main>
  );
}
