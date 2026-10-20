import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/llm/client";
import { extractJson, handleLlmRoute, intField, textField, unreadable } from "@/lib/llm/server";
import { LlmError } from "@/lib/llm/errors";
import { languageInstruction, languageReminder, outputLanguage } from "@/lib/llm/language";

export async function POST(request: Request) {
  return handleLlmRoute(request, async ({ llm, body }) => {
    const topic = textField(body.topic, 200);
    if (!topic) throw new LlmError("invalid_request", "Enter a topic first.", 400);
    const count = intField(body.count, 1, 20, 10);
    const language = outputLanguage(body.language);

    const systemPrompt = `Generate ${count} study flashcards about the user's topic. Return ONLY a valid JSON array, no prose. ${languageInstruction(language)}`;
    const userPrompt = `Topic: ${JSON.stringify(topic)}. Format: [{"id":"fc1","front":"question or concept","back":"answer or definition"}]. ${languageReminder(language)}`;

    const result = await chatCompletion(
      llm,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.7, maxTokens: 4096 },
    );

    const parsed = extractJson(result.content, "array");
    const cards = (Array.isArray(parsed) ? parsed : [])
      .filter((c): c is { front: string; back: string; id?: unknown } => !!c && typeof c.front === "string" && typeof c.back === "string")
      .map((c, i) => ({ id: typeof c.id === "string" ? c.id : `fc${i + 1}`, front: c.front, back: c.back, topic }));

    if (cards.length === 0) throw unreadable("flashcards");
    return NextResponse.json({ cards, tokens_used: result.total_tokens });
  });
}
