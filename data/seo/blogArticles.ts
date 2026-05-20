import type { Locale } from "@/lib/i18n/localeConfig";
import type { FaqItem } from "./platforms";
import { enBlogStage4Legacy } from "./enBlogStage4LegacyContent";
import { enBlogStage3P0 } from "./enBlogStage3Content";
import { enBlogStage11Wave2 } from "./enBlogStage11Wave2";
import { kkBlogStage5P0 } from "./kkBlogStage5Content";
import { ruBlogExpanded, ruBlogNewP0 } from "./ruBlogStage2Content";
import { ruBlogStage11Wave2 } from "./ruBlogStage11Wave2";

export type BlogArticle = {
  topicId: string;
  publishedAt: string;
  updatedAt: string;
  content: Partial<
    Record<
      Locale,
      {
        title: string;
        metaDescription: string;
        intro: string;
        shortAnswer: string;
        sections: Array<{ title: string; body: string[] }>;
        checklist: string[];
        faq: FaqItem[];
        internalLinks: Array<{ label: string; href: string }>;
      }
    >
  >;
};

const commonRuFaq: FaqItem[] = [
  {
    question: "Можно ли публиковать AI-фото без проверки?",
    answer: "Нет. AI может изменить форму, цвет, узор, логотип или мелкие детали товара. Перед публикацией нужен ручной контроль.",
  },
  {
    question: "Можно ли гарантировать принятие маркетплейсом?",
    answer: "Нет. Vitrina AI Studio помогает подготовить изображения, но требования площадок меняются, а финальную проверку делает продавец.",
  },
];

const commonEnFaq: FaqItem[] = [
  {
    question: "Can I publish AI product photos without review?",
    answer: "No. AI can change shape, color, patterns, logos, or small details. Manual review is required before publishing.",
  },
  {
    question: "Can marketplace acceptance be guaranteed?",
    answer: "No. Vitrina AI Studio helps prepare images, but platform rules change and final review stays with the seller.",
  },
];

const stage2RuByTopic = { ...ruBlogExpanded, ...ruBlogNewP0 };

function applyStage2Ru(articles: BlogArticle[]): BlogArticle[] {
  const existingIds = new Set(articles.map((article) => article.topicId));

  const merged = articles.map((article) => {
    const ru = stage2RuByTopic[article.topicId];
    if (!ru) return article;
    return {
      ...article,
      updatedAt: "2026-05-20",
      content: { ...article.content, ru },
    };
  });

  const newRuOnly = Object.keys(ruBlogNewP0)
    .filter((topicId) => !existingIds.has(topicId))
    .map(
      (topicId): BlogArticle => ({
        topicId,
        publishedAt: "2026-05-20",
        updatedAt: "2026-05-20",
        content: { ru: ruBlogNewP0[topicId] },
      })
    );

  return [...merged, ...newRuOnly];
}

function applyStage4LegacyEn(articles: BlogArticle[]): BlogArticle[] {
  return articles.map((article) => {
    const en = enBlogStage4Legacy[article.topicId];
    if (!en) return article;
    return {
      ...article,
      updatedAt: "2026-05-20",
      content: { ...article.content, en },
    };
  });
}

function applyStage3En(articles: BlogArticle[]): BlogArticle[] {
  return articles.map((article) => {
    const en = enBlogStage3P0[article.topicId];
    if (!en) return article;
    return {
      ...article,
      updatedAt: "2026-05-20",
      content: { ...article.content, en },
    };
  });
}

function applyStage5Kk(articles: BlogArticle[]): BlogArticle[] {
  return articles.map((article) => {
    const kk = kkBlogStage5P0[article.topicId];
    if (!kk) return article;
    return {
      ...article,
      updatedAt: "2026-05-20",
      content: { ...article.content, kk },
    };
  });
}

function applyStage11Wave2Ru(articles: BlogArticle[]): BlogArticle[] {
  const existingIds = new Set(articles.map((a) => a.topicId));
  const merged = articles.map((article) => {
    const ru = ruBlogStage11Wave2[article.topicId];
    if (!ru) return article;
    return {
      ...article,
      updatedAt: "2026-05-20",
      content: { ...article.content, ru },
    };
  });
  const added = Object.keys(ruBlogStage11Wave2)
    .filter((topicId) => !existingIds.has(topicId))
    .map(
      (topicId): BlogArticle => ({
        topicId,
        publishedAt: "2026-05-20",
        updatedAt: "2026-05-20",
        content: { ru: ruBlogStage11Wave2[topicId] },
      })
    );
  return [...merged, ...added];
}

function applyStage11Wave2En(articles: BlogArticle[]): BlogArticle[] {
  const existingIds = new Set(articles.map((a) => a.topicId));
  const merged = articles.map((article) => {
    const en = enBlogStage11Wave2[article.topicId];
    if (!en) return article;
    return {
      ...article,
      updatedAt: "2026-05-20",
      content: { ...article.content, en },
    };
  });
  const added = Object.keys(enBlogStage11Wave2)
    .filter((topicId) => !existingIds.has(topicId))
    .map(
      (topicId): BlogArticle => ({
        topicId,
        publishedAt: "2026-05-20",
        updatedAt: "2026-05-20",
        content: { en: enBlogStage11Wave2[topicId] },
      })
    );
  return [...merged, ...added];
}

const baseBlogArticles: BlogArticle[] = [
  {
    topicId: "blog_001",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "AI-фото товаров для маркетплейсов: что это и где помогает продавцу",
        metaDescription: "Что такое AI-фото товаров, где оно помогает продавцам маркетплейсов, какие есть ограничения и как проверять результат перед публикацией.",
        intro: "AI-фото товаров — это не кнопка «сделать продажи», а рабочий инструмент для подготовки визуала из исходного снимка. Он особенно полезен, когда нужно быстро привести каталог к единому виду.",
        shortAnswer: "AI-фото помогает продавцу быстрее подготовить карточки, фоны и варианты для соцсетей, но каждый результат нужно сверять с реальным товаром.",
        sections: [
          {
            title: "Что входит в AI-фото товаров",
            body: [
              "Обычно workflow начинается с реального фото товара. Затем сервис помогает убрать фон, поставить товар в чистую сцену, подготовить карточку или показать одежду на AI-модели.",
              "Хороший результат не должен переизобретать товар. Главная цель — сохранить форму, цвет, материал и важные детали, а не сделать красивую, но неточную картинку.",
            ],
          },
          {
            title: "Когда это полезно",
            body: [
              "AI-фото удобно для тестовых карточек, быстрого обновления каталога, подготовки вариантов для Instagram и выравнивания визуального стиля между SKU.",
              "Для hero-съёмки дорогих товаров всё ещё может понадобиться фотограф. AI лучше работает как ускоритель контент-пайплайна, а не как замена здравому контролю.",
            ],
          },
          {
            title: "Как проверять результат",
            body: [
              "Сравните AI-изображение с исходником: цвет, форму, узор, швы, застёжки, логотипы, камни, края и тени.",
              "Если товар стал другим, вариант лучше отклонить и перегенерировать с более строгими настройками или другим исходным фото.",
            ],
          },
        ],
        checklist: ["форма товара сохранена", "цвет не изменён", "нет лишних объектов", "фон не спорит с правилами площадки", "изображение проверено вручную"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Открыть студию", href: "/studio" },
          { label: "Точная товарная карточка", href: "/ru/use-cases/tochnaya-tovarnaya-kartochka" },
          { label: "Платформы", href: "/ru/platforms" },
        ],
      },
      en: {
        title: "AI product photos for marketplaces: what they are and where they help",
        metaDescription: "What AI product photos are, where they help marketplace sellers, what can go wrong, and how to review results before publishing.",
        intro: "AI product photography is not a sales guarantee. It is a workflow tool that turns a source product image into cleaner listing, catalog, and social assets.",
        shortAnswer: "AI product photos help sellers prepare cards, backgrounds, and social variants faster, but every output must be checked against the real product.",
        sections: [
          {
            title: "What AI product photography includes",
            body: [
              "The workflow usually starts with a real product photo. The studio can remove a background, place the product in a clean scene, prepare a product card, or show clothing on an AI model.",
              "A good result should not reinvent the item. The goal is to preserve shape, color, material, and important details.",
            ],
          },
          {
            title: "When it helps",
            body: [
              "AI photos are useful for test listings, catalog refreshes, social variants, and keeping visual style consistent across SKUs.",
              "Premium hero images may still need a photographer. AI works best as a content workflow accelerator, not a replacement for review.",
            ],
          },
          {
            title: "How to review the result",
            body: [
              "Compare the output with the source: color, shape, pattern, seams, fasteners, logos, stones, edges, and shadows.",
              "If the product changed, reject the variant and regenerate with stricter settings or a cleaner source photo.",
            ],
          },
        ],
        checklist: ["shape preserved", "color unchanged", "no unwanted objects", "background fits platform rules", "image manually reviewed"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Open studio", href: "/studio" },
          { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
          { label: "Platforms", href: "/en/platforms" },
        ],
      },
    },
  },
  {
    topicId: "blog_002",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "Как сделать фото товара для маркетплейса: базовый workflow",
        metaDescription: "Пошаговый workflow подготовки фото товара для маркетплейса: исходник, фон, AI-режим, проверка качества и публикация без гарантий модерации.",
        intro: "Фото для маркетплейса должно помогать покупателю понять товар. Красивый фон полезен только тогда, когда он не скрывает реальные свойства товара.",
        shortAnswer: "Начните с чёткого исходника, выберите режим, подготовьте чистый фон или карточку и проверьте точность перед загрузкой на площадку.",
        sections: [
          { title: "1. Снимите понятный исходник", body: ["Используйте ровный свет, видимый контур товара и минимум лишних предметов. Чем чище исходник, тем меньше AI будет додумывать."] },
          { title: "2. Выберите задачу", body: ["Для основной карточки чаще нужен нейтральный фон и точность. Для соцсетей можно использовать lifestyle-сцену, но товар всё равно должен оставаться узнаваемым."] },
          { title: "3. Проверьте перед публикацией", body: ["Сверьте результат с правилами конкретной площадки. Vitrina AI Studio не является партнёром маркетплейсов и не гарантирует модерацию."] },
        ],
        checklist: ["исходник резкий", "товар занимает достаточно места", "фон чистый", "детали не искажены", "правила площадки проверены"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Открыть студию", href: "/studio" },
          { label: "Фото для маркетплейсов", href: "/ru/foto-tovarov-dlya-marketpleysov" },
          { label: "Белый фон", href: "/ru/use-cases/belyy-fon-dlya-marketpleysa" },
        ],
      },
      en: {
        title: "How to create product photos for a marketplace: a practical workflow",
        metaDescription: "A step-by-step product photo workflow for marketplaces: source image, background, AI mode, quality review, and publishing caveats.",
        intro: "A marketplace image should help the buyer understand the product. A beautiful background only helps when it does not hide product truth.",
        shortAnswer: "Start with a clear source photo, choose a mode, prepare a clean background or product card, and review accuracy before upload.",
        sections: [
          { title: "1. Capture a clear source", body: ["Use even lighting, visible product edges, and minimal clutter. The cleaner the source, the less AI has to invent."] },
          { title: "2. Choose the task", body: ["Main listing images usually need neutrality and accuracy. Social scenes can be more creative, but the product must stay recognizable."] },
          { title: "3. Review before publishing", body: ["Compare the result with the current rules of the platform. Vitrina AI Studio is independent and cannot guarantee moderation outcomes."] },
        ],
        checklist: ["source image is sharp", "product is large enough", "background is clean", "details are not distorted", "platform rules checked"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Open studio", href: "/studio" },
          { label: "Marketplace photos", href: "/en/product-photo-for-marketplaces" },
          { label: "White background", href: "/en/use-cases/marketplace-white-background" },
        ],
      },
    },
  },
  {
    topicId: "blog_003",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "Как сделать белый фон для товара и не потерять детали",
        metaDescription: "Как подготовить товар на белом фоне: когда нужен белый фон, что проверять после удаления фона и как не испортить товар.",
        intro: "Белый фон помогает карточке выглядеть аккуратно, но при плохом вырезании можно потерять края, тени, прозрачные детали и фактуру.",
        shortAnswer: "Используйте белый фон для основной карточки, но проверяйте края, тени, прозрачность и точность формы после обработки.",
        sections: [
          { title: "Когда выбирать белый фон", body: ["Белый или нейтральный фон лучше для основной карточки, каталога поставщика и площадок с жёсткими правилами."] },
          { title: "Где AI чаще ошибается", body: ["Сложные края, блестящие поверхности, цепочки, волосы на модели, прозрачные части и тени могут обрабатываться неточно."] },
          { title: "Что делать после генерации", body: ["Откройте изображение крупно и сравните с исходником. Если форма или край товара повреждены, не публикуйте вариант."] },
        ],
        checklist: ["края ровные", "прозрачные части сохранены", "нет обрезанных деталей", "тень выглядит естественно", "фон действительно нейтральный"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Удаление фона", href: "/ru/generator-fona-dlya-tovara" },
          { label: "Белый фон для маркетплейса", href: "/ru/use-cases/belyy-fon-dlya-marketpleysa" },
          { label: "Открыть студию", href: "/studio" },
        ],
      },
      en: {
        title: "How to make a white background for a product without losing detail",
        metaDescription: "How to prepare a product on a white background, when to use it, what to review after background removal, and how to preserve details.",
        intro: "A white background can make listings cleaner, but poor cutouts can damage edges, shadows, transparency, and texture.",
        shortAnswer: "Use white backgrounds for main listing images, then review edges, shadows, transparency, and shape accuracy after processing.",
        sections: [
          { title: "When to use white background", body: ["White or neutral backgrounds work best for main cards, supplier catalogs, and platforms with stricter image rules."] },
          { title: "Where AI can fail", body: ["Complex edges, shiny surfaces, chains, model hair, transparent parts, and shadows can be processed inaccurately."] },
          { title: "What to do after generation", body: ["Zoom in and compare with the source. If the product shape or edge is damaged, do not publish the variant."] },
        ],
        checklist: ["edges are clean", "transparent parts preserved", "no cut-off details", "shadow is natural", "background is neutral"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Background generator", href: "/en/background-generator" },
          { label: "White background use case", href: "/en/use-cases/marketplace-white-background" },
          { label: "Open studio", href: "/studio" },
        ],
      },
    },
  },
  {
    topicId: "blog_008",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "Как проверить AI-фото перед публикацией",
        metaDescription: "Чеклист ручной проверки AI-фото товара: цвет, форма, узор, фон, логотипы, края, ограничения AI и правила площадки.",
        intro: "AI-фото нужно проверять как черновик, а не как финальный файл. Самая важная часть workflow — найти и отклонить неточные варианты.",
        shortAnswer: "Сравните AI-фото с исходником, проверьте товарные детали и только потом используйте изображение в карточке.",
        sections: [
          { title: "Проверка товара", body: ["Сравните форму, цвет, фактуру, узор, швы, фурнитуру, логотипы, камни, бирки и упаковку."] },
          { title: "Проверка фона", body: ["Фон не должен создавать ложное впечатление о размере, комплектации, материале или бренде товара."] },
          { title: "Проверка площадки", body: ["Откройте актуальные правила маркетплейса перед загрузкой, особенно для main image и форматов."] },
        ],
        checklist: ["товар совпадает с исходником", "фон не вводит в заблуждение", "нет лишних объектов", "нет fake brand/logos", "формат подходит площадке"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Чеклист в студии", href: "/studio" },
          { label: "Точная карточка", href: "/ru/use-cases/tochnaya-tovarnaya-kartochka" },
          { label: "Platform pages", href: "/ru/platforms" },
        ],
      },
      en: {
        title: "How to review AI product photos before publishing",
        metaDescription: "Manual AI product photo checklist: color, shape, pattern, background, logos, edges, AI limitations, and platform rules.",
        intro: "Treat AI output as a draft, not as a final asset. The most important step is finding and rejecting inaccurate variants.",
        shortAnswer: "Compare the AI photo with the source, check product details, and only then use it in a listing.",
        sections: [
          { title: "Product review", body: ["Compare shape, color, texture, pattern, seams, hardware, logos, stones, labels, and packaging."] },
          { title: "Background review", body: ["The background should not mislead buyers about size, bundle contents, material, or brand."] },
          { title: "Platform review", body: ["Check current marketplace rules before upload, especially for main images and formats."] },
        ],
        checklist: ["product matches source", "background is not misleading", "no unwanted objects", "no fake brand/logos", "format fits platform"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Studio checklist", href: "/studio" },
          { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
          { label: "Platform pages", href: "/en/platforms" },
        ],
      },
    },
  },
  {
    topicId: "blog_011",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "Как сделать фото одежды на модели с помощью AI",
        metaDescription: "Workflow для фото одежды на AI-модели: исходник, взрослая модель, поза, ограничения, проверка посадки и деталей перед публикацией.",
        intro: "AI-модель помогает показать одежду без полноценной фотосессии, но результат должен оставаться честным коммерческим изображением товара.",
        shortAnswer: "Загрузите фото одежды, выберите взрослую модель и проверьте посадку, форму, швы, ткань и пропорции перед публикацией.",
        sections: [
          { title: "Подготовьте исходник", body: ["Одежда должна быть видна целиком, без сильных складок, перекрытий и грязного фона."] },
          { title: "Выберите коммерческий стиль", body: ["Для каталога лучше нейтральная взрослая модель, простая поза и светлый фон. Для белья и купальников — только adult commercial catalog style."] },
          { title: "Проверьте посадку", body: ["AI может изменить длину, вырез, швы, узор или форму. Если посадка выглядит неверно, не используйте изображение как карточку товара."] },
        ],
        checklist: ["модель взрослая", "товар не сексуализирует minors", "посадка правдоподобна", "узор сохранён", "длина и форма не изменены"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Одежда на AI-модели", href: "/ru/use-cases/odezhda-na-ai-modeli" },
          { label: "Студия", href: "/studio" },
          { label: "Фото одежды на AI-модели", href: "/ru/foto-odezhdy-na-ai-modeli" },
        ],
      },
      en: {
        title: "How to create clothing photos on an AI model",
        metaDescription: "AI model clothing workflow: source garment photo, adult model, pose, limitations, fit review, and detail checks before publishing.",
        intro: "An AI model can show clothing without a full shoot, but the output still needs to be an honest commercial image of the product.",
        shortAnswer: "Upload the garment photo, choose an adult model, and review fit, shape, seams, fabric, and proportions before publishing.",
        sections: [
          { title: "Prepare the source", body: ["The garment should be visible, with minimal folds, occlusion, and background noise."] },
          { title: "Choose a commercial style", body: ["Catalog images usually need an adult neutral model, simple pose, and clean background. Lingerie and swimwear must stay adult commercial catalog style."] },
          { title: "Review fit", body: ["AI can change length, neckline, seams, pattern, or shape. If the fit is inaccurate, do not use the image as a listing asset."] },
        ],
        checklist: ["adult model", "no minors or sexualized minors", "fit is plausible", "pattern preserved", "length and shape unchanged"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Clothing on AI model", href: "/en/use-cases/clothing-on-ai-model" },
          { label: "Studio", href: "/studio" },
          { label: "Fashion model photos", href: "/en/fashion-model-photos" },
        ],
      },
    },
  },
  {
    topicId: "blog_016",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "Фото белья на AI-модели: как делать безопасно и коммерчески",
        metaDescription: "Как готовить фото белья на AI-модели: adult commercial catalog style, запрет minors, проверка посадки и честность карточки товара.",
        intro: "Бельё и купальники требуют особенно аккуратного workflow: только взрослые модели, коммерческий каталоговый стиль и строгая проверка результата.",
        shortAnswer: "Используйте только adult commercial catalog style, не загружайте minors и проверяйте, что AI не изменил изделие или посадку.",
        sections: [
          { title: "Safety-first подход", body: ["Не используйте несовершеннолетних моделей, не создавайте сексуализированный minors content и не маскируйте товар под вводящую в заблуждение карточку."] },
          { title: "Коммерческий каталоговый стиль", body: ["Нейтральная поза, взрослый образ, чистый свет и отсутствие провокационной композиции помогают держать страницу в безопасной зоне."] },
          { title: "Проверка товара", body: ["Сверьте цвет, кружево, швы, форму чашек, размерные элементы, бретели и декоративные детали."] },
        ],
        checklist: ["только взрослая модель", "catalog style", "без minors", "без misleading посадки", "детали белья сохранены"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Бельё на AI-модели", href: "/ru/use-cases/bele-na-ai-modeli" },
          { label: "Terms", href: "/ru/terms" },
          { label: "Студия", href: "/studio" },
        ],
      },
      en: {
        title: "Lingerie photos on an AI model: safe commercial workflow",
        metaDescription: "How to prepare lingerie photos on an AI model: adult commercial catalog style, no minors, fit review, and honest product listings.",
        intro: "Lingerie and swimwear need a careful workflow: adult models only, commercial catalog style, and strict result review.",
        shortAnswer: "Use adult commercial catalog style only, do not upload minors, and verify that AI did not change the garment or fit.",
        sections: [
          { title: "Safety-first approach", body: ["Do not use minors, do not generate sexualized minors content, and do not create misleading product listings."] },
          { title: "Commercial catalog style", body: ["Neutral pose, adult appearance, clean light, and non-provocative composition keep the workflow in a safer zone."] },
          { title: "Product review", body: ["Check color, lace, seams, cups, sizing elements, straps, and decorative details."] },
        ],
        checklist: ["adult model only", "catalog style", "no minors", "no misleading fit", "garment details preserved"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Lingerie on AI model", href: "/en/use-cases/lingerie-on-ai-model" },
          { label: "Terms", href: "/en/terms" },
          { label: "Studio", href: "/studio" },
        ],
      },
    },
  },
  {
    topicId: "blog_021",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "Как сделать фото бижутерии для маркетплейса",
        metaDescription: "Фото бижутерии для маркетплейса: белый фон, lifestyle-сцена, точность камней и металла, ошибки AI и чеклист проверки.",
        intro: "Бижутерия сложна для AI: мелкие камни, блеск, цепочки и отражения легко искажаются. Поэтому нужен аккуратный исходник и строгий контроль.",
        shortAnswer: "Для бижутерии начинайте с резкого фото, выбирайте чистый фон и проверяйте камни, металл, застёжки, форму и масштаб.",
        sections: [
          { title: "Снимайте ближе и резче", body: ["Мелкие детали должны быть видны. Размытый исходник почти всегда приводит к неточным камням, цепочкам и краям."] },
          { title: "Выбирайте фон под задачу", body: ["Белый фон подходит для основной карточки, lifestyle-сцена — для Instagram или Etsy. В обоих случаях товар не должен меняться."] },
          { title: "Проверяйте отражения", body: ["AI может добавить лишний блеск или изменить металл. Сверяйте оттенок, количество камней и форму замка."] },
        ],
        checklist: ["камни на месте", "металл не изменён", "форма сохранена", "фон чистый", "масштаб не вводит в заблуждение"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Фото бижутерии", href: "/ru/use-cases/foto-bizhuterii" },
          { label: "Etsy", href: "/ru/platforms/etsy-foto-tovarov" },
          { label: "Студия", href: "/studio" },
        ],
      },
      en: {
        title: "How to create jewelry product photos for a marketplace",
        metaDescription: "Jewelry marketplace photos: white background, lifestyle scenes, stone and metal accuracy, AI mistakes, and a review checklist.",
        intro: "Jewelry is difficult for AI: small stones, shine, chains, and reflections are easy to distort. A sharp source and strict review matter.",
        shortAnswer: "Start with a sharp close photo, choose a clean background, and review stones, metal, clasps, shape, and scale.",
        sections: [
          { title: "Shoot closer and sharper", body: ["Small details must be visible. A blurry source often produces inaccurate stones, chains, and edges."] },
          { title: "Choose background by task", body: ["White background works for main listing images; lifestyle scenes work for Instagram or Etsy. In both cases the product must not change."] },
          { title: "Review reflections", body: ["AI can add extra shine or alter metal. Check shade, stone count, and clasp shape."] },
        ],
        checklist: ["stones are correct", "metal unchanged", "shape preserved", "background clean", "scale is not misleading"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Jewelry photos", href: "/en/use-cases/jewelry-product-photos" },
          { label: "Etsy", href: "/en/platforms/etsy-product-photos" },
          { label: "Studio", href: "/studio" },
        ],
      },
    },
  },
  {
    topicId: "blog_031",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    content: {
      ru: {
        title: "Фото товара для Kaspi: как подготовить карточку без обещаний модерации",
        metaDescription: "Как подготовить фото товара для Kaspi: чистый фон, точная карточка, проверка AI-результата, ограничения и disclaimer независимого инструмента.",
        intro: "Kaspi — важная площадка для продавцов в Казахстане, но правила карточек могут меняться. Vitrina AI Studio помогает готовить изображения, а не гарантирует принятие.",
        shortAnswer: "Подготовьте чистое фото, проверьте точность товара и сверяйтесь с актуальными правилами Kaspi перед публикацией.",
        sections: [
          { title: "Что подготовить", body: ["Нужен понятный исходник товара, без сильных теней, перекрытий и лишнего декора."] },
          { title: "Как использовать AI", body: ["Соберите аккуратный product shot, уберите лишний фон и проверьте, что товар не изменился."] },
          { title: "Важный disclaimer", body: ["Vitrina AI Studio не является официальным партнёром Kaspi. Требования к изображениям могут меняться, поэтому продавец проверяет правила самостоятельно."] },
        ],
        checklist: ["исходник понятный", "фон чистый", "товар не искажён", "нет лишних объектов", "правила Kaspi проверены"],
        faq: commonRuFaq,
        internalLinks: [
          { label: "Kaspi page", href: "/ru/platforms/kaspi-foto-tovarov" },
          { label: "Точная карточка", href: "/ru/use-cases/tochnaya-tovarnaya-kartochka" },
          { label: "Студия", href: "/studio" },
        ],
      },
      en: {
        title: "Product photos for Kaspi: preparing a card without moderation promises",
        metaDescription: "How to prepare product photos for Kaspi: clean background, exact product card, AI review, limitations, and independent-tool disclaimer.",
        intro: "Kaspi is an important marketplace for Kazakhstan sellers, but listing image rules can change. Vitrina AI Studio helps prepare images, not guarantee acceptance.",
        shortAnswer: "Prepare a clean photo, review product accuracy, and check current Kaspi rules before publishing.",
        sections: [
          { title: "What to prepare", body: ["Use a clear source image without strong shadows, occlusion, or distracting decoration."] },
          { title: "How to use AI", body: ["Create a clean product shot, remove background clutter, and verify that the product did not change."] },
          { title: "Important disclaimer", body: ["Vitrina AI Studio is not an official partner of Kaspi. Image requirements can change, so sellers must check current rules themselves."] },
        ],
        checklist: ["source is clear", "background is clean", "product not distorted", "no unwanted objects", "Kaspi rules checked"],
        faq: commonEnFaq,
        internalLinks: [
          { label: "Kaspi page", href: "/en/platforms/kaspi-product-photos" },
          { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
          { label: "Studio", href: "/studio" },
        ],
      },
    },
  },
];

export const blogArticles = applyStage11Wave2En(
  applyStage11Wave2Ru(
    applyStage5Kk(
      applyStage4LegacyEn(applyStage3En(applyStage2Ru(baseBlogArticles)))
    )
  )
);

export function getArticleByTopicId(topicId: string) {
  return blogArticles.find((article) => article.topicId === topicId);
}
