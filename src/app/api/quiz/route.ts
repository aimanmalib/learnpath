import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/llm/client";
import { extractJson, handleLlmRoute, intField, oneOf, textField, unreadable } from "@/lib/llm/server";
import { LlmError } from "@/lib/llm/errors";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: (typeof DIFFICULTIES)[number];
}

export async function POST(request: Request) {
  return handleLlmRoute(request, async ({ llm, body }) => {
    const topic = textField(body.topic, 200);
    if (!topic) throw new LlmError("invalid_request", "Enter a topic first.", 400);
    const count = intField(body.count, 1, 10, 5);
    const difficulty = oneOf(body.difficulty, DIFFICULTIES, "medium");

    const systemPrompt = `You are LearnPath's quiz generator. Create ${count} multiple-choice questions about the user's topic at ${difficulty} difficulty. Each question must have exactly 4 options with one correct answer. Return ONLY a valid JSON array, no prose.`;
    const userPrompt = `Topic: ${JSON.stringify(topic)}. Format: [{"id":"q1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]`;

    const result = await chatCompletion(
      llm,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.8, maxTokens: 4096 },
    );

    const parsed = extractJson(result.content, "array");
    const questions: Question[] = (Array.isArray(parsed) ? parsed : [])
      .filter(
        (q): q is { question: string; options: unknown[]; correctIndex: number; explanation?: unknown; id?: unknown } =>
          !!q &&
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          Number.isInteger(q.correctIndex) &&
          q.correctIndex >= 0 &&
          q.correctIndex < q.options.length,
      )
      .map((q, i) => ({
        id: typeof q.id === "string" ? q.id : `q${i + 1}`,
        question: q.question,
        options: q.options.map(String),
        correctIndex: q.correctIndex,
        explanation: typeof q.explanation === "string" ? q.explanation : "",
        topic,
        difficulty,
      }));

    if (questions.length === 0) throw unreadable("a quiz");
    return NextResponse.json({ questions, tokens_used: result.total_tokens });
  });
}
