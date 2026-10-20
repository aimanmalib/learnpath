import type { en } from "./en";

/** Same shape as the English messages, with every leaf widened to `string`. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Messages = Widen<typeof en>;

/** Every dotted key path that ends at a string, e.g. "quiz.generate". */
export type MessageKey = Paths<Messages>;

type Paths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
