/** Pass 2 remainder — merged with pass2 in index.ts */

export const pass2RemainderRu = {
  form: {
    fileFormat: "Формат файла",
    frameFormat: "Формат кадра",
    quality: "Качество",
    duration: "Длительность",
    motion: "Движение",
    aspectRatio: "Соотношение сторон",
    selectFormat: "Выберите формат",
    selectBackground: "Выберите фон",
    collapse: "Свернуть",
  },
  imageSettings: {
    aspect9x16: "9:16 — вертикальный кадр",
    aspect4x5: "4:5 — маркетплейсы / соцсети",
    aspect1x1: "1:1 — квадрат",
    aspect3x4: "3:4 — карточка товара",
    aspect4x3: "4:3 — горизонтальный кадр",
    aspect16x9: "16:9 — баннер",
    qualityFast: "Быстро",
    qualityBalanced: "Стандарт",
    qualityHigh: "Максимум",
    preserveProduct: "Сохранять товар точно",
    preserveProductHint:
      "AI изменит только сцену, свет и фон — сам товар останется как есть.",
  },
  videoSettings: {
    aspect9x16: "9:16 — Reels / Stories",
    aspect4x5: "4:5 — маркетплейсы / соцсети",
    aspect1x1: "1:1 — квадрат",
    aspect16x9: "16:9 — горизонтальное видео",
    durationSec: "{n} сек",
    motionSubtle: "Мягкое движение камеры",
    motionTurn: "Поворот модели",
    motionPush: "Приближение",
    motionFidelity: "Товар без искажений",
  },
  processedAssetsEditorReset: {
    aspectUnsupported:
      "формат кадра {from} не поддерживается, переключили на {to}",
    formatUnsupported:
      "формат файла {from} не поддерживается, переключили на {to}",
    editorNote: "Этот редактор: {messages}.",
  },
  aiEditorPicker: { title: "Выберите AI-редактор" },
  beforeAfter: { title: "До / После", before: "До", after: "После" },
  garmentSettings: {
    photoTypeLabel: "Тип исходного фото",
    photoTypeHelper:
      "По умолчанию AI определяет автоматически. Меняйте только если примерка ошибается.",
  },
  imageUploader: {
    formatsHint:
      "JPEG, PNG или WEBP до 10MB. Файл не сохраняется у нас и временно передаётся в облачный AI-сервис только для обработки.",
    dropzone: "Выберите файл или перетащите его сюда",
    clearFileAria: "Очистить выбранный файл",
    previewAlt: "Предпросмотр: {label}",
  },
  modelAngles: {
    uploadFirst:
      "Сначала загрузите фото в шаге «Товар» выше — затем можно подобрать позу с него.",
    posePlaceholder:
      "Или опишите позу вручную: три четверти, руки на бёдрах…",
  },
  modelInputMode: {
    create: "Создать модель",
    upload: "Своя модель",
    ariaLabel: "Способ выбора модели",
  },
  modelPrompt: {
    previewTitle: "Итоговый промт (превью)",
    previewHint:
      "Краткое превью. Можете описать детали своими словами — при генерации промт проходит ИИ-улучшение и перевод для модели.",
    addDescription: "Добавить своё описание",
    additionTitle: "Ваше дополнение",
    additionHint:
      "Опишите фон, свет или настроение своими словами — не меняет возраст, тип фигуры и позу из базы. При генерации текст пройдёт ИИ-улучшение.",
    additionPlaceholder:
      "Например: белый фон Wildberries, мягкая тень за моделью, уверенная поза, руки по бокам",
    remove: "Убрать",
    edit: "Изменить",
  },
  modelReady: {
    anglesTitle: "Готовые ракурсы ({count})",
    singleTitle: "Готовый вариант",
    alt: "Сгенерированная AI-модель",
    lockForAll: "Закрепить для всех ракурсов",
    lockedHint:
      "Модель закреплена — при смене фото товара лицо и образ не меняются.",
    saved: "Модель сохранена",
    save: "Сохранить модель",
    replace: "Заменить модель",
  },
  previewCarousel: {
    indexOf: "{current} из {total}",
    downloadThisFrame: "Скачать этот кадр",
    prevAngle: "Предыдущий ракурс",
    nextAngle: "Следующий ракурс",
    slideAria: "{label}, слайд {n}",
  },
  resultActions: { downloadThisFrame: "Скачать этот кадр" },
  productShot: {
    marketplaceHelp:
      "Стандартная карточка для Kaspi, Wildberries и Ozon: ровный нейтральный фон, товар остаётся как на вашем фото — меняется только подложка, без декора и без перекраски изделия.",
    sceneMarketplace: "Маркетплейс",
    sceneWhite: "Белый фон",
    sceneWhiteHint: "Чистый белый фон — универсальный вариант для карточки.",
    sceneGray: "Светло-серый фон",
    sceneGrayHint: "Мягкий серый фон — чуть мягче белого, всё ещё нейтрально.",
    title: "Настройки товарной карточки",
    subtitle:
      "Точная карточка для маркетплейсов: фон меняется, товар остаётся как на фото.",
    backgroundLabel: "Фон карточки",
    aspectFallback: "Формат кадра для карточки.",
  },
  productCard: {
    tabProduct: "Товар",
    tabResult: "Итог",
    ariaProductCard: "Товарная карточка",
    ariaResult: "Результат генерации",
    formatLabel: "Формат {label}",
    exportFormatAria: "Формат выгрузки",
    pngNoBg: "PNG без фона",
    pngNoBgFor: "{label}: PNG без фона",
    imageLabelProduct: "товар",
  },
  productSetProgress: {
    analyze: "Анализ",
    model: "Модель",
    tryon: "Примерка",
    done: "Готово",
    error: "Ошибка",
    waiting: "Ожидание",
    setProgress: "Комплект: {done} из {total} готово",
    serialHint:
      "Ракурсы обрабатываются по очереди (не параллельно) — так сохраняется одно лицо модели.",
  },
  productPoseFromPhoto: {
    matchedTitle: "Поза по фото товара",
    describeManual: "Описать позу вручную",
    title: "Поза с фото товара",
    hint: "AI посмотрит на загруженное фото товара и подберёт похожую позу для генерации модели.",
    cta: "Подобрать позу по фото товара",
  },
  productShotChecklist: {
    header: "Проверка товара · {completed}/{total}",
    creativeWarning:
      "AI-сцена может менять детали. Сравните с исходником перед скачиванием.",
    productColorAccurate: "Цвет товара сохранён",
    productShapeAccurate: "Форма товара не изменилась",
    itemCountMatches: "Количество элементов совпадает",
    materialTextureSimilar: "Материал и текстура похожи",
    noExtraDetails: "Нет лишних деталей",
    noNewColorsGemsChains: "Нет новых цветов, камней или цепочек",
    noExtraObjectsInCard: "Лишние предметы не попали в карточку",
    backgroundClean: "Фон чистый",
    marketplaceReady: "Фото подходит для карточки товара",
  },
  qualityChecklist: {
    header: "Проверка качества · {completed}/{total}",
    readyBadge: "Готово к скачиванию",
    reviewBadge: "Проверьте перед публикацией",
    hint: "Отметьте все пункты только если товар выглядит правильно.",
    productColorAccurate: "Цвет товара сохранён",
    productShapeAccurate: "Форма товара не искажена",
    textureAndPatternAccurate: "Текстура, узор и детали похожи на оригинал",
    modelAnatomyOk: "Анатомия модели выглядит нормально",
    handsAndEdgesOk: "Руки, края одежды и контуры без явных артефактов",
    backgroundClean: "Фон чистый",
    noTextOrWatermark: "Нет лишнего текста, водяных знаков или логотипов",
    marketplaceReady: "Фото можно использовать для карточки товара",
  },
  saasCountdown: {
    label: "Создаём фото на модели",
    hint: "Обычно укладываемся раньше — результат появится сразу, как будет готов.",
  },
  previewCard: {
    generating: "Генерируем…",
    moreAngles: "Остальные ракурсы ещё генерируются…",
    previewAlt: "Предпросмотр: {title}",
    resultTitle: "Результат",
  },
  studioFiles: {
    title: "Мои файлы",
    download: "Скачать",
    downloadVideo: "Скачать видео",
    delete: "Удалить",
  },
  studioFilesPagination: {
    navAria: "Пагинация файлов",
    prev: "Назад",
    next: "Вперёд",
    prevPageAria: "Предыдущая страница",
    nextPageAria: "Следующая страница",
    pageAria: "Страница {page}",
  },
  studioWorkflow: {
    stepLabel: "Шаг {n}",
    optionalBadge: "необязательно",
  },
  studioAssetPreview: {
    processing: "AI обрабатывает файл",
    failed: "Не удалось создать",
  },
  postProcessingActions: {
    whatCreate: "Что создать?",
    image: "Изображение",
    video: "Видео",
  },
  productCardExport: {
    createAgain: "Создать ещё раз",
    removeCardHint:
      "Убрать готовую карточку. Фото, рамка и настройки останутся.",
    cardAlt: "{label}: {format}",
    cutoutAlt: "{label}: PNG без фона",
  },
  studioWorkflowStep: {
    stepAria: "Шаг {step}: {label}",
    stepAriaNoLabel: "Шаг {step}",
  },
  productShotRail: { optional: "необязательно" },
} as const;

export const pass2RemainderEn = {
  form: {
    fileFormat: "File format",
    frameFormat: "Frame format",
    quality: "Quality",
    duration: "Duration",
    motion: "Motion",
    aspectRatio: "Aspect ratio",
    selectFormat: "Select format",
    selectBackground: "Select background",
    collapse: "Collapse",
  },
  imageSettings: {
    aspect9x16: "9:16 — vertical frame",
    aspect4x5: "4:5 — marketplaces / social",
    aspect1x1: "1:1 — square",
    aspect3x4: "3:4 — product card",
    aspect4x3: "4:3 — horizontal frame",
    aspect16x9: "16:9 — banner",
    qualityFast: "Fast",
    qualityBalanced: "Standard",
    qualityHigh: "Maximum",
    preserveProduct: "Preserve product exactly",
    preserveProductHint:
      "AI changes only scene, light, and background — the product stays as-is.",
  },
  videoSettings: {
    aspect9x16: "9:16 — Reels / Stories",
    aspect4x5: "4:5 — marketplaces / social",
    aspect1x1: "1:1 — square",
    aspect16x9: "16:9 — horizontal video",
    durationSec: "{n} sec",
    motionSubtle: "Subtle camera motion",
    motionTurn: "Model turn",
    motionPush: "Camera push-in",
    motionFidelity: "Product fidelity",
  },
  processedAssetsEditorReset: {
    aspectUnsupported:
      "Frame format {from} is not supported; switched to {to}",
    formatUnsupported:
      "File format {from} is not supported; switched to {to}",
    editorNote: "This editor: {messages}.",
  },
  aiEditorPicker: { title: "Choose AI editor" },
  beforeAfter: { title: "Before / After", before: "Before", after: "After" },
  garmentSettings: {
    photoTypeLabel: "Source photo type",
    photoTypeHelper:
      "AI detects automatically by default. Change only if try-on misbehaves.",
  },
  imageUploader: {
    formatsHint:
      "JPEG, PNG, or WEBP up to 10MB. We do not store the file; it is sent temporarily to the cloud AI service for processing only.",
    dropzone: "Choose a file or drag it here",
    clearFileAria: "Clear selected file",
    previewAlt: "Preview: {label}",
  },
  modelAngles: {
    uploadFirst:
      "Upload a photo in the «Product» step above first — then you can match pose from it.",
    posePlaceholder:
      "Or describe pose manually: three-quarter, hands on hips…",
  },
  modelInputMode: {
    create: "Create model",
    upload: "Your model",
    ariaLabel: "How to choose model",
  },
  modelPrompt: {
    previewTitle: "Final prompt (preview)",
    previewHint:
      "Short preview. Add details in your words — at generation the prompt is AI-enhanced and translated for the model.",
    addDescription: "Add your description",
    additionTitle: "Your addition",
    additionHint:
      "Describe background, light, or mood — does not change age, body type, or pose from base. Text is AI-enhanced at generation.",
    additionPlaceholder:
      "e.g. white Wildberries background, soft shadow behind model, confident pose, arms at sides",
    remove: "Remove",
    edit: "Edit",
  },
  modelReady: {
    anglesTitle: "Ready angles ({count})",
    singleTitle: "Ready variant",
    alt: "Generated AI model",
    lockForAll: "Lock for all angles",
    lockedHint:
      "Model locked — when you change the product photo, face and look stay the same.",
    saved: "Model saved",
    save: "Save model",
    replace: "Replace model",
  },
  previewCarousel: {
    indexOf: "{current} of {total}",
    downloadThisFrame: "Download this frame",
    prevAngle: "Previous angle",
    nextAngle: "Next angle",
    slideAria: "{label}, slide {n}",
  },
  resultActions: { downloadThisFrame: "Download this frame" },
  productShot: {
    marketplaceHelp:
      "Standard card for Kaspi, Wildberries, and Ozon: even neutral background; product stays as in your photo — only the backdrop changes, no decor or recolor.",
    sceneMarketplace: "Marketplace",
    sceneWhite: "White background",
    sceneWhiteHint: "Clean white — universal for product cards.",
    sceneGray: "Light gray background",
    sceneGrayHint: "Soft gray — slightly softer than white, still neutral.",
    title: "Product card settings",
    subtitle:
      "Exact marketplace card: background changes, product stays as in the photo.",
    backgroundLabel: "Card background",
    aspectFallback: "Frame format for the card.",
  },
  productCard: {
    tabProduct: "Product",
    tabResult: "Result",
    ariaProductCard: "Product card",
    ariaResult: "Generation result",
    formatLabel: "Format {label}",
    exportFormatAria: "Export format",
    pngNoBg: "PNG without background",
    pngNoBgFor: "{label}: PNG without background",
    imageLabelProduct: "product",
  },
  productSetProgress: {
    analyze: "Analysis",
    model: "Model",
    tryon: "Try-on",
    done: "Done",
    error: "Error",
    waiting: "Waiting",
    setProgress: "Set: {done} of {total} ready",
    serialHint:
      "Angles are processed one by one (not in parallel) to keep the same model face.",
  },
  productPoseFromPhoto: {
    matchedTitle: "Pose from product photo",
    describeManual: "Describe pose manually",
    title: "Pose from product photo",
    hint: "AI will look at your product photo and pick a similar pose for model generation.",
    cta: "Match pose from product photo",
  },
  productShotChecklist: {
    header: "Product check · {completed}/{total}",
    creativeWarning:
      "AI scene may change details. Compare with the original before download.",
    productColorAccurate: "Product color preserved",
    productShapeAccurate: "Product shape unchanged",
    itemCountMatches: "Item count matches",
    materialTextureSimilar: "Material and texture similar",
    noExtraDetails: "No extra details",
    noNewColorsGemsChains: "No new colors, gems, or chains",
    noExtraObjectsInCard: "No extra objects in the card",
    backgroundClean: "Background is clean",
    marketplaceReady: "Photo suitable for product card",
  },
  qualityChecklist: {
    header: "Quality check · {completed}/{total}",
    readyBadge: "Ready to download",
    reviewBadge: "Review before publishing",
    hint: "Check all items only if the product looks correct.",
    productColorAccurate: "Product color preserved",
    productShapeAccurate: "Product shape not distorted",
    textureAndPatternAccurate: "Texture, pattern, and details match original",
    modelAnatomyOk: "Model anatomy looks normal",
    handsAndEdgesOk: "Hands, garment edges, and contours without obvious artifacts",
    backgroundClean: "Background is clean",
    noTextOrWatermark: "No extra text, watermarks, or logos",
    marketplaceReady: "Photo can be used for product card",
  },
  saasCountdown: {
    label: "Creating photo on model",
    hint: "Usually finishes sooner — the result appears as soon as it is ready.",
  },
  previewCard: {
    generating: "Generating…",
    moreAngles: "Other angles still generating…",
    previewAlt: "Preview: {title}",
    resultTitle: "Result",
  },
  studioFiles: {
    title: "My files",
    download: "Download",
    downloadVideo: "Download video",
    delete: "Delete",
  },
  studioFilesPagination: {
    navAria: "File pagination",
    prev: "Back",
    next: "Next",
    prevPageAria: "Previous page",
    nextPageAria: "Next page",
    pageAria: "Page {page}",
  },
  studioWorkflow: {
    stepLabel: "Step {n}",
    optionalBadge: "optional",
  },
  studioAssetPreview: {
    processing: "AI is processing the file",
    failed: "Could not create",
  },
  postProcessingActions: {
    whatCreate: "What to create?",
    image: "Image",
    video: "Video",
  },
  productCardExport: {
    createAgain: "Create again",
    removeCardHint:
      "Remove finished card. Photo, frame, and settings stay.",
    cardAlt: "{label}: {format}",
    cutoutAlt: "{label}: PNG without background",
  },
  studioWorkflowStep: {
    stepAria: "Step {step}: {label}",
    stepAriaNoLabel: "Step {step}",
  },
  productShotRail: { optional: "optional" },
} as const;

export const pass2RemainderKk = {
  form: {
    fileFormat: "Файл форматы",
    frameFormat: "Кадр форматы",
    quality: "Сапа",
    duration: "Ұзақтығы",
    motion: "Қозғалыс",
    aspectRatio: "Қатынасы",
    selectFormat: "Форматты таңдаңыз",
    selectBackground: "Фонды таңдаңыз",
    collapse: "Жию",
  },
  imageSettings: {
    aspect9x16: "9:16 — тік кадр",
    aspect4x5: "4:5 — маркетплейс / әлеуметтік",
    aspect1x1: "1:1 — шаршы",
    aspect3x4: "3:4 — тауар карточкасы",
    aspect4x3: "4:3 — көлденең кадр",
    aspect16x9: "16:9 — баннер",
    qualityFast: "Жылдам",
    qualityBalanced: "Стандарт",
    qualityHigh: "Максимум",
    preserveProduct: "Тауарды дәл сақтау",
    preserveProductHint:
      "AI тек сценарий, жарық және фонды өзгертеді — тауар өзгертілмейді.",
  },
  videoSettings: {
    aspect9x16: "9:16 — Reels / Stories",
    aspect4x5: "4:5 — маркетплейс / әлеуметтік",
    aspect1x1: "1:1 — шаршы",
    aspect16x9: "16:9 — көлденең видео",
    durationSec: "{n} сек",
    motionSubtle: "Жұмсақ камера қозғалысы",
    motionTurn: "Модель бұрылысы",
    motionPush: "Жақындату",
    motionFidelity: "Тауар бұрмаланбайды",
  },
  processedAssetsEditorReset: {
    aspectUnsupported:
      "{from} кадр форматы қолдау көрсетілмейді, {to} қойылды",
    formatUnsupported:
      "{from} файл форматы қолдау көрсетілмейді, {to} қойылды",
    editorNote: "Бұл редактор: {messages}.",
  },
  aiEditorPicker: { title: "AI редакторды таңдаңыз" },
  beforeAfter: { title: "Дейін / Кейін", before: "Дейін", after: "Кейін" },
  garmentSettings: {
    photoTypeLabel: "Бастапқы фото түрі",
    photoTypeHelper:
      "Әдепкі бойынша AI өзі анықтайды. Примерка қателесе ғана өзгертіңіз.",
  },
  imageUploader: {
    formatsHint:
      "JPEG, PNG немесе WEBP 10MB дейін. Файл сақталмайды, уақытша AI сервисіне жіберіледі.",
    dropzone: "Файлды таңдаңыз немесе осында сүйреңіз",
    clearFileAria: "Таңдалған файлды тазалау",
    previewAlt: "Алдын ала қарау: {label}",
  },
  modelAngles: {
    uploadFirst:
      "Алдымен жоғарыдағы «Тауар» қадамында фото жүктеңіз — содан позаны таңдауға болады.",
    posePlaceholder:
      "Немесе позаны қолмен сипаттаңыз: үш төрт, қолдар жамбаста…",
  },
  modelInputMode: {
    create: "Модель жасау",
    upload: "Өз моделіңіз",
    ariaLabel: "Модель таңдау тәсілі",
  },
  modelPrompt: {
    previewTitle: "Қорытынды промпт (алдын ала)",
    previewHint:
      "Қысқа алдын ала қарау. Өз сөзіңізбен толықтыра аласыз — генерацияда промпт AI арқылы жақсартылады.",
    addDescription: "Өз сипаттаманы қосу",
    additionTitle: "Сіздің толықтыру",
    additionHint:
      "Фон, жарық немесе көңіл-күй — жасты, дене түрін, позаны өзгертпейді. Мәтін AI арқылы жақсартылады.",
    additionPlaceholder:
      "Мысалы: ақ Wildberries фоны, модель артында жұмсақ көлеңке",
    remove: "Өшіру",
    edit: "Өзгерту",
  },
  modelReady: {
    anglesTitle: "Дайын ракурстар ({count})",
    singleTitle: "Дайын нұсқа",
    alt: "AI генерацияланған модель",
    lockForAll: "Барлық ракурсқа бекіту",
    lockedHint:
      "Модель бекітілді — тауар фотосын ауыстырсаңыз, бет пен образ өзгермейді.",
    saved: "Модель сақталды",
    save: "Модельді сақтау",
    replace: "Модельді ауыстыру",
  },
  previewCarousel: {
    indexOf: "{current} / {total}",
    downloadThisFrame: "Осы кадрды жүктеп алу",
    prevAngle: "Алдыңғы ракурс",
    nextAngle: "Келесі ракурс",
    slideAria: "{label}, слайд {n}",
  },
  resultActions: { downloadThisFrame: "Осы кадрды жүктеп алу" },
  productShot: {
    marketplaceHelp:
      "Kaspi, Wildberries, Ozon үшін стандарт карточка: бейтарап фон, тауар фотодағыдай — тек фон ауысады.",
    sceneMarketplace: "Маркетплейс",
    sceneWhite: "Ақ фон",
    sceneWhiteHint: "Таза ақ фон — карточка үшін универсал.",
    sceneGray: "Ашық сұр фон",
    sceneGrayHint: "Жұмсақ сұр — аққа қарағанда жұмсақ, бейтарап.",
    title: "Тауар карточкасы баптаулары",
    subtitle:
      "Нақты маркетплейс карточкасы: фон ауысады, тауар фотодағыдай қалады.",
    backgroundLabel: "Карточка фоны",
    aspectFallback: "Карточка үшін кадр форматы.",
  },
  productCard: {
    tabProduct: "Тауар",
    tabResult: "Нәтиже",
    ariaProductCard: "Тауар карточкасы",
    ariaResult: "Генерация нәтижесі",
    formatLabel: "Формат {label}",
    exportFormatAria: "Экспорт форматы",
    pngNoBg: "Фонсыз PNG",
    pngNoBgFor: "{label}: фонсыз PNG",
    imageLabelProduct: "тауар",
  },
  productSetProgress: {
    analyze: "Талдау",
    model: "Модель",
    tryon: "Примерка",
    done: "Дайын",
    error: "Қате",
    waiting: "Күту",
    setProgress: "Комплект: {done} / {total} дайын",
    serialHint:
      "Ракурстар кезекпен өңделеді (параллель емес) — бір модель беті сақталады.",
  },
  productPoseFromPhoto: {
    matchedTitle: "Тауар фотосынан поза",
    describeManual: "Позаны қолмен сипаттау",
    title: "Тауар фотосынан поза",
    hint: "AI жүктелген тауар фотосына қарап модель генерациясына ұқсас позаны таңдайды.",
    cta: "Тауар фотосынан позаны таңдау",
  },
  productShotChecklist: {
    header: "Тауар тексеруі · {completed}/{total}",
    creativeWarning:
      "AI сцена детальдарды өзгертуі мүмкін. Жүктеп алмас бұрын бастапқымен салыстырыңыз.",
    productColorAccurate: "Тауар түсі сақталған",
    productShapeAccurate: "Тауар пішіні өзгермеген",
    itemCountMatches: "Элемент саны сәйкес",
    materialTextureSimilar: "Мата мен текстура ұқсас",
    noExtraDetails: "Артық деталь жоқ",
    noNewColorsGemsChains: "Жаңа түс, тас немесе тізбе жоқ",
    noExtraObjectsInCard: "Артық заттар карточкаға түспеген",
    backgroundClean: "Фон таза",
    marketplaceReady: "Фото тауар карточкасына жарамды",
  },
  qualityChecklist: {
    header: "Сапа тексеруі · {completed}/{total}",
    readyBadge: "Жүктеп алуға дайын",
    reviewBadge: "Жарияламас бұрын тексеріңіз",
    hint: "Тауар дұрыс көрінсе ғана барлық тармақтарды белгілеңіз.",
    productColorAccurate: "Тауар түсі сақталған",
    productShapeAccurate: "Тауар пішіні бұрмаланбаған",
    textureAndPatternAccurate: "Текстура, өрнек және детальдар бастапқыға ұқсас",
    modelAnatomyOk: "Модель анатомиясы қалыпты",
    handsAndEdgesOk: "Қолдар, киім шеттері мен контурларда артефакт жоқ",
    backgroundClean: "Фон таза",
    noTextOrWatermark: "Артық мәтін, су белгісі немесе логотип жоқ",
    marketplaceReady: "Фото тауар карточкасына қолдануға болады",
  },
  saasCountdown: {
    label: "Модельде фото жасалуда",
    hint: "Әдетте тезірек — дайын болғанда нәтиже бірден пайда болады.",
  },
  previewCard: {
    generating: "Генерацияланады…",
    moreAngles: "Басқа ракурстар әлі генерацияда…",
    previewAlt: "Алдын ала қарау: {title}",
    resultTitle: "Нәтиже",
  },
  studioFiles: {
    title: "Менің файлдарым",
    download: "Жүктеп алу",
    downloadVideo: "Видеоны жүктеп алу",
    delete: "Өшіру",
  },
  studioFilesPagination: {
    navAria: "Файл беттеуі",
    prev: "Артқа",
    next: "Алға",
    prevPageAria: "Алдыңғы бет",
    nextPageAria: "Келесі бет",
    pageAria: "Бет {page}",
  },
  studioWorkflow: {
    stepLabel: "Қадам {n}",
    optionalBadge: "міндетті емес",
  },
  studioAssetPreview: {
    processing: "AI файлды өңдеуде",
    failed: "Жасалмады",
  },
  postProcessingActions: {
    whatCreate: "Не жасау керек?",
    image: "Сурет",
    video: "Видео",
  },
  productCardExport: {
    createAgain: "Қайта жасау",
    removeCardHint:
      "Дайын карточканы өшіру. Фото, рамка, баптаулар қалады.",
    cardAlt: "{label}: {format}",
    cutoutAlt: "{label}: фонсыз PNG",
  },
  studioWorkflowStep: {
    stepAria: "Қадам {step}: {label}",
    stepAriaNoLabel: "Қадам {step}",
  },
  productShotRail: { optional: "міндетті емес" },
} as const;
