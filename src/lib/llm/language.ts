/**
 * Output language for the model.
 *
 * Every API route reads `language` from the request body ("en" or "ms") and
 * adds the instruction below to its prompts, so quizzes, flashcards and
 * roadmaps come back in the language the visitor is reading.
 *
 * The Malay instruction asks for standard Malaysian spelling and lists common
 * Indonesian words to avoid: models trained mostly on Indonesian web text
 * drift into it otherwise.
 */
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

export function outputLanguage(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  ms: "Bahasa Melayu (Malaysian Malay)",
};

const INSTRUCTIONS: Record<Locale, string> = {
  en: "Write every piece of text meant for the learner in English.",
  ms: [
    "Write every piece of text meant for the learner in Bahasa Melayu as used in Malaysia, with standard Dewan Bahasa dan Pustaka spelling.",
    "Do not use Indonesian words or spelling. For example write: kerana (not karena), hantar (not kirim), muat turun (not unduh), semasa or ketika (not saat), mesti or perlu (not harus), wang (not uang), percuma (not gratis), boleh (not bisa), berjaya (not berhasil), nombor (not nomor), cuba (not coba), sila (not silakan).",
    "Keep standard scientific and technical terms that Malaysian textbooks use.",
  ].join(" "),
};

/** Sentence appended to a system prompt. */
export function languageInstruction(locale: Locale): string {
  const keepJson = "If the answer is JSON, keep the JSON keys exactly as specified in English; only the values are written in the chosen language.";
  return `${INSTRUCTIONS[locale]} ${keepJson}`;
}

/** Short reminder placed in the user message as well, for models that weigh system prompts lightly. */
export function languageReminder(locale: Locale): string {
  return `Answer language: ${LANGUAGE_NAMES[locale]}.`;
}
