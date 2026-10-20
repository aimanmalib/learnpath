"use client";
import Link from "next/link";
import { ArrowRight, ChartColumn, Clock, Coins, Layers } from "lucide-react";
import { ProgressChart } from "@/components/ProgressChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useProgressStore, type StudySession } from "@/store/progress-store";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages";

const DAY_KEYS: Record<string, MessageKey> = {
  Sun: "days.sun",
  Mon: "days.mon",
  Tue: "days.tue",
  Wed: "days.wed",
  Thu: "days.thu",
  Fri: "days.fri",
  Sat: "days.sat",
};

const FEATURE_KEYS: Record<StudySession["feature"], MessageKey> = {
  quiz: "progress.featureQuiz",
  flashcards: "progress.featureFlashcards",
  roadmap: "progress.featureRoadmap",
  concepts: "progress.featureConcepts",
  chat: "progress.featureChat",
};

export default function ProgressPage() {
  const { t, intl } = useI18n();
  const store = useProgressStore();
  const topicProgress = store.getTopicProgress();
  const weeklyStats = store.getWeeklyStats();
  const tokensByFeature = store.sessions.reduce<Partial<Record<StudySession["feature"], number>>>((acc, s) => {
    acc[s.feature] = (acc[s.feature] || 0) + s.tokensUsed;
    return acc;
  }, {});
  const maxTokens = Math.max(1, ...Object.values(tokensByFeature).map((n) => n ?? 0));
  const nf = new Intl.NumberFormat(intl);
  const hasScore = (topic: string) => store.sessions.some((s) => s.topic === topic && s.score !== undefined);

  const stats = [
    { icon: Layers, label: t("progress.sessions"), value: nf.format(store.sessions.length) },
    { icon: Clock, label: t("progress.studyTime"), value: t("progress.studyTimeValue", { minutes: nf.format(Math.round(store.totalStudyTime / 60000)) }) },
    { icon: Coins, label: t("progress.tokens"), value: nf.format(store.totalTokens) },
  ];

  return (
    <PageShell>
      <PageHeader icon={ChartColumn} title={t("progress.title")} description={t("progress.description")} />

      {store.sessions.length === 0 ? (
        <EmptyState
          icon={ChartColumn}
          title={t("progress.emptyTitle")}
          description={t("progress.emptyDesc")}
          action={
            <Link href="/quiz" className="btn btn-primary">
              {t("progress.emptyCta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="card flex items-center gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-sm text-ink-muted">{s.label}</dt>
                  <dd className="font-display text-2xl font-semibold tabular-nums text-ink">{s.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProgressChart
              data={weeklyStats.map((s) => ({ label: t(DAY_KEYS[s.day] ?? "days.sun"), value: s.sessions }))}
              title={t("progress.weekly")}
              caption={t("progress.weeklyCaption")}
            />

            <section className="card p-5">
              <h3 className="text-sm font-semibold text-ink">{t("progress.byFeature")}</h3>
              <ul className="mt-5 space-y-4">
                {Object.entries(tokensByFeature).map(([feature, tokens]) => (
                  <li key={feature}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">{t(FEATURE_KEYS[feature as StudySession["feature"]])}</span>
                      <span className="font-semibold tabular-nums text-ink">{nf.format(tokens ?? 0)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${((tokens ?? 0) / maxTokens) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8" aria-labelledby="topics-title">
            <h2 id="topics-title" className="mb-4 font-display text-xl font-semibold text-ink">
              {t("progress.topics")}
            </h2>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(topicProgress).map(([topic, data]) => (
                <li key={topic} className="card p-4">
                  <p className="font-semibold text-ink">{topic}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {hasScore(topic)
                      ? t("progress.topicLine", { sessions: data.sessions, score: data.avgScore })
                      : t("progress.topicLineNoScore", { sessions: data.sessions })}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </PageShell>
  );
}
