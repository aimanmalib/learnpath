import { describe, it, expect, beforeEach } from "vitest";
import { useQuizStore } from "@/store/quiz-store";

describe("useQuizStore", () => {
  beforeEach(() => {
    useQuizStore.getState().reset();
  });

  it("initializes with empty state", () => {
    const state = useQuizStore.getState();
    expect(state.questions).toHaveLength(0);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it("setQuestions populates questions", () => {
    const questions = [
      { id: "q1", question: "What?", options: ["A", "B"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
      { id: "q2", question: "How?", options: ["C", "D"], correctIndex: 1, explanation: "", topic: "t", difficulty: "medium" as const },
    ];
    useQuizStore.getState().setQuestions(questions, "test topic");
    expect(useQuizStore.getState().questions).toHaveLength(2);
    expect(useQuizStore.getState().topic).toBe("test topic");
  });

  it("answerQuestion records attempt", () => {
    useQuizStore.getState().setQuestions([
      { id: "q1", question: "Q?", options: ["A", "B"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
    ], "t");
    useQuizStore.getState().answerQuestion(0);
    expect(useQuizStore.getState().attempts).toHaveLength(1);
    expect(useQuizStore.getState().attempts[0].isCorrect).toBe(true);
  });

  it("nextQuestion advances index", () => {
    useQuizStore.getState().setQuestions([
      { id: "q1", question: "Q1?", options: ["A"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
      { id: "q2", question: "Q2?", options: ["B"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
    ], "t");
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().currentQuestionIndex).toBe(1);
  });

  it("nextQuestion marks complete after last", () => {
    useQuizStore.getState().setQuestions([
      { id: "q1", question: "Q?", options: ["A"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
    ], "t");
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().isComplete).toBe(true);
  });

  it("getScore calculates percentage", () => {
    useQuizStore.getState().setQuestions([
      { id: "q1", question: "Q?", options: ["A", "B"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
      { id: "q2", question: "Q?", options: ["A", "B"], correctIndex: 1, explanation: "", topic: "t", difficulty: "easy" as const },
    ], "t");
    useQuizStore.getState().answerQuestion(0); // correct
    useQuizStore.getState().answerQuestion(1); // wrong
    const score = useQuizStore.getState().getScore();
    expect(score.percentage).toBe(50);
  });

  it("getProgress returns current/total", () => {
    useQuizStore.getState().setQuestions([
      { id: "q1", question: "Q?", options: ["A"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
      { id: "q2", question: "Q?", options: ["B"], correctIndex: 0, explanation: "", topic: "t", difficulty: "easy" as const },
    ], "t");
    const progress = useQuizStore.getState().getProgress();
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(2);
  });
});
