/**
 * Generates Wave 2 articles for topics 7,9,10,19,20,29,34-36,49,55,60,61,63,67,75,77,94,96.
 */
import {
  DISCLAIMER_EN,
  DISCLAIMER_RU,
  EN_UC,
  PUBLISHED_EN_BLOG as PE,
  PUBLISHED_RU_BLOG as PR,
  RU_UC,
  VIDEO_NOTE_EN,
  VIDEO_NOTE_RU,
  faqEn,
  faqRu,
  p,
  sec,
  topicId,
} from "./wave2-blog-stage11-lib.mjs";

const QUALITY_RU = { label: "Качество AI", href: "/ru/quality" };
const QUALITY_EN = { label: "AI quality", href: "/en/quality" };
const HOW_RU = { label: "Как работает", href: "/ru/how-it-works" };
const HOW_EN = { label: "How it works", href: "/en/how-it-works" };
const STUDIO_RU = { label: "Открыть студию", href: "/studio" };
const STUDIO_EN = { label: "Open studio", href: "/studio" };
const COST_RU = { label: "Стоимость", href: "/ru/cost" };
const COST_EN = { label: "Pricing", href: "/en/cost" };

function four(loc, lines) {
  const disclaimer = loc === "en" ? DISCLAIMER_EN : DISCLAIMER_RU;
  const out = [];
  const chunk = loc === "ru" ? 5 : 4;
  for (let i = 0; i < lines.length; i += chunk) {
    out.push(p(...lines.slice(i, i + chunk)));
  }
  while (out.length < 4) out.push(p(disclaimer));
  return out.slice(0, 4);
}

function buildSections(loc, titles, blocks) {
  return titles.map((title, i) => {
    const lines = blocks[i] ?? blocks[blocks.length - 1];
    const paras = four(loc, lines);
    return sec(title, ...paras);
  });
}

function mkRu(cfg) {
  return {
    title: cfg.ruTitle,
    metaDescription: cfg.ruMeta,
    intro: p(...cfg.ruIntro, DISCLAIMER_RU),
    shortAnswer: p(...cfg.ruShort, VIDEO_NOTE_RU),
    sections: buildSections("ru", cfg.ruSectionTitles, cfg.ruBlocks),
    checklist: cfg.ruChecklist,
    faq: faqRu([
      ...(cfg.ruFaqExtra ?? []),
      {
        question: "Стоит ли публиковать без проверки на большом экране?",
        answer:
          "Нет. На телефоне не видны ореолы, сдвиг оттенка и мелкие детали — сравнивайте с исходником на мониторе или планшете перед загрузкой в кабинет.",
      },
    ]),
    internalLinks: [STUDIO_RU, COST_RU, ...cfg.ruLinks],
  };
}

function mkEn(cfg) {
  return {
    title: cfg.enTitle,
    metaDescription: cfg.enMeta,
    intro: p(...cfg.enIntro, DISCLAIMER_EN),
    shortAnswer: p(...cfg.enShort, VIDEO_NOTE_EN),
    sections: buildSections("en", cfg.enSectionTitles, cfg.enBlocks),
    checklist: cfg.enChecklist,
    faq: faqEn([
      ...(cfg.enFaqExtra ?? []),
      {
        question: "Can I publish without checking on a large screen?",
        answer:
          "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload.",
      },
    ]),
    internalLinks: [STUDIO_EN, COST_EN, ...cfg.enLinks],
  };
}

const QA_RU = [
  "Сравните AI-кадр с исходником на мониторе: форма, цвет, узор, фурнитура, этикетки и комплект должны совпадать с тем, что уйдёт покупателю.",
  "Отклоните вариант, если деталь «поплыла» — перегенерация дешевле возврата и негативного отзыва.",
  "Проверьте края вырезания, тени и отражения — ореолы и обрезанные элементы часто не видны на превью телефона.",
  "Сверьтесь с актуальными правилами кабинета маркетплейса: Vitrina AI не гарантирует модерацию и не является официальным партнёром площадок.",
];

const QA_EN = [
  "Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships.",
  "Reject variants where details drift—regeneration is cheaper than a return or angry review.",
  "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews.",
  "Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
];

const WORKFLOW_RU = [
  "Зафиксируйте роли: кто снимает исходник, кто выбирает режим в Studio, кто утверждает экспорт и кто грузит в кабинет.",
  "Ведите таблицу SKU с датой проверки — так проще найти ошибку при претензии покупателя.",
  "Пилот на 5–10 SKU одной категории перед массовой генерацией снижает риск системной ошибки на весь каталог.",
  "Не используйте чужие фото без прав; храните оригинал рядом с AI-версией.",
];

const WORKFLOW_EN = [
  "Assign roles: shooter, Studio mode picker, export approver, and marketplace uploader.",
  "Track SKU, review date, and approver in a sheet—buyer disputes are easier to resolve.",
  "Pilot 5–10 SKUs in one category before batch runs to avoid catalog-wide drift.",
  "Do not use third-party photos without rights; keep originals beside AI exports.",
];

/** @type {Array<Record<string, unknown>>} */
const TOPICS = [
  {
    n: 7,
    ruTitle:
      "Ошибки в товарных фото, которые снижают продажи: чеклист продавца маркетплейса",
    enTitle: "Product Photo Mistakes That Hurt Sales: A Marketplace Seller Checklist",
    ruMeta:
      "Типичные ошибки в карточках Kaspi, WB и Ozon: свет, фон, цвет, комплект и AI-артефакты. Как исправить без гарантий модерации.",
    enMeta:
      "Common listing photo mistakes on marketplaces: light, background, color, kit mismatch, and AI artifacts—fixes without moderation guarantees.",
    ruIntro: [
      "Покупатель на маркетплейсе решает за секунды: доверять ли карточке.",
      "Ошибки в фото не всегда видны продавцу на маленьком экране, но бьют по конверсии и возвратам.",
      "Ниже — практический разбор типичных промахов и как их ловить до публикации, в том числе после AI-обработки.",
    ],
    enIntro: [
      "Buyers decide in seconds whether to trust a listing thumbnail.",
      "Photo mistakes are not always obvious to sellers on a phone, but they hit conversion and returns.",
      "Below is a practical breakdown of common failures and how to catch them before publish—including after AI processing.",
    ],
    ruShort: [
      "Главные ошибки: неверный цвет, скрытый комплект, плохой свет, чужие объекты в кадре и публикация AI без проверки.",
      "Исправление начинается с исходника и чеклиста QA, а не с более «красивого» фона.",
    ],
    enShort: [
      "Top failures: wrong color, hidden kit items, bad light, clutter, and publishing AI without review.",
      "Fix the source and QA checklist first—not only a prettier background.",
      "Vitrina AI Studio is an independent tool and does not guarantee marketplace approval.",
    ],
    ruSectionTitles: [
      "Ошибка 1: цвет и оттенок не совпадают с товаром",
      "Ошибка 2: комплект и комплектация вводят в заблуждение",
      "Ошибка 3: свет, тени и «грязный» фон",
      "Ошибка 4: лишние предметы и чужие логотипы",
      "Ошибка 5: слепая вера первому AI-варианту",
      "Как встроить проверку в процесс",
    ],
    enSectionTitles: [
      "Mistake 1: color and hue do not match the product",
      "Mistake 2: kit and contents mislead buyers",
      "Mistake 3: light, shadows, and messy backgrounds",
      "Mistake 4: clutter and third-party logos",
      "Mistake 5: trusting the first AI preview",
      "Bake review into your workflow",
    ],
    ruBlocks: [
      [
        "Жёлтый на фото и серый в посылке — классическая причина возврата с формулировкой «не тот цвет».",
        "AI усиливает риск: модель может сдвинуть оттенок металла, ткани или пластика.",
        "Сравнивайте кадр с образцом на складе при дневном свете, не только с памятью.",
        "Сохраните пару «до/после» в папке SKU — при споре с покупателем это быстрее, чем спорить с платформой.",
        "Если сомневаетесь в оттенке — снимите эталон рядом с товаром на нейтральном фоне, без фильтров телефона.",
        ...QA_RU,
      ],
      [
        "На main image один предмет, в описании — набор из трёх: покупатель чувствует обман.",
        "Покажите весь комплект или явно укажите, что продаётся поштучно.",
        "Для AI не просите сцену, которая «добавляет» аксессуары, которых нет в коробке.",
        "Галерея должна повторять ту же комплектацию, что в названии и на складе — иначе растут негативные отзывы.",
        "Для наборов сделайте отдельный кадр «всё в кадре» и крупный план ключевой детали.",
        ...WORKFLOW_RU,
      ],
      [
        "Жёсткая вспышка даёт блики и глубокие тени — AI «дорисует» детали, которых нет.",
        "Ровный рассеянный свет и однотонный фон в исходнике снижают артефакты.",
        "См. гайд по улучшению фото без фотографа и белому фону в блоге.",
        "Постоянный угол съёмки важнее дорогой камеры: серия SKU должна выглядеть одной командой.",
        "Не публикуйте кадр, если тень создаёт иллюзию другого размера или скрытой подставки.",
        ...QA_RU,
      ],
      [
        "Упаковка другого бренда, вешалка с чужим логотипом, случайный кабель в кадре — риск модерации.",
        "Перед съёмкой очистите зону; после AI проверьте, что ничего лишнего не появилось на фоне.",
        "Статья про удаление лишних предметов дополняет этот чеклист.",
        "Чужие водяные знаки и скриншоты из чужих карточек — отдельный риск блокировки, не только отклонения одного SKU.",
        "Маркетплейс сравнивает визуал с отзывами: лишний бренд на фоне читается как перепродажа чужого товара.",
        ...WORKFLOW_RU,
      ],
      [
        "Первый превью в Studio часто выглядит «достаточно хорошо» на телефоне — на мониторе видны искажения.",
        "Генерируйте 2–3 варианта, выбирайте консервативный режим точной карточки для маркетплейса.",
        "См. проверку AI-фото перед публикацией и сохранение товара в AI.",
        "Выборочно проверяйте каждый пятый SKU после пакетной генерации — так ловят системные ошибки.",
        "Регенерация дешевле возврата с формулировкой «не тот товар на фото».",
        ...QA_RU,
      ],
      [
        "Назначьте утверждающего; стажёр не публикует спорные кадры без второй пары глаз.",
        "Раз в месяц анализируйте возвраты с текстом «не соответствует фото».",
        "Свяжите процесс со страницами «Как работает» и «Качество AI».",
        "Честная карточка важнее глянца; Vitrina AI не партнёр Kaspi, WB, Ozon.",
        "Видео и Reels из фото — в разработке; не обещайте ролик, пока функция недоступна в вашей версии студии.",
        "Документируйте чеклист в таблице: съёмка → Studio → QA → загрузка — так ошибки не повторяются на сотнях SKU.",
      ],
    ],
    enBlocks: [
      [
        "Yellow on screen and gray in the box drives “wrong color” returns.",
        "AI increases drift: models may shift metal, fabric, or plastic hue.",
        "Compare to a warehouse sample in daylight, not memory alone.",
        "Archive before/after pairs per SKU—buyer disputes resolve faster than platform arguments.",
        "When hue is disputed, reshoot a reference frame beside the unit with no phone filters.",
        ...QA_EN,
      ],
      [
        "One item on the main image and a three-piece kit in copy feels deceptive.",
        "Show the full kit or state clearly that you sell a single unit.",
        "Do not prompt scenes that invent accessories not in the box.",
        "Gallery slides must repeat the same kit as title and warehouse—otherwise reviews turn negative.",
        "For bundles, add an “everything in frame” shot plus a key-detail macro.",
        ...WORKFLOW_EN,
      ],
      [
        "Hard flash creates glare and deep shadows—AI may invent missing detail.",
        "Diffused light and a plain source background reduce artifacts.",
        "See improve-without-photographer and white-background guides.",
        "A fixed shoot angle matters more than an expensive camera—series should look like one team.",
        "Reject frames where shadows imply a different size or hidden stand.",
        ...QA_EN,
      ],
      [
        "Other-brand packaging, foreign logos, random cables—moderation risk.",
        "Clear the set before capture; after AI, confirm nothing new appeared.",
        "Pair with removing unwanted objects from product photos.",
        "Foreign watermarks and competitor screenshots risk account issues, not only one SKU rejection.",
        "Buyers compare visuals to reviews—a stray brand in background reads as reselling someone else’s item.",
        ...WORKFLOW_EN,
      ],
      [
        "First Studio preview often looks “fine” on a phone—defects show on a monitor.",
        "Generate 2–3 variants; prefer exact product card for marketplaces.",
        "See review-before-publish and preserve-product articles.",
        "Spot-check every fifth SKU after batch runs to catch systematic drift.",
        "Regeneration is cheaper than a “item not as pictured” return cluster.",
        ...QA_EN,
      ],
      [
        "Name an approver; juniors should not publish disputed frames alone.",
        "Monthly review returns tagged “not as pictured.”",
        "Link to How it works and AI quality pages.",
        "Honest listings beat gloss; Vitrina AI is not a Kaspi/WB/Ozon partner.",
        "Video and Reels-from-photo are in development—do not promise video until your Studio version supports it.",
        "Document the checklist: shoot → Studio → QA → upload so errors do not repeat across hundreds of SKUs.",
      ],
    ],
    ruChecklist: [
      "цвет на фото = цвет на складе",
      "комплект на фото = описание",
      "нет чужих логотипов",
      "AI сверен с исходником",
      "правила площадки проверены",
    ],
    enChecklist: [
      "on-screen color matches warehouse",
      "photo kit matches copy",
      "no third-party logos",
      "AI compared to source",
      "marketplace rules checked",
    ],
    ruLinks: [
      { label: "Проверка AI-фото", href: PR.b008 },
      { label: "Белый фон", href: PR.b003 },
      { label: "Улучшить без фотографа", href: PR.b004 },
      QUALITY_RU,
      HOW_RU,
    ],
    enLinks: [
      { label: "Review AI photos", href: PE.b008 },
      { label: "White background", href: PE.b003 },
      { label: "Improve without photographer", href: PE.b004 },
      QUALITY_EN,
      HOW_EN,
    ],
  },
  // Additional topics use shared block patterns with topic-specific openers
];

function pushTopic(n, ruTitle, enTitle, ruMeta, enMeta, ruIntro, enIntro, ruShort, enShort, ruSections, enSections, openerRu, openerEn, ruLinks, enLinks, extra = {}) {
  const ruBlocks = ruSections.map((title, i) => [
    openerRu[i] ?? openerRu[0],
    "Это влияет на доверие к магазину сильнее, чем разовая скидка: покупатель сравнивает превью с отзывами и соседними карточками.",
    "Исправление начинается с исходника и режима в Studio: точная карточка или белый фон консервативнее lifestyle для main image.",
    "Планируйте контент-пакет: main, деталь фактуры, при необходимости кадр для соцсетей — везде один SKU, цвет и комплект без сюрпризов в посылке.",
    "Обучите менеджера маркетплейса базовому QA: дизайнер не должен быть единственным, кто видит искажения перед загрузкой в кабинет.",
    "Для Kaspi, Wildberries и Ozon проверяйте миниатюру на телефоне — так покупатель принимает решение в приложении.",
    ...QA_RU,
  ]);
  const enBlocks = enSections.map((title, i) => [
    openerEn[i] ?? openerEn[0],
    "Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings.",
    "Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images.",
    "Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
    "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload.",
    "On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app.",
    ...QA_EN,
  ]);
  TOPICS.push({
    n,
    ruTitle,
    enTitle,
    ruMeta,
    enMeta,
    ruIntro,
    enIntro,
    ruShort,
    enShort,
    ruSectionTitles: ruSections,
    enSectionTitles: enSections,
    ruBlocks,
    enBlocks,
    ruChecklist: extra.ruChecklist ?? [
      "исходник резкий",
      "товар не изменён AI",
      "фон не вводит в заблуждение",
      "правила площадки сверены",
      "нет ложных обещаний в тексте",
    ],
    enChecklist: extra.enChecklist ?? [
      "sharp source",
      "product unchanged by AI",
      "background not misleading",
      "platform rules checked",
      "copy matches visuals",
    ],
    ruLinks,
    enLinks,
    ruFaqExtra: extra.ruFaqExtra,
    enFaqExtra: extra.enFaqExtra,
  });
}

pushTopic(
  9,
  "Почему AI меняет товар и как этого избежать: практика для карточек маркетплейса",
  "Why AI Changes a Product Image and How to Reduce It",
  "Почему AI искажает форму, цвет и детали товара и как снизить риск: исходник, режим Studio, ручная проверка. Без гарантий модерации.",
  "Why AI drifts shape, color, and details—and how to reduce risk with source photos, Studio modes, and manual review. No moderation guarantees.",
  [
    "AI не «видит» ваш склад — он интерпретирует пиксели.",
    "Иногда интерпретация меняет то, что покупатель получит в посылке.",
    "Разберём причины искажений и рабочие приёмы снижения риска для Kaspi, Wildberries, Ozon и других площадок.",
  ],
  [
    "AI does not see your warehouse—it interprets pixels.",
    "Sometimes that interpretation changes what buyers receive.",
    "Here are causes of drift and practical ways to reduce risk for Kaspi, Wildberries, Ozon, and other channels.",
  ],
  [
    "Снижайте креативность режима, улучшайте исходник и всегда сравнивайте экспорт с оригиналом на большом экране.",
    "Нет способа дать 100% гарантию неизменности товара — только процесс контроля.",
  ],
  [
    "Use conservative modes, better sources, and always compare exports to originals on a large screen.",
    "There is no 100% guarantee of zero change—only a control process.",
  ],
  [
    "Причины: плохой свет и шум в исходнике",
    "Причины: перекрытия и сложные края",
    "Причины: агрессивный lifestyle-промпт",
    "Режимы Studio с меньшим риском",
    "Чеклист сравнения до/после",
    "Когда лучше отказаться от AI-кадра",
  ],
  [
    "Causes: bad light and noise in the source",
    "Causes: overlap and complex edges",
    "Causes: aggressive lifestyle prompts",
    "Lower-risk Studio modes",
    "Before/after comparison checklist",
    "When to skip the AI frame",
  ],
  [
    "Размытый или тёмный исходник заставляет модель «додумывать» фактуру и контуры — отсюда другая форма пряжки или узора.",
    "Перекрывающиеся рукава, кабели поверх корпуса, прозрачная упаковка с бликами — края ломаются при вырезании.",
    "Lifestyle-сцена с богатым промптом чаще меняет товар сильнее, чем точная карточка или белый фон.",
    "Точная карточка и нейтральный фон — старт для маркетплейса; креатив оставьте для доп. слайдов после QA.",
    "Сверяйте швы, логотипы, камни, этикетки; сохраняйте скрин до/после в папке SKU.",
    "Если после трёх попыток деталь всё ещё неверна — публикуйте исходник или переснимите, не «подгоняйте» AI.",
  ],
  [
    "Blurry or dark sources make the model invent texture and edges—buckles and patterns drift.",
    "Overlapping sleeves, cables on housings, glare on clear packs—cutout edges break.",
    "Rich lifestyle prompts change the product more than exact card or white background modes.",
    "Start marketplaces on exact card or neutral background; save creative scenes for extra slides after QA.",
    "Match stitches, logos, stones, labels; archive before/after screenshots per SKU.",
    "If three tries still fail the detail, publish the source or reshoot—do not force AI.",
  ],
  [
    { label: "Сохранить товар в AI", href: PR.b098 },
    { label: "Проверка перед публикацией", href: PR.b008 },
    { label: "Точная карточка", href: RU_UC.exact },
    QUALITY_RU,
    HOW_RU,
  ],
  [
    { label: "Preserve the product", href: PE.b098 },
    { label: "Review before publishing", href: PE.b008 },
    { label: "Exact product card", href: EN_UC.exact },
    QUALITY_EN,
    HOW_EN,
  ]
);

pushTopic(
  10,
  "Как сохранить цвет и форму товара в AI-фото: режимы, свет и контроль",
  "How to Preserve Product Color and Shape in AI Photos",
  "Как удержать цвет и форму в AI-фото: свет, исходник, консервативные режимы Studio и QA. Без гарантий 100% точности и модерации.",
  "Preserve color and shape in AI product photos: lighting, source capture, conservative Studio modes, and QA—without 100% accuracy guarantees.",
  [
    "Покупатель маркетплейса покупает не «картинку», а конкретный SKU.",
    "Если AI сдвинул оттенок или сузил силуэт, растут возвраты даже при хорошем CTR.",
    "Ниже — пошаговый подход: от съёмки до экспорта с ручной проверкой.",
  ],
  [
    "Marketplace buyers purchase a SKU, not an abstract image.",
    "If AI shifts hue or narrows silhouette, returns rise even with strong CTR.",
    "Below is a step-by-step approach from capture to export with manual review.",
  ],
  [
    "Снимайте при ровном свете, используйте точную карточку или белый фон, сравнивайте на большом экране.",
    "Сервис не гарантирует идеальное совпадение — ответственность за публикацию у продавца.",
  ],
  [
    "Shoot in even light, use exact card or white background, compare on a large monitor.",
    "The service does not guarantee perfect match—sellers own publication decisions.",
  ],
  ["Свет и баланс белого в исходнике", "Кадрирование и масштаб", "Выбор режима в Studio", "Два-три варианта, не один", "Проверка на складе", "Документирование SKU"],
  ["Light and white balance", "Framing and scale", "Choosing a Studio mode", "Two or three variants", "Warehouse check", "SKU documentation"],
  [
    "Снимайте при рассеянном дневном свете или двух мягких источниках; избегайте жёлтой лампы, которая смещает оттенок кожи товара и ткани.",
    "Товар должен занимать большую часть кадра без сильной перспективы «сверху», искажающей пропорции.",
    "Режим точной карточки или белого фона обычно бережнее lifestyle для главного изображения.",
    "Сгенерируйте минимум два варианта; первый превью часто хуже второго при том же исходнике.",
    "Сверьте экспорт с образцом на полке: металл, пластик, принт, размер.",
    "Храните исходник и утверждённый AI-файл в одной папке SKU с датой проверки.",
  ],
  [
    "Use diffused daylight or two soft sources; avoid yellow bulbs that bias fabric and plastic hue.",
    "Let the product fill most of the frame without extreme top-down perspective that skews proportions.",
    "Exact product card or white background modes are usually gentler than lifestyle for the main image.",
    "Generate at least two variants—the first preview is often worse than the second on the same source.",
    "Match the export to a shelf sample: metal, plastic, print, size.",
    "Store source and approved AI files in one SKU folder with review date.",
  ],
  [
    { label: "Сохранить товар", href: PR.b098 },
    { label: "Белый фон", href: PR.b003 },
    { label: "Карточка из фото", href: PR.b005 },
    QUALITY_RU,
    { label: "Точная карточка", href: RU_UC.exact },
  ],
  [
    { label: "Preserve product", href: PE.b098 },
    { label: "White background", href: PE.b003 },
    { label: "Card from photo", href: PE.b005 },
    QUALITY_EN,
    { label: "Exact product card", href: EN_UC.exact },
  ]
);

// Fashion 19, 20
pushTopic(
  19,
  "Как сделать каталог одежды без фотосессии: AI-модель, flatlay и честный QA",
  "How to Create a Clothing Catalog Without a Photoshoot",
  "Каталог одежды без студии: flatlay, AI-модель, единый стиль для WB и Shopify. Ограничения и ручная проверка посадки.",
  "Clothing catalog without a studio: flatlay, AI model, unified style for Wildberries and Shopify—with fit QA and honest limits.",
  [
    "Съёмка каждой вещи на модели дорога и медленная.",
    "Для среднего сегмента и длинного хвоста SKU AI и flatlay дают единый визуальный ряд быстрее.",
    "Но посадка, длина и цвет должны совпадать с реальным изделием — иначе возвраты съедят экономию.",
  ],
  [
    "Per-garment model shoots are expensive and slow.",
    "For mid-range and long-tail SKUs, AI and flatlay unify catalog style faster.",
    "Fit, length, and color must still match the real piece—or returns erase savings.",
  ],
  [
    "Комбинируйте flatlay для деталей ткани и AI-модель для каталога; проверяйте каждый экспорт.",
    "Vitrina AI не заменяет примерку покупателем и не гарантирует модерацию.",
  ],
  [
    "Combine flatlay for fabric detail and AI model for catalog rows; review every export.",
    "Vitrina AI does not replace buyer try-on or guarantee moderation.",
  ],
  ["План серии: пресет и ракурс", "Flatlay и детали", "Одежда на AI-модели", "Размерная сетка в тексте", "Wildberries vs Instagram", "Масштаб без ошибок"],
  ["Series plan: preset and angle", "Flatlay and details", "Clothing on AI model", "Size chart in copy", "Wildberries vs Instagram", "Scale without drift"],
  [
    "Зафиксируйте один фон, одну высоту камеры и расстояние — иначе каталог «прыгает».",
    "Flatlay показывает принт и фактуру; AI-модель — силуэт и длину — используйте оба.",
    "Проверяйте рукав, подол, вырез; отклоняйте кадры, где AI «худеет» или удлиняет изделие.",
    "В описании укажите рост модели и размер на ней; не обещайте посадку «как у всех».",
    "Для WB — нейтральная подача; для Instagram — креатив только если товар не меняется.",
    "Пакетная генерация с аудитом каждого 10-го SKU ловит системные ошибки.",
  ],
  [
    "Lock one background, camera height, and distance—or the catalog visually jumps.",
    "Flatlay shows print and texture; AI model shows silhouette and length—use both.",
    "Check sleeves, hem, neckline; reject frames where AI slims or lengthens the garment.",
    "State model height and worn size in copy; do not promise universal fit.",
    "Wildberries favors neutral presentation; Instagram creative only if the SKU stays identical.",
    "Batch runs need every-10th-SKU audits to catch systematic drift.",
  ],
  [
    { label: "Одежда на модели", href: PR.b011 },
    { label: "Перенос на AI-модель", href: PR.b012 },
    { label: "Фото для WB", href: PR.b032 },
    { label: "Одежда use case", href: RU_UC.cloth },
    COST_RU,
  ],
  [
    { label: "Clothing on model", href: PE.b011 },
    { label: "Place on AI model", href: PE.b012 },
    { label: "Wildberries photos", href: PE.b032 },
    { label: "Clothing use case", href: EN_UC.cloth },
    COST_EN,
  ]
);

pushTopic(
  20,
  "Как подготовить фото одежды для AI-примерки: исходник, свет и маска",
  "How to Prepare Clothing Photos for AI Try-On",
  "Подготовка фото одежды для AI-примерки: вешалка, flatlay, свет, без лишних складок. Проверка посадки перед публикацией.",
  "Prepare clothing photos for AI try-on: hanger, flatlay, lighting, minimal folds, and fit review before publishing.",
  [
    "Качество примерки на AI-модели начинается не в Studio, а в исходнике.",
    "Сложные складки, тени и посторонние предметы заставляют модель ошибаться в крое и цвете.",
    "Ниже — подготовка кадра для Kaspi, Wildberries, Ozon и Shopify без обещаний идеальной посадки.",
  ],
  [
    "AI try-on quality starts in the source capture, not only in Studio.",
    "Heavy folds, shadows, and clutter make the model guess wrong on cut and color.",
    "Below is prep for Kaspi, Wildberries, Ozon, and Shopify without promising perfect fit.",
  ],
  [
    "Снимайте на вешалке или flatlay при ровном свете; уберите перекрытия и чужие бирки.",
    "После генерации сравните длину, принт и цвет с реальной вещью.",
  ],
  [
    "Shoot on a hanger or flatlay in even light; remove overlaps and foreign tags.",
    "After generation, compare length, print, and color to the real garment.",
  ],
  ["Вешалка vs flatlay", "Свет без жёстких теней", "Маска и контур", "Выбор позы модели", "QA посадки", "Когда нужна живая съёмка"],
  ["Hanger vs flatlay", "Light without hard shadows", "Mask and contour", "Model pose choice", "Fit QA", "When to use a real shoot"],
  [
    "Вешалка даёт объём; flatlay — читаемый принт; для каталога часто нужны оба исходника.",
    "Два мягких источника с боков убирают провал в складках, где AI «рисует» лишнее.",
    "Контур должен быть читаемым: не закрывайте карманы и декор другими предметами.",
    "Нейтральная поза для маркетплейса; креатив — для соцсетей после отдельного QA.",
    "Сравните плечи, подол, пройму; отклоните кадр при изменении пропорций.",
    "Премиум-линии и сложный крой могут потребовать живой модели — AI не всегда достаточен.",
  ],
  [
    "Hangers show volume; flatlay shows print—catalogs often need both sources.",
    "Two soft side sources reduce fold pits where AI invents fabric.",
    "Keep contours readable—do not hide pockets or decor with props.",
    "Neutral poses for marketplaces; creative angles for social after separate QA.",
    "Compare shoulders, hem, armhole; reject proportion shifts.",
    "Premium lines or complex cut may still need live models—AI is not always enough.",
  ],
  [
    { label: "Перенос на модель", href: PR.b012 },
    { label: "Одежда на модели", href: PR.b011 },
    { label: "Бельё на модели", href: PR.b016 },
    { label: "Одежда use case", href: RU_UC.cloth },
    HOW_RU,
  ],
  [
    { label: "Place on AI model", href: PE.b012 },
    { label: "Clothing on model", href: PE.b011 },
    { label: "Lingerie on model", href: PE.b016 },
    { label: "Clothing use case", href: EN_UC.cloth },
    HOW_EN,
  ]
);

// 29 bags
pushTopic(
  29,
  "Как подготовить фото сумки для маркетплейса: форма, фурнитура и AI-фон",
  "How to Prepare Bag Photos for a Marketplace",
  "Фото сумки для Kaspi и Ozon: исходник, ручки, фурнитура, белый фон и проверка после AI. Без гарантий модерации.",
  "Bag photos for Kaspi and Ozon: source tips, handles, hardware, white background, and post-AI QA—no moderation guarantees.",
  [
    "Сумки и рюкзаки часто теряют форму и цвет на плохом исходнике.",
    "Покупатель оценивает объём, фурнитуру и текстуру кожи или ткани.",
    "AI помогает с фоном, но не должен «выпрямлять» модель другой формы.",
  ],
  [
    "Bags and backpacks lose shape and color on weak sources.",
    "Buyers judge volume, hardware, and leather or fabric texture.",
    "AI helps with backgrounds but must not reshape the item into another silhouette.",
  ],
  [
    "Снимайте с наполнителем лёгкой бумагой, покажите ручки и замки; проверьте после AI все углы.",
    "См. также гайды по Kaspi и точной карточке.",
  ],
  [
    "Shoot with light stuffing, show handles and zippers; after AI, verify every corner.",
    "Pair with Kaspi and exact product card guides.",
  ],
  ["Наполнитель и силуэт", "Свет на фурнитуре", "Фон и вырезание", "Галерея ракурсов", "Ozon и Kaspi", "Типичные ошибки AI"],
  ["Stuffing and silhouette", "Light on hardware", "Background and cutout", "Gallery angles", "Ozon and Kaspi", "Typical AI errors"],
  [
    "Лёгкий наполнитель сохраняет объём; пустая сумка выглядит мягче, чем в реальности.",
    "Блики на молниях и пряжках снимайте рассеянным светом — иначе AI меняет металл.",
    "Белый или светло-серый фон на main; детали фактуры — отдельный слайд.",
    "Фронт, профиль, внутри, масштаб с монетой или линейкой без обмана размера.",
    "Правила Kaspi и Ozon сверяйте в кабинете; Vitrina AI не партнёр площадок.",
    "AI может сузить ручки или изменить оттенок — сравнение с исходником обязательно.",
  ],
  [
    "Light stuffing keeps volume; empty bags look softer than reality.",
    "Diffuse hardware glare or AI shifts metal tone.",
    "White or light gray main; texture detail on an extra slide.",
    "Front, profile, interior, scale reference without deceiving size.",
    "Check Kaspi and Ozon seller help; Vitrina AI is not a platform partner.",
    "AI may narrow handles or shift hue—source comparison is mandatory.",
  ],
  [
    { label: "Kaspi", href: PR.b031 },
    { label: "Ozon", href: PR.b033 },
    { label: "Точная карточка", href: RU_UC.exact },
    { label: "Белый фон", href: PR.b003 },
    QUALITY_RU,
  ],
  [
    { label: "Kaspi", href: PE.b031 },
    { label: "Ozon", href: PE.b033 },
    { label: "Exact card", href: EN_UC.exact },
    { label: "White background", href: PE.b003 },
    QUALITY_EN,
  ]
);

// Platform topics 34,35,36
function platformTopic(n, platform, ruName, enName, ruSlug, enSlug) {
  pushTopic(
    n,
    `Фото товаров для ${ruName}: требования, AI-workflow и проверка`,
    `Product Photos for ${enName}: Requirements, AI Workflow, and Review`,
    `Фото для ${ruName}: подготовка карточек, белый фон, ручная проверка после AI. Vitrina AI — независимый сервис, не партнёр ${ruName}; без гарантий модерации.`,
    `Product photos for ${enName}: listing prep, white background, manual post-AI review. Vitrina AI is independent, not an official ${enName} partner—no moderation guarantee.`,
    [
      `Продавцы на ${ruName} конкурируют превью и доверием к визуалу.`,
      `Правила изображений меняются — сверяйтесь с актуальной справкой кабинета.`,
      `Vitrina AI Studio ускоряет подготовку, но не гарантирует модерацию.`,
    ],
    [
      `${enName} sellers compete on thumbnails and visual trust.`,
      `Image rules change—read current seller help.`,
      `Vitrina AI Studio speeds prep but does not guarantee approval.`,
    ],
    [
      `Снимите чёткий исходник, используйте белый фон или точную карточку, проверьте товар после AI.`,
      `Не публикуйте кадр, если цвет или комплект не совпадают с отправкой.`,
    ],
    [
      `Shoot a sharp source, use white background or exact card, verify the product after AI.`,
      `Do not publish if color or kit does not match what you ship.`,
    ],
    [
      `Что проверяет модерация ${ruName}`,
      "Исходник и свет",
      "Режимы Studio",
      "Галерея и форматы",
      "Международные отличия",
      "Чеклист перед загрузкой",
    ],
    [
      `What ${enName} reviewers look for`,
      "Source and light",
      "Studio modes",
      "Gallery and formats",
      "International nuances",
      "Pre-upload checklist",
    ],
    [
      `Главное изображение должно честно показывать SKU без лишнего текста и водяных знаков, если это запрещено правилами.`,
      `Ровный свет и нейтральный фон в исходнике снижают артефакты AI на краях.`,
      `Точная карточка подходит для консервативного main; lifestyle — для доп. слайдов после QA.`,
      `Сохраняйте мастер-файл; на ${ruName} загружайте версию по требованиям размера и пропорций.`,
      `Если продаёте и на Kaspi, и на ${ruName}, не копируйте файлы слепо — правила различаются.`,
      `Журнал отказов по SKU помогает команде учиться быстрее модерации.`,
    ],
    [
      `The main image must honestly show the SKU without banned text or watermarks per policy.`,
      `Even light and neutral source backgrounds reduce AI edge artifacts.`,
      `Exact card fits conservative mains; lifestyle belongs on extra slides after QA.`,
      `Keep a master file; upload ${enName}-sized exports per seller help.`,
      `Selling on Kaspi and ${enName} too? Do not blindly reuse files—rules differ.`,
      `Rejection logs by SKU speed up team learning.`,
    ],
    [
      { label: "Маркетплейс фото", href: PR.b002 },
      { label: "Белый фон", href: PR.b003 },
      { label: "Проверка AI", href: PR.b008 },
      QUALITY_RU,
      HOW_RU,
    ],
    [
      { label: "Marketplace photos", href: PE.b002 },
      { label: "White background", href: PE.b003 },
      { label: "Review AI", href: PE.b008 },
      QUALITY_EN,
      HOW_EN,
    ]
  );
}

platformTopic(34, "eBay", "eBay", "eBay");
platformTopic(35, "Amazon", "Amazon", "Amazon");
platformTopic(36, "Etsy", "Etsy", "Etsy");

// 49 Instagram
pushTopic(
  49,
  "Как подготовить фото товара для Instagram: форматы, честность SKU и AI",
  "How to Prepare Product Photos for Instagram",
  "Фото товара для Instagram Shop: форматы 1:1, 4:5, 9:16, AI-фон и ручная QA без гарантий модерации. Видео/Reels из фото — в разработке.",
  "Product photos for Instagram Shop: 1:1, 4:5, 9:16, AI backgrounds, manual QA—no moderation guarantee. Video/Reels from photo still in development.",
  [
    "Instagram ценит визуальный ритм ленты, но товар всё равно должен оставаться узнаваемым.",
    "Креативный фон допустим чаще, чем на Kaspi, yet mismatch drives DMs and returns.",
    "Ниже — подготовка статичных кадров; ролики из фото — отдельно и частично в разработке.",
  ],
  [
    "Instagram rewards feed rhythm, yet the SKU must stay recognizable.",
    "Creative backgrounds are more common than on Kaspi, but mismatch still hurts DMs and returns.",
    "Below focuses on stills; video-from-photo is separate and partly in development.",
  ],
  [
    "Сохраняйте мастер 1:1, кропируйте 4:5 и 9:16 без изменения товара.",
    "Проверяйте цвет на большом экране перед публикацией в Shop.",
  ],
  [
    "Keep a 1:1 master; crop 4:5 and 9:16 without changing the product.",
    "Review color on a large screen before Shop publish.",
  ],
  ["Форматы ленты и Shop", "Свет и стиль серии", "AI без смены товара", "Reels и видео", "Связка с маркетплейсом", "Чеклист публикации"],
  ["Feed and Shop formats", "Light and series style", "AI without product drift", "Reels and video", "Link to marketplaces", "Publish checklist"],
  [
    "1:1 — база; 4:5 — превью ленты; 9:16 — Stories/Reels, когда функция доступна.",
    "Единый пресет цвета фона в ленте не оправдывает разный оттенок одного SKU.",
    "Lifestyle в Studio только после проверки, что принт и форма не изменились.",
    "Reels из фото — в разработке; не обещайте ролик, пока нет в вашей версии Studio.",
    "Если тот же товар на Kaspi — main там часто строже; не путайте файлы.",
    "Хештеги и текст не заменяют честный кадр товара.",
  ],
  [
    "1:1 is the base; 4:5 for feed; 9:16 for Stories/Reels when supported.",
    "A unified feed palette does not excuse hue drift on one SKU.",
    "Studio lifestyle only after confirming print and shape are unchanged.",
    "Reels-from-photo is in development—do not promise video early.",
    "Same SKU on Kaspi? Main images are often stricter—do not mix files blindly.",
    "Captions never replace an honest product frame.",
  ],
  [
    { label: "Reels из фото", href: PR.b047 },
    { label: "Улучшить фото", href: PR.b004 },
    { label: "Замена фона", href: PR.b065 },
    QUALITY_RU,
    HOW_RU,
  ],
  [
    { label: "Reels from photo", href: PE.b047 },
    { label: "Improve photos", href: PE.b004 },
    { label: "Replace background", href: PE.b065 },
    QUALITY_EN,
    HOW_EN,
  ]
);

// 55 manager workflow
pushTopic(
  55,
  "Как менеджеру маркетплейса ускорить контент: процесс, роли и AI без хаоса",
  "How Marketplace Managers Can Speed Up Content",
  "Менеджеру маркетплейса: ускорение карточек через Studio, чеклисты, пакетный QA. Не гарантия модерации.",
  "Marketplace managers: faster listings with Studio, checklists, and batch QA—no moderation guarantee.",
  [
    "Менеджер каталога тонет в согласованиях: фото, тексты, модерация, возвраты.",
    "AI снимает рутину с фона, но без процесса превращает ошибки в массовые.",
    "Ниже — роли, SLA и контроль качества для Kaspi, WB, Ozon.",
  ],
  [
    "Catalog managers drown in coordination: photos, copy, moderation, returns.",
    "AI removes background busywork but without process it multiplies mistakes.",
    "Below: roles, SLAs, and QA for Kaspi, Wildberries, Ozon.",
  ],
  [
    "Разделите съёмку, генерацию, QA и загрузку; пилот на категории перед сезоном.",
    "Vitrina AI не партнёр площадок и не гарантирует приём карточек.",
  ],
  [
    "Split shoot, generate, QA, and upload; pilot per category before peak season.",
    "Vitrina AI is not a platform partner and does not guarantee acceptance.",
  ],
  ["Карта процесса", "Шаблоны чеклистов", "Пакетная генерация", "Журнал отказов", "Согласование с рекламой", "Метрики качества"],
  ["Process map", "Checklist templates", "Batch generation", "Rejection log", "Ad alignment", "Quality metrics"],
  [
    "От поставщика до live: исходник → Studio → QA → кабинет → пост-модерация.",
    "Один чеклист на категорию: одежда, электроника, украшения — разные риски.",
    "Лимитируйте пакеты по 20–30 SKU с выборочным аудитом каждого 5-го.",
    "Фиксируйте причину отклонения — часто это несоответствие, не «AI запрещён».",
    "Баннеры и main должны показывать один вариант товара.",
    "Считайте возвраты «не как на фото», не только скорость загрузки.",
  ],
  [
    "Supplier to live: source → Studio → QA → cabinet → post-moderation.",
    "One checklist per category—apparel, electronics, jewelry differ.",
    "Cap batches at 20–30 SKUs with every-5th audit.",
    "Log rejection reasons—often mismatch, not “AI banned.”",
    "Ads and main images must show the same variant.",
    "Track “not as pictured” returns, not only upload speed.",
  ],
  [
    { label: "Kaspi", href: PR.b031 },
    { label: "WB", href: PR.b032 },
    { label: "Проверка AI", href: PR.b008 },
    { label: "Каталог", href: RU_UC.catalog },
    HOW_RU,
  ],
  [
    { label: "Kaspi", href: PE.b031 },
    { label: "Wildberries", href: PE.b032 },
    { label: "Review AI", href: PE.b008 },
    { label: "Catalog", href: EN_UC.catalog },
    HOW_EN,
  ]
);

// 60, 61 comparison
pushTopic(
  60,
  "Когда AI-фото лучше фотосессии: экономика, скорость и честные границы",
  "When AI Product Photos Beat a Photoshoot",
  "Сравнение AI и фотосессии: скорость, стоимость, каталог. Когда AI уместен, когда нужен фотограф; без гарантий результата.",
  "AI vs photoshoot: speed, cost, catalog scale—when AI fits, when photographers win; no outcome guarantees.",
  [
    "Фотосессия даёт премиальный визуал, но не масштабируется на тысячи SKU.",
    "AI выигрывает на длинном хвоте, тестах ниш и выравнивании фона.",
    "Сравнение без магии: ручная проверка обязательна в обоих случаях.",
  ],
  [
    "Shoots deliver premium visuals but do not scale to thousands of SKUs.",
    "AI wins on long tail, niche tests, and background normalization.",
    "No magic—manual review is mandatory either way.",
  ],
  [
    "AI лучше при повторяемых карточках и ограниченном бюджете; съёмка — для hero-бренда.",
    "См. также статью AI или фотосессия в блоге.",
  ],
  [
    "AI fits repeatable cards and tight budgets; shoots fit hero brand lines.",
    "See also AI vs photoshoot in the blog.",
  ],
  ["Экономика SKU", "Скорость вывода", "Качество и риск", "Смешанная модель", "Команда", "Пилот перед сезоном"],
  ["SKU economics", "Launch speed", "Quality and risk", "Hybrid model", "Team", "Pre-season pilot"],
  [
    "Стоимость одного AI-кадра ниже, пока учитываете время QA, а не только кредиты.",
    "100 SKU за неделю с телефона реальны; 100 SKU в студии — редко без штата.",
    "Риск AI — системное искажение цвета; риск съёмки — человеческий фактор на сетах.",
    "Топ-20 SKU на фотографе, остальное в Studio — рабочая схема.",
    "Документируйте, кто утверждает экспорт.",
    "Пилот + метрики возвратов решают, расширять ли AI.",
  ],
  [
    "Per-frame AI cost is lower if you count QA time, not credits alone.",
    "100 SKUs per week from a phone is realistic; 100 studio SKUs need staff.",
    "AI risk is systemic color drift; shoot risk is human inconsistency on set.",
    "Top 20 on photographer, rest in Studio is a common hybrid.",
    "Document who approves exports.",
    "Pilot plus return metrics decide AI expansion.",
  ],
  [
    { label: "AI или фотосессия", href: PR.b074 },
    { label: "Без фотографа", href: PR.b004 },
    { label: "Каталог", href: RU_UC.catalog },
    COST_RU,
    QUALITY_RU,
  ],
  [
    { label: "AI vs shoot", href: PE.b074 },
    { label: "Without photographer", href: PE.b004 },
    { label: "Catalog", href: EN_UC.catalog },
    COST_EN,
    QUALITY_EN,
  ]
);

pushTopic(
  61,
  "Когда AI-фото не подходит: категории, риски и альтернативы",
  "When AI Product Photos Are Not a Fit",
  "Когда не стоит использовать AI для карточки: ювелирка, премиум, сложная электроника. Честные альтернативы.",
  "When to skip AI product photos: jewelry, premium lines, complex electronics—and honest alternatives.",
  [
    "AI не универсален.",
    "В ряде категорий искажение детали дороже, чем экономия на съёмке.",
    "Ниже — сигналы «стоп» и что делать вместо генерации.",
  ],
  [
    "AI is not universal.",
    "In some categories, detail drift costs more than shoot savings.",
    "Below are stop signals and alternatives.",
  ],
  [
    "При макро-ювелирке, юридически чувствительных обещаниях и hero-кампаниях — фотограф или исходник без AI.",
    "Если AI меняет товар после трёх попыток — публикуйте оригинал.",
  ],
  [
    "Macro jewelry, sensitive claims, and hero campaigns need photographers or non-AI sources.",
    "If AI still drifts after three tries, publish the original.",
  ],
  ["Категории высокого риска", "Юридические и этические границы", "Технические ограничения", "Когда достаточно исходника", "Смешанный каталог", "Коммуникация с командой"],
  ["High-risk categories", "Legal and ethical lines", "Technical limits", "When source is enough", "Mixed catalog", "Team communication"],
  [
    "Драгоценные камни, микроэлектроника, медицинские товары — усиленный контроль или отказ от AI.",
    "Не скрывайте дефекты и не меняйте комплект через промпт.",
    "Плохой исходник не лечится генерацией — переснимите.",
    "Честный снимок на сером фоне лучше идеального AI с неверным цветом.",
    "Маркировка внутренних SKU: «только исходник» vs «AI разрешён».",
    "Обучите закупку и склад, почему спешка с AI бьёт по рейтингу.",
  ],
  [
    "Gemstones, micro electronics, regulated goods—strict control or no AI.",
    "Do not hide defects or change kits via prompts.",
    "Weak sources are not fixed by generation—reshoot.",
    "Honest gray-background photo beats perfect AI wrong color.",
    "Tag SKUs internally: source-only vs AI-allowed.",
    "Teach buying and warehouse why rushed AI hurts ratings.",
  ],
  [
    { label: "Бижутерия", href: PR.b021 },
    { label: "Сохранить товар", href: PR.b098 },
    { label: "AI vs съёмка", href: PR.b074 },
    QUALITY_RU,
    HOW_RU,
  ],
  [
    { label: "Jewelry guide", href: PE.b021 },
    { label: "Preserve product", href: PE.b098 },
    { label: "AI vs shoot", href: PE.b074 },
    QUALITY_EN,
    HOW_EN,
  ]
);

// 63 QA quality
pushTopic(
  63,
  "Как проверять качество AI-карточек: чеклист менеджера и дизайнера",
  "How to Check the Quality of AI Product Cards",
  "QA AI-карточек: сравнение с исходником, края, цвет, комплект, модерация. Процесс для команд; Vitrina AI не гарантирует принятие площадкой.",
  "QA for AI product cards: source match, edges, color, kit, moderation—team workflow; Vitrina AI does not guarantee platform approval.",
  [
    "Качество — это не «нравится дизайнеру», а совпадение с товаром и правилами площадки.",
    "Единый чеклист снижает споры между маркетингом и маркетплейсом.",
    "Ниже — шаги для утверждения и отклонения кадров.",
  ],
  [
    "Quality is not “designer taste”—it is product match and platform compliance.",
    "One checklist reduces fights between marketing and marketplace ops.",
    "Below are approve/reject steps.",
  ],
  [
    "Два ревьюера на спорных SKU; архив до/после; связка со страницей качества AI.",
    "Нет 100% автоматической проверки точности.",
  ],
  [
    "Two reviewers on disputed SKUs; before/after archive; tie to AI quality page.",
    "No fully automatic accuracy guarantee.",
  ],
  ["Уровень 1: автоматические стопы", "Уровень 2: сравнение с исходником", "Уровень 3: края и тени", "Уровень 4: текст карточки", "Уровень 5: выборочный аудит", "Обучение команды"],
  ["Level 1: automatic stops", "Level 2: source match", "Level 3: edges and shadows", "Level 4: listing copy", "Level 5: spot audit", "Team training"],
  [
    "Стоп: водяные знаки, чужие логотипы, пустой кадр, явные артефакты.",
    "Сравнение формы, цвета, узора, фурнитуры на мониторе 100% zoom на краях.",
    "Тени естественные; нет ореолов; прозрачные элементы не обрезаны.",
    "Описание и комплект совпадают с кадром.",
    "Каждый 5–10 SKU в пакете — полный QA.",
    "Раз в квартал обновляйте чеклист по журналу возвратов.",
  ],
  [
    "Stop: watermarks, foreign logos, empty frame, obvious artifacts.",
    "Match shape, color, pattern, hardware at 100% edge zoom on a monitor.",
    "Natural shadows; no halos; transparent parts not clipped.",
    "Copy and kit match the frame.",
    "Every 5–10 batch SKUs get full QA.",
    "Refresh checklist quarterly from return logs.",
  ],
  [
    { label: "Проверка перед публикацией", href: PR.b008 },
    { label: "Сохранить товар", href: PR.b098 },
    QUALITY_RU,
    HOW_RU,
    { label: "Точная карточка", href: RU_UC.exact },
  ],
  [
    { label: "Review before publish", href: PE.b008 },
    { label: "Preserve product", href: PE.b098 },
    QUALITY_EN,
    HOW_EN,
    { label: "Exact card", href: EN_UC.exact },
  ]
);

// 67 unwanted objects
pushTopic(
  67,
  "Как убрать лишние предметы с фото товара: съёмка, AI и проверка краёв",
  "How to Remove Unwanted Objects from a Product Photo",
  "Удаление лишних предметов с фото товара: подготовка кадра, cleanup в Studio, QA. Товар не должен измениться.",
  "Remove unwanted objects from product photos: set prep, Studio cleanup, QA—the product must not change.",
  [
    "Случайный кабель, ценник с чужого магазина или вешалка конкурента в кадре — причина отклонения.",
    "AI помогает убрать шум, но может задеть край товара.",
    "Сначала очистите съёмку, потом генерируйте.",
  ],
  [
    "Stray cables, foreign price tags, or competitor hangers cause rejections.",
    "AI removes clutter but may nick product edges.",
    "Clean the set first, then generate.",
  ],
  [
    "Снимайте без лишнего; используйте cleanup; проверьте этикетки и углы после AI.",
    "Свяжите с удалением фона и точной карточкой.",
  ],
  [
    "Shoot without clutter; use cleanup; verify labels and corners after AI.",
    "Pair with background removal and exact card guides.",
  ],
  ["Профилактика на съёмке", "Режим очистки", "Края и этикетки", "Kaspi и OLX", "Пакетная обработка", "Когда не использовать AI"],
  ["Prevent on set", "Cleanup mode", "Edges and labels", "Kaspi and OLX", "Batch processing", "When to skip AI"],
  [
    "Белая или серая бумага под товаром, без посторонних объектов в кадре.",
    "Cleanup в Studio после консервативного выделения товара.",
    "Увеличьте zoom на фурнитуру — AI иногда стирает бирку.",
    "Для б/у и OLX честность важнее «стерильного» фона.",
    "Пакеты по 20 SKU с аудитом краёв.",
    "Если страдает форма товара — оставьте исходник.",
  ],
  [
    "White or gray paper under the product, no stray props.",
    "Studio cleanup after conservative product selection.",
    "Zoom hardware—AI sometimes erases tags.",
    "Used goods and OLX need honesty over sterile fantasy.",
    "Batch 20 SKUs with edge audits.",
    "If shape suffers, keep the source photo.",
  ],
  [
    { label: "Удалить фон", href: PR.b064 },
    { label: "Очистка фото", href: RU_UC.cleanup },
    { label: "Kaspi", href: PR.b031 },
    QUALITY_RU,
    HOW_RU,
  ],
  [
    { label: "Remove background", href: PE.b064 },
    { label: "Photo cleanup", href: EN_UC.cleanup },
    { label: "Kaspi", href: PE.b031 },
    QUALITY_EN,
    HOW_EN,
  ]
);

// 75, 77 comparisons
pushTopic(
  75,
  "Product shot или одежда на модели: что выбрать для карточки",
  "Product Shot or Clothing on Model: What to Choose for Listings",
  "Сравнение product shot и одежды на AI-модели для WB и Shopify: когда что использовать и как проверять.",
  "Product shot vs clothing on AI model for Wildberries and Shopify—when to use each and how to review.",
  [
    "Одежду можно показать flat, на манекене или на модели.",
    "Выбор влияет на конверсию и возвраты.",
    "AI позволяет переключаться быстрее, но не снимает QA.",
  ],
  [
    "Apparel can be flat, mannequin, or on-model.",
    "Choice affects conversion and returns.",
    "AI switches faster but never removes QA.",
  ],
  [
    "Product shot — для деталей ткани; модель — для силуэта; часто нужны оба в галерее.",
    "Товар на кадре должен совпадать с отправкой.",
  ],
  [
    "Product shot for fabric detail; model for silhouette—often both in gallery.",
    "On-screen product must match shipment.",
  ],
  ["Когда достаточно product shot", "Когда нужна модель", "AI-модель vs манекен", "Галерея карточки", "WB и Shopify", "Ошибки выбора"],
  ["When product shot is enough", "When you need a model", "AI model vs mannequin", "Gallery structure", "WB and Shopify", "Choice mistakes"],
  [
    "Свитшоты и базовые футболки часто продаются с flat или product shot.",
    "Платья и верхняя одежда — чаще выигрывают от модели, если посадка проверена.",
    "AI-модель дешевле живой, но сравнивайте длину с вешалкой.",
    "Main для WB часто нейтральный; модель — в галерее.",
    "Shopify допускает больше lifestyle при неизменном SKU.",
    "Ошибка: модель с другим оттенком, чем flat на соседнем слайде.",
  ],
  [
    "Hoodies and basics often sell with flat or product shots.",
    "Dresses and outerwear often win on-model if fit is verified.",
    "AI model is cheaper than live, but compare length to hanger shots.",
    "Wildberries mains are often neutral; model shots go to gallery.",
    "Shopify allows more lifestyle if the SKU stays identical.",
    "Mistake: model hue differs from flat on the next slide.",
  ],
  [
    { label: "Одежда на модели", href: PR.b011 },
    { label: "Карточка из фото", href: PR.b005 },
    { label: "WB", href: PR.b032 },
    { label: "Точная карточка", href: RU_UC.exact },
    { label: "Одежда use case", href: RU_UC.cloth },
  ],
  [
    { label: "Clothing on model", href: PE.b011 },
    { label: "Card from photo", href: PE.b005 },
    { label: "Wildberries", href: PE.b032 },
    { label: "Exact card", href: EN_UC.exact },
    { label: "Clothing use case", href: EN_UC.cloth },
  ]
);

pushTopic(
  77,
  "AI-модель или реальная модель: сравнение для каталога одежды",
  "AI Model or Real Model: A Catalog Comparison",
  "AI-модель vs живая модель: стоимость, скорость, доверие, модерация. Честные ограничения для Shopify и маркетплейсов; без гарантий посадки.",
  "AI vs real model: cost, speed, trust, moderation—honest limits for Shopify and marketplaces; no fit guarantees.",
  [
    "Живая модель даёт естественную посадку, но дорога на каждый SKU.",
    "AI-модель масштабируется, yet buyers still compare to flat photos.",
    "Выбор — бизнес-решение, не только визуальное.",
  ],
  [
    "Live models show natural fit but cost per SKU.",
    "AI models scale, yet buyers still compare to flats.",
    "The choice is operational, not only aesthetic.",
  ],
  [
    "Для длинного хвоста — AI с жёстким QA; для кампании бренда — живая съёмка.",
    "Не позиционируйте AI как «официальную примерку» площадки.",
  ],
  [
    "Long tail: AI with strict QA; brand campaigns: live shoots.",
    "Do not market AI as official marketplace try-on.",
  ],
  ["Стоимость и сроки", "Доверие покупателя", "Модерация и правила", "Посадка и размер", "Гибрид", "Этика подачи"],
  ["Cost and timeline", "Buyer trust", "Moderation rules", "Fit and sizing", "Hybrid", "Presentation ethics"],
  [
    "AI сокращает недели до дней на серии из 50 SKU.",
    "Отзывы «не как на модели» снижаются, если галерея показывает flat.",
    "Сверяйте правила adult и sensitive категорий.",
    "Указывайте параметры модели в тексте.",
    "Топ-SKU на живой модели, остальное AI — типичная схема.",
    "Избегайте вводящих в заблуждение поз и чужих лиц без прав.",
  ],
  [
    "AI cuts weeks to days on 50-SKU series.",
    "“Not as on model” reviews drop when flats are in gallery.",
    "Check adult and sensitive category policies.",
    "State model stats in copy.",
    "Top SKUs live, rest AI—is a common hybrid.",
    "Avoid misleading poses or faces without rights.",
  ],
  [
    { label: "Одежда на модели", href: PR.b011 },
    { label: "Перенос на модель", href: PR.b012 },
    { label: "Бельё", href: PR.b016 },
    QUALITY_RU,
    HOW_RU,
  ],
  [
    { label: "Clothing on model", href: PE.b011 },
    { label: "Place on AI model", href: PE.b012 },
    { label: "Lingerie", href: PE.b016 },
    QUALITY_EN,
    HOW_EN,
  ]
);

// 94, 96 prompts
pushTopic(
  94,
  "Как написать prompt для товарного фото: фон и сцена без смены SKU",
  "How to Write a Prompt for Product Photography",
  "Prompt для товарного фото: описать фон и свет, не меняя товар. Ошибки, проверка после генерации; без гарантий модерации.",
  "Prompts for product photos: background and light without changing the SKU—pitfalls and post-gen review; no moderation guarantee.",
  [
    "Prompt управляет сценой вокруг товара, не складом.",
    "Агрессивные описания «улучшают» товар и портят карточку.",
    "Ниже — структура промпта и безопасные формулировки.",
  ],
  [
    "Prompts steer the scene around the product, not your warehouse.",
    "Aggressive “enhancement” language drifts the SKU.",
    "Below: prompt structure and safer wording.",
  ],
  [
    "Опишите фон, свет, настроение; запретите менять форму, цвет и комплект.",
    "После генерации — тот же чеклист QA, что без промпта.",
  ],
  [
    "Describe background, light, mood; forbid changing shape, color, or kit.",
    "After generation, use the same QA checklist as without prompts.",
  ],
  ["Структура промпта", "Что не писать", "Фон vs товар", "Тест на одном SKU", "Связка с Studio", "Журнал удачных пресетов"],
  ["Prompt structure", "What to avoid", "Background vs product", "Single-SKU test", "Studio workflow", "Preset log"],
  [
    "Шаблон: «нейтральный студийный фон, мягкий свет, не изменять товар, сохранить этикетки».",
    "Избегайте «сделай дороже», «добавь аксессуары», «измени цвет».",
    "Креатив — только для доп. слайдов после QA main.",
    "Один SKU, три формулировки, сравнение с исходником.",
    "Сохраняйте удачные пресеты в таблице категории.",
    "Prompt не отменяет дисклеймер: нет гарантии модерации.",
  ],
  [
    "Template: “neutral studio background, soft light, do not alter product, keep labels.”",
    "Avoid “make it look premium,” “add accessories,” “change color.”",
    "Creative prompts for extra slides after main QA only.",
    "One SKU, three wordings, compare to source.",
    "Log winning presets per category.",
    "Prompts do not remove moderation disclaimers.",
  ],
  [
    { label: "Замена фона", href: PR.b065 },
    { label: "Сохранить товар", href: PR.b098 },
    { label: "Креативная сцена", href: "/ru/use-cases/kreativnaya-scena-tovara" },
    QUALITY_RU,
    HOW_RU,
  ],
  [
    { label: "Replace background", href: PE.b065 },
    { label: "Preserve product", href: PE.b098 },
    { label: "Creative scene", href: "/en/use-cases/creative-product-scene" },
    QUALITY_EN,
    HOW_EN,
  ]
);

pushTopic(
  96,
  "Как описать модель для одежды в prompt: возраст, поза и безопасные формулировки",
  "How to Describe a Model for Clothing Photos",
  "Prompt для AI-модели одежды: взрослая подача, нейтральная поза, без смены кроя. Проверка посадки после генерации.",
  "Prompts for AI clothing models: adult presentation, neutral pose, no cut drift—fit review after generation.",
  [
    "Описание модели влияет на позу, фон и восприятие категории.",
    "Для маркетплейса нужна сдержанная коммерческая подача.",
    "Промпт не заменяет проверку длины и цвета вещи.",
  ],
  [
    "Model descriptions steer pose, background, and category tone.",
    "Marketplaces need restrained commercial framing.",
    "Prompts never replace garment length and color checks.",
  ],
  [
    "Указывайте взрослую модель, neutral pose, catalog style; сверяйте с вешалкой после AI.",
    "Для белья — отдельный гайд и усиленный QA.",
  ],
  [
    "Specify adult model, neutral pose, catalog style; compare to hanger after AI.",
    "For lingerie, use the dedicated guide and stricter QA.",
  ],
  ["Базовые параметры модели", "Поза для маркетплейса", "Чего избегать в prompt", "Связка с исходником", "Бельё и sensitive", "Документирование пресетов"],
  ["Core model parameters", "Marketplace pose", "Prompt pitfalls", "Source pairing", "Lingerie and sensitive", "Preset documentation"],
  [
    "Взрослая модель, рост и размер на ней — в тексте карточки, не только в prompt.",
    "Поза фронтальная или 3/4 без экстремальных ракурсов для WB/Kaspi.",
    "Не просите «сексуализированную» подачу для обычной одежды.",
    "Исходник flat + AI-модель: сравните принт и длину.",
    "Бельё: см. отдельную статью; не публикуйте искажённый крой.",
    "Пресеты по категориям: платья, верх, низ — разные чеклисты.",
  ],
  [
    "Adult model; state height and worn size in listing copy, not prompt alone.",
    "Front or 3/4 poses for Wildberries/Kaspi—avoid extreme angles.",
    "Do not request sexualized framing for regular apparel.",
    "Flat source + AI model: match print and length.",
    "Lingerie: see dedicated article; reject cut drift.",
    "Category presets: dresses, tops, bottoms—different checklists.",
  ],
  [
    { label: "Одежда на модели", href: PR.b011 },
    { label: "Перенос на модель", href: PR.b012 },
    { label: "Бельё", href: PR.b016 },
    { label: "Одежда use case", href: RU_UC.cloth },
    QUALITY_RU,
  ],
  [
    { label: "Clothing on model", href: PE.b011 },
    { label: "Place on AI model", href: PE.b012 },
    { label: "Lingerie", href: PE.b016 },
    { label: "Clothing use case", href: EN_UC.cloth },
    QUALITY_EN,
  ]
);

export function getGeneratedRuArticles() {
  const out = {};
  for (const t of TOPICS) {
    out[topicId(t.n)] = mkRu(t);
  }
  return out;
}

export function getGeneratedEnArticles() {
  const out = {};
  for (const t of TOPICS) {
    out[topicId(t.n)] = mkEn(t);
  }
  return out;
}
