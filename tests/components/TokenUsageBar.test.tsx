import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TokenUsageBar } from "@/components/TokenUsageBar";

describe("TokenUsageBar", () => {
  it("renders feature name", () => {
    render(<TokenUsageBar feature="quiz" current={5000} daily={0.6} />);
    expect(screen.getByText("quiz")).toBeInTheDocument();
  });

  it("renders token display", () => {
    render(<TokenUsageBar feature="chat" current={3000} daily={0.8} />);
    expect(screen.getByText(/3.0K/)).toBeInTheDocument();
  });
});
