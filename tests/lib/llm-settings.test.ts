import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  SETTINGS_STORAGE_KEY,
  clearSettings,
  defaultSettings,
  loadSettings,
  saveSettings,
  settingsHeaders,
} from "@/lib/llm/settings";

const KEY = ["browser", "key"].join("-");

describe("browser settings", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("defaults to OpenAI with its default model and no key", () => {
    expect(loadSettings()).toEqual({ provider: "openai", model: "gpt-4o-mini", apiKey: "", baseUrl: "" });
  });

  it("saves, loads and forgets", () => {
    expect(saveSettings({ provider: "groq", model: "m", apiKey: KEY, baseUrl: "" })).toBe(true);
    expect(loadSettings()).toMatchObject({ provider: "groq", model: "m", apiKey: KEY });
    clearSettings();
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
    expect(loadSettings().apiKey).toBe("");
  });

  it("falls back to defaults on corrupt or unknown data", () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, "{not json");
    expect(loadSettings()).toEqual(defaultSettings());
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ provider: "evil", apiKey: KEY }));
    expect(loadSettings()).toEqual(defaultSettings());
  });

  it("survives storage that throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadSettings()).toEqual(defaultSettings());
    expect(saveSettings(defaultSettings())).toBe(false);
    expect(() => clearSettings()).not.toThrow();
  });

  it("builds request headers", () => {
    expect(settingsHeaders({ provider: "mistral", model: "m", apiKey: KEY, baseUrl: "https://x" })).toEqual({
      "x-llm-provider": "mistral",
      "x-llm-model": "m",
      "x-llm-key": KEY,
    });
    expect(settingsHeaders({ provider: "custom", model: "m", apiKey: "", baseUrl: "http://10.0.0.5/v1" })).toEqual({
      "x-llm-provider": "custom",
      "x-llm-model": "m",
      "x-llm-base-url": "http://10.0.0.5/v1",
    });
  });
});
