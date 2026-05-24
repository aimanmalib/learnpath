/**
 * Client-side token usage tracking
 */

export interface TokenUsage {
  feature: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: number;
}

export interface TokenSummary {
  totalCalls: number;
  totalTokens: number;
  byFeature: Record<string, { calls: number; tokens: number }>;
  dailyEstimate: number;
}

const STORAGE_KEY = "learnpath-token-usage";

/** Daily token estimates per feature (millions) */
export const DAILY_ESTIMATES: Record<string, number> = {
  chat: 0.8,
  quiz: 0.6,
  flashcards: 0.4,
  roadmap: 0.5,
  analyze: 0.3,
  concepts: 0.5,
};

export const TOTAL_DAILY_ESTIMATE = Object.values(DAILY_ESTIMATES).reduce(
  (a, b) => a + b,
  0,
);

export class TokenTracker {
  private usage: TokenUsage[] = [];

  record(feature: string, promptTokens: number, completionTokens: number): void {
    this.usage.push({
      feature,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      timestamp: Date.now(),
    });
    this.saveToStorage();
  }

  getSummary(): TokenSummary {
    const byFeature: Record<string, { calls: number; tokens: number }> = {};

    for (const u of this.usage) {
      if (!byFeature[u.feature]) {
        byFeature[u.feature] = { calls: 0, tokens: 0 };
      }
      byFeature[u.feature].calls++;
      byFeature[u.feature].tokens += u.totalTokens;
    }

    return {
      totalCalls: this.usage.length,
      totalTokens: this.usage.reduce((sum, u) => sum + u.totalTokens, 0),
      byFeature,
      dailyEstimate: TOTAL_DAILY_ESTIMATE,
    };
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usage));
      } catch {
        // storage full or unavailable
      }
    }
  }

  loadFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) this.usage = JSON.parse(data);
      } catch {
        this.usage = [];
      }
    }
  }

  reset(): void {
    this.usage = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
