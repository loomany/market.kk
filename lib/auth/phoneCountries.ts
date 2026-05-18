import type { Locale } from "@/lib/i18n/localeConfig";

export type PhoneCountry = {
  id: string;
  dialCode: string;
  nationalDigits: number;
  /** # = one digit; empty = free-form (INTL) */
  mask: string;
  name: string;
  locales?: Locale[];
};

/** Free-form international entry when the country is not in the list */
export const FREE_PHONE_COUNTRY_ID = "INTL";

export const FREE_PHONE_COUNTRY: PhoneCountry = {
  id: FREE_PHONE_COUNTRY_ID,
  dialCode: "+",
  nationalDigits: 15,
  mask: "",
  name: "Другая страна",
};

/** CIS-first, then locales we support on the site */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    id: "RU",
    dialCode: "+7",
    nationalDigits: 10,
    mask: "(###) ###-##-##",
    name: "Россия",
    locales: ["ru"],
  },
  {
    id: "KZ",
    dialCode: "+7",
    nationalDigits: 10,
    mask: "(###) ###-##-##",
    name: "Казахстан",
    locales: ["kk"],
  },
  {
    id: "KG",
    dialCode: "+996",
    nationalDigits: 9,
    mask: "(###) ##-##-##",
    name: "Кыргызстан",
    locales: ["ky"],
  },
  {
    id: "UZ",
    dialCode: "+998",
    nationalDigits: 9,
    mask: "## ### ## ##",
    name: "Узбекистан",
    locales: ["uz"],
  },
  {
    id: "TJ",
    dialCode: "+992",
    nationalDigits: 9,
    mask: "## ### ####",
    name: "Таджикистан",
    locales: ["tg"],
  },
  {
    id: "TR",
    dialCode: "+90",
    nationalDigits: 10,
    mask: "(###) ### ## ##",
    name: "Турция",
    locales: ["tr"],
  },
  {
    id: "AZ",
    dialCode: "+994",
    nationalDigits: 9,
    mask: "## ### ## ##",
    name: "Азербайджан",
    locales: ["az"],
  },
  {
    id: "UA",
    dialCode: "+380",
    nationalDigits: 9,
    mask: "## ### ## ##",
    name: "Украина",
    locales: ["uk"],
  },
  {
    id: "PL",
    dialCode: "+48",
    nationalDigits: 9,
    mask: "### ### ###",
    name: "Польша",
    locales: ["pl"],
  },
  {
    id: "DE",
    dialCode: "+49",
    nationalDigits: 10,
    mask: "### #### ####",
    name: "Германия",
    locales: ["de"],
  },
  {
    id: "FR",
    dialCode: "+33",
    nationalDigits: 9,
    mask: "# ## ## ## ##",
    name: "Франция",
    locales: ["fr"],
  },
  {
    id: "ES",
    dialCode: "+34",
    nationalDigits: 9,
    mask: "### ### ###",
    name: "Испания",
    locales: ["es"],
  },
  {
    id: "PT",
    dialCode: "+351",
    nationalDigits: 9,
    mask: "### ### ###",
    name: "Португалия",
    locales: ["pt"],
  },
  {
    id: "IT",
    dialCode: "+39",
    nationalDigits: 10,
    mask: "### ### ####",
    name: "Италия",
    locales: ["it"],
  },
  {
    id: "AE",
    dialCode: "+971",
    nationalDigits: 9,
    mask: "## ### ####",
    name: "ОАЭ",
    locales: ["ar"],
  },
  {
    id: "IN",
    dialCode: "+91",
    nationalDigits: 10,
    mask: "##### #####",
    name: "Индия",
    locales: ["hi"],
  },
  {
    id: "ID",
    dialCode: "+62",
    nationalDigits: 10,
    mask: "### #### ####",
    name: "Индонезия",
    locales: ["id"],
  },
  {
    id: "VN",
    dialCode: "+84",
    nationalDigits: 9,
    mask: "## ### ## ##",
    name: "Вьетнам",
    locales: ["vi"],
  },
  {
    id: "CN",
    dialCode: "+86",
    nationalDigits: 11,
    mask: "### #### ####",
    name: "Китай",
    locales: ["zh"],
  },
  {
    id: "US",
    dialCode: "+1",
    nationalDigits: 10,
    mask: "(###) ###-####",
    name: "США",
    locales: ["en"],
  },
];

export function isFreePhoneCountry(countryOrId: PhoneCountry | string) {
  const id = typeof countryOrId === "string" ? countryOrId : countryOrId.id;
  return id === FREE_PHONE_COUNTRY_ID;
}

export function getPhoneCountryById(id: string): PhoneCountry {
  if (isFreePhoneCountry(id)) return FREE_PHONE_COUNTRY;
  return PHONE_COUNTRIES.find((c) => c.id === id) ?? PHONE_COUNTRIES[0];
}

export function listPhoneCountryOptions(): PhoneCountry[] {
  return [FREE_PHONE_COUNTRY, ...PHONE_COUNTRIES];
}

export function resolveDefaultCountryId(locale?: string | null): string {
  if (!locale) return "RU";
  const match = PHONE_COUNTRIES.find((c) => c.locales?.includes(locale as Locale));
  return match?.id ?? "RU";
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function applyPhoneMask(digits: string, mask: string): string {
  const only = digits.replace(/\D/g, "");
  if (!mask) return only;

  let index = 0;
  let result = "";

  for (const char of mask) {
    if (index >= only.length) break;
    if (char === "#") {
      result += only[index++];
    } else {
      result += char;
    }
  }

  return result;
}

export function maskPlaceholder(mask: string): string {
  if (!mask) return "+1234567890";
  return mask.replace(/#/g, "0");
}

export function formatE164(country: PhoneCountry, nationalDigits: string): string {
  if (isFreePhoneCountry(country)) {
    const digits = digitsOnly(nationalDigits).slice(0, country.nationalDigits);
    return digits ? `+${digits}` : "";
  }

  const dial = digitsOnly(country.dialCode);
  const national = digitsOnly(nationalDigits).slice(0, country.nationalDigits);
  return `+${dial}${national}`;
}

export function formatFreePhoneDisplay(value: string): string {
  const digits = digitsOnly(value).slice(0, FREE_PHONE_COUNTRY.nationalDigits);
  return digits ? `+${digits}` : "";
}

export function parseE164Phone(
  value: string,
  preferredCountryId?: string
): { countryId: string; nationalDigits: string } {
  const raw = value.trim();
  if (!raw) {
    return {
      countryId: preferredCountryId ?? "RU",
      nationalDigits: "",
    };
  }

  const normalized = raw.replace(/[^\d+]/g, "").replace(/^8(\d{10})$/, "+7$1");
  const digits = digitsOnly(normalized);

  if (preferredCountryId && isFreePhoneCountry(preferredCountryId)) {
    return {
      countryId: FREE_PHONE_COUNTRY_ID,
      nationalDigits: digits.slice(0, FREE_PHONE_COUNTRY.nationalDigits),
    };
  }

  const ordered = [...PHONE_COUNTRIES].sort(
    (a, b) => digitsOnly(b.dialCode).length - digitsOnly(a.dialCode).length
  );

  for (const country of ordered) {
    const dial = digitsOnly(country.dialCode);
    if (digits.startsWith(dial)) {
      return {
        countryId: country.id,
        nationalDigits: digits.slice(dial.length, dial.length + country.nationalDigits),
      };
    }
  }

  if (preferredCountryId) {
    const country = getPhoneCountryById(preferredCountryId);
    const dial = digitsOnly(country.dialCode);
    const national = digits.startsWith(dial)
      ? digits.slice(dial.length)
      : digits;
    return {
      countryId: country.id,
      nationalDigits: national.slice(0, country.nationalDigits),
    };
  }

  return { countryId: "RU", nationalDigits: digits.slice(-10) };
}

export function phoneHelperText(country: PhoneCountry): string {
  if (isFreePhoneCountry(country)) {
    return "Введите номер с кодом страны, например +49 170 1234567 (8–15 цифр).";
  }
  return `${country.dialCode} — введите ${country.nationalDigits} цифр мобильного номера.`;
}

const FREE_PHONE_MIN_DIGITS = 8;

export function isPhoneComplete(country: PhoneCountry, nationalDigits: string): boolean {
  if (isFreePhoneCountry(country)) {
    const len = digitsOnly(nationalDigits).length;
    return len >= FREE_PHONE_MIN_DIGITS && len <= country.nationalDigits;
  }
  return digitsOnly(nationalDigits).length === country.nationalDigits;
}
