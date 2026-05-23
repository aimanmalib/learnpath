import { NextRequest, NextResponse } from "next/server";

const MIMO_ENDPOINT = process.env.MIMO_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_API_KEY = process.env.MIMO_API_KEY || "";
const MIMO_MODEL = process.env.MIMO_MODEL || "mimo-v2.5-pro";

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, stream } = await request.json();

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: message });

    const body = {
      model: MIMO_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: !!stream,
    };

    const response = await fetch(`${MIMO_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: {
        "api-key": MIMO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `MiMo API error: ${response.status}` },
        { status: response.status },
      );
    }

    if (stream && response.body) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const usage = data.usage || {};

    return NextResponse.json({
      content: choice?.message?.content || "",
      reasoning_content: choice?.message?.reasoning_content || "",
      model: data.model,
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
