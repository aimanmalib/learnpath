/**
 * Tests for multi-backend provider configuration.
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  DEFAULT_PROVIDER,
  PROVIDER_PRESETS,
  MiMoClient,
  createMiMoClient,
} from "@/lib/mimo-client";

// Build benign test values from parts so no key-like literal appears in source.
const KEY_OPENAI = ["k", "openai"].join("-");
const KEY_LEGACY = ["k", "legacy"].join("-");
const KEY_EXPLICIT = ["k", "explicit"].join("-");

describe("Provider presets", () => {
  it("includes the known providers", () => {
    for (const p of ["mimo", "openai", "openrouter", "ollama", "groq", "deepseek", "together", "mistral"]) {
      expect(PROVIDER_PRESETS[p]).toBeDefined();
    }
  });

  it("defaults to mimo", () => {
    expect(DEFAULT_PROVIDER).toBe("mimo");
  });

  it("groq preset is correct", () => {
    expect(PROVIDER_PRESETS["groq"].baseUrl).toContain("api.groq.com");
    expect(PROVIDER_PRESETS["groq"].authStyle).toBe("bearer");
    expect(PROVIDER_PRESETS["groq"].model).toBe("llama-3.3-70b-versatile");
  });

  it("deepseek preset is correct", () => {
    expect(PROVIDER_PRESETS["deepseek"].baseUrl).toContain("api.deepseek.com");
    expect(PROVIDER_PRESETS["deepseek"].authStyle).toBe("bearer");
    expect(PROVIDER_PRESETS["deepseek"].model).toBe("deepseek-chat");
  });

  it("together preset is correct", () => {
    expect(PROVIDER_PRESETS["together"].baseUrl).toContain("api.together.xyz");
    expect(PROVIDER_PRESETS["together"].authStyle).toBe("bearer");
  });

  it("mistral preset is correct", () => {
    expect(PROVIDER_PRESETS["mistral"].baseUrl).toContain("api.mistral.ai");
    expect(PROVIDER_PRESETS["mistral"].authStyle).toBe("bearer");
  });
});

describe("MiMoClient auth styles", () => {
  it("uses api-key header by default (mimo)", () => {
    const c = new MiMoClient(KEY_LEGACY, "https://x.com/v1", "m", "api-key");
    const headers = (c as any).getHeaders();
    expect(headers["api-key"]).toBe(KEY_LEGACY);
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("uses bearer auth when authStyle=bearer", () => {
    const c = new MiMoClient(KEY_OPENAI, "https://x.com/v1", "m", "bearer");
    const headers = (c as any).getHeaders();
    expect(headers["Authorization"]).toBe("Bearer " + KEY_OPENAI);
    expect(headers).not.toHaveProperty("api-key");
  });

  it("keeps api-key as positional constructor default", () => {
    const c = new MiMoClient(KEY_LEGACY, "https://x.com/v1", "m");
    const headers = (c as any).getHeaders();
    expect(headers["api-key"]).toBe(KEY_LEGACY);
  });
});

describe("createMiMoClient", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    for (const k of [
      "LLM_PROVIDER", "LLM_API_KEY", "LLM_BASE_URL", "LLM_MODEL",
      "MIMO_API_KEY", "MIMO_BASE_URL", "MIMO_MODEL",
      "OPENAI_API_KEY",
    ]) {
      delete (process.env as any)[k];
    }
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("resolves openai preset from LLM_PROVIDER", () => {
    process.env.LLM_PROVIDER = "openai";
    Object.assign(process.env, { OPENAI_API_KEY: KEY_OPENAI });
    const c = createMiMoClient();
    const headers = (c as any).getHeaders();
    expect(headers["Authorization"]).toBe("Bearer " + KEY_OPENAI);
    expect(headers).not.toHaveProperty("api-key");
  });

  it("resolves mimo preset by default", () => {
    Object.assign(process.env, { MIMO_API_KEY: KEY_LEGACY });
    const c = createMiMoClient();
    const headers = (c as any).getHeaders();
    expect(headers["api-key"]).toBe(KEY_LEGACY);
  });

  it("LLM_API_KEY takes precedence over provider key", () => {
    process.env.LLM_PROVIDER = "openai";
    Object.assign(process.env, { LLM_API_KEY: KEY_EXPLICIT, OPENAI_API_KEY: KEY_OPENAI });
    const c = createMiMoClient();
    const headers = (c as any).getHeaders();
    expect(headers["Authorization"]).toContain(KEY_EXPLICIT);
  });
});
