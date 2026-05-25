import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizCard } from "@/components/QuizCard";

const question = {
  id: "q1",
  question: "What is 2+2?",
  options: ["3", "4", "5", "6"],
  correctIndex: 1,
  explanation: "Basic math",
  topic: "Math",
  difficulty: "easy" as const,
};

describe("QuizCard", () => {
  it("renders question text", () => {
    render(<QuizCard question={question} questionNumber={1} totalQuestions={5} onAnswer={vi.fn()} />);
    expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<QuizCard question={question} questionNumber={1} totalQuestions={5} onAnswer={vi.fn()} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls onAnswer when option clicked", () => {
    const onAnswer = vi.fn();
    render(<QuizCard question={question} questionNumber={1} totalQuestions={5} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("4"));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it("shows explanation when showResult", () => {
    render(<QuizCard question={question} questionNumber={1} totalQuestions={5} onAnswer={vi.fn()} showResult />);
    expect(screen.getByText(/Basic math/)).toBeInTheDocument();
  });

  it("shows difficulty badge", () => {
    render(<QuizCard question={question} questionNumber={1} totalQuestions={5} onAnswer={vi.fn()} />);
    expect(screen.getByText("easy")).toBeInTheDocument();
  });
});
