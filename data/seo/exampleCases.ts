import type { Locale } from "@/lib/i18n/localeConfig";
import type { ExamplePageKey } from "./examplesPages";

export type ExampleCategoryId =
  | "product-photos"
  | "clothing-on-model"
  | "background-removal"
  | "kaspi-product-cards"
  | "lingerie-on-ai-model";

export type ExampleAssetStatus = "owned" | "licensed" | "placeholder" | "missing";

export type ExampleImageRef = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ExampleCase = {
  id: string;
  categoryId: ExampleCategoryId;
  locales: Locale[];
  title: Record<Locale, string>;
  shortDescription: Record<Locale, string>;
  productType: string;
  marketplaceUseCase: string;
  disclaimer: Record<Locale, string>;
  beforeImage: ExampleImageRef | null;
  afterImage: ExampleImageRef | null;
  /** True only when assetStatus is owned|licensed and files are verified. */
  isRealOwnedAsset: boolean;
  assetStatus: ExampleAssetStatus;
  /** Owner must approve before enabling index (Stage 12.1+). */
  indexEligible: boolean;
  relatedLanding: Record<Locale, string>;
  relatedArticle: Record<Locale, string | null>;
  ctaHref: "/studio";
};

export type ExampleCategoryMeta = {
  id: ExampleCategoryId;
  pageKey: ExamplePageKey;
  slug: string;
  locales: Locale[];
  plannedChecklist: Partial<Record<Locale, string[]>>;
};

export const exampleCategoryMeta: ExampleCategoryMeta[] = [
  {
    id: "product-photos",
    pageKey: "productPhotos",
    slug: "product-photos",
    locales: ["ru", "en"],
    plannedChecklist: {
      ru: [
        "Исходник товара на нейтральном фоне (owned)",
        "Экспорт карточки / белый фон из Studio",
        "Скрин QA: цвет, края, комплект",
      ],
      en: [
        "Owned product source on neutral background",
        "Studio export: card or white background",
        "QA screenshot: color, edges, set contents",
      ],
      kk: [],
    },
  },
  {
    id: "clothing-on-model",
    pageKey: "clothingOnModel",
    slug: "clothing-on-model",
    locales: ["ru", "en", "kk"],
    plannedChecklist: {
      ru: [
        "Фото изделия на вешалке (owned)",
        "Экспорт посадки на AI-модели",
        "Проверка швов и длины",
      ],
      en: [
        "Owned garment flat/hanger photo",
        "On-model studio export",
        "Seam and length review",
      ],
      kk: ["Өз исходнигі", "Studio экспорт", "Қолмен QA"],
    },
  },
  {
    id: "background-removal",
    pageKey: "backgroundRemoval",
    slug: "background-removal",
    locales: ["ru", "en"],
    plannedChecklist: {
      ru: [
        "Исходник с шумным фоном",
        "Экспорт с белым/нейтральным фоном",
        "Контроль краёв и теней",
      ],
      en: [
        "Owned source with busy background",
        "Clean background export",
        "Edge and shadow QA",
      ],
      kk: [],
    },
  },
  {
    id: "kaspi-product-cards",
    pageKey: "kaspiProductCards",
    slug: "kaspi-product-cards",
    locales: ["ru", "en", "kk"],
    plannedChecklist: {
      ru: [
        "Главное фото Kaspi-стиля (без брендинга Kaspi)",
        "Галерея деталей",
        "Чеклист перед загрузкой в кабинет",
      ],
      en: [
        "Kaspi-style main image (no Kaspi trademark misuse)",
        "Detail gallery",
        "Pre-upload seller checklist",
      ],
      kk: ["Негізгі фото", "Галерея", "Kaspi ережелері"],
    },
  },
  {
    id: "lingerie-on-ai-model",
    pageKey: "lingerieOnAiModel",
    slug: "lingerie-on-ai-model",
    locales: ["ru", "en"],
    plannedChecklist: {
      ru: [
        "Adult-only каталог, сдержанная поза",
        "Исходник кружева/прозрачных тканей",
        "Ручная проверка фактуры",
      ],
      en: [
        "Adult-only catalog, modest pose",
        "Owned lace/sheer source",
        "Manual texture QA",
      ],
      kk: [],
    },
  },
];

/**
 * No renderable cases until owner adds files under /public/examples/** with metadata.
 */
export const exampleCases: ExampleCase[] = [];

export function getCategoryMeta(categoryId: ExampleCategoryId) {
  return exampleCategoryMeta.find((c) => c.id === categoryId);
}

export function getCategoryMetaByPageKey(pageKey: ExamplePageKey) {
  return exampleCategoryMeta.find((c) => c.pageKey === pageKey);
}

export function getExampleCasesForCategory(
  categoryId: ExampleCategoryId,
  locale: Locale
): ExampleCase[] {
  return exampleCases.filter(
    (c) => c.categoryId === categoryId && c.locales.includes(locale)
  );
}

export function canRenderBeforeAfter(caseItem: ExampleCase): boolean {
  if (!caseItem.isRealOwnedAsset) return false;
  if (caseItem.assetStatus !== "owned" && caseItem.assetStatus !== "licensed") {
    return false;
  }
  if (!caseItem.beforeImage?.src || !caseItem.afterImage?.src) return false;
  return true;
}

export function getRenderableCasesForCategory(
  categoryId: ExampleCategoryId,
  locale: Locale
): ExampleCase[] {
  return getExampleCasesForCategory(categoryId, locale).filter(canRenderBeforeAfter);
}

export const examplesIndexPolicy = {
  /** Stage 12: remain noindex until owner approves assets + index enable. */
  allowIndex: false,
  allowSitemap: false,
  allowHreflang: false,
} as const;
