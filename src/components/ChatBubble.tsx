"use client";
import { clsx } from "clsx";
import { useI18n } from "@/i18n/I18nProvider";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  timestamp?: string;
  tokensUsed?: number;
}

export function ChatBubble({ role, content, reasoning, timestamp, tokensUsed }: ChatBubbleProps) {
  const { t } = useI18n();
  const isUser = role === "user";

  return (
    <div className={clsx("mb-4 flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        aria-hidden="true"
        className={clsx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isUser ? "bg-brand text-on-brand" : "bg-surface-2 text-ink",
        )}
      >
        {isUser ? t("chat.you").slice(0, 1) : t("chat.model")}
      </div>
      <div
        className={clsx(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isUser ? "bg-brand text-on-brand" : "border border-line bg-surface text-ink",
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{content}</p>
        {reasoning && (
          <details className="mt-2 text-xs opacity-80">
            <summary className="cursor-pointer">{t("chat.reasoning")}</summary>
            <p className="mt-1 italic">{reasoning}</p>
          </details>
        )}
        {(timestamp || tokensUsed) && (
          <div className="mt-1 flex gap-2 text-xs opacity-75">
            {timestamp && <span>{timestamp}</span>}
            {tokensUsed && <span>{t("common.tokens", { count: tokensUsed })}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
