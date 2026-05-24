"use client";
import { clsx } from "clsx";
import type { QuizQuestion } from "@/store/quiz-store";

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number) => void;
  selectedAnswer?: number;
  showResult?: boolean;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  selectedAnswer,
  showResult,
}: QuizCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span
          className={clsx(
            "px-2 py-1 rounded text-xs font-medium",
            question.difficulty === "easy" && "bg-green-100 text-green-700",
            question.difficulty === "medium" && "bg-yellow-100 text-yellow-700",
            question.difficulty === "hard" && "bg-red-100 text-red-700",
          )}
        >
          {question.difficulty}
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>

      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === question.correctIndex;

          return (
            <button
              key={idx}
              onClick={() => !showResult && onAnswer(idx)}
              disabled={showResult}
              className={clsx(
                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                !showResult && !isSelected && "border-gray-200 hover:border-blue-400 hover:bg-blue-50",
                showResult && isCorrect && "border-green-500 bg-green-50",
                showResult && isSelected && !isCorrect && "border-red-500 bg-red-50",
                isSelected && !showResult && "border-blue-500 bg-blue-50",
              )}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}
