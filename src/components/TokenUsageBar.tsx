"use client";

interface TokenUsageBarProps {
  feature: string;
  current: number;
  daily: number; // in millions
}

export function TokenUsageBar({ feature, current, daily }: TokenUsageBarProps) {
  const percentage = Math.min((current / (daily * 1_000_000)) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs capitalize text-ink-muted">{feature}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-16 text-right text-xs text-ink-subtle">
        {(current / 1000).toFixed(1)}K / {daily}M
      </span>
    </div>
  );
}
