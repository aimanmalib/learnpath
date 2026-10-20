import { NextResponse } from "next/server";
import { chatCompletion, chatCompletionStream, type ChatMessage } from "@/lib/llm/client";
import { handleLlmRoute, textField } from "@/lib/llm/server";
import { LlmError } from "@/lib/llm/errors";

export async function POST(request: Request) {
  return handleLlmRoute(request, async ({ llm, body }) => {
    const message = textField(body.message, 8000);
    if (!message) throw new LlmError("invalid_request", "Message is empty.", 400);
    const systemPrompt = textField(body.systemPrompt, 4000);

    const messages: ChatMessage[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: message });

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
