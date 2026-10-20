import { NextResponse } from "next/server";
import { chatCompletion, chatCompletionStream, type ChatMessage } from "@/lib/llm/client";
import { handleLlmRoute, textField } from "@/lib/llm/server";
import { LlmError } from "@/lib/llm/errors";
import { languageInstruction, outputLanguage } from "@/lib/llm/language";

export async function POST(request: Request) {
  return handleLlmRoute(request, async ({ llm, body }) => {
    const message = textField(body.message, 8000);
    if (!message) throw new LlmError("invalid_request", "Message is empty.", 400);
    const systemPrompt = textField(body.systemPrompt, 4000);
    const language = outputLanguage(body.language);

    // The language instruction always goes first; a caller's system prompt follows it.
    const system = [languageInstruction(language), systemPrompt].filter(Boolean).join("\n\n");
    const messages: ChatMessage[] = [
      { role: "system", content: system },
      { role: "user", content: message },
    ];

    if (body.stream === true) {
      const stream = await chatCompletionStream(llm, messages, { temperature: 0.7, maxTokens: 2048, timeoutMs: 120_000 });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const result = await chatCompletion(llm, messages, { temperature: 0.7, maxTokens: 2048 });
    return NextResponse.json(result);
  });
}
