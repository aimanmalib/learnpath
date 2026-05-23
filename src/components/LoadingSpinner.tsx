"use client";
import { clsx } from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={clsx(
          "border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin",
          sizes[size],
        )}
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
