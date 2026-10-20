"use client";
import { LoadingSpinner } from "./LoadingSpinner";

/** Loading state shown while the model writes: status text plus a skeleton of the result. */
export function GeneratingState({ label, hint, shape }: { label: string; hint: string; shape: "quiz" | "cards" | "roadmap" }) {
  return (
    <div className="mx-auto max-w-2xl" aria-busy="true">
      <div role="status" aria-live="polite" className="mb-6 flex items-center gap-3">
        <LoadingSpinner size="sm" />
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="text-xs text-ink-subtle">{hint}</p>
        </div>
      </div>
      <div aria-hidden="true" className="card p-6">
        {shape === "quiz" && (
          <>
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-5 h-5 w-4/5" />
            <div className="skeleton mt-2 h-5 w-3/5" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton mt-4 h-12 w-full rounded-xl" />
            ))}
          </>
        )}
        {shape === "cards" && (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton mt-6 h-3 w-32" />
          </div>
        )}
        {shape === "roadmap" &&
          [0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 pb-6 last:pb-0">
              <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1">
                <div className="skeleton h-4 w-2/5" />
                <div className="skeleton mt-2 h-3 w-full" />
                <div className="skeleton mt-1.5 h-3 w-4/5" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
