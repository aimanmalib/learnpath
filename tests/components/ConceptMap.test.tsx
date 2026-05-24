import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConceptMap } from "@/components/ConceptMap";

describe("ConceptMap", () => {
  const concepts = [
    { id: "1", label: "Variables", connections: [], mastery: 80 },
    { id: "2", label: "Functions", connections: ["1"], mastery: 50 },
  ];

  it("renders title", () => {
    render(<ConceptMap concepts={concepts} title="Test Map" />);
    expect(screen.getByText("Test Map")).toBeInTheDocument();
  });

  it("renders concept labels", () => {
    render(<ConceptMap concepts={concepts} />);
    expect(screen.getByText("Variables")).toBeInTheDocument();
    expect(screen.getByText("Functions")).toBeInTheDocument();
  });

  it("renders mastery percentage", () => {
    render(<ConceptMap concepts={concepts} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });
});
