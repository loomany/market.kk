import type { Locale, TranslationStatus } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";

export type FaqItem = {
  question: string;
  answer: string;
};

export type LocalizedSeoText = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  shortAnswer: string;
  howVitrinaHelps: string[];
  limitations: string[];
  disclaimer: string;
  faq: FaqItem[];
  status: TranslationStatus;
};

export type PlatformSeoPage = {
  id: string;
  name: string;
  category: "marketplace" | "storefront" | "social" | "classifieds";
  relatedUseCases: string[];
  content: Record<Locale, LocalizedSeoText>;
};

type PlatformSeed = {
  id: string;
  name: string;
  slug: string;
  category: PlatformSeoPage["category"];
  relatedUseCases: string[];
};

const platformSeeds: PlatformSeed[] = [
  { id: "kaspi", name: "Kaspi", slug: "kaspi", category: "marketplace", relatedUseCases: ["exact-product-card", "marketplace-white-background", "jewelry-product-photos"] },
  { id: "wildberries", name: "Wildberries", slug: "wildberries", category: "marketplace", relatedUseCases: ["exact-product-card", "clothing-on-model", "marketplace-white-background"] },
  { id: "ozon", name: "Ozon", slug: "ozon", category: "marketplace", relatedUseCases: ["exact-product-card", "product-video-from-photo", "marketplace-white-background"] },
  { id: "ebay", name: "eBay", slug: "ebay", category: "marketplace", relatedUseCases: ["exact-product-card", "jewelry-product-photos", "shoes-product-photos"] },
  { id: "amazon", name: "Amazon", slug: "amazon", category: "marketplace", relatedUseCases: ["marketplace-white-background", "exact-product-card", "product-video-from-photo"] },
  { id: "etsy", name: "Etsy", slug: "etsy", category: "marketplace", relatedUseCases: ["jewelry-product-photos", "creative-product-scene", "bags-product-photos"] },
  { id: "shopify", name: "Shopify", slug: "shopify", category: "storefront", relatedUseCases: ["ecommerce-catalog-photos", "creative-product-scene", "product-video-from-photo"] },
  { id: "instagram-shop", name: "Instagram Shop", slug: "instagram-shop", category: "social", relatedUseCases: ["instagram-product-photos", "reels-from-product-image", "creative-product-scene"] },
  { id: "tiktok-shop", name: "TikTok Shop", slug: "tiktok-shop", category: "social", relatedUseCases: ["reels-from-product-image", "product-video-from-photo", "creative-product-scene"] },
  { id: "facebook-marketplace", name: "Facebook Marketplace", slug: "facebook-marketplace", category: "social", relatedUseCases: ["exact-product-card", "marketplace-white-background", "small-business-product-photos"] },
  { id: "olx", name: "OLX", slug: "olx", category: "classifieds", relatedUseCases: ["small-business-product-photos", "product-photo-cleanup", "marketplace-white-background"] },
  { id: "aliexpress", name: "AliExpress", slug: "aliexpress", category: "marketplace", relatedUseCases: ["supplier-catalog-photos", "exact-product-card", "marketplace-white-background"] },
  { id: "temu", name: "Temu", slug: "temu", category: "marketplace", relatedUseCases: ["supplier-catalog-photos", "ecommerce-catalog-photos", "exact-product-card"] },
];

const publishedLocales = new Set<Locale>(["ru", "en"]);

function localizedSlug(seed: PlatformSeed, locale: Locale): string {
  if (locale === "ru") return `${seed.slug}-foto-tovarov`;
  return `${seed.slug}-product-photos`;
}

function createRuContent(seed: PlatformSeed): LocalizedSeoText {
  return {
    slug: localizedSlug(seed, "ru"),
    title: `Фото товаров для ${seed.name} — Vitrina AI Studio`,
    metaDescription: `Как подготовить изображения товаров для ${seed.name}: фон, точность карточки, видео, ограничения AI и ручная проверка перед публикацией.`,
    h1: `Фото товаров для ${seed.name}`,
    shortAnswer: `Vitrina AI Studio помогает подготовить исходные фото товара для карточек ${seed.name}: очистить фон, собрать аккуратный product shot, проверить форму и детали перед публикацией.`,
    howVitrinaHelps: [
      "создать точную товарную карточку из исходного фото;",
      "подготовить белый или нейтральный фон без лишних предметов;",
      "сделать варианты для каталога, соцсетей и коротких промо-роликов;",
      "проверить цвет, форму, узор, края и важные детали товара;",
    ],
    limitations: [
      "AI может изменить форму, цвет, логотип, фактуру или мелкие детали;",
      "требования площадки могут меняться без уведомления;",
      "перед публикацией нужно сверять результат с актуальными правилами площадки;",
    ],
    disclaimer: `Vitrina AI Studio не является официальным партнёром ${seed.name}. Требования к изображениям могут меняться. Перед публикацией проверяйте актуальные правила маркетплейса.`,
    faq: [
      {
        question: `Можно ли гарантировать принятие фото на ${seed.name}?`,
        answer: "Нет. Сервис помогает подготовить изображение, но финальную проверку и соответствие правилам площадки делает продавец.",
      },
      {
        question: "Что лучше проверять после AI-генерации?",
        answer: "Сравните цвет, форму, узор, логотипы, края, тени, пропорции и отсутствие лишних предметов.",
      },
      {
        question: "Можно ли использовать демо-режим?",
        answer: "Да. Демо-режим показывает workflow без списаний и real AI calls.",
      },
    ],
    status: "published",
  };
}

function createEnContent(seed: PlatformSeed): LocalizedSeoText {
  return {
    slug: localizedSlug(seed, "en"),
    title: `Product photos for ${seed.name} — Vitrina AI Studio`,
    metaDescription: `Prepare product images for ${seed.name}: clean backgrounds, exact product cards, AI limitations, and manual quality checks before publishing.`,
    h1: `Product photos for ${seed.name}`,
    shortAnswer: `Vitrina AI Studio helps sellers prepare source product photos for ${seed.name}: clean backgrounds, build listing-ready product shots, and review important details before publishing.`,
    howVitrinaHelps: [
      "create an exact product card from a real product image;",
      "prepare a white or neutral background without distracting objects;",
      "draft catalog, social, and short-video assets from one source photo;",
      "review color, shape, pattern, edges, and product details;",
    ],
    limitations: [
      "AI can distort shape, color, logos, texture, or small details;",
      "platform image rules may change over time;",
      "sellers should check the latest platform requirements before publishing;",
    ],
    disclaimer: `Vitrina AI Studio is not an official partner of ${seed.name}. Image requirements can change. Check the latest marketplace rules before publishing.`,
    faq: [
      {
        question: `Can Vitrina AI Studio guarantee ${seed.name} acceptance?`,
        answer: "No. The service helps prepare images, but the seller must verify compliance with the current platform rules.",
      },
      {
        question: "What should I review after AI generation?",
        answer: "Check product color, shape, pattern, logos, edges, shadows, proportions, and unwanted objects.",
      },
      {
        question: "Can I use demo mode?",
        answer: "Yes. Demo mode shows the workflow without charges or real AI calls.",
      },
    ],
    status: "published",
  };
}

function createFallbackContent(seed: PlatformSeed, locale: Locale): LocalizedSeoText {
  return {
    ...createEnContent(seed),
    slug: localizedSlug(seed, locale),
    status: publishedLocales.has(locale) ? "published" : "needs_review",
  };
}

export const platformPages: PlatformSeoPage[] = platformSeeds.map((seed) => ({
  id: seed.id,
  name: seed.name,
  category: seed.category,
  relatedUseCases: seed.relatedUseCases,
  content: Object.fromEntries(
    supportedLocaleCodes.map((locale) => {
      if (locale === "ru") return [locale, createRuContent(seed)];
      if (locale === "en") return [locale, createEnContent(seed)];
      return [locale, createFallbackContent(seed, locale)];
    })
  ) as Record<Locale, LocalizedSeoText>,
}));

export function getPlatformBySlug(locale: Locale, slug: string) {
  return platformPages.find((page) => page.content[locale].slug === slug);
}

export function getPlatformById(id: string) {
  return platformPages.find((page) => page.id === id);
}
