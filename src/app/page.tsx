"use client";
import Link from "next/link";
import { ArrowRight, Info, KeyRound } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { useI18n } from "@/i18n/I18nProvider";
import { openSettings } from "@/lib/api-client";
import { NAV_ITEMS } from "@/lib/nav";
import type { MessageKey } from "@/i18n/messages";

const FEATURES: { href: string; title: MessageKey; desc: MessageKey; sample?: boolean }[] = [
  { href: "/quiz", title: "home.quizTitle", desc: "home.quizDesc" },
  { href: "/flashcards", title: "home.flashcardsTitle", desc: "home.flashcardsDesc" },
  { href: "/roadmap", title: "home.roadmapTitle", desc: "home.roadmapDesc" },
  { href: "/progress", title: "home.progressTitle", desc: "home.progressDesc" },
  { href: "/concepts", title: "home.conceptsTitle", desc: "home.conceptsDesc", sample: true },
];

const STEPS: { title: MessageKey; desc: MessageKey }[] = [
  { title: "home.how1Title", desc: "home.how1Desc" },
  { title: "home.how2Title", desc: "home.how2Desc" },
  { title: "home.how3Title", desc: "home.how3Desc" },
];

function iconFor(href: string) {
  return NAV_ITEMS.find((item) => item.href === href)!.icon;
}

export default function Home() {
  const { t } = useI18n();

  return (
    <PageShell width="wide">
      <section className="grid items-center gap-10 pb-12 pt-2 sm:pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-6">
        <div>
          <p className="eyebrow">{t("home.eyebrow")}</p>
          <h1 className="mt-4 max-w-[18ch] font-display text-display font-semibold text-ink text-balance">{t("home.title")}</h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">{t("home.lead")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/quiz" className="btn btn-primary">
              {t("home.ctaQuiz")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/roadmap" className="btn btn-secondary">
              {t("home.ctaRoadmap")}
            </Link>
          </div>
        </div>

        <ol className="card relative p-6 sm:p-8" aria-label={t("home.howTitle")}>
          <p className="mb-6 text-sm font-semibold text-ink-muted">{t("home.howTitle")}</p>
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="absolute left-[17px] top-10 bottom-1 w-px border-l-2 border-dashed border-line" />
              )}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
                {i + 1}
              </span>
              <div className="pt-1">
                <p className="font-semibold text-ink">{t(step.title)}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t(step.desc)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="features-title">
        <h2 id="features-title" className="font-display text-2xl font-semibold text-ink">
          {t("home.featuresTitle")}
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = iconFor(f.href);
            return (
              <li key={f.href}>
                <Link
                  href={f.href}
                  className="card group flex h-full flex-col p-5 transition-[border-color,box-shadow] hover:border-brand/50 hover:shadow-raised sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                      <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                    </span>
                    {f.sample && (
                      <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
                        {t("common.sampleData")}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{t(f.title)}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{t(f.desc)}</p>
                  <ArrowRight
                    className="mt-4 h-4 w-4 text-ink-subtle transition-transform group-hover:translate-x-1 group-hover:text-brand-ink"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
          <li className="sm:col-span-2 lg:col-span-1">
            <div className="flex h-full flex-col rounded-2xl border border-dashed border-line-strong p-5 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                <KeyRound className="h-[22px] w-[22px]" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{t("home.byokTitle")}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{t("home.byokDesc")}</p>
              <button type="button" onClick={() => openSettings()} className="btn btn-secondary btn-sm mt-4 self-start">
                {t("home.byokCta")}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <p className="mt-10 flex items-start gap-2 text-sm text-ink-subtle">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {t("home.honestNote")}
      </p>
    </PageShell>
  );
}
