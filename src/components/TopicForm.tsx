"use client";
import { useId, useState } from "react";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface TopicFormProps {
  title: string;
  placeholder: string;
  submitLabel: string;
  busy?: boolean;
  /** Pre-fill, e.g. the topic of a request that failed. */
  defaultTopic?: string;
  /** Extra options (difficulty, level, ...) shown under the topic field. */
  children?: React.ReactNode;
  onSubmit: (topic: string) => void;
}

const EXAMPLES = ["topicForm.example1", "topicForm.example2", "topicForm.example3", "topicForm.example4"] as const;

/** Shared "choose a topic" card used by the quiz, flashcard and roadmap pages. */
export function TopicForm({ title, placeholder, submitLabel, busy, defaultTopic = "", children, onSubmit }: TopicFormProps) {
  const { t } = useI18n();
  const id = useId();
  const [topic, setTopic] = useState(defaultTopic);
  const [touched, setTouched] = useState(false);
  const empty = !topic.trim();

  return (
    <form
      noValidate
      className="card mx-auto max-w-2xl p-5 sm:p-7"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!empty && !busy) onSubmit(topic.trim());
      }}
    >
      <h2 className="text-lg font-semibold text-ink">{title}</h2>

      <div className="mt-5">
        <label htmlFor={`${id}-topic`} className="label">
          {t("topicForm.topicLabel")}
        </label>
        <input
          id={`${id}-topic`}
          type="text"
          value={topic}
          maxLength={200}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="go"
          aria-invalid={touched && empty}
          aria-describedby={touched && empty ? `${id}-err` : undefined}
          className="field"
        />
        {touched && empty && (
          <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-danger-ink">
            {t("topicForm.emptyTopic")}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-subtle">{t("topicForm.examplesLabel")}:</span>
          {EXAMPLES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTopic(t(key));
                setTouched(false);
              }}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand-ink"
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {children && <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>}

      <button type="submit" disabled={busy} className="btn btn-primary mt-7 w-full sm:w-auto">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {submitLabel}
      </button>
    </form>
  );
}
