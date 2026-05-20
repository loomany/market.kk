/**
 * Generates data/seo/kkBlogStage5Content.ts with clean Kazakh Cyrillic prose.
 * Run: node scripts/seo/gen-kk-blog.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { articlesPartA } from "./gen-kk-blog-bodies-a.mjs";
import { articlesPartB } from "./gen-kk-blog-bodies-b.mjs";
import { applySectionBoosts } from "./gen-kk-blog-boost.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../data/seo/kkBlogStage5Content.ts");

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

const extraFaq = {
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

const links = {
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

function finalize(id, seed) {
  return {
    ...seed,
    faq: [...commonKkFaq, extraFaq[id]],
    internalLinks: [{ label: "Студияны ашу", href: "/studio" }, ...links[id]],
  };
}

const rawArticles = { ...articlesPartA, ...articlesPartB };

const articles = Object.fromEntries(
  Object.entries(rawArticles).map(([id, seed]) => [
    id,
    finalize(id, applySectionBoosts({ ...seed, id })),
  ]),
);

function renderArticle(id, a) {
  const sections = a.sections
    .map(
      (s) => `      {
        title: ${JSON.stringify(s.title)},
        body: [
${s.body.map((p) => `          ${JSON.stringify(p)},`).join("\n")}
        ],
      },`,
    )
    .join("\n");

  return `  ${JSON.stringify(id)}: {
    title: ${JSON.stringify(a.title)},
    metaDescription: ${JSON.stringify(a.metaDescription)},
    intro: ${JSON.stringify(a.intro)},
    shortAnswer: ${JSON.stringify(a.shortAnswer)},
    sections: [
${sections}
    ],
    checklist: [${a.checklist.map((c) => JSON.stringify(c)).join(", ")}],
    faq: [
${a.faq.map((f) => `      { question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} },`).join("\n")}
    ],
    internalLinks: [
${a.internalLinks.map((l) => `      { label: ${JSON.stringify(l.label)}, href: ${JSON.stringify(l.href)} },`).join("\n")}
    ],
  },`;
}

const header = `import type { FaqItem } from "./platforms";

export type KkBlogArticleContent = {
  title: string;
  metaDescription: string;
  intro: string;
  shortAnswer: string;
  sections: Array<{ title: string; body: string[] }>;
  checklist: string[];
  faq: FaqItem[];
  internalLinks: Array<{ label: string; href: string }>;
};

export const commonKkFaq: FaqItem[] = ${JSON.stringify(commonKkFaq, null, 2)};

export const kkBlogStage5P0: Record<string, KkBlogArticleContent> = {
`;

const body = Object.entries(articles)
  .map(([id, article]) => renderArticle(id, article))
  .join("\n");

writeFileSync(OUT, header + body + "\n};\n", "utf8");

function wordCount(article) {
  const text = [article.intro, article.shortAnswer, ...article.sections.flatMap((s) => s.body)].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

console.log("Wrote", OUT);
for (const [id, a] of Object.entries(articles)) {
  console.log(`  ${id}: ${wordCount(a)} words, meta ${a.metaDescription.length} chars`);
}
