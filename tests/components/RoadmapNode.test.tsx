import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RoadmapNode } from "@/components/RoadmapNode";

describe("RoadmapNode", () => {
  const step = {
    id: "s1", title: "Learn Basics", description: "Start here",
    status: "upcoming" as const, estimatedTime: "2 hours", topics: ["variables", "types"],
  };

  it("renders step title", () => {
    render(<RoadmapNode step={step} index={0} isLast={false} />);
    expect(screen.getByText("Learn Basics")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<RoadmapNode step={step} index={0} isLast={false} />);
    expect(screen.getByText("Start here")).toBeInTheDocument();
  });

  it("renders topics", () => {
    render(<RoadmapNode step={step} index={0} isLast={false} />);
    expect(screen.getByText("variables")).toBeInTheDocument();
  });

  it("renders estimated time", () => {
    render(<RoadmapNode step={step} index={0} isLast={false} />);
    expect(screen.getByText(/2 hours/)).toBeInTheDocument();
  });

  it("announces the completed state instead of the step number", () => {
    render(<RoadmapNode step={{ ...step, status: "completed" }} index={0} isLast={false} />);
    expect(screen.getByText("Step 1, Completed")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("offers 'Mark as done' only on the current step", () => {
    const onComplete = vi.fn();
    const { rerender } = render(<RoadmapNode step={{ ...step, status: "current" }} index={1} isLast={false} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark as done" }));
    expect(onComplete).toHaveBeenCalled();
    rerender(<RoadmapNode step={step} index={1} isLast={false} onComplete={onComplete} />);
    expect(screen.queryByRole("button", { name: "Mark as done" })).not.toBeInTheDocument();
  });

  it("gives upcoming steps readable (non-white) number text", () => {
    render(<RoadmapNode step={step} index={2} isLast={false} />);
    const badge = screen.getByText("3");
    expect(badge.className).toContain("text-ink-muted");
    expect(badge.className).not.toContain("text-white");
  });
});
