import { describe, it, expect, beforeEach } from "vitest";
import { useFlashcardStore } from "@/store/flashcard-store";

describe("useFlashcardStore", () => {
  beforeEach(() => {
    useFlashcardStore.setState({ cards: [], cardStates: {}, currentIndex: 0, isFlipped: false, topic: "" });
  });

  it("initializes empty", () => {
    expect(useFlashcardStore.getState().cards).toHaveLength(0);
  });

  it("setCards populates cards", () => {
    useFlashcardStore.getState().setCards([
      { id: "fc1", front: "Q1", back: "A1", topic: "t" },
      { id: "fc2", front: "Q2", back: "A2", topic: "t" },
    ], "test");
    expect(useFlashcardStore.getState().cards).toHaveLength(2);
    expect(useFlashcardStore.getState().topic).toBe("test");
  });

  it("flip toggles isFlipped", () => {
    expect(useFlashcardStore.getState().isFlipped).toBe(false);
    useFlashcardStore.getState().flip();
    expect(useFlashcardStore.getState().isFlipped).toBe(true);
  });

  it("next advances index", () => {
    useFlashcardStore.getState().setCards([
      { id: "fc1", front: "Q1", back: "A1", topic: "t" },
      { id: "fc2", front: "Q2", back: "A2", topic: "t" },
    ], "t");
    useFlashcardStore.getState().next();
    expect(useFlashcardStore.getState().currentIndex).toBe(1);
  });

  it("getProgress returns correct counts", () => {
    useFlashcardStore.getState().setCards([
      { id: "fc1", front: "Q1", back: "A1", topic: "t" },
      { id: "fc2", front: "Q2", back: "A2", topic: "t" },
      { id: "fc3", front: "Q3", back: "A3", topic: "t" },
    ], "t");
    const progress = useFlashcardStore.getState().getProgress();
    expect(progress.total).toBe(3);
    expect(progress.reviewed).toBe(0);
    expect(progress.remaining).toBe(3);
  });

  it("rate updates card state", () => {
    useFlashcardStore.getState().setCards([
      { id: "fc1", front: "Q1", back: "A1", topic: "t" },
    ], "t");
    useFlashcardStore.getState().rate(5);
    const state = useFlashcardStore.getState().cardStates["fc1"];
    expect(state.totalReviews).toBe(1);
  });
});
