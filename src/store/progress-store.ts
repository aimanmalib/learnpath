import { create } from "zustand";

export interface StudySession {
  id: string;
  feature: "quiz" | "flashcards" | "roadmap" | "concepts" | "chat";
  topic: string;
  score?: number;
  duration: number;
  timestamp: string;
  tokensUsed: number;
}

interface ProgressState {
  sessions: StudySession[];
  streakDays: number;
  totalStudyTime: number;
  totalTokens: number;

  addSession: (session: StudySession) => void;
  getSessionsByFeature: (feature: string) => StudySession[];
  getTopicProgress: () => Record<string, { sessions: number; avgScore: number }>;
  getWeeklyStats: () => { day: string; sessions: number; tokens: number }[];
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  sessions: [],
  streakDays: 0,
  totalStudyTime: 0,
  totalTokens: 0,

  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      totalStudyTime: state.totalStudyTime + session.duration,
      totalTokens: state.totalTokens + session.tokensUsed,
    })),

  getSessionsByFeature: (feature) =>
    get().sessions.filter((s) => s.feature === feature),

  getTopicProgress: () => {
    const topics: Record<string, { sessions: number; scores: number[] }> = {};
    for (const s of get().sessions) {
      if (!topics[s.topic]) topics[s.topic] = { sessions: 0, scores: [] };
      topics[s.topic].sessions++;
      if (s.score !== undefined) topics[s.topic].scores.push(s.score);
    }
    return Object.fromEntries(
      Object.entries(topics).map(([topic, data]) => [
        topic,
        {
          sessions: data.sessions,
          avgScore:
            data.scores.length === 0
              ? 0
              : Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        },
      ]),
    );
  },

  getWeeklyStats: () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return days.map((day) => {
      const daySessions = get().sessions.filter((s) => {
        const d = new Date(s.timestamp);
        return d >= weekAgo && days[d.getDay()] === day;
      });
      return {
        day,
        sessions: daySessions.length,
        tokens: daySessions.reduce((sum, s) => sum + s.tokensUsed, 0),
      };
    });
  },

  reset: () => set({ sessions: [], streakDays: 0, totalStudyTime: 0, totalTokens: 0 }),
}));
