import { NextRequest, NextResponse } from "next/server";

const MIMO_ENDPOINT = process.env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_API_KEY = process.env.MIMO_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { topic, level = "beginner" } = await request.json();

    const systemPrompt = `You are a learning path designer. Create a structured roadmap for learning "${topic}" at ${level} level. Break it into clear steps with estimated times. Return ONLY valid JSON.`;

    const response = await fetch(`${MIMO_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: { "api-key": MIMO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a ${level} learning roadmap for "${topic}". Format: {"title":"...","steps":[{"id":"s1","title":"...","description":"...","estimatedTime":"2 hours","topics":["a","b"],"status":"upcoming"}]}` },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "MiMo API error" }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      return NextResponse.json({ roadmap, tokens_used: data.usage?.total_tokens || 0 });
    } catch {
      return NextResponse.json({ roadmap: {}, raw: content });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
