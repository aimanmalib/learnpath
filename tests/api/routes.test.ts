// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as quiz } from "@/app/api/quiz/route";
import { POST as flashcards } from "@/app/api/flashcards/route";
import { POST as roadmap } from "@/app/api/roadmap/route";
import { POST as chat } from "@/app/api/chat/route";
import { POST as analyze } from "@/app/api/analyze/route";
import { GET as llmConfig } from "@/app/api/llm-config/route";

const ENV_KEY = ["env", "secret"].join("-");
const HDR_KEY = ["visitor", "secret"].join("-");

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/x", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function completion(content: string) {
  return new Response(
    JSON.stringify({ model: "m", choices: [{ message: { content }, finish_reason: "stop" }], usage: { total_tokens: 42 } }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

const quizJson = JSON.stringify([
  { id: "q1", question: "2+2?", options: ["3", "4", "5", "6"], correctIndex: 1, explanation: "math" },
]);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(completion(quizJson));
  vi.stubGlobal("fetch", fetchMock);
  for (const k of ["LLM_API_KEY", "LLM_PROVIDER", "LLM_MODEL", "LLM_BASE_URL", "LLM_ALLOW_CUSTOM_BASE_URL", "LLM_MAX_TOKENS"]) {
    vi.stubEnv(k, "");
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("key resolution in routes", () => {
  it("returns 400 missing_key when neither env nor header has a key", async () => {
    const res = await quiz(req({ topic: "math" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ code: "missing_key", error: "Add your API key in Settings to use this feature." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the visitor's header key with the chosen provider", async () => {
    const res = await quiz(req({ topic: "math" }, { "x-llm-provider": "deepseek", "x-llm-key": HDR_KEY }));
    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.deepseek.com/v1/chat/completions");
    expect(init.headers.Authorization).toBe(`Bearer ${HDR_KEY}`);
    expect(JSON.parse(init.body).model).toBe("deepseek-chat");
  });

  it("uses the api-key header for Xiaomi MiMo", async () => {
    await quiz(req({ topic: "math" }, { "x-llm-provider": "mimo", "x-llm-key": HDR_KEY }));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.xiaomimimo.com/v1/chat/completions");
    expect(init.headers["api-key"]).toBe(HDR_KEY);
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("prefers the server env key over a header key", async () => {
    vi.stubEnv("LLM_API_KEY", ENV_KEY);
    vi.stubEnv("LLM_PROVIDER", "openrouter");
    await quiz(req({ topic: "math" }, { "x-llm-provider": "groq", "x-llm-key": HDR_KEY }));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(init.headers.Authorization).toBe(`Bearer ${ENV_KEY}`);
  });

  it("refuses to forward to a custom base URL without the opt-in flag", async () => {
    const res = await chat(
      req({ message: "hi" }, { "x-llm-key": HDR_KEY, "x-llm-base-url": "http://169.254.169.254/latest" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("custom_base_url_not_allowed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses local presets without the opt-in flag", async () => {
    const res = await chat(req({ message: "hi" }, { "x-llm-provider": "ollama" }));
    expect((await res.json()).code).toBe("provider_not_allowed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards to a custom base URL when LLM_ALLOW_CUSTOM_BASE_URL=1", async () => {
    vi.stubEnv("LLM_ALLOW_CUSTOM_BASE_URL", "1");
    await quiz(req({ topic: "math" }, { "x-llm-provider": "custom", "x-llm-base-url": "http://10.1.2.3:8000/v1", "x-llm-model": "qwen" }));
    expect(fetchMock.mock.calls[0][0]).toBe("http://10.1.2.3:8000/v1/chat/completions");
  });

  it("caps max_tokens server-side", async () => {
    vi.stubEnv("LLM_MAX_TOKENS", "300");
    await quiz(req({ topic: "math" }, { "x-llm-key": HDR_KEY }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).max_tokens).toBe(300);
  });

  it("turns an upstream 401 into a friendly message without leaking the key", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: `Incorrect API key provided: ${HDR_KEY}` } }), { status: 401 }),
    );
    const res = await quiz(req({ topic: "math" }, { "x-llm-key": HDR_KEY }));
    expect(res.status).toBe(401);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({
      code: "provider_rejected_key",
      error: "The provider rejected your key. Check the API key and provider in Settings.",
    });
    expect(text).not.toContain(HDR_KEY);
  });

  it("returns 400 for a non-JSON body", async () => {
    const bad = new Request("http://localhost/api/quiz", { method: "POST", body: "nope" });
    const res = await quiz(bad);
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid_request");
  });
});

describe("route output", () => {
  const h = { "x-llm-key": HDR_KEY };

  it("quiz returns validated questions", async () => {
    const res = await quiz(req({ topic: "math", count: 50, difficulty: "hard" }, h));
    const data = await res.json();
    expect(data.questions).toHaveLength(1);
    expect(data.questions[0]).toMatchObject({ correctIndex: 1, topic: "math", difficulty: "hard" });
    expect(data.tokens_used).toBe(42);
    // count is clamped to 10 in the prompt
    expect(fetchMock.mock.calls[0][1].body).toContain("Create 10 multiple-choice questions");
  });

  it("quiz reports unreadable model output as 502", async () => {
    fetchMock.mockResolvedValue(completion("Sorry, I cannot help with that."));
    const res = await quiz(req({ topic: "math" }, h));
    expect(res.status).toBe(502);
    expect((await res.json()).code).toBe("unreadable_output");
  });

  it("flashcards returns cards", async () => {
    fetchMock.mockResolvedValue(completion('[{"front":"Q","back":"A"}]'));
    const data = await (await flashcards(req({ topic: "bio" }, h))).json();
    expect(data.cards).toEqual([{ id: "fc1", front: "Q", back: "A", topic: "bio" }]);
  });

  it("roadmap returns steps", async () => {
    fetchMock.mockResolvedValue(completion('{"title":"Plan","steps":[{"title":"Start","description":"d"}]}'));
    const data = await (await roadmap(req({ topic: "go", level: "advanced" }, h))).json();
    expect(data.roadmap.title).toBe("Plan");
    expect(data.roadmap.steps[0]).toMatchObject({ id: "s1", title: "Start", status: "upcoming" });
  });

  it("chat returns content, and streams when asked", async () => {
    fetchMock.mockResolvedValue(completion("hello"));
    expect((await (await chat(req({ message: "hi" }, h))).json()).content).toBe("hello");

    fetchMock.mockResolvedValue(new Response('data: {"choices":[{"delta":{"content":"x"}}]}\n\ndata: [DONE]\n\n'));
    const streamed = await chat(req({ message: "hi", stream: true }, h));
    expect(streamed.headers.get("content-type")).toBe("text/event-stream");
    expect(await streamed.text()).toContain("[DONE]");
  });

  it("analyze returns the analysis text", async () => {
    fetchMock.mockResolvedValue(completion("You are doing well."));
    const data = await (await analyze(req({ topic: "math", sessions: [] }, h))).json();
    expect(data.analysis).toBe("You are doing well.");
  });
});

describe("GET /api/llm-config", () => {
  it("reports byo-key mode and never exposes the env key", async () => {
    expect((await llmConfig().json()).mode).toBe("byo-key");
    vi.stubEnv("LLM_API_KEY", ENV_KEY);
    const text = await llmConfig().text();
    expect(JSON.parse(text).mode).toBe("server");
    expect(text).not.toContain(ENV_KEY);
  });
});
