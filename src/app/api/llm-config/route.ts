import { NextResponse } from "next/server";
import { publicLlmInfo } from "@/lib/llm/server";

export const dynamic = "force-dynamic";

/** Tells the browser whether the server has its own key. Contains no secrets. */
export function GET() {
  return NextResponse.json(publicLlmInfo(), { headers: { "Cache-Control": "no-store" } });
}
