import { DEFAULT_LOCALE, type Locale, LOCALES } from "./const";

const MERGED = {
  common: {
    empty: ["Empty"],
    hidePassword: ["Hide password"],
    showPassword: ["Show password"],
    hold: ["Hold"],
  },
} as const satisfies GeneralMergedVocabType;
type MergedVocabLeaf = [string]; // TODO what will you do when there are 20 languages?

type GeneralMergedVocabType = {
  [x: string]: MergedVocabLeaf | GeneralMergedVocabType;
};
type ExtractedVocab<T> = {
  [K in keyof T]: T[K] extends MergedVocabLeaf ? string : ExtractedVocab<T[K]>;
};
const extractVocabulary = <T extends GeneralMergedVocabType>(obj: T, locale: Locale): ExtractedVocab<T> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[LOCALES.indexOf(locale)] : extractVocabulary(value, locale),
    ]),
  ) as ExtractedVocab<T>;
};

export default defineI18nConfig(() => ({
  legacy: false,
  locale: DEFAULT_LOCALE,
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: extractVocabulary(MERGED, "en"),
  } satisfies { [key in Locale]: ExtractedVocab<typeof MERGED> },
}));

/**
 * Schema of the vocab to help the message key typecheck.
 *
 * See [Explanation](./EXPLANATION.md) for why we merge this.
 */
export type MessageSchema = ExtractedVocab<typeof MERGED>;
