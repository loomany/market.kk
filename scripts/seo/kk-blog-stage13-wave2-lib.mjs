export const KK_DISCLAIMER =
  "Vitrina AI Studio тәуелсіз құрал, Kaspi, Wildberries және Ozon ресми серіктесі емес және модерацияны кепілдемейді. Әр AI нәтиже жариялау алдында қолмен тексерілуі керек.";

export const KK_VIDEO_NOTE =
  "Видео және Reels сценарийлері әзірленуде — қолжетімді болмаса, тек тексерілген статика жариялаңыз.";

export function p(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function sec(title, ...body) {
  return { title, body: body.filter(Boolean) };
}

export function faqKk(extra = []) {
  const base = [
    {
      question: "AI фотосын тексерусіз жариялауға бола ма?",
      answer:
        "Жоқ. AI пішінді, түсті, өрнекті, логотипті немесе ұсақ детальдарды өзгертуі мүмкін. Kaspi немесе басқа маркетплейске жібермес бұрын түпнұсқамен салыстырыңыз.",
    },
    {
      question: "Vitrina AI модерацияны кепілдей ме?",
      answer:
        "Жоқ. Ережелер өзгереді — соңғы тексеру мен жариялау жауапкершілігі сатушыда.",
    },
    {
      question: "Vitrina AI — Kaspi ресми серіктесі ме?",
      answer: "Жоқ. Жүктемес бұрын кабинеттегі ағымдағы анықтаманы оқыңыз.",
    },
    {
      question: "Смартфон каталог үшін жеткілікті ме?",
      answer:
        "Жиі иә — жарық пен қолмен тексеру дұрыс болса. Күрделі макро үшін фотосуретші қажет болуы мүмкін.",
    },
  ];
  return [...base, ...extra];
}

export function fourKk(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i += 4) {
    out.push(p(...lines.slice(i, i + 4), KK_DISCLAIMER));
  }
  while (out.length < 4) out.push(p(KK_DISCLAIMER));
  return out.slice(0, 4);
}

export function buildKkSections(titles, blocks) {
  return titles.map((title, i) => {
    const lines = blocks[i] ?? blocks[blocks.length - 1];
    return sec(title, ...fourKk(lines));
  });
}

export const KK_QA_LINES = [
  "Мониторда түпнұсқа мен AI кадрды қатар ашыңыз: пішін, түс, өрнек, фурнитура, жинақ сәйкес болуы керек.",
  "Күмәнді нұсқаны қабылдамаңыз — қайта генерациялау қайтарудан арзан.",
  "Край ореолы, көлеңке, блик — телефон preview-де жиі көрінбейді.",
  "Kaspi кабинет анықтамасын жүктеме алдында оқыңыз — Vitrina AI модерацияны кепілдемейді.",
  "SKU кестесінде кім тексерді, қашан — каталог қателерін азайтады.",
  "Бөтен watermark, жарнама плашкасы, fake марапат — бас тартуға әкелуі мүмкін.",
];

export const STUDIO = { label: "Студияны ашу", href: "/studio" };
export const COST = { label: "Бағалар", href: "/kk/cost" };
export const KK_BLOG = {
  kaspi: { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
  aiBasics: { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
  marketplace: { label: "Маркетплейс фото", href: "/kk/blog/marketpleisterge-onim-fotosu-kalay-zhasau" },
  whiteBg: { label: "Ақ фон", href: "/kk/blog/onim-ushin-ak-fon-kalay-zhasau" },
  card: { label: "Тауар карточкасы", href: "/kk/blog/kadirdik-onim-fotosynan-kartochka" },
  clothing: { label: "Киім AI модельде", href: "/kk/blog/kiim-ai-model-fotosy" },
  tryOn: { label: "Киімді AI модельге", href: "/kk/blog/kiimdi-ai-modelge-kiyu" },
  removeBg: { label: "Фонды алу", href: "/kk/blog/onim-fonyn-alu" },
};
