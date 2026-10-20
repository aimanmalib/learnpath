import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LOCALE_STORAGE_KEY, detectLocale, parseAcceptLanguage } from "@/i18n/config";
import { getClientLocale, resetLocaleMemory, setClientLocale } from "@/i18n/locale-store";

function setLanguages(langs: string[]) {
  vi.spyOn(navigator, "languages", "get").mockReturnValue(langs);
}

describe("detectLocale", () => {
  it("maps Malay tags to BM and everything else to English", () => {
    expect(detectLocale(["ms-MY", "en"])).toBe("ms");
    expect(detectLocale(["ms"])).toBe("ms");
    expect(detectLocale(["en-GB", "ms"])).toBe("en");
    expect(detectLocale(["zh-CN", "ms-MY"])).toBe("ms");
    expect(detectLocale(["id-ID"])).toBe("en");
    expect(detectLocale([])).toBe("en");
  });

  it("reads Accept-Language by q-value", () => {
    expect(parseAcceptLanguage("en;q=0.5, ms-MY;q=0.9, zh")).toEqual(["zh", "ms-MY", "en"]);
    expect(detectLocale(parseAcceptLanguage("en-US;q=0.4,ms;q=0.8"))).toBe("ms");
    expect(parseAcceptLanguage(null)).toEqual([]);
  });
});

describe("client locale store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetLocaleMemory();
    document.cookie = "learnpath-locale=; max-age=0; path=/";
  });
  afterEach(() => vi.restoreAllMocks());

  it("defaults to the browser language (ms → BM)", () => {
    setLanguages(["ms-MY", "en-US"]);
    expect(getClientLocale()).toBe("ms");
  });

  it("defaults to English for other browser languages", () => {
    setLanguages(["fr-FR"]);
    expect(getClientLocale()).toBe("en");
  });

  it("persists the choice in localStorage and mirrors it to a cookie", () => {
    setLanguages(["en-US"]);
    expect(setClientLocale("ms")).toBe(true);
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ms");
    expect(document.cookie).toContain("learnpath-locale=ms");
    resetLocaleMemory();
    expect(getClientLocale()).toBe("ms");
  });

  it("still switches when localStorage throws (private mode)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(setClientLocale("ms")).toBe(false);
    expect(getClientLocale()).toBe("ms");
  });

  it("ignores garbage in storage", () => {
    setLanguages(["en"]);
    localStorage.setItem(LOCALE_STORAGE_KEY, "klingon");
    expect(getClientLocale()).toBe("en");
  });
});
