"use client";
import { RefreshCw } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface FlashCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  topic?: string;
}

/**
 * Both faces share one grid cell, so the card grows with the longer text
 * instead of clipping it.
 */
export function FlashCard({ front, back, isFlipped, onFlip, topic }: FlashCardProps) {
  const { t } = useI18n();
  return (
    <div
      className="flip-scene mx-auto w-full cursor-pointer select-none rounded-2xl"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div className="flip-card" data-flipped={isFlipped}>
        <div
          className="flip-face card relative flex min-h-64 flex-col items-center justify-center p-6 pt-12 text-center sm:min-h-72 sm:p-10"
          aria-hidden={isFlipped}
        >
          {topic && (
            <span className="absolute left-4 top-4 max-w-[70%] truncate rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
              {topic}
            </span>
          )}
          <p className="text-xl font-semibold leading-snug text-ink sm:text-2xl">{front}</p>
          <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-subtle">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {t("flashcards.tapToReveal")}
          </p>
        </div>
        <div
          className="flip-face flip-back relative flex min-h-64 flex-col items-center justify-center rounded-2xl border border-brand/40 bg-brand-soft p-6 pt-12 text-center shadow-card sm:min-h-72 sm:p-10"
          aria-hidden={!isFlipped}
        >
          <span className="absolute left-4 top-4 text-xs font-bold uppercase tracking-wider text-brand-ink">
            {t("flashcards.answer")}
          </span>
          <p className="text-base leading-relaxed text-ink sm:text-lg">{back}</p>
        </div>
      </div>
    </div>
  );
}
