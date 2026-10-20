"use client";
import { useState } from "react";
import { PartyPopper, Route } from "lucide-react";
import { RoadmapNode, type RoadmapStep } from "@/components/RoadmapNode";
import { ErrorNotice } from "@/components/ErrorNotice";
import { GeneratingState } from "@/components/GeneratingState";
import { TopicForm } from "@/components/TopicForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ApiError, postJson } from "@/lib/api-client";
import { recordSession } from "@/lib/record-session";
import { useI18n } from "@/i18n/I18nProvider";

type Level = "beginner" | "intermediate" | "advanced";

export default function RoadmapPage() {
  const { t } = useI18n();
  const [level, setLevel] = useState<Level>("beginner");
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [title, setTitle] = useState("");
  const [lastTopic, setLastTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const generate = async (topic: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setLastTopic(topic);
    const started = Date.now();
    try {
      const data = await postJson<{ roadmap: { title: string; steps: RoadmapStep[] }; tokens_used?: number }>(
        "/api/roadmap",
        { topic, level },
      );
      setTitle(data.roadmap.title || topic);
      setSteps(data.roadmap.steps.map((s, i) => ({ ...s, status: i === 0 ? "current" : "upcoming" })));
      recordSession({ feature: "roadmap", topic, duration: Date.now() - started, tokensUsed: data.tokens_used || 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("unknown", "Something went wrong. Please try again.", 0));
    } finally {
      setIsLoading(false);
    }
  };

  const completeStep = (index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i === index) return { ...s, status: "completed" };
        if (i === index + 1 && s.status === "upcoming") return { ...s, status: "current" };
        return s;
      }),
    );
  };

  const done = steps.filter((s) => s.status === "completed").length;
  const allDone = steps.length > 0 && done === steps.length;

  return (
    <PageShell width="narrow">
      <PageHeader icon={Route} title={t("roadmap.title")} description={t("roadmap.description")} />

      {steps.length === 0 && !isLoading && (
        <>
          <TopicForm
            title={t("roadmap.formTitle")}
            placeholder={t("roadmap.placeholder")}
            submitLabel={t("roadmap.generate")}
            busy={isLoading}
            defaultTopic={lastTopic}
            onSubmit={generate}
          >
            <div className="sm:col-span-2">
              <SegmentedControl
                label={t("roadmap.level")}
                value={level}
                onChange={setLevel}
                options={[
                  { value: "beginner", label: t("roadmap.beginner") },
                  { value: "intermediate", label: t("roadmap.intermediate") },
                  { value: "advanced", label: t("roadmap.advanced") },
                ]}
              />
            </div>
          </TopicForm>
          <div className="mx-auto max-w-2xl">
            <ErrorNotice error={error} onRetry={lastTopic ? () => generate(lastTopic) : undefined} />
          </div>
        </>
      )}

      {isLoading && <GeneratingState shape="roadmap" label={t("roadmap.loading")} hint={t("roadmap.loadingHint")} />}

      {steps.length > 0 && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                {t(`roadmap.${level}`)} · {t("roadmap.stepsCount", { count: steps.length })}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink">{title}</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setSteps([]);
              }}
              className="btn btn-ghost btn-sm"
            >
              {t("roadmap.newRoadmap")}
            </button>
          </div>
          {allDone && (
            <p role="status" className="mb-6 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success-ink">
              <PartyPopper className="h-4 w-4" aria-hidden="true" />
              {t("roadmap.allDone")}
            </p>
          )}
          <ol>
            {steps.map((step, i) => (
              <RoadmapNode
                key={step.id}
                step={step}
                index={i}
                isLast={i === steps.length - 1}
                onComplete={() => completeStep(i)}
              />
            ))}
          </ol>
        </div>
      )}
    </PageShell>
  );
}
