export const analyticsEvents = {
  openStudio: "open_studio",
  viewLanding: "view_landing",
  clickPrimaryCta: "click_primary_cta",
  clickSecondaryCta: "click_secondary_cta",
  viewPlatformPage: "view_platform_page",
  viewUseCasePage: "view_use_case_page",
  viewBlogArticle: "view_blog_article",
  languageSwitch: "language_switch",
  pricingView: "pricing_view",
  aiGenerationError: "ai_generation_error",
  selectModeClothing: "select_mode_clothing",
  selectModeProductCard: "select_mode_product_card",
  selectModePostProcessing: "select_mode_post_processing",
  uploadProductImage: "upload_product_image",
  createTryon: "create_tryon",
  createExactCard: "create_exact_card",
  createCreativeScene: "create_creative_scene",
  acceptResult: "accept_result",
  rejectResult: "reject_result",
  downloadResult: "download_result",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];

export type AnalyticsPayload = Record<string, string | number | boolean | null>;

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: AnalyticsPayload = {}
) {
  if (typeof window === "undefined") return;

  const safePayload = Object.fromEntries(
    Object.entries(payload).filter(([key]) => !key.toLowerCase().includes("prompt"))
  );

  window.gtag?.("event", eventName, safePayload);
  window.ym?.(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "", "reachGoal", eventName);
}
