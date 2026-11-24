/**
 * Flashcard export to a CSV file that Anki can import (File > Import).
 *
 * Format follows the Anki manual "Importing > Text files": `#key:value` header
 * lines at the top of the file (Anki 2.1.54+), UTF-8, and fields that contain
 * the separator, a double quote or a line break wrapped in double quotes with
 * inner quotes doubled (RFC 4180). Card text is written as-is (no spreadsheet
 * formula escaping): the target is Anki, where a prefix would show on the card.
 */

export interface ExportableCard {
  front: string;
  back: string;
}

export const CSV_MIME_TYPE = "text/csv;charset=utf-8";
export const EXPORT_FILE_PREFIX = "learnpath";
export const EXPORT_FILE_SUFFIX = "flashcards";
const SEPARATOR = ",";
const LINE_END = "\n";
const COLUMNS = ["Front", "Back", "Tags"] as const;
const SLUG_MAX_LENGTH = 60;

/** Header lines Anki reads before the first note. */
export const ANKI_HEADER = [
  "#separator:Comma",
  "#html:false",
  `#columns:${COLUMNS.join(SEPARATOR)}`,
  `#tags column:${COLUMNS.indexOf("Tags") + 1}`,
] as const;

/** Lower-case ASCII slug: "Sel & Biologi Asas" -> "sel-biologi-asas". Empty when nothing usable is left. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

/** Quote a field when it holds the separator, a double quote or a line break. */
export function csvField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Build the CSV text: Anki header lines, then one `Front,Back,Tags` row per card. */
export function toCsv(cards: readonly ExportableCard[], topic: string): string {
  const tag = slugify(topic);
  const rows = cards.map((card) => [card.front, card.back, tag].map(csvField).join(SEPARATOR));
  return [...ANKI_HEADER, ...rows].map((line) => line + LINE_END).join("");
}

/** Safe download name: `learnpath-<topic-slug>-flashcards.csv`, or `learnpath-flashcards.csv` without a usable topic. */
export function exportFilename(topic: string): string {
  const slug = slugify(topic);
  return [EXPORT_FILE_PREFIX, slug, EXPORT_FILE_SUFFIX].filter(Boolean).join("-") + ".csv";
}
