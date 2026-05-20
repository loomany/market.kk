import type { Locale } from "@/lib/i18n/localeConfig";

export function examplesLpTeaser(locale: Locale): {
  title: string;
  body: string;
  checklistTitle: string;
} {
  if (locale === "ru") {
    return {
      title: "Визуальные примеры (в подготовке)",
      body:
        "Before/after появятся только из собственных или лицензированных исходников и экспортов Studio — без чужих фото и без выдуманных «кейсов клиентов». Пока готовьте материалы по чеклисту ниже и сверяйтесь с разделами «Как работает» и «Качество AI».",
      checklistTitle: "Что подготовить для будущего примера",
    };
  }
  if (locale === "kk") {
    return {
      title: "Визуалдар (дайындауда)",
      body:
        "Before/after тек өз/лицензиялық файлдар мен Studio экспортынан ғана пайда болады. Қазір «Қалай жұмыс істейді» және AI сапасы бөлімдерін қолданыңыз.",
      checklistTitle: "Дайындау тізімі",
    };
  }
  return {
    title: "Visual examples (in preparation)",
    body:
      "Before/after pairs will ship only from owned or licensed sources and real Studio exports—no stock photos or fabricated client stories. Use the checklists below plus How it works and AI quality pages until assets are approved.",
    checklistTitle: "What to prepare for a future example",
  };
}

export function examplesHubLabels(locale: Locale) {
  if (locale === "ru") {
    return {
      categories: "Категории примеров",
      related: "Полезные материалы",
      visuals: "Визуальные материалы",
      plannedCases: "Запланированные кейсы",
      noAssetsYet: "Изображения не подключены",
      before: "До",
      after: "После",
      allExamples: "Все примеры",
      back: "← Vitrina AI",
      backExamples: "← Примеры",
      quality: "Качество AI",
      studio: "Открыть студию",
    };
  }
  if (locale === "kk") {
    return {
      categories: "Мысал санаттары",
      related: "Байланысты материалдар",
      visuals: "Визуалдар",
      plannedCases: "Жоспарланған кейстер",
      noAssetsYet: "Суреттер қосылмаған",
      before: "Бұрын",
      after: "Кейін",
      allExamples: "Барлық мысалдар",
      back: "← Vitrina AI",
      backExamples: "← Мысалдар",
      quality: "AI сапасы",
      studio: "Студияны ашу",
    };
  }
  return {
    categories: "Example categories",
    related: "Related resources",
    visuals: "Visual assets",
    plannedCases: "Planned cases",
    noAssetsYet: "Images not connected yet",
    before: "Before",
    after: "After",
    allExamples: "All examples",
    back: "← Vitrina AI",
    backExamples: "← Examples",
    quality: "AI quality",
    studio: "Open studio",
  };
}
