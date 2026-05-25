import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressChart } from "@/components/ProgressChart";

describe("ProgressChart", () => {
  it("renders title", () => {
    render(<ProgressChart data={[{ label: "Mon", value: 5 }]} title="Weekly" />);
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  it("renders data labels", () => {
    render(<ProgressChart data={[{ label: "Mon", value: 3 }, { label: "Tue", value: 5 }]} title="t" />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
  });

  it("renders values", () => {
    render(<ProgressChart data={[{ label: "X", value: 42 }]} title="t" />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
