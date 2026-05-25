import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTokenTracker } from "@/hooks/useTokenTracker";

describe("useTokenTracker", () => {
  beforeEach(() => {
    // Reset the singleton tracker via direct hook call
    const { result } = renderHook(() => useTokenTracker());
    act(() => result.current.reset());
  });

  it("initializes with zero tokens", () => {
    const { result } = renderHook(() => useTokenTracker());
    expect(result.current.summary.totalTokens).toBe(0);
    expect(result.current.summary.totalCalls).toBe(0);
  });

  it("records token usage", () => {
    const { result } = renderHook(() => useTokenTracker());
    act(() => result.current.record("quiz", 100, 50));
    expect(result.current.summary.totalTokens).toBe(150);
    expect(result.current.summary.byFeature["quiz"].calls).toBe(1);
  });

  it("accumulates across multiple records", () => {
    const { result } = renderHook(() => useTokenTracker());
    act(() => {
      result.current.record("quiz", 100, 50);
      result.current.record("flashcards", 200, 80);
    });
    expect(result.current.summary.totalTokens).toBe(430);
    expect(result.current.summary.totalCalls).toBe(2);
  });

  it("resets correctly", () => {
    const { result } = renderHook(() => useTokenTracker());
    act(() => result.current.record("quiz", 100, 50));
    act(() => result.current.reset());
    expect(result.current.summary.totalTokens).toBe(0);
  });

  it("provides daily estimates", () => {
    const { result } = renderHook(() => useTokenTracker());
    expect(result.current.dailyEstimates).toBeDefined();
    expect(result.current.dailyEstimates.quiz).toBeGreaterThan(0);
  });
});
