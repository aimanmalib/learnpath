import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressChart } from "@/components/ProgressChart";

describe("ProgressChart", () => {
  it("renders title", () => {
    render(<ProgressChart data={[{ label: "Mon", value: 5 }]} title="Weekly" />);
    expect(screen.getByRole("heading", { name: "Weekly" })).toBeInTheDocument();
  });

  it("renders data labels", () => {
    render(<ProgressChart data={[{ label: "Mon", value: 3 }, { label: "Tue", value: 5 }]} title="t" />);
    expect(screen.getAllByText("Mon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tue").length).toBeGreaterThan(0);
  });

  it("has an accessible table with the exact values", () => {
    render(<ProgressChart data={[{ label: "Mon", value: 3 }]} title="Weekly" />);
    expect(screen.getByRole("table")).toHaveTextContent("Mon3");
  });

  it("renders values", () => {
    render(<ProgressChart data={[{ label: "X", value: 42 }]} title="t" />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
