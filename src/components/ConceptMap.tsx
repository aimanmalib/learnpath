"use client";
import { clsx } from "clsx";
import { CircleCheck, CircleDashed, CircleDot } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface Concept {
  id: string;
  label: string;
  connections: string[];
  mastery: number; // 0-100
}

interface ConceptMapProps {
  concepts: Concept[];
  title?: string;
}

function band(mastery: number) {
  if (mastery >= 80) return { key: "concepts.strong", icon: CircleCheck, chip: "bg-success-soft text-success-ink", bar: "bg-success" } as const;
  if (mastery >= 50) return { key: "concepts.building", icon: CircleDot, chip: "bg-warning-soft text-warning-ink", bar: "bg-accent" } as const;
  return { key: "concepts.weak", icon: CircleDashed, chip: "bg-danger-soft text-danger-ink", bar: "bg-danger" } as const;
}

export function ConceptMap({ concepts, title }: ConceptMapProps) {
  const { t } = useI18n();
  const byId = new Map(concepts.map((c) => [c.id, c.label]));

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-ink">{title ?? t("concepts.title")}</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted" aria-label={t("concepts.legend")}>
          {[90, 60, 30].map((m) => {
            const b = band(m);
            return (
              <li key={m} className="inline-flex items-center gap-1.5">
                <b.icon className={clsx("h-3.5 w-3.5", b.chip.split(" ")[1])} aria-hidden="true" />
                {t(b.key)}
              </li>
            );
          })}
        </ul>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {concepts.map((concept) => {
          const b = band(concept.mastery);
          const links = concept.connections.map((id) => byId.get(id)).filter(Boolean).join(", ");
          return (
            <li key={concept.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold leading-snug text-ink">{concept.label}</span>
                <span className={clsx("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", b.chip)}>
                  <b.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {concept.mastery}%
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                <div className={clsx("h-full rounded-full", b.bar)} style={{ width: `${concept.mastery}%` }} />
              </div>
              {links && <p className="mt-3 text-xs leading-relaxed text-ink-subtle">{t("concepts.linksTo", { list: links })}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
