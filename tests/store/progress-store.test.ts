import { describe, it, expect, beforeEach } from "vitest";
import { useProgressStore } from "@/store/progress-store";

const mockSession = {
  id: "s1",
  feature: "quiz" as const,
  topic: "Math",
  score: 80,
  duration: 120000,
  timestamp: new Date().toISOString(),
  tokensUsed: 5000,
};

describe("useProgressStore", () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it("initializes empty", () => {
    expect(useProgressStore.getState().sessions).toHaveLength(0);
    expect(useProgressStore.getState().totalTokens).toBe(0);
  });

  it("addSession increments sessions", () => {
    useProgressStore.getState().addSession(mockSession);
    expect(useProgressStore.getState().sessions).toHaveLength(1);
  });

  it("addSession updates totals", () => {
    useProgressStore.getState().addSession(mockSession);
    expect(useProgressStore.getState().totalTokens).toBe(5000);
    expect(useProgressStore.getState().totalStudyTime).toBe(120000);
  });

  it("getSessionsByFeature filters correctly", () => {
    useProgressStore.getState().addSession(mockSession);
    useProgressStore.getState().addSession({ ...mockSession, id: "s2", feature: "chat" });
    expect(useProgressStore.getState().getSessionsByFeature("quiz")).toHaveLength(1);
  });

  it("getTopicProgress aggregates correctly", () => {
    useProgressStore.getState().addSession(mockSession);
    useProgressStore.getState().addSession({ ...mockSession, id: "s2", score: 90 });
    const progress = useProgressStore.getState().getTopicProgress();
    expect(progress.Math.sessions).toBe(2);
    expect(progress.Math.avgScore).toBe(85);
  });

  it("reset clears all data", () => {
    useProgressStore.getState().addSession(mockSession);
    useProgressStore.getState().reset();
    expect(useProgressStore.getState().sessions).toHaveLength(0);
  });
});
