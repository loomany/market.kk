export const localeCodes = [
  "ru",
  "en",
  "kk",
  "ky",
  "uz",
  "tg",
  "tr",
  "az",
  "ar",
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "pl",
  "uk",
  "hi",
  "id",
  "vi",
  "zh",
] as const;

export type Locale = (typeof localeCodes)[number];
export type TextDirection = "ltr" | "rtl";
export type TranslationStatus =
  | "published"
  | "draft"
  | "machine_translated"
  | "needs_review"
  | "ready_for_review"
  | "noindex";

export type LocaleConfig = {
  code: Locale;
  hreflang: string;
  label: string;
  nativeLabel: string;
  dir: TextDirection;
  defaultCurrency?: string;
  marketRegion: string;
  isRtl: boolean;
};

export const locales: LocaleConfig[] = [
  {
    code: "ru",
    hreflang: "ru",
    label: "Russian",
    nativeLabel: "Русский",
    dir: "ltr",
    defaultCurrency: "KZT",
    marketRegion: "CIS",
    isRtl: false,
  },
  {
    code: "en",
    hreflang: "en",
    label: "English",
    nativeLabel: "English",
    dir: "ltr",
    defaultCurrency: "USD",
    marketRegion: "Global",
    isRtl: false,
  },
  {
    code: "kk",
    hreflang: "kk",
    label: "Kazakh",
    nativeLabel: "Қазақша",
    dir: "ltr",
    defaultCurrency: "KZT",
    marketRegion: "Kazakhstan",
    isRtl: false,
  },
  {
    code: "ky",
    hreflang: "ky",
    label: "Kyrgyz",
    nativeLabel: "Кыргызча",
    dir: "ltr",
    defaultCurrency: "KGS",
    marketRegion: "Kyrgyzstan",
    isRtl: false,
  },
  {
    code: "uz",
    hreflang: "uz",
    label: "Uzbek",
    nativeLabel: "O‘zbekcha",
    dir: "ltr",
    defaultCurrency: "UZS",
    marketRegion: "Uzbekistan",
    isRtl: false,
  },
  {
    code: "tg",
    hreflang: "tg",
    label: "Tajik",
    nativeLabel: "Тоҷикӣ",
    dir: "ltr",
    defaultCurrency: "TJS",
    marketRegion: "Tajikistan",
    isRtl: false,
  },
  {
    code: "tr",
    hreflang: "tr",
    label: "Turkish",
    nativeLabel: "Türkçe",
    dir: "ltr",
    defaultCurrency: "TRY",
    marketRegion: "Turkey",
    isRtl: false,
  },
  {
    code: "az",
    hreflang: "az",
    label: "Azerbaijani",
    nativeLabel: "Azərbaycanca",
    dir: "ltr",
    defaultCurrency: "AZN",
    marketRegion: "Azerbaijan",
    isRtl: false,
  },
  {
    code: "ar",
    hreflang: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    dir: "rtl",
    defaultCurrency: "USD",
    marketRegion: "MENA",
    isRtl: true,
  },
  {
    code: "es",
    hreflang: "es",
    label: "Spanish",
    nativeLabel: "Español",
    dir: "ltr",
    defaultCurrency: "EUR",
    marketRegion: "Spain and LatAm",
    isRtl: false,
  },
  {
    code: "pt",
    hreflang: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    dir: "ltr",
    defaultCurrency: "EUR",
    marketRegion: "Portugal and Brazil",
    isRtl: false,
  },
  {
    code: "fr",
    hreflang: "fr",
    label: "French",
    nativeLabel: "Français",
    dir: "ltr",
    defaultCurrency: "EUR",
    marketRegion: "France",
    isRtl: false,
  },
  {
    code: "de",
    hreflang: "de",
    label: "German",
    nativeLabel: "Deutsch",
    dir: "ltr",
    defaultCurrency: "EUR",
    marketRegion: "Germany",
    isRtl: false,
  },
  {
    code: "it",
    hreflang: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    dir: "ltr",
    defaultCurrency: "EUR",
    marketRegion: "Italy",
    isRtl: false,
  },
  {
    code: "pl",
    hreflang: "pl",
    label: "Polish",
    nativeLabel: "Polski",
    dir: "ltr",
    defaultCurrency: "PLN",
    marketRegion: "Poland",
    isRtl: false,
  },
  {
    code: "uk",
    hreflang: "uk",
    label: "Ukrainian",
    nativeLabel: "Українська",
    dir: "ltr",
    defaultCurrency: "UAH",
    marketRegion: "Ukraine",
    isRtl: false,
  },
  {
    code: "hi",
    hreflang: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    dir: "ltr",
    defaultCurrency: "INR",
    marketRegion: "India",
    isRtl: false,
  },
  {
    code: "id",
    hreflang: "id",
    label: "Indonesian",
    nativeLabel: "Bahasa Indonesia",
    dir: "ltr",
    defaultCurrency: "IDR",
    marketRegion: "Indonesia",
    isRtl: false,
  },
  {
    code: "vi",
    hreflang: "vi",
    label: "Vietnamese",
    nativeLabel: "Tiếng Việt",
    dir: "ltr",
    defaultCurrency: "VND",
    marketRegion: "Vietnam",
    isRtl: false,
  },
  {
    code: "zh",
    hreflang: "zh-Hans",
    label: "Chinese Simplified",
    nativeLabel: "简体中文",
    dir: "ltr",
    defaultCurrency: "CNY",
    marketRegion: "China",
    isRtl: false,
  },
];

export function isLocale(value: string): value is Locale {
  return localeCodes.includes(value as Locale);
}

export function getLocaleConfig(locale: Locale): LocaleConfig {
  return locales.find((item) => item.code === locale) ?? locales[0];
}

export const localeHreflangs = Object.fromEntries(
  locales.map((locale) => [locale.code, locale.hreflang])
) as Record<Locale, string>;
