import { describe, it, expect } from "vitest";
import { parseSSEBuffer, parseSSEData } from "@/lib/sse-parser";

describe("parseSSEBuffer", () => {
  it("parses single event", () => {
    const { events } = parseSSEBuffer("data: hello\n\n");
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe("hello");
  });

  it("parses multiple events", () => {
    const { events } = parseSSEBuffer("data: a\n\ndata: b\n\n");
    expect(events).toHaveLength(2);
    expect(events[0].data).toBe("a");
    expect(events[1].data).toBe("b");
  });

  it("returns remainder for incomplete data", () => {
    const { remainder } = parseSSEBuffer("data: partial");
    expect(remainder).toBe("data: partial");
  });

  it("handles event and id fields", () => {
    const { events } = parseSSEBuffer("event: msg\nid: 1\ndata: hello\n\n");
    expect(events[0].event).toBe("msg");
    expect(events[0].id).toBe("1");
  });

  it("handles empty buffer", () => {
    const { events, remainder } = parseSSEBuffer("");
    expect(events).toHaveLength(0);
  });
});

describe("parseSSEData", () => {
  it("parses valid chunk with content", () => {
    const chunk = parseSSEData(JSON.stringify({
      choices: [{ delta: { content: "Hello" }, finish_reason: null }],
    }));
    expect(chunk).not.toBeNull();
    expect(chunk!.content).toBe("Hello");
  });

  it("parses chunk with reasoning_content", () => {
    const chunk = parseSSEData(JSON.stringify({
      choices: [{ delta: { reasoning_content: "thinking..." } }],
    }));
    expect(chunk!.reasoningContent).toBe("thinking...");
  });

  it("returns null for [DONE]", () => {
    expect(parseSSEData("[DONE]")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseSSEData("not json")).toBeNull();
  });

  it("handles missing delta", () => {
    const chunk = parseSSEData(JSON.stringify({ choices: [{}] }));
    expect(chunk).not.toBeNull();
    expect(chunk!.content).toBe("");
  });
});
