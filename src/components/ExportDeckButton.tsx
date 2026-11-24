"use client";
import { Download } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { CSV_MIME_TYPE, exportFilename, toCsv, type ExportableCard } from "@/lib/flashcard-export";

interface ExportDeckButtonProps {
  cards: readonly ExportableCard[];
  topic: string;
  className?: string;
}

/** Downloads the current deck as an Anki-importable CSV file. Renders nothing for an empty deck. */
export function ExportDeckButton({ cards, topic, className = "btn btn-ghost" }: ExportDeckButtonProps) {
  const { t } = useI18n();
  if (cards.length === 0) return null;

  const download = () => {
    const blob = new Blob([toCsv(cards, topic)], { type: CSV_MIME_TYPE });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFilename(topic);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Let the browser start the download before the object URL is released.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <button
      type="button"
      onClick={download}
      className={className}
      aria-label={t("flashcards.exportCsvLabel", { total: cards.length })}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {t("flashcards.exportCsv")}
    </button>
  );
}
