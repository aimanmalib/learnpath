"use client";
import { Info, Network } from "lucide-react";
import { ConceptMap } from "@/components/ConceptMap";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages";

/** Fixed sample data (labels come from the language files). */
const SAMPLE: { id: string; label: MessageKey; connections: string[]; mastery: number }[] = [
  { id: "1", label: "concepts.variables", connections: ["2", "3"], mastery: 90 },
  { id: "2", label: "concepts.functions", connections: ["1", "4"], mastery: 75 },
  { id: "3", label: "concepts.dataTypes", connections: ["1", "5"], mastery: 85 },
  { id: "4", label: "concepts.controlFlow", connections: ["2", "6"], mastery: 60 },
  { id: "5", label: "concepts.collections", connections: ["3", "6"], mastery: 45 },
  { id: "6", label: "concepts.oop", connections: ["4", "5"], mastery: 30 },
];

export default function ConceptsPage() {
  const { t } = useI18n();
  return (
    <PageShell>
      <PageHeader icon={Network} title={t("concepts.title")} description={t("concepts.description")} />
      <p className="mb-5 flex items-start gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {t("concepts.sampleNote")}
      </p>
      <ConceptMap concepts={SAMPLE.map((c) => ({ ...c, label: t(c.label) }))} title={t("concepts.mapTitle")} />
    </PageShell>
  );
}
