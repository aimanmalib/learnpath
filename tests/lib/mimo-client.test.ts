import { describe, it, expect, vi, beforeEach } from "vitest";
import { MiMoClient } from "@/lib/mimo-client";

describe("MiMoClient", () => {
  let client: MiMoClient;

  beforeEach(() => {
    client = new MiMoClient("test-key", "https://test.api.com/v1", "mimo-v2.5-pro");
  });

  it("initializes with provided params", () => {
    expect(client).toBeDefined();
  });

  it("uses api-key header, NOT Authorization Bearer", () => {
    const headers = (client as any).getHeaders();
    expect(headers["api-key"]).toBe("test-key");
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("strips trailing slash from baseUrl", () => {
    const c = new MiMoClient("k", "https://example.com/v1/");
    expect((c as any).baseUrl).toBe("https://example.com/v1");
  });

  it("chatCompletion returns parsed response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          model: "mimo-v2.5-pro",
          choices: [{ message: { content: "Hello", reasoning_content: "think" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await client.chatCompletion([{ role: "user", content: "Hi" }]);
    expect(result.content).toBe("Hello");
    expect(result.total_tokens).toBe(60);
    expect(mockFetch).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("chatCompletion throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: "Internal" }));
    await expect(
      client.chatCompletion([{ role: "user", content: "Hi" }]),
    ).rejects.toThrow("MiMo API error");
    vi.restoreAllMocks();
  });

  it("chatCompletion uses api-key in request", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: "x" } }], usage: {} }),
    });
    vi.stubGlobal("fetch", mockFetch);
    await client.chatCompletion([{ role: "user", content: "test" }]);
    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers["api-key"]).toBe("test-key");
    vi.restoreAllMocks();
  });
});

describe("createMiMoClient", () => {
  it("creates a client instance", async () => {
    const { createMiMoClient } = await import("@/lib/mimo-client");
    const c = createMiMoClient();
    expect(c).toBeInstanceOf(MiMoClient);
  });
});
