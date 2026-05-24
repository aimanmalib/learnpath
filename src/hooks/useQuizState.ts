"use client";
import { useCallback } from "react";
import { useQuizStore } from "@/store/quiz-store";
import { useMiMo } from "./useMiMo";

export function useQuizState() {
  const store = useQuizStore();
  const mimo = useMiMo();

  const generateQuiz = useCallback(
    async (topic: string, count: number = 5, difficulty: "easy" | "medium" | "hard" = "medium") => {
      const systemPrompt = `You are a quiz generator. Generate ${count} multiple-choice questions about ${topic} at ${difficulty} difficulty. Return JSON array: [{"id":"q1","question":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"...","difficulty":"${difficulty}"}]`;

      await mimo.sendMessage(`Generate a quiz about: ${topic}`, systemPrompt);

      if (mimo.response) {
        try {
          const jsonMatch = mimo.response.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            store.setQuestions(questions, topic);
          }
        } catch {
          // JSON parse failed
        }
      }
    },
    [mimo, store],
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
    isGenerating: mimo.isLoading,
    generationError: mimo.error,
  };
}
