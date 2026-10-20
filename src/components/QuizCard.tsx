"use client";
import { clsx } from "clsx";
import { Check, Lightbulb, X } from "lucide-react";
import type { QuizQuestion } from "@/store/quiz-store";
import { useI18n } from "@/i18n/I18nProvider";

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number) => void;
  selectedAnswer?: number;
  showResult?: boolean;
}

const DIFFICULTY_STYLE = {
  easy: "bg-success-soft text-success-ink",
  medium: "bg-warning-soft text-warning-ink",
  hard: "bg-danger-soft text-danger-ink",
} as const;

export function QuizCard({ question, questionNumber, totalQuestions, onAnswer, selectedAnswer, showResult }: QuizCardProps) {
  const { t } = useI18n();
  const answeredCorrectly = showResult && selectedAnswer === question.correctIndex;

  return (
    <div className="card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-muted">
          {t("quiz.questionOf", { current: questionNumber, total: totalQuestions })}
        </span>
        <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", DIFFICULTY_STYLE[question.difficulty])}>
          {t(`quiz.${question.difficulty}`)}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-semibold leading-snug text-ink sm:text-xl">{question.question}</h2>

      <ul className="mt-5 space-y-2.5">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === question.correctIndex;
          const state = !showResult ? (isSelected ? "selected" : "idle") : isCorrect ? "correct" : isSelected ? "wrong" : "dim";
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => !showResult && onAnswer(idx)}
                disabled={showResult}
                aria-pressed={isSelected}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[0.9375rem] leading-snug transition-colors",
                  state === "idle" && "border-line bg-surface hover:border-brand hover:bg-brand-soft/40",
                  state === "selected" && "border-brand bg-brand-soft",
                  state === "correct" && "border-success bg-success-soft text-success-ink",
                  state === "wrong" && "border-danger bg-danger-soft text-danger-ink",
                  state === "dim" && "border-line bg-surface text-ink-muted",
                  showResult && "cursor-default",
                )}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    state === "correct"
                      ? "bg-success text-on-brand"
                      : state === "wrong"
                        ? "bg-danger text-on-brand"
                        : "bg-surface-2 text-ink-muted",
                  )}
                >
                  {state === "correct" ? (
                    <Check className="h-4 w-4" />
                  ) : state === "wrong" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </span>
                <span className="pt-0.5">{option}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {showResult && (
        <div role="status" aria-live="polite" className="mt-5 rounded-xl bg-surface-2 p-4 text-sm leading-relaxed">
          {selectedAnswer !== undefined && (
            <p className={clsx("mb-1.5 font-semibold", answeredCorrectly ? "text-success-ink" : "text-danger-ink")}>
              {answeredCorrectly ? t("quiz.correct") : t("quiz.incorrect")}
              {!answeredCorrectly && (
                <span className="font-normal text-ink-muted">
                  {" "}
                  {t("quiz.correctAnswerWas", { answer: String.fromCharCode(65 + question.correctIndex) })}
                </span>
              )}
            </p>
          )}
          {question.explanation && (
            <p className="flex gap-2 text-ink-muted">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-ink">{t("quiz.explanation")}:</strong> {question.explanation}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
