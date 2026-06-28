import { DEFAULT_LOCALE, type Locale, LOCALES } from "./const";

const MERGED = {
  _thisLanguage: ["🇬🇧 English", "🇪🇸 Español"],
  clickMe: ["Click me x{count}", "Haz clic en mí x{count}"],
  hello: ["Hello", "Hola"],
  about: ["About", "Acerca de"],
  toggleDarkMode: ["Toggle Dark Mode", "Alternar modo oscuro"],
  home: ["Home", "Inicio"],
  username: ["Username", "Nombre de usuario"],
  password: ["Password", "Contraseña"],
  dataSubmittedSuccessfully: ["Data submitted successfully: {count}", "Datos enviados con éxito: {count}"],
  common: {
    empty: ["Empty", "Vacío"],
    hidePassword: ["Hide password", "Ocultar contraseña"],
    showPassword: ["Show password", "Mostrar contraseña"],
    hold: ["Hold", "Mantener"],
    submit: ["Submit", "Enviar"],
    usernamePlaceholder: ["Enter your username", "Ingrese su nombre de usuario"],
    passwordPlaceholder: ["Enter your password", "Ingrese su contraseña"],
  },
  currencies: {
    name: ["Currency", "Moneda"],
    ticker: ["Ticker", "Símbolo"],
    USD: ["US Dollar", "Dólar estadounidense"],
    EUR: ["Euro", "Euro"],
    JPY: ["Japanese Yen", "Yen japonés"],
    GBP: ["British Pound", "Libra esterlina"],
    AUD: ["Australian Dollar", "Dólar australiano"],
    CAD: ["Canadian Dollar", "Dólar canadiense"],
    CHF: ["Swiss Franc", "Franco suizo"],
    CNY: ["Chinese Yuan", "Yuan chino"],
    SEK: ["Swedish Krona", "Corona sueca"],
    NZD: ["New Zealand Dollar", "Dólar neozelandés"],
  },
} as const satisfies GeneralMergedVocabType;
type MergedVocabLeaf = [string, string]; // TODO what will you do when there are 20 languages?

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
    es: extractVocabulary(MERGED, "es"),
  } satisfies { [key in Locale]: ExtractedVocab<typeof MERGED> },
}));

/**
 * Schema of the vocab to help the message key typecheck.
 *
 * See [Explanation](./EXPLANATION.md) for why we merge this.
 */
export type MessageSchema = ExtractedVocab<typeof MERGED>;
