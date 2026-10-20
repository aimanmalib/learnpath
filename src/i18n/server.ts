import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, detectLocale, isLocale, parseAcceptLanguage, type Locale } from "./config";

/** Locale for the first server render: the visitor's saved choice, else their browser language. */
export async function getRequestLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return detectLocale(parseAcceptLanguage((await headers()).get("accept-language")));
}
