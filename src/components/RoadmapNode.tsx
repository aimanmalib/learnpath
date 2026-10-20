"use client";
import { clsx } from "clsx";
import { Check, Clock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  estimatedTime?: string;
  topics?: string[];
}

interface RoadmapNodeProps {
  step: RoadmapStep;
  index: number;
  isLast: boolean;
  /** Shown on the current step when given. */
  onComplete?: () => void;
}

const STATUS_LABEL = {
  completed: "roadmap.statusCompleted",
  current: "roadmap.statusCurrent",
  upcoming: "roadmap.statusUpcoming",
} as const;

export function RoadmapNode({ step, index, isLast, onComplete }: RoadmapNodeProps) {
  const { t } = useI18n();
  const status = step.status;

  return (
    <li className="relative flex gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        {/*
          Every state keeps text contrast at AA: upcoming = muted ink on the
          surface (was white on light grey), current = on-brand on brand,
          completed = on-brand on success.
        */}
        <span
          className={clsx(
            "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
            status === "completed" && "border-success bg-success text-on-brand",
            status === "current" && "border-brand bg-brand text-on-brand ring-4 ring-brand-soft",
            status === "upcoming" && "border-line-strong bg-surface text-ink-muted",
          )}
        >
          {status === "completed" ? <Check className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" /> : index + 1}
          <span className="sr-only">
            {t("roadmap.stepLabel", { number: index + 1 })}, {t(STATUS_LABEL[status])}
          </span>
        </span>
        {!isLast && (
          <span
            aria-hidden="true"
            className={clsx("w-0.5 flex-1", status === "completed" ? "bg-success" : "bg-line")}
          />
        )}
      </div>

      <div
        className={clsx(
          "mb-5 min-w-0 flex-1 rounded-2xl border p-4 sm:p-5",
          status === "current" ? "border-brand/50 bg-surface shadow-raised" : "border-line bg-surface shadow-card",
          isLast && "mb-0",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className={clsx(
              "text-xs font-bold uppercase tracking-wider",
              status === "current" ? "text-brand-ink" : status === "completed" ? "text-success-ink" : "text-ink-subtle",
            )}
            aria-hidden="true"
          >
            {status === "upcoming" ? t("roadmap.stepLabel", { number: index + 1 }) : t(STATUS_LABEL[status])}
          </span>
          {step.estimatedTime && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {step.estimatedTime}
            </span>
          )}
        </div>
        <h3 className={clsx("mt-1.5 text-base font-semibold leading-snug sm:text-lg", status === "completed" ? "text-ink-muted" : "text-ink")}>
          {step.title}
        </h3>
        {step.description && <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.description}</p>}
        {step.topics && step.topics.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {step.topics.map((topic) => (
              <li key={topic} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
                {topic}
              </li>
            ))}
          </ul>
        )}
        {status === "current" && onComplete && (
          <button type="button" onClick={onComplete} className="btn btn-primary btn-sm mt-4">
            <Check className="h-4 w-4" aria-hidden="true" />
            {t("roadmap.markDone")}
          </button>
        )}
      </div>
    </li>
  );
}
