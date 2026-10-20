// @vitest-environment node
/**
 * Guard against UI text typed straight into components: JSX text nodes in
 * src/app and src/components must come from the language files.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../src");
// Proper nouns that are the same in every language.
const ALLOWED = new Set(["Sasa Teguh", "LearnPath"]);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return full.endsWith(".tsx") ? [full] : [];
  });
}

describe("components", () => {
  it("contain no hard-coded user-visible words in JSX text", () => {
    const offenders: string[] = [];
    for (const file of [...files(path.join(ROOT, "app")), ...files(path.join(ROOT, "components"))]) {
      const source = readFileSync(file, "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
      for (const match of source.matchAll(/>([^<>{}]*[A-Za-z]{2,}[^<>{}]*)</g)) {
        const text = match[1].trim();
        if (!text || ALLOWED.has(text) || /^[\s=&|?:()!.,'"\w]*=>/.test(text)) continue;
        // Skip TypeScript generics and comparisons that look like JSX text.
        if (/[;=]|&&|\|\|/.test(text)) continue;
        offenders.push(`${path.relative(ROOT, file)}: "${text}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
