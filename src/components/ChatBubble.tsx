"use client";
import { clsx } from "clsx";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  timestamp?: string;
  tokensUsed?: number;
}

export function ChatBubble({ role, content, reasoning, timestamp, tokensUsed }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={clsx("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          isUser ? "bg-blue-500 text-white" : "bg-emerald-500 text-white",
        )}
      >
        {isUser ? "U" : "M"}
      </div>
      <div
        className={clsx(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900",
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {reasoning && (
          <details className="mt-2 text-xs opacity-70">
            <summary className="cursor-pointer">Reasoning</summary>
            <p className="mt-1 italic">{reasoning}</p>
          </details>
        )}
        {(timestamp || tokensUsed) && (
          <div className="mt-1 flex gap-2 text-xs opacity-50">
            {timestamp && <span>{timestamp}</span>}
            {tokensUsed && <span>{tokensUsed} tokens</span>}
          </div>
        )}
      </div>
    </div>
  );
}
