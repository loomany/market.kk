import type { Locale, TranslationStatus } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import { getRouteSlug, type StaticRouteKey } from "@/lib/i18n/routeSlugs";

export type StaticSeoPage = {
  key: StaticRouteKey;
  kind: "feature" | "legal" | "ai-summary" | "pricing";
  indexPolicy: "index" | "noindex";
  content: Record<
    Locale,
    {
      slug: string;
      title: string;
      metaDescription: string;
      h1: string;
      intro: string;
      sections: Array<{ title: string; body: string }>;
      faq?: Array<{ question: string; answer: string }>;
      status: TranslationStatus;
    }
  >;
};

const featurePages: Array<{
  key: StaticRouteKey;
  ruTitle: string;
  enTitle: string;
  ruIntro: string;
  enIntro: string;
}> = [
  {
    key: "aiProductPhotoStudio",
    ruTitle: "AI-студия товарных фото",
    enTitle: "AI product photo studio",
    ruIntro: "Единая рабочая зона для подготовки фото товара, карточек, фонов и будущих видео-сценариев.",
    enIntro: "A single workspace for preparing product photos, product cards, backgrounds, and future video workflows.",
  },
  {
    key: "productPhotoForMarketplaces",
    ruTitle: "Фото товара для маркетплейсов",
    enTitle: "Product photo for marketplaces",
    ruIntro: "Подготовьте аккуратные изображения для карточек товара и вручную проверьте результат перед публикацией.",
    enIntro: "Prepare clean listing images and manually review the result before publishing.",
  },
  {
    key: "productVideoGenerator",
    ruTitle: "Видео товара из фото",
    enTitle: "Product video generator",
    ruIntro: "Видео workflow находится в разработке: SEO-страница описывает будущий сценарий и ограничения.",
    enIntro: "The video workflow is in development: this SEO page explains the planned scenario and limitations.",
  },
  {
    key: "backgroundGenerator",
    ruTitle: "Генератор фона для товара",
    enTitle: "Product background generator",
    ruIntro: "Заменяйте или очищайте фон так, чтобы товар оставался главным и проверяемым.",
    enIntro: "Replace or clean up backgrounds while keeping the product clear and reviewable.",
  },
  {
    key: "fashionModelPhotos",
    ruTitle: "Фото одежды на AI-модели",
    enTitle: "Fashion model photos",
    ruIntro: "Сценарий для коммерческой съёмки одежды на взрослой AI-модели с обязательной проверкой деталей.",
    enIntro: "A workflow for adult commercial fashion images with required detail review.",
  },
  {
    key: "jewelryProductPhotos",
    ruTitle: "Фото бижутерии для маркетплейса",
    enTitle: "Jewelry product photos",
    ruIntro: "Подготовка украшений и аксессуаров для карточек товара, каталога и lifestyle-сцен.",
    enIntro: "Prepare jewelry and accessories for listings, catalogs, and lifestyle scenes.",
  },
];

function createLocalizedContent(
  key: StaticRouteKey,
  locale: Locale,
  title: string,
  intro: string,
  status: TranslationStatus
) {
  const isRu = locale === "ru";
  return {
    slug: getRouteSlug(locale, key),
    title: `${title} — Vitrina AI Studio`,
    metaDescription: isRu
      ? `${title}: как Vitrina AI Studio помогает готовить товарный визуал, где AI может ошибаться и что проверять перед публикацией.`
      : `${title}: how Vitrina AI Studio helps prepare product visuals, where AI can fail, and what to review before publishing.`,
    h1: title,
    intro,
    sections: isRu
      ? [
          {
            title: "Что делает страница",
            body: "Объясняет сценарий, ограничения, связанные use cases и путь в студию без обещаний гарантированной модерации.",
          },
          {
            title: "Quality checklist",
            body: "Проверяйте цвет, форму, пропорции, края, текстуры, логотипы и отсутствие лишних объектов перед публикацией.",
          },
          {
            title: "Статус функции",
            body: key === "productVideoGenerator"
              ? "Видео workflow описан как planned/in development и не обещает production-ready генерацию в этом этапе."
              : "Функция описана как часть текущего studio workflow или demo workflow с ручной проверкой качества.",
          },
        ]
      : [
          {
            title: "What this page covers",
            body: "It explains the workflow, limitations, related use cases, and studio path without guaranteed moderation claims.",
          },
          {
            title: "Quality checklist",
            body: "Review color, shape, proportions, edges, textures, logos, and unwanted objects before publishing.",
          },
          {
            title: "Feature status",
            body: key === "productVideoGenerator"
              ? "The video workflow is described as planned/in development and is not presented as production-ready in this phase."
              : "The feature is described as part of the current studio or demo workflow with manual quality review.",
          },
        ],
    faq: [
      {
        question: isRu ? "Можно ли гарантировать результат?" : "Can the result be guaranteed?",
        answer: isRu
          ? "Нет. AI может ошибаться, а продавец должен проверить товар и правила площадки."
          : "No. AI can make mistakes, and the seller must review the product and platform rules.",
      },
    ],
    status,
  };
}

function createFeaturePage(seed: (typeof featurePages)[number]): StaticSeoPage {
  return {
    key: seed.key,
    kind: "feature",
    indexPolicy: seed.key === "productVideoGenerator" ? "noindex" : "index",
    content: Object.fromEntries(
      supportedLocaleCodes.map((locale) => {
        if (locale === "ru") {
          return [
            locale,
            createLocalizedContent(seed.key, locale, seed.ruTitle, seed.ruIntro, "published"),
          ];
        }

        if (locale === "en") {
          return [
            locale,
            createLocalizedContent(seed.key, locale, seed.enTitle, seed.enIntro, "published"),
          ];
        }

        return [
          locale,
          createLocalizedContent(seed.key, locale, seed.enTitle, seed.enIntro, "needs_review"),
        ];
      })
    ) as StaticSeoPage["content"],
  };
}

const legalSeeds: Array<{
  key: StaticRouteKey;
  titleRu: string;
  titleEn: string;
  introRu: string;
  introEn: string;
  sectionsRu: Array<{ title: string; body: string }>;
  sectionsEn: Array<{ title: string; body: string }>;
}> = [
  {
    key: "privacy",
    titleRu: "Privacy Policy",
    titleEn: "Privacy Policy",
    introRu: "Базовое описание обработки данных в MVP. Это не юридическая гарантия и должно быть проверено юристом перед production launch.",
    introEn: "A baseline MVP data handling notice. This is not a legal guarantee and should be reviewed before production launch.",
    sectionsRu: [
      { title: "Какие данные загружаются", body: "Пользователь может загружать изображения товаров, настройки генерации и технические данные запроса." },
      { title: "AI-провайдеры", body: "Изображения могут отправляться сервером в AI-провайдеры, когда включён real AI mode." },
      { title: "Удаление", body: "Для MVP используйте указанный contact/email placeholder или доступный механизм удаления файлов, когда он включён." },
      { title: "Ограничения", body: "Сервис не гарантирует идеальное сохранение товара и требует ручной проверки результата." },
    ],
    sectionsEn: [
      { title: "Uploaded data", body: "Users may upload product images, generation settings, and technical request data." },
      { title: "AI providers", body: "Images may be sent by the server to AI providers when real AI mode is enabled." },
      { title: "Deletion", body: "For MVP, use the listed contact/email placeholder or available deletion mechanism when enabled." },
      { title: "Limitations", body: "The service does not guarantee perfect product preservation and requires manual review." },
    ],
  },
  {
    key: "terms",
    titleRu: "Terms of Use",
    titleEn: "Terms of Use",
    introRu: "Базовые условия использования Vitrina AI Studio для MVP.",
    introEn: "Baseline Vitrina AI Studio terms for the MVP.",
    sectionsRu: [
      { title: "Права на изображения", body: "Пользователь должен иметь право использовать загружаемые изображения и результаты." },
      { title: "Запрещённый контент", body: "Нельзя загружать незаконный контент, несовершеннолетних моделей или вводящие в заблуждение материалы." },
      { title: "Бельё и купальники", body: "Допустим только adult commercial catalog style без сексуализации несовершеннолетних." },
      { title: "Проверка", body: "AI может ошибаться. Пользователь обязан проверить результат перед публикацией." },
    ],
    sectionsEn: [
      { title: "Image rights", body: "Users must have the right to use uploaded images and generated outputs." },
      { title: "Prohibited content", body: "Illegal content, minors as models, and misleading materials are not allowed." },
      { title: "Lingerie and swimwear", body: "Only adult commercial catalog style is allowed; sexualized minors are prohibited." },
      { title: "Review", body: "AI can make mistakes. Users must review results before publishing." },
    ],
  },
  {
    key: "acceptableUse",
    titleRu: "Acceptable Use Policy",
    titleEn: "Acceptable Use Policy",
    introRu: "Правила безопасного использования AI-студии товарного контента.",
    introEn: "Safe-use rules for the AI product content studio.",
    sectionsRu: [
      { title: "Незаконный и вредный контент", body: "Запрещено использовать сервис для незаконного, вредного, обманного или нарушающего права контента." },
      { title: "Minors", body: "Запрещена генерация несовершеннолетних моделей и любого sexualized minors content." },
      { title: "Бренды и логотипы", body: "Нельзя подделывать бренды, логотипы или создавать вводящие в заблуждение карточки." },
    ],
    sectionsEn: [
      { title: "Illegal and harmful content", body: "Do not use the service for illegal, harmful, deceptive, or rights-infringing content." },
      { title: "Minors", body: "Generating minor models or sexualized minors content is prohibited." },
      { title: "Brands and logos", body: "Do not counterfeit brands, logos, or create misleading listings." },
    ],
  },
  {
    key: "dataDeletion",
    titleRu: "Data Deletion",
    titleEn: "Data Deletion",
    introRu: "Как запросить удаление файлов или аккаунта в MVP.",
    introEn: "How to request file or account deletion in the MVP.",
    sectionsRu: [
      { title: "Файлы", body: "Если история файлов включена, удаление должно быть доступно из интерфейса или по запросу." },
      { title: "Аккаунт", body: "Если Auth включён в будущем, удаление аккаунта должно быть описано отдельным workflow." },
      { title: "Контакт", body: "До production launch укажите рабочий support contact вместо placeholder." },
    ],
    sectionsEn: [
      { title: "Files", body: "When asset history is enabled, deletion should be available in the interface or by request." },
      { title: "Account", body: "If Auth is enabled later, account deletion should have a dedicated workflow." },
      { title: "Contact", body: "Before production launch, replace the placeholder with a working support contact." },
    ],
  },
];

function createLegalPage(seed: (typeof legalSeeds)[number]): StaticSeoPage {
  return {
    key: seed.key,
    kind: "legal",
    indexPolicy: "index",
    content: Object.fromEntries(
      supportedLocaleCodes.map((locale) => {
        const isRu = locale === "ru";
        const isEn = locale === "en";
        return [
          locale,
          {
            slug: getRouteSlug(locale, seed.key),
            title: `${isRu ? seed.titleRu : seed.titleEn} — Vitrina AI Studio`,
            metaDescription: isRu
              ? `${seed.titleRu}: базовая страница доверия Vitrina AI Studio для MVP, AI-ограничений, пользовательских обязанностей и удаления данных.`
              : `${seed.titleEn}: baseline Vitrina AI Studio trust page for the MVP, AI limitations, user responsibilities, and data deletion.`,
            h1: isRu ? seed.titleRu : seed.titleEn,
            intro: isRu ? seed.introRu : seed.introEn,
            sections: isRu ? seed.sectionsRu : seed.sectionsEn,
            status: isRu || isEn ? "published" : "needs_review",
          },
        ];
      })
    ) as StaticSeoPage["content"],
  };
}

export const staticSeoPages: StaticSeoPage[] = [
  ...featurePages.map(createFeaturePage),
  ...legalSeeds.map(createLegalPage),
];

export function getStaticSeoPageBySlug(locale: Locale, slug: string) {
  return staticSeoPages.find((page) => page.content[locale].slug === slug);
}
