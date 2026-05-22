import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import type { CostLineId } from "@/lib/ai/studioGenerationCostEstimate";

const LINE_RU: Record<CostLineId, string> = {
  openai_product_analyze: "Анализ товара (OpenAI)",
  openai_preservation: "Анализ товара на фото (OpenAI)",
  openai_image_prompt: "Промпт для фото (OpenAI)",
  openai_video_prompt: "Промпт для видео (OpenAI)",
  openai_model_compose: "Промпт модели (OpenAI)",
  openai_model_identity: "Идентичность модели (OpenAI)",
  openai_tryon_judge: "Контроль качества примерки (OpenAI)",
  openai_garment_refine: "Уточнение выделения (OpenAI)",
  fal_image_enhance: "Генерация изображения (Fal)",
  fal_image_retry: "Повтор при отказе модели (Fal)",
  fal_video: "Генерация видео (Fal)",
  fal_model_generation: "Фото модели (Fal)",
  fal_tryon: "Виртуальная примерка (Fal)",
  fal_tryon_repair: "Ремонт примерки при низкой оценке (Fal)",
  fal_garment_prep: "Подготовка товара premium (FASHN)",
  fal_background_remove: "Удаление фона (Fal)",
};

const LINE_EN: Record<CostLineId, string> = {
  openai_product_analyze: "Product analysis (OpenAI)",
  openai_preservation: "Product preservation scan (OpenAI)",
  openai_image_prompt: "Image prompt package (OpenAI)",
  openai_video_prompt: "Video prompt package (OpenAI)",
  openai_model_compose: "Model prompt compose (OpenAI)",
  openai_model_identity: "Model identity vision (OpenAI)",
  openai_tryon_judge: "Try-on quality judge (OpenAI)",
  openai_garment_refine: "Garment selection refine (OpenAI)",
  fal_image_enhance: "Image generation (Fal)",
  fal_image_retry: "Model retry on rejection (Fal)",
  fal_video: "Video generation (Fal)",
  fal_model_generation: "Model photo (Fal)",
  fal_tryon: "Virtual try-on (Fal)",
  fal_tryon_repair: "Try-on repair if score low (Fal)",
  fal_garment_prep: "Premium garment prep (FASHN)",
  fal_background_remove: "Background removal (Fal)",
};

const LINE_KK: Record<CostLineId, string> = {
  openai_product_analyze: "Тауар талдауы (OpenAI)",
  openai_preservation: "Тауарды сақтау талдауы (OpenAI)",
  openai_image_prompt: "Фото промпты (OpenAI)",
  openai_video_prompt: "Бейне промпты (OpenAI)",
  openai_model_compose: "Модель промпты (OpenAI)",
  openai_model_identity: "Модель идентификациясы (OpenAI)",
  openai_tryon_judge: "Примерка сапасы (OpenAI)",
  openai_garment_refine: "Тауарды нақтылау (OpenAI)",
  fal_image_enhance: "Сурет генерациясы (Fal)",
  fal_image_retry: "Қайта генерация (Fal)",
  fal_video: "Бейне генерациясы (Fal)",
  fal_model_generation: "Модель фотосы (Fal)",
  fal_tryon: "Виртуалды примерка (Fal)",
  fal_tryon_repair: "Примерка жөндеуі (Fal)",
  fal_garment_prep: "Premium дайындау (FASHN)",
  fal_background_remove: "Фонды жою (Fal)",
};

export function costLineLabel(id: CostLineId, locale: IndexableLocale): string {
  if (locale === "en") return LINE_EN[id];
  if (locale === "kk") return LINE_KK[id];
  return LINE_RU[id];
}

export function generationCostUiCopy(locale: IndexableLocale) {
  if (locale === "en") {
    return {
      estimateTitle: "Estimated cost",
      optionalPrefix: "If needed:",
      usdHint: (usd: string) => `~$${usd} provider cost`,
      audioOn: "with sound",
      audioOff: "without sound",
    };
  }
  if (locale === "kk") {
    return {
      estimateTitle: "Шамамен құны",
      optionalPrefix: "Қажет болса:",
      usdHint: (usd: string) => `~$${usd} провайдер`,
      audioOn: "дыбыспен",
      audioOff: "дыбысыз",
    };
  }
  return {
    estimateTitle: "Оценка себестоимости",
    optionalPrefix: "При необходимости:",
    usdHint: (usd: string) => `~$${usd} у провайдеров`,
    audioOn: "со звуком",
    audioOff: "без звука",
  };
}
