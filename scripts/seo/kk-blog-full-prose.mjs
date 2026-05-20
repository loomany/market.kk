import { authoredArticles as rawSeed } from "./kk-stage5-authored.mjs";
import {
  fourthParagraphs,
  introBoost,
  introBoost2,
  introBoost3,
  shortAnswerBoost,
  shortAnswerBoost2,
} from "./kk-blog-fourth-paras.mjs";

const BLOG_IDS = [
  "blog_031",
  "blog_001",
  "blog_002",
  "blog_003",
  "blog_004",
  "blog_005",
  "blog_011",
  "blog_012",
  "blog_016",
  "blog_064",
];

export const commonKkFaq = [
  {
    question: "AI фотосын тексерусіз жариялауға бола ма?",
    answer:
      "Жоқ. AI пішінді, түсті, өрнекті, логотипті немесе ұсақ детальдарды өзгертуі мүмкін. Kaspi немесе басқа маркетплейске жібермес бұрын түпнұсқамен салыстырыңыз және қате нұсқаларды қабылдамаңыз.",
  },
  {
    question: "Vitrina AI модерацияны кепілдей ме?",
    answer:
      "Жоқ. Vitrina AI Studio сурет дайындауға көмектеседі, бірақ маркетплейс ережелері өзгереді. Соңғы тексеру мен жариялау жауапкершілігі сатушыда.",
  },
  {
    question: "Vitrina AI — Kaspi ресми серіктесі ме?",
    answer:
      "Жоқ. Бұл тәуелсіз құрал. Жүктемес бұрын Kaspi, Wildberries немесе Ozon кабинетіндегі ағымдағы анықтаманы оқыңыз.",
  },
  {
    question: "Смартфон маркетплейс каталогы үшін жеткілікті ме?",
    answer:
      "Жиі иә — жарық пен қолмен тексеру дұрыс болса. Премиум hero-кадрлар мен күрделі макро үшін фотосуретші қажет болуы мүмкін.",
  },
  {
    question: "AI нәтижесін қайта генерациялау қауіпсіз бе?",
    answer:
      "Иә, бірақ әр нұсқа жеке тексеріледі. Бірінші preview ең дұрыс нәтиже емес — екі-үш нұсқаны салыстырыңыз.",
  },
];

const metaById = {
  blog_031:
    "Kaspi үшін тауар фотосын дайындау: бейтарап фон, AI өңдеу және міндетті қолмен тексеру. Vitrina AI ресми серіктесі емес және модерацияны кепілдемейді.",
  blog_001:
    "AI тауар фотосы: Kaspi және маркетплейстер workflow, шектеулер, қолмен QA. Vitrina AI Studio модерацияны кепілдемейді.",
  blog_002:
    "Маркетплейске тауар фотосын дайындау: түпнұсқа, Studio, QA, Kaspi/WB/Ozon жүктеу. Модерация кепілденбейді.",
  blog_003:
    "Тауарға ақ фон: AI края/көлеңке қателері, Kaspi/WB/Ozon жүктемес бұрын тексеру. Vitrina AI модерацияны кепілдемейді.",
  blog_004:
    "Фотосуретшісіз тауар фотосын жақсарту: смартфон, жарық, Vitrina AI Studio, Kaspi QA. Модерация кепілденбейді.",
  blog_005:
    "Қарапайым фотодан тауар карточкасы: Studio режимдері, Kaspi жүктеу алдында QA. Vitrina AI ресми серіктес емес.",
  blog_011:
    "Киімді AI модельде көрсету: түпнұсқа, ересек модель, отыруын QA. Vitrina AI модерацияны кепілдемейді.",
  blog_012:
    "Киімді AI модельге кию: виртуалды примерка, adult-only catalog, Kaspi/WB QA. Модерация кепілденбейді.",
  blog_016:
    "Іш киім AI модельде: adult-only catalog, отыруын QA. Kaspi/WB — Vitrina AI ресми серіктес емес.",
  blog_064:
    "Тауар фонын алу: AI workflow, күрделі края, Kaspi product shot QA. Vitrina AI модерацияны кепілдемейді.",
};

const extraFaqById = {
  blog_031: {
    question: "Kaspi үшін main фото үшін тек ақ фон керек пе?",
    answer: "Категорияға байланысты. Жүктемес бұрын Kaspi анықтамасын оқыңыз.",
  },
  blog_001: {
    question: "Қымбат әшекейге AI фото жарай ма?",
    answer: "Болады, бірақ ұсақ тастар мен бликтер макро мен қатаң QA қажет етеді.",
  },
  blog_002: {
    question: "Бір фото карточкаға жеткілікті ме?",
    answer: "Бастауға кейде иә, бірақ main, деталь және қажет болса модельде кадр жоспарлаңыз.",
  },
  blog_003: {
    question: "Барлық алаңда таза ақ фон міндетті ме?",
    answer: "Талаптар әртүрлі. Жүктемес бұрын нақты алаң анықтамасын оқыңыз.",
  },
  blog_004: {
    question: "Ескі смартфонмен бола ма?",
    answer: "Жарық жақсы болса, кадр өткір болса — болады. 100% масштабта тексеріңіз.",
  },
  blog_005: {
    question: "Ақ фон міндетті ме?",
    answer: "Алаң мен категорияға байланысты. Жүктемес бұрын анықтаманы оқыңыз.",
  },
  blog_011: {
    question: "Балалар киіміне AI модель бола ма?",
    answer: "Алаң ережелерін оқыңыз. Көп жағдайда жазық кадр немесе нақты фото қауіпсізірек.",
  },
  blog_012: {
    question: "Балалар киіміне бола ма?",
    answer: "Алаң ережелерін оқыңыз. Көп жағдайда жазық кадр қауіпсізірек.",
  },
  blog_016: {
    question: "Балалар іш киіміне AI модель?",
    answer: "Алаң ережелерін оқыңыз. Көп жағдайда жазық кадр немесе платформа гайды бойынша нақты фото.",
  },
  blog_064: {
    question: "Мех пен кружево қиылысын қалай жақсарту?",
    answer: "Контрастты фон, жұмсақ боковой жарық. Край нашар болса — түпнұсқаны қайта түсіріңіз.",
  },
};

const linksById = {
  blog_031: [
    { label: "Бағалар", href: "/kk/cost" },
    { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "Ақ фон", href: "/kk/blog/onim-ushin-ak-fon-kalay-zhasau" },
    { label: "Фон генератор", href: "/kk/onim-fon-generator" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
  ],
  blog_001: [
    { label: "Бағалар", href: "/kk/cost" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "Ақ фон", href: "/kk/blog/onim-ushin-ak-fon-kalay-zhasau" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
    { label: "Киім модельде", href: "/kk/kiim-ai-model-fotosy" },
  ],
  blog_002: [
    { label: "Бағалар", href: "/kk/cost" },
    { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "Ақ фон", href: "/kk/blog/onim-ushin-ak-fon-kalay-zhasau" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
  ],
  blog_003: [
    { label: "Фонды алу", href: "/kk/blog/onim-fonyn-alu" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
    { label: "Фон генератор", href: "/kk/onim-fon-generator" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
  ],
  blog_004: [
    { label: "Бағалар", href: "/kk/cost" },
    { label: "Маркетплейс фото", href: "/kk/blog/marketpleisterge-onim-fotosu-kalay-zhasau" },
    { label: "Карточка", href: "/kk/blog/kadirdik-onim-fotosynan-kartochka" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
  ],
  blog_005: [
    { label: "Бағалар", href: "/kk/cost" },
    { label: "Маркетплейс фото", href: "/kk/blog/marketpleisterge-onim-fotosu-kalay-zhasau" },
    { label: "Фото жақсарту", href: "/kk/blog/fotosurysyz-onim-fotosyn-zhetildiru" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
    { label: "Ақ фон", href: "/kk/blog/onim-ushin-ak-fon-kalay-zhasau" },
  ],
  blog_011: [
    { label: "Киім модельде", href: "/kk/kiim-ai-model-fotosy" },
    { label: "Модельге кию", href: "/kk/blog/kiimdi-ai-modelge-kiyu" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
  ],
  blog_012: [
    { label: "Киім модельде", href: "/kk/kiim-ai-model-fotosy" },
    { label: "Іш киім AI", href: "/kk/blog/ish-kiyim-ai-model-fotosy" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
  ],
  blog_016: [
    { label: "Киім модельде", href: "/kk/kiim-ai-model-fotosy" },
    { label: "Модельге кию", href: "/kk/blog/kiimdi-ai-modelge-kiyu" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "Фон генератор", href: "/kk/onim-fon-generator" },
  ],
  blog_064: [
    { label: "Ақ фон", href: "/kk/blog/onim-ushin-ak-fon-kalay-zhasau" },
    { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    { label: "Маркетплейс фото", href: "/kk/marketpleisterge-onim-fotosy" },
    { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
    { label: "Фон генератор", href: "/kk/onim-fon-generator" },
    { label: "AI студия", href: "/kk/ai-onim-foto-studiyasi" },
  ],
};

const textReplacements = [
  [/workflow/gi, "үдеріс"],
  [/preview/gi, "алдын ала нұсқа"],
  [/lifestyle/gi, "контекст кадр"],
  [/flatlay/gi, "жазық кадр"],
  [/main image/gi, "негізгі кадр"],
  [/main/gi, "негізгі"],
  [/master/gi, "негізгі файл"],
  [/RAW/gi, "түпнұсқа файл"],
  [/Reels/gi, "қысқа бейне"],
  [/LED/gi, "тұрақты жарық"],
];

function clean(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return textReplacements.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    normalized
  );
}

function normalizeMeta(meta) {
  const cleaned = clean(meta);
  if (cleaned.length >= 100 && cleaned.length <= 170) return cleaned;
  if (cleaned.length < 100) {
    return `${cleaned} Әр файл жарияланар алдында қолмен тексеріледі.`;
  }
  return `${cleaned.slice(0, 167).trimEnd()}.`;
}

const scaleSection = {
  title: "Масштабта процессті бекіту",
  body: [
    "SKU кестесі, түпнұсқа архиві және бас тарту журналы — ондаған позицияда қателерді азайтады. Әр жүктемеде Kaspi, Wildberries, Ozon ағымдағы анықтамасын оқыңыз — ережелер өзгеруі мүмкін.",
    "Ай сайын топ-10 қайтаруларды талдаңыз: жиі мәселе визуалда, сипаттама мен фото сәйкессіздігінде. Күмән кадрды жарияламаңыз — қайта генерациялау қайтарудан арзан.",
    "Vitrina AI Studio тәуелсіз құрал — маркетплейс ресми серіктесі емес, модерацияны кепілдемейді. AI уақыт үнемдейді; адал карточка жауапкершілігі сатушыда.",
  ],
};

function expandParagraph(base, focus, paragraphIdx) {
  const templates = [
    `Осы тұста ${focus} бойынша кадрды түпнұсқамен қатар ашып, түсі, пішіні, өрнегі және жинақты қоймадағы нақты SKU-мен дәл келетінін міндетті түрде қолмен растау керек.`,
    `Тәжірибеде ${focus} кезеңін кесте арқылы бақылау тиімді: кім тексерді, қашан бекітті және қандай ескерту болды деген белгі каталогты тұрақты деңгейде ұстауға көмектеседі.`,
    `Егер ${focus} кезінде күмәнді деталь байқалса, даулы нұсқаны жарияламай, қайта генерациялау жасаған дұрыс, себебі Vitrina AI модерацияны кепілдемейді және ресми серіктес мәртебесіне ие емес.`,
  ];
  return clean(`${base} ${templates[paragraphIdx]}`);
}

const sectionFocus = {
  blog_031: [
    "Kaspi негізгі кадрының талаптары",
    "бастапқы түсірілім сапасы",
    "Studio ішіндегі өңдеу тәртібі",
    "қолмен тексеру және қабылдау шегі",
    "галерея ракурстарының сәйкестігі",
    "каталогты масштабтау кезінде бақылау",
  ],
  blog_001: [
    "AI тауар фотосының нақты қолданылуы",
    "сатушыға беретін бизнес пайдасы",
    "шектеулер мен тәуекел аймақтары",
    "дұрыс бастапқы кадр дайындау",
    "өңдеу және тексеру ретін сақтау",
    "алаңдар арасында бірізді визуал құру",
  ],
  blog_002: [
    "түсірілімнен басталатын алғашқы қадам",
    "Studio режимін дұрыс таңдау",
    "өнім сәйкестігін кадрда растау",
    "алаң ережесімен міндетті салыстыру",
    "команда жіберетін типтік қателер",
    "карточка мен қор дерегін байланыстыру",
  ],
  blog_003: [
    "ақ фонның саудадағы рөлі",
    "контурды жеңілдететін бастапқы түсірілім",
    "AI кесуіндегі қиын элементтер",
    "өңдеуден кейінгі сапа тексеруі",
    "ақ фондағы жиі кеткен қателер",
    "ақ фонды басқа контентпен ұштастыру",
  ],
  blog_004: [
    "түпнұсқа кадр сапасының маңызы",
    "үй жағдайындағы жарық қою",
    "фон мен тауарды дұрыс дайындау",
    "Studio режимдерін мақсатқа сай қолдану",
    "AI мүмкіндігі мен шекарасын түсіну",
    "фотосуретші қажет болатын сәттер",
  ],
  blog_005: [
    "қарапайым фотоның коммерциялық әлеуеті",
    "алғашқы кадрды дұрыс түсіру",
    "фотоны product shot форматына келтіру",
    "жариялауға дейінгі толық тексеру",
    "шектеулі ресурспен көп ракурс дайындау",
    "әдістің шынайы шектеулерін ескеру",
  ],
  blog_011: [
    "киімді модельде көрсетудің пайдасы",
    "киім түпнұсқасын алдын ала дайындау",
    "модель бейнесін қауіпсіз таңдау",
    "отырыс пен пропорцияны тексеру",
    "маркетплейсте дұрыс жариялау",
    "AI модельдегі жиі қателерді азайту",
  ],
  blog_012: [
    "виртуалды киюдің нақты пайдасы",
    "түс пен өлшем үшін база дайындау",
    "Studio-да поза мен модельді таңдау",
    "крой мен детальды қолмен тексеру",
    "санат бойынша ерекшелікті ескеру",
    "Kaspi, Wildberries, Ozon жүктеу тәртібі",
  ],
  blog_016: [
    "іш киім санатындағы қолдану шегі",
    "adult-only мазмұн талаптары",
    "бастапқы түсірілімді қауіпсіз ұйымдастыру",
    "Studio-да бейтарап модель қолдану",
    "отырыс пен фактураны қатаң тексеру",
    "жариялау кезінде тәуекелді басқару",
  ],
  blog_064: [
    "фонды алудың бизнес себебі",
    "кесуге қолайлы бастапқы кадр",
    "күрделі контур аймақтары",
    "Studio-да фон алу тәртібі",
    "контур, көлеңке, мөлдірлік тексеруі",
    "фоннан кейін ақ фонға көшіру",
  ],
};

function finalizeArticle(id, seed) {
  const themes = sectionFocus[id];
  if (!themes || themes.length !== 6) {
    throw new Error(`Missing section focus for ${id}`);
  }

  const fourth = fourthParagraphs[id] ?? [];
  const sections = seed.sections.slice(0, 6).map((section, sectionIdx) => {
    const body = section.body.slice(0, 3).map((paragraph, paragraphIdx) =>
      expandParagraph(paragraph, themes[sectionIdx], paragraphIdx)
    );
    if (fourth[sectionIdx]) body.push(clean(fourth[sectionIdx]));
    return { title: clean(section.title), body };
  });
  sections.push({
    title: clean(scaleSection.title),
    body: scaleSection.body.map((p) => clean(p)),
  });

  const introParts = [
    seed.intro,
    introBoost[id],
    introBoost2[id],
    introBoost3[id],
  ].filter(Boolean);
  const shortParts = [
    seed.shortAnswer,
    shortAnswerBoost[id],
    shortAnswerBoost2[id],
  ].filter(Boolean);

  return {
    title: clean(seed.title),
    metaDescription: normalizeMeta(metaById[id]),
    intro: clean(introParts.join(" ")),
    shortAnswer: clean(shortParts.join(" ")),
    sections,
    checklist: seed.checklist.map((c) => clean(c)),
    faq: [...commonKkFaq, extraFaqById[id]],
    internalLinks: [{ label: "Студияны ашу", href: "/studio" }, ...linksById[id]],
  };
}

export const fullArticles = Object.fromEntries(
  BLOG_IDS.map((id) => {
    const seed = rawSeed[id];
    if (!seed) throw new Error(`Missing seed ${id}`);
    return [id, finalizeArticle(id, seed)];
  }),
);
