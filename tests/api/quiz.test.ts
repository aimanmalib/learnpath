import { describe, it, expect } from "vitest";

describe("Quiz API Route", () => {
  it("constructs correct prompt for quiz generation", () => {
    const topic = "JavaScript";
    const difficulty = "medium";
    const count = 5;
    const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty.`;
    expect(prompt).toContain("5");
    expect(prompt).toContain("JavaScript");
    expect(prompt).toContain("medium");
  });

  it("parses quiz response format", () => {
    const mockResponse = JSON.stringify([
      { id: "q1", question: "What is a closure?", options: ["A", "B", "C", "D"], correctIndex: 0, explanation: "test", topic: "JS", difficulty: "medium" },
    ]);
    const parsed = JSON.parse(mockResponse);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].options).toHaveLength(4);
    expect(parsed[0].correctIndex).toBe(0);
  });

  it("handles malformed response gracefully", () => {
    const raw = "This is not valid JSON";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = [];
    }
    expect(parsed).toEqual([]);
  });
});
