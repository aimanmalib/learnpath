import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { postJson, withLanguage } from "@/lib/api-client";
import { resetLocaleMemory, setClientLocale } from "@/i18n/locale-store";

function okFetch() {
  return vi.fn().mockImplementation(async () => new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }));
}

describe("API client language", () => {
  beforeEach(() => {
    localStorage.clear();
    resetLocaleMemory();
  });
  afterEach(() => vi.restoreAllMocks());

  it("sends the selected UI language with every request", async () => {
    setClientLocale("ms");
    const fetchImpl = okFetch();
    await postJson("/api/quiz", { topic: "Fotosintesis" }, fetchImpl);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ topic: "Fotosintesis", language: "ms" });

    setClientLocale("en");
    await postJson("/api/roadmap", { topic: "Photosynthesis" }, fetchImpl);
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).language).toBe("en");
  });

  it("lets an explicit language in the body win", () => {
    expect(withLanguage({ language: "en" }, "ms")).toEqual({ language: "en" });
  });
});
