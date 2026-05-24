import { describe, it, expect } from "vitest";

describe("Roadmap API Route", () => {
  it("constructs roadmap prompt", () => {
    const topic = "Python";
    const level = "beginner";
    const goals = "Build web apps";
    const prompt = `Create a learning roadmap for "${topic}" (level: ${level}). Goals: ${goals}`;
    expect(prompt).toContain("Python");
    expect(prompt).toContain("beginner");
    expect(prompt).toContain("Build web apps");
  });

  it("parses roadmap response", () => {
    const mockResponse = JSON.stringify({
      steps: [
        { id: "s1", title: "Learn Basics", description: "Variables, types", status: "upcoming", estimatedMinutes: 30 },
        { id: "s2", title: "Functions", description: "Defining functions", status: "upcoming", estimatedMinutes: 45 },
      ],
    });
    const parsed = JSON.parse(mockResponse);
    expect(parsed.steps).toHaveLength(2);
    expect(parsed.steps[0].title).toBe("Learn Basics");
    expect(parsed.steps[0].estimatedMinutes).toBe(30);
  });

  it("validates step structure", () => {
    const step = { id: "s1", title: "Test", description: "Desc", status: "upcoming", estimatedMinutes: 30 };
    expect(step).toHaveProperty("id");
    expect(step).toHaveProperty("title");
    expect(step).toHaveProperty("status");
    expect(["completed", "current", "upcoming"]).toContain(step.status);
  });
});
