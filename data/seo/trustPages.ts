import type { Locale, TranslationStatus } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import { getRouteSlug, type StaticRouteKey } from "@/lib/i18n/routeSlugs";
import type { StaticSeoPage } from "./staticPages";

type TrustSeed = {
  key: StaticRouteKey;
  ru: { title: string; h1: string; meta: string; intro: string };
  en: { title: string; h1: string; meta: string; intro: string };
  kk?: { title: string; h1: string; meta: string; intro: string };
  sectionsRu: Array<{ title: string; body: string }>;
  sectionsEn: Array<{ title: string; body: string }>;
  sectionsKk?: Array<{ title: string; body: string }>;
  faqRu: Array<{ question: string; answer: string }>;
  faqEn: Array<{ question: string; answer: string }>;
  faqKk?: Array<{ question: string; answer: string }>;
  linksRu: Array<{ label: string; href: string }>;
  linksEn: Array<{ label: string; href: string }>;
  linksKk?: Array<{ label: string; href: string }>;
};

const howItWorksSeed: TrustSeed = {
  key: "howItWorks",
  ru: {
    title: "Как работает Vitrina AI — Vitrina AI Studio",
    h1: "Как работает Vitrina AI",
    meta:
      "Пошаговый обзор Vitrina AI Studio: загрузка фото товара, выбор задачи, проверка результата и публикация на маркетплейсах.",
    intro:
      "Vitrina AI Studio помогает продавцам и маркетологам подготовить товарные фото: от карточки на белом фоне до одежды на AI-модели. Вы загружаете исходник, выбираете сценарий, проверяете результат и только потом публикуете.",
  },
  en: {
    title: "How Vitrina AI works — Vitrina AI Studio",
    h1: "How Vitrina AI works",
    meta:
      "Step-by-step overview of Vitrina AI Studio: upload a product photo, pick a workflow, review the output, and publish to marketplaces.",
    intro:
      "Vitrina AI Studio helps sellers and marketers prepare product visuals—from marketplace-ready cards to clothing on an AI model. You upload a source image, choose a workflow, review the result, and publish only after manual QA.",
  },
  kk: {
    title: "Vitrina AI қалай жұмыс істейді — Vitrina AI Studio",
    h1: "Vitrina AI қалай жұмыс істейді",
    meta:
      "Vitrina AI Studio workflow: тауар фотосын жүктеу, тапсырма таңдау, нәтижені тексеру және маркетплейске жариялау.",
    intro:
      "Vitrina AI Studio сатушыларға тауар фотосын дайындауға көмектеседі: ақ фон карточкасынан модельде киімге дейін. Бастапқы фото жүктеледі, сценарий таңдалады, нәтиже қолмен тексеріледі.",
  },
  sectionsRu: [
    {
      title: "Шаг 1. Загрузите фото товара",
      body: "Используйте чёткое фото без сильных бликов и обрезанных краёв. Для одежды на модели лучше подходит фронтальный ракурс; для back view нужен соответствующий ракурс товара.",
    },
    {
      title: "Шаг 2. Выберите задачу",
      body: "Доступные сценарии зависят от режима студии: товарная карточка, одежда на AI-модели, удаление или замена фона, улучшение фото. Видео и Reels описаны отдельно, если функция ещё в разработке.",
    },
    {
      title: "Шаг 3. Настройте стиль и формат",
      body: "Выберите ракурс, фон, пропорции кадра (1:1, 4:5, 9:16) под площадку. Для Kaspi, Wildberries и Ozon сверяйте актуальные требования к главному фото.",
    },
    {
      title: "Шаг 4. Проверьте результат",
      body: "Сравните цвет, форму, швы, принт, фурнитуру и логотипы с исходником. AI может изменить детали — финальную ответственность несёт продавец.",
    },
    {
      title: "Шаг 5. Используйте в карточке, рекламе или соцсетях",
      body: "Экспортируйте изображение в карточку товара, каталог, Instagram или рекламный креатив после проверки правил площадки.",
    },
    {
      title: "Для кого сервис",
      body: "Продавцы Kaspi и других маркетплейсов, интернет-магазины, контент-менеджеры, SMM и малый бизнес без собственной фотостудии.",
    },
    {
      title: "Что AI не гарантирует",
      body: "Идеальную копию товара, автоматическое прохождение модерации и официальный статус партнёра Kaspi, Wildberries или Ozon.",
    },
  ],
  sectionsEn: [
    {
      title: "Step 1. Upload a product photo",
      body: "Use a clear image without heavy glare or cropped edges. For on-model clothing, a front view works best; back views need a matching garment angle.",
    },
    {
      title: "Step 2. Choose a workflow",
      body: "Available tasks depend on studio mode: product cards, on-model clothing, background removal or replacement, and cleanup. Video/Reels are documented separately when still in development.",
    },
    {
      title: "Step 3. Set style and format",
      body: "Pick angle, background, and aspect ratio (1:1, 4:5, 9:16) for your channel. For Kaspi, Wildberries, and Ozon, verify current main-image rules.",
    },
    {
      title: "Step 4. Review the output",
      body: "Compare color, shape, seams, prints, hardware, and logos to the source. AI can alter details—sellers remain responsible for the final listing.",
    },
    {
      title: "Step 5. Publish to listings, ads, or social",
      body: "Export to a product card, catalog, Instagram, or ad creative after checking platform policies.",
    },
    {
      title: "Who it is for",
      body: "Kaspi and marketplace sellers, ecommerce stores, content managers, social teams, and small businesses without an in-house photo studio.",
    },
    {
      title: "What AI does not guarantee",
      body: "A perfect product replica, automatic moderation approval, or official marketplace partnership status.",
    },
  ],
  sectionsKk: [
    {
      title: "1-қадам. Тауар фотосын жүктеу",
      body: "Анық сурет қолданыңыз. Модельде киім үшін алдыңғы ракурс жақсырақ; артқы көрініс үшін сәйкес бұрыш керек.",
    },
    {
      title: "2-қадам. Тапсырманы таңдау",
      body: "Карточка, модельде киім, фон алу/ауыстыру, жақсарту. Видео/Reels жеке сипатталады, егер әзірленуде болса.",
    },
    {
      title: "3-қадам. Стиль мен формат",
      body: "Kaspi, Wildberries, Ozon ережелеріне сәйкес пропорция мен фонды таңдаңыз.",
    },
    {
      title: "4-қадам. Нәтижені тексеру",
      body: "Түс, пішін, логотиптер бастапқыға сәйкес пе — сатушы соңғы шешімді қабылдайды.",
    },
    {
      title: "5-қадам. Жариялау",
      body: "Карточка, каталог, жарнама немесе әлеуметтік желі — алдымен ережелерді оқыңыз.",
    },
    {
      title: "Кімге арналған",
      body: "Kaspi сатушылары, маркетплейс командалары, интернет-дүкендер, SMM.",
    },
    {
      title: "AI кепілдемейді",
      body: "Тауардың идеалды көшірмесі, автоматты модерация, ресми интеграция.",
    },
  ],
  faqRu: [
    {
      question: "Нужен ли профессиональный исходник?",
      answer: "Нет, но чем чище исходное фото, тем проще проверить результат. Избегайте сильного шума и закрытых деталей товара.",
    },
    {
      question: "Можно ли сразу публиковать без проверки?",
      answer: "Нет. Перед загрузкой на маркетплейс сравните товар, фон и формат с правилами площадки.",
    },
    {
      question: "Работает ли для одежды и белья?",
      answer: "Да, есть сценарии для взрослого коммерческого каталога. Сложные ткани и кружево требуют более внимательной проверки.",
    },
    {
      question: "Есть ли бесплатный режим?",
      answer: "Демо-режим позволяет изучить интерфейс без списаний. Real AI mode может быть платным.",
    },
    {
      question: "Где открыть студию?",
      answer: "Нажмите «Открыть студию» на сайте — вы перейдёте в рабочую зону подготовки контента.",
    },
  ],
  faqEn: [
    {
      question: "Do I need a professional source photo?",
      answer: "No, but cleaner inputs make review easier. Avoid heavy noise and details hidden by hands or props.",
    },
    {
      question: "Can I publish without review?",
      answer: "No. Compare the product, background, and format to platform rules before uploading.",
    },
    {
      question: "Does it work for clothing and lingerie?",
      answer: "Yes, for adult commercial catalog workflows. Lace and fine details need extra QA.",
    },
    {
      question: "Is there a free mode?",
      answer: "Demo mode lets you explore the UI without charges. Real AI mode may be paid.",
    },
    {
      question: "Where do I open the studio?",
      answer: "Use the Open Studio button on the site to enter the product content workspace.",
    },
  ],
  faqKk: [
    {
      question: "Кәсіби фото керек пе?",
      answer: "Міндетті емес, бірақ таза бастапқы нәтижені тексеруді жеңілдетеді.",
    },
    {
      question: "Тексерусіз жариялауға бола ма?",
      answer: "Жоқ. Маркетплейс ережелерін алдымен салыстырыңыз.",
    },
    {
      question: "Киім және іш киім жұмыс істей ме?",
      answer: "Иә, ересек каталог стилі. Күрделі детальдарды қатаң тексеріңіз.",
    },
    {
      question: "Тегін режим бар ма?",
      answer: "Демо-режим бар. Real AI режимі ақылы болуы мүмкін.",
    },
    {
      question: "Студияны қайдан ашамын?",
      answer: "Сайттағы «Студияны ашу» батырмасын басыңыз.",
    },
  ],
  linksRu: [
    { label: "Качество и ограничения AI", href: "/ru/quality" },
    { label: "FAQ", href: "/ru/faq" },
    { label: "Тарифы", href: "/ru/cost" },
    { label: "Фото для Kaspi", href: "/ru/blog/foto-tovarov-dlya-kaspi" },
  ],
  linksEn: [
    { label: "AI quality and limits", href: "/en/quality" },
    { label: "FAQ", href: "/en/faq" },
    { label: "Pricing", href: "/en/cost" },
    { label: "Kaspi product photos", href: "/en/blog/product-photos-for-kaspi" },
  ],
  linksKk: [
    { label: "Сапа және AI шектеулері", href: "/kk/quality" },
    { label: "FAQ", href: "/kk/faq" },
    { label: "Тарифтер", href: "/kk/cost" },
    { label: "Kaspi тауар фотосы", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
  ],
};

const qualitySeed: TrustSeed = {
  key: "quality",
  ru: {
    title: "Качество AI-фото и ограничения — Vitrina AI Studio",
    h1: "Качество AI-фото и ограничения",
    meta:
      "Честные ограничения AI-фото товаров: проверка перед публикацией, сложные ткани, маркетплейсы и что Vitrina AI не обещает.",
    intro:
      "AI ускоряет подготовку товарного визуала, но не заменяет ответственность продавца. Эта страница описывает типичные ошибки, чеклист качества и границы сервиса.",
  },
  en: {
    title: "AI photo quality and limitations — Vitrina AI Studio",
    h1: "AI photo quality and limitations",
    meta:
      "Honest limits of AI product photos: pre-publish review, tricky fabrics, marketplace rules, and what Vitrina AI does not promise.",
    intro:
      "AI speeds up product visual prep but does not remove seller responsibility. This page covers common failure modes, a quality checklist, and service boundaries.",
  },
  kk: {
    title: "AI фото сапасы және шектеулер — Vitrina AI Studio",
    h1: "AI фото сапасы және шектеулер",
    meta:
      "AI тауар фотосының шектеулері, жарияламас бұрын тексеру, Kaspi/marketplace ережелері.",
    intro:
      "AI контентті жеделдетеді, бірақ сатушының жауапкершілігін алмайды. Бетте қателер, тексеру тізімі және сервис шекаралары бар.",
  },
  sectionsRu: [
    {
      title: "Как AI может ошибаться",
      body: "Модель может изменить оттенок, форму, принт, швы, камни, логотипы или добавить лишние детали. Особенно рискованы сложное бельё, кружево, мелкая фурнитура и тёмные ткани.",
    },
    {
      title: "Проверка перед публикацией",
      body: "Сверьте результат с исходником на мониторе, при сомнении — с коллегой. Зафиксируйте причины отклонений, чтобы улучшить исходные фото или настройки сценария.",
    },
    {
      title: "Как получить лучший результат",
      body: "Загружайте чистое фото, не закрывайте товар руками, выбирайте правильный ракурс (front/back), подходящую задачу в студии и проверяйте края после удаления фона.",
    },
    {
      title: "Маркетплейсы",
      body: "Требования Kaspi, Wildberries, Ozon и других площадок меняются. Vitrina AI не гарантирует принятие модерацией и не является официальным партнёром этих сервисов.",
    },
    {
      title: "Что мы не обещаем",
      body: "100% идентичную копию товара, автоматическое одобрение карточки, юридическую гарантию продаж или замену профессиональной фотосессии во всех категориях.",
    },
    {
      title: "Бельё и adult-only контент",
      body: "Допустим только взрослый коммерческий каталог без сексуализации несовершеннолетних. Соблюдайте правила площадки и локальное законодательство.",
    },
  ],
  sectionsEn: [
    {
      title: "How AI can fail",
      body: "Outputs may shift hue, shape, prints, seams, stones, logos, or add unwanted details. Risk is higher for lace lingerie, fine jewelry, and dark fabrics.",
    },
    {
      title: "Review before publishing",
      body: "Compare to the source on a calibrated screen; get a second opinion on disputed SKUs. Log rejection reasons to improve inputs or studio settings.",
    },
    {
      title: "How to improve results",
      body: "Upload clean photos, avoid covering the product, match front/back angles, pick the right studio task, and inspect edges after background removal.",
    },
    {
      title: "Marketplaces",
      body: "Kaspi, Wildberries, Ozon, and other rules change. Vitrina AI does not guarantee moderation approval or official partnership status.",
    },
    {
      title: "What we do not promise",
      body: "A perfect replica, automatic listing approval, legal sales guarantees, or replacing pro photography in every category.",
    },
    {
      title: "Lingerie and adult-only use",
      body: "Only adult commercial catalog style is allowed. Follow platform policies and local law.",
    },
  ],
  sectionsKk: [
    {
      title: "AI қателіктері",
      body: "Түс, пішін, принт, тігіс өзгеруі мүмкін. Күрделі іш киім және әшекейде қатаң QA керек.",
    },
    {
      title: "Жарияламас бұрын",
      body: "Бастапқымен салыстырыңыз. Kaspi ережелерін сатушы өзі тексереді.",
    },
    {
      title: "Жақсы нәтиже",
      body: "Таза фото, дұрыс ракурс, дұрыс студия тапсырмасы.",
    },
    {
      title: "Маркетплейстер",
      body: "Ресми серіктестік жоқ; модерация кепілдемейді.",
    },
    {
      title: "Уәде етпейміз",
      body: "100% дәл көшірме, автоматты модерация.",
    },
    {
      title: "Іш киім",
      body: "Тек ересек каталог; заң мен ережелерді сақтаңыз.",
    },
  ],
  faqRu: [
    {
      question: "Почему AI изменил цвет товара?",
      answer: "Освещение и сжатие исходника влияют на модель. Попробуйте другой исходник или сценарий и обязательно проверьте swatch/эталон.",
    },
    {
      question: "Можно ли использовать для Kaspi?",
      answer: "Сервис помогает подготовить изображение, но не гарантирует модерацию Kaspi. Правила проверяет продавец.",
    },
    {
      question: "Что делать, если результат не похож на товар?",
      answer: "Не публикуйте. Измените исходное фото, упростите фон или выберите другой режим. При необходимости повторите генерацию.",
    },
  ],
  faqEn: [
    {
      question: "Why did AI change product color?",
      answer: "Lighting and compression matter. Try a new source or workflow and compare against a color reference.",
    },
    {
      question: "Can I use outputs on Kaspi?",
      answer: "The studio helps prepare images but does not guarantee Kaspi moderation. Sellers must verify rules.",
    },
    {
      question: "What if the output does not match the product?",
      answer: "Do not publish. Adjust the source, simplify the background, or switch modes; regenerate if needed.",
    },
  ],
  faqKk: [
    {
      question: "Түс неге өзгерді?",
      answer: "Жарықтану мен сығу әсер етеді. Басқа бастапқы немесе режим қолданыңыз.",
    },
    {
      question: "Kaspi үшін бола ма?",
      answer: "Сурет дайындауға көмектеседі, модерацияны кепілдемейді.",
    },
    {
      question: "Тауарға ұқсамаса?",
      answer: "Жарияламаңыз. Бастапқыны немесе режимді өзгертіңіз.",
    },
  ],
  linksRu: [
    { label: "Как работает сервис", href: "/ru/how-it-works" },
    { label: "FAQ", href: "/ru/faq" },
    { label: "Открыть студию", href: "/studio" },
  ],
  linksEn: [
    { label: "How it works", href: "/en/how-it-works" },
    { label: "FAQ", href: "/en/faq" },
    { label: "Open studio", href: "/studio" },
  ],
  linksKk: [
    { label: "Қалай жұмыс істейді", href: "/kk/how-it-works" },
    { label: "FAQ", href: "/kk/faq" },
  ],
};

const faqSeed: TrustSeed = {
  key: "faq",
  ru: {
    title: "FAQ Vitrina AI — Vitrina AI Studio",
    h1: "Частые вопросы",
    meta:
      "Ответы о Vitrina AI Studio: фото товара на модели, Kaspi, Wildberries, Ozon, фон, бельё, видео, цены и проверка AI-результата.",
    intro:
      "Сводка популярных вопросов продавцов и маркетологов. Подробные гайды — в блоге и на страницах сценариев.",
  },
  en: {
    title: "Vitrina AI FAQ — Vitrina AI Studio",
    h1: "Frequently asked questions",
    meta:
      "FAQ about Vitrina AI Studio: on-model photos, Kaspi, Wildberries, Ozon, backgrounds, lingerie, video, pricing, and AI review.",
    intro:
      "Quick answers for sellers and marketers. Deeper guides live in the blog and use-case pages.",
  },
  kk: {
    title: "Vitrina AI FAQ — Vitrina AI Studio",
    h1: "Жиі қойылатын сұрақтар",
    meta:
      "Vitrina AI Studio FAQ: модельде фото, Kaspi, фон, іш киім, баға, AI тексеру.",
    intro:
      "Сатушыларға жауаптар. Толық нұсқаулықтар блогта.",
  },
  sectionsRu: [
    {
      title: "Что такое Vitrina AI?",
      body: "Онлайн-студия для подготовки товарных фото и визуала: карточки, фон, одежда на AI-модели, с ручной проверкой перед публикацией.",
    },
    {
      title: "Сколько стоит?",
      body: "Демо-режим без списаний. Платные тарифы и цены за генерацию публикуются на странице «Тарифы» до запуска billing.",
    },
  ],
  sectionsEn: [
    {
      title: "What is Vitrina AI?",
      body: "An online studio for product visuals—cards, backgrounds, on-model clothing—with manual review before publishing.",
    },
    {
      title: "How much does it cost?",
      body: "Demo mode has no charges. Paid plans are described on the pricing page before billing goes live.",
    },
  ],
  sectionsKk: [
    {
      title: "Vitrina AI деген не?",
      body: "Тауар фотосын дайындау студиясы — карточка, фон, модельде киім.",
    },
    {
      title: "Қанша тұрады?",
      body: "Демо тегін. Тарифтер /kk/cost бетінде.",
    },
  ],
  faqRu: [
    {
      question: "Что такое Vitrina AI?",
      answer:
        "Сервис для подготовки товарных фото и визуала с AI: карточка, фон, одежда на модели, с обязательной ручной проверкой.",
    },
    {
      question: "Как сделать фото товара на модели?",
      answer:
        "Загрузите фото одежды в студию, выберите сценарий «одежда на AI-модели», проверьте посадку и детали. Подробнее — в блоге и на странице сценария.",
    },
    {
      question: "Можно ли использовать для Kaspi?",
      answer:
        "Да, для подготовки изображений карточки, но модерацию Kaspi сервис не гарантирует. Проверьте актуальные правила площадки.",
    },
    {
      question: "Можно ли для Wildberries и Ozon?",
      answer:
        "Да, для подготовки визуала под типовые требования. Финальную проверку делает продавец.",
    },
    {
      question: "Работает ли с бельём?",
      answer:
        "Есть adult-only сценарий каталога. Сложные ткани требуют дополнительной проверки; запрещён контент с несовершеннолетними.",
    },
    {
      question: "Можно ли удалить или заменить фон?",
      answer: "Да, через сценарии очистки и замены фона. Проверьте края и цвет товара после обработки.",
    },
    {
      question: "Можно ли сделать видео из фото?",
      answer:
        "Видео workflow описан на сайте; часть функций может быть в разработке. Не обещайте клиентам готовое видео, пока режим не включён в продукте.",
    },
    {
      question: "Нужно ли проверять результат?",
      answer: "Да, всегда. AI может изменить товар; ответственность за публикацию — у продавца.",
    },
    {
      question: "Сколько стоит?",
      answer: "Смотрите страницу «Тарифы». В демо-режиме списаний нет.",
    },
    {
      question: "Можно ли использовать фото в рекламе?",
      answer:
        "Если у вас есть права на исходник и результат прошёл проверку — да. Соблюдайте правила рекламной площадки.",
    },
    {
      question: "Что делать, если результат не похож на товар?",
      answer: "Не публикуйте. Измените исходник или настройки, при необходимости сгенерируйте снова.",
    },
    {
      question: "Какие фото лучше загружать?",
      answer: "Чёткие, без сильных бликов, с видимыми краями товара и без лишних предметов в кадре.",
    },
    {
      question: "Есть ли гарантия идеального результата?",
      answer: "Нет. Сервис помогает ускорить подготовку, но не гарантирует идеальную копию товара.",
    },
    {
      question: "Можно ли открыть Studio сразу?",
      answer: "Да, нажмите «Открыть студию» — откроется рабочая зона (демо или real AI в зависимости от настроек).",
    },
  ],
  faqEn: [
    {
      question: "What is Vitrina AI?",
      answer:
        "A studio for AI-assisted product visuals—cards, backgrounds, on-model clothing—with required manual review.",
    },
    {
      question: "How do I put clothing on a model?",
      answer:
        "Upload a garment photo, pick the on-model workflow, and review fit and details. See the blog and use-case page for steps.",
    },
    {
      question: "Can I use it for Kaspi?",
      answer:
        "Yes, to prepare listing images. Kaspi moderation is not guaranteed—verify current rules.",
    },
    {
      question: "Wildberries and Ozon?",
      answer: "Yes, for visual prep aligned with common requirements. Sellers perform final QA.",
    },
    {
      question: "Does it support lingerie?",
      answer: "Adult catalog workflows exist. Lace and fine details need extra review; minors are prohibited.",
    },
    {
      question: "Can I remove or replace backgrounds?",
      answer: "Yes, via cleanup and background workflows. Inspect edges and product color after processing.",
    },
    {
      question: "Can I make video from a photo?",
      answer:
        "Video workflows are documented on-site; some features may still be in development. Do not promise shipped video until enabled.",
    },
    {
      question: "Must I review outputs?",
      answer: "Always. AI can alter the product; sellers are responsible for publishing.",
    },
    {
      question: "How much does it cost?",
      answer: "See the pricing page. Demo mode has no charges.",
    },
    {
      question: "Can I use images in ads?",
      answer: "If you have rights to source and output and QA passed—yes. Follow ad platform policies.",
    },
    {
      question: "What if the product looks wrong?",
      answer: "Do not publish. Change the source or settings and regenerate if needed.",
    },
    {
      question: "What source photos work best?",
      answer: "Clear shots without heavy glare, visible product edges, and minimal clutter.",
    },
    {
      question: "Is a perfect result guaranteed?",
      answer: "No. The service speeds up prep but does not guarantee a perfect replica.",
    },
    {
      question: "Can I open the studio now?",
      answer: "Yes—use Open Studio to enter the workspace (demo or real AI depending on configuration).",
    },
  ],
  faqKk: [
    {
      question: "Vitrina AI деген не?",
      answer: "Тауар фотосын AI көмегімен дайындау студиясы.",
    },
    {
      question: "Модельде фото қалай жасауға болады?",
      answer: "Киім фотосын жүктеп, сценарий таңдаңыз, нәтижені тексеріңіз.",
    },
    {
      question: "Kaspi үшін бола ма?",
      answer: "Иә, бірақ модерацияны кепілдемейді.",
    },
    {
      question: "Wildberries/Ozon?",
      answer: "Визуал дайындауға болады; соңғы тексеру сатушыда.",
    },
    {
      question: "Іш киім?",
      answer: "Ересек каталог; күрделі детальдарды QA арқылы бақылаңыз.",
    },
    {
      question: "Фонды алу/ауыстыру?",
      answer: "Иә, краяларды тексеріңіз.",
    },
    {
      question: "Видео?",
      answer: "Кейбір функциялар әзірленуде болуы мүмкін.",
    },
    {
      question: "Тексеру керек пе?",
      answer: "Әрқашан.",
    },
    {
      question: "Баға?",
      answer: "/kk/cost бетіне қараңыз.",
    },
    {
      question: "Жарнамада пайдалану?",
      answer: "Құқықтар мен QA болған жағдайда — иә.",
    },
    {
      question: "Тауар ұқсамаса?",
      answer: "Жарияламаңыз.",
    },
    {
      question: "Қай фото жақсы?",
      answer: "Анық, артық затсыз.",
    },
    {
      question: "Идеал кепілдік бар ма?",
      answer: "Жоқ.",
    },
    {
      question: "Студияны ашу?",
      answer: "«Студияны ашу» батырмасын басыңыз.",
    },
  ],
  linksRu: [
    { label: "Как работает", href: "/ru/how-it-works" },
    { label: "Качество AI", href: "/ru/quality" },
    { label: "Тарифы", href: "/ru/cost" },
    { label: "Блог", href: "/ru/blog" },
  ],
  linksEn: [
    { label: "How it works", href: "/en/how-it-works" },
    { label: "Quality", href: "/en/quality" },
    { label: "Pricing", href: "/en/cost" },
    { label: "Blog", href: "/en/blog" },
  ],
  linksKk: [
    { label: "Қалай жұмыс істейді", href: "/kk/how-it-works" },
    { label: "Сапа", href: "/kk/quality" },
    { label: "Тарифтер", href: "/kk/cost" },
  ],
};

function createTrustPage(seed: TrustSeed): StaticSeoPage {
  return {
    key: seed.key,
    kind: "trust",
    indexPolicy: "index",
    content: Object.fromEntries(
      supportedLocaleCodes.map((locale) => {
        if (locale === "ru") {
          return [
            locale,
            {
              slug: getRouteSlug(locale, seed.key),
              title: seed.ru.title,
              metaDescription: seed.ru.meta,
              h1: seed.ru.h1,
              intro: seed.ru.intro,
              sections: seed.sectionsRu,
              faq: seed.faqRu,
              relatedLinks: seed.linksRu,
              status: "published" as TranslationStatus,
            },
          ];
        }
        if (locale === "en") {
          return [
            locale,
            {
              slug: getRouteSlug(locale, seed.key),
              title: seed.en.title,
              metaDescription: seed.en.meta,
              h1: seed.en.h1,
              intro: seed.en.intro,
              sections: seed.sectionsEn,
              faq: seed.faqEn,
              relatedLinks: seed.linksEn,
              status: "published" as TranslationStatus,
            },
          ];
        }
        if (locale === "kk" && seed.kk && seed.sectionsKk && seed.faqKk) {
          return [
            locale,
            {
              slug: getRouteSlug(locale, seed.key),
              title: seed.kk.title,
              metaDescription: seed.kk.meta,
              h1: seed.kk.h1,
              intro: seed.kk.intro,
              sections: seed.sectionsKk,
              faq: seed.faqKk,
              relatedLinks: seed.linksKk ?? seed.linksRu,
              status: "ready_for_review" as TranslationStatus,
            },
          ];
        }
        return [
          locale,
          {
            slug: getRouteSlug(locale, seed.key),
            title: seed.en.title,
            metaDescription: seed.en.meta,
            h1: seed.en.h1,
            intro: seed.en.intro,
            sections: seed.sectionsEn,
            faq: seed.faqEn,
            relatedLinks: seed.linksEn,
            status: "needs_review" as TranslationStatus,
          },
        ];
      })
    ) as StaticSeoPage["content"],
  };
}

export const trustStaticPages: StaticSeoPage[] = [
  createTrustPage(howItWorksSeed),
  createTrustPage(qualitySeed),
  createTrustPage(faqSeed),
];
