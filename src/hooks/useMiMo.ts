"use client";
import { useState, useCallback } from "react";

interface MiMoState {
  response: string;
  reasoning: string;
  isLoading: boolean;
  error: string | null;
  tokensUsed: number;
}

interface UseMiMoReturn extends MiMoState {
  sendMessage: (message: string, systemPrompt?: string) => Promise<void>;
  streamMessage: (message: string, systemPrompt?: string) => Promise<void>;
  reset: () => void;
}

const initialState: MiMoState = {
  response: "",
  reasoning: "",
  isLoading: false,
  error: null,
  tokensUsed: 0,
};

export function useMiMo(): UseMiMoReturn {
  const [state, setState] = useState<MiMoState>(initialState);

  const sendMessage = useCallback(async (message: string, systemPrompt?: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null, response: "", reasoning: "" }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, systemPrompt }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setState({
        response: data.content,
        reasoning: data.reasoning_content || "",
        isLoading: false,
        error: null,
        tokensUsed: data.total_tokens || 0,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const streamMessage = useCallback(async (message: string, systemPrompt?: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null, response: "", reasoning: "" }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, systemPrompt, stream: true }),
      });

      if (!res.ok || !res.body) throw new Error(`Stream error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      let reasoning = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const chunk = JSON.parse(data);
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) content += delta.content;
            if (delta?.reasoning_content) reasoning += delta.reasoning_content;
            setState((s) => ({ ...s, response: content, reasoning }));
          } catch {
            // skip
          }
        }
      }

      setState((s) => ({ ...s, isLoading: false }));
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Stream failed",
      }));
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, sendMessage, streamMessage, reset };
}
