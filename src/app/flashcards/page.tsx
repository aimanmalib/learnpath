"use client";
import { useState } from "react";
import { GalleryVerticalEnd, RotateCcw } from "lucide-react";
import { FlashCard } from "@/components/FlashCard";
import { ErrorNotice } from "@/components/ErrorNotice";
import { GeneratingState } from "@/components/GeneratingState";
import { TopicForm } from "@/components/TopicForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFlashcardStore, type Flashcard } from "@/store/flashcard-store";
import type { QualityRating } from "@/lib/spaced-repetition";
import { ApiError, postJson } from "@/lib/api-client";
import { recordSession } from "@/lib/record-session";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages";

const RATINGS: { quality: QualityRating; label: MessageKey; className: string }[] = [
  { quality: 1, label: "flashcards.rateHard", className: "border-danger/40 bg-danger-soft text-danger-ink" },
  { quality: 3, label: "flashcards.rateGood", className: "border-accent/40 bg-warning-soft text-warning-ink" },
  { quality: 5, label: "flashcards.rateEasy", className: "border-success/40 bg-success-soft text-success-ink" },
];

type Tally = Record<1 | 3 | 5, number>;
const EMPTY_TALLY: Tally = { 1: 0, 3: 0, 5: 0 };

export default function FlashcardsPage() {
  const { t } = useI18n();
  const store = useFlashcardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastTopic, setLastTopic] = useState("");
  const [finished, setFinished] = useState(false);
  const [tally, setTally] = useState<Tally>(EMPTY_TALLY);

  const generate = async (topic: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setLastTopic(topic);
    setFinished(false);
    setTally(EMPTY_TALLY);
    const started = Date.now();
    try {
      const data = await postJson<{ cards: Flashcard[]; tokens_used?: number }>("/api/flashcards", { topic, count: 10 });
      store.setCards(data.cards, topic);
      recordSession({ feature: "flashcards", topic, duration: Date.now() - started, tokensUsed: data.tokens_used || 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("unknown", "Something went wrong. Please try again.", 0));
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = store.cards[store.currentIndex];
  const total = store.cards.length;

  const rateAndNext = (quality: 1 | 3 | 5) => {
    store.rate(quality);
    setTally((prev) => ({ ...prev, [quality]: prev[quality] + 1 }));
    if (store.currentIndex >= total - 1) setFinished(true);
    else store.next();
  };

  const newTopic = () => {
    store.setCards([], "");
    setFinished(false);
  };

  const reviewAgain = () => {
    store.reset();
    setTally(EMPTY_TALLY);
    setFinished(false);
  };

  return (
    <PageShell width="narrow">
      <PageHeader icon={GalleryVerticalEnd} title={t("flashcards.title")} description={t("flashcards.description")} />

      {total === 0 && !isLoading && (
        <>
          <TopicForm
            title={t("flashcards.formTitle")}
            placeholder={t("flashcards.placeholder")}
            submitLabel={t("flashcards.generate")}
            busy={isLoading}
            defaultTopic={lastTopic}
            onSubmit={generate}
          />
          <div className="mx-auto max-w-2xl">
            <ErrorNotice error={error} onRetry={lastTopic ? () => generate(lastTopic) : undefined} />
          </div>
        </>
      )}

      {isLoading && <GeneratingState shape="cards" label={t("flashcards.loading")} hint={t("flashcards.loadingHint")} />}

      {currentCard && !finished && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <p className="min-w-0 flex-1 text-sm font-medium text-ink-muted">
              {t("flashcards.cardOf", { current: store.currentIndex + 1, total })}
            </p>
            <button type="button" onClick={newTopic} className="btn btn-ghost btn-sm">
              {t("common.newTopic")}
            </button>
          </div>
          <div className="mb-5">
            <ProgressBar value={store.currentIndex} max={total} label={t("flashcards.cardOf", { current: store.currentIndex + 1, total })} />
          </div>
          <FlashCard
            key={currentCard.id}
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={store.isFlipped}
            onFlip={store.flip}
            topic={currentCard.topic}
          />
          <div className="mt-6 min-h-[5.5rem]">
            {store.isFlipped && (
              <div role="group" aria-label={t("flashcards.rateQuestion")}>
                <p className="mb-3 text-center text-sm font-medium text-ink-muted">{t("flashcards.rateQuestion")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {RATINGS.map((r) => (
                    <button
                      key={r.quality}
                      type="button"
                      onClick={() => rateAndNext(r.quality as 1 | 3 | 5)}
                      className={`btn border ${r.className} hover:brightness-95`}
                    >
                      {t(r.label)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {finished && (
        <div className="card mx-auto max-w-2xl p-6 text-center sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">{t("flashcards.completeTitle")}</h2>
          <p className="mt-2 text-[0.9375rem] text-ink-muted">{t("flashcards.completeDesc", { total, topic: store.topic })}</p>
          <dl className="mt-6 grid grid-cols-3 gap-2">
            {RATINGS.map((r) => (
              <div key={r.quality} className={`rounded-xl border px-2 py-3 ${r.className}`}>
                <dt className="text-xs font-semibold">{t(r.label)}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{tally[r.quality as 1 | 3 | 5]}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={reviewAgain} className="btn btn-secondary">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t("flashcards.reviewAgain")}
            </button>
            <button type="button" onClick={newTopic} className="btn btn-primary">
              {t("common.newTopic")}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
