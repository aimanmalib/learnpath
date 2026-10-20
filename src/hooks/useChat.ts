"use client";
import { useCallback, useState } from "react";
import { ApiError, apiHeaders, openSettings, postJson, toApiError, withLanguage } from "@/lib/api-client";
import { parseSSEStream } from "@/lib/sse-parser";

interface ChatState {
  response: string;
  reasoning: string;
  isLoading: boolean;
  error: ApiError | null;
  tokensUsed: number;
}

const initialState: ChatState = {
  response: "",
  reasoning: "",
  isLoading: false,
  error: null,
  tokensUsed: 0,
};

function asApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError("unknown", "Something went wrong. Please try again.", 0);
}

/** Talk to `/api/chat` with the visitor's provider settings. */
export function useChat() {
  const [state, setState] = useState<ChatState>(initialState);

  const sendMessage = useCallback(async (message: string, systemPrompt?: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null, response: "", reasoning: "" }));
    try {
      const data = await postJson<{ content: string; reasoning_content?: string; total_tokens?: number }>(
        "/api/chat",
        { message, systemPrompt },
      );
      setState({
        response: data.content,
        reasoning: data.reasoning_content || "",
        isLoading: false,
        error: null,
        tokensUsed: data.total_tokens || 0,
      });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false, error: asApiError(err) }));
    }
  }, []);

  const streamMessage = useCallback(async (message: string, systemPrompt?: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null, response: "", reasoning: "" }));
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(withLanguage({ message, systemPrompt, stream: true })),
      });
      if (!res.ok) {
        const err = await toApiError(res);
        if (err.code === "missing_key") openSettings(err.code);
        throw err;
      }
      if (!res.body) throw new ApiError("empty_stream", "The server returned an empty stream.", res.status);

      let content = "";
      let reasoning = "";
      for await (const chunk of parseSSEStream(res.body)) {
        content += chunk.content;
        reasoning += chunk.reasoningContent;
        setState((s) => ({ ...s, response: content, reasoning }));
      }
      setState((s) => ({ ...s, isLoading: false }));
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false, error: asApiError(err) }));
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, sendMessage, streamMessage, reset };
}
