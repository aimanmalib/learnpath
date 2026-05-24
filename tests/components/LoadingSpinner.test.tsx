import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with label", () => {
    render(<LoadingSpinner label="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders without label", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
