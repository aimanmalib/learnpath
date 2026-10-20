import { describe, it, expect } from "vitest";
import { MESSAGES, flattenMessages, interpolate, translate } from "@/i18n/messages";
import { LOCALES } from "@/i18n/config";

const flat = Object.fromEntries(LOCALES.map((l) => [l, flattenMessages(MESSAGES[l])])) as Record<
  (typeof LOCALES)[number],
  Record<string, string>
>;

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("language files", () => {
  it("contain a meaningful number of keys", () => {
    expect(Object.keys(flat.en).length).toBeGreaterThan(100);
  });

  for (const locale of LOCALES) {
    for (const other of LOCALES) {
      if (locale === other) continue;
      it(`every ${locale} key exists in ${other}`, () => {
        const missing = Object.keys(flat[locale]).filter((k) => !(k in flat[other]));
        expect(missing).toEqual([]);
      });
    }

    it(`${locale} has no empty strings`, () => {
      const empty = Object.entries(flat[locale]).filter(([, v]) => !v.trim());
      expect(empty).toEqual([]);
    });
  }

  it("uses the same {placeholders} in both languages", () => {
    const mismatched = Object.keys(flat.en).filter(
      (k) => JSON.stringify(placeholders(flat.en[k])) !== JSON.stringify(placeholders(flat.ms[k] ?? "")),
    );
    expect(mismatched).toEqual([]);
  });

  it("BM text avoids common Indonesian words", () => {
    // Malaysian standard alternatives: hantar, muat turun, ketika/semasa, kerana, mesti/perlu,
    // wang, percuma, sila, berjaya, butang, tetapan, kata laluan, boleh, nombor, cuba.
    const indonesian = [
      "kirim", "unduh", "saat", "karena", "harus", "uang", "gratis", "silakan", "berhasil",
      "tombol", "pengaturan", "sandi", "bisa", "nomor", "coba", "mencoba", "kamu", "aplikasinya",
    ];
    const hits: string[] = [];
    for (const [key, text] of Object.entries(flat.ms)) {
      for (const word of indonesian) {
        if (new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, "iu").test(text)) hits.push(`${key}: ${word}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("BM strings are actually translated (not copied from English)", () => {
    // Brand names, abbreviations and pure numbers may be identical.
    const allowedSame = new Set(["common.appName", "language.en", "language.ms", "language.enShort", "language.msShort", "chat.model", "settings.model", "progress.studyTimeValue"]);
    const same = Object.keys(flat.en).filter((k) => flat.en[k] === flat.ms[k] && !allowedSame.has(k));
    expect(same).toEqual([]);
  });
});

describe("translate()", () => {
  it("returns the string for the locale and fills placeholders", () => {
    expect(translate("en", "quiz.questionOf", { current: 2, total: 5 })).toBe("Question 2 of 5");
    expect(translate("ms", "quiz.questionOf", { current: 2, total: 5 })).toBe("Soalan 2 daripada 5");
  });

  it("uses the agreed Malaysian terms", () => {
    expect(translate("ms", "nav.flashcards")).toBe("Kad imbas");
    expect(translate("ms", "nav.quiz")).toBe("Kuiz");
    expect(translate("ms", "home.roadmapTitle")).toBe("Peta laluan pembelajaran");
    expect(translate("ms", "header.settings")).toBe("Tetapan");
    expect(translate("ms", "settings.apiKey")).toBe("Kunci API");
  });

  it("falls back to the key for an unknown key instead of throwing", () => {
    expect(translate("ms", "nope.missing" as never)).toBe("nope.missing");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(interpolate("Hi {name} {other}", { name: "Aina" })).toBe("Hi Aina {other}");
  });
});
