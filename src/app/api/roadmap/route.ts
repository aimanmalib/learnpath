import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/llm/client";
import { extractJson, handleLlmRoute, oneOf, textField, unreadable } from "@/lib/llm/server";
import { LlmError } from "@/lib/llm/errors";

const LEVELS = ["beginner", "intermediate", "advanced"] as const;

export async function POST(request: Request) {
  return handleLlmRoute(request, async ({ llm, body }) => {
    const topic = textField(body.topic, 200);
    if (!topic) throw new LlmError("invalid_request", "Enter a topic first.", 400);
    const level = oneOf(body.level, LEVELS, "beginner");

    const systemPrompt = `You are a learning path designer. Create a structured ${level}-level roadmap for the user's topic. Break it into clear steps with estimated times. Return ONLY valid JSON, no prose.`;
    const userPrompt = `Topic: ${JSON.stringify(topic)}. Format: {"title":"...","steps":[{"id":"s1","title":"...","description":"...","estimatedTime":"2 hours","topics":["a","b"]}]}`;

    const result = await chatCompletion(
      llm,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.7, maxTokens: 4096 },
    );

    const parsed = extractJson(result.content, "object") as { title?: unknown; steps?: unknown } | undefined;
    const steps = (Array.isArray(parsed?.steps) ? parsed.steps : [])
      .filter((s): s is { title: string; id?: unknown; description?: unknown; estimatedTime?: unknown; topics?: unknown } => !!s && typeof s.title === "string")
      .map((s, i) => ({
        id: typeof s.id === "string" ? s.id : `s${i + 1}`,
        title: s.title,
        description: typeof s.description === "string" ? s.description : "",
        estimatedTime: typeof s.estimatedTime === "string" ? s.estimatedTime : "",
        topics: Array.isArray(s.topics) ? s.topics.map(String) : [],
        status: "upcoming" as const,
      }));

    if (steps.length === 0) throw unreadable("a roadmap");
    const title = typeof parsed?.title === "string" && parsed.title.trim() ? parsed.title : topic;
    return NextResponse.json({ roadmap: { title, steps }, tokens_used: result.total_tokens });
  });
}
