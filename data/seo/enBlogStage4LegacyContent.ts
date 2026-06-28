import type { FaqItem } from "./platforms";

export type EnBlogArticleContent = {
  title: string;
  metaDescription: string;
  intro: string;
  shortAnswer: string;
  sections: Array<{ title: string; body: string[] }>;
  checklist: string[];
  faq: FaqItem[];
  internalLinks: Array<{ label: string; href: string }>;
};

export const enBlogStage4Legacy: Record<string, EnBlogArticleContent> = {
  "blog_001": {
    title: "AI Product Photography for Marketplaces: A Practical Guide for Sellers",
    metaDescription:
      "What AI product photography is for Kaspi and marketplaces: workflows, limits, manual review, and honest seller responsibility—no moderation guarantees.",
    intro:
      "AI product photography is not a magic sales button—it is a way to prepare listing visuals faster from a real source photo. For sellers in Kazakhstan, Central Asia, and cross-border marketplaces, it is especially useful when you need to refresh Kaspi, Wildberries, or Ozon without a permanent studio crew and retouching team. Below is an honest breakdown of where AI saves time, where manual review is mandatory, and what Vitrina AI Studio can and cannot do. Reels and product video from photo are in development in Studio; until those features are available in your version, rely on verified static images. Vitrina AI Studio is an independent tool, not an official partner of Kaspi, Wildberries, or Ozon, and it does not guarantee listing approval. Final review and publication responsibility stay with the seller.",
    shortAnswer:
      "AI helps remove backgrounds, build product cards, show clothing on a model, and create social variants—but every output must match the real item: shape, color, pattern, and details must not change. Treat AI as a draft workflow accelerator, not a substitute for seller accountability.",
    sections: [
      {
        title: "What AI product photography includes",
        body: [
          "A typical workflow starts with an ordinary product photo: an item on a table, in a showroom, or on a hanger. The studio then helps isolate the product, place it on a neutral or white background, assemble a marketplace product shot, or transfer apparel onto an AI model. A good result does not invent a new product—it preserves what the buyer will receive in the parcel. For marketplaces, accuracy matters: clean background, readable size, visible seams, hardware, and labels.",
          "Instagram and ads may allow a more creative background, but the product must stay recognizable. The studio speeds up drafts but does not replace knowledge of each platform current image rules. Video and Reels from product photos are in development; do not publish a reel until you confirm the feature is available and the frame still shows the same SKU, color, and bundle.",
          "If video is already available in your Studio version, still verify the product on every frame. AI output is a draft; the seller remains accountable for the listing. Cross-check guides on white backgrounds and reviewing AI photos before upload.",
        ],
      },
      {
        title: "Where AI helps marketplace sellers",
        body: [
          "First scenario: fast SKU launch—you shot on a phone and prepared a main card the same evening. Second: catalog normalization—dozens of SKUs arrive with mismatched supplier backgrounds and you unify them to white or light gray. Third: ad and social variants without a separate shoot for every colorway. Fourth: clothing on an AI model and exact product card modes for Kaspi, Wildberries, and Ozon.",
          "Many stores start on Kaspi, then add Wildberries and Ozon. AI lowers the cost of first visuals but does not remove requirements for honest descriptions, bundles, and warranty text. A beautiful card with the wrong SKU drives returns and negative reviews faster than weak lighting. An honest product shot often outsells a cinematic frame with the wrong variant.",
          "AI fits accessories, mid-range apparel, home goods, and repeatable catalog lines well. It is weaker for high-detail gemstones, complex electronics with tiny ports, and premium hero campaigns. Define category checklists in your team so QA stays consistent as you scale.",
        ],
      },
      {
        title: "Limitations and honest expectations",
        body: [
          "Models can soften lace, shift metal tone, add stone shine, or narrow shoe shape. Every AI frame is a draft, not a moderation-ready final. Vitrina AI does not guarantee approval on Kaspi, Wildberries, Ozon, or other channels. It is not an official marketplace partner.",
          "Image, text, video, and category rules change—sellers must read current documentation before large uploads. When in doubt, choose exact product card mode and reject variants with distortion. Do not promise buyers a color, bundle, or brand that the photo does not show—mismatch complaints hurt ratings faster than weak SEO.",
          "A simple honest card often sells better than a dramatic scene with the wrong product. Team rule: disputed frames do not reach the seller cabinet without a second reviewer. Regeneration takes minutes; returns and disputes take days. Keep before/after screenshots per SKU.",
        ],
      },
      {
        title: "What source photo to capture",
        body: [
          "Use even light without harsh glare; the product should fill most of the frame. A plain backdrop helps AI fail less often on edges. For apparel, avoid folds that hide pockets or prints. Capture front, texture detail, label, and bundle shots even if only one AI frame becomes the main image.",
          "Even when one AI output goes live, extra angles support QA. For transparent packaging and glass, minimize hard specular highlights—they break during cutout. Do not use supplier Pinterest images without commercial rights. Your own source tied to warehouse inventory is the legal and dispute-safe path.",
          "Save RAW or originals—buyer color disputes need evidence. Cleaner sources mean fewer invented details in AI output. Document a shoot standard for new SKUs. A weak capture cannot be fully rescued by Studio alone.",
        ],
      },
      {
        title: "Step-by-step workflow in Studio",
        body: [
          "Upload the source, pick the task: exact product card, white background, clothing on model, or photo cleanup. Generate at least two variants—do not stop at the first preview. Compare to the original on a large screen, not only on a phone. Check shape, color, pattern, logos, hardware, edges, and shadows.",
          "If a detail drifts, regenerate with a different source or a more neutral backdrop. Only then export to the marketplace cabinet. Track SKU in a spreadsheet: source date, AI version, reviewer name. That log saves hours when a buyer opens a mismatch claim.",
          "Quarterly, refresh internal checklists against return reasons. During bulk runs, spot-check every fifth SKU for systematic drift. Train the marketplace owner on QA basics, not only the designer. AI speeds work; it does not remove seller responsibility.",
        ],
      },
      {
        title: "Kaspi, Wildberries, social—and scaling the process",
        body: [
          "For Kaspi, buyers often expect a straightforward product shot tied to local fulfillment. Wildberries rewards catalog consistency and plausible apparel fit on model. Ozon benefits from extra angles; video-from-photo is still in development—do not rely on draft video for core offer proof. Vitrina AI is not an official partner and does not guarantee moderation.",
          "Keep a high-resolution master; upload channel-specific exports per format requirements. Do not compress until edges turn mushy. Plan a content pack: main card, detail, lifestyle for Instagram, and 9:16 when appropriate—all frames must show one SKU, one color, one bundle.",
          "AI pays off as a weekly material pack, not a single file. Align visuals with ads so banners and listings do not diverge. When expanding to a second marketplace, re-check aspect ratio and background rules—do not copy files blindly. Monthly, review top-return SKUs; visual mismatch is often the root cause, not price.",
        ],
      },
      {
        title: "From one SKU to a sustainable process",
        body: [
          "One successful AI frame does not mean the whole catalog can ship without control. Fix roles: who shoots, who generates, who approves, who uploads. A two-person team still benefits from a simple SKU table with review date and reviewer name.",
          "During batch generation, spot-check every fifth SKU to catch systematic AI errors. If lace, metal, or transparent plastic repeat failures, add category-specific checklist items. Do not save money on lighting upfront—bad sources force the model to invent details that are not on the warehouse shelf.",
          "Link the process to white background, review-before-publish, and Kaspi-specific guides. Build manual review early to pay less in returns. If you doubt a frame, reject it: regeneration is minutes; card disputes stretch for days.",
        ],
      },
    ],
    checklist: [
      "source image is sharp with minimal clutter",
      "shape and color match the physical product",
      "background does not mislead about the bundle",
      "no third-party logos or watermarks",
      "marketplace image rules verified manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can change shape, color, pattern, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants before upload.",
      },
      {
        question: "Does Vitrina AI guarantee marketplace approval?",
        answer:
          "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review and publication.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
        answer:
          "No. It is an independent tool. Check each marketplace current image requirements before uploading.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For test listings and catalog refreshes, a careful smartphone capture is often enough. Premium hero campaigns may still need a photographer.",
      },
      {
        question: "Is AI product photography enough for fine jewelry?",
        answer:
          "You can try it, but small stones and glare need macro capture and strict review. Often you need a dedicated close-up frame in the gallery.",
      },
      {
        question: "Can I generate dozens of cards without any control?",
        answer:
          "Technically yes, but error risk rises. Prefer batch generation with spot checks on every fifth to tenth SKU.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
      { label: "Marketplace product photos", href: "/en/product-photo-for-marketplaces" },
      { label: "Kaspi product photos", href: "/en/blog/product-photos-for-kaspi" },
      { label: "Review AI photos before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Create marketplace product photos", href: "/en/blog/how-to-create-product-photos-for-a-marketplace" },
    ],
  },
  "blog_002": {
    title: "How to Create Product Photos for a Marketplace: Step-by-Step Workflow",
    metaDescription:
      "Step-by-step marketplace product photos: source capture, light, AI mode, manual QA, and upload to Kaspi, Wildberries, or Ozon—no moderation guarantees.",
    intro:
      "Marketplace photos must answer buyer questions about shape, color, size, and bundle contents—a beautiful background does not fix an inaccurate product. In Kazakhstan and across Central Asia the typical path is phone capture, preparation in AI Studio, manual review, then upload to the seller cabinet. Below is a practical workflow for Kaspi, Wildberries, and Ozon without promising first-attempt moderation approval. Vitrina AI Studio is an independent tool, not an official marketplace partner, and it does not guarantee listing acceptance. Final review and publication responsibility stay with the seller. Pilot five SKUs before scaling the workflow: assign roles for capture, generation, QA, and upload. The same discipline applies on Amazon, eBay, and Shopify—buyers still compare photos to what arrives in the box.",
    shortAnswer:
      "Shoot a clear source image, pick the right Studio mode, prepare background or product card, and verify the product on a large screen before upload. Compare results with each platform current rules—they change, and the seller remains accountable.",
    sections: [
      {
        title: "Step 1: capture a clear source image",
        body: [
          "Use even light: a window with diffusion, softbox, or two side sources to avoid deep shadows under the product. The item should fill most of the frame with a readable silhouette and no clipped details. Remove unrelated objects, other-brand packaging, and watermarks that trigger moderation issues. The cleaner the source, the less AI invents shape, color, and texture.",
          "For clothing, lay the garment flat or hang it without folds that hide pockets or prints. For shoes, photograph the pair with matching angle so buyers see sole and profile. Save multiple angles—even if only one AI frame becomes the main image, others anchor QA. Never use supplier catalog images without commercial usage rights.",
          "For Kaspi and other channels, tie the card to real warehouse inventory. Store originals in an SKU folder—evidence when buyers dispute color or contents. Open current platform image help before upload; requirements update without a separate notice to Studio.",
        ],
      },
      {
        title: "Step 2: choose the task in Studio",
        body: [
          "Main listing images usually need exact product card or white/neutral background modes. Social scenes can be more creative, but the product must not change: same color, print, and bundle. Apparel catalogs sometimes benefit from on-model frames—use a separate mode and review fit carefully. Video and Reels from photo are in development; do not publish video if the feature is unavailable in your version.",
          "Generate at least two variants—do not pick the first preview without comparing to the original. Complex categories—jewelry, glass, small electronics—need extra review time. Exact product card mode is usually more conservative: less creative drift, better detail retention.",
          "Define who may send a frame to the cabinet after QA so rush errors do not leak into the catalog. When switching marketplaces, re-check file format and aspect ratio. Keep the source beside the AI export for dispute resolution.",
        ],
      },
      {
        title: "Step 3: verify the product on the image",
        body: [
          "Compare shape, color, pattern, seams, hardware, logos, stones, labels, and bundle contents to the source. Open images on a monitor or tablet—phone screens hide distortion. If a detail drifts, reject the variant; regeneration is cheaper than a return and negative review. AI may remove scratches or add shine—that is still misleading if reality differs.",
          "Inspect cutout edges: straps, tassels, and transparent parts fail often. Shadows should look natural and must not imply a different size or hidden stand. For sets, confirm the photo matches description and warehouse inventory.",
          "Archive a before/after screenshot per SKU. During bulk upload, spot-check every fifth SKU for systematic model errors. When in doubt, delay upload rather than risk a complaint.",
        ],
      },
      {
        title: "Step 4: check platform rules",
        body: [
          "Open current Kaspi, Wildberries, or Ozon help for images, video, and prohibited content. Rules change—what passed last season may fail today. Vitrina AI does not guarantee moderation and is not an official partner. Final decisions and liability stay with the seller.",
          "Verify minimum resolution, aspect ratio, text bans on main images, and background requirements. Apparel and intimates have extra rules for models and adult-only content—read category notes. If a card is rejected, compare the reason to your checklist—often the issue is product mismatch, not AI itself.",
          "Log rejections: SKU, reason, date, fix owner—teams learn faster. Do not copy visuals from another marketplace without checking local rules. When unsure, choose a more neutral background and simple composition.",
        ],
      },
      {
        title: "Common seller mistakes",
        body: [
          "Publishing the first variant without source comparison is the top cause of mismatch returns. Aggressive lifestyle backgrounds hide size and material cues. Third-party photos and logos risk account-level issues, not only one rejection. Ignoring differences between main image and gallery angles confuses buyers.",
          "Poor lighting forces AI to invent details that are not on the product. Bulk generation without spot checks spreads one systematic error across the catalog. Listing copy promises items not visible in frames—a separate complaint category.",
          "Schedule review time like copywriting and pricing. One hour of QA beats a cluster of returns on a hot SKU. Train the marketplace manager on the checklist, not only the designer. Refresh platform image help before each major upload batch.",
        ],
      },
      {
        title: "Link listing, social, and warehouse",
        body: [
          "Build a pack: marketplace main, detail, Instagram lifestyle, and 9:16 when needed. All frames must show one SKU, one color, one bundle. AI pays off as a pack, not a single file. Align style with ads so banners and cards stay consistent.",
          "For Kaspi start with an honest product shot; for Wildberries unify catalog style; for Ozon add extra angles. Keep a high-resolution master; upload per-channel exports. When scaling assortment, copy workflow and checklists—not lucky settings without per-SKU verification.",
          "Monthly, review top-return SKUs—visual issues often beat price as the driver. Update photos when suppliers or batches change color and hardware. Document which source matches which warehouse batch.",
        ],
      },
    ],
    checklist: [
      "source image is sharp with minimal clutter",
      "product fills enough of the frame",
      "shape and color match the real item",
      "background does not mislead buyers",
      "platform image rules checked manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can change shape, color, pattern, logos, or small details. Compare every result to the source and reject inaccurate variants.",
      },
      {
        question: "Does Vitrina AI guarantee marketplace approval?",
        answer:
          "No. Platform rules change and the seller must verify compliance before publication.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
        answer: "No. It is an independent tool. Check current requirements for each channel before upload.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For test listings and catalog refreshes, a careful smartphone source is often enough. Premium hero shots may still need a photographer.",
      },
      {
        question: "Is one photo enough for a full card?",
        answer:
          "Sometimes for launch, but buyers need details. Plan main, close-up, and on-model or in-use frames when the category expects them.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "What is AI product photography", href: "/en/blog/what-is-ai-product-photography" },
      { label: "White background for products", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Review AI photos before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
      { label: "Platforms", href: "/en/platforms/kaspi-product-photos" },
    ],
  },
  "blog_003": {
    title: "How to Make a White Background for a Product Without Losing Detail",
    metaDescription:
      "White background for marketplace main images: when to use it, where AI fails on edges and shadows, and how to review before Kaspi, WB, or Ozon upload.",
    intro:
      "A white or light gray background helps listings look clean on Kaspi, Wildberries, and Ozon, but poor cutouts can destroy edges, shadows, and texture. For sellers in Kazakhstan and Central Asia, removing a home or warehouse backdrop to get a neutral product shot is one of the most common Vitrina AI Studio tasks. AI speeds the work but does not guarantee perfect masking—especially on chains, fur, glass, and transparent packaging. Below is a practical workflow without promising first-attempt moderation approval. Vitrina AI is an independent tool, not an official marketplace partner. Before batch export, define a white-point reference for the catalog and spot-check every fifth SKU—systematic edge errors are easier to catch early than after fifty uploads.",
    shortAnswer:
      "Use white background for main listing images, then review edges, shadows, transparency, color, and shape on a large screen. If a detail is clipped or drifts, reject the variant and regenerate from a cleaner source. Before a large upload batch, pilot five SKUs with named roles for shoot, Studio, QA, and publish—and keep originals beside every export for traceability.",
    sections: [
      {
        title: "When white background is the right choice",
        body: [
          "Main images on many marketplaces should show the product without distracting decor. White or neutral backgrounds help buyers focus on shape, color, and bundle contents. Unified catalog style matters when hundreds of SKUs arrive with mismatched supplier photos. For Kaspi, Wildberries, and Ozon, start with current main-image rules—they change and sellers must verify them.",
          "White background does not replace lifestyle scenes for Instagram, but for marketplaces it is often safer. If context helps—tableware in a kitchen—use extra gallery slots, not a misleading main frame. Vitrina AI helps prepare files but does not guarantee moderation approval.",
          "Compare requirements before bulk upload: some channels allow light gray, others are stricter. Do not copy visuals from another marketplace without checking local rules. When unsure, pick a more neutral background and subtle shadow. Document your catalog background standard for the team.",
        ],
      },
      {
        title: "What source to shoot for white background",
        body: [
          "Higher contrast between product and backdrop reduces edge errors. Shoot on a plain surface—gray, beige, or white—without patterns and glare. Use even light: two side sources or a diffused window to limit deep shadows under the item. The product should fill most of the frame with a readable outline.",
          "For dark products add a reflector to preserve texture. For transparent packaging and glass, minimize hard specular highlights—they break during cutout. Capture multiple angles even if only one becomes the white-background main image.",
          "Do not use watermarked supplier photos—separate moderation risk. Store originals per SKU for disputes. Shiny jewelry, metal, and lacquered shoes need more careful sources; weak captures force AI to invent details. Keep source beside AI export for buyer claims.",
        ],
      },
      {
        title: "Where AI often fails during cutout",
        body: [
          "Complex edges—tassels, fur, lace, thin cords—may blur or clip. Chains and earrings can break at links: inspect each joint zoomed in. Transparent parts may vanish or turn matte. Shadows sometimes disappear entirely so the item looks unnaturally floating.",
          "Shiny surfaces may blow out or gain fake glare. Model hair during combined modes is a separate risk zone. Small label text can smear—compare to the original. When one category repeats failures, add a dedicated internal checklist item.",
          "Do not publish the first variant without monitor comparison—phones hide edge artifacts buyers see enlarged. Regeneration from a better source beats a color-mismatch return. Treat AI output as draft, not a final moderation file. Spot-check every fifth SKU during bulk work.",
        ],
      },
      {
        title: "Review after white background generation",
        body: [
          "Compare shape, color, pattern, hardware, logos, and bundle to the physical product. Walk the contour: no jagged edges, clipped parts, or background speckle. Shadows should look natural and must not fake a different size. Confirm the background is truly neutral—no dirty gradients or compression mush.",
          "For sets, verify the photo matches description and warehouse contents. Check proportions—AI sometimes compresses or stretches items. Save before/after screenshots in the SKU archive. During bulk upload, spot-check every fifth article.",
          "Export only after the checklist passes. Re-read resolution and format rules. Vitrina AI does not guarantee acceptance. When unsure, choose a simpler frame with a neutral backdrop.",
        ],
      },
      {
        title: "Common white background mistakes",
        body: [
          "Publishing frames with clipped tassels, chains, or transparent elements. Over-retouching that makes the product look plastic versus reality. Ignoring differences between main image and gallery angles. Using third-party visuals without commercial rights.",
          "Poor source lighting makes AI invent texture. Bulk generation without spot checks spreads one systematic error. Listing copy promises bundle items not shown in photos.",
          "One hour of QA beats returns on a bestseller. Train marketplace managers on the checklist, not only designers. Quarterly, refresh platform image help—updates are quiet. An honest simple card often outsells a cinematic frame with the wrong SKU.",
        ],
      },
      {
        title: "Connect white background to the full card pack",
        body: [
          "White background is the base of a pack: marketplace main, detail, social lifestyle. All frames must show one SKU, color, and bundle. For Kaspi start with an honest product shot; for Wildberries unify catalog style; for Ozon add angles. Video and Reels from photo are in development—do not rely on draft video for core proof. Sellers exporting to Amazon, eBay, or Shopify should apply the same edge-and-color QA before reuse.",
          "Keep a high-resolution master; upload per-channel exports. When scaling, copy workflow—not unchecked lucky presets. Align ads and listings so banners do not diverge. Document which source matches which warehouse batch.",
          "Monthly, review top-return SKUs—visual mismatch is common. Update photos when suppliers change packaging. Cross-link review-before-publish and exact product card guides. Publication liability stays with the seller.",
          "When you export the same SKU to Amazon or eBay, re-run edge QA—compression and resize can hide halos on a laptop screen but not on a buyer phone.",
        ],
      },
    ],
    checklist: [
      "edges are clean without jagged artifacts",
      "transparent parts are preserved",
      "shadow looks natural",
      "color and shape match the product",
      "platform image rules checked manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can alter edges, color, and small details. Compare every result to the source before upload.",
      },
      {
        question: "Does Vitrina AI guarantee marketplace approval?",
        answer: "No. Rules change and the seller must verify compliance before publication.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
        answer: "No. Check current requirements for each marketplace before upload.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For catalog refreshes, a careful smartphone source is often enough. Premium macro work may still need specialist capture.",
      },
      {
        question: "Is pure white required on every marketplace?",
        answer:
          "Requirements differ—some allow light gray. Read current help for your channel and category before upload.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "White background use case", href: "/en/use-cases/marketplace-white-background" },
      { label: "Remove background from a product photo", href: "/en/blog/how-to-remove-the-background-from-a-product-photo" },
      { label: "Replace a product background", href: "/en/blog/how-to-replace-a-product-background" },
      { label: "Create marketplace product photos", href: "/en/blog/how-to-create-product-photos-for-a-marketplace" },
      { label: "Review AI photos before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Background generator", href: "/en/background-generator" },
    ],
  },
  "blog_008": {
    title: "How to Review AI Product Photos Before Publishing",
    metaDescription:
      "Manual AI product photo review before upload: product accuracy, background honesty, edges, and Kaspi, Wildberries, Ozon rules—seller responsibility, no guarantees.",
    intro:
      "Treat AI product photos as drafts, not final listing assets. Models can change shape, hue, pattern, seams, stones, or add details—especially when the source was rushed. For sellers in Kazakhstan and Central Asia, manual review is the critical step between Vitrina AI Studio and the Kaspi, Wildberries, or Ozon seller cabinet. The service does not guarantee moderation approval and is not an official marketplace partner. Final verification and publication liability stay with the seller. Build a two-step review: solo check on a monitor, then a colleague for disputed SKUs. Log reject reasons monthly so the team learns which categories need stricter source rules or different Studio modes.",
    shortAnswer:
      "Compare AI output to the source on a large screen, run product and background checklists, then verify current platform rules. Disputed frames need a second reviewer—regeneration is cheaper than a return. Log rejection reasons monthly so the team learns which categories need stricter sources or different Studio modes.",
    sections: [
      {
        title: "Why review is mandatory",
        body: [
          "AI accelerates visual prep but does not know your warehouse shelf. Buyers receive physical goods, not pixels—mismatch drives returns and negative reviews. Marketplaces may reject cards when main images mislead about size, bundle, or category. Vitrina AI generates variants; sellers decide what ships.",
          "Image, text, and video rules change—read documentation before large uploads. One frame may pass on one channel and fail on another. Do not copy files blindly between Kaspi, Wildberries, and Ozon without format and background checks. Log rejections with SKU, reason, and date.",
          "Review is insurance against card blocks and reputation damage. Define who may upload after QA. During bulk runs, spot-check every fifth SKU. Build the checklist early to pay less in returns.",
        ],
      },
      {
        title: "Product review: shape, color, details",
        body: [
          "Compare silhouette, proportions, and bundle to the source and a warehouse sample. Check color in daylight on a calibrated monitor or neutral backdrop—AI often warms or cools tones. Patterns, stripes, and checks must not shift, duplicate, or vanish. Seams, zippers, buttons, hardware, logos, and labels must match.",
          "For jewelry verify stone count, clasp shape, chain length, and metal tone. For shoes check profile, sole, laces, and material texture. For sets confirm every item in the description appears in frame. If anything drifts, reject—do not assume buyers will not notice.",
          "Use large screens—phones hide distortion. Archive before/after per SKU. Add checklist items when a category repeats errors. Exact product card mode is usually safer than lifestyle for main images.",
        ],
      },
      {
        title: "Background and composition review",
        body: [
          "Background must not mislead about size, material, brand, or bundle. White frames should lack stains, stray objects, and watermarks. Lifestyle is fine for extra slots if the product stays recognizable. Shadows must not fake scale or hidden stands.",
          "Inspect cutout edges: tassels, transparency, model hair fail often. Many platforms ban text on main images—read category rules. No fake brands, foreign logos, or invented awards. If background competes with the product, simplify or return to neutral.",
          "For clothing on model, review fit, length, neckline, and proportions. For lingerie use adult commercial catalog style only—no minors or provocative framing. Video from photo is in development; do not publish unverified reels. When unsure, pick the more neutral frame.",
        ],
      },
      {
        title: "Platform-specific verification",
        body: [
          "Open current Kaspi, Wildberries, or Ozon image help for main photos. Check resolution, aspect ratio, allowed backgrounds, and category bans. Requirements change—last season pass may fail today. Vitrina AI is not an official partner.",
          "For Kaspi align visuals with warehouse stock and description. Wildberries expects catalog consistency and plausible apparel fit. Ozon benefits from extra angles and honest bundles on every frame. Do not promise in copy what photos do not show.",
          "Export in accepted formats without over-compression. If rejected, map the reason to your checklist—often it is product truth, not AI tooling. Keep sources beside exports for buyer disputes.",
        ],
      },
      {
        title: "Step-by-step checklist before upload",
        body: [
          "Step 1: open source and AI output side by side on a large screen. Step 2: verify shape, color, pattern, hardware, bundle. Step 3: check background, shadows, edges, stray objects. Step 4: read platform image rules and file spec.",
          "Step 5: ask a colleague to review disputed frames. Step 6: log SKU, date, version, reviewer in your table. Step 7: upload only after all steps pass. Do not skip spot checks during batch uploads.",
          "Keep originals for buyer claims. Quarterly, update the internal checklist from return data. Train marketplace owners, not only designers. One missed defect on a bestseller costs more than an hour of review.",
        ],
      },
      {
        title: "Typical auto-publish mistakes",
        body: [
          "Sending the first preview without source comparison is the leading mismatch cause. Bulk generation without spot checks spreads systematic errors. Mixing inconsistent main and lifestyle frames confuses buyers. Third-party photos and logos risk account issues.",
          "Publishing AI frames with prettier but wrong color. Promising bundles not shown in images. Using video/Reels before confirming feature availability and SKU accuracy. Expecting AI to pass moderation automatically—responsibility stays with the seller.",
          "Schedule QA in the SKU launch calendar like pricing and copy. Link checklists to white background and Kaspi guides. Honest simple cards beat cinematic wrong-SKU frames. Regeneration is minutes; disputes take days and hurt ratings.",
        ],
      },
      {
        title: "Scaling review across a growing catalog",
        body: [
          "When SKU count grows, do not skip comparison steps—batch Studio exports instead. Assign a rotating QA reviewer so one person does not approve their own work. Keep a shared rejection log: wrong color, clipped edge, misleading shadow, foreign logo.",
          "For multi-marketplace sellers, run the same checklist on Kaspi, Wildberries, and Ozon exports even when file sizes differ. Amazon and Shopify listings benefit from the same discipline—buyers compare photos to received goods, not to your internal brief.",
          "Quarterly, sample ten random live cards and compare to warehouse samples. Update internal guides when platforms change image help. Publication liability stays with the seller; Vitrina AI does not guarantee approval.",
        ],
      },
    ],
    checklist: [
      "product matches the source image",
      "background does not mislead buyers",
      "no foreign logos or banned main-image text",
      "edges and shadows checked at high zoom",
      "platform image rules verified manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can change shape, color, pattern, logos, or small details. Compare every result to the source before upload.",
      },
      {
        question: "Does Vitrina AI guarantee marketplace approval?",
        answer: "No. Rules change and the seller must verify compliance before publication.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
        answer: "No. Check current requirements for each marketplace before upload.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For catalog refreshes, a careful smartphone source is often enough. Premium campaigns may still need a photographer.",
      },
      {
        question: "Is phone-only review enough?",
        answer:
          "No. Use a monitor or tablet—edge artifacts and color shift are easy to miss on small screens.",
      },
      {
        question: "Who should perform final review?",
        answer:
          "Ideally someone other than the person who rushed generation. Define a final control role even on a two-person team.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
      { label: "What is AI product photography", href: "/en/blog/what-is-ai-product-photography" },
      { label: "Preserve the product in AI", href: "/en/blog/how-to-make-ai-preserve-the-product" },
      { label: "Kaspi product photos", href: "/en/blog/product-photos-for-kaspi" },
      { label: "White background for products", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Kaspi platform page", href: "/en/platforms/kaspi-product-photos" },
    ],
  },
  "blog_011": {
    title: "How to Create Clothing Photos on an AI Model for Marketplace Listings",
    metaDescription:
      "AI model clothing photos for Kaspi, Wildberries, Ozon: source prep, adult catalog style, fit review, and manual QA—no guaranteed moderation approval.",
    intro:
      "An AI model helps show apparel without a full photoshoot—valuable for clothing sellers in Kazakhstan and across regional marketplaces. The result must remain an honest commercial image: same cut, color, print, and length the buyer receives. Vitrina AI Studio does not guarantee moderation approval and is not an official partner of Kaspi, Wildberries, or Ozon. Below is a practical workflow focused on fit review and product truth. Keep a size-color matrix: each variant gets its own source and QA pass—do not reuse one AI render across different fabrics without checking warehouse samples. Document which Studio export belongs to which warehouse batch so disputes trace back to inputs, not guesses.",
    shortAnswer:
      "Shoot so the cut is visible, choose an adult model and neutral pose, then verify fit, seams, pattern, and length before publication. If AI changes shape or proportions, reject and regenerate from a better source. Each colorway needs its own QA pass—do not reuse one render across fabrics without checking the warehouse sample.",
    sections: [
      {
        title: "When on-model AI beats flat lay alone",
        body: [
          "Flat lay does not always show how a dress, blazer, jeans, or coat drapes. Wildberries and Ozon shoppers often compare silhouette on a figure, not only print on a table. AI lowers the cost of first visuals for new SKUs and size-color expansion. Many categories still require neutral main images—read current rules.",
          "On-model fits dresses, pants, outerwear, suits, and sportswear well. It is weaker when lace micro-detail is the selling point—add macro flat shots. Do not replace size charts with images; on-model fit is illustrative, not a guarantee.",
          "Build a pack: on-model main or secondary, flat front, back, fabric detail, label when needed. All frames—one SKU, one color, one bundle. Video from photo is in development; scrutinize static frames. Seller liability for honesty remains.",
        ],
      },
      {
        title: "Preparing the garment source",
        body: [
          "Garments must be fully visible without folds hiding pockets, prints, or neckline. Steam or lay flat so cut lines read clearly. Use even light and a plain gray or white backdrop without patterns. Capture front, back, and texture close-up when fabric is the key argument.",
          "Do not use third-party site photos without rights—card blocks follow. For dark garments add a reflector; for white garments avoid merging into the backdrop on the source. Store sources per SKU, size, and color.",
          "Cleaner sources reduce invented seams and proportions. Press supplier-wrinkled inventory before shooting—AI amplifies chaos into misleading silhouette. For sets photograph each piece or show the full bundle explicitly.",
        ],
      },
      {
        title: "Model and commercial style selection",
        body: [
          "Choose an adult model, neutral pose, and light background for marketplace catalogs. Avoid provocative angles inappropriate for the category. Lingerie and swimwear require adult commercial catalog style—minors are not acceptable. Vitrina AI does not guarantee compliance with all content policies.",
          "Pose should show sleeve length, pant length, neckline, and silhouette without distortion. Overly editorial styling can distract from the product and trigger moderation questions. Align model style with brand—business, casual, sport—but product stays primary. Generate two or three variants; do not trust the first preview.",
          "If flat lay is required for main, use on-model for secondary slots. Reject any frame where the model appears underage even if AI erred. When unsure, simplify pose and background. Read current Kaspi, Wildberries, and Ozon apparel image rules.",
        ],
      },
      {
        title: "Fit and detail verification",
        body: [
          "Compare length, shoulder width, neckline, waist, and hip fit to the source and warehouse sample. AI may shorten sleeves, deepen necklines, or narrow pants. Patterns and logos must not shift or duplicate. Seams, zippers, buttons, and pockets must match the real garment.",
          "Check color on a large screen in daylight—AI shifts tones often. Confirm the modeled item is the item you ship, not a similar sample. For outerwear verify hood, fur trim, and hardware placement. Suspiciously perfect fit may mean AI changed proportions—recheck.",
          "Reject on doubt; archive source versus AI screenshots. When scaling size-color matrix, review each color separately. Regeneration beats returns citing wrong cut.",
        ],
      },
      {
        title: "Publishing on marketplaces",
        body: [
          "Wildberries often expects unified catalog style—fix background and model type per brand line. Ozon values back views, flat lay, and detail alongside model frames. Kaspi requires honest product correspondence—verify current main-image rules. Vitrina AI is not an official partner.",
          "Export correct resolution and aspect ratio per cabinet. Avoid compression artifacts visible on mobile. Align ads and social posts to one SKU and color. Video from photo is in development—do not promise reels prematurely.",
          "Log which source belongs to which size and color. Monthly, review returns citing fit or color—visuals are a frequent root cause. Update photos when factory or fabric batch changes.",
        ],
      },
      {
        title: "Common AI model mistakes",
        body: [
          "Publishing changed length or neckline because it looks better on model. Underage-appearing models or sexualized framing—unacceptable. Skipping flat lay and fabric detail—buyers cannot judge material. One on-model frame for all sizes without per-color QA.",
          "Creative backgrounds that hide silhouette and color. Copying Pinterest fashion photos without rights. Expecting AI to replace size charts and composition text. Bulk upload without spot checks.",
          "Train marketplace managers on fit checklist, not only designers. Link lingerie and review-before-publish guides. Honest neutral cards beat editorial wrong-cut frames. When unsure, use exact product card or flat lay for main.",
        ],
      },
      {
        title: "Scaling on-model QA for fashion lines",
        body: [
          "Each new colorway and size needs its own source and review pass—do not reuse one render across the matrix. Log which Studio preset produced which export so disputes trace back to inputs.",
          "For Wildberries and Ozon, keep model type and background consistent within a line while still meeting each cabinet format. Kaspi buyers often compare main image to received goods—fit and length honesty reduce returns.",
          "When expanding to Amazon or Shopify, re-check adult-model policy and framing. One hour of QA per launch batch beats a week of rating damage from a single wrong-cut hero frame.",
        ],
      },
    ],
    checklist: [
      "adult model in catalog style",
      "fit and length match the garment",
      "pattern and color unchanged",
      "flat lay or fabric detail included",
      "platform image rules checked manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can change fit, color, pattern, and seams. Compare every output to the source and physical sample.",
      },
      {
        question: "Does Vitrina AI guarantee marketplace approval?",
        answer: "No. Platform rules change and the seller must verify compliance.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
        answer: "No. Check current image and content rules before upload.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For catalog refreshes, careful flat or hanger sources are often enough. Premium lookbooks may still need a studio.",
      },
      {
        question: "Can I use AI models for kids clothing?",
        answer:
          "Use extra caution and read platform policies for minors imagery. Prefer flat lay when rules are unclear.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Clothing on AI model", href: "/en/use-cases/clothing-on-ai-model" },
      { label: "Place clothing on an AI model", href: "/en/blog/how-to-place-clothing-on-an-ai-model" },
      { label: "Lingerie on an AI model", href: "/en/blog/lingerie-photos-on-an-ai-model" },
      { label: "Review AI photos before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Wildberries product photos", href: "/en/blog/product-photos-for-wildberries" },
      { label: "Fashion model photos", href: "/en/fashion-model-photos" },
    ],
  },
  "blog_016": {
    title: "Lingerie Photos on an AI Model: Safe Commercial Workflow",
    metaDescription:
      "Lingerie and swimwear on AI models for marketplaces: adult-only catalog style, fit QA, Kaspi and WB limits—Vitrina AI is independent, no moderation guarantee.",
    intro:
      "Lingerie and swimwear need careful marketplace visuals: buyers judge cut, fit, and color while moderation watches presentation style. AI models help build catalog frames without a full studio, but only in adult commercial catalog format—no minors, no sexualized imagery, no misleading listings. Vitrina AI Studio speeds drafts but does not guarantee approval on Kaspi, Wildberries, or Ozon. It is not an official marketplace partner; sellers remain responsible for content compliance and product truth. Schedule legal and merchandising review for sensitive SKUs before the first upload—presentation rules are stricter than for generic apparel categories. When in doubt, prefer flat lay and neutral main over risky on-model framing.",
    shortAnswer:
      "Shoot so construction is visible, choose an adult model and neutral catalog pose, then verify fit, color, and bundle before upload. Reject any frame with underage appearance or provocative framing—regeneration is cheaper than a card block. Pair every on-model frame with flat-lay proof when category rules expect construction detail. Log rejection reasons monthly so the team learns which SKUs need stricter sources.",
    sections: [
      {
        title: "When AI models fit lingerie listings",
        body: [
          "The workflow suits adult lingerie, swimwear, and lounge SKUs where fit on a figure matters. Flat lay alone may not show cup shape, strap placement, neckline, or length. AI reduces cost when expanding size and color matrices. Many categories still require neutral main images—verify current platform help.",
          "Do not replace size charts and fabric composition with photos—on-model fit is illustrative. Build a pack: catalog model frame, flat lay, lace or mesh detail, label when useful. All frames must show one SKU, one color, one bundle without invented accessories.",
          "Video from photo is in development; validate static frames strictly. Read intimate-category image rules before upload—they change. When presentation feels risky, prefer flat lay and neutral main. Content compliance liability stays with the seller.",
        ],
      },
      {
        title: "Adult-only: what is not acceptable",
        body: [
          "Use only adult models in neutral commercial poses—calm lookbook style, not provocative editorial. Minors, sexualized minors content, and misleading adult presentation are unacceptable. Reject frames where the model appears underage even if AI distorted facial proportions. Review Kaspi, Wildberries, and Ozon intimate-category policies—they update quietly.",
          "Avoid body retouching that changes fit expectations. Do not add background crowds, children, or scenes that distract from the product. Fake logos, awards, and main-image text often violate rules—check the category. Vitrina AI prepares assets; it is not a marketplace partner.",
          "When cards reject, compare reasons to your checklist—often presentation, not tooling alone. Keep source beside AI export for disputes. Log rejections with SKU and fix owner. Train marketplace staff on adult catalog standards, not only designers.",
        ],
      },
      {
        title: "How to shoot lingerie before AI",
        body: [
          "Show the full garment: straps, cups, neckline, length without folds hiding construction. Use even light and a plain gray or white backdrop without glare that breaks edges. Capture front, back, and lace or mesh macro when texture sells the SKU.",
          "Do not use third-party photos without rights—account risk exceeds single-card rejection. Keep light lingerie separated from the backdrop on the source; add reflectors on dark fabrics. Photograph sets explicitly—top and bottom of one SKU without color substitution.",
          "Store sources per size and color. Spot-check every fifth SKU in bulk runs. Press or lay flat supplier-wrinkled pieces—AI invents seams on messy sources. Originals are evidence in color and bundle disputes.",
        ],
      },
      {
        title: "Studio mode and model selection",
        body: [
          "Choose lingerie on AI model mode with an adult neutral pose. Generate at least two variants—never publish the first preview without comparison. Keep backgrounds light and calm; editorial drama can trigger moderation and distract from product truth.",
          "If flat lay is required for main, use on-model for secondary angles. Exact product card mode may preserve lace better—compare both. Do not promise bundles absent from photos. Do not publish video until you confirm feature availability and SKU accuracy.",
          "Define who may upload after QA. When scaling colors, review each colorway separately. Regeneration beats returns citing wrong shade or cut. AI output remains draft until your checklist passes.",
        ],
      },
      {
        title: "Fit and construction review",
        body: [
          "Compare cup shape, strap width, neckline depth, length, and fit to source and warehouse sample. AI may alter cut, shorten straps, or shift patterns—reject those variants. Check nude and black tones on large screens—AI shifts delicate shades. Lace, mesh, and seams must not duplicate, vanish, or turn plastic.",
          "Inspect cutout edges on thin straps and transparent inserts. The modeled item must be the shipped item. Archive before/after screenshots. On doubt about cut or color, do not upload.",
          "Ask a colleague to review frames for sexualized or youthful appearance. Cross-link the general AI review guide. Schedule QA like pricing and stock updates. For Kaspi, align visuals with warehouse reality and description.",
        ],
      },
      {
        title: "Publishing and typical mistakes",
        body: [
          "Wildberries expects consistent catalog style—fix background and model type per line. Ozon benefits from back, flat lay, and lace detail. Kaspi requires honest correspondence—read current main-image help. Export accepted resolution and proportions.",
          "Common failures: changed neckline because it looks better on model; underage-appearing model; missing flat lay and texture proof; bulk upload without per-color QA. Monthly, review fit-related returns—visuals often drive them.",
          "Update photos when factories or fabric batches change. Link clothing-on-model and exact product card guides. Honest neutral catalog beats risky gloss with the wrong garment.",
        ],
      },
      {
        title: "Scaling lingerie and swim QA safely",
        body: [
          "Treat every SKU like a compliance review: adult model, neutral pose, visible construction, no sexualized framing. Pair on-model frames with flat lay when category rules expect proof of lace, lining, or straps.",
          "For multi-marketplace catalogs, document which exports are Kaspi main versus Wildberries gallery versus Ozon detail—reuse only after re-checking resolution and background rules.",
          "Monthly, sample returns citing fit or color and compare to live photos. Update sources when suppliers change fabric batch. Vitrina AI does not guarantee moderation outcomes.",
        ],
      },
    ],
    checklist: [
      "adult catalog model only",
      "no minors or provocative framing",
      "fit and color match the garment",
      "flat lay or construction detail included",
      "platform image rules checked manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can change fit, lace, color, and construction. Compare every output to the source and physical sample.",
      },
      {
        question: "Does Vitrina AI guarantee marketplace approval?",
        answer: "No. Intimate categories have strict rules; sellers must verify compliance.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
        answer: "No. Check current content and image policies before upload.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For catalog refreshes, careful flat or hanger sources are often enough. Premium campaigns may still need a studio.",
      },
      {
        question: "Can I use AI models for kids underwear?",
        answer:
          "Read platform policies carefully. Flat lay and platform-approved capture methods are often safer than AI models for children's categories.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Lingerie on AI model", href: "/en/use-cases/lingerie-on-ai-model" },
      { label: "Clothing on AI model", href: "/en/use-cases/clothing-on-ai-model" },
      { label: "Review AI photos before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Clothing photos on a model", href: "/en/blog/how-to-create-clothing-photos-on-a-model" },
      { label: "Wildberries product photos", href: "/en/blog/product-photos-for-wildberries" },
    ],
  },
  "blog_021": {
    title: "How to Create Jewelry Product Photos for a Marketplace",
    metaDescription:
      "Jewelry marketplace photos for Kaspi, Wildberries, Ozon: macro light, glare control, chain edges, and strict AI review—no moderation guarantees from Vitrina AI.",
    intro:
      "Jewelry sells through small details: stone shape, metal tone, chain length, and readable clasps. Smartphone plus AI Studio can build marketplace cards without a permanent photographer, but glare, transparency, and thin links are frequent failure zones. Vitrina AI Studio accelerates drafts but does not guarantee moderation on Kaspi, Wildberries, or Ozon. It is not an official marketplace partner. Below is a practical workflow with strict manual review. For Etsy and eBay exports, reuse the same macro discipline—buyers enlarge thumbnails and notice broken links immediately. Keep a high-resolution master per SKU and downscale only after cutout and metal-tone QA pass. Schedule QA in the launch calendar like pricing updates.",
    shortAnswer:
      "Shoot macro in diffused light, use jewelry or exact product card mode, and verify stones, metal, chains, and cutout edges before upload. Reject frames with broken links, extra glare, or shifted metal tone. For multi-piece sets, photograph and QA each piece—AI must not invent stones or clasps that are not in the parcel. Compare every export to the source at high zoom before Kaspi, Wildberries, or Ozon upload. Log rejections monthly to improve sources.",
    sections: [
      {
        title: "Why jewelry is harder than a standard product shot",
        body: [
          "Small scale magnifies errors: AI may smooth stone facets, change link count, or shift metal color. Buyers compare photos to items in the parcel—tone or length mismatch drives returns. Main images on Kaspi, Wildberries, and Ozon often need neutral backgrounds without distracting text or foreign logos. Vitrina AI helps prepare files; sellers own final truth.",
          "Hard flash creates spots that were not on the real piece. Semi-transparent stones and glass inserts may turn matte or oversaturated. Sets—earrings plus necklace—must show the exact bundle without invented pieces. Read current jewelry category image help—it updates without loud announcements.",
          "Video and Reels from photo are in development; rely on verified static frames for now. Do not publish video if the feature is unavailable in your Studio version. Honest simple cards beat glossy frames with wrong stones. Store originals per SKU for disputes.",
        ],
      },
      {
        title: "Source capture: light and angles",
        body: [
          "Shoot in diffused light—curtained window, softbox, or dual side sources without direct flash into stones. The product should fill the frame; do not clip tassels, clasps, or chain ends. Capture front, profile, stone macro, and clasp close-up even if only one AI frame becomes main.",
          "Avoid warm lamp light on gold—AI may push warmth further. For silver add a reflector to keep texture without blue blowout. Use gloves or clean stands to limit fingerprints on polished metal before processing.",
          "Do not use supplier photos without commercial rights. Save multiple exposures when needed—pick the best for generation instead of reshooting late. For Kaspi, tie visuals to warehouse stock and description. Weak sources make AI invent facets that do not exist.",
        ],
      },
      {
        title: "Vitrina AI Studio workflow",
        body: [
          "Pick jewelry or exact product card mode—more conservative than lifestyle for detail retention. Generate at least two variants; compare to the original on a monitor. White or light gray backgrounds are usually safer for marketplace main images. Lifestyle can live in extra slots or social if the product stays recognizable.",
          "Treat background removal and replacement as separate steps with edge checks between them. No fake brands or invented awards on main images. Define who may upload after QA. Vitrina AI does not guarantee moderation acceptance.",
          "When updating collections, copy workflow—not unchecked presets. Spot-check every fifth SKU in bulk. Regeneration beats reviews citing wrong metal color. AI remains draft until your checklist passes.",
        ],
      },
      {
        title: "Review stones, metal, and chains",
        body: [
          "Compare stone count, cut shape, size, and color to source and shelf sample. Metal must not shift—rose gold should not become yellow, silver should not become steel. Chains need intact links without breaks, doubles, or melted segments. Clasps, hooks, and ear wires must match position and shape.",
          "Zoom cutout edges on thin elements and pendants. Phone review misses issues buyers see enlarged. Archive before/after per SKU. Reject on any stone or metal doubt.",
          "Second reviewer helps catch extra AI glare. For sets, match bundle to description. Do not retouch away scratches that exist on the shipped item—that misleads buyers.",
        ],
      },
      {
        title: "Publishing on Kaspi, Wildberries, and Ozon",
        body: [
          "Kaspi requires honest product correspondence—read current image help. Wildberries values unified catalog style across a jewelry line. Ozon benefits from macro, profile, and occasional on-model scale frames. Export cabinet-ready resolution and aspect ratio.",
          "Typical failures: prettier AI stones than reality; clipped chains on main; supplier watermarks; bulk upload without per-SKU QA. Monthly, review returns citing wrong color—visuals are often the cause.",
          "Update photos when factories or stone batches change. Link white background and exact product card guides. Vitrina AI is independent—not a marketplace partner.",
        ],
      },
      {
        title: "Typical mistakes and how to avoid them",
        body: [
          "Publishing the first variant without source comparison leads mismatch complaints. Shooting on mirrors without controlling reflections amplifies AI artifacts. Description promises materials not visible in photos. Ignoring main-image rules for jewelry categories.",
          "Poor lighting makes AI invent stone edges. Bulk generation without spot checks spreads systematic errors. Copying visuals across marketplaces without local rule checks.",
          "One hour of QA beats return clusters on bestsellers. Train marketplace staff on jewelry checklist basics. Honest neutral cards outperform risky gloss with the wrong piece.",
        ],
      },
      {
        title: "Scaling jewelry QA across channels",
        body: [
          "Macro sources and cutout checks do not scale by skipping zoom review—batch exports, not batch approval. Keep high-resolution masters; downscale per marketplace only after QA on the master.",
          "Multi-piece sets need each component photographed and verified—AI must not invent stones, clasps, or chain links. When listing on Kaspi, Wildberries, and Ozon, re-run metal tone and edge checks after compression.",
          "Quarterly, compare live cards to warehouse samples for top SKUs. Update internal checklists when platforms change jewelry image help. Publication responsibility stays with the seller.",
        ],
      },
    ],
    checklist: [
      "stones and metal match the product",
      "chain has no breaks or duplicates",
      "cutout edges checked at high zoom",
      "main background is neutral",
      "platform image rules checked manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can alter stones, metal, chains, and edges. Compare every output to the source and physical sample.",
      },
      {
        question: "Does Vitrina AI guarantee marketplace approval?",
        answer: "No. Rules change and the seller must verify compliance before publication.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?",
        answer: "No. Check current jewelry category requirements before upload.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For many SKUs, diffused-light smartphone macro is enough. High-end campaigns may still need specialist capture.",
      },
      {
        question: "Is one macro shot enough for the full card?",
        answer:
          "Sometimes for launch, but buyers need clasp, length, and overall scale. Plan main, macro, and scale or on-model frames when useful.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Jewelry product photos", href: "/en/use-cases/jewelry-product-photos" },
      { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
      { label: "Review AI photos before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Kaspi platform page", href: "/en/platforms/kaspi-product-photos" },
      { label: "White background for products", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
    ],
  },
  "blog_031": {
    title: "Product Photos for Kaspi: Visual Prep, AI Drafts, and Manual Review",
    metaDescription:
      "Kaspi product photos: neutral main images, Vitrina AI Studio workflow, warehouse match, and manual QA. Independent tool—not an official Kaspi partner.",
    intro:
      "Kaspi.kz remains a key channel for sellers in Kazakhstan, and the first photo often decides whether shoppers open the card and trust the price. A static product shot with a readable item and without aggressive on-image text is still safer than click-bait experiments. Vitrina AI Studio speeds card drafts but does not guarantee Kaspi moderation approval. Vitrina AI is an independent visual prep tool, not an official Kaspi partner; sellers must verify current rules and remain responsible for publication. When you also sell on Wildberries or Ozon, re-export only after re-checking each cabinet format—do not assume one file fits all channels.",
    shortAnswer:
      "Shoot in soft even light, build main and gallery frames in Studio, then match color and bundle to the real SKU before Kaspi upload. Reject any AI frame that changes shape, shade, or contents—regeneration is cheaper than returns and buyer claims. When exporting to Wildberries or Ozon, re-check each cabinet image format before reuse.",
    sections: [
      {
        title: "What Kaspi expects from the main photo",
        body: [
          "The main image should show the real product without misleading effects, foreign logos, or aggressive infographic overlays on the item itself. Kaspi shoppers compare visuals to delivery photos and reviews—mismatch quickly becomes returns and store distrust. Unified catalog style helps large assortments from mixed suppliers look professional. Open current Kaspi image help—rules change and Studio does not receive separate update notices.",
          "Main image does not replace description: bundle, warranty, size, and material must match what buyers see. For many categories a neutral or white background is safer than creative scenes that hide scale. AI accelerates that frame but does not promise first-attempt approval. Sellers remain responsible for product, visual, and warehouse alignment.",
          "New sellers can start with a simple honest product shot and expand the gallery as assortment grows. Do not use supplier photos without commercial rights—account risk exceeds one rejection. Match main image to shelf samples before large uploads. Honest neutral cards outperform glossy wrong-color frames.",
        ],
      },
      {
        title: "Source capture at home or warehouse",
        body: [
          "Use diffused light—curtained window, softbox, or dual side sources without harsh flash into the lens. The product should fill the frame with readable edges and no clipped parts, cords, lids, or other-brand packaging. Plain gray, beige, or white backdrops reduce cutout errors. Capture front, profile, key detail macro, and bundle shots when needed.",
          "Add reflectors on dark items to preserve texture. Minimize mirror glare on shiny goods—it intensifies during AI processing. Store originals per SKU with batch and color notes for disputes. Avoid blurry messenger-compressed files—AI invents missing detail.",
          "Fix a simple shoot zone on the warehouse floor: table, backdrop, light, phone tripod. Train managers on basic framing—not every SKU needs a designer. Cleaner sources mean fewer post fixes and fewer moderation surprises. Weak captures make models improve shapes that are not in the box.",
        ],
      },
      {
        title: "AI processing in Vitrina AI Studio",
        body: [
          "Choose exact product card or white background—more conservative than lifestyle for shape retention. Generate at least two variants; compare on a large screen before export. Kaspi main images are often safest on neutral backgrounds; lifestyle can support extra slots or social. Vitrina AI does not guarantee Kaspi acceptance and is not an official partner.",
          "When using white background, inspect cutout edges separately—fur, chains, transparent packaging, and thin parts fail often. No fake brands or invented awards on main images. Define who may upload after QA so errors do not spread through the catalog.",
          "Reels and video from photo are in development—build listings on verified static images for now. Do not publish video if unavailable in your version. Regeneration from a better source beats reviews about wrong color. AI output is draft until your checklist passes.",
        ],
      },
      {
        title: "Match the warehouse sample",
        body: [
          "Compare shape, color, pattern, hardware, logos, labels, and bundle to source and the physical unit on the shelf. Use monitors or tablets—phones hide tone shift and edge defects. For sets, confirm photo, description, and box contents align. Reject drifting details—buyers notice faster than teams expect.",
          "Check proportions—angled sources may compress or stretch items in AI. Shadows must not fake different size or stands. Save before/after screenshots per SKU for return investigations. Spot-check every fifth SKU during bulk uploads.",
          "Align copy with visuals—do not promise bundles absent from photos. Update images when suppliers or batches change color or hardware. Second reviewers catch stray AI additions. Export only after the checklist passes.",
        ],
      },
      {
        title: "Gallery frames and infographics",
        body: [
          "Main image drives the first click; buyers still need detail, profile, bundle, instructions, or scale cues. Put size charts and feature callouts in separate slots when Kaspi rules allow—verify before placing text on main. AI can unify extra angles from one source if each frame stays truthful.",
          "Electronics need ports, screens, and cable bundle shots—capture before AI processing. Home goods may need scale references when size is non-obvious. Avoid stock people or interiors without rights. Keep high-resolution masters; upload cabinet-sized exports.",
          "Align Kaspi ads and social posts with the card—divergent banners hurt conversion. Monthly, review top returns citing not as pictured—visuals are a frequent driver. Document which source matches which warehouse batch.",
        ],
      },
      {
        title: "Typical Kaspi seller mistakes",
        body: [
          "Uploading the first AI variant without source comparison—leading return cause. Using watermarked supplier photos—block risk beyond one card. Aggressive lifestyle main images that hide size and material. Bulk generation without spot checks spreads one error across the catalog.",
          "Copy promising more than photos show. Ignoring updated Kaspi image rules from prior seasons. Poor lighting makes AI invent hardware and texture. Expecting AI to pass moderation automatically—responsibility stays with the seller.",
          "Schedule QA in SKU launch calendars like pricing. One hour of control beats return batches on hits. Train marketplace managers on the checklist. Link white background, review-before-publish, and improve-without-photographer guides.",
        ],
      },
    ],
    checklist: [
      "product matches the warehouse sample",
      "main image has no foreign logos or excess text",
      "color and bundle unchanged by AI",
      "gallery detail frames added when needed",
      "Kaspi image rules checked manually",
    ],
    faq: [
      {
        question: "Can I publish AI photos without manual review?",
        answer:
          "No. AI can change shape, color, pattern, logos, or small details. Compare every result to the source before Kaspi upload.",
      },
      {
        question: "Does Vitrina AI guarantee Kaspi approval?",
        answer:
          "No. Kaspi rules change and the seller must verify compliance before publication.",
      },
      {
        question: "Is Vitrina AI an official partner of Kaspi?",
        answer:
          "No. It is an independent tool. Read current Kaspi image requirements for your category before upload.",
      },
      {
        question: "Do I need a professional photographer to start?",
        answer:
          "For catalog refreshes, careful smartphone capture is often enough. Premium hero campaigns may still need a studio.",
      },
      {
        question: "Is pure white required on every Kaspi main image?",
        answer:
          "Requirements depend on category and current Kaspi help. Some niches allow neutral backgrounds; others are stricter—verify before upload.",
      },
      {
        question: "Can I reuse Wildberries files on Kaspi?",
        answer:
          "Only after checking format, aspect ratio, background, and main-image rules for each platform—they differ.",
      },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Kaspi platform page", href: "/en/platforms/kaspi-product-photos" },
      { label: "White background for products", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Review AI photos before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Improve photos without a photographer", href: "/en/blog/how-to-improve-product-photos-without-a-photographer" },
      { label: "Marketplace product photos", href: "/en/product-photo-for-marketplaces" },
    ],
  },
};
