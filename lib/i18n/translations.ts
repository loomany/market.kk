import type { Locale, TranslationStatus } from "./localeConfig";

export type LandingCopy = {
  translationStatus: TranslationStatus;
  nav: {
    features: string;
    audiences: string;
    platforms: string;
    blog: string;
    studio: string;
    openStudio: string;
  };
  hero: {
    badge: string;
    headline: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  cards: Array<{ title: string; text: string }>;
  how: { title: string; intro: string; steps: Array<{ title: string; text: string }> };
  features: { title: string; intro: string; items: Array<{ title: string; text: string; status: string }> };
  audiences: { title: string; intro: string; items: string[] };
  platforms: { title: string; intro: string; disclaimer: string };
  trust: { title: string; items: string[] };
  modes: { title: string; demo: string; real: string };
  finalCta: { title: string; text: string; button: string };
};

const ruLanding: LandingCopy = {
  translationStatus: "published",
  nav: {
    features: "Возможности",
    audiences: "Для кого",
    platforms: "Платформы",
    blog: "Блог",
    studio: "Студия",
    openStudio: "Открыть студию",
  },
  hero: {
    badge: "Vitrina AI Studio",
    headline: "AI-студия товарных фото и видео для маркетплейсов",
    subtitle:
      "Создавайте фото одежды на модели, точные карточки товара, фоны, Reels и короткие видео из одного изображения. Для продавцов маркетплейсов, интернет-магазинов, Instagram-витрин и каталогов.",
    primaryCta: "Открыть студию",
    secondaryCta: "Посмотреть возможности",
  },
  cards: [
    {
      title: "Одежда на модели",
      text: "Покажите платье, футболку, костюм или бельё на взрослой AI-модели.",
    },
    {
      title: "Товарная карточка",
      text: "Соберите аккуратную карточку товара с чистым фоном и проверкой деталей.",
    },
    {
      title: "Проработка фото и видео",
      text: "Готовьте фоны, короткие ролики и варианты для соцсетей по одному исходнику.",
    },
  ],
  how: {
    title: "Как это работает",
    intro: "Простой процесс для продавца: от исходного фото до проверенного файла.",
    steps: [
      { title: "Загрузите фото", text: "Используйте реальный снимок одежды, обуви, сумки, бижутерии или другого товара." },
      { title: "Создайте карточку или модель", text: "Выберите одежду на модели или точную товарную карточку для маркетплейса." },
      { title: "Доработайте фон или видео", text: "В Проработке можно подготовить фон, сцену, Reels или короткий ролик." },
      { title: "Скачайте и публикуйте", text: "Перед публикацией сравните цвет, форму, узор, края и важные детали." },
    ],
  },
  features: {
    title: "Возможности",
    intro: "Функции разделены по понятным задачам: фото на модели, карточка товара, фон, видео и история файлов.",
    items: [
      { title: "Одежда на AI-модели", text: "Перенос одежды, белья или комплекта на взрослую коммерческую модель.", status: "доступно" },
      { title: "Точная товарная карточка", text: "Чистая карточка с контролем фона, размера и сохранения товара.", status: "доступно" },
      { title: "Креативная сцена", text: "Фон и настроение для соцсетей, рекламы и витрин.", status: "доступно в демо" },
      { title: "Удаление / замена фона", text: "Очистка фона и подготовка прозрачного PNG.", status: "доступно" },
      { title: "Видео из фото", text: "Короткие ролики из одного изображения.", status: "в разработке" },
      { title: "Reels / Stories", text: "Вертикальные ассеты 9:16 для соцсетей.", status: "в разработке" },
      { title: "Усиление промта", text: "Серверное улучшение описаний перед генерацией, с подтверждением пользователя.", status: "доступно в демо" },
      { title: "История файлов", text: "Сохранение созданных файлов после входа через WhatsApp.", status: "архитектура готова" },
      { title: "Ручная проверка качества", text: "Чеклист помогает не публиковать искажённый товар.", status: "доступно" },
    ],
  },
  audiences: {
    title: "Для кого",
    intro: "Для небольших команд, которым нужно быстро выпускать понятный товарный визуал.",
    items: [
      "продавцы маркетплейсов",
      "продавцы одежды",
      "продавцы бижутерии",
      "поставщики",
      "шоурумы",
      "Instagram-магазины",
      "интернет-магазины",
      "маркетплейс-менеджеры",
      "фотографы / контент-менеджеры",
      "небольшие ecommerce-команды",
    ],
  },
  platforms: {
    title: "Подходит для",
    intro: "Готовьте изображения для карточек, каталогов, соцсетей и витрин.",
    disclaimer:
      "Vitrina AI Studio — независимый инструмент и не является официальным партнёром перечисленных площадок.",
  },
  trust: {
    title: "Доверие и безопасность",
    items: [
      "AI может ошибаться: товар нужно проверять вручную.",
      "Цена генерации должна быть понятна до запуска, если pricing включён.",
      "В демо-режиме списаний нет.",
      "Реальные генерации используют AI-сервисы через сервер.",
      "Сервис не обещает 100% принятие маркетплейсом или гарантированный рост продаж.",
    ],
  },
  modes: {
    title: "Демо и реальный AI-режим",
    demo: "Демо-режим безопасен: он показывает интерфейс и не списывает деньги.",
    real: "Реальный AI-режим использует AI-провайдеров и может списывать средства, если он включён.",
  },
  finalCta: {
    title: "Попробовать Vitrina AI Studio",
    text: "Откройте студию, загрузите фото и проверьте workflow на демо-ассетах.",
    button: "Открыть студию",
  },
};

const enLanding: LandingCopy = {
  ...ruLanding,
  translationStatus: "published",
  nav: {
    features: "Features",
    audiences: "For whom",
    platforms: "Platforms",
    blog: "Blog",
    studio: "Studio",
    openStudio: "Open studio",
  },
  hero: {
    badge: "Vitrina AI Studio",
    headline: "AI product photo and video studio for marketplaces",
    subtitle:
      "Create on-model clothing photos, precise product cards, backgrounds, Reels, and short videos from one image. Built for marketplace sellers, online stores, Instagram shops, and catalogs.",
    primaryCta: "Open studio",
    secondaryCta: "See features",
  },
  cards: [
    { title: "Clothing on a model", text: "Show garments on an adult AI model for commercial catalog use." },
    { title: "Product card", text: "Prepare a clean product shot with background and detail checks." },
    { title: "Photo and video workflow", text: "Plan backgrounds, short clips, and social assets from one source photo." },
  ],
  how: {
    title: "How it works",
    intro: "A simple seller workflow from source photo to reviewed asset.",
    steps: [
      { title: "Upload a product photo", text: "Start with a real image of clothing, shoes, bags, jewelry, or another product." },
      { title: "Choose a mode", text: "On-model clothing, exact product card, creative scene, or background removal." },
      { title: "Create a photo or video", text: "Demo mode lets you explore the interface safely without charges." },
      { title: "Review and download", text: "Check color, shape, pattern, edges, and important details before publishing." },
    ],
  },
  features: {
    title: "Features",
    intro: "The roadmap is visible, so unreleased items are not presented as production-ready.",
    items: [
      { title: "Clothing on AI model", text: "Try-on workflow for adult commercial fashion imagery.", status: "available" },
      { title: "Exact product card", text: "Product shot controls for background, size, and product preservation.", status: "available" },
      { title: "Creative scene", text: "Background mood for social posts, ads, and storefront visuals.", status: "demo available" },
      { title: "Background removal / replacement", text: "Clean cutouts and transparent PNG preparation.", status: "available" },
      { title: "Video from photo", text: "Short product clips from a single image.", status: "in development" },
      { title: "Reels / Stories", text: "Vertical 9:16 social assets.", status: "in development" },
      { title: "Prompt enhance", text: "Prompt improvement for generation tasks.", status: "in development" },
      { title: "Asset history", text: "Save assets and reuse previous files.", status: "in development" },
      { title: "Manual quality review", text: "Checklist helps avoid publishing distorted products.", status: "available" },
    ],
  },
  audiences: {
    title: "Built for",
    intro: "For lean teams that need clear product visuals without a full studio process.",
    items: [
      "marketplace sellers",
      "clothing sellers",
      "jewelry sellers",
      "suppliers",
      "showrooms",
      "Instagram shops",
      "online stores",
      "marketplace managers",
      "photographers / content managers",
      "small ecommerce teams",
    ],
  },
  platforms: {
    title: "Works for",
    intro: "Prepare images for listings, catalogs, social commerce, and storefronts.",
    disclaimer:
      "Vitrina AI Studio is an independent tool and is not an official partner of the listed platforms.",
  },
  trust: {
    title: "Trust and safety",
    items: [
      "AI can make mistakes: review every product manually.",
      "Generation price should be shown before launch when pricing is enabled.",
      "Demo mode has no charges.",
      "Real generation uses AI services through the server.",
      "The service does not promise marketplace acceptance or guaranteed sales growth.",
    ],
  },
  modes: {
    title: "Demo and real AI mode",
    demo: "Demo mode is safe: it shows the interface without charging money.",
    real: "Real AI mode uses AI providers and may spend funds when enabled.",
  },
  finalCta: {
    title: "Try Vitrina AI Studio",
    text: "Open the studio, upload a product photo, and test the workflow with demo assets.",
    button: "Open studio",
  },
};

const kkLanding: LandingCopy = {
  translationStatus: "published",
  nav: {
    features: "Мүмкіндіктер",
    audiences: "Кімге",
    platforms: "Платформалар",
    blog: "Блог",
    studio: "Студия",
    openStudio: "Студияны ашу",
  },
  hero: {
    badge: "Vitrina AI Studio",
    headline: "Kaspi және маркетплейстерге арналған AI тауар фото студиясы",
    subtitle:
      "Киімді AI модельде көрсету, нақты тауар карточкасы, фон, Reels және қысқа видео — бір фотодан. Kaspi, Wildberries, Ozon сатушылары мен Instagram дүкендері үшін.",
    primaryCta: "Студияны ашу",
    secondaryCta: "Мүмкіндіктерді көру",
  },
  cards: [
    { title: "Киім модельде", text: "Көйлек, костюм немесе іш киімді ересек AI модельде көрсету." },
    { title: "Тауар карточкасы", text: "Таза product shot, фон және детальдарды тексеру." },
    { title: "Фото және видео", text: "Бір исходниктен фон, қысқа клип және әлеуметтік желілерге нұсқалар." },
  ],
  how: {
    title: "Қалай жұмыс істейді",
    intro: "Сатушы үшін қарапайым жол: түпнұсқадан тексерілген файлыға.",
    steps: [
      { title: "Фото жүктеу", text: "Киім, аяқ киім, сөмке, әшекей немесе басқа тауардың нақты суреті." },
      { title: "Режим таңдау", text: "Киім модельде, нақты карточка, креативті сцена немесе фонды алу." },
      { title: "Фото немесе видео", text: "Демо-режим интерфейсті ақша алмай көрсетеді." },
      { title: "Тексеру және жүктеу", text: "Жарияламас бұрын түс, пішін, өрнек, краяларды салыстырыңыз." },
    ],
  },
  features: {
    title: "Мүмкіндіктер",
    intro: "Жол картасы көрінеді — шықпаған функциялар production-ready деп көрсетілмейді.",
    items: [
      { title: "Киім AI модельде", text: "Ересек коммерциялық каталог үшін виртуалды примерка.", status: "қолжетімді" },
      { title: "Нақты карточка", text: "Фон, өлшем және тауарды сақтау.", status: "қолжетімді" },
      { title: "Креативті сцена", text: "Әлеуметтік желілер мен жарнама үшін фон.", status: "демода" },
      { title: "Фонды алу / ауыстыру", text: "Таза вырезка және PNG.", status: "қолжетімді" },
      { title: "Фото → видео", text: "Қысқа клип.", status: "әзірленуде" },
      { title: "Reels / Stories", text: "9:16 вертикаль.", status: "әзірленуде" },
      { title: "Промпт күшейту", text: "Сипаттаманы жақсарту.", status: "әзірленуде" },
      { title: "Файл тарихы", text: "Сақтау және қайта пайдалану.", status: "әзірленуде" },
      { title: "Қолмен сапа тексеруі", text: "Тізім қате кадрды жарияламауға көмектеседі.", status: "қолжетімді" },
    ],
  },
  audiences: {
    title: "Кімге арналған",
    intro: "Студиясыз жылдам тауар визуалы қажет шағын командаларға.",
    items: [
      "маркетплейс сатушылары",
      "Kaspi дүкендері",
      "киім сатушылары",
      "әшекей сатушылары",
      "жеткізушілер",
      "шоурумдар",
      "Instagram дүкендері",
      "интернет-дүкендер",
      "контент-менеджерлер",
      "шағын ecommerce командалары",
    ],
  },
  platforms: {
    title: "Платформалар",
    intro: "Карточка, каталог, әлеуметтік сауда және витрина үшін сурет.",
    disclaimer:
      "Vitrina AI Studio тәуелсіз құрал — тізімделген платформалардың ресми серіктесі емес.",
  },
  trust: {
    title: "Сенім және қауіпсіздік",
    items: [
      "AI қателесе алады: әр тауарды қолмен тексеріңіз.",
      "Баға генерация алдында көрсетілуі керек (қосылғанда).",
      "Демо-режимде төлем жоқ.",
      "Real AI сервер арқылы AI-провайдерлерді қолданады.",
      "Маркетплейс қабылдауын немесе сатылым өсімін уәде етпейді.",
    ],
  },
  modes: {
    title: "Демо және real AI",
    demo: "Демо қауіпсіз: интерфейсті ақша алмай көрсетеді.",
    real: "Real AI режимі қосылғанда төлем болуы мүмкін.",
  },
  finalCta: {
    title: "Vitrina AI Studio сынаңыз",
    text: "Студияны ашып, фото жүктеп, демо workflow-ды тексеріңіз.",
    button: "Студияны ашу",
  },
};

const fallbackByLocale: Partial<Record<Locale, Partial<LandingCopy>>> = {
  ar: {
    translationStatus: "needs_review",
    nav: { ...enLanding.nav, openStudio: "افتح الاستوديو", studio: "الاستوديو" },
    hero: {
      ...enLanding.hero,
      headline: "استوديو AI لصور وفيديوهات المنتجات للمتاجر",
      primaryCta: "افتح الاستوديو",
      secondaryCta: "شاهد الإمكانات",
    },
  },
  zh: {
    translationStatus: "needs_review",
    hero: {
      ...enLanding.hero,
      headline: "面向电商平台的 AI 商品照片和视频工作室",
    },
  },
};

const fallbackStatus: Partial<Record<Locale, TranslationStatus>> = {
  ky: "needs_review",
  uz: "needs_review",
  tg: "needs_review",
  tr: "needs_review",
  az: "needs_review",
  es: "needs_review",
  pt: "needs_review",
  fr: "needs_review",
  de: "needs_review",
  it: "needs_review",
  pl: "needs_review",
  uk: "needs_review",
  hi: "needs_review",
  id: "needs_review",
  vi: "needs_review",
};

export function getLandingCopy(locale: Locale): LandingCopy {
  if (locale === "ru") return ruLanding;
  if (locale === "en") return enLanding;
  if (locale === "kk") return kkLanding;

  return {
    ...enLanding,
    translationStatus: fallbackStatus[locale] ?? "needs_review",
    ...(fallbackByLocale[locale] ?? {}),
  };
}

export const localeTranslationStatus = Object.fromEntries(
  ([
    "ru",
    "en",
    "kk",
    "ky",
    "uz",
    "tg",
    "tr",
    "az",
    "ar",
    "es",
    "pt",
    "fr",
    "de",
    "it",
    "pl",
    "uk",
    "hi",
    "id",
    "vi",
    "zh",
  ] as Locale[]).map((locale) => [locale, getLandingCopy(locale).translationStatus])
) as Record<Locale, TranslationStatus>;
