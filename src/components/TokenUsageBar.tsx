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
      <span className="text-xs text-gray-500 w-20 capitalize">{feature}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-16 text-right">
        {(current / 1000).toFixed(1)}K / {daily}M
      </span>
    </div>
  );
}
