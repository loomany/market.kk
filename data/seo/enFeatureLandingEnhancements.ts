import type { StaticRouteKey } from "@/lib/i18n/routeSlugs";

type EnFeatureEnhancement = {
  intro: string;
  sections: Array<{ title: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
  internalLinks: Array<{ label: string; href: string }>;
};

const commonFaq: EnFeatureEnhancement["faq"] = [
  {
    question: "Can I publish AI photos without review?",
    answer:
      "No. AI can change color, shape, patterns, or small details. Compare every export with the real product before upload.",
  },
  {
    question: "Does Vitrina AI guarantee marketplace approval?",
    answer:
      "No. Vitrina AI Studio is an independent tool, not an official marketplace partner. Sellers must check current platform rules.",
  },
  {
    question: "Do I need a professional photographer?",
    answer:
      "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer.",
  },
  {
    question: "Where do I start?",
    answer:
      "Open Studio, upload a source image, pick a workflow (background, product card, clothing on model), and review before publishing.",
  },
];

export const enFeatureLandingEnhancements: Partial<
  Record<StaticRouteKey, EnFeatureEnhancement>
> = {
  aiProductPhotoStudio: {
    intro:
      "Vitrina AI Studio is a workspace for marketplace product visuals: source photo to clean listing image, background work, or clothing on an AI model. It speeds up catalog production for sellers on Amazon, eBay, Shopify, and regional marketplaces—always with manual QA before upload.",
    sections: [
      {
        title: "What you can do in Studio",
        body:
          "Upload a product photo and choose a workflow: remove or replace background, build a product card, or show apparel on an adult AI model. Jewelry and micro-details need a sharp source—otherwise stones and edges may drift. Video and Reels-from-photo flows are in development; rely on reviewed static images until your Studio version clearly supports video.",
      },
      {
        title: "Typical seller workflow",
        body:
          "Shoot with even light → upload to Studio → review shape, color, and kit contents → export only approved frames → upload to the marketplace cabinet. For series SKUs, keep one background preset and one QA checklist.",
      },
      {
        title: "AI limitations",
        body:
          "AI does not guarantee perfect output or moderation approval. Hue, proportions, logos, or texture can shift. When unsure, regenerate or keep the original photo—an honest listing beats a glossy wrong variant.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "How it works", href: "/en/how-it-works" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How AI helps sellers", href: "/en/blog/how-ai-helps-marketplace-sellers" },
      { label: "Check AI card quality", href: "/en/blog/how-to-check-the-quality-of-ai-product-cards" },
    ],
  },
  productPhotoForMarketplaces: {
    intro:
      "Marketplace product photography is more than one pretty frame—it is a set of images that truthfully show the SKU: shape, color, kit, and key details. AI helps unify a long catalog faster, but the seller owns final accuracy. Vitrina AI Studio is an independent tool, not an official partner of Kaspi, Wildberries, Ozon, Amazon, or eBay.",
    sections: [
      {
        title: "What buyers compare",
        body:
          "Thumbnail color and shape must match gallery images and reviews. Mismatches drive returns even on strong ratings. Keep main and secondary images consistent for one variant.",
      },
      {
        title: "White background and product shots",
        body:
          "Many categories need a neutral or white main image. Lifestyle frames can support extra slides if the product itself does not change. See our guides on white backgrounds and background removal.",
      },
      {
        title: "Workflow in Studio",
        body:
          "Upload a sharp source photo, pick exact product card or white-background mode, generate two variants, and compare on a large screen before export. Assign one person to approve uploads after QA.",
      },
      {
        title: "Regional marketplaces",
        body:
          "Kaspi, Wildberries, and Ozon each have image rules that change over time. Read current seller help before batch uploads. Our platform-specific blog guides summarize common pitfalls without promising moderation approval.",
      },
      {
        title: "Common mistakes",
        body:
          "Wrong color, hidden kit items, and publishing the first AI preview without review drive returns. See our article on product photo mistakes and Amazon/eBay/Etsy guides in the blog.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Photo mistakes", href: "/en/blog/product-photo-mistakes-that-hurt-sales" },
      { label: "Amazon photos", href: "/en/blog/product-photos-for-amazon" },
      { label: "How it works", href: "/en/how-it-works" },
      { label: "AI quality", href: "/en/quality" },
    ],
  },
  backgroundGenerator: {
    intro:
      "The background workflow removes clutter or places the product on a neutral scene without changing the item itself. It is a common step before main marketplace images and clean catalog grids. Always compare the export with your source—the product must not change shape or color.",
    sections: [
      {
        title: "Remove or replace",
        body:
          "Start with a source that has minimal overlap and distractions. After generation, inspect edges, shadows, and reflections—AI can eat thin parts. Pair with our articles on background removal and replacement.",
      },
      {
        title: "White vs lifestyle",
        body:
          "Main listing images often need white or light gray backgrounds. Lifestyle scenes work for extra gallery slides or social ads if the SKU stays identical. Do not hide kit contents behind props.",
      },
      {
        title: "Common edge mistakes",
        body:
          "Halos, clipped straps, and fake shadows are frequent AI artifacts. Zoom to 100% before upload. Regenerate with a cleaner source instead of publishing a doubtful cutout.",
      },
      {
        title: "Clutter and prompts",
        body:
          "Remove props on set before cleanup in Studio. For scene wording, see prompt and unwanted-object articles—describe background and light, not a different SKU.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Remove background", href: "/en/blog/how-to-remove-the-background-from-a-product-photo" },
      { label: "Remove unwanted objects", href: "/en/blog/how-to-remove-unwanted-objects-from-a-product-photo" },
      { label: "Product photo prompts", href: "/en/blog/how-to-write-a-prompt-for-product-photography" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  fashionModelPhotos: {
    intro:
      "Clothing on an AI model helps catalogs when a full shoot per SKU is too expensive. Use adult commercial framing and verify hem, print, and color against the real garment. Virtual try-on style results still require manual QA—AI does not replace fit guarantees for buyers.",
    sections: [
      {
        title: "Source and pose",
        body:
          "Shoot flat or on a hanger with even light. Pick neutral poses for marketplace thumbnails; save creative angles for social if the product stays recognizable.",
      },
      {
        title: "Fit and color QA",
        body:
          "Compare sleeve length, hem, neckline, and print scale with the real item. Reject variants that slim or lengthen the garment. Text in the listing must match what the model image shows.",
      },
      {
        title: "Lingerie and sensitive categories",
        body:
          "Use conservative catalog poses and stricter review. See our lingerie-on-model guide for additional checks. Do not publish frames that alter coverage or fabric tone.",
      },
      {
        title: "Catalog without a shoot",
        body:
          "Combine flatlay and AI model rows for long-tail apparel; compare AI vs live model in the blog. Fit QA matters more than feed aesthetics.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Catalog without photoshoot", href: "/en/blog/how-to-create-a-clothing-catalog-without-a-photoshoot" },
      { label: "Prepare for AI try-on", href: "/en/blog/how-to-prepare-clothing-photos-for-ai-try-on" },
      { label: "AI vs real model", href: "/en/blog/ai-model-or-real-model" },
      { label: "How it works", href: "/en/how-it-works" },
      { label: "AI quality", href: "/en/quality" },
    ],
  },
  jewelryProductPhotos: {
    intro:
      "Jewelry and small accessories need macro sharpness—AI often alters stones, metal shine, or clasp shape. This page outlines a careful workflow for Etsy, eBay, and marketplace listings. Macro source photos reduce how much AI must invent.",
    sections: [
      {
        title: "Light and review",
        body:
          "Use diffused light and a tripod. White background for main images; lifestyle only on extra slides if the product unchanged. Count stones and check metal tone every time.",
      },
      {
        title: "Marketplace thumbnails",
        body:
          "Preview at phone size—buyers decide from a small crop. Ensure clasps and stones remain readable. Pair with exact product card mode when accuracy matters more than drama.",
      },
      {
        title: "When to reshoot",
        body:
          "If AI changes stone count or metal shade, reshoot closer with sharper focus instead of aggressive regeneration. Keep supplier photos only when you have commercial rights.",
      },
      {
        title: "Etsy and bags",
        body:
          "International sellers should read Etsy and bag-prep blog guides. Start with macro QA rather than waiting for public showcase pages.",
      },
    ],
    faq: commonFaq,
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Jewelry marketplace photos", href: "/en/blog/how-to-create-jewelry-product-photos-for-a-marketplace" },
      { label: "Etsy photos", href: "/en/blog/product-photos-for-etsy" },
      { label: "When AI is not a fit", href: "/en/blog/when-ai-product-photos-are-not-a-fit" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
};
