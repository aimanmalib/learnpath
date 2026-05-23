import { NextRequest, NextResponse } from "next/server";

const MIMO_ENDPOINT = process.env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_API_KEY = process.env.MIMO_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { topic, count = 5, difficulty = "medium" } = await request.json();

    const systemPrompt = `You are LearnPath's quiz generator. Create ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty level. Each question must have exactly 4 options with one correct answer. Return ONLY a valid JSON array.`;

    const userPrompt = `Generate ${count} quiz questions about "${topic}". Format: [{"id":"q1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","topic":"${topic}","difficulty":"${difficulty}"}]`;

    const response = await fetch(`${MIMO_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: { "api-key": MIMO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "MiMo API error" }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    try {
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return NextResponse.json({ questions, tokens_used: data.usage?.total_tokens || 0 });
    } catch {
      return NextResponse.json({ questions: [], raw: content });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
