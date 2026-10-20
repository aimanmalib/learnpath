"use client";
import { clsx } from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        aria-hidden="true"
        className={clsx("animate-spin rounded-full border-2 border-line border-t-brand", sizes[size])}
      />
      {label && <span className="text-sm text-ink-muted">{label}</span>}
    </div>
  );
}
