// @vitest-environment node
/**
 * WCAG AA contrast for the design tokens, computed from globals.css itself so
 * a colour change that breaks contrast fails CI.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(path.resolve(__dirname, "../../src/app/globals.css"), "utf8");

function tokens(selector: RegExp): Record<string, string> {
  const block = css.match(selector)?.[1] ?? "";
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2].toLowerCase()]));
}

const light = tokens(/:root\s*\{([^}]*)\}/);
const darkMedia = tokens(/:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/);
const darkToggle = tokens(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/);

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [text token, background token, minimum ratio]
const TEXT_PAIRS: [string, string, number][] = [
  ["ink", "canvas", 4.5], ["ink", "surface", 4.5], ["ink", "surface-2", 4.5], ["ink", "surface-raised", 4.5],
  ["ink-muted", "canvas", 4.5], ["ink-muted", "surface", 4.5], ["ink-muted", "surface-2", 4.5],
  ["ink-subtle", "canvas", 4.5], ["ink-subtle", "surface", 4.5], ["ink-subtle", "surface-2", 4.5],
  ["on-brand", "brand", 4.5], ["on-brand", "brand-hover", 4.5], ["on-brand", "success", 4.5],
  ["brand-ink", "brand-soft", 4.5], ["brand-ink", "surface", 4.5], ["brand-ink", "canvas", 4.5],
  ["accent-ink", "accent-soft", 4.5], ["success-ink", "success-soft", 4.5], ["success-ink", "surface", 4.5],
  ["danger-ink", "danger-soft", 4.5], ["danger-ink", "surface", 4.5], ["warning-ink", "warning-soft", 4.5],
  ["canvas", "ink", 4.5],
];
// Non-text UI (WCAG 1.4.11): input borders, focus ring.
const UI_PAIRS: [string, string, number][] = [
  ["line-strong", "surface", 3], ["focus", "surface", 3], ["focus", "canvas", 3], ["brand", "surface", 3],
];

describe("design tokens", () => {
  it("define the dark theme identically for the system setting and the toggle", () => {
    expect(Object.keys(darkMedia).length).toBeGreaterThan(20);
    expect(darkMedia).toEqual(darkToggle);
  });

  for (const [name, t] of [["light", light], ["dark", darkToggle]] as const) {
    for (const [fg, bg, min] of [...TEXT_PAIRS, ...UI_PAIRS]) {
      it(`${name}: ${fg} on ${bg} ≥ ${min}:1`, () => {
        expect(t[fg], fg).toBeDefined();
        expect(t[bg], bg).toBeDefined();
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
      });
    }
  }
});
