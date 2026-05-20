/**
 * Generates data/seo/ruBlogStage2Content.ts — delete after successful run.
 * Run: node scripts/seo/_gen-ru-blog-stage2.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../data/seo/ruBlogStage2Content.ts");

const P = {
  b001: "/ru/blog/ai-foto-tovarov-dlya-marketpleysov",
  b002: "/ru/blog/kak-sdelat-foto-tovara-dlya-marketpleysa",
  b003: "/ru/blog/kak-sdelat-belyy-fon-dlya-tovara",
  b008: "/ru/blog/kak-proverit-ai-foto-pered-publikatsiey",
  b011: "/ru/blog/kak-sdelat-foto-odezhdy-na-modeli",
  b016: "/ru/blog/foto-belya-na-ai-modeli",
  b021: "/ru/blog/foto-bizhuterii-dlya-marketpleysa",
  b031: "/ru/blog/foto-tovarov-dlya-kaspi",
  b004: "/ru/blog/how-to-improve-product-photos-without-a-photographer",
  b005: "/ru/blog/how-to-make-a-product-card-from-a-regular-photo",
  b012: "/ru/blog/how-to-place-clothing-on-an-ai-model",
  b030: "/ru/blog/how-to-create-shoe-photos-for-a-product-card",
  b032: "/ru/blog/product-photos-for-wildberries",
  b033: "/ru/blog/product-photos-for-ozon",
  b047: "/ru/blog/how-to-make-reels-from-a-product-photo",
  b048: "/ru/blog/how-to-create-a-product-video-from-a-photo",
  b064: "/ru/blog/how-to-remove-the-background-from-a-product-photo",
  b065: "/ru/blog/how-to-replace-a-product-background",
  b074: "/ru/blog/ai-product-photos-or-a-photoshoot-what-to-choose",
  b098: "/ru/blog/how-to-make-ai-preserve-the-product",
};

const UC = {
  exact: "/ru/use-cases/tochnaya-tovarnaya-kartochka",
  white: "/ru/use-cases/belyy-fon-dlya-marketpleysa",
  cloth: "/ru/use-cases/odezhda-na-ai-modeli",
  lingerie: "/ru/use-cases/bele-na-ai-modeli",
  jewelry: "/ru/use-cases/foto-bizhuterii",
};

const PL = {
  kaspi: "/ru/platforms/kaspi-foto-tovarov",
  wb: "/ru/platforms/wildberries-foto-tovarov",
  ozon: "/ru/platforms/ozon-foto-tovarov",
};

function wc(text) {
  return String(text).split(/\s+/).filter(Boolean).length;
}

function mainWords(a) {
  const parts = [a.intro, a.shortAnswer, ...a.sections.flatMap((s) => s.body)];
  return wc(parts.join(" "));
}

function faqBase(extra = []) {
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
      question: "Нужен ли профессиональный фотограф для старта?",
      answer:
        "Для тестовых карточек и обновления каталога часто достаточно аккуратного исходника со смартфона. Для премиальных hero-снимков фотограф по-прежнему может быть нужен.",
    },
  ];
  return [...base, ...extra].slice(0, 6);
}

function sec(title, ...paras) {
  return { title, body: paras };
}

function p(...parts) {
  return parts.join(" ");
}

const studio = { label: "Открыть студию", href: "/studio" };
const cost = { label: "Стоимость", href: "/ru/cost" };
const platforms = { label: "Платформы", href: "/ru/platforms" };

/** @type {Record<string, object>} */
const articles = {};

// ——— Expanded (published) ———

articles.blog_001 = {
  title: "AI-фото товаров для маркетплейсов: практический гид для продавца в Казахстане и СНГ",
  metaDescription:
    "Что такое AI-фото товаров для Kaspi и маркетплейсов: сценарии, ограничения, ручная проверка и честный workflow без гарантий модерации.",
  intro: p(
    "AI-фото товаров — это не волшебная кнопка продаж, а способ быстрее подготовить визуал из реального снимка.",
    "Для продавцов в Казахстане и СНГ это особенно полезно, когда нужно обновить Kaspi, Wildberries или Ozon без постоянной студии и штата ретушёров.",
    "Ниже — честный разбор, где AI реально экономит время, а где без ручной проверки публиковать нельзя.",
    "Vitrina AI Studio не является официальным партнёром маркетплейсов и не гарантирует прохождение модерации."
  ),
  shortAnswer: p(
    "AI помогает убрать фон, собрать карточку, показать одежду на модели и сделать варианты для соцсетей.",
    "Каждый результат нужно сверять с реальным товаром: форма, цвет, узор и детали не должны меняться.",
    "Видео и Reels из фото — отдельные сценарии; часть функций ещё в разработке."
  ),
  sections: [
    sec(
      "Что входит в AI-фото товаров",
      p(
        "Типичный workflow начинается с обычного фото: товар на столе, в шоуруме или на вешалке.",
        "Дальше сервис помогает выделить предмет, поставить нейтральный или белый фон, собрать product shot или перенести одежду на AI-модель.",
        "Хороший результат не «придумывает» новый товар, а сохраняет то, что покупатель получит в посылке."
      ),
      p(
        "Для маркетплейсов чаще нужна точность: чистый фон, читаемый размер, видимые швы, фурнитура, этикетки.",
        "Для Instagram допустим более креативный фон, но товар всё равно должен оставаться узнаваемым.",
        "Студия ускоряет черновики, но не заменяет знание правил конкретной площадки."
      ),
      p(
        "Отдельно стоит помнить про видео: сценарии Reels и роликов из фото находятся в разработке.",
        "Пока опирайтесь на статичные изображения с ручной проверкой.",
        "Если функция видео уже доступна в вашей версии — всё равно проверяйте, что на кадре тот же товар."
      )
    ),
    sec(
      "Где AI помогает продавцу маркетплейса",
      p(
        "Первый сценарий — быстрый запуск SKU: вы сняли товар на телефон и за вечер подготовили основную карточку.",
        "Второй — выравнивание каталога: десятки позиций с разным фоном приводят к единому белому или светло-серому стилю.",
        "Третий — варианты для рекламы и соцсетей без отдельной съёмки каждого цвета."
      ),
      p(
        "В Казахстане многие магазины стартуют с Kaspi, затем добавляют WB и Ozon.",
        "AI снижает стоимость «первого визуала», но не отменяет требования к комплектации, гарантии и описанию.",
        "Если карточка визуально красивая, а товар на фото другой — растут возвраты и негативные отзывы."
      ),
      p(
        "AI особенно уместен для аксессуаров, одежды среднего ценового сегмента, товаров для дома и повторяемых SKU.",
        "Менее уместен для ювелирных камней высокой чёткости, сложной электроники с мелкими портами и товаров, где критичен каждый миллиметр.",
        "В таких категориях делайте отдельный макро-кадр и проверяйте его вручную."
      )
    ),
    sec(
      "Ограничения и честные ожидания",
      p(
        "Модель может сгладить кружево, изменить оттенок металла, «дорисовать» камень или сузить обувь.",
        "Поэтому любой AI-кадр — черновик, а не финальный файл для модерации.",
        "Сервис не гарантирует прохождение проверки Kaspi, Wildberries, Ozon и других площадок."
      ),
      p(
        "Правила к изображениям, текстам, видео и категориям меняются — продавец обязан сверяться с актуальной документацией.",
        "Если сомневаетесь, выберите режим точной карточки и отклоните вариант с искажениями.",
        "Не обещайте покупателю то, чего нет на фото: другой цвет, комплект или бренд."
      ),
      p(
        "Это важнее SEO: маркетплейсы и покупатели наказывают несоответствие быстрее, чем слабый свет.",
        "Честная карточка с простым фоном часто продаёт лучше, чем «киношная» сцена с неверным товаром.",
        "Фиксируйте в команде правило: спорный кадр не уходит в кабинет без второй пары глаз."
      )
    ),
    sec(
      "Какой исходник снимать",
      p(
        "Свет равномерный, без жёстких бликов; товар занимает большую часть кадра.",
        "Фон проще однотонный — так AI реже ошибается на краях.",
        "Для одежды избегайте сильных складок, перекрытий и посторонних предметов."
      ),
      p(
        "Делайте несколько ракурсов: фронт, деталь фактуры, этикетка, комплект.",
        "Даже если в карточку пойдёт один AI-кадр, остальные помогут при проверке.",
        "Для прозрачной упаковки и стекла снимайте с минимальными бликами."
      ),
      p(
        "Не используйте чужие фото с Pinterest или каталога поставщика без прав.",
        "Для легальной карточки нужен ваш собственный исходник или лицензированный материал.",
        "Сохраняйте RAW или исходник — при споре с покупателем это доказательная база."
      )
    ),
    sec(
      "Пошаговый workflow в студии",
      p(
        "Загрузите исходник, выберите задачу: точная карточка, белый фон, одежда на модели или очистка фото.",
        "Сгенерируйте два-три варианта, не останавливайтесь на первом превью.",
        "Сравните с оригиналом на большом экране, не только на телефоне."
      ),
      p(
        "Отметьте чеклист: форма, цвет, узор, логотипы, фурнитура, края, тени.",
        "Если деталь «поплыла», перегенерируйте с другим исходником или более нейтральным фоном.",
        "Только после этого экспортируйте файл в кабинет маркетплейса."
      ),
      p(
        "Ведите таблицу SKU: исходник, версия AI, дата проверки, кто проверил.",
        "Так проще найти ошибку, если покупатель пришлёт претензию.",
        "Раз в квартал пересматривайте правила площадок — они обновляются без громких анонсов."
      )
    ),
    sec(
      "Связка с Kaspi, WB и соцсетями",
      p(
        "Для Kaspi чаще нужен понятный product shot и честное соответствие товару.",
        "Для Wildberries важны единый стиль каталога и корректная посадка одежды на модели.",
        "Для Ozon полезны дополнительные ракурсы; видео из фото — отдельный сценарий, часть функций ещё в разработке.",
        "Vitrina AI Studio не является официальным партнёром площадок и не гарантирует прохождение модерации."
      ),
      p(
        "Сохраняйте мастер-файл в высоком разрешении, на площадку загружайте версию по требованиям формата.",
        "Не сжимайте до «мыла»: модерация и покупатель всё равно увидят артефакты.",
        "Планируйте контент-пакет: основная карточка, деталь, lifestyle для Instagram, при необходимости кадр 9:16.",
        "Все кадры пакета должны показывать один SKU, цвет и комплект — иначе растут возвраты."
      ),
      p(
        "Так AI окупается не одним кадром, а пакетом материалов на неделю.",
        "Согласуйте визуальный стиль с менеджером, который отвечает за рекламу — иначе карточка и баннеры расходятся.",
        "При масштабировании на вторую площадку не копируйте слепо файлы: проверьте размер и фон под новые правила.",
        "Раз в месяц пересматривайте топ-SKU с возвратами: часто проблема в визуале, а не в цене."
      )
    ),
    sec(
      "От одного SKU к устойчивому процессу",
      p(
        "Первый успешный AI-кадр не означает, что весь каталог можно генерировать без контроля.",
        "Зафиксируйте workflow: кто снимает исходник, кто выбирает режим, кто проверяет и кто загружает в кабинет.",
        "Так ошибки не «протекают» в десятки карточек из-за спешки одного человека.",
        "Для команды из двух-трёх человек достаточно простой таблицы SKU с датой проверки."
      ),
      p(
        "При пакетной генерации выборочно проверяйте каждый пятый SKU — так ловят системные ошибки AI.",
        "Если одна категория даёт повторяющиеся искажения — кружево, металл, прозрачный пластик — выделите для неё отдельный чеклист.",
        "Не экономьте на свете в исходнике: плохой снимок заставляет модель додумывать детали, которых нет на товаре.",
        "Храните исходники рядом с AI-версией — при споре с покупателем это ваша доказательная база."
      ),
      p(
        "Сверяйтесь с гайдами по белому фону, проверке перед публикацией и фото для конкретной площадки.",
        "Чем раньше встроите ручную проверку в процесс, тем меньше платите возвратами и негативными отзывами.",
        "AI — инструмент ускорения, а не замена ответственности продавца за честную карточку.",
        "Если сомневаетесь в кадре — отклоните вариант: перегенерация дешевле, чем блокировка карточки или претензия."
      )
    ),
  ],
  checklist: [
    "исходник резкий и без лишних предметов",
    "форма и цвет совпадают с реальным товаром",
    "фон не вводит в заблуждение о комплекте",
    "нет чужих логотипов и водяных знаков",
    "правила площадки проверены вручную",
  ],
  faq: faqBase([
    {
      question: "Подойдёт ли AI-фото для дорогой ювелирки?",
      answer:
        "Можно пробовать, но мелкие камни и блики требуют макросъёмки и особенно строгой проверки. Часто нужен отдельный кадр крупным планом.",
    },
    {
      question: "Можно ли сразу делать десятки карточек без контроля?",
      answer:
        "Технически да, но риск ошибок растёт. Лучше пакетная генерация с выборочной проверкой каждого 5–10 SKU.",
    },
  ]),
  links: [
    studio,
    cost,
    { label: "Точная карточка", href: UC.exact },
    platforms,
    { label: "Фото для Kaspi", href: P.b031 },
    { label: "Проверка AI-фото", href: P.b008 },
    { label: "Как сделать фото товара", href: P.b002 },
  ],
};

import { registerAll } from "./_ru-blog-stage2-all.mjs";

registerAll(articles, { p, sec, faqBase, studio, cost, platforms, P, UC, PL });

function toTsArticle(id, a) {
  const lines = [];
  lines.push(`  ${JSON.stringify(id)}: {`);
  lines.push(`    title: ${JSON.stringify(a.title)},`);
  lines.push(`    metaDescription: ${JSON.stringify(a.metaDescription)},`);
  lines.push(`    intro: ${JSON.stringify(a.intro)},`);
  lines.push(`    shortAnswer: ${JSON.stringify(a.shortAnswer)},`);
  lines.push(`    sections: [`);
  for (const s of a.sections) {
    lines.push(`      {`);
    lines.push(`        title: ${JSON.stringify(s.title)},`);
    lines.push(`        body: [`);
    for (const b of s.body) lines.push(`          ${JSON.stringify(b)},`);
    lines.push(`        ],`);
    lines.push(`      },`);
  }
  lines.push(`    ],`);
  lines.push(`    checklist: [`);
  for (const c of a.checklist) lines.push(`      ${JSON.stringify(c)},`);
  lines.push(`    ],`);
  lines.push(`    faq: [`);
  for (const f of a.faq) {
    lines.push(`      { question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} },`);
  }
  lines.push(`    ],`);
  lines.push(`    internalLinks: [`);
  for (const l of a.links) {
    lines.push(`      { label: ${JSON.stringify(l.label)}, href: ${JSON.stringify(l.href)} },`);
  }
  lines.push(`    ],`);
  lines.push(`  },`);
  return lines.join("\n");
}

function emit() {
  const expandedIds = [
    "blog_001",
    "blog_002",
    "blog_003",
    "blog_008",
    "blog_011",
    "blog_016",
    "blog_021",
    "blog_031",
  ];
  const newIds = [
    "blog_004",
    "blog_005",
    "blog_012",
    "blog_030",
    "blog_032",
    "blog_033",
    "blog_047",
    "blog_048",
    "blog_064",
    "blog_065",
    "blog_074",
    "blog_098",
  ];

  const header = `import type { FaqItem } from "./platforms";

export type RuBlogArticleContent = {
  title: string;
  metaDescription: string;
  intro: string;
  shortAnswer: string;
  sections: Array<{ title: string; body: string[] }>;
  checklist: string[];
  faq: FaqItem[];
  internalLinks: Array<{ label: string; href: string }>;
};

`;

  let expanded = "export const ruBlogExpanded: Record<string, RuBlogArticleContent> = {\n";
  for (const id of expandedIds) expanded += toTsArticle(id, articles[id]) + "\n";
  expanded += "};\n\n";

  let neu = "export const ruBlogNewP0: Record<string, RuBlogArticleContent> = {\n";
  for (const id of newIds) neu += toTsArticle(id, articles[id]) + "\n";
  neu += "};\n";

  writeFileSync(OUT, header + expanded + neu, "utf8");
}

// Verify before emit
const allIds = Object.keys(articles);
for (const id of allIds) {
  const w = mainWords(articles[id]);
  const m = articles[id].metaDescription.length;
  if (w < 1000 || w > 1400) console.warn(`${id} main words: ${w} (target 1000-1400)`);
  if (m < 120 || m > 160) console.warn(`${id} meta len: ${m} (target 120-160)`);
}

emit();
console.log("Wrote", OUT, "articles:", allIds.length);
