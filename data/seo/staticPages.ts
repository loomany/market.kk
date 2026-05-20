import type { Locale, TranslationStatus } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import { getRouteSlug, type StaticRouteKey } from "@/lib/i18n/routeSlugs";
import { enFeatureLandingEnhancements } from "./enFeatureLandingEnhancements";
import { kkFeatureLandingEnhancements } from "./kkFeatureLandingEnhancements";
import { isKkStaticPageApproved } from "@/lib/seo/kkIndexPolicy";
import { ruFeatureLandingEnhancements } from "./ruFeatureLandingEnhancements";
import { trustStaticPages } from "./trustPages";

export type StaticSeoPage = {
  key: StaticRouteKey;
  kind: "feature" | "legal" | "ai-summary" | "pricing" | "trust";
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
  const isKk = locale === "kk";
  const enhanced = isRu
    ? ruFeatureLandingEnhancements[key]
    : locale === "en"
      ? enFeatureLandingEnhancements[key]
      : locale === "kk"
        ? kkFeatureLandingEnhancements[key]
        : undefined;
  return {
    slug: getRouteSlug(locale, key),
    title: `${title} — Vitrina AI Studio`,
    metaDescription: isRu
      ? `${title}: как Vitrina AI Studio помогает готовить товарный визуал, где AI может ошибаться и что проверять перед публикацией.`
      : locale === "kk"
        ? `${title}: Vitrina AI Studio — Kaspi/marketplace тауар фотосы, AI шектеулері және жарияламас бұрын қолмен тексеру.`
        : `${title}: how Vitrina AI Studio helps prepare product visuals, where AI can fail, and what to review before publishing.`,
    h1: title,
    intro: enhanced?.intro ?? intro,
    sections: enhanced?.sections ?? (isKk
      ? [
          {
            title: "Бұл бет не туралы",
            body: "Сценарий, AI шектеулері, байланысты материалдар және студияға өту — модерация кепілдемейді.",
          },
          {
            title: "Сапа тізімі",
            body: "Жарияламас бұрын түс, пішін, пропорция, края, текстура, логотиптерді тексеріңіз.",
          },
          {
            title: "Функция статусы",
            body: key === "productVideoGenerator"
              ? "Видео workflow әзірленуде — production-ready деп уәде берілмейді."
              : "Функция ағымдағы studio workflow бөлігі; қолмен тексеру міндетті.",
          },
        ]
      : isRu
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
        ]),
    faq: enhanced?.faq ?? [
      {
        question: isKk
          ? "Нәтижені кепілдей аламыз ба?"
          : isRu
            ? "Можно ли гарантировать результат?"
            : "Can the result be guaranteed?",
        answer: isKk
          ? "Жоқ. AI қателесе алады; сатушы тауар мен маркетплейс ережелерін тексеруі керек."
          : isRu
            ? "Нет. AI может ошибаться, а продавец должен проверить товар и правила площадки."
            : "No. AI can make mistakes, and the seller must review the product and platform rules.",
      },
    ],
    relatedLinks: enhanced?.internalLinks,
    status,
  };
}

const kkFeatureTitles: Partial<
  Record<StaticRouteKey, { title: string; intro: string }>
> = {
  aiProductPhotoStudio: {
    title: "AI тауар фото студиясы",
    intro:
      "Kaspi және маркетплейстерге арналған тауар фотосын дайындау: карточка, фон, киім модельде — әр экспортты қолмен тексеру.",
  },
  productPhotoForMarketplaces: {
    title: "Маркетплейске тауар фотосы",
    intro: "Карточка және каталог үшін таза суреттер; жарияламас бұрын QA міндетті.",
  },
  productVideoGenerator: {
    title: "Тауар видеосы",
    intro: "Видео workflow әзірленуде — тек жоспарланған сценарий, production-ready емес.",
  },
  backgroundGenerator: {
    title: "Тауар фон генераторы",
    intro: "Фонды тазалау немесе ауыстыру; тауар өзгермеуі керек.",
  },
  fashionModelPhotos: {
    title: "Киім AI модель фотосы",
    intro: "Ересек каталог стилінде киім; виртуалды примерка workflow.",
  },
  jewelryProductPhotos: {
    title: "Әшекей тауар фотосы",
    intro: "Әшекей карточкалары; макро және бликтерді QA арқылы бақылау.",
  },
};

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

        if (locale === "kk") {
          const kk = kkFeatureTitles[seed.key];
          const kkStatus = isKkStaticPageApproved(seed.key)
            ? ("published" as TranslationStatus)
            : ("ready_for_review" as TranslationStatus);
          return [
            locale,
            createLocalizedContent(
              seed.key,
              locale,
              kk?.title ?? seed.ruTitle,
              kk?.intro ?? seed.ruIntro,
              kkStatus
            ),
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
            title: "Тарифы Vitrina AI — Vitrina AI Studio",
            metaDescription:
              "Тарифы Vitrina AI Studio: бесплатный тест, стартовый доступ и premium-опции для AI-фото товара, примерки на модели, фона и улучшения фото для маркетплейсов.",
            h1: "Тарифы Vitrina AI",
            intro:
              "Vitrina AI Studio помогает готовить товарные фото и визуал для Kaspi, Wildberries, Ozon и других площадок. Тарифы зависят от режима (демо или real AI) и объёма генераций.",
            sections: [
              {
                title: "Бесплатный тест",
                body: "Демо-режим показывает интерфейс и workflow без списаний. Подходит, чтобы понять сценарии: одежда на модели, товарная карточка, фон и проверка качества.",
              },
              {
                title: "Старт",
                body: "Для регулярной подготовки карточек и каталога. Оплата за генерации или пакеты уточняются — финальные цены будут опубликованы до запуска billing.",
              },
              {
                title: "Premium",
                body: "Для команд с большим объёмом контента: приоритетные сценарии, расширенные режимы и поддержка workflow контент-менеджера. Доступность функций зависит от roadmap продукта.",
              },
              {
                title: "Что входит",
                body: "AI-фото товара, примерка одежды на взрослой модели, удаление/замена фона, точная карточка, ручная проверка качества. Видео и Reels — по мере выхода функций.",
              },
            ],
            faq: [
              {
                question: "Сколько стоит генерация?",
                answer:
                  "В демо-режиме списаний нет. В real AI mode стоимость зависит от типа задачи и должна быть видна до запуска, когда pricing включён в интерфейсе.",
              },
              {
                question: "Можно ли использовать для Kaspi?",
                answer:
                  "Да, сервис помогает подготовить изображения для карточек, но не гарантирует принятие модерацией Kaspi. Правила площадки проверяет продавец.",
              },
              {
                question: "Что входит в тариф?",
                answer:
                  "Подготовка товарного визуала: product shot, одежда на AI-модели, фон, чеклист качества. Конкретный набор режимов зависит от выбранного плана и статуса функций.",
              },
              {
                question: "Можно ли попробовать бесплатно?",
                answer:
                  "Да. Откройте студию в демо-режиме, загрузите фото и проверьте workflow без оплаты.",
              },
            ],
            relatedLinks: [
              { label: "Как работает", href: "/ru/how-it-works" },
              { label: "FAQ", href: "/ru/faq" },
              { label: "Качество AI", href: "/ru/quality" },
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
            title: "Vitrina AI тарифтері — Vitrina AI Studio",
            metaDescription:
              "Vitrina AI Studio тарифтері: тегін демо, старт және premium — AI тауар фотосы, модельде киім, фон. Kaspi/marketplace үшін қолмен тексеру міндетті.",
            h1: "Vitrina AI тарифтері",
            intro:
              "Vitrina AI Studio Kaspi, Wildberries, Ozon және басқа арналарға тауар визуалын дайындауға көмектеседі. Тариф демо немесе real AI режиміне және генерация көлеміне байланысты.",
            sections: [
              {
                title: "Тегін тест",
                body: "Демо-режим интерфейсті және workflow-ды ақша алмай көрсетеді: киім модельде, карточка, фон, сапа тексеруі.",
              },
              {
                title: "Старт",
                body: "Тұрақты карточка және каталог жаңартуы үшін. Нақты баға billing іске қосылғанға дейін жарияланады.",
              },
              {
                title: "Premium",
                body: "Үлкен көлемді командалар: кеңейтілген сценарийлер, контент-менеджер workflow. Функциялар roadmap-қа тәуелді.",
              },
              {
                title: "Не кіреді",
                body: "AI тауар фотосы, ересек модельде киім, фон алу/ауыстыру, нақты карточка, қолмен QA. Видео/Reels функциялар шыққан сайын.",
              },
            ],
            faq: [
              {
                question: "Генерация қанша тұрады?",
                answer:
                  "Демо-режимде төлем жоқ. Real AI режимінде құн тапсырмаға байланысты; UI-да баға көрсетілгенге дейін тексеріңіз.",
              },
              {
                question: "Kaspi үшін пайдалануға бола ма?",
                answer:
                  "Иә, студия карточка суретін дайындауға көмектеседі, бірақ Kaspi модерациясын кепілдемейді. Ережелерді сатушы өзі тексереді.",
              },
              {
                question: "Тарифке не кіреді?",
                answer:
                  "Тауар визуалы: product shot, модельде киім, фон, сапа тізімі. Нақты режимдер тариф пен функция статусына байланысты.",
              },
              {
                question: "Тегін сынауға бола ма?",
                answer: "Иә. Демо-режимде студияны ашып, workflow-ды төлемсіз тексеріңіз.",
              },
            ],
            relatedLinks: [
              { label: "Қалай жұмыс істейді", href: "/kk/how-it-works" },
              { label: "FAQ", href: "/kk/faq" },
              { label: "AI сапасы", href: "/kk/quality" },
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
            title: "Vitrina AI pricing — Vitrina AI Studio",
            metaDescription:
              "Vitrina AI Studio pricing: free demo, starter access, and premium options for AI product photos, on-model try-on, backgrounds, and marketplace-ready visuals.",
            h1: "Vitrina AI pricing",
            intro:
              "Vitrina AI Studio helps prepare product visuals for Kaspi, Wildberries, Ozon, and other channels. Pricing depends on demo vs real AI mode and generation volume.",
            sections: [
              {
                title: "Free test",
                body: "Demo mode shows the interface and workflow without charges. Use it to explore on-model clothing, product cards, backgrounds, and quality review.",
              },
              {
                title: "Starter",
                body: "For regular listing and catalog work. Pay-per-generation or bundles are being finalized — final prices will be published before billing goes live.",
              },
              {
                title: "Premium",
                body: "For higher-volume teams: priority workflows, extended modes, and content-manager use cases. Feature availability depends on the product roadmap.",
              },
              {
                title: "What's included",
                body: "AI product photos, adult on-model clothing try-on, background removal/replacement, exact product cards, and manual quality review. Video and Reels roll out as features ship.",
              },
            ],
            faq: [
              {
                question: "How much does a generation cost?",
                answer:
                  "Demo mode has no charges. In real AI mode, cost depends on the task type and should be visible before launch when pricing is enabled in the UI.",
              },
              {
                question: "Can I use it for Kaspi?",
                answer:
                  "Yes, the studio helps prepare listing images, but it does not guarantee Kaspi moderation acceptance. Sellers must verify current platform rules.",
              },
              {
                question: "What is included in a plan?",
                answer:
                  "Product visual preparation: product shots, on-model clothing, backgrounds, and quality checklist. Exact modes depend on the selected plan and feature status.",
              },
              {
                question: "Can I try it for free?",
                answer:
                  "Yes. Open the studio in demo mode, upload a photo, and review the workflow without payment.",
              },
            ],
            relatedLinks: [
              { label: "How it works", href: "/en/how-it-works" },
              { label: "FAQ", href: "/en/faq" },
              { label: "AI quality", href: "/en/quality" },
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
  ...trustStaticPages,
];

export function getStaticSeoPageBySlug(locale: Locale, slug: string) {
  return staticSeoPages.find((page) => page.content[locale].slug === slug);
}
