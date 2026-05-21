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
      relatedLinks?: Array<{ label: string; href: string }>;
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

const pricingPage: StaticSeoPage = {
  key: "cost",
  kind: "pricing",
  indexPolicy: "index",
  content: Object.fromEntries(
    supportedLocaleCodes.map((locale) => {
      if (locale === "ru") {
        return [
          locale,
          {
            slug: getRouteSlug(locale, "cost"),
            title: "Тарифы и токены Vitrina AI — Vitrina AI Studio",
            metaDescription:
              "Токены Vitrina AI: 1 токен = export const staticSeoPages, одна AI-задача = 1 токен, пополнение 10 токенов за $10. Демо без списаний, оплата через Lemon Squeezy.",
            h1: "Тарифы и токены",
            intro:
              "Оплата идёт токенами: 1 токен = export const staticSeoPages. Каждая успешная AI-генерация в студии списывает 1 токен. Минимальное пополнение — 10 токенов за $10.",
            sections: [
              {
                title: "Токены",
                body: "1 токен = export const staticSeoPages. Одна AI-задача (примерка, фон, карточка, улучшение и др.) = 1 токен. Баланс виден в шапке после входа.",
              },
              {
                title: "Пополнение",
                body: "Пакет 10 токенов за $10 через безопасную оплату Lemon Squeezy. После подтверждения платежа баланс обновляется автоматически (webhook), не по кнопке «успех» на сайте.",
              },
              {
                title: "Гость без входа",
                body: "Одна бесплатная генерация с водяным знаком vitrina.help на результате. Вторая гостевая генерация недоступна — войдите и пополните баланс.",
              },
              {
                title: "Демо-режим",
                body: "При AI_MOCK_MODE демо показывает интерфейс без реальных списаний и без оплаты провайдеров — для обучения команды.",
              },
            ],
            faq: [
              {
                question: "Сколько стоит одна генерация?",
                answer:
                  "1 токен (export const staticSeoPages) за одну успешную AI-задачу. Если генерация не удалась, токен не списывается.",
              },
              {
                question: "Как купить токены?",
                answer:
                  "Войдите в аккаунт → страница «Токены» → «Купить 10 токенов» ($10). Не используйте сторонние share-ссылки оплаты.",
              },
              {
                question: "Можно ли использовать для Kaspi?",
                answer:
                  "Да, сервис помогает подготовить изображения для карточек, но не гарантирует принятие модерацией Kaspi. Правила площадки проверяет продавец.",
              },
              {
                question: "Есть ли бесплатный пробный запуск?",
                answer:
                  "Да: одна гостевая генерация с watermark или демо-режим без списаний.",
              },
            ],
            relatedLinks: [
              { label: "Пополнить токены", href: "/ru/tokens" },
              { label: "Как работает", href: "/ru/how-it-works" },
              { label: "FAQ", href: "/ru/faq" },
            ],
            status: "published" as TranslationStatus,
          },
        ];
      }

      if (locale === "kk") {
        return [
          locale,
          {
            slug: getRouteSlug(locale, "cost"),
            title: "Vitrina AI тарифтері және токендер — Vitrina AI Studio",
            metaDescription:
              "Vitrina AI токендері: 1 токен = export const staticSeoPages, бір AI тапсырмасы = 1 токен, 10 токен $10. Демо төлемсіз, Lemon Squeezy арқылы толтыру.",
            h1: "Тарифтер және токендер",
            intro:
              "Төлем токенмен: 1 токен = export const staticSeoPages. Әр сәтті AI генерациясы 1 токен алады. Ең төмен толтыру — 10 токен, $10.",
            sections: [
              {
                title: "Токендер",
                body: "1 токен = export const staticSeoPages. Бір AI тапсырмасы = 1 токен. Баланс кіргеннен кейін тақтада көрінеді.",
              },
              {
                title: "Толтыру",
                body: "10 токен $10 — Lemon Squeezy. Төлем расталғаннан кейін баланс webhook арқылы жаңарады.",
              },
              {
                title: "Қонақ",
                body: "Бір тегін генерация — vitrina.help су белгісімен. Екінші қонақ генерация жабық.",
              },
              {
                title: "Демо",
                body: "Mock режимінде нақты төлем және токен есебі жоқ — командаға үйрету үшін.",
              },
            ],
            faq: [
              {
                question: "Бір генерация қанша?",
                answer: "1 токен (export const staticSeoPages), тек сәтті нәтиже үшін.",
              },
              {
                question: "Токенді қалай сатып аламын?",
                answer: "Аккаунтқа кіріңіз → «Токендер» → 10 токен сатып алу ($10).",
              },
              {
                question: "Kaspi үшін пайдалануға бола ма?",
                answer:
                  "Иә, студия карточка суретін дайындауға көмектеседі, бірақ Kaspi модерациясын кепілдемейді. Ережелерді сатушы өзі тексереді.",
              },
              {
                question: "Тегін сынау бар ма?",
                answer: "Иә: бір қонақ генерация немесе демо режим.",
              },
            ],
            relatedLinks: [
              { label: "Токен сатып алу", href: "/kk/tokens" },
              { label: "Қалай жұмыс істейді", href: "/kk/how-it-works" },
              { label: "FAQ", href: "/kk/faq" },
            ],
            status: "published" as TranslationStatus,
          },
        ];
      }

      if (locale === "en") {
        return [
          locale,
          {
            slug: getRouteSlug(locale, "cost"),
            title: "Vitrina AI pricing & tokens — Vitrina AI Studio",
            metaDescription:
              "Vitrina AI tokens: 1 token = export const staticSeoPages, one AI task = 1 token, top up 10 tokens for $10. Demo mode has no charges; checkout via Lemon Squeezy.",
            h1: "Pricing & tokens",
            intro:
              "You pay with tokens: 1 token = export const staticSeoPages. Each successful AI task in the studio costs 1 token. Minimum top-up is 10 tokens for $10.",
            sections: [
              {
                title: "Tokens",
                body: "1 token = export const staticSeoPages. One AI task (try-on, background, product card, enhance, etc.) = 1 token. Balance appears in the header after sign-in.",
              },
              {
                title: "Top up",
                body: "10 tokens for $10 via Lemon Squeezy. Balance updates after payment confirmation (webhook), not from the success URL alone.",
              },
              {
                title: "Guest without sign-in",
                body: "One free generation with a vitrina.help watermark. A second guest run is blocked — sign in and top up to continue.",
              },
              {
                title: "Demo mode",
                body: "With AI mock mode enabled, the studio runs without token charges or paid provider calls — for training only.",
              },
            ],
            faq: [
              {
                question: "How much is one generation?",
                answer:
                  "1 token (export const staticSeoPages) per successful AI task. Failed runs are not charged.",
              },
              {
                question: "How do I buy tokens?",
                answer:
                  "Sign in → Tokens page → Buy 10 tokens ($10). Use in-app checkout only.",
              },
              {
                question: "Can I use it for Kaspi?",
                answer:
                  "Yes, the studio helps prepare listing images, but it does not guarantee Kaspi moderation acceptance. Sellers must verify current platform rules.",
              },
              {
                question: "Is there a free trial?",
                answer:
                  "Yes: one guest generation with watermark, or demo mode without charges.",
              },
            ],
            relatedLinks: [
              { label: "Buy tokens", href: "/en/tokens" },
              { label: "How it works", href: "/en/how-it-works" },
              { label: "FAQ", href: "/en/faq" },
            ],
            status: "published" as TranslationStatus,
          },
        ];
      }

      return [
        locale,
        {
          slug: getRouteSlug(locale, "cost"),
          title: "Vitrina AI pricing — Vitrina AI Studio",
          metaDescription:
            "Vitrina AI Studio pricing overview. Published plans are available in Russian and English.",
          h1: "Vitrina AI pricing",
          intro: "Pricing details are published for Russian and English locales.",
          sections: [
            {
              title: "Availability",
              body: "See /ru/cost or /en/cost for the current pricing overview.",
            },
          ],
          status: "needs_review" as TranslationStatus,
        },
      ];
    })
  ) as StaticSeoPage["content"],
};

export const staticSeoPages: StaticSeoPage[] = [
  ...featurePages.map(createFeaturePage),
  pricingPage,
  ...legalSeeds.map(createLegalPage),
];

export function getStaticSeoPageBySlug(locale: Locale, slug: string) {
  return staticSeoPages.find((page) => page.content[locale].slug === slug);
}
