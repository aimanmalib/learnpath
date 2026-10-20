import { describe, it, expect, vi } from "vitest";
import { buildHeaders, chatCompletion, chatCompletionStream, clampMaxTokens, type LlmConfig } from "@/lib/llm/client";
import { LlmError, upstreamError } from "@/lib/llm/errors";

const KEY = ["test", "key", "123"].join("-");

const config: LlmConfig = {
  provider: "openai",
  baseUrl: "https://api.example.test/v1",
  apiKey: KEY,
  model: "m-1",
  authStyle: "bearer",
  maxTokensCap: 1000,
  source: "request",
};

function okJson(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("buildHeaders", () => {
  it("sends Authorization: Bearer for bearer providers", () => {
    const h = buildHeaders({ apiKey: KEY, authStyle: "bearer" });
    expect(h.Authorization).toBe(`Bearer ${KEY}`);
    expect(h).not.toHaveProperty("api-key");
  });

  it("sends api-key for MiMo-style providers", () => {
    const h = buildHeaders({ apiKey: KEY, authStyle: "api-key" });
    expect(h["api-key"]).toBe(KEY);
    expect(h).not.toHaveProperty("Authorization");
  });

  it("sends no auth header when there is no key", () => {
    const h = buildHeaders({ apiKey: "", authStyle: "bearer" });
    expect(h).toEqual({ "Content-Type": "application/json" });
  });
});

describe("clampMaxTokens", () => {
  it("never exceeds the cap", () => {
    expect(clampMaxTokens(5000, 1000)).toBe(1000);
    expect(clampMaxTokens(200, 1000)).toBe(200);
    expect(clampMaxTokens(undefined, 1000)).toBe(1000);
    expect(clampMaxTokens(-5, 1000)).toBe(1000);
  });
});

describe("chatCompletion", () => {
  it("posts to <baseUrl>/chat/completions with model and capped max_tokens", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      okJson({
        model: "m-1",
        choices: [{ message: { content: "hi", reasoning_content: "why" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 },
      }),
    );
    const result = await chatCompletion(config, [{ role: "user", content: "x" }], { maxTokens: 4096, fetchImpl });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.example.test/v1/chat/completions");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("m-1");
    expect(body.max_tokens).toBe(1000);
    expect(body.stream).toBe(false);
    expect(init.headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(result).toMatchObject({ content: "hi", reasoning_content: "why", total_tokens: 7, finish_reason: "stop" });
  });

  it("turns an upstream 401 into provider_rejected_key without echoing the body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: `Incorrect API key provided: ${KEY}` } }), { status: 401 }),
    );
    const err = await chatCompletion(config, [], { fetchImpl }).catch((e) => e);
    expect(err).toBeInstanceOf(LlmError);
    expect(err.code).toBe("provider_rejected_key");
    expect(err.status).toBe(401);
    expect(err.message).toBe("The provider rejected your key. Check the API key and provider in Settings.");
    expect(err.message).not.toContain(KEY);
  });

  it("reports network failures as provider_unreachable", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const err = await chatCompletion(config, [], { fetchImpl }).catch((e) => e);
    expect(err.code).toBe("provider_unreachable");
  });

  it("reports timeouts as provider_timeout", async () => {
    const timeout = new DOMException("timed out", "TimeoutError");
    const fetchImpl = vi.fn().mockRejectedValue(timeout);
    const err = await chatCompletion(config, [], { fetchImpl }).catch((e) => e);
    expect(err.code).toBe("provider_timeout");
    expect(err.status).toBe(504);
  });
});

describe("chatCompletionStream", () => {
  it("returns the upstream body and asks for stream: true", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("data: [DONE]\n\n", { status: 200 }));
    const stream = await chatCompletionStream(config, [{ role: "user", content: "x" }], { fetchImpl });
    expect(await new Response(stream).text()).toBe("data: [DONE]\n\n");
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).stream).toBe(true);
  });
});

describe("upstreamError", () => {
  it.each([
    [401, "provider_rejected_key", 401],
    [403, "provider_rejected_key", 401],
    [402, "provider_payment_required", 402],
    [429, "provider_rate_limited", 429],
    [404, "provider_model_not_found", 502],
    [400, "provider_bad_request", 502],
    [500, "provider_unavailable", 502],
    [503, "provider_unavailable", 502],
  ])("maps HTTP %i to %s", (status, code, ourStatus) => {
    const err = upstreamError(status, "m");
    expect(err.code).toBe(code);
    expect(err.status).toBe(ourStatus);
  });
});
