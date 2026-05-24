import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlashCard } from "@/components/FlashCard";

describe("FlashCard", () => {
  it("shows front text", () => {
    render(<FlashCard front="Question?" back="Answer!" isFlipped={false} onFlip={vi.fn()} />);
    expect(screen.getByText("Question?")).toBeInTheDocument();
  });

  it("calls onFlip on click", () => {
    const onFlip = vi.fn();
    render(<FlashCard front="Q" back="A" isFlipped={false} onFlip={onFlip} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onFlip).toHaveBeenCalled();
  });

  it("shows topic badge", () => {
    render(<FlashCard front="Q" back="A" isFlipped={false} onFlip={vi.fn()} topic="Math" />);
    expect(screen.getByText("Math")).toBeInTheDocument();
  });
});
