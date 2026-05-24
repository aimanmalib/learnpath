"use client";

interface ProgressChartProps {
  data: { label: string; value: number; max?: number }[];
  title: string;
  color?: string;
}

export function ProgressChart({ data, title, color = "#3b82f6" }: ProgressChartProps) {
  const maxVal = Math.max(...data.map((d) => d.max || d.value), 1);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12 shrink-0">{item.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxVal) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="text-xs font-medium w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
