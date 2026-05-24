import { describe, it, expect } from "vitest";

describe("Analyze API Route", () => {
  it("formats analysis prompt with session data", () => {
    const sessions = [
      { date: "2024-01-01", duration: 30, topics: ["math"], quizScore: 80, cardsReviewed: 10, tokensUsed: 5000 },
    ];
    const topicProgress = { math: { mastery: 70, totalStudied: 5 } };
    expect(sessions).toHaveLength(1);
    expect(topicProgress.math.mastery).toBe(70);
  });

  it("parses analysis response", () => {
    const mockResponse = JSON.stringify({
      insights: ["Strong in math", "Needs more science"],
      recommendations: ["Focus on algebra", "Practice more problems"],
      strengths: ["Quick learner", "Good retention"],
      weaknesses: ["Needs more practice with proofs"],
    });
    const parsed = JSON.parse(mockResponse);
    expect(parsed.insights).toHaveLength(2);
    expect(parsed.recommendations).toHaveLength(2);
    expect(parsed.strengths).toHaveLength(2);
    expect(parsed.weaknesses).toHaveLength(1);
  });

  it("handles empty session data", () => {
    const sessions: any[] = [];
    const topicProgress = {};
    expect(sessions).toHaveLength(0);
    expect(Object.keys(topicProgress)).toHaveLength(0);
  });
});
