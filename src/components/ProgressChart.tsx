"use client";

interface ProgressChartProps {
  data: { label: string; value: number; max?: number }[];
  title: string;
  /** Short note under the title, e.g. the unit. */
  caption?: string;
  /** Mark colour; defaults to the brand token. */
  color?: string;
}

/**
 * Single-series column chart. One hue, 4px rounded tops on a shared baseline,
 * a tooltip per column (hover or keyboard focus) and a visually hidden table
 * with the exact values for screen readers.
 */
export function ProgressChart({ data, title, caption, color = "var(--brand)" }: ProgressChartProps) {
  const maxVal = Math.max(...data.map((d) => d.max || d.value), 1);

  return (
    <figure className="card p-5">
      <figcaption>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {caption && <p className="mt-0.5 text-xs text-ink-subtle">{caption}</p>}
      </figcaption>
      <div className="mt-5 flex h-36 items-end gap-2 border-b border-line" aria-hidden="true">
        {data.map((item) => {
          const pct = (item.value / maxVal) * 100;
          return (
            <div key={item.label} className="group relative flex h-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-9 rounded-t-[4px] transition-[height] duration-500"
                style={{ height: item.value > 0 ? `max(${pct}%, 4px)` : "0", backgroundColor: color }}
              />
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-semibold text-canvas opacity-0 shadow-raised transition-opacity group-hover:opacity-100">
                {item.label}: {item.value}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {data.map((item) => (
          <span key={item.label} className="flex-1 text-center text-xs text-ink-subtle">
            {item.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
