/**
 * Generates data/seo/audiencePages.ts
 * Run: node scripts/seo/build-audience-pages.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../data/seo/audiencePages.ts");

const HUB = { ru: "dlya-kogo", en: "who-it-is-for", kk: "kimge" };

const STATIC = {
  ru: {
    home: "/ru",
    cost: "/ru/cost",
    howItWorks: "/ru/how-it-works",
    quality: "/ru/quality",
    studio: "/ru/ii-studiya-tovarnyh-foto",
    marketplacePhotos: "/ru/foto-tovarov-dlya-marketpleysov",
    fashionPhotos: "/ru/foto-odezhdy-na-ai-modeli",
    jewelryPhotos: "/ru/foto-bizhuterii-dlya-marketpleysa",
    useCases: "/ru/use-cases",
    platforms: "/ru/platforms",
  },
  en: {
    home: "/en",
    cost: "/en/cost",
    howItWorks: "/en/how-it-works",
    quality: "/en/quality",
    studio: "/en/ai-product-photo-studio",
    marketplacePhotos: "/en/product-photo-for-marketplaces",
    fashionPhotos: "/en/fashion-model-photos",
    jewelryPhotos: "/en/jewelry-product-photos",
    useCases: "/en/use-cases",
    platforms: "/en/platforms",
  },
  kk: {
    home: "/kk",
    cost: "/kk/cost",
    howItWorks: "/kk/how-it-works",
    quality: "/kk/quality",
    studio: "/kk/ai-onim-foto-studiyasi",
    marketplacePhotos: "/kk/marketpleisterge-onim-fotosy",
    fashionPhotos: "/kk/kiim-ai-model-fotosy",
    jewelryPhotos: "/kk/zergerlik-onim-fotosy",
    useCases: "/kk/use-cases",
    platforms: "/kk/platforms",
  },
};

/** @typedef {{ question: string; answer: string }} FaqItem */

/**
 * @typedef {object} AudienceCtx
 * @property {string} id
 * @property {{ ru: string; en: string; kk: string }} slug
 * @property {{ ru: string; en: string; kk: string }} chip
 * @property {{ ru: string; en: string; kk: string }} title
 * @property {{ ru: string; en: string; kk: string }} h1
 * @property {{ ru: string[]; en: string[]; kk: string[] }} relatedUseCases
 * @property {{ ru: string[]; en: string[]; kk: string[] }} relatedPlatforms
 */

/** @type {AudienceCtx[]} */
const AUDIENCES = [
  {
    id: "marketplace-sellers",
    slug: { ru: "prodavtsy-marketpleysov", en: "marketplace-sellers", kk: "marketplace-satushylary" },
    chip: { ru: "продавцы маркетплейсов", en: "marketplace sellers", kk: "маркетплейс сатушылары" },
    title: {
      ru: "AI-фото товаров для продавцов маркетплейсов",
      en: "AI product photos for marketplace sellers",
      kk: "Маркетплейс сатушыларына AI тауар фотосы",
    },
    h1: {
      ru: "AI-фото товаров для продавцов маркетплейсов",
      en: "AI product photos for marketplace sellers",
      kk: "Маркетплейс сатушыларына AI тауар фотосы",
    },
    relatedUseCases: {
      ru: ["tochnaya-tovarnaya-kartochka", "belyy-fon-dlya-marketpleysa", "foto-dlya-ecommerce-kataloga"],
      en: ["exact-product-card", "marketplace-white-background", "ecommerce-catalog-photos"],
      kk: ["exact-product-card", "marketplace-white-background", "ecommerce-catalog-photos"],
    },
    relatedPlatforms: {
      ru: ["kaspi-foto-tovarov", "wildberries-foto-tovarov", "ozon-foto-tovarov"],
      en: ["kaspi-product-photos", "wildberries-product-photos", "ozon-product-photos"],
      kk: ["kaspi-product-photos", "wildberries-product-photos", "ozon-product-photos"],
    },
  },
  {
    id: "clothing-sellers",
    slug: { ru: "prodavtsy-odezhdy", en: "clothing-sellers", kk: "kiim-satushylary" },
    chip: { ru: "продавцы одежды", en: "clothing sellers", kk: "киім сатушылары" },
    title: {
      ru: "AI-фото одежды на модели для продавцов одежды",
      en: "AI clothing on model photos for apparel sellers",
      kk: "Киім сатушыларына AI модельде фото",
    },
    h1: {
      ru: "AI-фото одежды на модели для продавцов одежды",
      en: "AI clothing on model photos for apparel sellers",
      kk: "Киім сатушыларына AI модельде фото",
    },
    relatedUseCases: {
      ru: ["odezhda-na-ai-modeli", "bele-na-ai-modeli", "plus-size-model-foto"],
      en: ["clothing-on-ai-model", "lingerie-on-ai-model", "plus-size-model-photos"],
      kk: ["clothing-on-ai-model", "lingerie-on-ai-model", "plus-size-model-photos"],
    },
    relatedPlatforms: {
      ru: ["wildberries-foto-tovarov", "ozon-foto-tovarov", "shopify-foto-tovarov"],
      en: ["wildberries-product-photos", "ozon-product-photos", "shopify-product-photos"],
      kk: ["wildberries-product-photos", "ozon-product-photos", "shopify-product-photos"],
    },
  },
  {
    id: "jewelry-sellers",
    slug: { ru: "prodavtsy-bizhuterii", en: "jewelry-sellers", kk: "bizhuteriya-satushylary" },
    chip: { ru: "продавцы бижутерии", en: "jewelry sellers", kk: "бижутерия сатушылары" },
    title: {
      ru: "AI-фото бижутерии и украшений для карточек товара",
      en: "AI jewelry and accessory photos for product listings",
      kk: "Әшекей сатушыларына AI тауар фотосы",
    },
    h1: {
      ru: "AI-фото бижутерии и украшений для карточек товара",
      en: "AI jewelry and accessory photos for product listings",
      kk: "Әшекей сатушыларына AI тауар фотосы",
    },
    relatedUseCases: {
      ru: ["foto-bizhuterii", "foto-sumok", "kreativnaya-scena-tovara"],
      en: ["jewelry-product-photos", "bags-product-photos", "creative-product-scene"],
      kk: ["jewelry-product-photos", "bags-product-photos", "creative-product-scene"],
    },
    relatedPlatforms: {
      ru: ["kaspi-foto-tovarov", "etsy-foto-tovarov", "ebay-foto-tovarov"],
      en: ["kaspi-product-photos", "etsy-product-photos", "ebay-product-photos"],
      kk: ["kaspi-product-photos", "etsy-product-photos", "ebay-product-photos"],
    },
  },
  {
    id: "suppliers",
    slug: { ru: "postavshchiki", en: "suppliers", kk: "zhabdyktaushylar" },
    chip: { ru: "поставщики", en: "suppliers", kk: "жеткізушілер" },
    title: {
      ru: "AI-контент товаров для поставщиков",
      en: "AI product content for suppliers and wholesalers",
      kk: "Жеткізушілерге AI тауар контенті",
    },
    h1: {
      ru: "AI-контент товаров для поставщиков",
      en: "AI product content for suppliers and wholesalers",
      kk: "Жеткізушілерге AI тауар контенті",
    },
    relatedUseCases: {
      ru: ["foto-kataloga-postavshchika", "foto-dlya-ecommerce-kataloga", "tochnaya-tovarnaya-kartochka"],
      en: ["supplier-catalog-photos", "ecommerce-catalog-photos", "exact-product-card"],
      kk: ["supplier-catalog-photos", "ecommerce-catalog-photos", "exact-product-card"],
    },
    relatedPlatforms: {
      ru: ["aliexpress-foto-tovarov", "temu-foto-tovarov", "shopify-foto-tovarov"],
      en: ["aliexpress-product-photos", "temu-product-photos", "shopify-product-photos"],
      kk: ["aliexpress-product-photos", "temu-product-photos", "shopify-product-photos"],
    },
  },
  {
    id: "showrooms",
    slug: { ru: "showroomy", en: "showrooms", kk: "showroomdar" },
    chip: { ru: "шоурумы", en: "showrooms", kk: "шоурумдар" },
    title: {
      ru: "AI-фото товаров для шоурумов",
      en: "AI product photos for fashion showrooms",
      kk: "Шоурумдарға AI тауар фотосы",
    },
    h1: {
      ru: "AI-фото товаров для шоурумов",
      en: "AI product photos for fashion showrooms",
      kk: "Шоурумдарға AI тауар фотосы",
    },
    relatedUseCases: {
      ru: ["foto-tovarov-shouruma", "odezhda-na-ai-modeli", "foto-tovara-dlya-instagram"],
      en: ["showroom-product-photos", "clothing-on-ai-model", "instagram-product-photos"],
      kk: ["showroom-product-photos", "clothing-on-ai-model", "instagram-product-photos"],
    },
    relatedPlatforms: {
      ru: ["instagram-shop-foto-tovarov", "shopify-foto-tovarov", "wildberries-foto-tovarov"],
      en: ["instagram-shop-product-photos", "shopify-product-photos", "wildberries-product-photos"],
      kk: ["instagram-shop-product-photos", "shopify-product-photos", "wildberries-product-photos"],
    },
  },
  {
    id: "instagram-shops",
    slug: { ru: "instagram-magaziny", en: "instagram-shops", kk: "instagram-duken-der" },
    chip: { ru: "Instagram-магазины", en: "Instagram shops", kk: "Instagram дүкендері" },
    title: {
      ru: "AI-фото и видео товаров для Instagram-магазинов",
      en: "AI product photos and video for Instagram shops",
      kk: "Instagram дүкендеріне AI фото және бейне",
    },
    h1: {
      ru: "AI-фото и видео товаров для Instagram-магазинов",
      en: "AI product photos and video for Instagram shops",
      kk: "Instagram дүкендеріне AI фото және бейне",
    },
    relatedUseCases: {
      ru: ["foto-tovara-dlya-instagram", "reels-iz-foto-tovara", "kreativnaya-scena-tovara"],
      en: ["instagram-product-photos", "reels-from-product-image", "creative-product-scene"],
      kk: ["instagram-product-photos", "reels-from-product-image", "creative-product-scene"],
    },
    relatedPlatforms: {
      ru: ["instagram-shop-foto-tovarov", "tiktok-shop-foto-tovarov", "facebook-marketplace-foto-tovarov"],
      en: ["instagram-shop-product-photos", "tiktok-shop-product-photos", "facebook-marketplace-product-photos"],
      kk: ["instagram-shop-product-photos", "tiktok-shop-product-photos", "facebook-marketplace-product-photos"],
    },
  },
  {
    id: "online-stores",
    slug: { ru: "internet-magaziny", en: "online-stores", kk: "internet-duken-der" },
    chip: { ru: "интернет-магазины", en: "online stores", kk: "интернет-дүкендер" },
    title: {
      ru: "AI-фото товаров для интернет-магазинов",
      en: "AI product photos for online stores",
      kk: "Интернет-дүкендерге AI тауар фотосы",
    },
    h1: {
      ru: "AI-фото товаров для интернет-магазинов",
      en: "AI product photos for online stores",
      kk: "Интернет-дүкендерге AI тауар фотосы",
    },
    relatedUseCases: {
      ru: ["foto-dlya-ecommerce-kataloga", "ai-zamena-fona", "tochnaya-tovarnaya-kartochka"],
      en: ["ecommerce-catalog-photos", "ai-background-replacement", "exact-product-card"],
      kk: ["ecommerce-catalog-photos", "ai-background-replacement", "exact-product-card"],
    },
    relatedPlatforms: {
      ru: ["shopify-foto-tovarov", "amazon-foto-tovarov", "ozon-foto-tovarov"],
      en: ["shopify-product-photos", "amazon-product-photos", "ozon-product-photos"],
      kk: ["shopify-product-photos", "amazon-product-photos", "ozon-product-photos"],
    },
  },
  {
    id: "marketplace-managers",
    slug: { ru: "marketplace-menedzhery", en: "marketplace-managers", kk: "marketplace-menedzherler" },
    chip: { ru: "маркетплейс-менеджеры", en: "marketplace managers", kk: "marketplace менеджерлері" },
    title: {
      ru: "AI-инструменты для маркетплейс-менеджеров",
      en: "AI tools for marketplace content managers",
      kk: "Marketplace менеджерлеріне AI құралдары",
    },
    h1: {
      ru: "AI-инструменты для маркетплейс-менеджеров",
      en: "AI tools for marketplace content managers",
      kk: "Marketplace менеджерлеріне AI құралдары",
    },
    relatedUseCases: {
      ru: ["workflow-kontent-menedzhera", "belyy-fon-dlya-marketpleysa", "ochistka-tovarnogo-foto"],
      en: ["marketplace-content-manager-workflow", "marketplace-white-background", "product-photo-cleanup"],
      kk: ["marketplace-content-manager-workflow", "marketplace-white-background", "product-photo-cleanup"],
    },
    relatedPlatforms: {
      ru: ["kaspi-foto-tovarov", "wildberries-foto-tovarov", "ozon-foto-tovarov"],
      en: ["kaspi-product-photos", "wildberries-product-photos", "ozon-product-photos"],
      kk: ["kaspi-product-photos", "wildberries-product-photos", "ozon-product-photos"],
    },
  },
  {
    id: "photographers-content-managers",
    slug: {
      ru: "fotografy-kontent-menedzhery",
      en: "photographers-content-managers",
      kk: "fotograf-kontent-menedzherler",
    },
    chip: {
      ru: "фотографы / контент-менеджеры",
      en: "photographers / content managers",
      kk: "фотографтар / контент менеджерлері",
    },
    title: {
      ru: "AI-инструменты для фотографов и контент-менеджеров",
      en: "AI tools for photographers and content managers",
      kk: "Фотографтар мен контент менеджерлеріне AI",
    },
    h1: {
      ru: "AI-инструменты для фотографов и контент-менеджеров",
      en: "AI tools for photographers and content managers",
      kk: "Фотографтар мен контент менеджерлеріне AI",
    },
    relatedUseCases: {
      ru: ["ochistka-tovarnogo-foto", "ai-zamena-fona", "kreativnaya-scena-tovara"],
      en: ["product-photo-cleanup", "ai-background-replacement", "creative-product-scene"],
      kk: ["product-photo-cleanup", "ai-background-replacement", "creative-product-scene"],
    },
    relatedPlatforms: {
      ru: ["shopify-foto-tovarov", "instagram-shop-foto-tovarov", "etsy-foto-tovarov"],
      en: ["shopify-product-photos", "instagram-shop-product-photos", "etsy-product-photos"],
      kk: ["shopify-product-photos", "instagram-shop-product-photos", "etsy-product-photos"],
    },
  },
  {
    id: "small-ecommerce-teams",
    slug: { ru: "ecommerce-komandy", en: "small-ecommerce-teams", kk: "shaqin-ecommerce-komandalar" },
    chip: {
      ru: "небольшие ecommerce-команды",
      en: "small ecommerce teams",
      kk: "шағын ecommerce командалар",
    },
    title: {
      ru: "AI-контент товаров для небольших ecommerce-команд",
      en: "AI product content for small ecommerce teams",
      kk: "Шағын ecommerce командаларына AI контент",
    },
    h1: {
      ru: "AI-контент товаров для небольших ecommerce-команд",
      en: "AI product content for small ecommerce teams",
      kk: "Шағын ecommerce командаларына AI контент",
    },
    relatedUseCases: {
      ru: ["tovarnye-foto-dlya-malogo-biznesa", "foto-dlya-ecommerce-kataloga", "tochnaya-tovarnaya-kartochka"],
      en: ["small-business-product-photos", "ecommerce-catalog-photos", "exact-product-card"],
      kk: ["small-business-product-photos", "ecommerce-catalog-photos", "exact-product-card"],
    },
    relatedPlatforms: {
      ru: ["shopify-foto-tovarov", "instagram-shop-foto-tovarov", "olx-foto-tovarov"],
      en: ["shopify-product-photos", "instagram-shop-product-photos", "olx-product-photos"],
      kk: ["shopify-product-photos", "instagram-shop-product-photos", "olx-product-photos"],
    },
  },
];

/** Mirrors data/seo/useCases.ts — slug → human label for related-link chips */
const USE_CASE_SEEDS = [
  { ruSlug: "odezhda-na-ai-modeli", enSlug: "clothing-on-ai-model", ru: "одежда на AI-модели", en: "clothing on AI model", kk: "Киім AI модельде" },
  { ruSlug: "bele-na-ai-modeli", enSlug: "lingerie-on-ai-model", ru: "бельё на AI-модели", en: "lingerie on AI model", kk: "Ішкі киім AI модельде" },
  { ruSlug: "plus-size-model-foto", enSlug: "plus-size-model-photos", ru: "фото plus-size модели для одежды", en: "plus-size model photos", kk: "Plus-size модель фотосы" },
  { ruSlug: "foto-bizhuterii", enSlug: "jewelry-product-photos", ru: "фото бижутерии для маркетплейса", en: "jewelry product photos", kk: "Әшекей тауар фотосы" },
  { ruSlug: "foto-sumok", enSlug: "bags-product-photos", ru: "фото сумок для маркетплейса", en: "bags product photos", kk: "Сөмке тауар фотосы" },
  { ruSlug: "belyy-fon-dlya-marketpleysa", enSlug: "marketplace-white-background", ru: "белый фон для маркетплейса", en: "marketplace white background", kk: "Маркетплейске ақ фон" },
  { ruSlug: "foto-tovara-dlya-instagram", enSlug: "instagram-product-photos", ru: "фото товара для Instagram", en: "Instagram product photos", kk: "Instagram тауар фотосы" },
  { ruSlug: "reels-iz-foto-tovara", enSlug: "reels-from-product-image", ru: "Reels из фото товара", en: "Reels from product image", kk: "Тауар фотосынан Reels" },
  { ruSlug: "ai-zamena-fona", enSlug: "ai-background-replacement", ru: "AI-замена фона у товара", en: "AI background replacement", kk: "AI фон ауыстыру" },
  { ruSlug: "ochistka-tovarnogo-foto", enSlug: "product-photo-cleanup", ru: "очистка товарного фото", en: "product photo cleanup", kk: "Тауар фотосын тазалау" },
  { ruSlug: "tochnaya-tovarnaya-kartochka", enSlug: "exact-product-card", ru: "точная товарная карточка", en: "exact product card", kk: "Нақты тауар картасы" },
  { ruSlug: "kreativnaya-scena-tovara", enSlug: "creative-product-scene", ru: "креативная сцена товара", en: "creative product scene", kk: "Тауардың креативті сценасы" },
  { ruSlug: "foto-dlya-ecommerce-kataloga", enSlug: "ecommerce-catalog-photos", ru: "фото для ecommerce каталога", en: "ecommerce catalog photos", kk: "Ecommerce каталог фотосы" },
  { ruSlug: "foto-kataloga-postavshchika", enSlug: "supplier-catalog-photos", ru: "каталог поставщика", en: "supplier catalog photos", kk: "Жеткізуші каталогы" },
  { ruSlug: "foto-tovarov-shouruma", enSlug: "showroom-product-photos", ru: "фото товаров шоурума", en: "showroom product photos", kk: "Шоурум тауар фотосы" },
  { ruSlug: "tovarnye-foto-dlya-malogo-biznesa", enSlug: "small-business-product-photos", ru: "товарные фото для малого бизнеса", en: "small business product photos", kk: "Шағын бизнес тауар фотосы" },
  { ruSlug: "workflow-kontent-menedzhera", enSlug: "marketplace-content-manager-workflow", ru: "workflow контент-менеджера маркетплейса", en: "marketplace content manager workflow", kk: "Маркетплейс контент-менеджері workflow" },
];

/** Mirrors data/seo/platforms.ts */
const PLATFORM_SEEDS = [
  { slug: "kaspi", name: "Kaspi" },
  { slug: "wildberries", name: "Wildberries" },
  { slug: "ozon", name: "Ozon" },
  { slug: "ebay", name: "eBay" },
  { slug: "amazon", name: "Amazon" },
  { slug: "etsy", name: "Etsy" },
  { slug: "shopify", name: "Shopify" },
  { slug: "instagram-shop", name: "Instagram Shop" },
  { slug: "tiktok-shop", name: "TikTok Shop" },
  { slug: "facebook-marketplace", name: "Facebook Marketplace" },
  { slug: "olx", name: "OLX" },
  { slug: "aliexpress", name: "AliExpress" },
  { slug: "temu", name: "Temu" },
];

function capitalizePhrase(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const useCaseLabelBySlug = { ru: {}, en: {}, kk: {} };
for (const seed of USE_CASE_SEEDS) {
  useCaseLabelBySlug.ru[seed.ruSlug] = capitalizePhrase(seed.ru);
  useCaseLabelBySlug.en[seed.enSlug] = capitalizePhrase(seed.en);
  useCaseLabelBySlug.kk[seed.enSlug] = seed.kk;
}

const platformLabelBySlug = { ru: {}, en: {}, kk: {} };
for (const seed of PLATFORM_SEEDS) {
  platformLabelBySlug.ru[`${seed.slug}-foto-tovarov`] = seed.name;
  platformLabelBySlug.en[`${seed.slug}-product-photos`] = seed.name;
  platformLabelBySlug.kk[`${seed.slug}-product-photos`] = seed.name;
}

function useCaseLinkLabel(locale, slug) {
  return useCaseLabelBySlug[locale][slug] ?? null;
}

function platformLinkLabel(locale, slug) {
  return platformLabelBySlug[locale][slug] ?? null;
}

function wordCount(loc) {
  const text = [
    loc.intro,
    ...loc.sections.map((s) => s.body),
    ...loc.scenarios.map((s) => s.body),
    loc.limitations,
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

function relatedLinks(ctx, locale) {
  const s = STATIC[locale];
  const uc = ctx.relatedUseCases[locale];
  const pl = ctx.relatedPlatforms[locale];
  const labels = {
    ru: {
      home: "Главная",
      cost: "Стоимость",
      how: "Как работает",
      quality: "Качество",
      studio: "AI-студия товарных фото",
      mp: "Фото для маркетплейсов",
      fashion: "Одежда на AI-модели",
      jewelry: "Фото бижутерии",
    },
    en: {
      home: "Home",
      cost: "Pricing",
      how: "How it works",
      quality: "Quality",
      studio: "AI product photo studio",
      mp: "Marketplace product photos",
      fashion: "Fashion model photos",
      jewelry: "Jewelry product photos",
    },
    kk: {
      home: "Басты бет",
      cost: "Бағасы",
      how: "Қалай жұмыс істейді",
      quality: "Сапа",
      studio: "AI тауар фото студиясы",
      mp: "Маркетплейске фото",
      fashion: "Киім AI модельде",
      jewelry: "Әшекей фотосы",
    },
  };
  const L = labels[locale];
  const links = [
    { label: L.home, href: s.home },
    { label: L.cost, href: s.cost },
    { label: L.how, href: s.howItWorks },
    { label: L.quality, href: s.quality },
    { label: L.studio, href: s.studio },
    { label: L.mp, href: s.marketplacePhotos },
  ];
  if (["clothing-sellers", "showrooms"].includes(ctx.id)) {
    links.push({ label: L.fashion, href: s.fashionPhotos });
  }
  if (ctx.id === "jewelry-sellers") {
    links.push({ label: L.jewelry, href: s.jewelryPhotos });
  }
  for (const slug of uc) {
    const label = useCaseLinkLabel(locale, slug);
    if (label) links.push({ label, href: `${s.useCases}/${slug}` });
  }
  for (const slug of pl.slice(0, 2)) {
    const label = platformLinkLabel(locale, slug);
    if (label) links.push({ label, href: `${s.platforms}/${slug}` });
  }
  return links;
}

// --- Locale content builders (unique prose per audience id) ---

function buildRu(ctx) {
  const copy = RU_COPY[ctx.id];
  return {
    slug: ctx.slug.ru,
    title: `${ctx.title.ru} — Vitrina AI Studio`,
    metaDescription: copy.meta,
    h1: ctx.h1.ru,
    intro: copy.intro,
    chipLabel: ctx.chip.ru,
    sections: copy.sections,
    forWho: copy.forWho,
    tasks: copy.tasks,
    howHelps: copy.howHelps,
    scenarios: copy.scenarios,
    limitations: copy.limitations,
    faq: copy.faq,
    relatedLinks: relatedLinks(ctx, "ru"),
    status: "published",
  };
}

function buildEn(ctx) {
  const copy = EN_COPY[ctx.id];
  return {
    slug: ctx.slug.en,
    title: `${ctx.title.en} — Vitrina AI Studio`,
    metaDescription: copy.meta,
    h1: ctx.h1.en,
    intro: copy.intro,
    chipLabel: ctx.chip.en,
    sections: copy.sections,
    forWho: copy.forWho,
    tasks: copy.tasks,
    howHelps: copy.howHelps,
    scenarios: copy.scenarios,
    limitations: copy.limitations,
    faq: copy.faq,
    relatedLinks: relatedLinks(ctx, "en"),
    status: "published",
  };
}

function buildKk(ctx) {
  const copy = KK_COPY[ctx.id];
  return {
    slug: ctx.slug.kk,
    title: `${ctx.title.kk} — Vitrina AI Studio`,
    metaDescription: copy.meta,
    h1: ctx.h1.kk,
    intro: copy.intro,
    chipLabel: ctx.chip.kk,
    sections: copy.sections,
    forWho: copy.forWho,
    tasks: copy.tasks,
    howHelps: copy.howHelps,
    scenarios: copy.scenarios,
    limitations: copy.limitations,
    faq: copy.faq,
    relatedLinks: relatedLinks(ctx, "kk"),
    status: "published",
  };
}

function sec(title, body) {
  return { title, body };
}

const RU_COPY = {
    "marketplace-sellers": {
      meta: "Как продавцам маркетплейсов готовить AI-фото товаров для Kaspi, Wildberries и Ozon: workflow, ручной QA, ограничения и масштаб каталога в Vitrina AI Studio.",
      intro:
        "Продавцы маркетплейсов живут в ритме SKU, акций и штрафов за слабую главную фотографию. Vitrina AI Studio помогает из одного исходника собрать белый фон, аккуратную карточку и варианты под разные ракурсы без ежедневной студии. Вы сохраняете контроль: сравниваете цвет, форму и детали с реальным товаром до публикации. Страница описывает типовой процесс для Kaspi, Wildberries и Ozon, чек-листы QA и честные ограничения AI — без обещаний автоматической модерации и без статуса официального партнёра площадок.",
      sections: [
        sec(
          "Рабочий процесс продавца маркетплейса",
          "Начните с фото товара при ровном свете: без сильных бликов, обрезанных краёв и лишних предметов в кадре. В Vitrina AI Studio выберите сценарий «точная карточка» или «белый фон для маркетплейса», сгенерируйте 2–3 варианта и отметьте лучший после сравнения с исходником. Для одежды и аксессуаров заранее решите, нужен ли flat lay или отдельный сценарий с моделью — не смешивайте режимы в одной карточке без необходимости. Экспортируйте квадрат или 3:4 под главное фото, сохраните исходники в папке SKU, чтобы при смене требований площадки быстро пересобрать кадр. Демо-режим удобен, чтобы обучить менеджера кабинета без списаний и реальных AI-вызовов."
        ),
        sec(
          "Требования Kaspi, Wildberries и Ozon",
          "У каждой площадки свой набор правил к главному фото: фон, доля товара в кадре, запрет лишнего текста и водяных знаков. Vitrina AI Studio не является официальным партнёром Kaspi, Wildberries или Ozon, поэтому перед загрузкой сверяйте результат с актуальной справкой в личном кабинете. Для Kaspi часто критичны читаемость товара и отсутствие посторонних объектов; для Wildberries — единый стиль серии; для Ozon — чёткие детали и допустимые пропорции. Если категория требует инфографику или видео, планируйте их отдельно: AI-кадр закрывает базовую карточку, но не заменяет все форматы площадки. Правила меняются — финальную ответственность несёт продавец."
        ),
        sec(
          "Контроль качества после генерации",
          "Проверяйте цвет корпуса и фурнитуры, геометрию, швы, принт, логотипы, края маски и тени. AI может «подтянуть» оттенок, сгладить текстуру или изменить мелкий узор — такие варианты нельзя публиковать вслепую. Заведите короткий чек-лист на 30 секунд: исходник слева, результат справа, zoom 100%. Для серий из десятков SKU сравнивайте не только отдельный кадр, но и визуальную согласованность ленты в каталоге. При сомнении перегенерируйте с другим фоном или вернитесь к предметной съёмке для эталонного ракурса. Vitrina AI Studio не гарантирует прохождение модерации — ручная сверка обязательна."
        ),
        sec(
          "Масштабирование каталога без студии каждый день",
          "Когда новых позиций больше, чем часов фотографа, AI снимает пик нагрузки на рутинных карточках: белый фон, лёгкая чистка, единый стиль. Разделите SKU на A/B: A — только AI после смартфона; B — гибрид со студией для hero-товаров. Так вы ускоряете вывод новинок и не размываете качество флагманов. Храните пресеты фона и экспорта, чтобы команда повторяла одни настройки. Планируйте батчи по 20–30 SKU с одной сессией света — это дешевле, чем разрозненные снимки в течение месяца. Для Kaspi и Wildberries единый визуальный ряд особенно заметен в выдаче категории."
        ),
        sec(
          "Бюджет: съёмка, ретушь и AI",
          "Считайте не только цену генерации, но и время менеджера на QA. Для массового каталога AI часто дешевле повторных выездов фотографа, если исходники сняты аккуратно. Для премиум-категорий оставьте бюджет на живую съёмку и используйте Vitrina AI Studio для адаптации под разные площадки и сезонные фоны. Сравните стоимость отклонённой модерации и простоя карточки — иногда одна пересъёмка дороже пакета генераций. Прозрачный workflow с демо и чек-листом снижает переделки. Помните: сервис не обещает автоматического одобрения модераторами Ozon, WB или Kaspi."
        ),
        sec(
          "Роли в команде продавца",
          "Владелец задаёт стандарт бренда, менеджер маркетплейса отвечает за соответствие правилам площадки, ассистент готовит исходники и загружает варианты. Vitrina AI Studio вписывается между ассистентом и менеджером: первый снимает и генерирует, второй утверждает после QA. Если работает внешний фотограф, договоритесь о формате передачи RAW/JPEG и именовании папок по SKU. Так вы избегаете путаницы версий и ускоряете публикацию акций. Независимый статус студии означает, что инструкции площадок всегда проверяются в кабинете продавца, а не через нас."
        ),
        sec(
          "Рост продаж и визуальной витрины",
          "Сильная главная фотография повышает CTR в выдаче Kaspi, Wildberries и Ozon, но удержание даёт точное соответствие товару при получении. AI помогает быстрее тестировать фон и ракурс, если вы фиксируете гипотезы: какая серия дала лучший клик без роста возвратов. Добавляйте последовательные ракурсы и макро-детали там, где площадка позволяет вторичные фото. Не гонитесь за «идеальной картинкой», которая не совпадает с поставкой — это дороже любой генерации. Ручной QA защищает рейтинг и снижает жалобы покупателей на несоответствие фото."
        )
      ],
      forWho: [
        "ИП и магазины на Kaspi, Wildberries, Ozon",
        "Продавцы с растущим каталогом и нехваткой времени на съёмку",
        "Команды без штатного фотографа, но с менеджером кабинета",
        "Бренды, выводящие сезонные коллекции на несколько площадок",
        "Продавцы, которым нужен единый стиль карточек в ленте"
      ],
      tasks: [
        "Подготовить главное фото на белом или нейтральном фоне",
        "Собрать точную карточку из смартфонного исходника",
        "Согласовать серию из 10–50 SKU перед акцией",
        "Быстро заменить фон под требования другой площадки",
        "Очистить кадр от лишних предметов и шума",
        "Сделать дополнительный ракурс без второй съёмки",
        "Обучить ассистента workflow через демо-режим"
      ],
      howHelps: [
        "Ускоряет рутинные карточки без ежедневной студии",
        "Даёт 2–3 варианта фона и ракурса на один исходник",
        "Поддерживает чек-лист ручной сверки с товаром",
        "Снижает стоимость переделок при массовых SKU",
        "Помогает удерживать единый визуальный стиль ленты",
        "Показывает демо без списаний для обучения команды"
      ],
      scenarios: [
        {
          title: "Новая линейка на Kaspi за выходные",
          body: "Продавец электроники получает 25 SKU с одного поставщика. Ассистент снимает на столе с двумя софтбоксами, в Vitrina AI Studio генерирует белый фон и сравнивает блики на корпусе. Менеджер вручную утверждает 23 карточки, две отправляет на пересъёмку из-за искажённого логотипа. К понедельнику линейка в кабинете Kaspi без аренды студии. Модерация не гарантирована — каждый кадр сверен с образцом.",
        },
        {
          title: "Перенос карточки с Ozon на Wildberries",
          body: "Главное фото с Ozon не проходит визуальный стиль WB. Команда берёт исходник, меняет фон и экспорт 3:4, проверяет долю товара в кадре и читает справку WB в личном кабинете. Публикация проходит без новой съёмки, экономя день и логистику образцов. Vitrina AI Studio не является партнёром Wildberries — финальное решение модератора остаётся на стороне площадки.",
        },
        {
          title: "Сезонная акция с единым фоном",
          body: "К празднику нужен тёплый нейтральный фон для 40 SKU на Kaspi и Ozon. Дизайнер задаёт пресет, ассистент прогоняет батч, менеджер выборочно проверяет каждый десятый кадр и все флагманы. CTR растёт, возвраты не увеличиваются, потому что товар не менялся — только фон. Ручной QA отсеивает кадры с изменённым оттенком корпуса.",
        },
        {
          title: "Срочная замена отклонённой модерацией",
          body: "Карточку вернули из-за лишнего реквизита в кадре. Продавец загружает исходник без реквизита, включает очистку в студии, сверяет края и повторно отправляет в кабинет. Время простоя сокращается с двух дней съёмки до часа QA. Сервис не обещает автоматического одобрения — менеджер сверяет кадр с актуальными правилами площадки.",
        }
      ],
      limitations:
        "AI может изменить оттенок, форму, фактуру, логотип или мелкие детали товара. Vitrina AI Studio не гарантирует прохождение модерации Kaspi, Wildberries, Ozon и других площадок и не является их официальным партнёром. Перед публикацией сверяйте изображение с живым образцом и актуальными правилами кабинета. Ручная проверка каждого кадра обязательна — автоматическое одобрение модерации не предусмотрено.",
      faq: [
        {
          question: "Можно ли публиковать AI-фото без проверки?",
          answer: "Нет. Сравните цвет, форму, принт, логотипы и края с исходником. Отклоняйте варианты с искажениями до загрузки в кабинет Kaspi, Wildberries или Ozon.",
        },
        {
          question: "Гарантирует ли Vitrina AI прохождение модерации?",
          answer: "Нет. Сервис помогает подготовить визуал, но правила площадок меняются. Финальную сверку и ответственность за публикацию несёт продавец.",
        },
        {
          question: "Подходит ли сервис для одежды на модели?",
          answer: "Для одежды лучше отдельный сценарий «на AI-модели». На этой странице фокус на предметных карточках и белом фоне для маркетплейсов.",
        },
        {
          question: "Vitrina AI — официальный партнёр маркетплейсов?",
          answer: "Нет. Это независимый инструмент. Перед публикацией читайте актуальные требования площадки в личном кабинете продавца.",
        },
        {
          question: "Можно ли работать в демо-режиме?",
          answer: "Да. Демо показывает workflow без списаний и реальных AI-вызовов — удобно обучить команду и согласовать чек-лист QA.",
        },
        {
          question: "Нужна ли профессиональная студия?",
          answer: "Для старта часто достаточно смартфона и ровного света. Для премиум-категорий и сложной макросъёмки студия или фотограф остаются полезны.",
        }
      ],
    },
    "clothing-sellers": {
      meta: "Как продавцам одежды готовить AI-фото для Kaspi, Wildberries и Ozon: flat lay, сценарий на модели, контроль цвета ткани и ручной QA в Vitrina AI Studio.",
      intro:
        "Одежда на маркетплейсах проигрывает или выигрывает в первую секунду: покупатель оценивает посадку, длину и оттенок по главному кадру. Vitrina AI Studio помогает собрать flat lay, аккуратную карточку на белом фоне или вариант на AI-модели из одного исходника — без ежедневной аренды студии и модели. Вы сохраняете контроль: сверяете цвет ткани, принт, швы и пропорции с реальным изделием до публикации. Страница описывает workflow для Kaspi, Wildberries и Ozon, чек-листы QA для текстиля и честные ограничения AI — без обещаний автоматической модерации и без статуса официального партнёра площадок.",
      sections: [
        sec(
          "Flat lay и карточка на белом фоне",
          "Для базовых позиций начните с ровного flat lay: изделие разложено без складок, которые скрывают крой, бирка снята или отодвинута. В Vitrina AI Studio выберите сценарий для одежды на нейтральном фоне, сгенерируйте 2–3 варианта и сравните оттенок ткани с исходником при дневном свете. Не смешивайте flat lay и кадр на модели в одной карточке без необходимости — площадки и покупатели ожидают последовательности. Экспортируйте квадрат или 3:4 под главное фото Kaspi или Wildberries, сохраните исходники по артикулам. Для серии из десятков SKU задайте один пресет фона, чтобы лента каталога выглядела единой. Демо-режим помогает обучить ассистента без списаний. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Сценарий «на AI-модели» для одежды",
          "Когда категория требует показать посадку, длину рукава или силуэт, используйте отдельный сценарий на AI-модели. Загрузите качественный исходник: фронт, профиль или flat lay с читаемым кроем. Сгенерируйте варианты, затем вручную проверьте, не изменились ли пропорции, длина изделия и цвет относительно образца. AI может «подтянуть» талию, удлинить рукав или сгладить фактуру — такие кадры нельзя публиковать вслепую. Сверяйте размерную сетку и описание с тем, что видит покупатель на фото. Vitrina AI Studio не гарантирует прохождение модерации Ozon, WB или Kaspi — финальная ответственность на продавце."
        ),
        sec(
          "Контроль цвета ткани и принта",
          "Текстиль чувствителен к балансу белого: один и тот же свитер на экране может выглядеть холоднее или теплее после AI. Заведите эталон: фото при окне + swatch ткани рядом, если возможно. В QA сравнивайте не только общий тон, но и мелкий принт, полоску, логотип на груди. Отклоняйте варианты, где узор «поплыл» или исчезла текстура вязки. Для джинсы и кожи проверяйте швы и фурнитуру в zoom 100%. Серия из 20 SKU должна выглядеть согласованной — выборочно смотрите ленту целиком. Ручная сверка обязательна: сервис не обещает автоматического одобрения модераторами."
        ),
        sec(
          "Требования Kaspi, Wildberries и Ozon для одежды",
          "У каждой площадки свои правила к главному фото одежды: фон, запрет лишнего текста, иногда требование показать изделие без модели или на модели определённого типа. Vitrina AI Studio не является официальным партнёром Kaspi, Wildberries или Ozon — перед загрузкой читайте актуальную справку в кабинете. Для WB часто важен единый стиль серии; для Kaspi — читаемость кроя и отсутствие посторонних предметов; для Ozon — чёткие детали и допустимые пропорции. Инфографику с размерной сеткой планируйте отдельно: AI-кадр закрывает базовую карточку, но не заменяет все форматы. Правила меняются — проверяйте перед каждой крупной акцией."
        ),
        sec(
          "Сезонные коллекции и массовый каталог",
          "Когда новая коллекция — это 50–100 артикулов, AI снимает пик на рутинных кадрах: белый фон, лёгкая чистка, единый стиль flat lay. Разделите SKU: hero-позиции съёмка на модели или в студии, массовый хвост — AI после смартфона. Планируйте батчи по 20–30 изделий с одной сессией света и одним пресетом экспорта. Так вы успеваете к старту акции на Kaspi и Wildberries без найма фотографа на каждый сезон. Храните пресеты в Vitrina AI Studio, чтобы команда повторяла настройки. Выборочный QA каждого десятого кадра плюс все флагманы — разумный баланс скорости и качества."
        ),
        sec(
          "Возвраты, рейтинг и честное фото",
          "Несоответствие цвета или длины на фото — частая причина возвратов одежды. AI помогает быстрее тестировать фон и ракурс, но не должен «улучшать» товар beyond реальности. Фиксируйте гипотезы: какой flat lay дал лучший CTR без роста возвратов. Добавляйте дополнительные ракурсы и макро ткани там, где площадка позволяет вторичные фото. Не гонитесь за идеальной картинкой, которая не совпадает с поставкой — это дороже любой генерации. Ручной QA защищает рейтинг магазина и снижает жалобы покупателей. Сервис не обещает автоматического одобрения модерации."
        ),
        sec(
          "Роли: бренд, закупка, контент",
          "Владелец бренда задаёт визуальный стандарт, закупщик передаёт образцы, контент-менеджер генерирует и загружает в кабинеты. Vitrina AI Studio вписывается между съёмкой и публикацией: ассистент готовит исходники, менеджер утверждает после QA. Если работает внешний фотограф, договоритесь о формате передачи и именовании папок по артикулам. Независимый статус студии означает, что инструкции Kaspi, Wildberries и Ozon проверяются в личном кабинете продавца. Демо-режим удобен для onboarding нового сотрудника без списаний и реальных AI-вызовов."
        )
      ],
      forWho: [
        "Бренды одежды на Kaspi, Wildberries и Ozon",
        "Продавцы с сезонными коллекциями и сотнями артикулов",
        "Магазины без штатной модели и студии каждый день",
        "Команды, которым нужен flat lay и кадр на AI-модели",
        "Продавцы, снижающие возвраты из-за неверного цвета на фото"
      ],
      tasks: [
        "Собрать flat lay на белом фоне для главного фото",
        "Сгенерировать кадр на AI-модели для показа посадки",
        "Согласовать цвет ткани с эталонным образцом",
        "Подготовить серию из 20–50 артикулов к акции",
        "Адаптировать карточку под требования другой площадки",
        "Проверить принт, швы и длину изделия после AI",
        "Обучить ассистента workflow через демо-режим"
      ],
      howHelps: [
        "Ускоряет flat lay и базовые карточки без ежедневной студии",
        "Даёт варианты на AI-модели из одного исходника",
        "Поддерживает чек-лист сверки цвета ткани и кроя",
        "Снижает стоимость сезонной съёмки при массовом каталоге",
        "Помогает удерживать единый стиль ленты одежды",
        "Показывает демо без списаний для обучения команды"
      ],
      scenarios: [
        {
          title: "Новая осенняя коллекция за неделю",
          body: "Бренд кэжуал получает 40 артикулов. Ассистент снимает flat lay при окне, в Vitrina AI Studio генерирует белый фон и три hero-позиции на AI-модели. Менеджер вручную сверяет оттенок трикотажа с образцами, отклоняет два кадра с искажённым кроем. К пятнице коллекция в кабинетах Kaspi и Wildberries. Модерация не гарантирована — каждый кадр проверен вручную.",
        },
        {
          title: "Замена отклонённого фото на WB",
          body: "Карточку вернули из-за лишних реквизитов в кадре. Продавец переснимает flat lay без аксессуаров, генерирует чистый фон, проверяет долю изделия в кадре по справке Wildberries. Публикация без новой студии. Vitrina AI Studio не партнёр WB — финальное решение модератора на стороне площадки.",
        },
        {
          title: "Единый стиль для 30 SKU джинсов",
          body: "Нужен одинаковый нейтральный фон для линейки денима. Дизайнер задаёт пресет, команда прогоняет батч, QA выборочно проверяет швы и оттенок indigo. Лента каталога выглядит профессионально, CTR растёт без увеличения возвратов — товар не менялся, только фон.",
        },
        {
          title: "Тест AI-модели для платьев",
          body: "Продавец платьев хочет показать длину и силуэт без найма модели. Генерирует три варианта на AI-модели, сравнивает с манекеном в шоуруме, публикует лучший после ручной сверки. Два варианта отклонены из-за удлинённого подола — типичная ошибка AI, которую ловит QA.",
        }
      ],
      limitations:
        "AI может изменить оттенок ткани, длину изделия, пропорции на модели, принт или фактуру материала. Vitrina AI Studio не гарантирует прохождение модерации Kaspi, Wildberries, Ozon и не является их официальным партнёром. Перед публикацией сверяйте изображение с живым образцом и актуальными правилами кабинета. Ручная проверка каждого кадра обязательна — автоматическое одобрение модерации не предусмотрено.",
      faq: [
        {
          question: "Можно ли смешивать flat lay и модель в одной карточке?",
          answer: "Лучше держать последовательность: главное фото — один формат, дополнительные ракурсы — другой. Так покупатель и модерация видят предсказуемую подачу.",
        },
        {
          question: "Как проверить цвет ткани после AI?",
          answer: "Сравните исходник и результат при одинаковом освещении, zoom 100%. При сомнении перегенерируйте или вернитесь к эталонной съёмке.",
        },
        {
          question: "Гарантирует ли сервис прохождение модерации одежды?",
          answer: "Нет. Правила площадок меняются. Финальную сверку и ответственность за публикацию несёт продавец.",
        },
        {
          question: "Vitrina AI — партнёр маркетплейсов?",
          answer: "Нет. Независимый инструмент. Читайте актуальные требования в личном кабинете Kaspi, Wildberries или Ozon.",
        },
        {
          question: "Подходит ли для детской одежды?",
          answer: "Да, если исходники качественные и вы проводите ручной QA. Особенно внимательно проверяйте детали безопасности и точность цвета.",
        },
        {
          question: "Нужна ли профессиональная модель?",
          answer: "Для массового каталога часто достаточно AI-модели после QA. Для hero-кampаний живая съёмка может оставаться предпочтительной.",
        }
      ],
    },
    "jewelry-sellers": {
      meta: "Как продавцам ювелирки и бижутерии готовить AI-фото для Kaspi, Wildberries и Ozon: блики, макро, металл и ручной QA в Vitrina AI Studio.",
      intro:
        "Ювелирка и бижутерия требуют точности: покупатель оценивает блеск металла, грани камня и масштаб по главному кадру. Vitrina AI Studio помогает собрать белый фон, аккуратную карточку и макро-детали из одного исходника — без ежедневной макросъёмки в студии. Вы сохраняете контроль: сверяете оттенок металла, форму камня и размер относительно реального изделия до публикации. Страница описывает workflow для Kaspi, Wildberries и Ozon, чек-листы QA для бликов и честные ограничения AI — без обещаний автоматической модерации и без статуса официального партнёра площадок.",
      sections: [
        sec(
          "Макросъёмка и исходник для AI",
          "Начните с фото при мягком свете: без жёстких бликов, которые «съедают» грани, и без цветных отражений от фона. Для колец и серёг снимайте несколько ракурсов — AI лучше работает, когда форма читается в исходнике. В Vitrina AI Studio выберите сценарий для ювелирки или белый фон, сгенерируйте 2–3 варианта и сравните блики с эталоном. Не ожидайте, что AI восстановит потерянные детали камня — если в исходнике смаз, результат будет неточным. Экспортируйте квадрат под главное фото маркетплейса, храните RAW по SKU. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Блики, металл и камни после генерации",
          "AI может усилить блеск, изменить оттенок золота или «нарисовать» грани, которых не было. В QA проверяйте: цвет металла (жёлтое/белое/розовое золото), количество камней, огранку, цепочку и замок. Сравнивайте исходник и результат в zoom 200% для мелкой бижутерии. Отклоняйте кадры, где камень стал крупнее или изменилась форма подвески. Для наборов убедитесь, что все элементы комплекта на месте. Vitrina AI Studio не гарантирует прохождение модерации — ручная сверка обязательна для категорий с высоким процентом возвратов. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Масштаб и контекст размера",
          "Покупатель часто не понимает реальный размер серёг или кулона по фото на белом фоне. Планируйте вторичные кадры с линейкой, монетой или на модели — AI закрывает базовую карточку, но масштаб лучше показывать отдельно. В главном фото избегайте лишних предметов, если правила площадки это запрещают. Сверяйте описание веса и размеров с тем, что видно на изображении. Несоответствие масштаба — частая жалоба в отзывах на Kaspi и Ozon. Ручной QA снижает риск возвратов. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Требования маркетплейсов к ювелирке",
          "Kaspi, Wildberries и Ozon предъявляют разные требования к фону, тексту и дополнительным документам для драгоценностей. Vitrina AI Studio не является официальным партнёром этих площадок — сертификаты, пробы и маркировка остаются зоной ответственности продавца. AI-фото помогает с визуальной карточкой, но не заменяет compliance-категории. Перед загрузкой читайте актуальную справку в кабинете. Для бижутерии правила мягче, но главное фото всё равно должно честно показывать изделие без лишнего текста и водяных знаков. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Серии и единый стиль витрины",
          "Когда в каталоге 100+ SKU колец и браслетов, единый белый фон и одинаковая высота экспозиции делают ленту профессиональной. Задайте пресет в Vitrina AI Studio и прогоняйте батчи по 15–20 SKU за сессию. Hero-изделия с крупным камнем можно снимать отдельно в студии, массовый хвост — AI после аккуратного исходника. Выборочный QA каждого пятого кадра плюс все позиции дороже 50 000 ₸ — разумный баланс. Единый стиль заметен в выдаче категории «украшения» на Wildberries."
        ),
        sec(
          "Бижутерия vs драгоценности",
          "Для бижутерии AI чаще закрывает 80% рутины: белый фон, лёгкая чистка, дополнительный ракурс. Для драгоценностей с камнями критичнее макро-исходник и строже QA — малейшее искажение огранки ведёт к возврату. Не используйте AI, чтобы «улучшить» камень, которого нет в реальности. Разделите каталог на tier A/B по цене и сложности съёмки. Сервис не обещает автоматического одобрения модерации и не заменяет юридические требования к пробе и сертификации."
        ),
        sec(
          "Команда и workflow продавца украшений",
          "Закупщик принимает партию, ассистент снимает на lightbox, менеджер маркетплейса генерирует и утверждает после QA. Vitrina AI Studio вписывается между съёмкой и кабинетом. Договоритесь о стандарте: минимальное разрешение исходника, угол для колец, naming по артикулам. Демо-режим обучает нового сотрудника без списаний. Независимый статус студии: правила Kaspi, Wildberries и Ozon проверяются в личном кабинете, не через нас."
        )
      ],
      forWho: [
        "Продавцы бижутерии и ювелирки на Kaspi, WB, Ozon",
        "Магазины с большим SKU и lightbox-съёмкой",
        "Бренды без ежедневного макрофотографа",
        "Поставщики, готовящие фото для ритейлеров",
        "Продавцы, снижающие возвраты из-за неверного масштаба на фото"
      ],
      tasks: [
        "Подготовить главное фото на белом фоне без лишних бликов",
        "Сгенерировать дополнительный ракурс кольца или серёг",
        "Сверить оттенок металла и количество камней после AI",
        "Собрать серию из 20–40 SKU в едином стиле",
        "Быстро заменить фон под другую площадку",
        "Отсеять кадры с искажённой огранкой или формой",
        "Обучить ассистента lightbox-workflow в демо"
      ],
      howHelps: [
        "Ускоряет рутинные карточки ювелирки без макростудии каждый день",
        "Даёт варианты фона и ракурса на один исходник",
        "Поддерживает чек-лист QA для бликов и металла",
        "Снижает стоимость переделок при массовых SKU",
        "Помогает удерживать единый стиль ленты украшений",
        "Демо без списаний для onboarding команды"
      ],
      scenarios: [
        {
          title: "Партия из 35 серёг к акции",
          body: "Продавец получает новую линейку. Ассистент снимает на lightbox, Vitrina AI Studio генерирует белый фон. Менеджер отклоняет три кадра с изменённым оттенком серебра, остальные загружает на Kaspi. К акции готовы без аренды студии. Модерация не гарантирована — ручная сверка с образцами.",
        },
        {
          title: "Макро-кольцо с камнем",
          body: "Hero-изделие требует чётких граней. Фотограф снимает макро, AI чистит фон и добавляет второй ракурс. QA в zoom 200% ловит лишнюю «грань» на камне — кадр перегенерирован. Публикация только после утверждения менеджером.",
        },
        {
          title: "Перенос карточки на Ozon",
          body: "Фото с Kaspi не подходит по пропорциям Ozon. Команда берёт исходник, меняет экспорт и фон, сверяет справку Ozon. Без повторной съёмки. Vitrina AI Studio не партнёр Ozon.",
        },
        {
          title: "Единый стиль браслетов",
          body: "20 браслетов в одной коллекции получают один пресет фона. Лента Wildberries выглядит как у крупного бренда. CTR растёт, возвраты стабильны — изделия не менялись.",
        }
      ],
      limitations:
        "AI может изменить оттенок металла, форму камня, блики, количество элементов или мелкие детали замка. Vitrina AI Studio не гарантирует прохождение модерации Kaspi, Wildberries, Ozon, не является официальным партнёром и не заменяет требования к сертификации драгоценностей. Перед публикацией сверяйте изображение с живым изделием и правилами кабинета. Ручная проверка обязательна.",
      faq: [
        {
          question: "Можно ли доверять AI с камнями?",
          answer: "Только после ручного QA. AI может исказить огранку или количество камней — сравнивайте с исходником в увеличении.",
        },
        {
          question: "Нужен ли lightbox?",
          answer: "Желательно для бижутерии. Ровный свет снижает переделки и улучшает исходник для AI.",
        },
        {
          question: "Гарантирует ли прохождение модерации?",
          answer: "Нет. Продавец отвечает за соответствие правилам площадки и честность фото.",
        },
        {
          question: "Подходит для золота 585?",
          answer: "Для визуальной карточки — да, с QA. Сертификаты и маркировка — отдельно, не через AI-студию.",
        },
        {
          question: "Vitrina AI — партнёр маркетплейсов?",
          answer: "Нет. Независимый инструмент. Проверяйте требования в личном кабинете.",
        },
        {
          question: "Как показать размер серёг?",
          answer: "Добавьте вторичное фото с масштабом или на модели. Главный AI-кадр редко передаёт размер без контекста.",
        }
      ],
    },
    "suppliers": {
      meta: "Как поставщикам готовить AI-фото товаров для ритейлеров и маркетплейсов: единый пакет SKU, ручной QA и масштаб в Vitrina AI Studio без обещаний модерации.",
      intro:
        "Поставщик продаёт не только товар, но и визуал: ритейлер и маркетплейс ожидают готовые карточки под Kaspi, Wildberries или Ozon. Vitrina AI Studio помогает из партийных исходников собрать белый фон, серию ракурсов и единый стиль для десятков SKU — без собственной студии на каждый контракт. Вы сохраняете контроль: сверяете цвет, форму и комплектацию с образцами до передачи клиенту. Страница описывает B2B-workflow, чек-листы QA и честные ограничения AI — без обещаний автоматической модерации на стороне конечного продавца и без статуса официального партнёра площадок.",
      sections: [
        sec(
          "Пакет фото для ритейлера",
          "Договоритесь с клиентом о формате: главное фото, ракурсы, пропорции под Kaspi, Wildberries или Ozon. Снимите партию при одном свете, именуйте файлы по SKU и артикулу клиента. В Vitrina AI Studio прогоните батч с одним пресетом фона — так ритейлер получит предсказуемую ленту. Передайте исходники вместе с AI-версиями: при смене правил площадки клиент сможет пересобрать кадр. Не обещайте прохождение модерации от имени клиента — финальную загрузку и ответственность несёт продавец в кабинете. Демо-режим помогает показать процесс закупщику без списаний. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Стандартизация серий SKU",
          "Когда в накладной 200 позиций, ручная ретушь каждого кадра не масштабируется. Разделите SKU на tier: A — только AI после аккуратного смартфона; B — гибрид со студией для hero-товаров. Задайте чек-лист QA на 30 секунд и обучите двух операторов одинаково. Vitrina AI Studio хранит пресеты — новая партия повторяет стиль прошлого месяца. Выборочная проверка каждого десятого SKU ловит системные ошибки AI. Единый визуал повышает доверие ритейлера и ускоряет приёмку каталога. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "QA перед передачей клиенту",
          "Проверяйте цвет, комплектацию, логотипы, штрихкоды на упаковке (если попали в кадр) и края маски. AI может изменить оттенок, количество предметов в наборе или текст на коробке — такие кадры нельзя отдавать ритейлеру. Зафиксируйте протокол: исходник слева, результат справа, zoom 100%. При браке — перегенерация или пересъёмка, не «надежда на модерацию». Vitrina AI Studio не гарантирует одобрение Kaspi, Wildberries или Ozon — это зона клиента-продавца. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Kaspi, Wildberries, Ozon: разные требования",
          "Один ритейлер может продавать на нескольких площадках с разными правилами к фону и пропорциям. Готовьте мастер-исходник и экспортируйте варианты под каждый канал. Vitrina AI Studio не является официальным партнёром площадок — в договоре с клиентом явно укажите, что соответствие правилам проверяет загружающая сторона. Актуальные справки читаются в личном кабинете продавца, не у нас. Это снижает споры при отклонении карточки модерацией. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Сроки и сезонные пики",
          "Перед праздниками и распродажами ритейлеры требуют каталог раньше. AI снимает пик на белом фоне и чистке, если исходники сняты батчами. Планируйте слоты: 30 SKU в день с QA силами двух человек — реалистичный ориентир для смартфон-исходников. Hero-позиции клиента оставьте на студию, если контракт это предусматривает. Прозрачный workflow с демо снижает переделки и ускоряет согласование эталона с первой партией. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Ценообразование услуги для клиента",
          "Считайте не только генерации, но и время QA и пересъёмки брака. Для массового SKU AI часто дешевле штатного фотографа поставщика. В смете отделите «базовый пакет AI» и «премиум с живой съёмкой». Клиент понимает, за что платит, вы не обещаете модерацию маркетплейса. Сравните стоимость простоя карточки у ритейлера — иногда скорость важнее идеального блика."
        ),
        sec(
          "Команда поставщика: закупка, склад, контент",
          "Закупка принимает образцы, склад готовит чистый фон для съёмки, контент-оператор генерирует в Vitrina AI Studio и проходит QA. Менеджер по ключевым клиентам согласует эталон первой карточки. Независимый статус студии: мы не подменяем кабинет Kaspi, Wildberries или Ozon. Демо обучает нового оператора без списаний."
        )
      ],
      forWho: [
        "Оптовые поставщики с каталогом для ритейлеров",
        "Дистрибьюторы, передающие фото вместе с товаром",
        "Производители без собственной фотостудии",
        "B2B-команды с сезонными пиками SKU",
        "Поставщики на Kaspi, Wildberries, Ozon через партнёров-продавцов"
      ],
      tasks: [
        "Собрать единый пакет фото на партию SKU",
        "Стандартизировать фон и экспорт под клиента",
        "Провести QA перед передачей ритейлеру",
        "Адаптировать мастер-кадр под разные площадки",
        "Ускорить приёмку каталога к акции",
        "Обучить склад снимать исходники для AI",
        "Показать workflow клиенту в демо-режиме"
      ],
      howHelps: [
        "Масштабирует визуал на сотни SKU без студии каждый день",
        "Держит единый стиль для B2B-каталога",
        "Снижает стоимость рутинных карточек",
        "Ускоряет передачу материалов ритейлеру",
        "Даёт демо для согласования эталона",
        "Поддерживает чек-лист ручной сверки"
      ],
      scenarios: [
        {
          title: "Партия 80 SKU для сети",
          body: "Поставщик бытовой химии снимает на столе, прогоняет батч в Vitrina AI Studio, QA отсеивает 5 кадров с искажёнными этикетками. Ритейлер получает архив за два дня вместо недели студии. Модерация на стороне продавца — поставщик не гарантирует одобрение.",
        },
        {
          title: "Эталон для нового контракта",
          body: "Клиент просит образец стиля. Оператор показывает демо, генерирует три варианта белого фона, закупщик утверждает один. Вся следующая партия идёт по этому пресету — споров о визуале меньше.",
        },
        {
          title: "Срочный дозаказ к празднику",
          body: "За 48 часов нужно 25 новых позиций. AI закрывает рутину, две позиции уходят на пересъёмку из-за блика на упаковке. Ритейлер успевает к акции на Kaspi.",
        },
        {
          title: "Два формата для WB и Ozon",
          body: "Из одного мастер-исходника команда экспортирует версии под Wildberries и Ozon. Клиент загружает сам и сверяет справки площадок. Vitrina AI Studio не партнёр маркетплейсов.",
        }
      ],
      limitations:
        "AI может изменить этикетку, цвет, комплектацию или мелкие детали товара. Vitrina AI Studio не гарантирует прохождение модерации на Kaspi, Wildberries, Ozon и не является официальным партнёром. Поставщик отвечает за QA перед передачей; конечный продавец — за публикацию. Ручная проверка обязательна.",
      faq: [
        {
          question: "Может ли поставщик гарантировать модерацию клиенту?",
          answer: "Нет. Загрузка и правила кабинета — зона продавца-ритейлера.",
        },
        {
          question: "Какой минимум для исходника?",
          answer: "Ровный свет, читаемый товар, без обрезанных краёв. Чем лучше исходник, тем меньше брака QA.",
        },
        {
          question: "Vitrina AI — партнёр маркетплейсов?",
          answer: "Нет. Независимый инструмент для подготовки визуала.",
        },
        {
          question: "Можно ли передать исходники клиенту?",
          answer: "Да. Рекомендуется передавать и RAW/JPEG, и AI-версии для гибкости.",
        },
        {
          question: "Подходит для наборов?",
          answer: "Да, с QA на количество предметов в комплекте — AI может «добавить» или убрать элемент.",
        },
        {
          question: "Есть ли демо для B2B-презентации?",
          answer: "Да. Демо показывает workflow без списаний — удобно согласовать эталон.",
        }
      ],
    },
    "showrooms": {
      meta: "Как шоурумам готовить AI-фото товаров для витрины, каталога и маркетплейсов: интерьер, lifestyle и ручной QA в Vitrina AI Studio.",
      intro:
        "Шоурум живёт одновременно офлайн и онлайн: покупатель видит товар в зале, а потом ищет ту же позицию на Kaspi или в Instagram. Vitrina AI Studio помогает из съёмки в интерьере собрать чистую карточку, lifestyle-кадр или белый фон для маркетплейса — без закрытия зала на студию каждый день. Вы сохраняете контроль: сверяете цвет, фактуру и комплектацию с образцом в шоуруме до публикации. Страница описывает workflow для витрины и площадок, чек-листы QA и ограничения AI — без обещаний модерации и без статуса официального партнёра Kaspi, Wildberries или Ozon.",
      sections: [
        sec(
          "Съёмка в зале без остановки продаж",
          "Снимайте товар там, где он стоит: при дневном свете из витрины или с переносными панелями, не загораживая проход. Уберите ценники и посторонние предметы из кадра. В Vitrina AI Studio выберите сценарий очистки фона или lifestyle с нейтральным интерьером. Сгенерируйте 2–3 варианта и сравните с реальным образцом на полке. Для мебели и декора важна масштабность — не «приближайте» AI то, что в зале выглядит иначе. Экспортируйте под сайт шоурума и под Kaspi, если продаёте онлайн параллельно. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Lifestyle vs белый фон",
          "Витрина продаёт атмосferу, маркетплейс часто требует белый фон на главном фото. Держите оба формата из одного исходника: lifestyle для соцсетей и сайта, AI-белый для кабинета. Не публикуйте на Kaspi кадр с чужим брендом мебели в фоне, если правила это запрещают. Vitrina AI Studio не гарантирует модерацию — сверяйте справку площадки. Ручной QA ловит лишние объекты, которые AI не убрал. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Мебель, текстиль и крупногабарит",
          "Диваны, ковры и люстры сложно везти в студию. Снимайте в зале фронтально, фиксируйте пропорции, избегайте широкоугольных искажений. AI может «выпрямить» линии, но также изменить оттенок обивки — проверяйте ткань и дерево в сравнении с образцом. Для комплектов покажите все элементы или явно укажите в описании, что на фото часть набора. Масштаб часто требует вторичного кадра с размером — AI не заменяет чертёж и линейку. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Единый стиль каталога шоурума",
          "Когда в зале сотни позиций, покупателю online нужна предсказуемая лента. Задайте пресет: нейтральный интерьер или белый фон, одинаковая высота экспозиции в кадре. Прогоняйте батчи после приёмки новых коллекций. Hero-зона зала может сниматься отдельно для рекламы, массовый каталог — AI. Единый стиль снижает bounce на сайте и ускоряет публикацию на Wildberries или Ozon, если шоурум дублирует ассортимент. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Kaspi и локальные маркетплейсы",
          "Многие шоурумы в Казахстане продают через Kaspi параллельно офлайн. Главное фото должно честно совпадать с тем, что клиент увидит в зале — иначе возвраты и негатив. AI ускоряет подготовку, но не «улучшает» товар. Vitrina AI Studio не партнёр Kaspi — правила кабинета проверяет продавец. Перед акцией сверьте топ-20 SKU вручную. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Роли: администратор зала, контент, владелец",
          "Администратор снимает новинки по чек-листу, владелец утверждает эталон стиля, контент-менеджер генерирует и выкладывает. Демо-режим обучает сезонного стажёра без списаний. Независимый статус студии: инструкции площадок — в личном кабинете, не у нас. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Омниканал и доверие",
          "Клиент доверяет шоуруму, когда фото online совпадает с залом. AI помогает быстрее обновлять каталог после смены выкладки, если вы фиксируете QA с образцом на полке. Не гонитесь за идеальной картинкой, которой нет в наличии — это дороже любой генерации. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        )
      ],
      forWho: [
        "Мебельные и декор-шоурумы с онлайн-каталогом",
        "Салоны текстиля и света с продажами на Kaspi",
        "Залы с частой сменой выкладки",
        "Бизнесы без отдельной фотостудии",
        "Омниканальные магазины с витриной и маркетплейсом"
      ],
      tasks: [
        "Снять товар в зале без закрытия на студию",
        "Получить белый фон для маркетплейса из интерьерного исходника",
        "Обновить каталог после новой поставки",
        "Согласовать lifestyle для сайта и карточку для Kaspi",
        "Проверить цвет обивки и фактуры после AI",
        "Подготовить серию новинок к сезону",
        "Обучить администратора зала через демо"
      ],
      howHelps: [
        "Снимает пик съёмки без вывоза товара в студию",
        "Даёт белый фон и lifestyle из одного исходника",
        "Ускоряет обновление онлайн-каталога",
        "Поддерживает единый стиль ленты",
        "Демо для обучения персонала зала",
        "Чек-лист QA против расхождения с залом"
      ],
      scenarios: [
        {
          title: "Новая коллекция диванов",
          body: "15 моделей сняты в зале, AI даёт белый фон для Kaspi и нейтральный интерьер для сайта. QA отсеивает два кадра с изменённым оттенком обивки. Каталог online совпадает с залом к открытию сезона.",
        },
        {
          title: "Срочная замена sold-out на фото",
          body: "Позиция закончилась, на сайте старое фото. Администратор снимает аналог, генерирует карточку за час, менеджер проверяет и публикует. Модерация не гарантирована.",
        },
        {
          title: "Instagram и Kaspi параллельно",
          body: "Lifestyle для ленты, белый фон для маркетплейса — из одной сессии в шоуруме. Единый стиль, меньше простоя контента.",
        },
        {
          title: "Приёмка поставки в выходные",
          body: "40 SKU декора: съёмка в зале, батч в Vitrina AI Studio, выборочный QA. К понедельнику каталог обновлён без аренды студии.",
        }
      ],
      limitations:
        "AI может изменить цвет обивки, пропорции мебели, убрать не все посторонние объекты или исказить фактуру. Vitrina AI Studio не гарантирует модерацию Kaspi, Wildberries, Ozon и не является их партнёром. Сверяйте кадр с товаром в зале. Ручная проверка обязательна.",
      faq: [
        {
          question: "Можно ли снимать при покупателях в зале?",
          answer: "Да, при аккуратной съёмке без блокировки проходов. Убирайте ценники из кадра.",
        },
        {
          question: "Подходит для крупной мебели?",
          answer: "Да, если исходник без сильных искажений широкоугольника. QA по цвету и пропорциям обязателен.",
        },
        {
          question: "Гарантирует ли модерацию Kaspi?",
          answer: "Нет. Проверяйте правила в кабинете продавца.",
        },
        {
          question: "Vitrina AI — партнёр площадок?",
          answer: "Нет. Независимый инструмент.",
        },
        {
          question: "Lifestyle для главного фото маркетплейса?",
          answer: "Зависит от правил площадки. Часто нужен белый фон — готовьте оба формата.",
        },
        {
          question: "Есть демо для персонала?",
          answer: "Да. Демо без списаний для обучения администратора зала.",
        }
      ],
    },
    "instagram-shops": {
      meta: "Как Instagram-магазинам готовить AI-фото для ленты, сторис и маркетплейсов: единый визуал, ручной QA в Vitrina AI Studio без гарантии модерации.",
      intro:
        "Instagram-магазин продаёт глазами: лента, сторис и директ должны выглядеть цельно, а часть ассортимента часто дублируется на Kaspi. Vitrina AI Studio помогает из смартфонного исходника собрать чистый product-shot, lifestyle-фон или белую карточку для маркетплейса — без фотографа на каждую новинку. Вы сохраняете контроль: сверяете цвет и детали с реальным товаром до публикации. Страница описывает workflow для соцсетей и площадок, чек-листы QA и ограничения AI — без обещаний модерации и без статуса официального партнёра Kaspi, Wildberries или Ozon.",
      sections: [
        sec(
          "Лента, сторис и product-shot",
          "Разделите форматы: квадрат 1:1 для ленты, вертикаль 9:16 для сторис, белый фон для Kaspi при необходимости. Снимайте при мягком свете, избегайте жёстких теней от кольцевой лампы без диффузора. Vitrina AI Studio генерирует варианты фона под эстетику бренда — pastel, нейтральный интерьер, чистый white. Сравните с исходником: AI может «подтянуть» оттенок упаковки или косметики. Не публикуйте без QA — подписчики быстро ловят несоответствие при получении. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Единый визуальный код бренда",
          "Хаотичная лента снижает доверие. Задайте 2–3 пресета фона и чередуйте их предсказуемо. Hero-посты можно снимать вручную с реквизитом, массовые SKU — AI после шаблонной съёмки на столе. Сохраняйте исходники по артикулам — при смене тренда пересоберёте фон за минуты. Демо-режим помогает передать стиль новому SMM без списаний. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Дублирование на Kaspi и маркетплейсы",
          "Многие Instagram-продавцы открывают кабинет на Kaspi. Главное фото площадки часто строже, чем эстетика ленты: белый фон, без текста и водяных знаков. Экспортируйте отдельную версию из того же исходника. Vitrina AI Studio не партнёр Kaspi — правила читайте в кабинете. Ручной QA обязателен: то, что «заходит» в Instagram, может не пройти модерацию маркетплейса. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Скорость новинок и drops",
          "Drop из 10 позиций в пятницу требует контента в тот же день. AI закрывает рутину: фон, лёгкая чистка, второй ракурс. Вы публикуете сторис «в наличии», пока менеджер проходит QA. Две позиции отправьте на пересъёмку, если AI исказил принт или фактуру — лучше задержка на час, чем спор в директе. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "UGC и этика «честного» кадра",
          "Подписчики прощают простой свет, но не обман цвета или размера. Не используйте AI, чтобы сделать товар «дороже», чем он есть. Сверяйте украшения, косметику и одежду с образцом. Возвраты из директа дороже одной генерации. Сервис не гарантирует модерацию и не является партнёром площадок. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Контент-план и батчи",
          "Раз в неделю снимайте батч 15–20 SKU одной сессией света. Прогоняйте через Vitrina AI Studio, планируйте ленту на 7 дней. Так вы не живёте в режиме «срочно сфоткать перед постом». QA выборочно + все дорогие позиции. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Один человек или микрокоманда",
          "Часто Instagram-магазин — владелец плюс ассистент. Владелец задаёт эстетику, ассистент снимает и генерирует. Демо обучает без списаний. При росте подключайте менеджера Kaspi для отдельного QA под маркетплейс. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        )
      ],
      forWho: [
        "Магазины с продажами через Instagram и директ",
        "Бренды с регулярными drops и новинками",
        "Продавцы, дублирующие ассортимент на Kaspi",
        "SMM без штатного фотографа",
        "Нишевые бренды косметики, аксессуаров, декора"
      ],
      tasks: [
        "Подготовить product-shot для ленты и сторис",
        "Собрать белую карточку для Kaspi из того же исходника",
        "Держать единый стиль 20+ постов",
        "Ускорить контент к drop",
        "Проверить цвет и детали после AI",
        "Сделать второй ракурс без пересъёмки",
        "Обучить ассистента в демо-режиме"
      ],
      howHelps: [
        "Ускоряет контент для ленты без фотографа каждый день",
        "Даёт варианты фона под эстетику бренда",
        "Экспортирует версию под маркетплейс",
        "Снижает стоимость рутинных карточек",
        "Демо для onboarding SMM",
        "Чек-лист QA перед постом и загрузкой на Kaspi"
      ],
      scenarios: [
        {
          title: "Пятничный drop аксессуаров",
          body: "10 новых сумок: съёмка на столе, AI-фон под бренд, QA по фурнитуре. Лента и сторис выходят вечером, белые версии — на Kaspi в понедельник после отдельной сверки правил. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Ребрендинг ленты",
          body: "Новый pastel-пресет применён к 30 архивным исходникам. Лента выглядит цельно без пересъёмки. Два кадра отклонены из-за сдвига оттенка кожи. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Жалоба на цвет в директе",
          body: "После инцидента вводят обязательный QA с образцом. Следующая партия косметики публикуется только после zoom-проверки этикетки и оттенка.",
        },
        {
          title: "Kaspi отклонил главное фото",
          body: "Версия из Instagram с текстом на фоне не подошла. Из исходника генерируют чистый white, проверяют справку Kaspi. Vitrina AI Studio не партнёр площадки.",
        }
      ],
      limitations:
        "AI может изменить оттенок, текст на упаковке, форму товара или фон с запрещёнными элементами. Vitrina AI Studio не гарантирует модерацию Kaspi, Wildberries, Ozon и не является их партнёром. Ручная проверка перед постом и загрузкой обязательна.",
      faq: [
        {
          question: "Можно ли использовать те же фото для Instagram и Kaspi?",
          answer: "Часто нужны разные версии. Маркетплейс часто требует белый фон без текста.",
        },
        {
          question: "Нужен ли фотограф?",
          answer: "Для старта часто хватает смартфона и QA. Hero-кampanii могут требовать живую съёмку.",
        },
        {
          question: "Гарантирует ли модерацию?",
          answer: "Нет. Ответственность за публикацию на продавце.",
        },
        {
          question: "Vitrina AI — партнёр Instagram?",
          answer: "Нет. Независимый инструмент для подготовки изображений.",
        },
        {
          question: "Подходит для сторис 9:16?",
          answer: "Да, при правильном экспорте и QA исходника.",
        },
        {
          question: "Есть демо?",
          answer: "Да. Без списаний — для обучения и согласования стиля.",
        }
      ],
    },
    "online-stores": {
      meta: "Как интернет-магазинам готовить AI-фото для сайта, Kaspi и других каналов: каталог, PDP, ручной QA в Vitrina AI Studio без гарантии модерации.",
      intro:
        "Интернет-магазин живёт в каталоге: карточка товара, листинг, email и маркетплейс должны показывать один и тот же SKU честно. Vitrina AI Studio помогает из исходника собрать белый фон, lifestyle и дополнительные ракурсы для сайта и Kaspi — без студии на каждую позицию. Вы сохраняете контроль: сверяете цвет, комплектацию и детали с складским образцом до публикации. Страница описывает omnichannel-workflow, чек-листы QA и ограничения AI — без обещаний модерации и без статуса официального партнёра Kaspi, Wildberries или Ozon.",
      sections: [
        sec(
          "Каталог, PDP и листинг",
          "Главное фото влияет на CTR в категории и на bounce на странице товара. Снимайте исходник при ровном свете, храните по SKU в DAM или папках. Vitrina AI Studio генерирует white, нейтральный фон и альтернативные ракурсы для галереи PDP. Согласуйте пропорции: 1:1 для сетки, 4:5 или 3:4 для hero-блока темы. Не дублируйте один AI-кадр пять раз с минимальными отличиями — покупатель и SEO страдают. QA каждого SKU перед выгрузкой в CMS. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Синхронизация сайта и Kaspi",
          "Многие магазины ведут Kaspi как второй канал. Правила главного фото могут отличаться от дизайна сайта. Держите мастер-исходник и экспортируйте канал-специфичные версии. Vitrina AI Studio не партнёр Kaspi — модерацию проверяет менеджер кабинета. Расхождение фото сайта и маркетплейса ведёт к возвратам и жалобам. Ручная сверка обязательна. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Масштаб SKU и импорт",
          "При импорте 500 SKU из ERP фото часто отсутствуют. Приоритизируйте топ-продажи и новинки, снимайте батчами по 25–30 позиций. AI закрывает белый фон и чистку; hero-категории оставьте на живую съёмку. Выгрузка в CSV/XML идёт после QA, не до — иначе переделывать весь фид. Пресеты ускоряют повторяющиеся категории: электроника, home, beauty. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "QA для снижения возвратов",
          "Проверяйте цвет, размер в кадре, комплектацию, текст на упаковке. AI может изменить оттенок или «дополнить» аксессуар в наборе. Сравнивайте с образцом со склада. В ecommerce возврат дороже генерации — чек-лист на 30 секунд окупается. Сервис не гарантирует модерацию Wildberries или Ozon, если вы продаёте и там. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Сезонные кампании и промо",
          "К Black Friday нужен единый баннерный стиль в листинге. Примените один seasonal-пресет к топ-SKU, не трогая факт товара. QA флагманов вручную. AI ускоряет подготовку, но не заменяет промо-дизайн баннеров вне карточки. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "CMS, маркетинг и разработка",
          "Маркетинг задаёт стандарт, контент-менеджер генерирует, разработчик следит за весом файлов и alt-текстами. Vitrina AI Studio встраивается между съёмкой и CMS. Демо для onboarding фрилансера без списаний. Независимый статус: правила маркетплейсов — в кабинете продавца. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Мультиканал и аналитика",
          "Сравнивайте CTR карточек с AI-фоном и старыми фото в аналитике. Гипотезы фиксируйте письменно. Не улучшайте товар визуально beyond реальности — A/B выигрыш обнуляется возвратами. Ручной QA защищает LTV. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        )
      ],
      forWho: [
        "Интернет-магазины на собственной CMS или SaaS",
        "Ритейлеры с сайтом и кабинетом Kaspi",
        "Каталоги от 100 SKU без штатной студии",
        "Команды с импортом товаров из ERP",
        "Магазины, снижающие возвраты из-за фото"
      ],
      tasks: [
        "Заполнить галерею PDP белым фоном и ракурсами",
        "Синхронизировать визуал сайта и Kaspi",
        "Ускорить импорт фото для сотен SKU",
        "Провести QA перед выгрузкой в CMS",
        "Обновить сезонный листинг",
        "Адаптировать кадр под Wildberries или Ozon",
        "Обучить контент-менеджера в демо"
      ],
      howHelps: [
        "Масштабирует фото каталога без студии каждый день",
        "Даёт версии под сайт и маркетплейс",
        "Снижает стоимость рутинных карточек",
        "Поддерживает чек-лист QA",
        "Ускоряет seasonal-обновления",
        "Демо без списаний для команды"
      ],
      scenarios: [
        {
          title: "Импорт 200 SKU без фото",
          body: "Топ-80 снимают за неделю, AI даёт white для листинга. QA отсеивает 6 кадров с неверной этикеткой. Фид загружен в CMS и Kaspi после проверки менеджером. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Редизайн категории home",
          body: "Единый нейтральный фон для 45 позиций. Листинг выглядит как у крупного ритейлера. CTR +12% без роста возвратов по отчёту магазина. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Расхождение сайт vs Kaspi",
          body: "Клиент жалуется на другой оттенок. Причина — старое фото на сайте. Обновляют оба канала из одного QA-утверждённого исходника.",
        },
        {
          title: "Срочная замена out-of-stock фото",
          body: "Аналог снят на складе, AI-карточка за час, публикация после QA. Модерация Kaspi не гарантирована.",
        }
      ],
      limitations:
        "AI может изменить цвет, комплектацию, текст на упаковке или пропорции. Vitrina AI Studio не гарантирует модерацию Kaspi, Wildberries, Ozon и не является их партнёром. Сверяйте с образцом со склада. Ручная проверка обязательна.",
      faq: [
        {
          question: "Можно ли автоматически выгружать в CMS?",
          answer: "Выгрузка — на вашей стороне. Студия готовит изображения после QA.",
        },
        {
          question: "Одинаковые фото для сайта и Kaspi?",
          answer: "Рекомендуем мастер-исходник и канал-специфичный экспорт.",
        },
        {
          question: "Гарантирует модерацию?",
          answer: "Нет.",
        },
        {
          question: "Vitrina AI — партнёр маркетплейсов?",
          answer: "Нет.",
        },
        {
          question: "Подходит для больших каталогов?",
          answer: "Да, с батчами и пресетами. Hero-SKU можно снимать отдельно.",
        },
        {
          question: "Демо для команды?",
          answer: "Да, без списаний.",
        }
      ],
    },
    "marketplace-managers": {
      meta: "Как менеджерам маркетплейсов организовать AI-фото для Kaspi, Wildberries и Ozon: процессы, QA, масштаб SKU в Vitrina AI Studio.",
      intro:
        "Менеджер маркетплейса отвечает за карточки, модерацию и KPI витрины — при этом фото часто делает кто-то другой. Vitrina AI Studio даёт воспроизводимый процесс: исходник → генерация → ручной QA → загрузка в кабинет Kaspi, Wildberries или Ozon. Вы не получаете автоматическую модерацию и не работаете через «официального партнёра» площадки — финальная сверка с правилами кабинета на вас. Страница описывает регламенты, чек-листы и ограничения AI для команд, которые масштабируют десятки и сотни SKU.",
      sections: [
        sec(
          "Регламент от исходника до кабинета",
          "Зафиксируйте pipeline: кто снимает, кто генерирует в Vitrina AI Studio, кто утверждает QA, кто загружает. Минимальное разрешение исходника, naming по SKU, срок SLA на новую карточку — в одном документе. Без регламента AI ускоряет хаос: версии путаются, модерация отклоняет серии. Демо-режим — для обучения нового ассистента без списаний. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Чек-лист QA менеджера",
          "30 секунд на кадр: цвет, форма, логотипы, текст, края, лишние объекты. Исходник слева, результат справа. Отклоняйте системные ошибки AI до загрузки — отклонение модерацией стоит дороже. Для серий проверяйте согласованность ленты. Vitrina AI Studio не гарантирует прохождение модерации — чек-лист ваша страховка. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Kaspi, Wildberries, Ozon: разные правила",
          "Ведите таблицу отличий: пропорции, фон, запрет текста. Vitrina AI Studio не партнёр площадок — актуальные правила только в справке кабинета. Экспортируйте версии из мастера, не перезагружайте Instagram-кадр на WB. Перед акцией перечитывайте справку — правила меняются. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Масштаб и приоритизация SKU",
          "Не всё SKU одинаково срочно. Матрица: новинки и топ-продажи — первыми; хвост — батчами. AI на рутине, студия на hero. KPI: время от приёмки товара до live-карточки. Выборочный QA каждого 10-го + все A-SKU. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Коммуникация с владельцем и складом",
          "Менеджер запрашивает образцы для съёмки, возвращает брак QA складу. Прозрачные причины отклонения кадра снижают споры. Независимый статус студии: не ссылайтесь на «Vitrina одобрила» перед модерацией — так нельзя. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Отчётность и инциденты модерации",
          "Логируйте отклонения: причина, SKU, был ли AI. Если паттерн — меняйте пресет или исходник, не жмите «ещё генерацию». Обучайте команду на демо без списаний. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Рост CTR без роста возвратов",
          "Тестируйте фон и ракурс на топ-SKU с фиксацией гипотез. Выигрыш только при стабильных возвратах. Честное фото важнее «кликбейта» от AI. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        )
      ],
      forWho: [
        "Менеджеры кабинетов Kaspi, Wildberries, Ozon",
        "Агентства, ведущие маркетплейсы для клиентов",
        "In-house команды с сотнями SKU",
        "Team lead контента на площадках",
        "Специалисты по модерации и карточкам"
      ],
      tasks: [
        "Внедрить регламент AI-фото в команде",
        "Проводить QA перед каждой загрузкой",
        "Масштабировать карточки к акции",
        "Вести версии под разные площадки",
        "Обучить ассистентов через демо",
        "Анализировать отклонения модерации",
        "Согласовать единый стиль ленты"
      ],
      howHelps: [
        "Даёт воспроизводимый workflow",
        "Ускоряет рутинные SKU",
        "Поддерживает чек-лист QA",
        "Снижает переделки после модерации",
        "Демо для onboarding",
        "Пресеты для серий"
      ],
      scenarios: [
        {
          title: "100 SKU к распродаже",
          body: "Регламент: 2 оператора съёмка, 1 менеджер QA, батч в Vitrina AI Studio. 94 карточки live за 4 дня, 6 на пересъёмку. Модерация не гарантирована. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Отклонение серии на WB",
          body: "Причина — разный фон. Менеджер задаёт один пресет, перегенерирует серию, повторная загрузка после QA. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Новый ассистент",
          body: "Первую неделю только демо и QA под supervision. Списаний нет, ошибок в кабинет — тоже. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Клиент агентства на Kaspi и Ozon",
          body: "Два экспорта из мастера, две сверки справок. Vitrina AI Studio не партнёр площадок. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        }
      ],
      limitations:
        "AI может искажать товар. Vitrina AI Studio не гарантирует модерацию и не является партнёром Kaspi, Wildberries, Ozon. Менеджер несёт ответственность за загрузку после ручного QA. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов.",
      faq: [
        {
          question: "Можно ли делегировать QA ассистенту?",
          answer: "Да, с обучением и выборочным контролем менеджера.",
        },
        {
          question: "Гарантирует ли студия модерацию?",
          answer: "Нет.",
        },
        {
          question: "Как вести версии?",
          answer: "Папки по SKU и суффикс канала: _kaspi, _wb.",
        },
        {
          question: "Vitrina AI — партнёр площадок?",
          answer: "Нет.",
        },
        {
          question: "Демо для агентства?",
          answer: "Да, для обучения нескольких кабинетов.",
        },
        {
          question: "Что при массовом отклонении?",
          answer: "Стоп генерации, аудит исходника и пресета, не бесконечные retry.",
        }
      ],
    },
    "photographers-content-managers": {
      meta: "Как фотографам и контент-менеджерам встроить Vitrina AI Studio в production: исходники, QA, маркетплейсы Kaspi, Wildberries, Ozon.",
      intro:
        "Фотограф и контент-менеджер — связка, которая кормит каталог. Vitrina AI Studio не заменяет профессиональный глаз, но снимает рутину: белый фон, варианты ракурса, адаптация под Kaspi, Wildberries или Ozon из качественного исходника. Вы сохраняете контроль: CM проводит QA, фотограф задаёт стандарт съёмки. Страница описывает handoff, чек-листы и ограничения AI — без обещаний модерации и без статуса официального партнёра площадок.",
      sections: [
        sec(
          "Handoff: RAW → AI → QA",
          "Фотограф сдаёт JPEG/RAW с ровным светом и цветовым профилем. CM загружает в Vitrina AI Studio, выбирает сценарий, генерирует варианты. QA сравнивает с исходником — не с «как красивее», а с «как честнее». Спорные кадры возвращаются фотографу или переснимаются. Так AI остаётся инструментом, а не чёрным ящиком. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Стандарт съёмки под AI",
          "Минимизируйте ретушь до AI: чистый фон на съёмке ускоряет результат. Для маркетплейсов снимайте запас по кадрированию под 1:1 и 3:4. Фиксируйте white balance. Плохой исходник = дорогой QA. Демо показывает CM, что нужно от set. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Ретушь vs генерация",
          "Не дублируйте работу: если фон уже white в студии, AI только для вариантов и каналов. Для lifestyle CM может усилить фон, но QA ловит лишние объекты. Vitrina AI Studio не гарантирует модерацию. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Kaspi, Wildberries, Ozon из одного мастера",
          "Фотограф снимает мастер, CM экспортирует каналы. Правила — в кабинете, не у нас. Независимый статус студии. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Батчи и naming",
          "SKU_001_master.jpg, SKU_001_kaspi.jpg. Pipelines в облаке или локально. Батчи по 30 после одной студийной сессии. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Обучение и демо",
          "Новый CM проходит демо без списаний, затем QA под фотографом. Документируйте отклонённые паттерны AI. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Качество бренда",
          "Hero — живой свет, mass — AI после QA. Бренд не размывается, если стандарт задан фотографом. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        )
      ],
      forWho: [
        "In-house фотографы ecommerce",
        "Контент-менеджеры каталогов",
        "Студии на аутсорсе для маркетплейсов",
        "Фрилансеры photo + CM duet",
        "Команды с Kaspi, WB, Ozon"
      ],
      tasks: [
        "Настроить handoff фото → AI → QA",
        "Снимать исходники под маркетплейсы",
        "Экспортировать каналы из мастера",
        "Вести naming и архив SKU",
        "Обучить CM через демо",
        "Отсеивать AI-брак до загрузки",
        "Согласовать стиль серий"
      ],
      howHelps: [
        "Снимает рутину white и вариантов",
        "Ускоряет CM после съёмки",
        "Единый процесс для каналов",
        "Демо для onboarding",
        "Меньше ручной ретуши",
        "Чек-лист QA встроен в workflow"
      ],
      scenarios: [
        {
          title: "Студийная сессия 40 SKU",
          body: "Фотограф снимает за день, CM прогоняет AI ночью, утром QA — 35 ok, 5 reshoot. Kaspi загрузка после менеджера. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Фриланс CM новый проект",
          body: "Демо + документ стандарта от фотографа. Первую неделю без live без подписи QA lead. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "WB отклонил серию",
          body: "CM меняет экспорт 3:4 из того же RAW, не новая студия. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Beauty macro",
          body: "Macro от фотографа, AI только фон. QA этикетки zoom 200%. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        }
      ],
      limitations:
        "AI может испортить этalonный кадр фотографа. Не гарантируем модерацию, не партнёры Kaspi, WB, Ozon. QA CM обязателен. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов.",
      faq: [
        {
          question: "Заменяет ли AI фотографа?",
          answer: "Нет. Ускоряет CM и рутину при хорошем исходнике.",
        },
        {
          question: "RAW или JPEG?",
          answer: "Качественный JPEG достаточен; RAW для спорных цветов.",
        },
        {
          question: "Модерация?",
          answer: "Не гарантируется.",
        },
        {
          question: "Партнёр площадок?",
          answer: "Нет.",
        },
        {
          question: "Демо для CM?",
          answer: "Да.",
        },
        {
          question: "Кто финальный QA?",
          answer: "CM или менеджер маркетплейса по регламенту.",
        }
      ],
    },
    "small-ecommerce-teams": {
      meta: "Как малым e-commerce командам готовить AI-фото для Kaspi, сайта и соцсетей: мало людей, много SKU, ручной QA в Vitrina AI Studio.",
      intro:
        "В малой e-commerce команде один человек часто совмещает закупку, контент и Kaspi. Vitrina AI Studio помогает не нанимать студию на каждую партию: белый фон, второй ракурс и единый стиль из смартфона. Вы сохраняете контроль через короткий QA — сервис не гарантирует модерацию и не является партнёром Kaspi, Wildberries или Ozon. Страница — про практичный workflow для 1–3 человек и растущего каталога.",
      sections: [
        sec(
          "Один человек, три роли",
          "Утром приёмка, днём съёмка на столе, вечером генерация и загрузка. Vitrina AI Studio сокращает вечернюю рутину. Чек-лист QA на 30 секунд — обязателен, иначе модерация и возвраты съедят экономию. Демо учит без списаний, пока нет бюджета на обучение. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Смартфон как студия",
          "Два софтбокса или окно + отражатель. Снимайте батчами по 15 SKU. AI даёт white и чистку. Hero-товар раз в месяц можно отдать фриланс-фотографу. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Приоритет SKU",
          "Новинки и топ-5 продаж — первыми. Хвост каталога — по мере сил. Не гонитесь за 100% AI без QA ресурса. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Kaspi + Instagram + сайт",
          "Мастер-исходник, три экспорта. Правила Kaspi строже — отдельная сверка. Vitrina AI Studio не партнёр площадок. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Бюджет старта",
          "Сравните пакет генераций с одним днём студии. AI выигрывает на mass SKU при дисциплине QA. Не обещайте себе «модерация сама». Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Когда нанять помощь",
          "При 50+ SKU в месяц — part-time ассистент на съёмку. CM или менеджер Kaspi — при втором канале Wildberries/Ozon. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        ),
        sec(
          "Рост без потери качества",
          "Пресеты, naming, воскресный батч. Ручной QA флагманов. Честное фото удерживает рейтинг магазина. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов."
        )
      ],
      forWho: [
        "Команды 1–3 человека с растущим каталогом",
        "Стартапы на Kaspi и Instagram",
        "Семейный бизнес с онлайн-каналом",
        "Side-project с ограниченным бюджетом",
        "Магазины без штатного фотографа"
      ],
      tasks: [
        "Закрыть фото новинок за вечер",
        "Держать белый фон на Kaspi",
        "Не нанимать студию на каждую партию",
        "QA за 30 секунд на SKU",
        "Единый стиль ленты",
        "Обучиться через демо",
        "Масштабировать к сезону"
      ],
      howHelps: [
        "Экономит время малой команды",
        "Снимает рутину white",
        "Демо без списаний",
        "Пресеты для повторения",
        "Варианты ракурса",
        "Чек-лист QA"
      ],
      scenarios: [
        {
          title: "Основатель один на всё",
          body: "20 SKU за воскресенье: съёмка, AI, QA, загрузка Kaspi. 2 кадра пересняты из-за цвета. Без студии. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Первый помощник",
          body: "Демо для ассистента, founder только QA флагманов. Каталог x2 за месяц. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Отклонение на Kaspi",
          body: "Перегенерация white из исходника за час. Не гарантия модерации. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        },
        {
          title: "Сезонная распродажа",
          body: "Единый фон для 30 SKU за 2 дня. Экономия vs студия по смете founder. Менеджер проходит QA: исходник слева, результат справа, zoom 100%. Отклонённые кадры не публикуются — лучше задержка, чем простой карточки. Vitrina AI Studio не гарантирует одобрение модерации; ответственность за загрузку несёт продавец или менеджер кабинета.",
        }
      ],
      limitations:
        "AI может ошибаться; малая команда особенно уязвима без QA. Не гарантируем модерацию, не партнёры Kaspi, WB, Ozon. Ручная проверка обязательна. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов. Сверьте результат с живым товаром и актуальной справкой кабинета Kaspi, Wildberries или Ozon — правила меняются. Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации. Ручная проверка обязательна: цвет, форма, текст на упаковке, края маски и комплектация. Демо-режим помогает обучить команду без списаний и реальных AI-вызовов.",
      faq: [
        {
          question: "Хватит ли одного человека?",
          answer: "На старте — да, с батчами и QA. Рост требует помощника.",
        },
        {
          question: "Нужна студия?",
          answer: "Нет для mass SKU. Hero — по желанию.",
        },
        {
          question: "Модерация?",
          answer: "Не гарантируется.",
        },
        {
          question: "Партнёр Kaspi?",
          answer: "Нет.",
        },
        {
          question: "Демо?",
          answer: "Да, для обучения без бюджета.",
        },
        {
          question: "Wildberries/Ozon?",
          answer: "Да, с отдельным экспортом и QA под правила.",
        }
      ],
    },
};

const EN_COPY = {
    "marketplace-sellers": {
      meta: "How marketplace sellers prepare AI product photos for Kaspi, Wildberries, and Ozon: workflow, manual QA, limits, and catalog scale in Vitrina AI Studio.",
      intro:
        "Marketplace sellers live by SKU cadence, promos, and penalties for weak main images. Vitrina AI Studio helps you turn one source shot into a white background, clean card, and angle variants without booking a studio every day. You stay in control: compare color, shape, and details to the real item before publishing. This page covers a typical process for Kaspi, Wildberries, and Ozon, QA checklists, and honest AI limits — no automatic moderation promises and no official marketplace partner status. Use demo mode to train assistants before spending credits on live generations.",
      sections: [
        sec(
          "Marketplace seller workflow",
          "Start with product photos in even light: no harsh glare, clipped edges, or extra objects in frame. In Vitrina AI Studio choose an accurate card or marketplace white-background scenario, generate two or three variants, and mark the best after comparing to the source. For apparel and accessories decide upfront whether you need flat lay or a separate on-model scenario — do not mix modes in one card without reason. Export square or 3:4 for the main image, keep sources in SKU folders so you can rebuild when platform rules change. Demo mode helps train a cabinet manager without charges or live AI calls."
        ),
        sec(
          "Kaspi, Wildberries, and Ozon requirements",
          "Each platform has its own main-image rules: background, product share in frame, bans on extra text and watermarks. Vitrina AI Studio is not an official partner of Kaspi, Wildberries, or Ozon, so compare results to current seller-cabinet help before upload. Kaspi often cares about readable product and no stray objects; Wildberries about series style; Ozon about sharp details and allowed ratios. If the category needs infographics or video, plan separately — AI covers the base card, not every format. Rules change; final responsibility stays with the seller."
        ),
        sec(
          "Quality control after generation",
          "Check body color and hardware, geometry, seams, print, logos, mask edges, and shadows. AI may shift shade, smooth texture, or alter small patterns — do not publish those blindly. Use a 30-second checklist: source left, result right, 100% zoom. For series of dozens of SKUs compare individual frames and feed consistency. When in doubt regenerate with another background or reshoot a reference angle. Vitrina AI Studio does not guarantee moderation pass — manual review is mandatory."
        ),
        sec(
          "Scaling the catalog without a daily studio",
          "When new SKUs outnumber photographer hours, AI removes peak load on routine cards: white background, light cleanup, unified style. Split SKUs into A/B: A AI-only after phone capture; B hybrid with studio for hero items. You speed launches without blurring flagship quality. Store background and export presets so the team repeats settings. Plan batches of 20–30 SKUs in one light session — cheaper than scattered shoots all month. Unified visuals matter on Kaspi and Wildberries category feeds."
        ),
        sec(
          "Budget: shoot, retouch, and AI",
          "Count not only generation price but manager time on QA. For mass catalogs AI is often cheaper than repeat photographer visits if sources are clean. For premium categories keep budget for live shoots and use Vitrina AI Studio to adapt for platforms and seasonal backgrounds. Compare cost of rejected moderation and card downtime — one reshoot can exceed a generation pack. Transparent workflow with demo and checklist cuts rework. The service does not promise automatic approval by Ozon, WB, or Kaspi moderators."
        ),
        sec(
          "Roles on the seller team",
          "Owner sets brand standard, marketplace manager owns platform compliance, assistant prepares sources and uploads variants. Vitrina AI Studio sits between assistant and manager: first shoots and generates, second approves after QA. With an external photographer agree on RAW/JPEG handoff and SKU folder naming. That avoids version chaos and speeds promo publish. Independent studio status means platform instructions are always checked in the seller cabinet, not through us."
        ),
        sec(
          "Sales growth and visual shelf",
          "Strong main photography lifts CTR on Kaspi, Wildberries, and Ozon, but retention comes from accurate delivery. AI helps test background and angle faster if you log hypotheses: which series improved clicks without return spikes. Add sequential angles and macro details where secondary photos are allowed. Do not chase a perfect image that mismatches shipment — that costs more than any generation. Manual QA protects rating and cuts mismatch complaints."
        )
      ],
      forWho: [
        "Sole traders and shops on Kaspi, Wildberries, Ozon",
        "Sellers with growing catalogs and limited shoot time",
        "Teams without staff photographer but with cabinet manager",
        "Brands launching seasonal lines on multiple platforms",
        "Sellers who need consistent card style in the feed"
      ],
      tasks: [
        "Prepare main photo on white or neutral background",
        "Build accurate card from phone source",
        "Align a series of 10–50 SKUs before a promo",
        "Swap background for another marketplace quickly",
        "Remove clutter and noise from frame",
        "Add extra angle without second shoot",
        "Train assistant via demo mode"
      ],
      howHelps: [
        "Speeds routine cards without daily studio",
        "Offers 2–3 background and angle variants per source",
        "Supports manual QA checklist against product",
        "Lowers rework cost on mass SKUs",
        "Helps keep consistent visual feed",
        "Demo without charges for team training"
      ],
      scenarios: [
        {
          title: "New line on Kaspi over a weekend",
          body: "An electronics seller gets 25 SKUs from one supplier. Assistant shoots on a table with two softboxes, Vitrina AI Studio generates white background and compares glare on the body. Manager manually approves 23 cards; two go for reshoot due to distorted logo. Line is in Kaspi cabinet by Monday without studio rental. Moderation not guaranteed — each frame checked against sample.",
        },
        {
          title: "Moving a card from Ozon to Wildberries",
          body: "Main Ozon photo fails WB visual style. Team takes source, changes background and 3:4 export, checks product share and reads WB cabinet help. Publish without new shoot, saving a day and sample logistics. Vitrina AI Studio is not a Wildberries partner — moderator decision stays with the platform.",
        },
        {
          title: "Seasonal promo with one background",
          body: "Forty SKUs need warm neutral background on Kaspi and Ozon. Designer sets preset, assistant runs batch, manager spot-checks every tenth plus all heroes. CTR rises, returns flat because product unchanged — only background. Manual QA filters frames with shifted body color.",
        },
        {
          title: "Urgent fix after moderation rejection",
          body: "Card returned for extra prop in frame. Seller uploads source without prop, runs cleanup in studio, checks edges, re-uploads to cabinet. Downtime drops from two shoot days to one QA hour. Service does not promise automatic approval — manager checks current platform rules.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without review?",
          answer: "No. Compare color, shape, print, logos, and edges to source. Reject distorted variants before Kaspi, Wildberries, or Ozon upload.",
        },
        {
          question: "Does Vitrina AI guarantee moderation?",
          answer: "No. It helps prepare visuals; platform rules change. The seller owns final check and publish responsibility.",
        },
        {
          question: "Is this for on-model apparel?",
          answer: "Apparel has a separate on-AI-model scenario. This page focuses on product cards and white background for marketplaces.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. Independent tool. Read current platform requirements in the seller cabinet.",
        },
        {
          question: "Can we use demo mode?",
          answer: "Yes. Demo shows workflow without charges or live AI calls — good for team training and QA checklist agreement.",
        },
        {
          question: "Do we need a pro studio?",
          answer: "Often a phone and even light are enough to start. Premium categories and complex macro may still need studio or photographer.",
        }
      ],
    },
    "clothing-sellers": {
      meta: "How apparel sellers prepare AI clothing photos for Kaspi, Wildberries, and Ozon: flat lay, on-model shots, fabric color QA, and catalog scale in Vitrina AI Studio.",
      intro:
        "Apparel wins or loses in the first second: shoppers judge fit, length, and shade from the main image. Vitrina AI Studio helps you build flat lay, clean white-background cards, or on-AI-model variants from one source—without booking a studio and model every day. You stay in control: compare fabric color, print, seams, and proportions to the real garment before publishing. This page covers workflow for Kaspi, Wildberries, and Ozon, textile QA checklists, and honest AI limits—no automatic moderation promises and no official marketplace partner status.",
      sections: [
        sec(
          "Flat lay and white-background cards",
          "For core SKUs start with an even flat lay: garment laid flat without folds that hide cut lines, tags moved or removed. In Vitrina AI Studio pick the apparel neutral-background scenario, generate two or three variants, and compare fabric shade to the source shot in daylight. Do not mix flat lay and on-model in one card without reason—platforms and buyers expect consistency. Export square or 3:4 for Kaspi or Wildberries main images, store sources by SKU. For series of dozens of items set one background preset so the category feed looks unified. Demo mode helps train an assistant without charges. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "On-AI-model scenario for apparel",
          "When the category needs fit, sleeve length, or silhouette, use a separate on-AI-model scenario. Upload a quality source: front, profile, or flat lay with readable cut lines. Generate variants, then manually verify proportions, garment length, and color against the sample. AI may slim the waist, lengthen sleeves, or smooth texture—do not publish those blindly. Match size chart and copy to what the buyer sees. Vitrina AI Studio does not guarantee moderation on Ozon, WB, or Kaspi—final responsibility stays with the seller."
        ),
        sec(
          "Fabric color and print control",
          "Textile reacts to white balance: the same sweater can look cooler or warmer after AI. Keep a reference: window light shot plus fabric swatch when possible. In QA compare overall tone and small print, stripes, chest logos. Reject variants where pattern drifted or knit texture vanished. For denim and leather check seams and hardware at 100% zoom. A series of twenty SKUs should look consistent—review the feed as a whole. Manual review is mandatory; the service does not promise automatic moderator approval."
        ),
        sec(
          "Marketplace rules for apparel",
          "Kaspi, Wildberries, and Ozon each have main-image rules for clothing: background, ban on extra text, sometimes requirements for with or without model. Vitrina AI Studio is not an official partner—read current seller-cabinet help before upload. Wildberries often cares about series style; Kaspi about readable cut and no stray objects; Ozon about sharp details and allowed ratios. Plan size-chart infographics separately: AI covers the base card, not every format. Rules change—recheck before major promos."
        ),
        sec(
          "Seasonal collections and mass catalog",
          "When a new collection is fifty to one hundred SKUs, AI removes peak load on routine shots: white background, light cleanup, unified flat lay style. Split SKUs: hero lines get model or studio shoots, mass tail gets AI after phone capture. Plan batches of twenty to thirty items in one light session with one export preset. You hit promo start on Kaspi and Wildberries without hiring a photographer every season. Store presets in Vitrina AI Studio so the team repeats settings. Spot-check every tenth frame plus all heroes balances speed and quality."
        ),
        sec(
          "Returns, rating, and honest photos",
          "Color or length mismatch on photos is a top return driver for apparel. AI helps test background and angle faster but must not beautify beyond reality. Log hypotheses: which flat lay lifted CTR without return spikes. Add secondary angles and fabric macro where platforms allow extra images. Do not chase a perfect image that mismatches shipment—that costs more than any generation. Manual QA protects store rating and cuts buyer complaints. The service does not promise automatic moderation approval."
        ),
        sec(
          "Roles: brand, buying, content",
          "Brand owner sets visual standard, buyer passes samples, content manager generates and uploads to cabinets. Vitrina AI Studio sits between shoot and publish: assistant prepares sources, manager approves after QA. With an external photographer agree on handoff format and SKU folder naming. Independent studio status means Kaspi, Wildberries, and Ozon instructions are checked in the seller cabinet, not through us. Demo mode onboard new staff without charges or live AI calls."
        )
      ],
      forWho: [
        "Apparel brands on Kaspi, Wildberries, and Ozon",
        "Sellers with seasonal collections and hundreds of SKUs",
        "Shops without daily model and studio access",
        "Teams needing flat lay and on-AI-model shots",
        "Sellers cutting returns from wrong color on photos"
      ],
      tasks: [
        "Build flat lay on white for main image",
        "Generate on-AI-model shot to show fit",
        "Match fabric color to reference sample",
        "Prepare a series of 20–50 SKUs before a promo",
        "Adapt card for another marketplace",
        "Check print, seams, and length after AI",
        "Train assistant via demo mode"
      ],
      howHelps: [
        "Speeds flat lay and base cards without daily studio",
        "Offers on-AI-model variants from one source",
        "Supports fabric color and cut QA checklist",
        "Lowers seasonal shoot cost on mass catalogs",
        "Helps keep unified apparel feed style",
        "Demo without charges for team training"
      ],
      scenarios: [
        {
          title: "New autumn collection in a week",
          body: "A casual brand gets forty SKUs. Assistant shoots flat lay by the window, Vitrina AI Studio generates white background and three hero on-AI-model shots. Manager manually matches knit shade to samples, rejects two frames with distorted cut. Collection is in Kaspi and Wildberries cabinets by Friday. Moderation not guaranteed—each frame manually checked.",
        },
        {
          title: "Rejected photo fix on Wildberries",
          body: "Card returned for extra props in frame. Seller reshoots flat lay without accessories, generates clean background, checks product share against Wildberries help. Publish without new studio. Vitrina AI Studio is not a WB partner—moderator decision stays with the platform.",
        },
        {
          title: "Unified style for thirty denim SKUs",
          body: "One neutral background needed for the denim line. Designer sets preset, team runs batch, QA spot-checks seams and indigo shade. Category feed looks professional, CTR rises without return spikes—product unchanged, only background.",
        },
        {
          title: "Testing AI model for dresses",
          body: "Dress seller wants length and silhouette without hiring a model. Generates three on-AI-model variants, compares to showroom mannequin, publishes best after manual review. Two variants rejected for lengthened hem—typical AI error caught by QA.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "How do we show earring or dress size?",
          answer: "Add a secondary photo with scale or on model. The main AI frame rarely conveys size without context.",
        }
      ],
    },
    "jewelry-sellers": {
      meta: "How jewelry and accessory sellers prepare AI photos for Kaspi, Wildberries, and Ozon: glare control, macro detail, metal tone QA in Vitrina AI Studio.",
      intro:
        "Jewelry and fashion accessories demand precision: buyers judge metal shine, stone facets, and scale from the main image. Vitrina AI Studio helps build white-background cards and macro-friendly variants from one source—without daily macro studio time. You stay in control: compare metal tone, stone shape, and size to the real piece before publishing. This page covers workflow for Kaspi, Wildberries, and Ozon, glare QA checklists, and honest AI limits—no automatic moderation promises.",
      sections: [
        sec(
          "Macro capture and AI source",
          "Start with soft light: no harsh glare that eats facets, no colored reflections from the background. For rings and earrings shoot multiple angles so shape reads in the source. In Vitrina AI Studio pick jewelry or white-background scenario, generate two or three variants, compare highlights to reference. Do not expect AI to restore lost stone detail—blurred source means inaccurate output. Export square for marketplace main image, store RAW by SKU. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Glare, metal, and stones after generation",
          "AI may boost shine, shift gold tone, or invent facets that were not there. In QA check metal color (yellow/white/rose gold), stone count, cut, chain, and clasp. Compare source and result at 200% zoom for small pieces. Reject frames where stones grew or pendant shape changed. For sets verify every element is present. Vitrina AI Studio does not guarantee moderation—manual review is mandatory for high-return categories. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Scale and size context",
          "Buyers often misread earring or pendant size on white background alone. Plan secondary shots with ruler, coin, or on model—AI covers the base card but scale needs separate frames. Avoid extra props on main image if platform rules ban them. Match weight and size copy to what the image shows. Scale mismatch drives complaints on Kaspi and Ozon. Manual QA cuts return risk. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Marketplace rules for jewelry",
          "Kaspi, Wildberries, and Ozon have different rules for jewelry main images: background, text bans, extra docs for precious metals. Vitrina AI Studio is not an official partner—certificates, assay marks, and compliance stay with the seller. AI helps the visual card but does not replace category compliance. Read current cabinet help before upload. Fashion jewelry rules are softer but main image must still show the piece honestly. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Series and unified showcase style",
          "When the catalog has one hundred plus rings and bracelets, unified white background and exposure height make the feed professional. Set a preset in Vitrina AI Studio and run batches of fifteen to twenty SKUs per session. Hero pieces with large stones may get separate studio shots; mass tail gets AI after careful source. Spot-check every fifth frame plus all items above key price tiers."
        ),
        sec(
          "Fashion jewelry vs precious metals",
          "For fashion jewelry AI often covers eighty percent of routine: white background, light cleanup, extra angle. Precious pieces with stones need stricter macro source and QA—tiny cut distortion drives returns. Do not use AI to improve stones that are not in the real piece. Split catalog into tiers by price and shoot complexity. Service does not promise automatic moderation approval."
        ),
        sec(
          "Team workflow for jewelry sellers",
          "Buyer receives batch, assistant shoots on lightbox, marketplace manager generates and approves after QA. Vitrina AI Studio sits between shoot and cabinet. Agree on standard: minimum source resolution, ring angle, SKU naming. Demo mode trains new staff without charges. Independent studio status: Kaspi, Wildberries, Ozon rules are checked in seller cabinet, not through us."
        )
      ],
      forWho: [
        "B2B and marketplace teams",
        "Growing catalogs",
        "Teams without daily studio",
        "Multi-channel sellers",
        "QA-focused operators"
      ],
      tasks: [
        "Prepare main white-background image",
        "Run batch QA",
        "Align series before promo",
        "Export for another channel",
        "Clean frame clutter",
        "Add angle without reshoot",
        "Train staff in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "Offers 2–3 variants per source",
        "Supports QA checklist",
        "Lowers rework on mass SKUs",
        "Unified feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Batch before promo",
          body: "Team shoots thirty SKUs, runs AI batch, manager approves twenty-eight after QA, two go for reshoot. Cards live before promo start. Moderation not guaranteed.",
        },
        {
          title: "Channel export",
          body: "Master source exported to Kaspi and Ozon ratios from one session. Seller checks each cabinet help. Vitrina AI Studio is not a platform partner.",
        },
        {
          title: "New hire onboarding",
          body: "Demo week without live uploads. Assistant learns QA checklist, manager spot-checks first ten cards.",
        },
        {
          title: "Moderation rejection fix",
          body: "Card returned for extra prop. Source reshot, cleanup in studio, edges checked, re-upload after QA. Downtime cut from days to hours.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Demo mode?",
          answer: "Yes, without charges.",
        }
      ],
    },
    "suppliers": {
      meta: "How suppliers prepare AI product photo packs for retailers and marketplaces: unified SKU batches, manual QA, and scale in Vitrina AI Studio.",
      intro:
        "Suppliers sell product and visuals together: retailers and marketplaces expect ready cards for Kaspi, Wildberries, or Ozon. Vitrina AI Studio turns batch sources into white background, angle series, and unified style for dozens of SKUs—without a studio on every contract. You stay in control: compare color, shape, and kit contents to samples before handoff. This page covers B2B workflow, QA checklists, and honest AI limits—no moderation promises for the end seller.",
      sections: [
        sec(
          "Photo pack for the retailer",
          "Agree format upfront: main image, angles, ratios for Kaspi, Wildberries, or Ozon. Shoot the batch in one light setup, name files by SKU and client article. Run one background preset in Vitrina AI Studio so the retailer gets a predictable feed. Hand off sources with AI versions so the client can rebuild when platform rules change. Never promise moderation on the client's behalf—the seller in cabinet owns upload and responsibility. Demo mode shows the process to buyers without charges. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Standardizing SKU series",
          "When the invoice has two hundred lines, per-frame retouch does not scale. Split SKUs into tiers: A AI-only after careful phone capture; B hybrid with studio for hero items. Set a thirty-second QA checklist and train two operators the same way. Presets in Vitrina AI Studio let the next batch repeat last month's style. Spot-check every tenth SKU to catch systematic AI errors. Unified visuals raise retailer trust and speed catalog acceptance. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "QA before client handoff",
          "Check color, kit contents, logos, barcodes on packaging if visible, and mask edges. AI may shift shade, item count in a set, or box text—do not deliver those frames to the retailer. Protocol: source left, result right, 100% zoom. On failure regenerate or reshoot, do not hope for moderation. Vitrina AI Studio does not guarantee Kaspi, Wildberries, or Ozon approval—that is the client-seller zone. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Kaspi, Wildberries, Ozon: different requirements",
          "One retailer may sell on multiple platforms with different background and ratio rules. Keep a master source and export channel-specific versions. Vitrina AI Studio is not an official partner—state in contract that compliance is checked by the uploading party. Current help lives in seller cabinet, not with us. That reduces disputes when moderation rejects a card. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Deadlines and seasonal peaks",
          "Before holidays retailers need catalogs earlier. AI removes peak load on white background and cleanup if sources are batched. Plan slots: thirty SKUs per day with two-person QA is realistic for phone sources. Leave client hero lines for studio when contract requires. Transparent workflow with demo cuts rework and speeds reference approval on first batch. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Pricing the service for clients",
          "Count not only generations but QA time and reshoot cost. For mass SKU AI is often cheaper than a supplier's staff photographer. In quotes separate basic AI pack and premium with live shoot. Client knows what they pay for; you do not promise marketplace moderation. Compare cost of retailer card downtime—speed sometimes beats perfect highlight."
        ),
        sec(
          "Supplier team: buying, warehouse, content",
          "Buying receives samples, warehouse prepares clean shoot background, content operator generates in Vitrina AI Studio and runs QA. Key account manager signs off first card reference. Independent studio status: we do not replace Kaspi, Wildberries, or Ozon cabinet. Demo trains new operator without charges."
        )
      ],
      forWho: [
        "B2B and marketplace teams",
        "Growing catalogs",
        "Teams without daily studio",
        "Multi-channel sellers",
        "QA-focused operators"
      ],
      tasks: [
        "Prepare main white-background image",
        "Run batch QA",
        "Align series before promo",
        "Export for another channel",
        "Clean frame clutter",
        "Add angle without reshoot",
        "Train staff in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "Offers 2–3 variants per source",
        "Supports QA checklist",
        "Lowers rework on mass SKUs",
        "Unified feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Batch before promo",
          body: "Team shoots thirty SKUs, runs AI batch, manager approves twenty-eight after QA, two go for reshoot. Cards live before promo start. Moderation not guaranteed.",
        },
        {
          title: "Channel export",
          body: "Master source exported to Kaspi and Ozon ratios from one session. Seller checks each cabinet help. Vitrina AI Studio is not a platform partner.",
        },
        {
          title: "New hire onboarding",
          body: "Demo week without live uploads. Assistant learns QA checklist, manager spot-checks first ten cards.",
        },
        {
          title: "Moderation rejection fix",
          body: "Card returned for extra prop. Source reshot, cleanup in studio, edges checked, re-upload after QA. Downtime cut from days to hours.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Demo mode?",
          answer: "Yes, without charges.",
        }
      ],
    },
    "showrooms": {
      meta: "How showrooms prepare AI product photos for in-store catalog, website, and Kaspi: interior shots, lifestyle, and manual QA in Vitrina AI Studio.",
      intro:
        "Showrooms live offline and online: the buyer sees product in the hall, then searches the same SKU on Kaspi or Instagram. Vitrina AI Studio turns in-interior captures into clean cards, lifestyle frames, or marketplace white background—without closing the floor for studio every day. You stay in control: compare color, texture, and kit to the floor sample before publishing.",
      sections: [
        sec(
          "Daily workflow",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Quality control after AI",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Platform requirements",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Scaling without a daily studio",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Budget and team roles",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Channel-specific exports",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Growth without return spikes",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        )
      ],
      forWho: [
        "Small and mid teams on Kaspi",
        "Growing SKU catalogs",
        "Teams without staff photographer",
        "Multi-channel sellers",
        "Operators focused on QA"
      ],
      tasks: [
        "Prepare main white image",
        "Build card from phone source",
        "Align 10–50 SKU series",
        "Swap background per platform",
        "Remove clutter from frame",
        "Add extra angle",
        "Train assistant in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "2–3 variants per source",
        "QA checklist support",
        "Lower mass SKU rework",
        "Consistent feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Weekend SKU push",
          body: "Twenty-five SKUs shot on table, AI white background, manager approves twenty-three after QA. Live Monday without studio rental. Moderation not guaranteed. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Cross-platform export",
          body: "One master exported to Kaspi and Wildberries ratios. Team reads each cabinet help. Vitrina AI Studio is not a platform partner. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Seasonal unified background",
          body: "Forty SKUs get one neutral preset. CTR rises, returns flat because product unchanged. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Urgent moderation fix",
          body: "Rejected for extra prop. Reshoot source, cleanup in studio, re-upload after QA. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Can we skip QA on low-price SKUs?",
          answer: "Not recommended. Cheap items still drive returns and moderation rejects if color or shape drifts.",
        }
      ],
    },
    "instagram-shops": {
      meta: "How Instagram shops prepare AI product photos and variants for feed, stories, and Kaspi: brand look, manual QA in Vitrina AI Studio.",
      intro:
        "Instagram shops sell with the eye: feed, stories, and DMs must look cohesive, and much assortment duplicates on Kaspi. Vitrina AI Studio turns phone sources into clean product shots, lifestyle backgrounds, or marketplace white cards—without a photographer on every drop.",
      sections: [
        sec(
          "Daily workflow",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Quality control after AI",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Platform requirements",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Scaling without a daily studio",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Budget and team roles",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Channel-specific exports",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Growth without return spikes",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        )
      ],
      forWho: [
        "Small and mid teams on Kaspi",
        "Growing SKU catalogs",
        "Teams without staff photographer",
        "Multi-channel sellers",
        "Operators focused on QA"
      ],
      tasks: [
        "Prepare main white image",
        "Build card from phone source",
        "Align 10–50 SKU series",
        "Swap background per platform",
        "Remove clutter from frame",
        "Add extra angle",
        "Train assistant in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "2–3 variants per source",
        "QA checklist support",
        "Lower mass SKU rework",
        "Consistent feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Weekend SKU push",
          body: "Twenty-five SKUs shot on table, AI white background, manager approves twenty-three after QA. Live Monday without studio rental. Moderation not guaranteed. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Cross-platform export",
          body: "One master exported to Kaspi and Wildberries ratios. Team reads each cabinet help. Vitrina AI Studio is not a platform partner. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Seasonal unified background",
          body: "Forty SKUs get one neutral preset. CTR rises, returns flat because product unchanged. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Urgent moderation fix",
          body: "Rejected for extra prop. Reshoot source, cleanup in studio, re-upload after QA. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Can we skip QA on low-price SKUs?",
          answer: "Not recommended. Cheap items still drive returns and moderation rejects if color or shape drifts.",
        }
      ],
    },
    "online-stores": {
      meta: "How online stores prepare AI catalog photos for site, Kaspi, and other channels: PDP galleries, omnichannel QA in Vitrina AI Studio.",
      intro:
        "Online stores live in the catalog: PDP, category listing, email, and marketplace must show the same SKU honestly. Vitrina AI Studio builds white background, lifestyle, and extra angles for site and Kaspi from one source—without a studio on every SKU.",
      sections: [
        sec(
          "Daily workflow",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Quality control after AI",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Platform requirements",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Scaling without a daily studio",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Budget and team roles",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Channel-specific exports",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Growth without return spikes",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        )
      ],
      forWho: [
        "Small and mid teams on Kaspi",
        "Growing SKU catalogs",
        "Teams without staff photographer",
        "Multi-channel sellers",
        "Operators focused on QA"
      ],
      tasks: [
        "Prepare main white image",
        "Build card from phone source",
        "Align 10–50 SKU series",
        "Swap background per platform",
        "Remove clutter from frame",
        "Add extra angle",
        "Train assistant in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "2–3 variants per source",
        "QA checklist support",
        "Lower mass SKU rework",
        "Consistent feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Weekend SKU push",
          body: "Twenty-five SKUs shot on table, AI white background, manager approves twenty-three after QA. Live Monday without studio rental. Moderation not guaranteed. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Cross-platform export",
          body: "One master exported to Kaspi and Wildberries ratios. Team reads each cabinet help. Vitrina AI Studio is not a platform partner. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Seasonal unified background",
          body: "Forty SKUs get one neutral preset. CTR rises, returns flat because product unchanged. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Urgent moderation fix",
          body: "Rejected for extra prop. Reshoot source, cleanup in studio, re-upload after QA. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Can we skip QA on low-price SKUs?",
          answer: "Not recommended. Cheap items still drive returns and moderation rejects if color or shape drifts.",
        }
      ],
    },
    "marketplace-managers": {
      meta: "How marketplace managers organize AI photo workflow for Kaspi, Wildberries, and Ozon: process, QA, SKU scale in Vitrina AI Studio.",
      intro:
        "Marketplace managers own cards, moderation, and shelf KPI—while someone else shoots. Vitrina AI Studio gives a repeatable path: source → generation → manual QA → cabinet upload for Kaspi, Wildberries, or Ozon. You do not get automatic moderation or official partner status—final rule check is on you.",
      sections: [
        sec(
          "Daily workflow",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Quality control after AI",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Platform requirements",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Scaling without a daily studio",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Budget and team roles",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Channel-specific exports",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Growth without return spikes",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        )
      ],
      forWho: [
        "Small and mid teams on Kaspi",
        "Growing SKU catalogs",
        "Teams without staff photographer",
        "Multi-channel sellers",
        "Operators focused on QA"
      ],
      tasks: [
        "Prepare main white image",
        "Build card from phone source",
        "Align 10–50 SKU series",
        "Swap background per platform",
        "Remove clutter from frame",
        "Add extra angle",
        "Train assistant in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "2–3 variants per source",
        "QA checklist support",
        "Lower mass SKU rework",
        "Consistent feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Weekend SKU push",
          body: "Twenty-five SKUs shot on table, AI white background, manager approves twenty-three after QA. Live Monday without studio rental. Moderation not guaranteed. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Cross-platform export",
          body: "One master exported to Kaspi and Wildberries ratios. Team reads each cabinet help. Vitrina AI Studio is not a platform partner. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Seasonal unified background",
          body: "Forty SKUs get one neutral preset. CTR rises, returns flat because product unchanged. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Urgent moderation fix",
          body: "Rejected for extra prop. Reshoot source, cleanup in studio, re-upload after QA. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Can we skip QA on low-price SKUs?",
          answer: "Not recommended. Cheap items still drive returns and moderation rejects if color or shape drifts.",
        }
      ],
    },
    "photographers-content-managers": {
      meta: "How photographers and content managers embed Vitrina AI Studio in production: handoff, QA, Kaspi, Wildberries, Ozon channels.",
      intro:
        "Photographer plus content manager feed the catalog. Vitrina AI Studio does not replace the pro eye but removes routine: white background, angle variants, adaptation for Kaspi, Wildberries, or Ozon from a strong source. CM runs QA; photographer sets shoot standard.",
      sections: [
        sec(
          "Daily workflow",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Quality control after AI",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Platform requirements",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Scaling without a daily studio",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Budget and team roles",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Channel-specific exports",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Growth without return spikes",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        )
      ],
      forWho: [
        "Small and mid teams on Kaspi",
        "Growing SKU catalogs",
        "Teams without staff photographer",
        "Multi-channel sellers",
        "Operators focused on QA"
      ],
      tasks: [
        "Prepare main white image",
        "Build card from phone source",
        "Align 10–50 SKU series",
        "Swap background per platform",
        "Remove clutter from frame",
        "Add extra angle",
        "Train assistant in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "2–3 variants per source",
        "QA checklist support",
        "Lower mass SKU rework",
        "Consistent feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Weekend SKU push",
          body: "Twenty-five SKUs shot on table, AI white background, manager approves twenty-three after QA. Live Monday without studio rental. Moderation not guaranteed. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Cross-platform export",
          body: "One master exported to Kaspi and Wildberries ratios. Team reads each cabinet help. Vitrina AI Studio is not a platform partner. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Seasonal unified background",
          body: "Forty SKUs get one neutral preset. CTR rises, returns flat because product unchanged. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Urgent moderation fix",
          body: "Rejected for extra prop. Reshoot source, cleanup in studio, re-upload after QA. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Can we skip QA on low-price SKUs?",
          answer: "Not recommended. Cheap items still drive returns and moderation rejects if color or shape drifts.",
        }
      ],
    },
    "small-ecommerce-teams": {
      meta: "How small ecommerce teams prepare AI photos for Kaspi, site, and social: few people, many SKUs, manual QA in Vitrina AI Studio.",
      intro:
        "In a small ecommerce team one person often covers buying, content, and Kaspi. Vitrina AI Studio helps avoid hiring a studio on every inbound batch: white background, second angle, unified style from a phone. You stay in control through short QA—the service does not guarantee moderation and is not a Kaspi, Wildberries, or Ozon partner.",
      sections: [
        sec(
          "Daily workflow",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Quality control after AI",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Platform requirements",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Scaling without a daily studio",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Budget and team roles",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Channel-specific exports",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        ),
        sec(
          "Growth without return spikes",
          "Start with even light and a clean source without clipped edges or stray props. In Vitrina AI Studio pick the scenario that fits your channel, generate two or three variants, and compare color, shape, and packaging text to the physical sample before upload. Vitrina AI Studio is not an official Kaspi, Wildberries, or Ozon partner—read current seller-cabinet rules before publishing. Manual QA is mandatory: reject frames where AI shifted shade, smoothed texture, or altered logos. Demo mode helps train assistants without charges. Store masters by SKU so you can re-export when platform requirements change. Compare every frame to the physical sample and the current seller-cabinet rules for Kaspi, Wildberries, or Ozon — requirements change without notice. Vitrina AI Studio is not an official marketplace partner and does not guarantee moderation approval. Manual QA is mandatory for color, shape, packaging text, mask edges, and kit contents. Demo mode helps train the team without charges or live AI calls."
        )
      ],
      forWho: [
        "Small and mid teams on Kaspi",
        "Growing SKU catalogs",
        "Teams without staff photographer",
        "Multi-channel sellers",
        "Operators focused on QA"
      ],
      tasks: [
        "Prepare main white image",
        "Build card from phone source",
        "Align 10–50 SKU series",
        "Swap background per platform",
        "Remove clutter from frame",
        "Add extra angle",
        "Train assistant in demo"
      ],
      howHelps: [
        "Speeds routine cards",
        "2–3 variants per source",
        "QA checklist support",
        "Lower mass SKU rework",
        "Consistent feed style",
        "Demo without charges"
      ],
      scenarios: [
        {
          title: "Weekend SKU push",
          body: "Twenty-five SKUs shot on table, AI white background, manager approves twenty-three after QA. Live Monday without studio rental. Moderation not guaranteed. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Cross-platform export",
          body: "One master exported to Kaspi and Wildberries ratios. Team reads each cabinet help. Vitrina AI Studio is not a platform partner. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Seasonal unified background",
          body: "Forty SKUs get one neutral preset. CTR rises, returns flat because product unchanged. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        },
        {
          title: "Urgent moderation fix",
          body: "Rejected for extra prop. Reshoot source, cleanup in studio, re-upload after QA. The manager runs QA with source on the left and AI output on the right at 100% zoom. Rejected frames never go live — a one-hour delay beats card downtime and moderation disputes. Vitrina AI Studio does not promise automatic approval; the seller or cabinet manager owns the upload decision.",
        }
      ],
      limitations:
        "AI may change shade, shape, texture, logos, or small product details. Vitrina AI Studio does not guarantee moderation on Kaspi, Wildberries, Ozon, or other platforms and is not their official partner. Compare every image to the live sample and current cabinet rules before publish. Manual check of each frame is mandatory — automatic moderation approval is not provided.",
      faq: [
        {
          question: "Can we publish AI photos without manual review?",
          answer: "No. Compare color, shape, patterns, logos, and edges with the source file. Reject distorted variants before uploading to any marketplace cabinet.",
        },
        {
          question: "Does Vitrina AI guarantee moderation approval?",
          answer: "No. The studio helps prepare visuals, but Kaspi, Wildberries, Ozon, and other rules change. The seller owns the final compliance check.",
        },
        {
          question: "Do we still need a photo studio?",
          answer: "For many SKUs a phone and even light are enough. Premium hero shots and complex macro work may still need a photographer or studio day.",
        },
        {
          question: "Is there a demo mode?",
          answer: "Yes. Demo shows the workflow without charges or live AI calls—useful for team training and QA checklist alignment.",
        },
        {
          question: "Is Vitrina AI an official marketplace partner?",
          answer: "No. It is an independent tool. Read the latest image requirements in each platform seller account before publishing.",
        },
        {
          question: "Can we skip QA on low-price SKUs?",
          answer: "Not recommended. Cheap items still drive returns and moderation rejects if color or shape drifts.",
        }
      ],
    },
};

const KK_COPY = {
    "marketplace-sellers": {
      meta: "Marketplace satushylary Kaspi, Wildberries, Ozon ushin AI taúar fotosyn qalai daiyndaydy: workflow, QA, shektemeler — Vitrina AI Studio.",
      intro:
        "Marketplace satushylary SKU, aktsiyalar jane algy surét sapa ushin ayqyp turady. Vitrina AI Studio bir túp surétten aq fon, taza kartochka jane turli rakurs nusqalaryn jinaydy — kúnde studiya jalgamay. Siz basqarasyz: jariyalamas buryn reng, pishin jane detaldardy naqty taúarpen salystyrasyz. Bul bet Kaspi, Wildberries, Ozon ushin tipik process, QA tizimin jane AI shektemelerin korsetedi — avtomatty moderasiya kepildigi joq jane biz resmi seriktes emespiz.",
      sections: [
        sec(
          "Marketplace satushysy workflow",
          "Tégis jaryq pen taza túp surétten bastanyz: qattı zharyq, kesilgen qirlar nemese kadrda artyq zat bolmasyn. Vitrina AI Studio-da «dál kartochka» nemese «marketplace ushin aq fon» scenariyin tańdańyz, 2–3 nusqa generatsiyalańyz, túp surétpen salystyryp eng zhysyn belgileńiz. Kiim men aksessuar ushin flat lay nemese modeldegi alohida scenariy kerek ekenin aldyn ala sheshilińiz. Kaspi nemese Wildberries algy suréti ushin kvadrat nemese 3:4 eksport qylyńyz, túp surétti SKU papkasynda saqtańyz. Alań talaptary ozgerse, kadr qayta jinau oson bolady. Demo rejimi kabinet menejerin tólemsiz oqytuǵa jaramdy. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Kaspi, Wildberries jane Ozon talaptary",
          "Ár alańnyń algy surét erejeleri basqa: fon, taúar ulýsy, qosuymsha mátin jane su belgisine tygys. Vitrina AI Studio Kaspi, Wildberries nemese Ozon resmi seriktesi emes — júkteu aldyn satyp alu kabinetindegi aǵymdaǵy anqatylyqpen salystyryńyz. Kaspi ushin taúar oqyladylygy jane artyq zat joq boluy mańyzy; Wildberries seriya stiline; Ozon detal aniqtygyna mańyz beredi. Infografika nemese video kerek bolsa, alohida jospalańyz — AI bazalyq kartochkany qamtydy, barlyq formatty emes. Erejeler ozgeredi — sońgy javapkerdilik satushyda. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Generatsiyadan keiin sapa basqaru",
          "Korpus rengi, furnitura, geometriya, tigiş, print, logotip, maska qirlary jane kölelerdi tekserińiz. AI rengti «tartyp», teksturany tezishe nemese ushkish örnekti ozgertui mumkin — osyndai nusqalardy kór kóz jariyalamangyz. 30 sekundtyq QA tizimi: sol jаqtа túp surét, oń jаqtа nátije, 100% zoom. Onynnan SKU seriyasynda jedel kadr emes, butin lentanyń vizual yntymaktylygyn tekserińiz. Kúmnan bolsa, basqa fonmen qayta generatsiyalańyz nemese etalon rakurs ushin qayta túsińiz. Vitrina AI Studio moderasiyadan ótudi kepildemeidi — qolmen tekseru miqdetti. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Kúnde studiyasyz katalog masshtabtayu",
          "Jańa SKU fotograf saatyndan kóp bolsa, AI routine kartochkalar ushin zhúk alady: aq fon, zhéngil tazalau, bir turli stil. SKU-dy A/B bólińiz: A — smartfon keiin tek AI; B — hero taúarlar ushin studiya gibridi. Preset saqtańyz — komanda birdei parametrlerdi qaytalar. Bir jaryq sessiyasynda 20–30 SKU batch jospary — aiymyna bólingen tústerden arzany. Kaspi jane Wildberries kategoriya lentasynda bir turli vizual ańyq kórinedi."
        ),
        sec(
          "Byudjet: túsu, retush jane AI",
          "Tek generatsiya bagasyn emes, QA ushin menejer uaqtyn esepteńiz. Massa katalogta AI kóp kezde qayta túsudan arzany, egere túp surét taza bolsa. Premium kategoriyalar ushin tiryke túske byudjet qoldyryńyz, Vitrina AI Studio alań jane mausymdyq fonǵa baptau ushin qoldanylsyn. Qabyldanbaǵan moderasiya jane kartochka prostoi qymbaty bolui mumkin. Demo jane QA tizimi arqyly qayta is azayady. Ozon, WB nemese Kaspi moderátorlary avtomatty maqūldau beredi dep uáde etilmeydi."
        ),
        sec(
          "Satushy komandasyndagy róller",
          "Iesi brend standartyn qoyady, marketplace menejeri alań erejelerine javap beredi, kómekshi túp surét daiyndaydy jane nusqalardy júkteidi. Vitrina AI Studio kómekshi men menejer arasynda: birinshi túsiredi jane generatsiyalaydy, ekinshi QA keiin maqūldaydy. Surt fotograf bolsa, RAW/JPEG jane SKU papka atau formatyn kelisińiz. Táuelisiz status: alań nusqauylyqtary satyp alu kabinetinde tekseriledi, biz arqyly emes."
        ),
        sec(
          "Satu ósui jane vizual vitrina",
          "Kúshli algy surét Kaspi, Wildberries, Ozon beruinde CTR arttyrady, biraq saqtau taúardyń dál sáykes keluinen kelip shygady. AI fondy jane rakursy tezirek testileuge kómektesedi, egere siz gipotezalardy jazsanyz: qaysy seriya qaitarymsyz klikti arttyrdy. Qosymsha rakurs jane makro detaldar qosyńyz. Jetkizuge sáykes kelmeitn «ideal» surét izdemey qoyyńyz — bul kóp qymbat. Qolmen QA reytingti qorgaydy."
        )
      ],
      forWho: [
        "Kaspi, Wildberries, Ozon satyp alushylary",
        "Osyyp bar katalog jane túsau uaqyty shektelgen satushylar",
        "Shtat fotograf joq, biraq kabinet menejeri bar komandalar",
        "Bir neshe alańǵa mausymdyq kollektsiya shygaryp jatqan brendter",
        "Lentada bir turli kartochka stili kerek satushylar"
      ],
      tasks: [
        "Aq nemese neytral fonda algy surét daiyndau",
        "Smartfon túp surétten dál kartochka jinau",
        "Aktsiya aldyn 10–50 SKU seriyasyn kelistiru",
        "Basqa alań talaby ushin fondy tez almasu",
        "Kadrdan artyq zat pen shumdy tazalau",
        "Ekinshi túsusyz qosymsha rakurs",
        "Demo arqyly kómekshini oqytu"
      ],
      howHelps: [
        "Kúnde studiyasyz routine kartochkany tezdetedi",
        "Bir túpke 2–3 fon jane rakurs nusqasy",
        "Taúarpen qolmen salystyru QA tizimi",
        "Massa SKU-da qayta is qymbatyn azaytady",
        "Lenta vizual stilin saqtaydy",
        "Komanda oqitu ushin tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Demalys ishinde Kaspi-ga jańa seriya",
          body: "Elektronika satushysy 25 SKU alady. Kómekshi ustelde túsiredi, Vitrina AI Studio aq fon generatsiyalaydy, korpus zharyqtylygyn salystyrady. Menejer 23 kartochkany qolmen maqūldaydy, ekisi logotip buzylgan sebepli qayta túsuge jiberiledi. Dúyssenbege Kaspi kabinetinde — studiya jalgamay. Moderasiya kepildelenbeydi.",
        },
        {
          title: "Ozon kartochkasyn WB-ga kóshiru",
          body: "Ozon algy suréti WB vizual stiline sáykes kelmedi. Komanda túp surétti alyp, fondy jane 3:4 eksportty ozgertedi, taúar ulýsyn tekserdi. Jańa tússiz jariyalau. Vitrina AI Studio Wildberries seriktesi emes — moderátor sheshimi alańda qalaды.",
        },
        {
          title: "Mausymdyq aktsiya bir fonda",
          body: "40 SKU ushin Kaspi jane Ozon-ga iliq neytral fon kerek. Dizainer preset qoydy, kómekshi batch jurgizdi, menejer ár onynshysyn jane barlyq flagnardy tekserdi. CTR östi, qaitarym ósmedi — taúar ózgermedi, tek fon. QA rengi ozgergen kadrdarды süzdi.",
        },
        {
          title: "Moderasiya qabyldamagan kartochkany shyǵys tuzatu",
          body: "Kadrda artyq rekvisit sebepli qaytarildi. Satushy rekvisitsiz túp surétti júkteydi, studiyada tazalau qiladi, qirlar tekseriledi, qayta júkteiledi. Prostoi eki kúnlük tústen bir saat QA-ga qisqarady. Avtomatty maqūldau berilmeydi.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Kiim ushin modeldegi alohida scenariy bar ma?",
          answer: "Ia. Kiim ushin AI modeldegi alohida scenariy bar. Bul bet predmetti kartochka jane aq fonga bağıtlangan.",
        }
      ],
    },
    "clothing-sellers": {
      meta: "Kiim satushylary Kaspi, Wildberries, Ozon ushin AI fotosyn qalai daiyndaydy: flat lay, modeldegi surét, mata rengin tekseru — Vitrina AI Studio.",
      intro:
        "Kiim bir sekundta satady nemese juyyldy: satyp alushy algy surétten otinshi, uzyndyq pen rengti bahalaydy. Vitrina AI Studio bir túp surétten flat lay, aq fon kartochkasy nemese AI modelindegi nusqany jinaydy — kúnde studiya jane model jalgamay. Siz basqarasyz: jariyalamas buryn mata rengin, printti, tigişter men proporsiyany naqty kiyimmen salystyrasyz. Bul bet Kaspi, Wildberries, Ozon ushin workflow, mata QA tizimin jane AI shektemelerin korsetedi — avtomatty moderasiya kepildigi joq.",
      sections: [
        sec(
          "Flat lay jane aq fon kartochkasy",
          "Negizgi SKU ushin tégis flat lay bastanyz: kiyim buklanbasy, kesim jasyrylmasyn, belgiler aldyn ala alynady. Vitrina AI Studio-da kiimge neytral fon scenariyin tańdańyz, 2–3 nusqa generatsiyalańyz, mata rengin kúndiz jarygynda túsken surétpen salystyryńyz. Flat lay men modeldegi kadrdy bir kartochkada aralas tygys qylmangyz. Kaspi nemese Wildberries ushin kvadrat nemese 3:4 eksport qylyńyz, túp surétti SKU boyynsha saqtańyz. Onynnan SKU seriyasy ushin bir fon presetin qoyyńyz. Demo rejimi kómekshini oqytuǵa arnalǵan. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "AI modelindegi kiim scenariyi",
          "Kategoriya otinshi, jeng uzynygy nemese siluetti kórsetu kerek bolsa, AI modelindegi alohida scenariydi qoldanyńyz. Sapa túp surét júkteńiz: aldy, profil nemese oqylady kesimmen flat lay. Nusqalardy generatsiyalańyz, keyin proporsiya, uzyndyq pen rengti naqty kiyimmen qolmen tekserińiz. AI beldi taraltyp, jengti uzartyp nemese teksturany tezishe alady — osyndai kadrdy kór kóz jariyalamangyz. Ölшем kestesi men surétti sáykes keltirińyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Mata rengi men printti basqaru",
          "Mata aq balansqa sezgir: bir switer ekranda AI keiin basqasha kórinui mumkin. Etalon saqtańyz: terezede túsken surét pen mata swatch. QA-da jalan reng pen ushkish printti salystyryńyz. Örnek «erigen» nemese trikotazh teksturasy joq bolsa, nusqany qabyldamangyz. Djinisi men teri ushin tigişter men furnitura 100% zoomda tekseriledi. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Marketpleyster ushin kiim erejeleri",
          "Kaspi, Wildberries, Ozon kiim ushin algy surét erejelerine ie: fon, qosymsha mátin tygysy, kei birde model talaby. Vitrina AI Studio resmi seriktes emes — júkteu aldyn kabinet anqatylygyn oqynyz. WB seriya stiline mańyz beredi; Kaspi kesim oqyladylygyna; Ozon detaldar aniqtygyna. Ölшем infografikasyn alohida jospalańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Mausymdyq kollektsiyalar men massa katalog",
          "50–100 SKU zhana kollektsiya bolsa, AI aq fon, zhéngil tazalau, bir turli flat lay ushin zhúk alady. SKU-dy bólińiz: hero — studiya/model; massa — smartfon keiin AI. Bir jaryq sessiyasynda 20–30 taúar batch jospary qoyyńyz. Preset saqtańyz — komanda birdei parametrlerdi qaytalar. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Qaitarular, reyting jane shysty surét",
          "Surétte reng nemese uzyndyq sáykesizdigi kiim qaitarymynyn negizgi sebebi. AI fondy tezirek testileuge kómektesedi, biraq taúardy onyq shynnan asyp kórsetpeui kerek. Qosymsha rakurs pen mata makrosyn qosyńyz. Jetkizuge sáykes kelmeitn «ideal» surét izdemey qoyyńyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Rólder: brend, satyp alu, kontent",
          "Brend ieesi vizual standart qoyady, kontent menejeri generatsiyalaydy jane kabinetke júkteidi. Vitrina AI Studio túsu men jariyalau arasynda. Túlgan fotograf pen RAW/JPEG formatyn kelisińiz. Demo rejimi jańa qyzmetkerdi oqytuǵa arnalǵan. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Kaspi, Wildberries, Ozon kiim brendteri",
        "Mausymdyq kollektsiyasy bar satushylar",
        "Kúnde studiya/model joq dúkender",
        "Flat lay jane AI model kerek komandalar",
        "Surét rengi sebepli qaitarymdy azaytqan satushylar"
      ],
      tasks: [
        "Flat lay aq fonda algy surét daiyndau",
        "AI modelinde otinshi kórsetu",
        "Mata rengin etalondyq kiyimmen kelistiru",
        "20–50 SKU aktsiyaga daiyndau",
        "Basqa alańǵa kartochkany baptau",
        "AI keiin print, tigiş, uzyndyqty tekseru",
        "Demo arqyly kómekshini oqytu"
      ],
      howHelps: [
        "Flat lay jane bazalyq kartochkany tezdetedi",
        "Bir túpten AI model nusqalary",
        "Mata rengi QA tizimi",
        "Massa katalogta mausymdyq túsau arzandatady",
        "Bir turli kiim lentesi stili",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Bir aptada küz kollektsiyasy",
          body: "40 SKU: flat lay túsirildi, aq fon generatsiyalandy, 3 hero AI modelde. Menejer trikotazh rengin salystyrdy, 2 kadr kesim buzylgan sebepli qabyldamady. Zhumaǵa Kaspi jane WB kabinetinde. Moderasiya kepildelenbeydi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "WB qabyldamagan suretti almastau",
          body: "Kadrda artyq rekvisit bar. Flat lay qayta túsirildi, taza fon generatsiyalandy. Jańa studiyasyz jariyalau. Vitrina AI WB seriktesi emes.",
        },
        {
          title: "30 djin SKU bir turli stil",
          body: "Bir neytral fon preset. Seriya professional kórinedi, CTR östi, qaitarym turaqy — taúar ózgermedi.",
        },
        {
          title: "Kóylek ushin AI model testi",
          body: "3 AI model nusqasy, manekenmen salystyru, QA keiin eng zhysy jariyalandy. 2 nusqa etek uzyn dep qabyldanbaды.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Syrga nemese kóylek ölшемin qalay kórsetemiz?",
          answer: "Masshtab nemese modeldegi qosymsha surét qosyńyz. Algy AI kadr ölшемdi kórsetpeui mumkin.",
        }
      ],
    },
    "jewelry-sellers": {
      meta: "Zergilik jane aksessuar satushylary Kaspi, Wildberries, Ozon ushin AI fotosyn qalai daiyndaydy: zharyqtan qorytyq, makro, metal rengi QA.",
      intro:
        "Zergilik surét aniqtyq talap etedi: satyp alushy metal zharyqtylygyn, tas juzelerin jane ölшемdi algy kadrdan bahalaydy. Vitrina AI Studio bir túp surétten aq fon kartochkasy men makroǵa jaramdy nusqalardy jinaydy. Siz basqarasyz: jariyalamas buryn metal rengin, tas pishinin jane ölшемdi naqty buyymen salystyrasyz.",
      sections: [
        sec(
          "Macro capture and AI source",
          "Start with soft light: no harsh glare that eats facets, no colored reflections from the background. For rings and earrings shoot multiple angles so shape reads in the source. In Vitrina AI Studio pick jewelry or white-background scenario, generate two or three variants, compare highlights to reference. Do not expect AI to restore lost stone detail—blurred source means inaccurate output. Export square for marketplace main image, store RAW by SKU. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Glare, metal, and stones after generation",
          "AI may boost shine, shift gold tone, or invent facets that were not there. In QA check metal color (yellow/white/rose gold), stone count, cut, chain, and clasp. Compare source and result at 200% zoom for small pieces. Reject frames where stones grew or pendant shape changed. For sets verify every element is present. Vitrina AI Studio does not guarantee moderation—manual review is mandatory for high-return categories. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Scale and size context",
          "Buyers often misread earring or pendant size on white background alone. Plan secondary shots with ruler, coin, or on model—AI covers the base card but scale needs separate frames. Avoid extra props on main image if platform rules ban them. Match weight and size copy to what the image shows. Scale mismatch drives complaints on Kaspi and Ozon. Manual QA cuts return risk. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Marketplace rules for jewelry",
          "Kaspi, Wildberries, and Ozon have different rules for jewelry main images: background, text bans, extra docs for precious metals. Vitrina AI Studio is not an official partner—certificates, assay marks, and compliance stay with the seller. AI helps the visual card but does not replace category compliance. Read current cabinet help before upload. Fashion jewelry rules are softer but main image must still show the piece honestly. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Series and unified showcase style",
          "When the catalog has one hundred plus rings and bracelets, unified white background and exposure height make the feed professional. Set a preset in Vitrina AI Studio and run batches of fifteen to twenty SKUs per session. Hero pieces with large stones may get separate studio shots; mass tail gets AI after careful source. Spot-check every fifth frame plus all items above key price tiers. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Fashion jewelry vs precious metals",
          "For fashion jewelry AI often covers eighty percent of routine: white background, light cleanup, extra angle. Precious pieces with stones need stricter macro source and QA—tiny cut distortion drives returns. Do not use AI to improve stones that are not in the real piece. Split catalog into tiers by price and shoot complexity. Service does not promise automatic moderation approval. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Team workflow for jewelry sellers",
          "Buyer receives batch, assistant shoots on lightbox, marketplace manager generates and approves after QA. Vitrina AI Studio sits between shoot and cabinet. Agree on standard: minimum source resolution, ring angle, SKU naming. Demo mode trains new staff without charges. Independent studio status: Kaspi, Wildberries, Ozon rules are checked in seller cabinet, not through us."
        )
      ],
      forWho: [
        "Marketpleys komandalary",
        "Osyyp bar katalog",
        "Kúnde studiyasy joq",
        "Kóp arna satushylary",
        "QA-ga bağımlı operatorlar"
      ],
      tasks: [
        "Aq fondy algy surét",
        "Batch QA",
        "Aktsiyaga seriya",
        "Basqa arna eksporty",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo arqyly oqitu"
      ],
      howHelps: [
        "Routine tezdetedi",
        "2–3 nusqa",
        "QA tizimi",
        "Qayta is azayty",
        "Bir turli lenta",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Aktsiya aldyn batch",
          body: "30 SKU túsirildi, AI batch, 28 QA otti, 2 qayta túsu. Moderasiya kepildelenbeydi.",
        },
        {
          title: "Arna eksporty",
          body: "Bir master Kaspi jane Ozon proporsiyasy. Satushy kabinet anqatylygyn tekseredi.",
        },
        {
          title: "Jańa qyzmetker",
          body: "Demo aptasy, live joq. Kómekshi QA orenedi.",
        },
        {
          title: "Moderasiya qabyldamady",
          body: "Artyq rekvisit. Qayta túsu, tazalau, QA keiin qayta júkteu.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Demo bar ma?",
          answer: "Ia, tolemsiz.",
        }
      ],
    },
    "suppliers": {
      meta: "Zhabdyktaushylar ritailerler men marketpleyster ushin AI foto paketin qalai daiyndaydy: bir turli SKU, QA, masshtab.",
      intro:
        "Zhabdyktaushy taúar men vizualdy birge satady: ritailer Kaspi, Wildberries nemese Ozon ushin daiyn kartochkalar kutedi. Vitrina AI Studio partiyalyq túp surétten aq fon, rakurs seriyasy men bir turli stildi jinaydy. Siz basqarasyz: klientke berer aldyn reng, pishin jane komplektatsiyany salystyrasyz.",
      sections: [
        sec(
          "Photo pack for the retailer",
          "Agree format upfront: main image, angles, ratios for Kaspi, Wildberries, or Ozon. Shoot the batch in one light setup, name files by SKU and client article. Run one background preset in Vitrina AI Studio so the retailer gets a predictable feed. Hand off sources with AI versions so the client can rebuild when platform rules change. Never promise moderation on the client's behalf—the seller in cabinet owns upload and responsibility. Demo mode shows the process to buyers without charges. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Standardizing SKU series",
          "When the invoice has two hundred lines, per-frame retouch does not scale. Split SKUs into tiers: A AI-only after careful phone capture; B hybrid with studio for hero items. Set a thirty-second QA checklist and train two operators the same way. Presets in Vitrina AI Studio let the next batch repeat last month's style. Spot-check every tenth SKU to catch systematic AI errors. Unified visuals raise retailer trust and speed catalog acceptance. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "QA before client handoff",
          "Check color, kit contents, logos, barcodes on packaging if visible, and mask edges. AI may shift shade, item count in a set, or box text—do not deliver those frames to the retailer. Protocol: source left, result right, 100% zoom. On failure regenerate or reshoot, do not hope for moderation. Vitrina AI Studio does not guarantee Kaspi, Wildberries, or Ozon approval—that is the client-seller zone. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Kaspi, Wildberries, Ozon: different requirements",
          "One retailer may sell on multiple platforms with different background and ratio rules. Keep a master source and export channel-specific versions. Vitrina AI Studio is not an official partner—state in contract that compliance is checked by the uploading party. Current help lives in seller cabinet, not with us. That reduces disputes when moderation rejects a card. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Deadlines and seasonal peaks",
          "Before holidays retailers need catalogs earlier. AI removes peak load on white background and cleanup if sources are batched. Plan slots: thirty SKUs per day with two-person QA is realistic for phone sources. Leave client hero lines for studio when contract requires. Transparent workflow with demo cuts rework and speeds reference approval on first batch. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Pricing the service for clients",
          "Count not only generations but QA time and reshoot cost. For mass SKU AI is often cheaper than a supplier's staff photographer. In quotes separate basic AI pack and premium with live shoot. Client knows what they pay for; you do not promise marketplace moderation. Compare cost of retailer card downtime—speed sometimes beats perfect highlight. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Supplier team: buying, warehouse, content",
          "Buying receives samples, warehouse prepares clean shoot background, content operator generates in Vitrina AI Studio and runs QA. Key account manager signs off first card reference. Independent studio status: we do not replace Kaspi, Wildberries, or Ozon cabinet. Demo trains new operator without charges. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Marketpleys komandalary",
        "Osyyp bar katalog",
        "Kúnde studiyasy joq",
        "Kóp arna satushylary",
        "QA-ga bağımlı operatorlar"
      ],
      tasks: [
        "Aq fondy algy surét",
        "Batch QA",
        "Aktsiyaga seriya",
        "Basqa arna eksporty",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo arqyly oqitu"
      ],
      howHelps: [
        "Routine tezdetedi",
        "2–3 nusqa",
        "QA tizimi",
        "Qayta is azayty",
        "Bir turli lenta",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Aktsiya aldyn batch",
          body: "30 SKU túsirildi, AI batch, 28 QA otti, 2 qayta túsu. Moderasiya kepildelenbeydi.",
        },
        {
          title: "Arna eksporty",
          body: "Bir master Kaspi jane Ozon proporsiyasy. Satushy kabinet anqatylygyn tekseredi.",
        },
        {
          title: "Jańa qyzmetker",
          body: "Demo aptasy, live joq. Kómekshi QA orenedi.",
        },
        {
          title: "Moderasiya qabyldamady",
          body: "Artyq rekvisit. Qayta túsu, tazalau, QA keiin qayta júkteu.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Demo bar ma?",
          answer: "Ia, tolemsiz.",
        }
      ],
    },
    "showrooms": {
      meta: "Showroomdar vitrina, sait jane Kaspi ushin AI fotosyn qalai daiyndaydy.",
      intro:
        "Showroom offline jane online birge jumys isteydi: satyp alushy zaldy koredi, keyin Kaspi nemese Instagramda izdeydi. Vitrina AI Studio interyerden túsken surétten taza kartochka, lifestyle nemese marketpleys aq fonyn jinaydy.",
      sections: [
        sec(
          "Kúndelikti workflow",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "AI keiin sapa basqaru",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Alań talaptary",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Studiyasyz masshtab",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Byudjet jane róller",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Arna eksporty",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Qaitarymsyz ósу",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Kaspi komandalary",
        "Osyyp bar katalog",
        "Fotograf joq",
        "Kóp arna",
        "QA-ga bağımlı"
      ],
      tasks: [
        "Aq algy surét",
        "Smartfondan kartochka",
        "10–50 SKU seriya",
        "Fon almasu",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo oqitu"
      ],
      howHelps: [
        "Routine tez",
        "2–3 nusqa",
        "QA tizim",
        "Qayta is az",
        "Bir stil",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Demalys SKU",
          body: "25 SKU, aq fon, 23 QA otti. Dúyssenbe live. Moderasiya kepildelenbeydi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Kóp arna",
          body: "Bir master Kaspi jane WB. Kabinet tekseriledi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Mausymdyq fon",
          body: "40 SKU bir preset. CTR östi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Shyǵys moderasiya",
          body: "Qayta túsu, tazalau, QA keiin júkteu. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Arzan SKU-da QA kerek pe?",
          answer: "Ia. Túsi ozgersa qaitarym jane moderasiya qabyldamauy mumkin.",
        }
      ],
    },
    "instagram-shops": {
      meta: "Instagram dúkenderi lenta, stories jane Kaspi ushin AI fotosyn qalai daiyndaydy.",
      intro:
        "Instagram dúken kózben satady: lenta, stories bir turli boluy kerek, kóp taúar Kaspi-da da bar. Vitrina AI Studio smartfon túp surétten product-shot jane aq fon versiyasyn jinaydy.",
      sections: [
        sec(
          "Kúndelikti workflow",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "AI keiin sapa basqaru",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Alań talaptary",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Studiyasyz masshtab",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Byudjet jane róller",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Arna eksporty",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Qaitarymsyz ósу",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Kaspi komandalary",
        "Osyyp bar katalog",
        "Fotograf joq",
        "Kóp arna",
        "QA-ga bağımlı"
      ],
      tasks: [
        "Aq algy surét",
        "Smartfondan kartochka",
        "10–50 SKU seriya",
        "Fon almasu",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo oqitu"
      ],
      howHelps: [
        "Routine tez",
        "2–3 nusqa",
        "QA tizim",
        "Qayta is az",
        "Bir stil",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Demalys SKU",
          body: "25 SKU, aq fon, 23 QA otti. Dúyssenbe live. Moderasiya kepildelenbeydi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Kóp arna",
          body: "Bir master Kaspi jane WB. Kabinet tekseriledi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Mausymdyq fon",
          body: "40 SKU bir preset. CTR östi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Shyǵys moderasiya",
          body: "Qayta túsu, tazalau, QA keiin júkteu. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Arzan SKU-da QA kerek pe?",
          answer: "Ia. Túsi ozgersa qaitarym jane moderasiya qabyldamauy mumkin.",
        }
      ],
    },
    "online-stores": {
      meta: "Internet dúkender sait, Kaspi jane basqa arnalar ushin AI fotosyn qalai daiyndaydy.",
      intro:
        "Internet dúken katalogta jumys isteydi: PDP, listing jane Kaspi bir SKU shysty kórsetui kerek. Vitrina AI Studio bir túp surétten aq fon jane qosymsha rakurs jinaydy.",
      sections: [
        sec(
          "Kúndelikti workflow",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "AI keiin sapa basqaru",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Alań talaptary",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Studiyasyz masshtab",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Byudjet jane róller",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Arna eksporty",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Qaitarymsyz ósу",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Kaspi komandalary",
        "Osyyp bar katalog",
        "Fotograf joq",
        "Kóp arna",
        "QA-ga bağımlı"
      ],
      tasks: [
        "Aq algy surét",
        "Smartfondan kartochka",
        "10–50 SKU seriya",
        "Fon almasu",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo oqitu"
      ],
      howHelps: [
        "Routine tez",
        "2–3 nusqa",
        "QA tizim",
        "Qayta is az",
        "Bir stil",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Demalys SKU",
          body: "25 SKU, aq fon, 23 QA otti. Dúyssenbe live. Moderasiya kepildelenbeydi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Kóp arna",
          body: "Bir master Kaspi jane WB. Kabinet tekseriledi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Mausymdyq fon",
          body: "40 SKU bir preset. CTR östi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Shyǵys moderasiya",
          body: "Qayta túsu, tazalau, QA keiin júkteu. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Arzan SKU-da QA kerek pe?",
          answer: "Ia. Túsi ozgersa qaitarym jane moderasiya qabyldamauy mumkin.",
        }
      ],
    },
    "marketplace-managers": {
      meta: "Marketplace menejerleri Kaspi, Wildberries, Ozon ushin AI foto processin qalai uyymdastyrady.",
      intro:
        "Marketplace menejeri kartochka, moderasiya jane KPI ushin javap beredi. Vitrina AI Studio qaitalanaty process beredi: túp surét → generatsiya → QA → kabinetke júkteu.",
      sections: [
        sec(
          "Kúndelikti workflow",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "AI keiin sapa basqaru",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Alań talaptary",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Studiyasyz masshtab",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Byudjet jane róller",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Arna eksporty",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Qaitarymsyz ósу",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Kaspi komandalary",
        "Osyyp bar katalog",
        "Fotograf joq",
        "Kóp arna",
        "QA-ga bağımlı"
      ],
      tasks: [
        "Aq algy surét",
        "Smartfondan kartochka",
        "10–50 SKU seriya",
        "Fon almasu",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo oqitu"
      ],
      howHelps: [
        "Routine tez",
        "2–3 nusqa",
        "QA tizim",
        "Qayta is az",
        "Bir stil",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Demalys SKU",
          body: "25 SKU, aq fon, 23 QA otti. Dúyssenbe live. Moderasiya kepildelenbeydi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Kóp arna",
          body: "Bir master Kaspi jane WB. Kabinet tekseriledi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Mausymdyq fon",
          body: "40 SKU bir preset. CTR östi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Shyǵys moderasiya",
          body: "Qayta túsu, tazalau, QA keiin júkteu. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Arzan SKU-da QA kerek pe?",
          answer: "Ia. Túsi ozgersa qaitarym jane moderasiya qabyldamauy mumkin.",
        }
      ],
    },
    "photographers-content-managers": {
      meta: "Fotograf pen kontent menejeri Vitrina AI Studio-ni production-ga qalai entegratsiyalaydy.",
      intro:
        "Fotograf pen kontent menejeri katalogty qamtydy. Vitrina AI Studio kasipker kózini almastirmaydi, biraq aq fon jane arna nusqalary routine-in alady.",
      sections: [
        sec(
          "Kúndelikti workflow",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "AI keiin sapa basqaru",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Alań talaptary",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Studiyasyz masshtab",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Byudjet jane róller",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Arna eksporty",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Qaitarymsyz ósу",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Kaspi komandalary",
        "Osyyp bar katalog",
        "Fotograf joq",
        "Kóp arna",
        "QA-ga bağımlı"
      ],
      tasks: [
        "Aq algy surét",
        "Smartfondan kartochka",
        "10–50 SKU seriya",
        "Fon almasu",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo oqitu"
      ],
      howHelps: [
        "Routine tez",
        "2–3 nusqa",
        "QA tizim",
        "Qayta is az",
        "Bir stil",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Demalys SKU",
          body: "25 SKU, aq fon, 23 QA otti. Dúyssenbe live. Moderasiya kepildelenbeydi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Kóp arna",
          body: "Bir master Kaspi jane WB. Kabinet tekseriledi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Mausymdyq fon",
          body: "40 SKU bir preset. CTR östi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Shyǵys moderasiya",
          body: "Qayta túsu, tazalau, QA keiin júkteu. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Arzan SKU-da QA kerek pe?",
          answer: "Ia. Túsi ozgersa qaitarym jane moderasiya qabyldamauy mumkin.",
        }
      ],
    },
    "small-ecommerce-teams": {
      meta: "Shaǵyn ecommerce komandalar Kaspi, sait jane social ushin AI fotosyn qalai daiyndaydy.",
      intro:
        "Shaǵyn komandada bir adam satyp alu, kontent jane Kaspi qosuady. Vitrina AI Studio ár partiyada studiya jalgamay aq fon jane ekinci rakurs beredi.",
      sections: [
        sec(
          "Kúndelikti workflow",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "AI keiin sapa basqaru",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Alań talaptary",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Studiyasyz masshtab",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Byudjet jane róller",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Arna eksporty",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        ),
        sec(
          "Qaitarymsyz ósу",
          "Tégis jaryq pen taza túp surétten bastanyz. Vitrina AI Studio-da scenariy tańdańyz, 2–3 nusqa generatsiyalańyz, jariyalamas buryn naqty taúarpen salystyryńyz. Vitrina AI Studio resmi seriktes emes — kabinet anqatylygyn oqynyz. Qolmen QA miqdetti. Demo rejimi kómekshini oqytuǵa arnalǵan. SKU boyynsha master saqtańyz. Әр кадрды нақты тауармен және Kaspi, Wildberries, Ozon кабинетіндегі ағымдағы ережелермен салыстырыңыз — талаптар хабарланбай өзгереді. Vitrina AI Studio маркетплейстердің ресми серіктесі емес және модерацияны кепілдемейді. Түс, пішін, қаптама мәтіні, маска шеттері мен комплект үшін қолмен QA міндетті. Демо режимі нақты AI шақыруы мен төлемсіз команданы үйретеді."
        )
      ],
      forWho: [
        "Kaspi komandalary",
        "Osyyp bar katalog",
        "Fotograf joq",
        "Kóp arna",
        "QA-ga bağımlı"
      ],
      tasks: [
        "Aq algy surét",
        "Smartfondan kartochka",
        "10–50 SKU seriya",
        "Fon almasu",
        "Kadr tazalau",
        "Qosymsha rakurs",
        "Demo oqitu"
      ],
      howHelps: [
        "Routine tez",
        "2–3 nusqa",
        "QA tizim",
        "Qayta is az",
        "Bir stil",
        "Tólemsiz demo"
      ],
      scenarios: [
        {
          title: "Demalys SKU",
          body: "25 SKU, aq fon, 23 QA otti. Dúyssenbe live. Moderasiya kepildelenbeydi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Kóp arna",
          body: "Bir master Kaspi jane WB. Kabinet tekseriledi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Mausymdyq fon",
          body: "40 SKU bir preset. CTR östi. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        },
        {
          title: "Shyǵys moderasiya",
          body: "Qayta túsu, tazalau, QA keiin júkteu. Менеджер QA өткізеді: сол жақта түпнұсқа, оң жақта нәтиже, 100% zoom. Қабылданбаған кадрлар жарияланбайды — бір сағат кідіріс карточка простойынан арзан. Vitrina AI Studio автоматты мақұлдау уәде етпейді; жүктеу шешімі сатушыда.",
        }
      ],
      limitations:
        "AI түсті, пішінді, фakturany, logotiptardy nemese uaqytsha detaldardy ozgertui mumkin. Vitrina AI Studio Kaspi, Wildberries, Ozon nemese basqa alańdarǵa moderasiyany kepildemeidi jane olardyń resmi seriktesi emes. Jariyalamas buryn ár surétti naqty taýar men aǵymdaǵy kabinet erejelerimen salyqtyryńyz. Ár kadrdy qolmen tekseru miqdetti — avtomatty moderasiya mýlqauy kórsetilmeydi.",
      faq: [
        {
          question: "AI фотосын тексерусіз жариялауға бола ма?",
          answer: "Жоқ. Түс, пішін, өрнек, логотип пен шеттерді түпнұсқамен салыстырыңыз. Искажение бар нұсқаларды кабинетке жүктемес бұрын қабылдамаңыз.",
        },
        {
          question: "Vitrina AI модерацияны кепілдей ме?",
          answer: "Жоқ. Студия визуал дайындауға көмектеседі, бірақ Kaspi, Wildberries, Ozon ережелері өзгереді. Соңғы тексеру сатушыда.",
        },
        {
          question: "Кәсіби студия міндетті ме?",
          answer: "Көп SKU үшін смартфон және тегіс жарық жеткілікті. Премиум hero және күрделі макро үшін фотограф қажет болуы мүмкін.",
        },
        {
          question: "Демо режим бар ма?",
          answer: "Иә. Демо нақты AI шақыруы мен төлемсіз workflow көрсетеді — командаға QA тізімін үйретуге ыңғайлы.",
        },
        {
          question: "Vitrina AI — маркетплейс ресми серіктесі ме?",
          answer: "Жоқ. Тәуелсіз құрал. Жарияламас бұрын әр алаң кабинетіндегі ағымдағы сурет талаптарын оқыңыз.",
        },
        {
          question: "Arzan SKU-da QA kerek pe?",
          answer: "Ia. Túsi ozgersa qaitarym jane moderasiya qabyldamauy mumkin.",
        }
      ],
    },
};


function renderLocalized(loc) {
  const sections = loc.sections
    .map((s) => `      { title: ${JSON.stringify(s.title)}, body: ${JSON.stringify(s.body)} }`)
    .join(",\n");
  const scenarios = loc.scenarios
    .map((s) => `      { title: ${JSON.stringify(s.title)}, body: ${JSON.stringify(s.body)} }`)
    .join(",\n");
  const faq = loc.faq
    .map(
      (f) =>
        `      { question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} }`
    )
    .join(",\n");
  const related = loc.relatedLinks
    .map((l) => `      { label: ${JSON.stringify(l.label)}, href: ${JSON.stringify(l.href)} }`)
    .join(",\n");
  return `    {
      slug: ${JSON.stringify(loc.slug)},
      title: ${JSON.stringify(loc.title)},
      metaDescription: ${JSON.stringify(loc.metaDescription)},
      h1: ${JSON.stringify(loc.h1)},
      intro: ${JSON.stringify(loc.intro)},
      chipLabel: ${JSON.stringify(loc.chipLabel)},
      sections: [
${sections}
      ],
      forWho: [${loc.forWho.map((x) => JSON.stringify(x)).join(", ")}],
      tasks: [${loc.tasks.map((x) => JSON.stringify(x)).join(", ")}],
      howHelps: [${loc.howHelps.map((x) => JSON.stringify(x)).join(", ")}],
      scenarios: [
${scenarios}
      ],
      limitations: ${JSON.stringify(loc.limitations)},
      faq: [
${faq}
      ],
      relatedLinks: [
${related}
      ],
      status: "published",
    }`;
}

function renderPage(page) {
  return `  {
    id: ${JSON.stringify(page.id)},
    content: {
      ru: ${renderLocalized(page.content.ru)},
      en: ${renderLocalized(page.content.en)},
      kk: ${renderLocalized(page.content.kk)},
    },
  }`;
}

function emitTs() {
  const pages = AUDIENCES.map((ctx) => ({
    id: ctx.id,
    content: { ru: buildRu(ctx), en: buildEn(ctx), kk: buildKk(ctx) },
  }));

  const body = pages.map(renderPage).join(",\n");
  const hubLines = ["ru", "en", "kk", "ky", "uz", "tg", "tr", "az", "ar", "es", "pt", "fr", "de", "it", "pl", "uk", "hi", "id", "vi", "zh"]
    .map((l) => {
      const hub = l === "ru" ? HUB.ru : l === "kk" ? HUB.kk : HUB.en;
      return `  ${l}: ${JSON.stringify(hub)},`;
    })
    .join("\n");

  const file = `/** Auto-generated by scripts/seo/build-audience-pages.mjs — do not edit manually */
import type { Locale, TranslationStatus } from "@/lib/i18n/localeConfig";

export type FaqItem = {
  question: string;
  answer: string;
};

export type AudienceLocalized = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  chipLabel: string;
  sections: Array<{ title: string; body: string }>;
  forWho: string[];
  tasks: string[];
  howHelps: string[];
  scenarios: Array<{ title: string; body: string }>;
  limitations: string;
  faq: FaqItem[];
  relatedLinks: Array<{ label: string; href: string }>;
  status: TranslationStatus;
};

export type AudiencePage = {
  id: string;
  content: {
    ru: AudienceLocalized;
    en: AudienceLocalized;
    kk: AudienceLocalized;
  };
};

export const audiencePages: AudiencePage[] = [
${body}
];

export function getAudienceBySlug(locale: Locale, slug: string) {
  const loc = locale === "ru" || locale === "en" || locale === "kk" ? locale : null;
  if (!loc) return undefined;
  return audiencePages.find((p) => p.content[loc].slug === slug);
}

export function getAudienceById(id: string) {
  return audiencePages.find((p) => p.id === id);
}

export const audiencePathByLocale: Record<Locale, string> = {
${hubLines}
};

export function getAudienceChips(locale: Locale) {
  if (locale !== "ru" && locale !== "en" && locale !== "kk") return [];
  const hub = audiencePathByLocale[locale];
  return audiencePages.map((p) => ({
    id: p.id,
    label: p.content[locale].chipLabel,
    href: "/" + locale + "/" + hub + "/" + p.content[locale].slug,
  }));
}
`;

  writeFileSync(OUT, file, "utf8");
  console.log("Wrote", OUT);
}

const MIN = { ru: 900, en: 900, kk: 850 };
let failed = false;

for (const ctx of AUDIENCES) {
  for (const locale of ["ru", "en", "kk"]) {
    const loc =
      locale === "ru" ? buildRu(ctx) : locale === "en" ? buildEn(ctx) : buildKk(ctx);
    const wc = wordCount(loc);
    console.log(`  ${ctx.id} ${locale}: ${wc} words`);
    if (wc < MIN[locale]) {
      console.error(`FAIL ${ctx.id} ${locale}: ${wc} < ${MIN[locale]}`);
      failed = true;
    }
  }
}

emitTs();
if (failed) process.exit(1);
