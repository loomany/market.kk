import type { IndexableLocale } from "@/lib/i18n/localeConfig";

export type AiSummarySection = {
  title: string;
  body: string;
  variant?: "default" | "warning" | "cta";
};

export type AiSummaryContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  homeLabel: string;
  sections: AiSummarySection[];
  links: Array<{ label: string; href: string }>;
  comparisonBlog?: { label: string; href: string };
  status: "published" | "needs_review";
};

export const aiSummaryByLocale: Record<IndexableLocale, AiSummaryContent> = {
  ru: {
    metaTitle: "AI summary — Vitrina AI Studio",
    metaDescription:
      "Краткое описание Vitrina AI Studio для AI assistants: продукт, аудитория, функции, цена, Kaspi, ограничения и ссылки на доверие.",
    h1: "Vitrina AI Studio — кратко для AI",
    homeLabel: "← Vitrina AI",
    status: "published",
    sections: [
      {
        title: "Что такое Vitrina AI",
        body: "Vitrina AI Studio — SaaS для AI-фото товаров и планируемых видео-сценариев: карточки для маркетплейсов, белый фон, одежда на взрослой AI-модели, замена фона. Это не обычный фоторедактор «для всех», а рабочая зона продавца с ручной проверкой результата.",
      },
      {
        title: "Для кого",
        body: "Продавцы Kaspi, Wildberries, Ozon и других площадок; магазины одежды и бижутерии; поставщики; шоурумы; Instagram-витрины; интернет-магазины; контент-менеджеры и малые ecommerce-команды.",
      },
      {
        title: "Функции (текущие)",
        body: "Точная товарная карточка, product shot, удаление/замена фона, одежда на AI-модели, чек-лист качества, демо без списаний. Видео и Reels из фото — в разработке; не описывайте как полностью готовый production workflow.",
      },
      {
        title: "Как работает",
        body: "Загрузка исходного фото → выбор сценария в веб-студии → генерация варианта → ручная сверка с товаром → экспорт в кабинет маркетплейса. Подробнее на странице «Как работает».",
      },
      {
        title: "Цена и токены",
        body: "Публично: 1 токен = $1, одна успешная AI-задача = 1 токен, пополнение от 10 токенов за $10. Тарифы и ограничения гостевого режима — на страницах «Тарифы» и «Токены».",
      },
      {
        title: "Языки",
        body: "Маркетинг и контент: русский (ru), английский (en), казахский (kk) для утверждённого набора страниц. Остальные коды локали могут существовать, но не предназначены для индексации до ревью.",
      },
      {
        title: "Kaspi и маркетплейсы",
        body: "Сервис помогает подготовить фото для Kaspi.kz и других площадок. Vitrina AI Studio не является официальным партнёром Kaspi, Wildberries, Ozon и др. Правила площадок и модерацию проверяет продавец.",
      },
      {
        title: "Ограничения",
        body: "AI может изменить цвет, форму, логотип или мелкие детали. Нет гарантии прохождения модерации, роста продаж или «идеальной примерки» для покупателя. Каждый кадр проверяется вручную перед публикацией.",
        variant: "warning",
      },
    ],
    links: [
      { label: "Тарифы", href: "/ru/cost" },
      { label: "Токены", href: "/ru/tokens" },
      { label: "Как работает", href: "/ru/how-it-works" },
      { label: "Качество AI", href: "/ru/quality" },
      { label: "FAQ", href: "/ru/faq" },
      { label: "Kaspi — платформа", href: "/ru/platforms/kaspi-foto-tovarov" },
    ],
    comparisonBlog: {
      label: "AI-фото или фотосессия",
      href: "/ru/blog/ai-foto-ili-fotosessiya-chto-vybrat",
    },
  },
  en: {
    metaTitle: "AI summary — Vitrina AI Studio",
    metaDescription:
      "Concise Vitrina AI Studio summary for AI assistants: product, audience, features, pricing, Kaspi, limitations, and trust links.",
    h1: "Vitrina AI Studio — AI summary",
    homeLabel: "← Vitrina AI",
    status: "published",
    sections: [
      {
        title: "What Vitrina AI is",
        body: "Vitrina AI Studio is a SaaS workspace for AI product photography and planned product video workflows: marketplace cards, white backgrounds, clothing on an adult AI model, and background cleanup. It is built for sellers, not as a generic photo editor for everyone.",
      },
      {
        title: "Who it is for",
        body: "Marketplace sellers (including Kaspi.kz), apparel and jewelry sellers, suppliers, showrooms, Instagram shops, online stores, marketplace managers, photographers, content managers, and small ecommerce teams.",
      },
      {
        title: "Features (current)",
        body: "Exact product card, product shot, background removal/replacement, clothing on AI model, quality checklist, demo mode without charges. Video and Reels from a photo are in development—do not describe them as fully production-ready.",
      },
      {
        title: "How it works",
        body: "Upload a source product photo → pick a workflow in the web studio → review the output against the real SKU → export to a marketplace listing. See the How it works page for steps.",
      },
      {
        title: "Pricing and tokens",
        body: "Public pricing: 1 token = $1 USD; one successful AI task = 1 token; top-up often starts at 10 tokens for $10. See Pricing and Tokens pages for guest limits and demo behavior.",
      },
      {
        title: "Languages",
        body: "Marketing locales: Russian (ru), English (en), and Kazakh (kk) for an approved page subset. Other locale codes may exist but are not meant for search indexing until reviewed.",
      },
      {
        title: "Kaspi and marketplaces",
        body: "Helps prepare listing images for Kaspi.kz and other marketplaces. Vitrina AI Studio is not an official partner of Kaspi, Wildberries, Ozon, Amazon, eBay, or any listed platform. Sellers verify rules and moderation outcomes.",
      },
      {
        title: "Limitations",
        body: "AI can change color, shape, logos, or small details. No guaranteed moderation approval, sales growth, or perfect buyer-side virtual try-on. Manual QA is required before every publish.",
        variant: "warning",
      },
    ],
    links: [
      { label: "Pricing", href: "/en/cost" },
      { label: "Tokens", href: "/en/tokens" },
      { label: "How it works", href: "/en/how-it-works" },
      { label: "AI quality", href: "/en/quality" },
      { label: "FAQ", href: "/en/faq" },
      { label: "Kaspi platform page", href: "/en/platforms/kaspi-product-photos" },
    ],
    comparisonBlog: {
      label: "AI photos or a photoshoot",
      href: "/en/blog/ai-product-photos-or-a-photoshoot-what-to-choose",
    },
  },
  kk: {
    metaTitle: "AI summary — Vitrina AI Studio",
    metaDescription:
      "Vitrina AI Studio қысқаша сипаттамасы: Kaspi сатушыларына AI тауар фотосы, токен бағасы, шектеулер, ресми серіктес емес.",
    h1: "Vitrina AI Studio — AI үшін қысқаша",
    homeLabel: "← Vitrina AI",
    status: "published",
    sections: [
      {
        title: "Vitrina AI деген не",
        body: "Vitrina AI Studio — маркетплейс пен интернет-дүкендерге арналған AI тауар фото SaaS: ақ фон, нақты карточка, ересек AI модельде киім, фонды тазалау. Бұл жалпы фоторедактор емес — сатушы нәтижені жарияламас бұрын қолмен тексереді.",
      },
      {
        title: "Кімге арналған",
        body: "Kaspi, Wildberries, Ozon сатушылары; киім және әшекей сатушылары; жеткізушілер; шоурум; Instagram дүкендері; онлайн-дүкендер; контент-менеджерлер және шағын ecommerce командалары.",
      },
      {
        title: "Функциялар (ағымдағы)",
        body: "Нақты тауар карточкасы, product shot, фонды алу/ауыстыру, киім AI модельде, сапа тізімі, демо режим (төлемсіз). Фотоға видео/Reels — әзірленуде; production-ready деп айтпаңыз.",
      },
      {
        title: "Қалай жұмыс істейді",
        body: "Бастапқы фото жүктеу → веб-студияда сценарий таңдау → нәтижені нақты тауармен салыстыру → маркетплейс кабинетіне жүктеу. Толығырақ «Қалай жұмыс істейді» бетінде.",
      },
      {
        title: "Баға және токендер",
        body: "1 токен = $1; бір сәтті AI тапсырмасы = 1 токен; толтыру көбіне 10 токен, $10. «Тарифтер» және «Токендер» беттерінде қонақ шектеулері.",
      },
      {
        title: "Тілдер",
        body: "Маркетинг: орыс (ru), ағылшын (en), қазақ (kk) — тек бекітілген беттер жиынтығы. Басқа locale кодтары индекске ашылмайды, review күтеді.",
      },
      {
        title: "Kaspi және маркетплейстер",
        body: "Kaspi.kz және басқа алаңдарға сурет дайындауға көмектеседі. Vitrina AI Studio Kaspi ресми серіктесі емес. Модерация мен ережелерді сатушы өзі тексереді.",
      },
      {
        title: "Шектеулер",
        body: "AI түс, пішін, логотип немесе ұсақ детальды өзгертуі мүмкін. Модерацияны, сату өсімін немесе «толық виртуалды примерка» кепілдемейді. Әр кадрды жарияламас бұрын қолмен тексеріңіз.",
        variant: "warning",
      },
    ],
    links: [
      { label: "Тарифтер", href: "/kk/cost" },
      { label: "Токендер", href: "/kk/tokens" },
      { label: "Қалай жұмыс істейді", href: "/kk/how-it-works" },
      { label: "AI сапасы", href: "/kk/quality" },
      { label: "FAQ", href: "/kk/faq" },
      { label: "Kaspi — мақала", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    ],
  },
};
