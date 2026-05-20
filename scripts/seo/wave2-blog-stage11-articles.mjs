/**
 * Authored Wave 2 blog bodies for Stage 11 (topics 6,7,9,10,19,20,29,34–36,49,55,60,61,63,67,75,77,94,96).
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
import {
  getGeneratedEnArticles,
  getGeneratedRuArticles,
} from "./wave2-blog-stage11-generate.mjs";

const STUDIO = { label: "Open studio", href: "/studio" };
const STUDIO_RU = { label: "Открыть студию", href: "/studio" };
const COST_RU = { label: "Стоимость", href: "/ru/cost" };
const COST_EN = { label: "Pricing", href: "/en/cost" };
const QUALITY_RU = { label: "Качество AI", href: "/ru/quality" };
const QUALITY_EN = { label: "AI quality", href: "/en/quality" };
const HOW_RU = { label: "Как работает", href: "/ru/how-it-works" };
const HOW_EN = { label: "How it works", href: "/en/how-it-works" };

function linksRu(picks) {
  return [STUDIO_RU, COST_RU, ...picks];
}

function linksEn(picks) {
  return [STUDIO, COST_EN, ...picks];
}

/** @type {Record<string, import('./wave2-blog-stage11-lib.mjs').Article>} */
const ru = {};

/** @type {Record<string, import('./wave2-blog-stage11-lib.mjs').Article>} */
const en = {};

// ——— blog_006 ———
ru[topicId(6)] = {
  title:
    "Как AI помогает продавцам маркетплейсов: сценарии, экономия времени и честные ограничения",
  metaDescription:
    "Где AI ускоряет карточки Kaspi, Wildberries и Ozon: фон, каталог, одежда на модели. Без гарантий модерации и без статуса официального партнёра площадок.",
  intro: p(
    "Продавцы маркетплейсов в Казахстане и СНГ тратят часы на однотипные кадры: белый фон, выравнивание серии, дополнительные ракурсы.",
    "AI не заменяет бизнес-логику и модерацию, но сокращает путь от снимка на телефон до черновика карточки.",
    "Ниже — практические сценарии, где Vitrina AI Studio реально экономит время, и где без фотографа или ручной проверки лучше не публиковать.",
    DISCLAIMER_RU
  ),
  shortAnswer: p(
    "AI помогает с фоном, точной карточкой, одеждой на модели и пакетной подготовкой каталога.",
    "Каждый экспорт сравнивайте с реальным товаром; сервис не гарантирует принятие карточки и не является партнёром Kaspi, WB или Ozon.",
    VIDEO_NOTE_RU
  ),
  sections: [
    sec(
      "Три сценария, которые чаще всего окупаются",
      [
        "Первый — запуск новых SKU без студии: снимок в шоуруме, белый фон или product shot, загрузка в кабинет после QA.",
        "Второй — выравнивание каталога, где у поставщиков разный фон: AI приводит серию к одному стилю, но не меняет комплект.",
        "Третий — одежда и аксессуары, где нужен единый визуальный ряд без съёмки каждой вещи на модели.",
        "Для каждого сценария заведите чеклист: форма, цвет, узор, фурнитура, этикетки — и ответственного за финальный экспорт.",
      ],
      [
        "Сценарий «быстрый тест ниши» тоже уместен: десять SKU за вечер вместо недели съёмок.",
        "Но тест не означает отсутствие проверки — наоборот, на старте ловятся типичные искажения AI.",
        "Фиксируйте в таблице SKU: исходник, версия AI, дата проверки, кто утвердил.",
        "Так проще масштабировать процесс на вторую площадку без повторения ошибок.",
      ],
      [
        "Не смешивайте в одной карточке AI-кадр и чужое фото с Pinterest — риск блокировки и претензий.",
        "Используйте только свой исходник или лицензированный материал поставщика.",
        "Сохраняйте оригинал рядом с AI-версией для споров с покупателем.",
        "Честная карточка важнее «киношного» фона, который меняет оттенок товара.",
      ],
      [
        "Свяжите AI-workflow с гайдами по Kaspi, Wildberries и Ozon в блоге — правила изображений меняются.",
        "Перед пакетной загрузкой прочитайте актуальную справку кабинета, а не пост в соцсети годичной давности.",
        "Vitrina AI ускоряет производство, но не читает правила за вас.",
        "Ответственность за публикацию остаётся у продавца.",
      ]
    ),
    sec(
      "Экономия времени vs скрытые затраты",
      [
        "Экономия — в повторяемых операциях: удаление фона, замена сцены, примерка одежды на AI-модель.",
        "Скрытые затраты — возвраты из-за неверного цвета, переделки после отклонения модерации, репутация магазина.",
        "Считайте не только минуты генерации, но и минуты проверки на большом экране.",
        "Если QA пропускает ошибку на бестселлере, экономия обнуляется за один день.",
      ],
      [
        "Пакетная генерация без выборочного контроля каждого 5–10 SKU размножает одну системную ошибку.",
        "Назначьте одного утверждающего на категорию: одежда, электроника, украшения — у каждой свои ловушки.",
        "Регенерация дешевле возврата с формулировкой «не тот цвет».",
        "Не обещайте в тексте карточки то, чего нет на фото.",
      ],
      [
        "Сравните с альтернативой — фотосессия — в статье про выбор AI или съёмки.",
        "Для hero-линий бренда фотограф может оставаться нужен; для длинного хвоста SKU AI часто достаточен.",
        "Смешанная модель «съёмка для топ-20, AI для остального» встречается у зрелых продавцов.",
        "Главное — единый чеклист качества для обоих каналов.",
      ],
      [
        "Откройте страницу стоимости и посчитайте пилот на 20 SKU: время сотрудника + кредиты студии + риск возвратов.",
        "Только после пилота масштабируйте на весь каталог.",
        "Документируйте, кто снимает, кто генерирует, кто проверяет — иначе процесс расползается.",
        "См. также раздел «Как работает» и «Качество AI» на сайте.",
      ]
    ),
    sec(
      "Kaspi, Wildberries, Ozon: разные акценты",
      [
        "Для Kaspi критичны читаемое превью и соответствие товару на главном кадре.",
        "Для Wildberries — единый стиль серии и посадка одежды на модели.",
        "Для Ozon — дополнительные ракурсы и аккуратная галерея; видео из фото — отдельный сценарий в разработке.",
        "Не копируйте файлы с одной площадки на другую без проверки формата и фона.",
      ],
      [
        "Прочитайте платформенные гайды в блоге: Kaspi, Wildberries, Ozon — они дополняют, но не заменяют справку кабинета.",
        "Vitrina AI не партнёр площадок и не гарантирует модерацию.",
        "При отклонении сравните причину с чеклистом: часто проблема в несоответствии товара, а не в AI как таковом.",
        "Ведите журнал отказов по SKU.",
      ],
      [
        "Региональные магазины часто стартуют с Kaspi, затем добавляют WB.",
        "Планируйте контент-пакет: main, деталь, при необходимости кадр для соцсетей — все с одним SKU и цветом.",
        "Разные площадки — разные пропорции; пересохраняйте, не растягивайте.",
        "Проверяйте миниатюру на телефоне — так видит покупатель.",
      ],
      [
        "Свяжите workflow с точной карточкой и белым фоном в use cases.",
        "Для одежды — отдельный сценарий на AI-модели с проверкой длины и принта.",
        "Перед сезоном обновите пресет фона для всей категории — так каталог выглядит профессионально без студии.",
        "Один час QA на запуске SKU дешевле пакета возвратов.",
      ]
    ),
    sec(
      "Ограничения, которые нельзя игнорировать",
      [
        "AI может сгладить фактуру, сдвинуть оттенок, «дорисовать» фурнитуру или изменить пропорции.",
        "Нет 100% гарантии точности и прохождения модерации.",
        "Ювелирка, стекло, сложная электроника требуют макро-исходника и усиленного контроля.",
        "При сомнении оставьте исходное фото или переснимите при дневном свете.",
      ],
      [
        "Не публикуйте кадр, если на большом экране видны артефакты по краю вырезания.",
        "Тени не должны создавать иллюзию другого размера или скрытой подставки.",
        "Для наборов проверьте, что на фото тот же комплект, что в описании.",
        "См. статьи про сохранение товара в AI и проверку перед публикацией.",
      ],
      [
        "Видео и Reels из фото — в разработке; опирайтесь на проверенные статичные изображения.",
        "Не обещайте покупателю ролик, пока функция недоступна.",
        "Когда видео появится — применяйте тот же чеклист: товар на кадре = товар в посылке.",
        "Честность в описании снижает негативные отзывы сильнее, чем эффектные переходы.",
      ],
      [
        "Обучите менеджера маркетплейса QA, а не только дизайнера.",
        "Раз в квартал обновляйте внутренний чеклист по возвратам с формулировкой «не соответствует фото».",
        "AI — ускоритель, не снимает ответственность продавца.",
        "Откройте студию только после того, как определили роли в команде.",
      ]
    ),
    sec(
      "Пошаговый старт на одной категории",
      [
        "Выберите 5–10 SKU одной категории с простым фоном в исходнике.",
        "Снимите при ровном свете, загрузите в Studio, получите 2–3 варианта на SKU.",
        "Сравните с оригиналом, утвердите чеклист для категории.",
        "Только потом масштабируйте на сотни позиций.",
      ],
      [
        "Зафиксируйте пресет: белый фон или точная карточка, угол съёмки, расстояние до товара.",
        "Сохраните «до/после» в папке SKU для обучения новых сотрудников.",
        "Свяжите процесс со статьёй «как сделать фото товара для маркетплейса».",
        "Добавьте ссылку на улучшение фото без фотографа для команды без студии.",
      ],
      [
        "После пилота посчитайте конверсию и возвраты за две недели — не только скорость загрузки.",
        "Если возвраты по фото выросли — ужесточите QA, а не отключайте проверку.",
        "Интегрируйте напоминание о правилах площадки в CRM или таблицу задач.",
        "Так AI становится частью операционки, а не разовой игрушкой.",
      ],
      [
        "Перейдите к каталогу ecommerce use case, если готовите сотни SKU.",
        "Для аксессуаров и украшений — отдельный гайд по бижутерии.",
        "Не забывайте про стоимость и лимиты генерации при планировании сезона.",
        "Успешный пилот — это повторяемый процесс, а не один удачный кадр.",
      ]
    ),
    sec(
      "Команда и масштабирование",
      [
        "Роли: кто снимает, кто выбирает режим в Studio, кто проверяет, кто грузит в кабинет.",
        "Один человек может совмещать роли на старте, но границы должны быть явными.",
        "Стажёр не должен публиковать без второй пары глаз на спорных кадрах.",
        "Документируйте в Notion или таблице — процесс переживёт отпуск ключевого сотрудника.",
      ],
      [
        "При росте ассортимента добавьте выборочный аудит каждого 10-го SKU после пакетной генерации.",
        "Категории с повторяющимися ошибками AI получают отдельный чеклист — кружево, металл, прозрачный пластик.",
        "Согласуйте визуал с рекламой: баннер и main image должны показывать один вариант товара.",
        "Иначе растёт недоверие даже при хорошем CTR.",
      ],
      [
        "Свяжите продавцов с внутренними статьями про AI-фото для маркетплейсов и сравнение со съёмкой.",
        "Периодически перечитывайте страницу качества AI — там собраны типичные искажения.",
        "Не используйте AI, чтобы скрыть дефект товара на складе — это этически и юридически рискованно.",
        "Честная карточка строит повторные покупки.",
      ],
      [
        "Масштабирование на EN-рынки или Etsy потребует других форматов — планируйте заранее.",
        "Но базовый принцип тот же: исходник, консервативный режим, ручная проверка.",
        "Откройте студию с тестовым SKU сегодня, а не в день дедлайна акции.",
        "Так AI помогает продавцу, а не создаёт аврал с ошибками.",
      ]
    ),
  ],
  checklist: [
    "исходник резкий, товар занимает большую часть кадра",
    "цвет и форма совпадают с реальным SKU",
    "роли съёмка / QA / загрузка назначены",
    "правила площадки сверены в кабинете",
    "нет обещаний, которые не видны на фото",
  ],
  faq: faqRu([
    {
      question: "Подойдёт ли AI для всего каталога сразу?",
      answer:
        "Технически можно генерировать пакетно, но без выборочного QA риск системной ошибки высок. Начните с пилота на одной категории.",
    },
    {
      question: "Заменяет ли AI менеджера маркетплейса?",
      answer: "Нет. AI готовит изображения; описание, цена, логистика и модерация остаются за командой продавца.",
    },
  ]),
  internalLinks: linksRu([
    { label: "AI-фото для маркетплейсов", href: PR.b001 },
    { label: "Фото для Kaspi", href: PR.b031 },
    { label: "Проверка перед публикацией", href: PR.b008 },
    QUALITY_RU,
    HOW_RU,
    { label: "Каталог ecommerce", href: RU_UC.catalog },
  ]),
};

en[topicId(6)] = {
  title: "How AI Helps Marketplace Sellers: Workflows, Time Savings, and Honest Limits",
  metaDescription:
    "Where AI speeds up Kaspi, Wildberries, and Ozon listings: backgrounds, catalog unity, clothing on model. No moderation guarantees; not an official marketplace partner.",
  intro: p(
    "Marketplace sellers in Central Asia and beyond spend hours on repetitive visuals: white backgrounds, series alignment, and extra angles.",
    "AI does not replace business logic or moderation, but it shortens the path from a phone capture to a listing draft.",
    "Below are practical scenarios where Vitrina AI Studio saves real time—and where you should still use a photographer or strict manual review.",
    DISCLAIMER_EN
  ),
  shortAnswer: p(
    "AI helps with backgrounds, exact product cards, clothing on model, and batch catalog prep.",
    "Compare every export to the physical SKU; the service does not guarantee approval and is not an official Kaspi, Wildberries, or Ozon partner.",
    VIDEO_NOTE_EN
  ),
  sections: [
    sec(
      "Three scenarios that usually pay off",
      [
        "Launching new SKUs without a studio: showroom capture, white background or product shot, upload after QA.",
        "Normalizing supplier images with mismatched backgrounds into one catalog style without changing kit contents.",
        "Apparel and accessories that need a consistent look without a model shoot per garment.",
        "Attach a checklist to each scenario: shape, color, pattern, hardware, labels—and one approver for export.",
      ],
      [
        "Niche testing is valid too: ten SKUs in an evening instead of a week of shoots.",
        "Testing does not mean skipping review—early runs reveal typical AI drift.",
        "Track SKU, source file, AI version, review date, and approver in a spreadsheet.",
        "That makes scaling to a second marketplace safer.",
      ],
      [
        "Do not mix AI output with random Pinterest references—account risk and buyer disputes follow.",
        "Use only your own capture or licensed supplier art.",
        "Keep originals next to AI versions for complaints.",
        "An honest card beats a cinematic wrong color.",
      ],
      [
        "Pair the workflow with platform guides for Kaspi, Wildberries, and Ozon in the blog.",
        "Read current seller help before bulk upload, not a year-old social post.",
        "Vitrina AI speeds production; it does not read rules for you.",
        "Publication responsibility stays with the seller.",
      ]
    ),
    sec(
      "Time saved vs hidden costs",
      [
        "Savings come from repeatable steps: background removal, scene swap, apparel on AI model.",
        "Hidden costs are returns for wrong color, moderation rework, and store reputation.",
        "Count review minutes on a large screen, not only generation time.",
        "One missed defect on a bestseller erases savings in a day.",
      ],
      [
        "Batch generation without spot-checking every 5–10 SKUs spreads one systematic error.",
        "Assign one approver per category: apparel, electronics, jewelry—each has different traps.",
        "Regeneration is cheaper than a “wrong color” return.",
        "Do not promise in copy what the image does not show.",
      ],
      [
        "Compare with a photoshoot in our AI vs shoot article.",
        "Hero brand lines may still need a photographer; long-tail SKUs often work with AI.",
        "Many teams mix: shoot for top 20, AI for the rest—with one QA checklist.",
        "Consistency matters more than the tool label.",
      ],
      [
        "Open pricing and pilot twenty SKUs: staff time, Studio credits, return risk.",
        "Scale the catalog only after the pilot.",
        "Document who shoots, generates, and approves—or roles blur.",
        "See How it works and AI quality pages on the site.",
      ]
    ),
    sec(
      "Kaspi, Wildberries, Ozon: different emphasis",
      [
        "Kaspi buyers judge thumbnail clarity and product honesty on the main image.",
        "Wildberries cares about series style and fit on model for apparel.",
        "Ozon values extra angles; video-from-photo is a separate flow still in development.",
        "Do not copy files across platforms without format and background checks.",
      ],
      [
        "Read platform blog guides—they supplement but do not replace seller help centers.",
        "Vitrina AI is not a platform partner and does not guarantee moderation.",
        "When rejected, compare the reason to your checklist—often it is mismatch, not AI itself.",
        "Log rejections by SKU.",
      ],
      [
        "Regional stores often start on Kaspi, then add Wildberries.",
        "Plan a content pack: main, detail, optional social frame—all one SKU and color.",
        "Resize per platform; do not stretch.",
        "Preview on a phone like buyers do.",
      ],
      [
        "Link to exact product card and white background use cases.",
        "For apparel, use clothing-on-model with hem and print checks.",
        "Refresh background presets each season for a pro look without a studio.",
        "One hour of QA beats a return cluster on launch day.",
      ]
    ),
    sec(
      "Limits you cannot ignore",
      [
        "AI may soften texture, shift hue, invent hardware, or change proportions.",
        "There is no 100% accuracy or moderation guarantee.",
        "Jewelry, glass, and complex electronics need macro sources and stricter QA.",
        "When unsure, keep the original or reshoot in diffused daylight.",
      ],
      [
        "Reject frames with visible cutout halos on zoom.",
        "Shadows must not imply a different size or hidden stand.",
        "For bundles, verify kit contents match copy.",
        "See articles on preserving the product and pre-publish review.",
      ],
      [
        "Video and Reels-from-photo are in development—rely on reviewed stills.",
        "Do not promise video until your Studio version supports it.",
        "When video ships, apply the same rule: on-screen product equals shipped product.",
        "Honest copy reduces angry reviews more than flashy transitions.",
      ],
      [
        "Train the marketplace owner on QA, not only design.",
        "Quarterly refresh internal checklists from “not as pictured” returns.",
        "AI is an accelerator, not liability transfer.",
        "Open Studio after roles are clear.",
      ]
    ),
    sec(
      "Step-by-step pilot on one category",
      [
        "Pick 5–10 SKUs in one category with clean sources.",
        "Shoot in even light, upload to Studio, generate 2–3 variants per SKU.",
        "Compare to originals and lock a category checklist.",
        "Then scale to hundreds of lines.",
      ],
      [
        "Fix a preset: white background or exact card, angle, distance.",
        "Save before/after in the SKU folder for onboarding.",
        "Tie to the marketplace product photo workflow article.",
        "Add the without-a-photographer guide for warehouse teams.",
      ],
      [
        "After the pilot, track conversion and returns for two weeks—not only upload speed.",
        "If photo-related returns rise, tighten QA instead of skipping it.",
        "Embed marketplace rule reminders in your task system.",
        "AI becomes operations, not a one-off experiment.",
      ],
      [
        "Move to ecommerce catalog use case for hundred-SKU waves.",
        "Jewelry needs its own marketplace photo guide.",
        "Plan credits and pricing before peak season.",
        "A successful pilot is a repeatable process, not one lucky frame.",
      ]
    ),
    sec(
      "Team roles and scaling",
      [
        "Define shooter, Studio mode picker, reviewer, and uploader.",
        "One person may wear multiple hats early, but boundaries must be explicit.",
        "Juniors should not publish disputed frames without a second reviewer.",
        "Document in Notion or sheets so vacations do not break the pipeline.",
      ],
      [
        "At scale, audit every 10th SKU after batch runs.",
        "Categories with repeat AI errors get extra checklists—lace, metal, clear plastic.",
        "Align ads with listings: banners must show the same variant.",
        "Trust drops when CTR is high but photos disagree.",
      ],
      [
        "Point staff to AI product photography basics and AI vs photoshoot comparison.",
        "Revisit the AI quality page for common drift patterns.",
        "Do not use AI to hide warehouse defects—ethical and legal risk.",
        "Honest listings drive repeat buyers.",
      ],
      [
        "International or Etsy expansion needs other formats—plan ahead.",
        "The core rule stays: source, conservative mode, manual review.",
        "Open Studio with a test SKU before a promo deadline—not during it.",
        "That is how AI helps sellers without error avalanches.",
      ]
    ),
  ],
  checklist: [
    "sharp source, product fills most of the frame",
    "color and shape match the physical SKU",
    "shoot / QA / upload roles assigned",
    "marketplace rules checked in seller help",
    "copy does not promise unseen items",
  ],
  faq: faqEn([
    {
      question: "Can I run AI on the entire catalog at once?",
      answer:
        "Batch runs are possible, but without spot QA systemic errors spread fast. Start with one category pilot.",
    },
    {
      question: "Does AI replace a marketplace manager?",
      answer:
        "No. AI prepares images; copy, pricing, logistics, and moderation stay with your team.",
    },
  ]),
  internalLinks: linksEn([
    { label: "AI product photography basics", href: PE.b001 },
    { label: "Kaspi product photos", href: PE.b031 },
    { label: "Review before publishing", href: PE.b008 },
    QUALITY_EN,
    HOW_EN,
    { label: "Ecommerce catalog", href: EN_UC.catalog },
  ]),
};

export function getWave2RuArticles() {
  return { ...getGeneratedRuArticles(), ...ru };
}

export function getWave2EnArticles() {
  return { ...getGeneratedEnArticles(), ...en };
}
