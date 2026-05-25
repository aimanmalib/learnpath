import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("shows checkmark for completed", () => {
    render(<RoadmapNode step={{ ...step, status: "completed" }} index={0} isLast={false} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});
