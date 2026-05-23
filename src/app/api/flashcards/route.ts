import { NextRequest, NextResponse } from "next/server";

const MIMO_ENDPOINT = process.env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_API_KEY = process.env.MIMO_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { topic, count = 10 } = await request.json();

    const systemPrompt = `Generate ${count} study flashcards about "${topic}". Return ONLY valid JSON array.`;
    const userPrompt = `Create flashcards. Format: [{"id":"fc1","front":"question/concept","back":"answer/definition","topic":"${topic}"}]`;

    const response = await fetch(`${MIMO_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: { "api-key": MIMO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
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
      const cards = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return NextResponse.json({ cards, tokens_used: data.usage?.total_tokens || 0 });
    } catch {
      return NextResponse.json({ cards: [], raw: content });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
