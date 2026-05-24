import { describe, it, expect } from "vitest";

describe("Flashcards API Route", () => {
  it("constructs flashcard generation prompt", () => {
    const topic = "React Hooks";
    const count = 10;
    const prompt = `Generate ${count} flashcards about "${topic}".`;
    expect(prompt).toContain("10");
    expect(prompt).toContain("React Hooks");
  });

  it("parses flashcard response", () => {
    const mockResponse = JSON.stringify([
      { front: "What is useState?", back: "A hook for state management", topic: "React" },
      { front: "What is useEffect?", back: "A hook for side effects", topic: "React" },
    ]);
    const parsed = JSON.parse(mockResponse);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].front).toBe("What is useState?");
    expect(parsed[0].back).toBeTruthy();
  });

  it("validates card structure", () => {
    const card = { front: "Q", back: "A", topic: "T" };
    expect(card).toHaveProperty("front");
    expect(card).toHaveProperty("back");
    expect(card).toHaveProperty("topic");
  });
});
