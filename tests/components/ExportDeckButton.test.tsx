import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportDeckButton } from "@/components/ExportDeckButton";
import { toCsv } from "@/lib/flashcard-export";

const cards = [
  { front: "Q1", back: "A1" },
  { front: "Q2, with comma", back: "A2" },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("ExportDeckButton", () => {
  it("renders nothing for an empty deck", () => {
    const { container } = render(<ExportDeckButton cards={[]} topic="Math" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a labelled button when the deck has cards", () => {
    render(<ExportDeckButton cards={cards} topic="Math" />);
    const button = screen.getByRole("button", { name: "Download CSV: 2 cards for Anki" });
    expect(button).toHaveTextContent("Download CSV");
  });

  it("downloads the deck as a CSV blob with the topic file name", async () => {
    vi.useFakeTimers();
    const blobs: Blob[] = [];
    const create = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return "blob:learnpath-test";
    });
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const clicks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this);
    });

    render(<ExportDeckButton cards={cards} topic="Linear Algebra" />);
    fireEvent.click(screen.getByRole("button"));

    expect(create).toHaveBeenCalledTimes(1);
    expect(blobs[0].type).toBe("text/csv;charset=utf-8");
    expect(await blobs[0].text()).toBe(toCsv(cards, "Linear Algebra"));
    expect(clicks).toHaveLength(1);
    expect(clicks[0].download).toBe("learnpath-linear-algebra-flashcards.csv");
    expect(clicks[0].getAttribute("href")).toBe("blob:learnpath-test");
    expect(clicks[0].isConnected).toBe(false);

    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith("blob:learnpath-test");
  });
});
