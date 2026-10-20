import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/llm/client";
import { handleLlmRoute, textField } from "@/lib/llm/server";
import { languageInstruction, languageReminder, outputLanguage } from "@/lib/llm/language";

export async function POST(request: Request) {
  return handleLlmRoute(request, async ({ llm, body }) => {
    const topic = textField(body.topic, 200, "general");
    const sessions = Array.isArray(body.sessions) ? body.sessions.slice(-20) : [];
    const sessionSummary = JSON.stringify(sessions).slice(0, 8000);
    const language = outputLanguage(body.language);

    const systemPrompt = `You are a learning analytics expert. Analyze study session data and provide insights and recommendations for improvement. Be specific and actionable. ${languageInstruction(language)}`;

    const result = await chatCompletion(
      llm,
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze these study sessions for topic ${JSON.stringify(topic)}: ${sessionSummary}. Provide: 1) Performance summary 2) Weak areas 3) Recommended next steps. ${languageReminder(language)}`,
        },
      ],
      { temperature: 0.5, maxTokens: 2048 },
    );

    return NextResponse.json({ analysis: result.content, tokens_used: result.total_tokens });
  });
}
