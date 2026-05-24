"use client";
import { useState, useCallback, useEffect } from "react";
import { TokenTracker, TokenSummary, DAILY_ESTIMATES } from "@/lib/token-tracker";

const tracker = new TokenTracker();

export function useTokenTracker() {
  const [summary, setSummary] = useState<TokenSummary>({
    totalCalls: 0,
    totalTokens: 0,
    byFeature: {},
    dailyEstimate: 0,
  });

  useEffect(() => {
    tracker.loadFromStorage();
    setSummary(tracker.getSummary());
  }, []);

  const record = useCallback((feature: string, promptTokens: number, completionTokens: number) => {
    tracker.record(feature, promptTokens, completionTokens);
    setSummary(tracker.getSummary());
  }, []);

  const reset = useCallback(() => {
    tracker.reset();
    setSummary(tracker.getSummary());
  }, []);

  return { summary, record, reset, dailyEstimates: DAILY_ESTIMATES };
}
