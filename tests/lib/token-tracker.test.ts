import { describe, it, expect, beforeEach, vi } from "vitest";
import { TokenTracker, DAILY_ESTIMATES, TOTAL_DAILY_ESTIMATE } from "@/lib/token-tracker";

describe("TokenTracker", () => {
  let tracker: TokenTracker;

  beforeEach(() => {
    tracker = new TokenTracker();
  });

  it("initializes with zero usage", () => {
    const summary = tracker.getSummary();
    expect(summary.totalCalls).toBe(0);
    expect(summary.totalTokens).toBe(0);
  });

  it("records a usage entry", () => {
    tracker.record("quiz", 100, 50);
    const summary = tracker.getSummary();
    expect(summary.totalCalls).toBe(1);
    expect(summary.totalTokens).toBe(150);
  });

  it("aggregates by feature", () => {
    tracker.record("quiz", 100, 50);
    tracker.record("quiz", 200, 100);
    tracker.record("chat", 150, 75);
    const summary = tracker.getSummary();
    expect(summary.byFeature.quiz.calls).toBe(2);
    expect(summary.byFeature.quiz.tokens).toBe(450);
    expect(summary.byFeature.chat.calls).toBe(1);
  });

  it("resets all data", () => {
    tracker.record("quiz", 100, 50);
    tracker.reset();
    expect(tracker.getSummary().totalCalls).toBe(0);
  });

  it("provides daily estimate", () => {
    const summary = tracker.getSummary();
    expect(summary.dailyEstimate).toBeGreaterThan(0);
  });
});

describe("DAILY_ESTIMATES", () => {
  it("has entries for all features", () => {
    expect(DAILY_ESTIMATES.quiz).toBeDefined();
    expect(DAILY_ESTIMATES.chat).toBeDefined();
    expect(DAILY_ESTIMATES.flashcards).toBeDefined();
    expect(DAILY_ESTIMATES.roadmap).toBeDefined();
  });

  it("TOTAL_DAILY_ESTIMATE is sum of all", () => {
    const sum = Object.values(DAILY_ESTIMATES).reduce((a, b) => a + b, 0);
    expect(TOTAL_DAILY_ESTIMATE).toBeCloseTo(sum);
  });
});
