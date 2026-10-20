"use client";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { ArrowRight, Check, ListChecks, RotateCcw, X } from "lucide-react";
import { QuizCard } from "@/components/QuizCard";
import { ErrorNotice } from "@/components/ErrorNotice";
import { GeneratingState } from "@/components/GeneratingState";
import { TopicForm } from "@/components/TopicForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useQuizState } from "@/hooks/useQuizState";
import { recordSession } from "@/lib/record-session";
import { useI18n } from "@/i18n/I18nProvider";

type Difficulty = "easy" | "medium" | "hard";

export default function QuizPage() {
  const { t } = useI18n();
  const quiz = useQuizState();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);
  const [selected, setSelected] = useState<number | undefined>();
  const [startedAt, setStartedAt] = useState(0);
  const [lastTopic, setLastTopic] = useState("");
  const recorded = useRef(false);

  const generate = async (topic: string) => {
    if (quiz.isGenerating) return;
    recorded.current = false;
    setSelected(undefined);
    setLastTopic(topic);
    setStartedAt(Date.now());
    await quiz.generateQuiz(topic, count, difficulty);
  };

  const score = quiz.getScore();

  useEffect(() => {
    if (quiz.isComplete && !recorded.current) {
      recorded.current = true;
      recordSession({
        feature: "quiz",
        topic: quiz.topic,
        score: score.percentage,
        duration: startedAt ? Date.now() - startedAt : 0,
        tokensUsed: quiz.tokensUsed,
      });
    }
  }, [quiz.isComplete, quiz.topic, quiz.tokensUsed, score.percentage, startedAt]);

  const currentQ = quiz.questions[quiz.currentQuestionIndex];
  const answered = selected !== undefined;
  const isLast = quiz.currentQuestionIndex === quiz.questions.length - 1;

  const answer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    quiz.answerQuestion(idx);
  };

  const next = () => {
    setSelected(undefined);
    quiz.nextQuestion();
  };

  const restart = () => {
    quiz.reset();
    setSelected(undefined);
  };

  const showForm = quiz.questions.length === 0 && !quiz.isGenerating;

  return (
    <PageShell width="narrow">
      <PageHeader icon={ListChecks} title={t("quiz.title")} description={t("quiz.description")} />

      {showForm && (
        <>
          <TopicForm
            title={t("quiz.formTitle")}
            placeholder={t("quiz.placeholder")}
            submitLabel={t("quiz.generate")}
            busy={quiz.isGenerating}
            defaultTopic={lastTopic}
            onSubmit={generate}
          >
            <SegmentedControl
              label={t("quiz.difficulty")}
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: "easy", label: t("quiz.easy") },
                { value: "medium", label: t("quiz.medium") },
                { value: "hard", label: t("quiz.hard") },
              ]}
            />
            <SegmentedControl
              label={t("quiz.questionCount")}
              value={count}
              onChange={setCount}
              options={[
                { value: 5, label: "5" },
                { value: 10, label: "10" },
              ]}
            />
          </TopicForm>
          <div className="mx-auto max-w-2xl">
            <ErrorNotice error={quiz.generationError} onRetry={lastTopic ? () => generate(lastTopic) : undefined} />
          </div>
        </>
      )}

      {quiz.isGenerating && <GeneratingState shape="quiz" label={t("quiz.loading")} hint={t("quiz.loadingHint")} />}

      {currentQ && !quiz.isComplete && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{quiz.topic}</p>
            <button type="button" onClick={restart} className="btn btn-ghost btn-sm">
              {t("common.newTopic")}
            </button>
          </div>
          <div className="mb-5">
            <ProgressBar
              value={quiz.currentQuestionIndex + (answered ? 1 : 0)}
              max={quiz.questions.length}
              label={t("quiz.questionOf", { current: quiz.currentQuestionIndex + 1, total: quiz.questions.length })}
            />
          </div>
          <QuizCard
            question={currentQ}
            questionNumber={quiz.currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            onAnswer={answer}
            selectedAnswer={selected}
            showResult={answered}
          />
          {answered && (
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={next} className="btn btn-primary w-full sm:w-auto" autoFocus>
                {isLast ? t("quiz.seeResults") : t("common.next")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      {quiz.isComplete && (
        <QuizResults
          topic={quiz.topic}
          correct={score.correct}
          total={score.total}
          percentage={score.percentage}
          onRetake={() => {
            quiz.setQuestions(quiz.questions, quiz.topic);
            recorded.current = false;
            setStartedAt(Date.now());
          }}
          onNewTopic={restart}
        />
      )}
    </PageShell>
  );
}

function QuizResults({
  topic,
  correct,
  total,
  percentage,
  onRetake,
  onNewTopic,
}: {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
  onRetake: () => void;
  onNewTopic: () => void;
}) {
  const { t } = useI18n();
  const quiz = useQuizState();
  const verdict = percentage >= 80 ? "quiz.scoreGreat" : percentage >= 50 ? "quiz.scoreGood" : "quiz.scoreLow";
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="mx-auto max-w-2xl">
      <section className="card flex flex-col items-center p-6 text-center sm:p-8" aria-labelledby="quiz-done">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percentage / 100)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-semibold text-ink">
            {percentage}%
          </span>
        </div>
        <h2 id="quiz-done" className="mt-5 font-display text-2xl font-semibold text-ink">
          {t("quiz.completeTitle")}
        </h2>
        <p className="mt-1 text-sm font-medium text-ink-muted">
          {topic} · {t("quiz.scoreLine", { correct, total })}
        </p>
        <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">{t(verdict)}</p>
        <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button type="button" onClick={onRetake} className="btn btn-secondary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("quiz.retake")}
          </button>
          <button type="button" onClick={onNewTopic} className="btn btn-primary">
            {t("quiz.tryAnother")}
          </button>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="quiz-review">
        <h3 id="quiz-review" className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          {t("quiz.reviewTitle")}
        </h3>
        <ol className="space-y-3">
          {quiz.questions.map((q, i) => {
            const attempt = quiz.attempts.find((a) => a.questionId === q.id);
            const ok = !!attempt?.isCorrect;
            return (
              <li key={q.id} className="card flex gap-3 p-4">
                <span
                  className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    ok ? "bg-success-soft text-success-ink" : "bg-danger-soft text-danger-ink",
                  )}
                >
                  {ok ? <Check className="h-4 w-4" aria-label={t("quiz.correct")} /> : <X className="h-4 w-4" aria-label={t("quiz.incorrect")} />}
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-ink">
                    {i + 1}. {q.question}
                  </p>
                  <p className="mt-1 text-success-ink">
                    <Check className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
                    {q.options[q.correctIndex]}
                  </p>
                  {!ok && attempt && (
                    <p className="mt-0.5 text-ink-muted">{t("quiz.yourAnswer", { answer: q.options[attempt.selectedIndex] ?? "" })}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
