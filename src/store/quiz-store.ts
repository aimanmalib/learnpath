import { create } from "zustand";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizAttempt {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  attempts: QuizAttempt[];
  isComplete: boolean;
  startTime: number;
  topic: string;

  setQuestions: (questions: QuizQuestion[], topic: string) => void;
  answerQuestion: (selectedIndex: number) => void;
  nextQuestion: () => void;
  reset: () => void;
  getScore: () => { correct: number; total: number; percentage: number };
  getProgress: () => { current: number; total: number };
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  attempts: [],
  isComplete: false,
  startTime: Date.now(),
  topic: "",

  setQuestions: (questions, topic) =>
    set({
      questions,
      topic,
      currentQuestionIndex: 0,
      attempts: [],
      isComplete: false,
      startTime: Date.now(),
    }),

  answerQuestion: (selectedIndex) => {
    const state = get();
    const current = state.questions[state.currentQuestionIndex];
    if (!current) return;

    const attempt: QuizAttempt = {
      questionId: current.id,
      selectedIndex,
      isCorrect: selectedIndex === current.correctIndex,
      timeSpent: Date.now() - state.startTime,
    };

    set({ attempts: [...state.attempts, attempt] });
  },

  nextQuestion: () => {
    const state = get();
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= state.questions.length) {
      set({ isComplete: true });
    } else {
      set({ currentQuestionIndex: nextIndex, startTime: Date.now() });
    }
  },

  reset: () =>
    set({
      questions: [],
      currentQuestionIndex: 0,
      attempts: [],
      isComplete: false,
      startTime: Date.now(),
      topic: "",
    }),

  getScore: () => {
    const { attempts } = get();
    const correct = attempts.filter((a) => a.isCorrect).length;
    return {
      correct,
      total: attempts.length,
      percentage: attempts.length === 0 ? 0 : Math.round((correct / attempts.length) * 100),
    };
  },

  getProgress: () => {
    const { currentQuestionIndex, questions } = get();
    return { current: currentQuestionIndex + 1, total: questions.length };
  },
}));
