import type { Locale } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";

export type ExamplePageKey =
  | "index"
  | "productPhotos"
  | "clothingOnModel"
  | "backgroundRemoval"
  | "kaspiProductCards"
  | "lingerieOnAiModel";

export type ExamplePageContent = {
  key: ExamplePageKey;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  assetNote: string;
  disclaimer: string;
  relatedLinks: Array<{ label: string; href: string }>;
  /** Always noindex until licensed/owned before-after assets are added. */
  indexPolicy: "noindex";
};

const exampleSlugs: Record<ExamplePageKey, string> = {
  index: "",
  productPhotos: "product-photos",
  clothingOnModel: "clothing-on-model",
  backgroundRemoval: "background-removal",
  kaspiProductCards: "kaspi-product-cards",
  lingerieOnAiModel: "lingerie-on-ai-model",
};

const ruCopy: Record<ExamplePageKey, Omit<ExamplePageContent, "key" | "slug" | "indexPolicy">> = {
  index: {
    title: "Примеры Vitrina AI — Vitrina AI Studio",
    metaDescription:
      "Раздел примеров Vitrina AI Studio: товарные фото, одежда на модели, фон, Kaspi. Иллюстрации появятся после подготовки собственных материалов.",
    h1: "Примеры работ",
    intro:
      "Здесь будут опубликованы иллюстративные примеры workflow Vitrina AI. Сейчас раздел подготовлен как каркас: без чужих изображений и без выдуманных «кейсов клиентов».",
    sections: [
      {
        title: "Что появится в разделе",
        body: "Категории: товарные фото, одежда на AI-модели, удаление фона, карточки Kaspi, бельё на модели (adult-only). Каждый пример сопровождается дисклеймером и чеклистом QA.",
      },
      {
        title: "Требования к будущим материалам",
        body: "Только собственные или лицензированные исходники; подпись «иллюстрация workflow»; сравнение до/после только при реальных экспортах из студии.",
      },
    ],
    assetNote:
      "Слоты для изображений зарезервированы. Файлы не подключены — страница в noindex до появления assets.",
    disclaimer:
      "Примеры носят иллюстративный характер. Финальный AI-результат может отличаться; перед публикацией проверяйте товар вручную.",
    relatedLinks: [
      { label: "Как работает", href: "/ru/how-it-works" },
      { label: "Качество AI", href: "/ru/quality" },
      { label: "Фото для Kaspi", href: "/ru/platforms/kaspi-foto-tovarov" },
    ],
  },
  productPhotos: {
    title: "Примеры товарных фото — Vitrina AI Studio",
    metaDescription:
      "Будущие примеры AI товарных фото и карточек для маркетплейсов. Раздел в подготовке, без фейковых изображений.",
    h1: "Примеры: товарные фото",
    intro: "Покажем workflow подготовки карточки и белого фона, когда будут готовы собственные визуальные материалы.",
    sections: [
      {
        title: "Что будет показано",
        body: "Исходник → карточка на белом фоне → проверка цвета и краёв. Без обещания идеальной копии.",
      },
      {
        title: "Связанные материалы",
        body: "См. feature «AI-студия товарных фото» и статьи про карточку и белый фон в блоге.",
      },
    ],
    assetNote: "Placeholder: product card / white background slots.",
    disclaimer: "Иллюстрация workflow; результат может отличаться от вашего SKU.",
    relatedLinks: [
      { label: "AI-студия товарных фото", href: "/ru/ii-studiya-tovarnyh-foto" },
      { label: "Белый фон", href: "/ru/blog/kak-sdelat-belyy-fon-dlya-tovara" },
    ],
  },
  clothingOnModel: {
    title: "Примеры: одежда на AI-модели — Vitrina AI Studio",
    metaDescription:
      "Будущие примеры одежды на AI-модели. Раздел в подготовке.",
    h1: "Примеры: одежда на модели",
    intro: "Демонстрация переноса одежды на взрослую AI-модель появится после подготовки безопасных визуалов.",
    sections: [
      {
        title: "Что будет показано",
        body: "Фото изделия → посадка на модели → проверка швов и длины. Только adult commercial catalog.",
      },
    ],
    assetNote: "Placeholder: garment → on-model slots.",
    disclaimer: "Не гарантирует идеальную посадку; проверяйте детали перед публикацией.",
    relatedLinks: [
      { label: "Фото одежды на AI-модели", href: "/ru/foto-odezhdy-na-ai-modeli" },
      { label: "Сценарий одежда на модели", href: "/ru/use-cases/odezhda-na-ai-modeli" },
    ],
  },
  backgroundRemoval: {
    title: "Примеры: удаление и замена фона — Vitrina AI Studio",
    metaDescription:
      "Будущие примеры удаления и замены фона товара. Раздел в подготовке.",
    h1: "Примеры: фон товара",
    intro: "Before/after появятся только на реальных экспортах из студии с разрешёнными исходниками.",
    sections: [
      {
        title: "Что будет показано",
        body: "Исходник с шумным фоном → чистый белый или студийный фон → контроль краёв товара.",
      },
    ],
    assetNote: "Placeholder: background removal slots (no stock photos).",
    disclaimer: "Края и мелкие детали могут требовать ручной проверки.",
    relatedLinks: [
      { label: "Генератор фона", href: "/ru/generator-fona-dlya-tovara" },
      { label: "Удалить фон", href: "/ru/blog/kak-udalit-fon-s-foto-tovara" },
    ],
  },
  kaspiProductCards: {
    title: "Примеры: карточки Kaspi — Vitrina AI Studio",
    metaDescription:
      "Будущие примеры подготовки фото для Kaspi. Раздел в подготовке.",
    h1: "Примеры: Kaspi",
    intro: "Покажем типовой чеклист карточки Kaspi после появления собственных примеров (не официальный кейс Kaspi).",
    sections: [
      {
        title: "Что будет показано",
        body: "Главное фото, белый фон, читаемость деталей, ручная проверка перед загрузкой в кабинет продавца.",
      },
    ],
    assetNote: "Placeholder: Kaspi-style card layout (no Kaspi branding misuse).",
    disclaimer: "Vitrina AI не является официальным партнёром Kaspi; модерацию проверяет продавец.",
    relatedLinks: [
      { label: "Kaspi platform", href: "/ru/platforms/kaspi-foto-tovarov" },
      { label: "Статья Kaspi", href: "/ru/blog/foto-tovarov-dlya-kaspi" },
    ],
  },
  lingerieOnAiModel: {
    title: "Примеры: бельё на AI-модели — Vitrina AI Studio",
    metaDescription:
      "Будущие примеры adult-only каталога белья на AI-модели. Раздел в подготовке.",
    h1: "Примеры: бельё на модели",
    intro: "Только взрослый коммерческий стиль каталога; без откровенного контента и без несовершеннолетних.",
    sections: [
      {
        title: "Что будет показано",
        body: "Сдержанные позы, проверка кружева и прозрачных тканей, сравнение с исходником.",
      },
      {
        title: "Ограничения",
        body: "Сложные фактуры могут потребовать нескольких попыток и ручной доработки.",
      },
    ],
    assetNote: "Placeholder: lingerie catalog-safe slots.",
    disclaimer: "Adult-only; соблюдайте правила площадки и законодательство.",
    relatedLinks: [
      { label: "Сценарий бельё", href: "/ru/use-cases/bele-na-ai-modeli" },
      { label: "Статья про бельё", href: "/ru/blog/foto-belya-na-ai-modeli" },
    ],
  },
};

const enCopy: Record<ExamplePageKey, Omit<ExamplePageContent, "key" | "slug" | "indexPolicy">> = {
  index: {
    title: "Vitrina AI examples — Vitrina AI Studio",
    metaDescription:
      "Examples hub for Vitrina AI Studio workflows. Visuals will be added when owned assets are ready.",
    h1: "Examples",
    intro:
      "Illustrative workflow examples will appear here. This hub is a scaffold—no third-party images or fabricated client cases.",
    sections: [
      {
        title: "Coming soon",
        body: "Categories: product photos, on-model clothing, backgrounds, Kaspi-style cards, lingerie (adult-only). Each with QA notes.",
      },
      {
        title: "Asset policy",
        body: "Only owned or licensed sources; label as workflow illustration; before/after only from real studio exports.",
      },
    ],
    assetNote: "Image slots reserved; not connected—noindex until assets ship.",
    disclaimer: "Illustrative only. Final AI output may vary; review before publishing.",
    relatedLinks: [
      { label: "How it works", href: "/en/how-it-works" },
      { label: "Quality", href: "/en/quality" },
      { label: "Kaspi photos", href: "/en/platforms/kaspi-product-photos" },
    ],
  },
  productPhotos: {
    title: "Product photo examples — Vitrina AI Studio",
    metaDescription: "Future AI product photo examples. Scaffold only, noindex.",
    h1: "Examples: product photos",
    intro: "We will show card and white-background workflows when owned visuals are ready.",
    sections: [
      { title: "Planned visuals", body: "Source → marketplace card → color and edge QA." },
    ],
    assetNote: "Placeholder slots only.",
    disclaimer: "Workflow illustration; your SKU may differ.",
    relatedLinks: [
      { label: "AI product studio", href: "/en/ai-product-photo-studio" },
      { label: "White background guide", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
    ],
  },
  clothingOnModel: {
    title: "Clothing on model examples — Vitrina AI Studio",
    metaDescription: "Future on-model clothing examples. Scaffold only.",
    h1: "Examples: clothing on model",
    intro: "Adult catalog on-model demos will ship with approved assets.",
    sections: [{ title: "Planned visuals", body: "Garment → fit on model → seam review." }],
    assetNote: "Placeholder slots only.",
    disclaimer: "Fit may vary; manual review required.",
    relatedLinks: [
      { label: "Fashion model photos", href: "/en/fashion-model-photos" },
      { label: "Clothing use case", href: "/en/use-cases/clothing-on-ai-model" },
    ],
  },
  backgroundRemoval: {
    title: "Background removal examples — Vitrina AI Studio",
    metaDescription: "Future background removal examples. Scaffold only.",
    h1: "Examples: backgrounds",
    intro: "Before/after only from permitted studio exports.",
    sections: [{ title: "Planned visuals", body: "Noisy background → clean white/studio → edge check." }],
    assetNote: "Placeholder slots only.",
    disclaimer: "Edges may need manual QA.",
    relatedLinks: [
      { label: "Background generator", href: "/en/background-generator" },
      { label: "Remove background", href: "/en/blog/how-to-remove-the-background-from-a-product-photo" },
    ],
  },
  kaspiProductCards: {
    title: "Kaspi card examples — Vitrina AI Studio",
    metaDescription: "Future Kaspi listing examples. Not an official Kaspi case study.",
    h1: "Examples: Kaspi cards",
    intro: "Checklist-style demos after owned assets are ready.",
    sections: [{ title: "Planned visuals", body: "Main image, white background, detail readability." }],
    assetNote: "Placeholder slots only.",
    disclaimer: "Not an official Kaspi partner; sellers verify moderation.",
    relatedLinks: [
      { label: "Kaspi platform", href: "/en/platforms/kaspi-product-photos" },
      { label: "Kaspi article", href: "/en/blog/product-photos-for-kaspi" },
    ],
  },
  lingerieOnAiModel: {
    title: "Lingerie on AI model examples — Vitrina AI Studio",
    metaDescription: "Future adult-only lingerie catalog examples. Scaffold only.",
    h1: "Examples: lingerie on model",
    intro: "Adult commercial catalog only.",
    sections: [{ title: "Planned visuals", body: "Modest poses; lace and sheer fabric QA." }],
    assetNote: "Placeholder slots only.",
    disclaimer: "Adult-only; follow platform policies.",
    relatedLinks: [
      { label: "Lingerie use case", href: "/en/use-cases/lingerie-on-ai-model" },
      { label: "Lingerie article", href: "/en/blog/lingerie-photos-on-an-ai-model" },
    ],
  },
};

const kkCopy: Partial<
  Record<ExamplePageKey, Omit<ExamplePageContent, "key" | "slug" | "indexPolicy">>
> = {
  index: {
    title: "Vitrina AI мысалдары — Vitrina AI Studio",
    metaDescription: "Workflow мысалдары — assets дайын болған соң.",
    h1: "Мысалдар",
    intro: "Өз визуалдарымыз дайын болғанша бет каркасы ғана.",
    sections: [{ title: "Келесі қадам", body: "Kaspi, киім, фон мысалдары." }],
    assetNote: "Суреттер қосылмаған — noindex.",
    disclaimer: "AI нәтижесі әртүрлі болуы мүмкін.",
    relatedLinks: [
      { label: "Қалай жұмыс істейді", href: "/kk/how-it-works" },
      { label: "Kaspi", href: "/kk/platforms/kaspi-foto-tovarov" },
    ],
  },
  kaspiProductCards: {
    title: "Kaspi карточка мысалдары — Vitrina AI Studio",
    metaDescription: "Kaspi карточка мысалдары — дайындауда.",
    h1: "Мысалдар: Kaspi",
    intro: "Kaspi ресми серіктес емес — сатушы тексереді.",
    sections: [{ title: "Көрсетілетін", body: "Негізгі фото, ақ фон, детальдар." }],
    assetNote: "Placeholder.",
    disclaimer: "Иллюстрация; модерация кепілдемейді.",
    relatedLinks: [
      { label: "Kaspi", href: "/kk/platforms/kaspi-foto-tovarov" },
      { label: "Kaspi блог", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    ],
  },
  clothingOnModel: {
    title: "Модельде киім мысалдары — Vitrina AI Studio",
    metaDescription: "Киім AI модель мысалдары — дайындауда.",
    h1: "Мысалдар: киім",
    intro: "Ересек каталог стилі.",
    sections: [{ title: "Көрсетілетін", body: "Киім → модель → тексеру." }],
    assetNote: "Placeholder.",
    disclaimer: "Қолмен QA міндетті.",
    relatedLinks: [
      { label: "Киім фото", href: "/kk/kiim-ai-model-fotosy" },
      { label: "Use case", href: "/kk/use-cases/odezhda-na-ai-modeli" },
    ],
  },
};

const kkEnabledKeys = new Set<ExamplePageKey>(["index", "kaspiProductCards", "clothingOnModel"]);

export function getExamplePagesForLocale(locale: Locale): ExamplePageContent[] {
  const keys: ExamplePageKey[] =
    locale === "kk"
      ? ["index", "kaspiProductCards", "clothingOnModel"]
      : locale === "ru" || locale === "en"
        ? [
            "index",
            "productPhotos",
            "clothingOnModel",
            "backgroundRemoval",
            "kaspiProductCards",
            "lingerieOnAiModel",
          ]
        : [];

  return keys.map((key) => {
    const slug = exampleSlugs[key];
    const copy =
      locale === "ru"
        ? ruCopy[key]
        : locale === "en"
          ? enCopy[key]
          : locale === "kk" && kkCopy[key]
            ? kkCopy[key]!
            : enCopy[key];
    return {
      key,
      slug,
      indexPolicy: "noindex" as const,
      ...copy,
    };
  });
}

export function getExamplePage(locale: Locale, slug: string): ExamplePageContent | undefined {
  const pages = getExamplePagesForLocale(locale);
  if (slug === "" || slug === "index") {
    return pages.find((p) => p.key === "index");
  }
  return pages.find((p) => p.slug === slug);
}

export function getAllExampleStaticParams() {
  return supportedLocaleCodes.flatMap((locale) => {
    const pages = getExamplePagesForLocale(locale);
    return pages
      .filter((p) => p.key !== "index")
      .map((p) => ({ locale, slug: p.slug }));
  });
}

export function resolveExampleSwitchPath(
  pathname: string,
  targetLocale: Locale
): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2 || segments[1] !== "examples") {
    return null;
  }
  const sourceLocale = segments[0] as Locale;
  const slug = segments[2] ?? "";
  const sourcePage = getExamplePage(sourceLocale, slug);
  if (!sourcePage) {
    return `/${targetLocale}/examples`;
  }
  const targetPages = getExamplePagesForLocale(targetLocale);
  const match = targetPages.find((p) => p.key === sourcePage.key);
  if (!match) {
    return `/${targetLocale}/examples`;
  }
  return match.key === "index"
    ? `/${targetLocale}/examples`
    : `/${targetLocale}/examples/${match.slug}`;
}
