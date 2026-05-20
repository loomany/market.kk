/** Shared helpers and link maps for Stage 11 Wave 2 blog build */

export const WAVE2_TOPIC_NUMBERS = [
  6, 7, 9, 10, 19, 20, 29, 34, 35, 36, 49, 55, 60, 61, 63, 67, 75, 77, 94, 96,
];

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function topicId(n) {
  return `blog_${String(n).padStart(3, "0")}`;
}

/** Pre–Wave 2 published blog slugs (Stage 1–2) */
export const PUBLISHED_RU_BLOG = {
  b001: "/ru/blog/ai-foto-tovarov-dlya-marketpleysov",
  b002: "/ru/blog/kak-sdelat-foto-tovara-dlya-marketpleysa",
  b003: "/ru/blog/kak-sdelat-belyy-fon-dlya-tovara",
  b004: "/ru/blog/kak-uluchshit-foto-tovara-bez-fotografa",
  b005: "/ru/blog/kak-sdelat-kartochku-tovara-iz-obychnogo-foto",
  b008: "/ru/blog/kak-proverit-ai-foto-pered-publikatsiey",
  b011: "/ru/blog/kak-sdelat-foto-odezhdy-na-modeli",
  b012: "/ru/blog/kak-perenesti-odezhdu-na-ai-model",
  b016: "/ru/blog/foto-belya-na-ai-modeli",
  b021: "/ru/blog/foto-bizhuterii-dlya-marketpleysa",
  b030: "/ru/blog/kak-sdelat-foto-obuvi-dlya-kartochki-tovara",
  b031: "/ru/blog/foto-tovarov-dlya-kaspi",
  b032: "/ru/blog/foto-tovarov-dlya-wildberries",
  b033: "/ru/blog/foto-tovarov-dlya-ozon",
  b047: "/ru/blog/kak-sdelat-reels-iz-foto-tovara",
  b048: "/ru/blog/kak-sdelat-video-tovara-iz-fotografii",
  b064: "/ru/blog/kak-udalit-fon-s-foto-tovara",
  b065: "/ru/blog/kak-zamenit-fon-u-tovara",
  b074: "/ru/blog/ai-foto-ili-fotosessiya-chto-vybrat",
  b098: "/ru/blog/kak-zastavit-ai-sohranit-tovar",
};

export const PUBLISHED_EN_BLOG = {
  b001: "/en/blog/what-is-ai-product-photography",
  b002: "/en/blog/how-to-create-product-photos-for-a-marketplace",
  b003: "/en/blog/how-to-make-a-white-background-for-a-product",
  b004: "/en/blog/how-to-improve-product-photos-without-a-photographer",
  b005: "/en/blog/how-to-make-a-product-card-from-a-regular-photo",
  b008: "/en/blog/how-to-review-ai-product-photos-before-publishing",
  b011: "/en/blog/how-to-create-clothing-photos-on-a-model",
  b012: "/en/blog/how-to-place-clothing-on-an-ai-model",
  b016: "/en/blog/lingerie-photos-on-an-ai-model",
  b021: "/en/blog/how-to-create-jewelry-product-photos-for-a-marketplace",
  b030: "/en/blog/how-to-create-shoe-photos-for-a-product-card",
  b031: "/en/blog/product-photos-for-kaspi",
  b032: "/en/blog/product-photos-for-wildberries",
  b033: "/en/blog/product-photos-for-ozon",
  b047: "/en/blog/how-to-make-reels-from-a-product-photo",
  b048: "/en/blog/how-to-create-a-product-video-from-a-photo",
  b064: "/en/blog/how-to-remove-the-background-from-a-product-photo",
  b065: "/en/blog/how-to-replace-a-product-background",
  b074: "/en/blog/ai-product-photos-or-a-photoshoot-what-to-choose",
  b098: "/en/blog/how-to-make-ai-preserve-the-product",
};

export const RU_UC = {
  exact: "/ru/use-cases/tochnaya-tovarnaya-kartochka",
  white: "/ru/use-cases/belyy-fon-dlya-marketpleysa",
  cloth: "/ru/use-cases/odezhda-na-ai-modeli",
  catalog: "/ru/use-cases/foto-dlya-ecommerce-kataloga",
  jewelry: "/ru/use-cases/foto-bizhuterii",
  cleanup: "/ru/use-cases/ochistka-foto-tovara",
  bg: "/ru/use-cases/zamena-fona-ai",
};

export const EN_UC = {
  exact: "/en/use-cases/exact-product-card",
  white: "/en/use-cases/marketplace-white-background",
  cloth: "/en/use-cases/clothing-on-model",
  catalog: "/en/use-cases/ecommerce-catalog-photos",
  jewelry: "/en/use-cases/jewelry-product-photos",
  cleanup: "/en/use-cases/product-photo-cleanup",
  bg: "/en/use-cases/ai-background-replacement",
};

export function p(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function sec(title, ...paragraphGroups) {
  const body = paragraphGroups.map((group) =>
    Array.isArray(group) ? p(...group) : group
  );
  return { title, body };
}

export function wordCount(article) {
  const text = [
    article.intro,
    article.shortAnswer,
    ...article.sections.flatMap((s) => s.body),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function faqRu(extra = []) {
  const base = [
    {
      question: "Можно ли публиковать AI-фото без ручной проверки?",
      answer:
        "Нет. AI может изменить форму, цвет, узор, логотип или мелкие детали. Перед публикацией сравните результат с исходным фото и отклоните неточные варианты.",
    },
    {
      question: "Гарантирует ли Vitrina AI принятие карточки маркетплейсом?",
      answer:
        "Нет. Сервис помогает подготовить изображения, но правила площадок меняются, а финальную проверку и ответственность за публикацию несёт продавец.",
    },
    {
      question: "Является ли Vitrina AI официальным партнёром Kaspi, Wildberries или Ozon?",
      answer:
        "Нет. Это независимый инструмент. Перед загрузкой сверяйтесь с актуальными требованиями конкретной площадки.",
    },
    {
      question: "Нужен ли профессиональный фотограф?",
      answer:
        "Для обновления каталога и тестовых карточек часто достаточно аккуратного исходника со смартфона. Для премиальных hero-снимков фотограф может быть нужен.",
    },
  ];
  return [...base, ...extra];
}

export function faqEn(extra = []) {
  const base = [
    {
      question: "Can I publish AI photos without manual review?",
      answer:
        "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants.",
    },
    {
      question: "Does Vitrina AI guarantee marketplace approval?",
      answer:
        "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review.",
    },
    {
      question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
      answer:
        "No. It is an independent tool. Check current marketplace image requirements before upload.",
    },
    {
      question: "Do I need a professional photographer?",
      answer:
        "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer.",
    },
  ];
  return [...base, ...extra];
}

export const DISCLAIMER_RU =
  "Vitrina AI Studio не является официальным партнёром маркетплейсов и не гарантирует прохождение модерации или 100% точность результата.";

export const DISCLAIMER_EN =
  "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.";

export const VIDEO_NOTE_RU =
  "Видео и Reels из фото товара описаны отдельно; часть сценариев ещё в разработке — не публикуйте ролик, пока функция недоступна в вашей версии студии.";

export const VIDEO_NOTE_EN =
  "Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.";
