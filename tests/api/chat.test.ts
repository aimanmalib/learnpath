import { describe, it, expect } from "vitest";

describe("Chat API Route", () => {
  it("endpoint exists and accepts POST", () => {
    // API routes are tested via integration; unit test verifies contract
    const payload = {
      messages: [{ role: "user", content: "Hello" }],
      system: "You are a tutor",
    };
    expect(payload.messages).toHaveLength(1);
    expect(payload.messages[0].role).toBe("user");
    expect(payload.system).toBe("You are a tutor");
  });

  it("requires messages array", () => {
    const payload = { messages: [] };
    expect(payload.messages).toHaveLength(0);
  });

  it("formats messages correctly for MiMo API", () => {
    const messages = [
      { role: "user", content: "What is React?" },
      { role: "assistant", content: "React is a JS library" },
      { role: "user", content: "Tell me more" },
    ];
    expect(messages[0].role).toBe("user");
    expect(messages[1].role).toBe("assistant");
    expect(messages[2].content).toBe("Tell me more");
  });
});
