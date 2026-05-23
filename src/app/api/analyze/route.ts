import { NextRequest, NextResponse } from "next/server";

const MIMO_ENDPOINT = process.env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_API_KEY = process.env.MIMO_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { sessions, topic } = await request.json();

    const systemPrompt = `You are a learning analytics expert. Analyze study session data and provide insights and recommendations for improvement. Be specific and actionable.`;

    const sessionSummary = JSON.stringify(sessions?.slice(-20) || []);

    const response = await fetch(`${MIMO_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: { "api-key": MIMO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze these study sessions for topic "${topic || "general"}": ${sessionSummary}. Provide: 1) Performance summary 2) Weak areas 3) Recommended next steps` },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "MiMo API error" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({
      analysis: data.choices?.[0]?.message?.content || "",
      tokens_used: data.usage?.total_tokens || 0,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
