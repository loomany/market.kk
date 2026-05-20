import {
  defaultLocale,
  supportedLocaleCodes,
  type Locale,
} from "./localeConfig";

export type StaticRouteKey =
  | "home"
  | "studio"
  | "features"
  | "blog"
  | "platforms"
  | "useCases"
  | "aiProductPhotoStudio"
  | "productPhotoForMarketplaces"
  | "productVideoGenerator"
  | "backgroundGenerator"
  | "fashionModelPhotos"
  | "jewelryProductPhotos"
  | "cost"
  | "privacy"
  | "terms"
  | "acceptableUse"
  | "dataDeletion"
  | "aiSummary"
  | "howItWorks"
  | "quality"
  | "faq";

type RouteSlugMap = Record<StaticRouteKey, Record<Locale, string>>;

const sameSlug = (slug: string) =>
  Object.fromEntries(supportedLocaleCodes.map((locale) => [locale, slug])) as Record<
    Locale,
    string
  >;

export const routeSlugs: RouteSlugMap = {
  home: sameSlug(""),
  studio: sameSlug("studio"),
  features: sameSlug("features"),
  blog: sameSlug("blog"),
  platforms: sameSlug("platforms"),
  useCases: sameSlug("use-cases"),
  aiProductPhotoStudio: {
    ...sameSlug("ai-product-photo-studio"),
    ru: "ii-studiya-tovarnyh-foto",
    kk: "ai-onim-foto-studiyasi",
    ky: "ai-tovar-foto-studiyasy",
    uz: "ai-mahsulot-foto-studiyasi",
    tg: "ai-studiya-aks-tovar",
  },
  productPhotoForMarketplaces: {
    ...sameSlug("product-photo-for-marketplaces"),
    ru: "foto-tovarov-dlya-marketpleysov",
    kk: "marketpleisterge-onim-fotosy",
    ky: "marketpleyster-uchun-tovar-fotosu",
    uz: "marketpleys-uchun-mahsulot-fotosi",
    tg: "aks-tovar-baroi-marketpleys",
  },
  productVideoGenerator: {
    ...sameSlug("product-video-generator"),
    ru: "generator-video-tovara",
    kk: "onim-video-generator",
    ky: "tovar-video-generator",
    uz: "mahsulot-video-generator",
    tg: "generator-video-tovar",
  },
  backgroundGenerator: {
    ...sameSlug("background-generator"),
    ru: "generator-fona-dlya-tovara",
    kk: "onim-fon-generator",
    ky: "tovar-fon-generator",
    uz: "mahsulot-fon-generator",
    tg: "generator-fon-tovar",
  },
  fashionModelPhotos: {
    ...sameSlug("fashion-model-photos"),
    ru: "foto-odezhdy-na-ai-modeli",
    kk: "kiim-ai-model-fotosy",
    ky: "kiyim-ai-model-fotosu",
    uz: "kiyim-ai-model-fotosi",
    tg: "libos-dar-ai-model",
  },
  jewelryProductPhotos: {
    ...sameSlug("jewelry-product-photos"),
    ru: "foto-bizhuterii-dlya-marketpleysa",
    kk: "zergerlik-onim-fotosy",
    ky: "zer-buyum-fotosu",
    uz: "taqinchoq-mahsulot-fotosi",
    tg: "aks-zeboi-baroi-marketpleys",
  },
  cost: sameSlug("cost"),
  privacy: sameSlug("privacy"),
  terms: sameSlug("terms"),
  acceptableUse: sameSlug("acceptable-use"),
  dataDeletion: sameSlug("data-deletion"),
  aiSummary: sameSlug("ai-summary"),
  howItWorks: sameSlug("how-it-works"),
  quality: sameSlug("quality"),
  faq: sameSlug("faq"),
};

export function getRouteSlug(locale: Locale, key: StaticRouteKey): string {
  return routeSlugs[key][locale] || routeSlugs[key][defaultLocale];
}

export function getLocalizedPath(locale: Locale, key: StaticRouteKey): string {
  const slug = getRouteSlug(locale, key);
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

export function getStaticRouteBySlug(locale: Locale, slug: string) {
  return (Object.keys(routeSlugs) as StaticRouteKey[]).find(
    (key) => routeSlugs[key][locale] === slug
  );
}

export function buildLocalizedPathMap(
  key: StaticRouteKey
): Record<Locale, string> {
  return Object.fromEntries(
    supportedLocaleCodes.map((locale) => [locale, getLocalizedPath(locale, key)])
  ) as Record<Locale, string>;
}
