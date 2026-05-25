import { describe, it, expect } from "vitest";
import {
  createCardState,
  updateCardState,
  getDueCards,
  calculateRetention,
  getMasteryLevel,
} from "@/lib/spaced-repetition";

describe("createCardState", () => {
  it("creates initial state with default values", () => {
    const state = createCardState("card-1");
    expect(state.id).toBe("card-1");
    expect(state.easiness).toBe(2.5);
    expect(state.interval).toBe(0);
    expect(state.repetitions).toBe(0);
    expect(state.totalReviews).toBe(0);
  });

  it("sets nextReview to now", () => {
    const state = createCardState("card-1");
    const now = new Date();
    const review = new Date(state.nextReview);
    expect(Math.abs(now.getTime() - review.getTime())).toBeLessThan(2000);
  });
});

describe("updateCardState", () => {
  it("resets on quality < 3", () => {
    const state = createCardState("c1");
    state.repetitions = 5;
    state.interval = 30;
    const updated = updateCardState(state, 2);
    expect(updated.repetitions).toBe(0);
    expect(updated.interval).toBe(1);
  });

  it("advances on quality >= 3", () => {
    const state = createCardState("c1");
    const updated = updateCardState(state, 4);
    expect(updated.repetitions).toBe(1);
    expect(updated.interval).toBe(1);
  });

  it("sets interval to 6 on second success", () => {
    let state = createCardState("c1");
    state = updateCardState(state, 5);
    state = updateCardState(state, 5);
    expect(state.interval).toBe(6);
  });

  it("clamps easiness to >= 1.3", () => {
    let state = createCardState("c1");
    for (let i = 0; i < 20; i++) {
      state = updateCardState(state, 0);
    }
    expect(state.easiness).toBeGreaterThanOrEqual(1.3);
  });

  it("increments totalReviews", () => {
    const state = createCardState("c1");
    const updated = updateCardState(state, 3);
    expect(updated.totalReviews).toBe(1);
  });

  it("increments correctCount on success", () => {
    const state = createCardState("c1");
    const updated = updateCardState(state, 5);
    expect(updated.correctCount).toBe(1);
  });

  it("does not increment correctCount on failure", () => {
    const state = createCardState("c1");
    const updated = updateCardState(state, 1);
    expect(updated.correctCount).toBe(0);
  });
});

describe("getDueCards", () => {
  it("returns cards past their review date", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const card = { ...createCardState("c1"), nextReview: past };
    expect(getDueCards([card])).toHaveLength(1);
  });

  it("excludes future cards", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const card = { ...createCardState("c1"), nextReview: future };
    expect(getDueCards([card])).toHaveLength(0);
  });

  it("sorts by urgency", () => {
    const past1 = new Date(Date.now() - 200000).toISOString();
    const past2 = new Date(Date.now() - 100000).toISOString();
    const c1 = { ...createCardState("c1"), nextReview: past2 };
    const c2 = { ...createCardState("c2"), nextReview: past1 };
    const due = getDueCards([c1, c2]);
    expect(due[0].id).toBe("c2");
  });
});

describe("calculateRetention", () => {
  it("returns 0 for empty cards", () => {
    expect(calculateRetention([])).toBe(0);
  });

  it("calculates correct ratio", () => {
    const cards = [
      { ...createCardState("c1"), totalReviews: 10, correctCount: 8 },
      { ...createCardState("c2"), totalReviews: 10, correctCount: 6 },
    ];
    expect(calculateRetention(cards)).toBeCloseTo(0.7);
  });
});

describe("getMasteryLevel", () => {
  it("returns Mastered for high easiness", () => expect(getMasteryLevel(2.5)).toBe("Mastered"));
  it("returns Familiar for medium", () => expect(getMasteryLevel(2.0)).toBe("Familiar"));
  it("returns Learning for lower", () => expect(getMasteryLevel(1.7)).toBe("Learning"));
  it("returns Struggling for low", () => expect(getMasteryLevel(1.3)).toBe("Struggling"));
});
