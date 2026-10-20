import { describe, it, expect } from "vitest";
import { DEFAULT_PROVIDER_ID, PROVIDERS, getProvider } from "@/lib/llm/providers";

describe("provider presets", () => {
  it("contains every documented provider", () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(ids).toEqual([
      "openai",
      "openrouter",
      "groq",
      "deepseek",
      "together",
      "mistral",
      "mimo",
      "mimo-token-plan",
      "ollama",
      "llamacpp",
      "custom",
    ]);
  });

  it("has unique ids", () => {
    expect(new Set(PROVIDERS.map((p) => p.id)).size).toBe(PROVIDERS.length);
  });

  it("uses https for every public preset and no trailing slash", () => {
    for (const p of PROVIDERS.filter((p) => !p.selfHostOnly)) {
      expect(p.baseUrl.startsWith("https://"), p.id).toBe(true);
      expect(p.baseUrl.endsWith("/"), p.id).toBe(false);
      expect(p.keyRequired, p.id).toBe(true);
      expect(p.defaultModel, p.id).not.toBe("");
    }
  });

  it("uses Bearer auth everywhere except Xiaomi MiMo", () => {
    for (const p of PROVIDERS) {
      expect(p.authStyle, p.id).toBe(p.id.startsWith("mimo") ? "api-key" : "bearer");
    }
  });

  it("marks local and custom endpoints as self-host only", () => {
    expect(PROVIDERS.filter((p) => p.selfHostOnly).map((p) => p.id)).toEqual(["ollama", "llamacpp", "custom"]);
    expect(getProvider("ollama")?.baseUrl).toBe("http://localhost:11434/v1");
  });

  it("defaults to OpenAI and looks up by id", () => {
    expect(DEFAULT_PROVIDER_ID).toBe("openai");
    expect(getProvider("groq")?.baseUrl).toBe("https://api.groq.com/openai/v1");
    expect(getProvider("nope")).toBeUndefined();
    expect(getProvider(undefined)).toBeUndefined();
  });
});
