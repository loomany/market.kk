import type { Locale, TranslationStatus } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import type { FaqItem } from "./platforms";

export type UseCaseSeoPage = {
  id: string;
  cluster: string;
  relatedPlatforms: string[];
  content: Record<
    Locale,
    {
      slug: string;
      title: string;
      metaDescription: string;
      h1: string;
      shortAnswer: string;
      sections: Array<{ title: string; body: string }>;
      internalLinks: string[];
      faq: FaqItem[];
      status: TranslationStatus;
    }
  >;
};

type UseCaseSeed = {
  id: string;
  cluster: string;
  ru: string;
  en: string;
  ruSlug: string;
  enSlug: string;
  relatedPlatforms: string[];
};

const seeds: UseCaseSeed[] = [
  { id: "clothing-on-model", cluster: "clothing / fashion", ru: "одежда на AI-модели", en: "clothing on AI model", ruSlug: "odezhda-na-ai-modeli", enSlug: "clothing-on-ai-model", relatedPlatforms: ["Wildberries", "Ozon", "Shopify", "Instagram Shop"] },
  { id: "lingerie-on-ai-model", cluster: "clothing / fashion", ru: "бельё на AI-модели", en: "lingerie on AI model", ruSlug: "bele-na-ai-modeli", enSlug: "lingerie-on-ai-model", relatedPlatforms: ["Wildberries", "Ozon", "Shopify"] },
  { id: "plus-size-model-photos", cluster: "clothing / fashion", ru: "фото plus-size модели для одежды", en: "plus-size model photos", ruSlug: "plus-size-model-foto", enSlug: "plus-size-model-photos", relatedPlatforms: ["Shopify", "Instagram Shop", "Wildberries"] },
  { id: "jewelry-product-photos", cluster: "accessories / jewelry", ru: "фото бижутерии для маркетплейса", en: "jewelry product photos", ruSlug: "foto-bizhuterii", enSlug: "jewelry-product-photos", relatedPlatforms: ["Etsy", "Kaspi", "eBay"] },
  { id: "shoes-product-photos", cluster: "accessories / jewelry", ru: "фото обуви для карточки товара", en: "shoes product photos", ruSlug: "foto-obuvi", enSlug: "shoes-product-photos", relatedPlatforms: ["Kaspi", "Wildberries", "Amazon"] },
  { id: "bags-product-photos", cluster: "accessories / jewelry", ru: "фото сумок для маркетплейса", en: "bags product photos", ruSlug: "foto-sumok", enSlug: "bags-product-photos", relatedPlatforms: ["Etsy", "Ozon", "Instagram Shop"] },
  { id: "cosmetics-product-photos", cluster: "accessories / jewelry", ru: "фото косметики для каталога", en: "cosmetics product photos", ruSlug: "foto-kosmetiki", enSlug: "cosmetics-product-photos", relatedPlatforms: ["Shopify", "Instagram Shop", "Amazon"] },
  { id: "marketplace-white-background", cluster: "background / cleanup", ru: "белый фон для маркетплейса", en: "marketplace white background", ruSlug: "belyy-fon-dlya-marketpleysa", enSlug: "marketplace-white-background", relatedPlatforms: ["Kaspi", "Amazon", "eBay", "Ozon"] },
  { id: "instagram-product-photos", cluster: "formats and social", ru: "фото товара для Instagram", en: "Instagram product photos", ruSlug: "foto-tovara-dlya-instagram", enSlug: "instagram-product-photos", relatedPlatforms: ["Instagram Shop", "Facebook Marketplace"] },
  { id: "product-video-from-photo", cluster: "formats and social", ru: "видео товара из фото", en: "product video from photo", ruSlug: "video-tovara-iz-foto", enSlug: "product-video-from-photo", relatedPlatforms: ["Ozon", "Shopify", "TikTok Shop"] },
  { id: "reels-from-product-image", cluster: "formats and social", ru: "Reels из фото товара", en: "Reels from product image", ruSlug: "reels-iz-foto-tovara", enSlug: "reels-from-product-image", relatedPlatforms: ["Instagram Shop", "TikTok Shop"] },
  { id: "ai-background-replacement", cluster: "background / cleanup", ru: "AI-замена фона у товара", en: "AI background replacement", ruSlug: "ai-zamena-fona", enSlug: "ai-background-replacement", relatedPlatforms: ["Shopify", "Etsy", "Instagram Shop"] },
  { id: "product-photo-cleanup", cluster: "background / cleanup", ru: "очистка товарного фото", en: "product photo cleanup", ruSlug: "ochistka-tovarnogo-foto", enSlug: "product-photo-cleanup", relatedPlatforms: ["OLX", "Facebook Marketplace", "Kaspi"] },
  { id: "exact-product-card", cluster: "AI product photography basics", ru: "точная товарная карточка", en: "exact product card", ruSlug: "tochnaya-tovarnaya-kartochka", enSlug: "exact-product-card", relatedPlatforms: ["Kaspi", "Wildberries", "Ozon", "Amazon"] },
  { id: "creative-product-scene", cluster: "background / cleanup", ru: "креативная сцена товара", en: "creative product scene", ruSlug: "kreativnaya-scena-tovara", enSlug: "creative-product-scene", relatedPlatforms: ["Etsy", "Instagram Shop", "Shopify"] },
  { id: "ecommerce-catalog-photos", cluster: "workflow / SaaS / business", ru: "фото для ecommerce каталога", en: "ecommerce catalog photos", ruSlug: "foto-dlya-ecommerce-kataloga", enSlug: "ecommerce-catalog-photos", relatedPlatforms: ["Shopify", "Amazon", "AliExpress"] },
  { id: "supplier-catalog-photos", cluster: "workflow / SaaS / business", ru: "каталог поставщика", en: "supplier catalog photos", ruSlug: "foto-kataloga-postavshchika", enSlug: "supplier-catalog-photos", relatedPlatforms: ["AliExpress", "Temu", "Shopify"] },
  { id: "showroom-product-photos", cluster: "workflow / SaaS / business", ru: "фото товаров шоурума", en: "showroom product photos", ruSlug: "foto-tovarov-shouruma", enSlug: "showroom-product-photos", relatedPlatforms: ["Instagram Shop", "Shopify"] },
  { id: "small-business-product-photos", cluster: "workflow / SaaS / business", ru: "товарные фото для малого бизнеса", en: "small business product photos", ruSlug: "tovarnye-foto-dlya-malogo-biznesa", enSlug: "small-business-product-photos", relatedPlatforms: ["OLX", "Facebook Marketplace", "Instagram Shop"] },
  { id: "marketplace-content-manager-workflow", cluster: "workflow / SaaS / business", ru: "workflow контент-менеджера маркетплейса", en: "marketplace content manager workflow", ruSlug: "workflow-kontent-menedzhera", enSlug: "marketplace-content-manager-workflow", relatedPlatforms: ["Kaspi", "Wildberries", "Ozon"] },
];

function createRu(seed: UseCaseSeed, status: TranslationStatus) {
  return {
    slug: seed.ruSlug,
    title: `${seed.ru[0].toUpperCase()}${seed.ru.slice(1)} — Vitrina AI Studio`,
    metaDescription: `Как использовать Vitrina AI Studio для сценария «${seed.ru}»: подготовка фото, проверка качества, ограничения AI и ссылки на платформы.`,
    h1: `${seed.ru[0].toUpperCase()}${seed.ru.slice(1)}`,
    shortAnswer: `Vitrina AI Studio помогает подготовить ${seed.ru}: загрузить исходное фото, выбрать режим, получить вариант и вручную проверить точность товара перед публикацией.`,
    sections: [
      {
        title: "Когда использовать",
        body: "Этот сценарий подходит, когда нужно быстро подготовить товарный визуал для карточки, каталога, соцсетей или коммерческой презентации.",
      },
      {
        title: "Что проверять",
        body: "Проверяйте цвет, форму, узор, логотипы, края, пропорции и отсутствие лишних объектов. AI-результат нельзя публиковать без ручной сверки.",
      },
      {
        title: "Как связать с площадками",
        body: `Для этого сценария чаще всего смотрят правила ${seed.relatedPlatforms.join(", ")}. Vitrina AI Studio не является официальным партнёром этих площадок.`,
      },
    ],
    internalLinks: ["features", "platforms", "studio"],
    faq: [
      {
        question: "Можно ли использовать результат сразу?",
        answer: "Лучше сначала пройти ручную проверку качества и сверить изображение с актуальными правилами площадки.",
      },
      {
        question: "AI сохранит товар без изменений?",
        answer: "AI может ошибаться, поэтому нужно сравнивать результат с исходным фото и отклонять неточные варианты.",
      },
    ],
    status,
  };
}

function createEn(seed: UseCaseSeed, status: TranslationStatus) {
  return {
    slug: seed.enSlug,
    title: `${seed.en[0].toUpperCase()}${seed.en.slice(1)} — Vitrina AI Studio`,
    metaDescription: `How to use Vitrina AI Studio for ${seed.en}: photo preparation, quality review, AI limitations, and internal links to related platforms.`,
    h1: `${seed.en[0].toUpperCase()}${seed.en.slice(1)}`,
    shortAnswer: `Vitrina AI Studio helps prepare ${seed.en}: upload a source image, choose the right mode, generate a draft, and manually check product accuracy before publishing.`,
    sections: [
      {
        title: "When to use it",
        body: "Use this workflow when you need product visuals for listings, catalogs, social commerce, or commercial presentations.",
      },
      {
        title: "What to review",
        body: "Check color, shape, patterns, logos, edges, proportions, and unwanted objects. Do not publish AI output without manual review.",
      },
      {
        title: "Platform fit",
        body: `Sellers often pair this workflow with ${seed.relatedPlatforms.join(", ")}. Vitrina AI Studio is not an official partner of these platforms.`,
      },
    ],
    internalLinks: ["features", "platforms", "studio"],
    faq: [
      {
        question: "Can I publish the result immediately?",
        answer: "Review quality first and compare the output with the latest platform requirements.",
      },
      {
        question: "Will AI preserve the product perfectly?",
        answer: "AI can make mistakes, so compare the generated asset with the source photo and reject inaccurate variants.",
      },
    ],
    status,
  };
}

export const useCasePages: UseCaseSeoPage[] = seeds.map((seed) => ({
  id: seed.id,
  cluster: seed.cluster,
  relatedPlatforms: seed.relatedPlatforms,
  content: Object.fromEntries(
    supportedLocaleCodes.map((locale) => {
      if (locale === "ru") return [locale, createRu(seed, "published")];
      if (locale === "en") return [locale, createEn(seed, "published")];
      return [locale, createEn(seed, "needs_review")];
    })
  ) as UseCaseSeoPage["content"],
}));

export function getUseCaseBySlug(locale: Locale, slug: string) {
  return useCasePages.find((page) => page.content[locale].slug === slug);
}

export function getUseCaseById(id: string) {
  return useCasePages.find((page) => page.id === id);
}
