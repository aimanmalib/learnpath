"use client";
import { useId } from "react";
import { clsx } from "clsx";

interface SegmentedControlProps<T extends string | number> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Radio group styled as a segmented control. Arrow keys work natively. */
export function SegmentedControl<T extends string | number>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="label">{label}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-line bg-surface-2 p-1">
        {options.map((opt) => {
          const checked = opt.value === value;
          return (
            <label
              key={String(opt.value)}
              className={clsx(
                "relative flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-sm font-semibold transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-focus",
                checked ? "bg-surface-raised text-ink shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={name}
                value={String(opt.value)}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
