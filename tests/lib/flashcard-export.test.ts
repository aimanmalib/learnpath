import { describe, it, expect } from "vitest";
import { ANKI_HEADER, csvField, exportFilename, slugify, toCsv } from "@/lib/flashcard-export";

const HEADER = "#separator:Comma\n#html:false\n#columns:Front,Back,Tags\n#tags column:3\n";

describe("toCsv", () => {
  it("starts with the Anki file headers", () => {
    expect(ANKI_HEADER.join("\n") + "\n").toBe(HEADER);
    expect(toCsv([], "Topic")).toBe(HEADER);
  });

  it("writes one Front,Back,Tags row per card, tagged with the topic slug", () => {
    const csv = toCsv(
      [
        { front: "What is H2O?", back: "Water" },
        { front: "Symbol for gold", back: "Au" },
      ],
      "Basic Chemistry",
    );
    expect(csv).toBe(`${HEADER}What is H2O?,Water,basic-chemistry\nSymbol for gold,Au,basic-chemistry\n`);
  });

  it("quotes fields with commas, double quotes and line breaks", () => {
    const csv = toCsv([{ front: 'Say "hi", then wave', back: "Line one\nLine two\r\nLine three" }], "x");
    expect(csv.slice(HEADER.length)).toBe('"Say ""hi"", then wave","Line one\nLine two\r\nLine three",x\n');
  });

  it("keeps Bahasa Melayu and other Unicode text unchanged", () => {
    const csv = toCsv([{ front: "Apakah fotosintesis?", back: "Proses tumbuhan menghasilkan makanan — guna cahaya ☀️" }], "Sains");
    expect(csv).toContain("Apakah fotosintesis?,Proses tumbuhan menghasilkan makanan — guna cahaya ☀️,sains\n");
  });

  it("writes text as-is, without a spreadsheet formula prefix", () => {
    expect(toCsv([{ front: "=1+1", back: "2" }], "math").slice(HEADER.length)).toBe("=1+1,2,math\n");
  });
});

describe("csvField", () => {
  it("leaves plain text alone and quotes anything risky", () => {
    expect(csvField("plain")).toBe("plain");
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('a"b')).toBe('"a""b"');
    expect(csvField("a\rb")).toBe('"a\rb"');
  });
});

describe("slugify / exportFilename", () => {
  it("builds a lower-case ASCII slug", () => {
    expect(slugify("  Sel & Biologi: Asas!  ")).toBe("sel-biologi-asas");
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(60);
    expect(slugify(`${"a".repeat(59)} b`)).not.toMatch(/-$/);
  });

  it("names the file after the topic", () => {
    expect(exportFilename("Data Structures")).toBe("learnpath-data-structures-flashcards.csv");
  });

  it("falls back to a generic name when the topic has no usable characters", () => {
    expect(exportFilename("")).toBe("learnpath-flashcards.csv");
    expect(exportFilename("光合作用")).toBe("learnpath-flashcards.csv");
    expect(exportFilename("../../etc/passwd")).toBe("learnpath-etc-passwd-flashcards.csv");
  });
});
