/**
 * MiMo API Client for LearnPath
 *
 * CRITICAL: Uses 'api-key' header — NOT 'Authorization: Bearer'
 * Endpoint: https://token-plan-sgp.xiaomimimo.com/v1/chat/completions
 */

export interface MiMoMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MiMoResponse {
  content: string;
  reasoning_content: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  finish_reason: string;
}

export interface MiMoStreamChunk {
  delta?: {
    content?: string;
    reasoning_content?: string;
  };
  finish_reason?: string;
}

const DEFAULT_BASE_URL = "https://token-plan-sgp.xiaomimimo.com/v1";
const DEFAULT_MODEL = "mimo-v2.5-pro";

export class MiMoClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey: string = process.env.MIMO_API_KEY || "",
    baseUrl: string = process.env.MIMO_BASE_URL || DEFAULT_BASE_URL,
    model: string = process.env.MIMO_MODEL || DEFAULT_MODEL,
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }

  /** Build headers — uses 'api-key' header, NOT Authorization: Bearer */
  private getHeaders(): Record<string, string> {
    return {
      "api-key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  /** Non-streaming chat completion */
  async chatCompletion(
    messages: MiMoMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<MiMoResponse> {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`MiMo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const usage = data.usage || {};

    return {
      content: choice?.message?.content || "",
      reasoning_content: choice?.message?.reasoning_content || "",
      model: data.model || this.model,
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
      finish_reason: choice?.finish_reason || "",
    };
  }

  /** Streaming chat completion via SSE */
  async *streamCompletion(
    messages: MiMoMessage[],
    options: { temperature?: number; maxTokens?: number } = {},
  ): AsyncGenerator<MiMoStreamChunk> {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`MiMo stream error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const chunk = JSON.parse(data);
          const delta = chunk.choices?.[0]?.delta;
          if (delta) {
            yield {
              delta: {
                content: delta.content || undefined,
                reasoning_content: delta.reasoning_content || undefined,
              },
              finish_reason: chunk.choices?.[0]?.finish_reason || undefined,
            };
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}

export function createMiMoClient(): MiMoClient {
  return new MiMoClient();
}
