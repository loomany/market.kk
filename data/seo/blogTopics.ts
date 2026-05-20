import type { Locale } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import type { FaqItem } from "./platforms";

export type BlogTopicStatus =
  | "published"
  | "draft"
  | "noindex"
  | "needs_review"
  | "ready_for_review";
export type BlogIntent =
  | "commercial"
  | "informational"
  | "comparison"
  | "how-to"
  | "platform";

export type BlogTopic = {
  id: string;
  cluster: string;
  priority: "P0" | "P1" | "P2";
  targetIntent: BlogIntent;
  targetAudience: string[];
  primaryKeyword: Partial<Record<Locale, string>>;
  secondaryKeywords: Partial<Record<Locale, string[]>>;
  longTailKeywords: Partial<Record<Locale, string[]>>;
  questionKeywords: Partial<Record<Locale, string[]>>;
  title: Partial<Record<Locale, string>>;
  slug: Partial<Record<Locale, string>>;
  metaDescription: Partial<Record<Locale, string>>;
  status: Record<Locale, BlogTopicStatus>;
  internalLinks: string[];
  relatedUseCases: string[];
  relatedPlatforms: string[];
  faq: FaqItem[];
};

type TopicSeed = {
  n: number;
  cluster: string;
  ru: string;
  en: string;
  intent: BlogIntent;
  useCases: string[];
  platforms: string[];
};

const seeds: TopicSeed[] = [
  { n: 1, cluster: "AI product photography basics", ru: "Что такое AI-фото товаров", en: "What is AI product photography", intent: "informational", useCases: ["exact-product-card"], platforms: ["Kaspi", "Wildberries", "Ozon", "Amazon", "eBay"] },
  { n: 2, cluster: "AI product photography basics", ru: "Как сделать фото товара для маркетплейса", en: "How to create product photos for a marketplace", intent: "how-to", useCases: ["exact-product-card", "marketplace-white-background"], platforms: ["Kaspi", "Wildberries", "Ozon", "Amazon", "eBay"] },
  { n: 3, cluster: "AI product photography basics", ru: "Как сделать белый фон для товара", en: "How to make a white background for a product", intent: "how-to", useCases: ["marketplace-white-background"], platforms: ["Kaspi", "Amazon", "eBay"] },
  { n: 4, cluster: "AI product photography basics", ru: "Как улучшить фото товара без фотографа", en: "How to improve product photos without a photographer", intent: "how-to", useCases: ["product-photo-cleanup"], platforms: ["Shopify", "Instagram Shop"] },
  { n: 5, cluster: "AI product photography basics", ru: "Как сделать карточку товара из обычного фото", en: "How to make a product card from a regular photo", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Kaspi", "Ozon", "Wildberries"] },
  { n: 6, cluster: "AI product photography basics", ru: "Как AI помогает продавцам маркетплейсов", en: "How AI helps marketplace sellers", intent: "informational", useCases: ["ecommerce-catalog-photos"], platforms: ["Kaspi", "Wildberries", "Amazon"] },
  { n: 7, cluster: "AI product photography basics", ru: "Ошибки в товарных фото, которые снижают продажи", en: "Product photo mistakes that hurt sales", intent: "informational", useCases: ["exact-product-card"], platforms: ["Shopify", "Amazon"] },
  { n: 8, cluster: "AI product photography basics", ru: "Как проверить AI-фото перед публикацией", en: "How to review AI product photos before publishing", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Kaspi", "Amazon", "Etsy"] },
  { n: 9, cluster: "AI product photography basics", ru: "Почему AI может менять товар и как этого избежать", en: "Why AI can change a product and how to reduce it", intent: "informational", useCases: ["exact-product-card"], platforms: ["Ozon", "Amazon"] },
  { n: 10, cluster: "AI product photography basics", ru: "Как сохранить цвет и форму товара в AI-фото", en: "How to preserve product color and shape in AI photos", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Kaspi", "Amazon"] },
  { n: 11, cluster: "clothing / fashion", ru: "Как сделать фото одежды на модели", en: "How to create clothing photos on a model", intent: "how-to", useCases: ["clothing-on-model"], platforms: ["Wildberries", "Ozon", "Shopify"] },
  { n: 12, cluster: "clothing / fashion", ru: "Как перенести одежду на AI-модель", en: "How to place clothing on an AI model", intent: "how-to", useCases: ["clothing-on-model"], platforms: ["Shopify", "Instagram Shop"] },
  { n: 13, cluster: "clothing / fashion", ru: "Фото платья на AI-модели", en: "Dress photos on an AI model", intent: "commercial", useCases: ["clothing-on-model"], platforms: ["Wildberries", "Instagram Shop"] },
  { n: 14, cluster: "clothing / fashion", ru: "Фото футболки на AI-модели", en: "T-shirt photos on an AI model", intent: "commercial", useCases: ["clothing-on-model"], platforms: ["Wildberries", "Shopify"] },
  { n: 15, cluster: "clothing / fashion", ru: "Фото костюма на AI-модели", en: "Suit photos on an AI model", intent: "commercial", useCases: ["clothing-on-model"], platforms: ["Shopify", "Ozon"] },
  { n: 16, cluster: "clothing / fashion", ru: "Фото белья на AI-модели", en: "Lingerie photos on an AI model", intent: "commercial", useCases: ["lingerie-on-ai-model"], platforms: ["Wildberries", "Ozon", "Shopify"] },
  { n: 17, cluster: "clothing / fashion", ru: "Фото plus-size модели для одежды", en: "Plus-size model photos for clothing", intent: "commercial", useCases: ["plus-size-model-photos"], platforms: ["Shopify", "Instagram Shop"] },
  { n: 18, cluster: "clothing / fashion", ru: "Как выбрать позу AI-модели", en: "How to choose an AI model pose", intent: "how-to", useCases: ["clothing-on-model"], platforms: ["Shopify"] },
  { n: 19, cluster: "clothing / fashion", ru: "Как сделать каталог одежды без фотосессии", en: "How to create a clothing catalog without a photoshoot", intent: "how-to", useCases: ["ecommerce-catalog-photos", "clothing-on-model"], platforms: ["Shopify", "Wildberries"] },
  { n: 20, cluster: "clothing / fashion", ru: "Как подготовить фото одежды для AI-примерки", en: "How to prepare clothing photos for AI try-on", intent: "how-to", useCases: ["clothing-on-model"], platforms: ["Shopify", "Ozon"] },
  { n: 21, cluster: "accessories / jewelry", ru: "Как сделать фото бижутерии для маркетплейса", en: "How to create jewelry product photos for a marketplace", intent: "how-to", useCases: ["jewelry-product-photos"], platforms: ["Kaspi", "Etsy", "eBay"] },
  { n: 22, cluster: "accessories / jewelry", ru: "Как сфотографировать серьги для карточки товара", en: "How to photograph earrings for a product card", intent: "how-to", useCases: ["jewelry-product-photos"], platforms: ["Etsy", "Kaspi"] },
  { n: 23, cluster: "accessories / jewelry", ru: "Как сделать фото кольца на белом фоне", en: "How to make ring photos on a white background", intent: "how-to", useCases: ["jewelry-product-photos", "marketplace-white-background"], platforms: ["Etsy", "eBay"] },
  { n: 24, cluster: "accessories / jewelry", ru: "Как сделать фото браслета для каталога", en: "How to make bracelet photos for a catalog", intent: "how-to", useCases: ["jewelry-product-photos"], platforms: ["Etsy", "Shopify"] },
  { n: 25, cluster: "accessories / jewelry", ru: "Как убрать лишний фон у аксессуаров", en: "How to remove distracting backgrounds from accessories", intent: "how-to", useCases: ["product-photo-cleanup"], platforms: ["Etsy", "Instagram Shop"] },
  { n: 26, cluster: "accessories / jewelry", ru: "Почему AI меняет украшения и как это контролировать", en: "Why AI changes jewelry and how to control it", intent: "informational", useCases: ["jewelry-product-photos"], platforms: ["Etsy", "eBay"] },
  { n: 27, cluster: "accessories / jewelry", ru: "Как сделать точную карточку товара для бижутерии", en: "How to make an exact product card for jewelry", intent: "how-to", useCases: ["exact-product-card", "jewelry-product-photos"], platforms: ["Kaspi", "Etsy"] },
  { n: 28, cluster: "accessories / jewelry", ru: "Как сделать lifestyle-фото украшений", en: "How to create lifestyle jewelry photos", intent: "how-to", useCases: ["creative-product-scene", "jewelry-product-photos"], platforms: ["Etsy", "Instagram Shop"] },
  { n: 29, cluster: "accessories / jewelry", ru: "Как подготовить фото сумки для маркетплейса", en: "How to prepare bag photos for a marketplace", intent: "how-to", useCases: ["bags-product-photos"], platforms: ["Kaspi", "Ozon"] },
  { n: 30, cluster: "accessories / jewelry", ru: "Как сделать фото обуви для карточки товара", en: "How to create shoe photos for a product card", intent: "how-to", useCases: ["shoes-product-photos"], platforms: ["Kaspi", "Wildberries", "Amazon"] },
  { n: 31, cluster: "marketplaces", ru: "Фото товаров для Kaspi", en: "Product photos for Kaspi", intent: "platform", useCases: ["exact-product-card"], platforms: ["Kaspi"] },
  { n: 32, cluster: "marketplaces", ru: "Фото товаров для Wildberries", en: "Product photos for Wildberries", intent: "platform", useCases: ["clothing-on-model", "marketplace-white-background"], platforms: ["Wildberries"] },
  { n: 33, cluster: "marketplaces", ru: "Фото товаров для Ozon", en: "Product photos for Ozon", intent: "platform", useCases: ["exact-product-card", "product-video-from-photo"], platforms: ["Ozon"] },
  { n: 34, cluster: "marketplaces", ru: "Фото товаров для eBay", en: "Product photos for eBay", intent: "platform", useCases: ["marketplace-white-background"], platforms: ["eBay"] },
  { n: 35, cluster: "marketplaces", ru: "Фото товаров для Amazon", en: "Product photos for Amazon", intent: "platform", useCases: ["marketplace-white-background"], platforms: ["Amazon"] },
  { n: 36, cluster: "marketplaces", ru: "Фото товаров для Etsy", en: "Product photos for Etsy", intent: "platform", useCases: ["jewelry-product-photos"], platforms: ["Etsy"] },
  { n: 37, cluster: "marketplaces", ru: "Фото товаров для Shopify", en: "Product photos for Shopify", intent: "platform", useCases: ["ecommerce-catalog-photos"], platforms: ["Shopify"] },
  { n: 38, cluster: "marketplaces", ru: "Фото товаров для Instagram Shop", en: "Product photos for Instagram Shop", intent: "platform", useCases: ["instagram-product-photos"], platforms: ["Instagram Shop"] },
  { n: 39, cluster: "marketplaces", ru: "Фото товаров для TikTok Shop", en: "Product photos for TikTok Shop", intent: "platform", useCases: ["reels-from-product-image"], platforms: ["TikTok Shop"] },
  { n: 40, cluster: "marketplaces", ru: "Фото товаров для Facebook Marketplace", en: "Product photos for Facebook Marketplace", intent: "platform", useCases: ["small-business-product-photos"], platforms: ["Facebook Marketplace"] },
  { n: 41, cluster: "marketplaces", ru: "Фото товаров для OLX", en: "Product photos for OLX", intent: "platform", useCases: ["small-business-product-photos"], platforms: ["OLX"] },
  { n: 42, cluster: "marketplaces", ru: "Фото товаров для AliExpress", en: "Product photos for AliExpress", intent: "platform", useCases: ["supplier-catalog-photos"], platforms: ["AliExpress"] },
  { n: 43, cluster: "marketplaces", ru: "Фото товаров для Temu", en: "Product photos for Temu", intent: "platform", useCases: ["supplier-catalog-photos"], platforms: ["Temu"] },
  { n: 44, cluster: "formats and social", ru: "Формат 1:1 для карточки товара", en: "1:1 format for product cards", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Kaspi", "Amazon"] },
  { n: 45, cluster: "formats and social", ru: "Формат 4:5 для маркетплейса", en: "4:5 format for marketplaces", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Wildberries", "Ozon"] },
  { n: 46, cluster: "formats and social", ru: "Формат 9:16 для Reels и Stories", en: "9:16 format for Reels and Stories", intent: "how-to", useCases: ["reels-from-product-image"], platforms: ["Instagram Shop", "TikTok Shop"] },
  { n: 47, cluster: "formats and social", ru: "Как сделать Reels из фото товара", en: "How to make Reels from a product photo", intent: "how-to", useCases: ["reels-from-product-image"], platforms: ["Instagram Shop"] },
  { n: 48, cluster: "formats and social", ru: "Как сделать видео товара из фотографии", en: "How to create a product video from a photo", intent: "how-to", useCases: ["product-video-from-photo"], platforms: ["Ozon", "Shopify", "TikTok Shop"] },
  { n: 49, cluster: "formats and social", ru: "Как подготовить фото для Instagram", en: "How to prepare product photos for Instagram", intent: "how-to", useCases: ["instagram-product-photos"], platforms: ["Instagram Shop"] },
  { n: 50, cluster: "formats and social", ru: "Как сделать баннер товара для рекламы", en: "How to make a product banner for ads", intent: "how-to", useCases: ["creative-product-scene"], platforms: ["Shopify", "Instagram Shop"] },
  { n: 51, cluster: "formats and social", ru: "Как адаптировать фото товара под разные площадки", en: "How to adapt product photos for different platforms", intent: "how-to", useCases: ["ecommerce-catalog-photos"], platforms: ["Kaspi", "Amazon", "Etsy"] },
  { n: 52, cluster: "formats and social", ru: "Как сделать вертикальное фото товара", en: "How to make a vertical product photo", intent: "how-to", useCases: ["instagram-product-photos"], platforms: ["Instagram Shop", "TikTok Shop"] },
  { n: 53, cluster: "formats and social", ru: "Как сделать горизонтальное фото товара", en: "How to make a horizontal product photo", intent: "how-to", useCases: ["ecommerce-catalog-photos"], platforms: ["Shopify"] },
  { n: 54, cluster: "workflow / SaaS / business", ru: "Как продавцу быстро подготовить каталог товаров", en: "How sellers can prepare a product catalog quickly", intent: "how-to", useCases: ["ecommerce-catalog-photos"], platforms: ["Shopify", "Kaspi"] },
  { n: 55, cluster: "workflow / SaaS / business", ru: "Как менеджеру маркетплейса ускорить контент", en: "How marketplace managers can speed up content", intent: "how-to", useCases: ["marketplace-content-manager-workflow"], platforms: ["Kaspi", "Wildberries", "Ozon"] },
  { n: 56, cluster: "workflow / SaaS / business", ru: "Как шоуруму сделать фото товаров без фотографа", en: "How a showroom can create product photos without a photographer", intent: "how-to", useCases: ["showroom-product-photos"], platforms: ["Instagram Shop", "Shopify"] },
  { n: 57, cluster: "workflow / SaaS / business", ru: "Как поставщику подготовить каталог для клиентов", en: "How suppliers can prepare a catalog for clients", intent: "how-to", useCases: ["supplier-catalog-photos"], platforms: ["AliExpress", "Temu"] },
  { n: 58, cluster: "workflow / SaaS / business", ru: "Как малому бизнесу сделать карточки товаров", en: "How small businesses can create product cards", intent: "how-to", useCases: ["small-business-product-photos"], platforms: ["OLX", "Facebook Marketplace"] },
  { n: 59, cluster: "workflow / SaaS / business", ru: "Как сэкономить на товарной фотосъёмке", en: "How to reduce product photoshoot costs", intent: "informational", useCases: ["ecommerce-catalog-photos"], platforms: ["Shopify"] },
  { n: 60, cluster: "workflow / SaaS / business", ru: "Когда AI-фото лучше фотосессии", en: "When AI product photos are better than a photoshoot", intent: "comparison", useCases: ["ecommerce-catalog-photos"], platforms: ["Shopify"] },
  { n: 61, cluster: "workflow / SaaS / business", ru: "Когда AI-фото не подходит", en: "When AI product photos are not a fit", intent: "comparison", useCases: ["exact-product-card"], platforms: ["Amazon", "Kaspi"] },
  { n: 62, cluster: "workflow / SaaS / business", ru: "Как организовать workflow товарного контента", en: "How to organize a product content workflow", intent: "how-to", useCases: ["marketplace-content-manager-workflow"], platforms: ["Kaspi", "Shopify"] },
  { n: 63, cluster: "workflow / SaaS / business", ru: "Как проверять качество AI-карточек", en: "How to check the quality of AI product cards", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Kaspi", "Amazon"] },
  { n: 64, cluster: "background / cleanup", ru: "Как удалить фон с фото товара", en: "How to remove the background from a product photo", intent: "how-to", useCases: ["product-photo-cleanup"], platforms: ["Amazon", "eBay"] },
  { n: 65, cluster: "background / cleanup", ru: "Как заменить фон у товара", en: "How to replace a product background", intent: "how-to", useCases: ["ai-background-replacement"], platforms: ["Shopify", "Instagram Shop"] },
  { n: 66, cluster: "background / cleanup", ru: "Белый фон или lifestyle-сцена: что выбрать", en: "White background or lifestyle scene: what to choose", intent: "comparison", useCases: ["marketplace-white-background", "creative-product-scene"], platforms: ["Amazon", "Etsy"] },
  { n: 67, cluster: "background / cleanup", ru: "Как убрать лишние предметы с фото товара", en: "How to remove unwanted objects from a product photo", intent: "how-to", useCases: ["product-photo-cleanup"], platforms: ["OLX", "Kaspi"] },
  { n: 68, cluster: "background / cleanup", ru: "Как выделить товар на фото", en: "How to isolate a product in a photo", intent: "how-to", useCases: ["product-photo-cleanup"], platforms: ["eBay", "Amazon"] },
  { n: 69, cluster: "background / cleanup", ru: "Как сделать фон для товара на улице", en: "How to create an outdoor background for a product", intent: "how-to", useCases: ["creative-product-scene"], platforms: ["Instagram Shop"] },
  { n: 70, cluster: "background / cleanup", ru: "Как сделать студийный фон для товара", en: "How to create a studio background for a product", intent: "how-to", useCases: ["ai-background-replacement"], platforms: ["Shopify"] },
  { n: 71, cluster: "background / cleanup", ru: "Как сделать luxury-фон для товара", en: "How to create a luxury background for a product", intent: "how-to", useCases: ["creative-product-scene"], platforms: ["Etsy", "Instagram Shop"] },
  { n: 72, cluster: "background / cleanup", ru: "Как не испортить товар при замене фона", en: "How to avoid damaging product accuracy when changing backgrounds", intent: "how-to", useCases: ["ai-background-replacement"], platforms: ["Amazon", "Kaspi"] },
  { n: 73, cluster: "background / cleanup", ru: "Как подготовить фото с плохим фоном", en: "How to prepare a product photo with a bad background", intent: "how-to", useCases: ["product-photo-cleanup"], platforms: ["OLX", "Facebook Marketplace"] },
  { n: 74, cluster: "comparison", ru: "AI-фото или фотосессия: что выбрать", en: "AI product photos or a photoshoot: what to choose", intent: "comparison", useCases: ["ecommerce-catalog-photos"], platforms: ["Shopify"] },
  { n: 75, cluster: "comparison", ru: "Product Shot или одежда на модели", en: "Product shot or clothing on model", intent: "comparison", useCases: ["exact-product-card", "clothing-on-model"], platforms: ["Wildberries", "Shopify"] },
  { n: 76, cluster: "comparison", ru: "Белый фон или креативная сцена", en: "White background or creative scene", intent: "comparison", useCases: ["marketplace-white-background", "creative-product-scene"], platforms: ["Amazon", "Etsy"] },
  { n: 77, cluster: "comparison", ru: "AI-модель или реальная модель", en: "AI model or real model", intent: "comparison", useCases: ["clothing-on-model"], platforms: ["Shopify"] },
  { n: 78, cluster: "comparison", ru: "Точная карточка или креативная сцена", en: "Exact product card or creative scene", intent: "comparison", useCases: ["exact-product-card", "creative-product-scene"], platforms: ["Kaspi", "Instagram Shop"] },
  { n: 79, cluster: "comparison", ru: "Фото товара или видео товара", en: "Product photo or product video", intent: "comparison", useCases: ["product-video-from-photo"], platforms: ["Ozon", "TikTok Shop"] },
  { n: 80, cluster: "comparison", ru: "Ручное выделение товара или автоудаление фона", en: "Manual product selection or automatic background removal", intent: "comparison", useCases: ["product-photo-cleanup"], platforms: ["Amazon"] },
  { n: 81, cluster: "comparison", ru: "Что лучше для маркетплейса: 1:1 или 4:5", en: "What is better for marketplaces: 1:1 or 4:5", intent: "comparison", useCases: ["exact-product-card"], platforms: ["Kaspi", "Wildberries"] },
  { n: 82, cluster: "comparison", ru: "Что лучше для Instagram: фото или Reels", en: "What is better for Instagram: photo or Reels", intent: "comparison", useCases: ["instagram-product-photos", "reels-from-product-image"], platforms: ["Instagram Shop"] },
  { n: 83, cluster: "comparison", ru: "Почему разные площадки требуют разные форматы", en: "Why different platforms need different formats", intent: "informational", useCases: ["ecommerce-catalog-photos"], platforms: ["Amazon", "Etsy", "Kaspi"] },
  { n: 84, cluster: "localization / international sellers", ru: "Как продавать товары на разных маркетплейсах", en: "How to sell products on different marketplaces", intent: "informational", useCases: ["supplier-catalog-photos"], platforms: ["Amazon", "eBay", "Etsy"] },
  { n: 85, cluster: "localization / international sellers", ru: "Как подготовить фото товара для зарубежного рынка", en: "How to prepare product photos for international markets", intent: "how-to", useCases: ["ecommerce-catalog-photos"], platforms: ["Amazon", "eBay", "Etsy"] },
  { n: 86, cluster: "localization / international sellers", ru: "Как сделать каталог на нескольких языках", en: "How to create a multilingual product catalog", intent: "how-to", useCases: ["supplier-catalog-photos"], platforms: ["Shopify", "AliExpress"] },
  { n: 87, cluster: "localization / international sellers", ru: "Как адаптировать карточку товара для eBay", en: "How to adapt a product card for eBay", intent: "platform", useCases: ["exact-product-card"], platforms: ["eBay"] },
  { n: 88, cluster: "localization / international sellers", ru: "Как адаптировать карточку товара для Amazon", en: "How to adapt a product card for Amazon", intent: "platform", useCases: ["marketplace-white-background"], platforms: ["Amazon"] },
  { n: 89, cluster: "localization / international sellers", ru: "Как адаптировать фото для Etsy", en: "How to adapt product photos for Etsy", intent: "platform", useCases: ["jewelry-product-photos"], platforms: ["Etsy"] },
  { n: 90, cluster: "localization / international sellers", ru: "Как подготовить визуал для Shopify", en: "How to prepare visuals for Shopify", intent: "platform", useCases: ["ecommerce-catalog-photos"], platforms: ["Shopify"] },
  { n: 91, cluster: "localization / international sellers", ru: "Как сделать фото для локального маркетплейса", en: "How to make photos for a local marketplace", intent: "how-to", useCases: ["exact-product-card"], platforms: ["OLX", "Kaspi"] },
  { n: 92, cluster: "localization / international sellers", ru: "Как AI помогает поставщикам из СНГ", en: "How AI helps suppliers from the CIS", intent: "informational", useCases: ["supplier-catalog-photos"], platforms: ["AliExpress", "Temu"] },
  { n: 93, cluster: "localization / international sellers", ru: "Как сделать товарный контент для международных клиентов", en: "How to create product content for international clients", intent: "how-to", useCases: ["supplier-catalog-photos"], platforms: ["Shopify", "Amazon"] },
  { n: 94, cluster: "AI prompt / advanced", ru: "Как написать prompt для товарного фото", en: "How to write a prompt for product photography", intent: "how-to", useCases: ["creative-product-scene"], platforms: ["Shopify", "Instagram Shop"] },
  { n: 95, cluster: "AI prompt / advanced", ru: "Как улучшить prompt для AI-видео", en: "How to improve a prompt for AI video", intent: "how-to", useCases: ["product-video-from-photo"], platforms: ["TikTok Shop"] },
  { n: 96, cluster: "AI prompt / advanced", ru: "Как описать модель для одежды", en: "How to describe a model for clothing photos", intent: "how-to", useCases: ["clothing-on-model"], platforms: ["Shopify"] },
  { n: 97, cluster: "AI prompt / advanced", ru: "Как сделать AI-фон без изменения товара", en: "How to create an AI background without changing the product", intent: "how-to", useCases: ["ai-background-replacement"], platforms: ["Amazon", "Kaspi"] },
  { n: 98, cluster: "AI prompt / advanced", ru: "Как заставить AI сохранить товар", en: "How to make AI preserve the product", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Kaspi", "Amazon"] },
  { n: 99, cluster: "AI prompt / advanced", ru: "Как проверить, что AI не изменил товар", en: "How to check that AI did not change the product", intent: "how-to", useCases: ["exact-product-card"], platforms: ["Amazon", "Kaspi"] },
  { n: 100, cluster: "AI prompt / advanced", ru: "Как использовать Vitrina AI Studio для контент-плана магазина", en: "How to use Vitrina AI Studio for a store content plan", intent: "how-to", useCases: ["marketplace-content-manager-workflow"], platforms: ["Shopify", "Instagram Shop"] },
];

const p0Numbers = new Set([
  1, 3, 11, 16, 21, 29, 30, 31, 32, 33, 34, 35, 36, 47, 48, 65, 67, 74, 94, 98,
]);

/** RU Stage 2: 8 expanded + 12 new P0 articles; Stage 11 Wave 2: +20 articles */
const publishedRuNumbers = new Set([
  1, 2, 3, 4, 5, 8, 11, 12, 16, 21, 30, 31, 32, 33, 47, 48, 64, 65, 74, 98,
  6, 7, 9, 10, 19, 20, 29, 34, 35, 36, 49, 55, 60, 61, 63, 67, 75, 77, 94, 96,
]);

/** EN Stage 2 + Stage 11 Wave 2: published pairs */
const publishedEnNumbers = new Set([
  1, 2, 3, 4, 5, 8, 11, 12, 16, 21, 30, 31, 32, 33, 47, 48, 64, 65, 74, 98,
  6, 7, 9, 10, 19, 20, 29, 34, 35, 36, 49, 55, 60, 61, 63, 67, 75, 77, 94, 96,
]);

/** KK Stage 5/6: top 10 Kaspi/marketplace articles — published when QA approved */
const publishedKkNumbers = new Set([1, 2, 3, 4, 5, 11, 12, 16, 31, 64]);

const ruSlugOverrides: Record<number, string> = {
  1: "ai-foto-tovarov-dlya-marketpleysov",
  2: "kak-sdelat-foto-tovara-dlya-marketpleysa",
  3: "kak-sdelat-belyy-fon-dlya-tovara",
  4: "kak-uluchshit-foto-tovara-bez-fotografa",
  5: "kak-sdelat-kartochku-tovara-iz-obychnogo-foto",
  8: "kak-proverit-ai-foto-pered-publikatsiey",
  11: "kak-sdelat-foto-odezhdy-na-modeli",
  12: "kak-perenesti-odezhdu-na-ai-model",
  16: "foto-belya-na-ai-modeli",
  21: "foto-bizhuterii-dlya-marketpleysa",
  30: "kak-sdelat-foto-obuvi-dlya-kartochki-tovara",
  31: "foto-tovarov-dlya-kaspi",
  32: "foto-tovarov-dlya-wildberries",
  33: "foto-tovarov-dlya-ozon",
  47: "kak-sdelat-reels-iz-foto-tovara",
  48: "kak-sdelat-video-tovara-iz-fotografii",
  64: "kak-udalit-fon-s-foto-tovara",
  65: "kak-zamenit-fon-u-tovara",
  74: "ai-foto-ili-fotosessiya-chto-vybrat",
  98: "kak-zastavit-ai-sohranit-tovar",
};

const kkSlugOverrides: Record<number, string> = {
  1: "ai-onim-fotografiyasi",
  2: "marketpleisterge-onim-fotosu-kalay-zhasau",
  3: "onim-ushin-ak-fon-kalay-zhasau",
  4: "fotosurysyz-onim-fotosyn-zhetildiru",
  5: "kadirdik-onim-fotosynan-kartochka",
  11: "kiim-ai-model-fotosy",
  12: "kiimdi-ai-modelge-kiyu",
  16: "ish-kiyim-ai-model-fotosy",
  31: "kaspi-ushin-onim-fotosy",
  64: "onim-fonyn-alu",
};

const kkTitleOverrides: Record<number, string> = {
  1: "AI тауар фотосы деген не: маркетплейс сатушыларына практикалық нұсқау",
  2: "Маркетплейске тауар фотосын қалай дайындауға болады",
  3: "Тауарға ақ фон қалай жасауға болады",
  4: "Фотосуретшісіз тауар фотосын қалай жақсартуға болады",
  5: "Қарапайым фотодан тауар карточкасын қалай жасауға болады",
  11: "Киімді AI модельде көрсету: маркетплейс workflow",
  12: "Киімді AI модельге кию: виртуалды примерка workflow",
  16: "Іш киім фотосы AI модельде: қауіпсіз каталог стилі",
  31: "Kaspi үшін тауар фотосы: дайындау және тексеру",
  64: "Тауар фонын алу: AI және қолмен QA",
};

const p0KeywordOverrides: Record<number, { ru?: string; en?: string; ruSecondary?: string[]; enSecondary?: string[] }> = {
  1: {
    ru: "ai фото товаров для маркетплейсов",
    en: "AI product photos for marketplaces",
    ruSecondary: ["фото товара для маркетплейса", "сделать карточку товара", "фото товара на белом фоне"],
    enSecondary: ["product photo for marketplace", "marketplace product photography", "white background product photo"],
  },
  3: {
    ru: "как сделать белый фон для товара",
    en: "how to make a white background for a product",
    ruSecondary: ["удалить фон товара", "фото товара на белом фоне", "карточка товара белый фон"],
    enSecondary: ["remove product background", "white background product photo", "product card white background"],
  },
  11: {
    ru: "одежда на ai модели",
    en: "clothing on AI model",
    ruSecondary: ["фото одежды на модели", "перенести одежду на модель", "ai примерка одежды"],
    enSecondary: ["AI model clothing photos", "put clothes on AI model", "AI fashion model photos"],
  },
  16: {
    ru: "фото белья на модели",
    en: "lingerie photos on model",
    ruSecondary: ["белье на ai модели", "каталог белья фото", "ai модель для белья"],
    enSecondary: ["lingerie on AI model", "AI lingerie catalog photos", "adult catalog lingerie photos"],
  },
  21: {
    ru: "фото бижутерии для маркетплейса",
    en: "jewelry product photos for marketplace",
    ruSecondary: ["фото серег для карточки товара", "фото украшений на белом фоне", "карточка товара бижутерия"],
    enSecondary: ["jewelry product photography", "earring listing photos", "white background jewelry photos"],
  },
  31: {
    ru: "фото товара для kaspi",
    en: "product photos for Kaspi",
    ruSecondary: ["карточка товара kaspi", "фото для kaspi магазина", "подготовить фото товара kaspi"],
    enSecondary: ["Kaspi product card photos", "marketplace product photo Kaspi", "product image for Kaspi"],
  },
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function statusFor(locale: Locale, n: number): BlogTopicStatus {
  if (locale === "ru" && publishedRuNumbers.has(n)) {
    return "published";
  }

  if (locale === "en" && publishedEnNumbers.has(n)) {
    return "published";
  }

  if (locale === "kk" && publishedKkNumbers.has(n)) {
    return "published";
  }

  if (locale === "ru" || locale === "en") {
    return "draft";
  }

  return "needs_review";
}

function metaDescription(locale: Locale, seed: TopicSeed): string {
  if (locale === "ru") {
    return `${seed.ru}: практический гид Vitrina AI Studio с чеклистом качества, ограничениями AI и ссылками на связанные use cases.`;
  }

  if (locale === "kk") {
    const title = kkTitleOverrides[seed.n] ?? seed.ru;
    return `${title}: Vitrina AI Studio практикалық нұсқауы — AI шектеулері, Kaspi/marketplace тексеру тізімі, жарияламас бұрын QA.`;
  }

  return `${seed.en}: a practical Vitrina AI Studio guide with a quality checklist, AI limitations, and related use cases.`;
}

export const blogTopics: BlogTopic[] = seeds.map((seed) => {
  const override = p0KeywordOverrides[seed.n];
  const enSlug = slugify(seed.en);
  const ruSlug = ruSlugOverrides[seed.n] ?? enSlug;
  const kkSlug = kkSlugOverrides[seed.n] ?? slugify(kkTitleOverrides[seed.n] ?? seed.ru);

  return {
    id: `blog_${String(seed.n).padStart(3, "0")}`,
    cluster: seed.cluster,
    priority: p0Numbers.has(seed.n) ? "P0" : seed.n <= 63 ? "P1" : "P2",
    targetIntent: seed.intent,
    targetAudience: ["marketplace sellers", "instagram shops", "small ecommerce teams"],
    primaryKeyword: {
      ru: override?.ru ?? seed.ru.toLowerCase(),
      en: override?.en ?? seed.en.toLowerCase(),
    },
    secondaryKeywords: {
      ru: override?.ruSecondary ?? ["товарное фото", "карточка товара", "AI для маркетплейса"],
      en: override?.enSecondary ?? ["product photography", "marketplace listing image", "AI ecommerce photo"],
    },
    longTailKeywords: {
      ru: [`${seed.ru.toLowerCase()} без фотографа`, `${seed.ru.toLowerCase()} для маркетплейса`],
      en: [`${seed.en.toLowerCase()} without a photographer`, `${seed.en.toLowerCase()} for marketplace sellers`],
    },
    questionKeywords: {
      ru: [`как ${seed.ru.toLowerCase()}?`, "как проверить AI-фото перед публикацией?"],
      en: [`how to ${seed.en.toLowerCase()}?`, "how to review AI product photos before publishing?"],
    },
    title: {
      ru: seed.ru,
      en: seed.en,
      kk: kkTitleOverrides[seed.n],
    },
    slug: { ru: ruSlug, en: enSlug, kk: kkSlug },
    metaDescription: {
      ru: metaDescription("ru", seed),
      en: metaDescription("en", seed),
    },
    status: Object.fromEntries(
      supportedLocaleCodes.map((locale) => [locale, statusFor(locale, seed.n)])
    ) as Record<Locale, BlogTopicStatus>,
    internalLinks: ["features", "platforms", "studio"],
    relatedUseCases: seed.useCases,
    relatedPlatforms: seed.platforms,
    faq: [
      {
        question: "Можно ли публиковать AI-результат без проверки?",
        answer: "Нет. Перед публикацией нужно вручную проверить товар, фон и актуальные требования площадки.",
      },
      {
        question: "Does AI guarantee marketplace acceptance?",
        answer: "No. AI helps prepare assets, but platform rules and seller review still matter.",
      },
    ],
  };
});

export function getBlogTopicBySlug(locale: Locale, slug: string) {
  return blogTopics.find((topic) => topic.slug[locale] === slug);
}

export function getBlogTopicById(id: string) {
  return blogTopics.find((topic) => topic.id === id);
}
