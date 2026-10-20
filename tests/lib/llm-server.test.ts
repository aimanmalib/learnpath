import { describe, it, expect } from "vitest";
import {
  DEFAULT_MAX_TOKENS_CAP,
  extractJson,
  isServerConfigured,
  publicLlmInfo,
  resolveLlmConfig,
} from "@/lib/llm/server";
import { LlmError } from "@/lib/llm/errors";

const ENV_KEY = ["env", "key"].join("-");
const HDR_KEY = ["header", "key"].join("-");

function headers(values: Record<string, string> = {}) {
  return new Headers(values);
}

function resolveError(h: Headers, env: Record<string, string | undefined>): LlmError {
  try {
    resolveLlmConfig(h, env);
  } catch (err) {
    if (err instanceof LlmError) return err;
    throw err;
  }
  throw new Error("expected resolveLlmConfig to throw");
}

describe("server (self-host) mode", () => {
  it("uses the env key and ignores request headers", () => {
    const cfg = resolveLlmConfig(
      headers({ "x-llm-provider": "groq", "x-llm-key": HDR_KEY, "x-llm-model": "other" }),
      { LLM_API_KEY: ENV_KEY, LLM_PROVIDER: "mistral" },
    );
    expect(cfg.source).toBe("env");
    expect(cfg.apiKey).toBe(ENV_KEY);
    expect(cfg.provider).toBe("mistral");
    expect(cfg.baseUrl).toBe("https://api.mistral.ai/v1");
    expect(cfg.model).toBe("mistral-small-latest");
  });

  it("defaults to OpenAI and honours LLM_MODEL / LLM_BASE_URL", () => {
    const cfg = resolveLlmConfig(headers(), {
      LLM_API_KEY: ENV_KEY,
      LLM_MODEL: "gpt-x",
      LLM_BASE_URL: "https://gateway.internal/v1/",
    });
    expect(cfg.provider).toBe("openai");
    expect(cfg.model).toBe("gpt-x");
    expect(cfg.baseUrl).toBe("https://gateway.internal/v1");
  });

  it("treats a keyless local provider as server mode", () => {
    expect(isServerConfigured({ LLM_PROVIDER: "ollama" })).toBe(true);
    const cfg = resolveLlmConfig(headers(), { LLM_PROVIDER: "ollama" });
    expect(cfg.baseUrl).toBe("http://localhost:11434/v1");
    expect(cfg.apiKey).toBe("");
  });

  it("is not server mode when only LLM_PROVIDER names a paid provider", () => {
    expect(isServerConfigured({ LLM_PROVIDER: "openai" })).toBe(false);
  });

  it("ignores legacy MIMO_API_KEY", () => {
    expect(isServerConfigured({ MIMO_API_KEY: ENV_KEY })).toBe(false);
  });

  it("rejects an unknown LLM_PROVIDER", () => {
    expect(resolveError(headers(), { LLM_API_KEY: ENV_KEY, LLM_PROVIDER: "bogus" }).code).toBe("server_misconfigured");
  });

  it("caps max tokens from LLM_MAX_TOKENS", () => {
    expect(resolveLlmConfig(headers(), { LLM_API_KEY: ENV_KEY }).maxTokensCap).toBe(DEFAULT_MAX_TOKENS_CAP);
    expect(resolveLlmConfig(headers(), { LLM_API_KEY: ENV_KEY, LLM_MAX_TOKENS: "512" }).maxTokensCap).toBe(512);
  });
});

describe("bring-your-own-key mode", () => {
  it("uses the header key, provider and model", () => {
    const cfg = resolveLlmConfig(
      headers({ "x-llm-provider": "groq", "x-llm-key": HDR_KEY, "x-llm-model": "llama-3.1-8b-instant" }),
      {},
    );
    expect(cfg).toMatchObject({
      source: "request",
      provider: "groq",
      apiKey: HDR_KEY,
      model: "llama-3.1-8b-instant",
      baseUrl: "https://api.groq.com/openai/v1",
      authStyle: "bearer",
    });
  });

  it("falls back to the preset's default model", () => {
    const cfg = resolveLlmConfig(headers({ "x-llm-provider": "mimo", "x-llm-key": HDR_KEY }), {});
    expect(cfg.model).toBe("mimo-v2.5-pro");
    expect(cfg.authStyle).toBe("api-key");
  });

  it("returns missing_key (400) when neither env nor header has a key", () => {
    const err = resolveError(headers(), {});
    expect(err.code).toBe("missing_key");
    expect(err.status).toBe(400);
    expect(err.message).toContain("Add your API key in Settings");
  });

  it("rejects unknown providers", () => {
    expect(resolveError(headers({ "x-llm-provider": "evil", "x-llm-key": HDR_KEY }), {}).code).toBe("invalid_provider");
  });

  it("rejects a custom base URL unless LLM_ALLOW_CUSTOM_BASE_URL=1", () => {
    const h = headers({ "x-llm-provider": "openai", "x-llm-key": HDR_KEY, "x-llm-base-url": "http://169.254.169.254/v1" });
    const err = resolveError(h, {});
    expect(err.code).toBe("custom_base_url_not_allowed");
    expect(err.status).toBe(400);
  });

  it("rejects self-host presets (localhost) unless allowed", () => {
    expect(resolveError(headers({ "x-llm-provider": "ollama" }), {}).code).toBe("provider_not_allowed");
    expect(resolveError(headers({ "x-llm-provider": "custom" }), {}).code).toBe("provider_not_allowed");
  });

  it("allows custom base URLs and local presets when the flag is set", () => {
    const env = { LLM_ALLOW_CUSTOM_BASE_URL: "1" };
    const local = resolveLlmConfig(headers({ "x-llm-provider": "ollama" }), env);
    expect(local.baseUrl).toBe("http://localhost:11434/v1");

    const custom = resolveLlmConfig(
      headers({ "x-llm-provider": "custom", "x-llm-base-url": "http://10.0.0.5:8000/v1/", "x-llm-model": "qwen" }),
      env,
    );
    expect(custom.baseUrl).toBe("http://10.0.0.5:8000/v1");
  });

  it("rejects non-http(s) base URLs even when custom URLs are allowed", () => {
    const env = { LLM_ALLOW_CUSTOM_BASE_URL: "1" };
    const err = resolveError(headers({ "x-llm-provider": "custom", "x-llm-base-url": "file:///etc/passwd" }), env);
    expect(err.code).toBe("invalid_base_url");
  });

  it("rejects model names with odd characters", () => {
    const h = headers({ "x-llm-provider": "openai", "x-llm-key": HDR_KEY, "x-llm-model": "gpt 4; drop" });
    expect(resolveError(h, {}).code).toBe("invalid_model");
  });
});

describe("publicLlmInfo", () => {
  it("never includes the key", () => {
    const info = publicLlmInfo({ LLM_API_KEY: ENV_KEY, LLM_PROVIDER: "deepseek" });
    expect(info.mode).toBe("server");
    expect(info.provider).toBe("deepseek");
    expect(JSON.stringify(info)).not.toContain(ENV_KEY);
  });

  it("reports byo-key mode without server credentials", () => {
    expect(publicLlmInfo({}).mode).toBe("byo-key");
  });
});

describe("extractJson", () => {
  it("finds JSON inside prose and code fences", () => {
    expect(extractJson('Here:\n```json\n[{"a":1}]\n```', "array")).toEqual([{ a: 1 }]);
    expect(extractJson('{"title":"x"} done', "object")).toEqual({ title: "x" });
    expect(extractJson("no json here", "array")).toBeUndefined();
  });
});
