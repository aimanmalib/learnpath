import { useProgressStore, type StudySession } from "@/store/progress-store";

/** Add a study session to the in-memory progress store (this visit only). */
export function recordSession(session: Omit<StudySession, "id" | "timestamp">): void {
  useProgressStore.getState().addSession({
    ...session,
    id: `${session.feature}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  });
}
