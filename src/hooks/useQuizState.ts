"use client";
import { useCallback, useState } from "react";
import { useQuizStore, type QuizQuestion } from "@/store/quiz-store";
import { ApiError, postJson } from "@/lib/api-client";

export function useQuizState() {
  const store = useQuizStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<ApiError | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);

  const generateQuiz = useCallback(
    async (topic: string, count: number = 5, difficulty: "easy" | "medium" | "hard" = "medium") => {
      setIsGenerating(true);
      setGenerationError(null);
      try {
        const data = await postJson<{ questions: QuizQuestion[]; tokens_used?: number }>("/api/quiz", {
          topic,
          count,
          difficulty,
        });
        setTokensUsed(data.tokens_used || 0);
        store.setQuestions(data.questions, topic);
      } catch (err) {
        setGenerationError(
          err instanceof ApiError ? err : new ApiError("unknown", "Something went wrong. Please try again.", 0),
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [store],
  );

  const answerAndNext = useCallback(
    (selectedIndex: number) => {
      store.answerQuestion(selectedIndex);
      store.nextQuestion();
    },
    [store],
  );

  return {
    ...store,
    generateQuiz,
    answerAndNext,
    isGenerating,
    generationError,
    tokensUsed,
  };
}
