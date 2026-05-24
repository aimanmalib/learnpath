/**
 * SSE (Server-Sent Events) stream parser for MiMo API responses.
 * Handles the 'reasoning_content' field specific to MiMo V2.5 Pro.
 */

export interface SSEEvent {
  data: string;
  event?: string;
  id?: string;
}

export interface ParsedChunk {
  content: string;
  reasoningContent: string;
  finishReason: string | null;
}

/**
 * Parse a raw SSE text buffer into individual events.
 */
export function parseSSEBuffer(buffer: string): { events: SSEEvent[]; remainder: string } {
  const events: SSEEvent[] = [];
  const lines = buffer.split("\n");
  let currentEvent: Partial<SSEEvent> = {};
  let remainder = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i === lines.length - 1 && !line.endsWith("\n")) {
      remainder = line;
      break;
    }

    if (line === "") {
      if (currentEvent.data !== undefined) {
        events.push({
          data: currentEvent.data,
          event: currentEvent.event,
          id: currentEvent.id,
        });
      }
      currentEvent = {};
      continue;
    }

    if (line.startsWith("data: ")) {
      currentEvent.data = line.slice(6);
    } else if (line.startsWith("event: ")) {
      currentEvent.event = line.slice(7);
    } else if (line.startsWith("id: ")) {
      currentEvent.id = line.slice(4);
    }
  }

  return { events, remainder };
}

/**
 * Parse a single SSE data payload into a ParsedChunk.
 */
export function parseSSEData(data: string): ParsedChunk | null {
  if (data.trim() === "[DONE]") return null;

  try {
    const json = JSON.parse(data);
    const choice = json.choices?.[0];
    const delta = choice?.delta || {};

    return {
      content: delta.content || "",
      reasoningContent: delta.reasoning_content || "",
      finishReason: choice?.finish_reason || null,
    };
  } catch {
    return null;
  }
}

/**
 * Full SSE stream parser that processes chunks from a ReadableStream.
 */
export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<ParsedChunk> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const { events, remainder } = parseSSEBuffer(buffer);
    buffer = remainder;

    for (const event of events) {
      const chunk = parseSSEData(event.data);
      if (chunk) yield chunk;
      if (chunk?.finishReason) return;
    }
  }

  // Process remaining buffer
  if (buffer.trim()) {
    const { events } = parseSSEBuffer(buffer + "\n\n");
    for (const event of events) {
      const chunk = parseSSEData(event.data);
      if (chunk) yield chunk;
    }
  }
}
