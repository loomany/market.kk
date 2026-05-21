import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import type { pass2Ru } from "./studioCopyPass2";
import type { pass2RemainderRu } from "./studioCopyPass2Remainder";

export type StudioLocale = IndexableLocale;

export type StudioModeCopy = {
  label: string;
  description: string;
  recommendedFor: string;
};

export type StudioCopy = {
  meta: { title: string; description: string };
  language: { ru: string; en: string; kk: string; label: string };
  nav: { home: string };
  hero: { badge: string; title: string; subtitle: string };
  loading: { title: string; subtitle: string };
  modes: Record<"clothing-tryon" | "product-shot" | "post-processing", StudioModeCopy>;
  workflow: {
    product: string;
    productPhoto: string;
    mask: string;
    model: string;
    createPhoto: string;
    marketplaceCard: string;
    done: string;
    optional: string;
  };
  upload: {
    productLabel: string;
    productHintClothing: string;
    productHintSingle: string;
    modelLabel: string;
    modelHintLingerie: string;
    dropzoneSelect: string;
    dropzoneDrag: string;
    replacePhoto: string;
    clearAll: string;
    setCount: string;
    angleAlt: string;
    oneFileOnly: string;
    maxPhotos: string;
    invalidFile: string;
    fileTooLarge: string;
    invalidType: string;
    dropzoneSingle: string;
    dropzoneMulti: string;
    dropzoneHintSingle: string;
    dropzoneHintMulti: string;
    oneProductPhoto: string;
    clearAllTitle: string;
    previewAlt: string;
    uploading: string;
  };
  common: {
    product: string;
    model: string;
    result: string;
    summary: string;
    download: string;
    downloadAll: string;
    cancel: string;
    save: string;
    delete: string;
    select: string;
    back: string;
    hasPreview: string;
    formatLabel: string;
    auto: string;
  };
  actions: {
    createOnModel: string;
    createCard: string;
    generateModel: string;
    retry: string;
    startOver: string;
    createAgain: string;
    replacePhoto: string;
  };
  status: {
    analyzingProduct: string;
    analyzingAi: string;
    generating: string;
    creatingCard: string;
    generatingModel: string;
    transferring: string;
    removingBg: string;
    assemblingCard: string;
    checkingProduct: string;
    creatingModel: string;
    tryOnSlow: string;
    uploadProductFirst: string;
    drawMaskFirst: string;
    describeBackground: string;
    selectAspectRatio: string;
    uploadModel: string;
  };
  errors: {
    serverEmpty: string;
    serverUnavailable: string;
    serverInvalid: string;
    falNotConfigured: string;
    falUploadFailed: string;
    falTryOnFailed: string;
    falModelFailed: string;
    falDistorted: string;
    falTimeout: string;
    falBlocked: string;
    uploadProduct: string;
    uploadProductAndModel: string;
    validationModel: string;
    validationGeneric: string;
    imageFailed: string;
    uploadProductFirst: string;
    parsePoseFailed: string;
    analyzePhotoFailed: string;
    analyzeProductFailed: string;
    selectAspectRatio: string;
    modelNoImage: string;
    modelUrlStale: string;
    modelRequired: string;
    selectCardVariant: string;
    networkDevServer: string;
    cutoutLoadFailed: string;
    exactCardFailed: string;
    maskRequired: string;
    maskDrawFirst: string;
    poseResolveFailed: string;
    modelGenFailed: string;
    modelImageMissing: string;
    canvasUnsupported: string;
    oneFilePerRun: string;
  };
  model: {
    saved: string;
    uploaded: string;
    savedPersistenceAccount: string;
    savedPersistenceDevice: string;
    waitGeneration: string;
    title: string;
    sceneLabel: string;
    scenePlaceholder: string;
    genderFemale: string;
    genderMale: string;
    generateCta: string;
    generating: string;
    sourceSavedTitle: string;
    sourceSelect: string;
    sourceDelete: string;
    sourceUploadDropzone: string;
  };
  assets: {
    video: string;
    tryon: string;
    exactCard: string;
    creativeCard: string;
    bgRemoved: string;
    scene: string;
    photo: string;
  };
  productCheck: {
    title: string;
    analyzing: string;
    analyzingShort: string;
    intro: string;
    retry: string;
    scenarioLabel: string;
    descriptionTitle: string;
    waitingAnalysis: string;
    descriptionPlaceholder: string;
    truncated: string;
    scenarioClothing: string;
    scenarioLingerie: string;
    scenarioJewelry: string;
    scenarioGeneral: string;
  };
  mask: {
    title: string;
    stepBadge: string;
    drawOnPhoto: string;
    editFrame: string;
    saveFrame: string;
    resetFrame: string;
    needSelect: string;
    statusDone: string;
    statusNeeded: string;
    emptyUploadFirst: string;
  };
  preview: {
    cardCleared: string;
  };
  options: {
    productCategories: Record<string, string>;
    garmentPhotoTypes: Record<string, string>;
    qualityModes: Record<string, string>;
    tryOnQuality: Record<string, { shortHint: string; hint: string }>;
    bodyTypes: Record<string, { label: string; hint: string }>;
    modelScenarios: Record<string, string>;
  };
  lingerieCrop: {
    catalogHint: string;
    productZoneHint: string;
    sourceZoneBadge: string;
    upperBody: string;
    fullBody: string;
    customEmpty: string;
  };
};

type DeepStringify<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T;

export type StudioCopyPass2 = DeepStringify<
  typeof pass2Ru & typeof pass2RemainderRu
>;

export type StudioCopyFull = StudioCopy & StudioCopyPass2;
