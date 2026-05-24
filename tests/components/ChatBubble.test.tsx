import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatBubble } from "@/components/ChatBubble";

describe("ChatBubble", () => {
  it("renders user message", () => {
    render(<ChatBubble role="user" content="Hello!" />);
    expect(screen.getByText("Hello!")).toBeInTheDocument();
  });

  it("renders assistant message", () => {
    render(<ChatBubble role="assistant" content="Hi there!" />);
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("shows reasoning when expanded", () => {
    render(<ChatBubble role="assistant" content="Answer" reasoning="Because..." />);
    expect(screen.getByText("Reasoning")).toBeInTheDocument();
  });

  it("shows token count", () => {
    render(<ChatBubble role="assistant" content="OK" tokensUsed={150} />);
    expect(screen.getByText("150 tokens")).toBeInTheDocument();
  });
});
