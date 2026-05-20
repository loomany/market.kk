import type { StaticRouteKey } from "@/lib/i18n/routeSlugs";

type KkFeatureEnhancement = {
  intro: string;
  sections: Array<{ title: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
  internalLinks: Array<{ label: string; href: string }>;
};

const commonFaq: KkFeatureEnhancement["faq"] = [
  {
    question: "AI фотосын тексерусіз жариялауға бола ма?",
    answer:
      "Жоқ. AI түсін, пішінді, өрнекті немесе ұсақ детальдарды өзгертуі мүмкін. Kaspi немесе басқа маркетплейске жүктемес бұрын нақты тауармен салыстырыңыз.",
  },
  {
    question: "Vitrina AI модерацияны кепілдей ме?",
    answer:
      "Жоқ. Vitrina AI Studio тәуелсіз құрал, маркетплейстердің ресми серіктесі емес. Ережелер өзгереді — сатушы өзі тексереді.",
  },
  {
    question: "Кәсіби фотосуретші керек пе?",
    answer:
      "Каталогты жаңарту үшін смартфонмен түзетілген бастапқы фото жиі жеткілікті. Премиум hero-кадрларға фотосуретші қажет болуы мүмкін.",
  },
  {
    question: "Қайдан бастау керек?",
    answer:
      "Студияны ашыңыз, бастапқы фотоны жүктеңіз, сценарийді таңдаңыз (фон, карточка, киім модельде) және жарияламас бұрын нәтижені тексеріңіз.",
  },
];

export const kkFeatureLandingEnhancements: Partial<
  Record<StaticRouteKey, KkFeatureEnhancement>
> = {
  aiProductPhotoStudio: {
    intro:
      "Vitrina AI Studio — Kaspi, Wildberries, Ozon және Instagram Shop сатушыларына арналған тауар фотосын дайындау алаңы: фон, нақты карточка, киімді AI модельде көрсету. Бұл фотосуретшіні толығымен алмастыру емес — әр экспортты қолмен тексеру керек.",
    sections: [
      {
        title: "Студияда не істеуге болады",
        body:
          "Бастапқы фотодан фонды тазалау, ақ/бейтарап фон, product shot немесе киімді ересек AI модельде көрсету. Мәймітті детальдар үшін өткір исходник қажет — AI тастар мен қырқынды «жұмсарта» алуы мүмкін. Видео/Reels сценарийлері әзірленуде; қолжетімді болмаса, тек тексерілген статиканы пайдаланыңыз.",
      },
      {
        title: "Сатушы workflow",
        body:
          "Түсіріңіз → Studio-ға жүктеңіз → түс, пішін, жинақты салыстырыңыз → тек QA өткен файлдарды экспорттаңыз → маркетплейс кабинетіне жүктеңіз. SKU сериясы үшін бір фон пресеті мен бір тексеру тізімін сақтаңыз.",
      },
      {
        title: "AI шектеулері",
        body:
          "AI идеалды нәтиже немесе модерация кепілдемейді. Түс, пропорция, логотип өзгеруі мүмкін. Күмән болса — қайта генерациялаңыз; Kaspi сатып алушысы нақты тауарды алады.",
      },
      {
        title: "Kaspi және Қазақстан нарығы",
        body:
          "Kaspi-де негізгі сурет пен галерея сатушы сеніміне әсер етеді. Vitrina AI ресми серіктес емес — жарияламас бұрын кабинет анықтамасын оқыңыз.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Студияны ашу", href: "/studio" },
      { label: "Бағалар", href: "/kk/cost" },
      { label: "AI сатушыларға", href: "/kk/blog/ai-marketpleisterge-satushylaryna-komek-korsetedi" },
      { label: "Түс пішін сақтау", href: "/kk/blog/ai-fotoda-tus-pishindi-saktau" },
      { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    ],
  },
  productPhotoForMarketplaces: {
    intro:
      "Маркетплейске тауар фотосы — бір «әдемі кадр» емес, SKU-ды түсіндіретін кадрлар жинағы. AI серияны бір стильге жақындатады, бірақ соңғы жауапкершілік сатушыда.",
    sections: [
      {
        title: "Сатып алушы не қарайды",
        body:
          "Превьюда түс пен пішінді салыстырады. Фото мен сипаттама сәйкес болмағанда қайтарулар артады. Негізгі кадр мен галерея бір түсті, бір жинақты көрсетуі керек.",
      },
      {
        title: "Ақ фон және product shot",
        body:
          "Көптеген категорияларда ақ/бейтарап фон қауіпсізірек. AI кейін қырқынды тексеріңіз — кисточкалар, тозаңдар, тінтуірлер кесіліп қалуы мүмкін.",
      },
      {
        title: "Kaspi workflow",
        body:
          "Kaspi-де нақты тауар мен визуал сәйкестігі маңызды. Бір сағат QA популяр SKU-да қайтарудан арзан.",
      },
      {
        title: "Қосымша материалдар",
        body:
          "Сату түсіретін фото қателері, AI карточка сапасын тексеру және AI шектеулері туралы мақалалар блогта — тек жарияланған kk беттерге сілтеме.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Студияны ашу", href: "/studio" },
      { label: "Фото қателері", href: "/kk/blog/tauar-fotosynyn-satu-tusiretin-katelikteri" },
      { label: "AI сапа тексеру", href: "/kk/blog/ai-kartochka-sapasyn-tekseru" },
      { label: "Kaspi", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
      { label: "Маркетплейс LP", href: "/kk/marketpleisterge-onim-fotosy" },
    ],
  },
  fashionModelPhotos: {
    intro:
      "Киімді AI модельде көрсету фотосессияны толық алмастырмайды, бірақ жаңа SKU үшін уақыт үнемдейді. Крой, түс және ұзындық сатушы алатын тауармен сәйкес болуы керек.",
    sections: [
      {
        title: "Қашан модель керек",
        body:
          "Көйлек, пальто, спорт киімі сияқты санаттарда flat lay ғана жеткіспейді. AI ересек каталог стилінде көмектеседі — minors және провокациялық кадрларға жол берілмейді.",
      },
      {
        title: "Виртуалды примерка",
        body:
          "Киімді модельге «кію» — визуалды примерка сценарийі. Әр түс/өлшем үшін бөлек QA қажет.",
      },
      {
        title: "Тексеру",
        body:
          "Өлшем, ұзындық, мойын, бел — исходникпен салыстырыңыз. AI пропорцияны өзгертсе — кадрды қабылдамаңыз.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Студияны ашу", href: "/studio" },
      { label: "Примерка дайындау", href: "/kk/blog/ai-primerka-ushin-kiim-fotosyn-dayandau" },
      { label: "AI vs нақты модель", href: "/kk/blog/ai-model-zhane-shyn-model" },
      { label: "Киім модельде", href: "/kk/blog/kiim-ai-model-fotosy" },
    ],
  },
  productVideoGenerator: {
    intro:
      "Тауар видеосы workflow Vitrina AI Studio-да әзірленуде. Бұл бет болашақ сценарийді сипаттайды — production-ready видео уәде етілмейді.",
    sections: [
      {
        title: "Статус",
        body: "Видео және Reels функциялары шыққанға дейін статикалық кадрларға сүйеніңіз. Қолжетімділік нұсқаулығын тексеріңіз.",
      },
      {
        title: "Қазіргі балама",
        body: "Смартфонмен қысқа product video түсіру және CapCut/InShot монтажы — Kaspi сатушылары үшін жұмыс істейтін жол.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Студияны ашу", href: "/studio" },
      { label: "Kaspi фото", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    ],
  },
  jewelryProductPhotos: {
    intro:
      "Әшекей карточкалары макро, блик және тонкие краяларды QA арқылы талап етеді. AI көмектеседі, бірақ тастар мен тізбектерді өзгертуі мүмкін.",
    sections: [
      {
        title: "Макро және жарық",
        body: "Жұмсартылған жарықта түсіріңіз; қатты вспышка AI артефактін арттырады.",
      },
      {
        title: "Studio workflow",
        body: "Нақты карточка режимі консервативтірек. Әр экспортты түпнұсқамен салыстырыңыз.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Студияны ашу", href: "/studio" },
      { label: "AI тауар фотосы", href: "/kk/blog/ai-onim-fotografiyasi" },
    ],
  },
  backgroundGenerator: {
    intro:
      "Тауар фонын алу немесе ауыстыру — карточканы тазалауға көмектеседі, бірақ тауардың өзі өзгермеуі керек. Kaspi main image үшін ақ фон жиі қажет.",
    sections: [
      {
        title: "Фонды алу",
        body:
          "Бастапқы фото таза болса, AI қырқынды жақсы сақтайды. Жарық бұзылғанда AI деталь «жасай» алуы мүмкін.",
      },
      {
        title: "Фонды ауыстыру",
        body:
          "Lifestyle қосымша кадрларға жарамды; main image-де тауар адасып кетпеуі керек.",
      },
      {
        title: "QA",
        body:
          "Кесілген кисточкалар, жалған көлеңке — жиі қателік. Үлкен экранда тексеріңіз.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Студияны ашу", href: "/studio" },
      { label: "Фонды алу", href: "/kk/blog/onim-fonyn-alu" },
      { label: "Түс пішін сақтау", href: "/kk/blog/ai-fotoda-tus-pishindi-saktau" },
      { label: "AI өзгертуі", href: "/kk/blog/ai-nege-tauardy-ozgertedi" },
      { label: "Kaspi", href: "/kk/blog/kaspi-ushin-onim-fotosy" },
    ],
  },
};
