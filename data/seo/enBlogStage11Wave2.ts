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

export const enBlogStage11Wave2: Record<string, EnBlogArticleContent> = {
  "blog_006": {
    title: "How AI Helps Marketplace Sellers: Workflows, Time Savings, and Honest Limits",
    metaDescription: "Where AI speeds up Kaspi, Wildberries, and Ozon listings: backgrounds, catalog unity, clothing on model. No moderation guarantees; not an official marketplace partner.",
    intro: "Marketplace sellers in Central Asia and beyond spend hours on repetitive visuals: white backgrounds, series alignment, and extra angles. AI does not replace business logic or moderation, but it shortens the path from a phone capture to a listing draft. Below are practical scenarios where Vitrina AI Studio saves real time—and where you should still use a photographer or strict manual review. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "AI helps with backgrounds, exact product cards, clothing on model, and batch catalog prep. Compare every export to the physical SKU; the service does not guarantee approval and is not an official Kaspi, Wildberries, or Ozon partner. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Three scenarios that usually pay off",
        body: [
          "Launching new SKUs without a studio: showroom capture, white background or product shot, upload after QA. Normalizing supplier images with mismatched backgrounds into one catalog style without changing kit contents. Apparel and accessories that need a consistent look without a model shoot per garment. Attach a checklist to each scenario: shape, color, pattern, hardware, labels—and one approver for export.",
          "Niche testing is valid too: ten SKUs in an evening instead of a week of shoots. Testing does not mean skipping review—early runs reveal typical AI drift. Track SKU, source file, AI version, review date, and approver in a spreadsheet. That makes scaling to a second marketplace safer.",
          "Do not mix AI output with random Pinterest references—account risk and buyer disputes follow. Use only your own capture or licensed supplier art. Keep originals next to AI versions for complaints. An honest card beats a cinematic wrong color.",
          "Pair the workflow with platform guides for Kaspi, Wildberries, and Ozon in the blog. Read current seller help before bulk upload, not a year-old social post. Vitrina AI speeds production; it does not read rules for you. Publication responsibility stays with the seller.",
        ],
      },
      {
        title: "Time saved vs hidden costs",
        body: [
          "Savings come from repeatable steps: background removal, scene swap, apparel on AI model. Hidden costs are returns for wrong color, moderation rework, and store reputation. Count review minutes on a large screen, not only generation time. One missed defect on a bestseller erases savings in a day.",
          "Batch generation without spot-checking every 5–10 SKUs spreads one systematic error. Assign one approver per category: apparel, electronics, jewelry—each has different traps. Regeneration is cheaper than a “wrong color” return. Do not promise in copy what the image does not show.",
          "Compare with a photoshoot in our AI vs shoot article. Hero brand lines may still need a photographer; long-tail SKUs often work with AI. Many teams mix: shoot for top 20, AI for the rest—with one QA checklist. Consistency matters more than the tool label.",
          "Open pricing and pilot twenty SKUs: staff time, Studio credits, return risk. Scale the catalog only after the pilot. Document who shoots, generates, and approves—or roles blur. See How it works and AI quality pages on the site.",
        ],
      },
      {
        title: "Kaspi, Wildberries, Ozon: different emphasis",
        body: [
          "Kaspi buyers judge thumbnail clarity and product honesty on the main image. Wildberries cares about series style and fit on model for apparel. Ozon values extra angles; video-from-photo is a separate flow still in development. Do not copy files across platforms without format and background checks.",
          "Read platform blog guides—they supplement but do not replace seller help centers. Vitrina AI is not a platform partner and does not guarantee moderation. When rejected, compare the reason to your checklist—often it is mismatch, not AI itself. Log rejections by SKU.",
          "Regional stores often start on Kaspi, then add Wildberries. Plan a content pack: main, detail, optional social frame—all one SKU and color. Resize per platform; do not stretch. Preview on a phone like buyers do.",
          "Link to exact product card and white background use cases. For apparel, use clothing-on-model with hem and print checks. Refresh background presets each season for a pro look without a studio. One hour of QA beats a return cluster on launch day.",
        ],
      },
      {
        title: "Limits you cannot ignore",
        body: [
          "AI may soften texture, shift hue, invent hardware, or change proportions. There is no 100% accuracy or moderation guarantee. Jewelry, glass, and complex electronics need macro sources and stricter QA. When unsure, keep the original or reshoot in diffused daylight.",
          "Reject frames with visible cutout halos on zoom. Shadows must not imply a different size or hidden stand. For bundles, verify kit contents match copy. See articles on preserving the product and pre-publish review.",
          "Video and Reels-from-photo are in development—rely on reviewed stills. Do not promise video until your Studio version supports it. When video ships, apply the same rule: on-screen product equals shipped product. Honest copy reduces angry reviews more than flashy transitions.",
          "Train the marketplace owner on QA, not only design. Quarterly refresh internal checklists from “not as pictured” returns. AI is an accelerator, not liability transfer. Open Studio after roles are clear.",
        ],
      },
      {
        title: "Step-by-step pilot on one category",
        body: [
          "Pick 5–10 SKUs in one category with clean sources. Shoot in even light, upload to Studio, generate 2–3 variants per SKU. Compare to originals and lock a category checklist. Then scale to hundreds of lines.",
          "Fix a preset: white background or exact card, angle, distance. Save before/after in the SKU folder for onboarding. Tie to the marketplace product photo workflow article. Add the without-a-photographer guide for warehouse teams.",
          "After the pilot, track conversion and returns for two weeks—not only upload speed. If photo-related returns rise, tighten QA instead of skipping it. Embed marketplace rule reminders in your task system. AI becomes operations, not a one-off experiment.",
          "Move to ecommerce catalog use case for hundred-SKU waves. Jewelry needs its own marketplace photo guide. Plan credits and pricing before peak season. A successful pilot is a repeatable process, not one lucky frame.",
        ],
      },
      {
        title: "Team roles and scaling",
        body: [
          "Define shooter, Studio mode picker, reviewer, and uploader. One person may wear multiple hats early, but boundaries must be explicit. Juniors should not publish disputed frames without a second reviewer. Document in Notion or sheets so vacations do not break the pipeline.",
          "At scale, audit every 10th SKU after batch runs. Categories with repeat AI errors get extra checklists—lace, metal, clear plastic. Align ads with listings: banners must show the same variant. Trust drops when CTR is high but photos disagree.",
          "Point staff to AI product photography basics and AI vs photoshoot comparison. Revisit the AI quality page for common drift patterns. Do not use AI to hide warehouse defects—ethical and legal risk. Honest listings drive repeat buyers.",
          "International or Etsy expansion needs other formats—plan ahead. The core rule stays: source, conservative mode, manual review. Open Studio with a test SKU before a promo deadline—not during it. That is how AI helps sellers without error avalanches.",
        ],
      },
    ],
    checklist: ["sharp source, product fills most of the frame", "color and shape match the physical SKU", "shoot / QA / upload roles assigned", "marketplace rules checked in seller help", "copy does not promise unseen items"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I run AI on the entire catalog at once?", answer: "Batch runs are possible, but without spot QA systemic errors spread fast. Start with one category pilot." },
      { question: "Does AI replace a marketplace manager?", answer: "No. AI prepares images; copy, pricing, logistics, and moderation stay with your team." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "AI product photography basics", href: "/en/blog/what-is-ai-product-photography" },
      { label: "Kaspi product photos", href: "/en/blog/product-photos-for-kaspi" },
      { label: "Review before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
      { label: "Ecommerce catalog", href: "/en/use-cases/ecommerce-catalog-photos" },
    ],
  },
  "blog_007": {
    title: "Product Photo Mistakes That Hurt Sales: A Marketplace Seller Checklist",
    metaDescription: "Common listing photo mistakes on marketplaces: light, background, color, kit mismatch, and AI artifacts—fixes without moderation guarantees.",
    intro: "Buyers decide in seconds whether to trust a listing thumbnail. Photo mistakes are not always obvious to sellers on a phone, but they hit conversion and returns. Below is a practical breakdown of common failures and how to catch them before publish—including after AI processing. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Top failures: wrong color, hidden kit items, bad light, clutter, and publishing AI without review. Fix the source and QA checklist first—not only a prettier background. Vitrina AI Studio is an independent tool and does not guarantee marketplace approval. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Mistake 1: color and hue do not match the product",
        body: [
          "Yellow on screen and gray in the box drives “wrong color” returns. AI increases drift: models may shift metal, fabric, or plastic hue. Compare to a warehouse sample in daylight, not memory alone. Archive before/after pairs per SKU—buyer disputes resolve faster than platform arguments.",
          "When hue is disputed, reshoot a reference frame beside the unit with no phone filters. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review. Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews.",
          "Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Mistake 2: kit and contents mislead buyers",
        body: [
          "One item on the main image and a three-piece kit in copy feels deceptive. Show the full kit or state clearly that you sell a single unit. Do not prompt scenes that invent accessories not in the box. Gallery slides must repeat the same kit as title and warehouse—otherwise reviews turn negative.",
          "For bundles, add an “everything in frame” shot plus a key-detail macro. Assign roles: shooter, Studio mode picker, export approver, and marketplace uploader. Track SKU, review date, and approver in a sheet—buyer disputes are easier to resolve. Pilot 5–10 SKUs in one category before batch runs to avoid catalog-wide drift.",
          "Do not use third-party photos without rights; keep originals beside AI exports.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Mistake 3: light, shadows, and messy backgrounds",
        body: [
          "Hard flash creates glare and deep shadows—AI may invent missing detail. Diffused light and a plain source background reduce artifacts. See improve-without-photographer and white-background guides. A fixed shoot angle matters more than an expensive camera—series should look like one team.",
          "Reject frames where shadows imply a different size or hidden stand. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review. Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews.",
          "Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Mistake 4: clutter and third-party logos",
        body: [
          "Other-brand packaging, foreign logos, random cables—moderation risk. Clear the set before capture; after AI, confirm nothing new appeared. Pair with removing unwanted objects from product photos. Foreign watermarks and competitor screenshots risk account issues, not only one SKU rejection.",
          "Buyers compare visuals to reviews—a stray brand in background reads as reselling someone else’s item. Assign roles: shooter, Studio mode picker, export approver, and marketplace uploader. Track SKU, review date, and approver in a sheet—buyer disputes are easier to resolve. Pilot 5–10 SKUs in one category before batch runs to avoid catalog-wide drift.",
          "Do not use third-party photos without rights; keep originals beside AI exports.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Mistake 5: trusting the first AI preview",
        body: [
          "First Studio preview often looks “fine” on a phone—defects show on a monitor. Generate 2–3 variants; prefer exact product card for marketplaces. See review-before-publish and preserve-product articles. Spot-check every fifth SKU after batch runs to catch systematic drift.",
          "Regeneration is cheaper than a “item not as pictured” return cluster. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review. Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews.",
          "Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Bake review into your workflow",
        body: [
          "Name an approver; juniors should not publish disputed frames alone. Monthly review returns tagged “not as pictured.” Link to How it works and AI quality pages. Honest listings beat gloss; Vitrina AI is not a Kaspi/WB/Ozon partner.",
          "Video and Reels-from-photo are in development—do not promise video until your Studio version supports it. Document the checklist: shoot → Studio → QA → upload so errors do not repeat across hundreds of SKUs.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["on-screen color matches warehouse", "photo kit matches copy", "no third-party logos", "AI compared to source", "marketplace rules checked"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Review AI photos", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "White background", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Improve without photographer", href: "/en/blog/how-to-improve-product-photos-without-a-photographer" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_009": {
    title: "Why AI Changes a Product Image and How to Reduce It",
    metaDescription: "Why AI drifts shape, color, and details—and how to reduce risk with source photos, Studio modes, and manual review. No moderation guarantees.",
    intro: "AI does not see your warehouse—it interprets pixels. Sometimes that interpretation changes what buyers receive. Here are causes of drift and practical ways to reduce risk for Kaspi, Wildberries, Ozon, and other channels. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Use conservative modes, better sources, and always compare exports to originals on a large screen. There is no 100% guarantee of zero change—only a control process. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Causes: bad light and noise in the source",
        body: [
          "Blurry or dark sources make the model invent texture and edges—buckles and patterns drift. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Causes: overlap and complex edges",
        body: [
          "Overlapping sleeves, cables on housings, glare on clear packs—cutout edges break. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Causes: aggressive lifestyle prompts",
        body: [
          "Rich lifestyle prompts change the product more than exact card or white background modes. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Lower-risk Studio modes",
        body: [
          "Start marketplaces on exact card or neutral background; save creative scenes for extra slides after QA. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Before/after comparison checklist",
        body: [
          "Match stitches, logos, stones, labels; archive before/after screenshots per SKU. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "When to skip the AI frame",
        body: [
          "If three tries still fail the detail, publish the source or reshoot—do not force AI. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Preserve the product", href: "/en/blog/how-to-make-ai-preserve-the-product" },
      { label: "Review before publishing", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_010": {
    title: "How to Preserve Product Color and Shape in AI Photos",
    metaDescription: "Preserve color and shape in AI product photos: lighting, source capture, conservative Studio modes, and QA—without 100% accuracy guarantees.",
    intro: "Marketplace buyers purchase a SKU, not an abstract image. If AI shifts hue or narrows silhouette, returns rise even with strong CTR. Below is a step-by-step approach from capture to export with manual review. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Shoot in even light, use exact card or white background, compare on a large monitor. The service does not guarantee perfect match—sellers own publication decisions. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Light and white balance",
        body: [
          "Use diffused daylight or two soft sources; avoid yellow bulbs that bias fabric and plastic hue. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Framing and scale",
        body: [
          "Let the product fill most of the frame without extreme top-down perspective that skews proportions. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Choosing a Studio mode",
        body: [
          "Exact product card or white background modes are usually gentler than lifestyle for the main image. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Two or three variants",
        body: [
          "Generate at least two variants—the first preview is often worse than the second on the same source. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Warehouse check",
        body: [
          "Match the export to a shelf sample: metal, plastic, print, size. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "SKU documentation",
        body: [
          "Store source and approved AI files in one SKU folder with review date. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Preserve product", href: "/en/blog/how-to-make-ai-preserve-the-product" },
      { label: "White background", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Card from photo", href: "/en/blog/how-to-make-a-product-card-from-a-regular-photo" },
      { label: "AI quality", href: "/en/quality" },
      { label: "Exact product card", href: "/en/use-cases/exact-product-card" },
    ],
  },
  "blog_019": {
    title: "How to Create a Clothing Catalog Without a Photoshoot",
    metaDescription: "Clothing catalog without a studio: flatlay, AI model, unified style for Wildberries and Shopify—with fit QA and honest limits.",
    intro: "Per-garment model shoots are expensive and slow. For mid-range and long-tail SKUs, AI and flatlay unify catalog style faster. Fit, length, and color must still match the real piece—or returns erase savings. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Combine flatlay for fabric detail and AI model for catalog rows; review every export. Vitrina AI does not replace buyer try-on or guarantee moderation. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Series plan: preset and angle",
        body: [
          "Lock one background, camera height, and distance—or the catalog visually jumps. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Flatlay and details",
        body: [
          "Flatlay shows print and texture; AI model shows silhouette and length—use both. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Clothing on AI model",
        body: [
          "Check sleeves, hem, neckline; reject frames where AI slims or lengthens the garment. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Size chart in copy",
        body: [
          "State model height and worn size in copy; do not promise universal fit. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Wildberries vs Instagram",
        body: [
          "Wildberries favors neutral presentation; Instagram creative only if the SKU stays identical. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Scale without drift",
        body: [
          "Batch runs need every-10th-SKU audits to catch systematic drift. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Clothing on model", href: "/en/blog/how-to-create-clothing-photos-on-a-model" },
      { label: "Place on AI model", href: "/en/blog/how-to-place-clothing-on-an-ai-model" },
      { label: "Wildberries photos", href: "/en/blog/product-photos-for-wildberries" },
      { label: "Clothing use case", href: "/en/use-cases/clothing-on-ai-model" },
      { label: "Pricing", href: "/en/cost" },
    ],
  },
  "blog_020": {
    title: "How to Prepare Clothing Photos for AI Try-On",
    metaDescription: "Prepare clothing photos for AI try-on: hanger, flatlay, lighting, minimal folds, and fit review before publishing.",
    intro: "AI try-on quality starts in the source capture, not only in Studio. Heavy folds, shadows, and clutter make the model guess wrong on cut and color. Below is prep for Kaspi, Wildberries, Ozon, and Shopify without promising perfect fit. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Shoot on a hanger or flatlay in even light; remove overlaps and foreign tags. After generation, compare length, print, and color to the real garment. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Hanger vs flatlay",
        body: [
          "Hangers show volume; flatlay shows print—catalogs often need both sources. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Light without hard shadows",
        body: [
          "Two soft side sources reduce fold pits where AI invents fabric. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Mask and contour",
        body: [
          "Keep contours readable—do not hide pockets or decor with props. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Model pose choice",
        body: [
          "Neutral poses for marketplaces; creative angles for social after separate QA. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Fit QA",
        body: [
          "Compare shoulders, hem, armhole; reject proportion shifts. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "When to use a real shoot",
        body: [
          "Premium lines or complex cut may still need live models—AI is not always enough. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Place on AI model", href: "/en/blog/how-to-place-clothing-on-an-ai-model" },
      { label: "Clothing on model", href: "/en/blog/how-to-create-clothing-photos-on-a-model" },
      { label: "Lingerie on model", href: "/en/blog/lingerie-photos-on-an-ai-model" },
      { label: "Clothing use case", href: "/en/use-cases/clothing-on-ai-model" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_029": {
    title: "How to Prepare Bag Photos for a Marketplace",
    metaDescription: "Bag photos for Kaspi and Ozon: source tips, handles, hardware, white background, and post-AI QA—no moderation guarantees.",
    intro: "Bags and backpacks lose shape and color on weak sources. Buyers judge volume, hardware, and leather or fabric texture. AI helps with backgrounds but must not reshape the item into another silhouette. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Shoot with light stuffing, show handles and zippers; after AI, verify every corner. Pair with Kaspi and exact product card guides. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Stuffing and silhouette",
        body: [
          "Light stuffing keeps volume; empty bags look softer than reality. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Light on hardware",
        body: [
          "Diffuse hardware glare or AI shifts metal tone. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Background and cutout",
        body: [
          "White or light gray main; texture detail on an extra slide. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Gallery angles",
        body: [
          "Front, profile, interior, scale reference without deceiving size. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Ozon and Kaspi",
        body: [
          "Check Kaspi and Ozon seller help; Vitrina AI is not a platform partner. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Typical AI errors",
        body: [
          "AI may narrow handles or shift hue—source comparison is mandatory. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Kaspi", href: "/en/blog/product-photos-for-kaspi" },
      { label: "Ozon", href: "/en/blog/product-photos-for-ozon" },
      { label: "Exact card", href: "/en/use-cases/exact-product-card" },
      { label: "White background", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "AI quality", href: "/en/quality" },
    ],
  },
  "blog_034": {
    title: "Product Photos for eBay: Requirements, AI Workflow, and Review",
    metaDescription: "Product photos for eBay: listing prep, white background, manual post-AI review. Vitrina AI is independent, not an official eBay partner—no moderation guarantee.",
    intro: "eBay sellers compete on thumbnails and visual trust. Image rules change—read current seller help. Vitrina AI Studio speeds prep but does not guarantee approval. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Shoot a sharp source, use white background or exact card, verify the product after AI. Do not publish if color or kit does not match what you ship. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "What eBay reviewers look for",
        body: [
          "The main image must honestly show the SKU without banned text or watermarks per policy. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Source and light",
        body: [
          "Even light and neutral source backgrounds reduce AI edge artifacts. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Studio modes",
        body: [
          "Exact card fits conservative mains; lifestyle belongs on extra slides after QA. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Gallery and formats",
        body: [
          "Keep a master file; upload eBay-sized exports per seller help. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "International nuances",
        body: [
          "Selling on Kaspi and eBay too? Do not blindly reuse files—rules differ. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Pre-upload checklist",
        body: [
          "Rejection logs by SKU speed up team learning. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Marketplace photos", href: "/en/blog/how-to-create-product-photos-for-a-marketplace" },
      { label: "White background", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Review AI", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_035": {
    title: "Product Photos for Amazon: Requirements, AI Workflow, and Review",
    metaDescription: "Product photos for Amazon: listing prep, white background, manual post-AI review. Vitrina AI is independent, not an official Amazon partner—no moderation guarantee.",
    intro: "Amazon sellers compete on thumbnails and visual trust. Image rules change—read current seller help. Vitrina AI Studio speeds prep but does not guarantee approval. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Shoot a sharp source, use white background or exact card, verify the product after AI. Do not publish if color or kit does not match what you ship. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "What Amazon reviewers look for",
        body: [
          "The main image must honestly show the SKU without banned text or watermarks per policy. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Source and light",
        body: [
          "Even light and neutral source backgrounds reduce AI edge artifacts. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Studio modes",
        body: [
          "Exact card fits conservative mains; lifestyle belongs on extra slides after QA. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Gallery and formats",
        body: [
          "Keep a master file; upload Amazon-sized exports per seller help. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "International nuances",
        body: [
          "Selling on Kaspi and Amazon too? Do not blindly reuse files—rules differ. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Pre-upload checklist",
        body: [
          "Rejection logs by SKU speed up team learning. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Marketplace photos", href: "/en/blog/how-to-create-product-photos-for-a-marketplace" },
      { label: "White background", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Review AI", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_036": {
    title: "Product Photos for Etsy: Requirements, AI Workflow, and Review",
    metaDescription: "Product photos for Etsy: listing prep, white background, manual post-AI review. Vitrina AI is independent, not an official Etsy partner—no moderation guarantee.",
    intro: "Etsy sellers compete on thumbnails and visual trust. Image rules change—read current seller help. Vitrina AI Studio speeds prep but does not guarantee approval. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Shoot a sharp source, use white background or exact card, verify the product after AI. Do not publish if color or kit does not match what you ship. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "What Etsy reviewers look for",
        body: [
          "The main image must honestly show the SKU without banned text or watermarks per policy. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Source and light",
        body: [
          "Even light and neutral source backgrounds reduce AI edge artifacts. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Studio modes",
        body: [
          "Exact card fits conservative mains; lifestyle belongs on extra slides after QA. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Gallery and formats",
        body: [
          "Keep a master file; upload Etsy-sized exports per seller help. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "International nuances",
        body: [
          "Selling on Kaspi and Etsy too? Do not blindly reuse files—rules differ. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Pre-upload checklist",
        body: [
          "Rejection logs by SKU speed up team learning. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Marketplace photos", href: "/en/blog/how-to-create-product-photos-for-a-marketplace" },
      { label: "White background", href: "/en/blog/how-to-make-a-white-background-for-a-product" },
      { label: "Review AI", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_049": {
    title: "How to Prepare Product Photos for Instagram",
    metaDescription: "Product photos for Instagram Shop: 1:1, 4:5, 9:16, AI backgrounds, manual QA—no moderation guarantee. Video/Reels from photo still in development.",
    intro: "Instagram rewards feed rhythm, yet the SKU must stay recognizable. Creative backgrounds are more common than on Kaspi, but mismatch still hurts DMs and returns. Below focuses on stills; video-from-photo is separate and partly in development. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Keep a 1:1 master; crop 4:5 and 9:16 without changing the product. Review color on a large screen before Shop publish. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Feed and Shop formats",
        body: [
          "1:1 is the base; 4:5 for feed; 9:16 for Stories/Reels when supported. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Light and series style",
        body: [
          "A unified feed palette does not excuse hue drift on one SKU. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "AI without product drift",
        body: [
          "Studio lifestyle only after confirming print and shape are unchanged. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Reels and video",
        body: [
          "Reels-from-photo is in development—do not promise video early. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Link to marketplaces",
        body: [
          "Same SKU on Kaspi? Main images are often stricter—do not mix files blindly. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Publish checklist",
        body: [
          "Captions never replace an honest product frame. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Reels from photo", href: "/en/blog/how-to-make-reels-from-a-product-photo" },
      { label: "Improve photos", href: "/en/blog/how-to-improve-product-photos-without-a-photographer" },
      { label: "Replace background", href: "/en/blog/how-to-replace-a-product-background" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_055": {
    title: "How Marketplace Managers Can Speed Up Content",
    metaDescription: "Marketplace managers: faster listings with Studio, checklists, and batch QA—no moderation guarantee.",
    intro: "Catalog managers drown in coordination: photos, copy, moderation, returns. AI removes background busywork but without process it multiplies mistakes. Below: roles, SLAs, and QA for Kaspi, Wildberries, Ozon. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Split shoot, generate, QA, and upload; pilot per category before peak season. Vitrina AI is not a platform partner and does not guarantee acceptance. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Process map",
        body: [
          "Supplier to live: source → Studio → QA → cabinet → post-moderation. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Checklist templates",
        body: [
          "One checklist per category—apparel, electronics, jewelry differ. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Batch generation",
        body: [
          "Cap batches at 20–30 SKUs with every-5th audit. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Rejection log",
        body: [
          "Log rejection reasons—often mismatch, not “AI banned.” Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Ad alignment",
        body: [
          "Ads and main images must show the same variant. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Quality metrics",
        body: [
          "Track “not as pictured” returns, not only upload speed. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Kaspi", href: "/en/blog/product-photos-for-kaspi" },
      { label: "Wildberries", href: "/en/blog/product-photos-for-wildberries" },
      { label: "Review AI", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Catalog", href: "/en/use-cases/ecommerce-catalog-photos" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_060": {
    title: "When AI Product Photos Beat a Photoshoot",
    metaDescription: "AI vs photoshoot: speed, cost, catalog scale—when AI fits, when photographers win; no outcome guarantees.",
    intro: "Shoots deliver premium visuals but do not scale to thousands of SKUs. AI wins on long tail, niche tests, and background normalization. No magic—manual review is mandatory either way. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "AI fits repeatable cards and tight budgets; shoots fit hero brand lines. See also AI vs photoshoot in the blog. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "SKU economics",
        body: [
          "Per-frame AI cost is lower if you count QA time, not credits alone. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Launch speed",
        body: [
          "100 SKUs per week from a phone is realistic; 100 studio SKUs need staff. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Quality and risk",
        body: [
          "AI risk is systemic color drift; shoot risk is human inconsistency on set. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Hybrid model",
        body: [
          "Top 20 on photographer, rest in Studio is a common hybrid. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Team",
        body: [
          "Document who approves exports. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Pre-season pilot",
        body: [
          "Pilot plus return metrics decide AI expansion. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "AI vs shoot", href: "/en/blog/ai-product-photos-or-a-photoshoot-what-to-choose" },
      { label: "Without photographer", href: "/en/blog/how-to-improve-product-photos-without-a-photographer" },
      { label: "Catalog", href: "/en/use-cases/ecommerce-catalog-photos" },
      { label: "Pricing", href: "/en/cost" },
      { label: "AI quality", href: "/en/quality" },
    ],
  },
  "blog_061": {
    title: "When AI Product Photos Are Not a Fit",
    metaDescription: "When to skip AI product photos: jewelry, premium lines, complex electronics—and honest alternatives.",
    intro: "AI is not universal. In some categories, detail drift costs more than shoot savings. Below are stop signals and alternatives. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Macro jewelry, sensitive claims, and hero campaigns need photographers or non-AI sources. If AI still drifts after three tries, publish the original. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "High-risk categories",
        body: [
          "Gemstones, micro electronics, regulated goods—strict control or no AI. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Legal and ethical lines",
        body: [
          "Do not hide defects or change kits via prompts. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Technical limits",
        body: [
          "Weak sources are not fixed by generation—reshoot. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "When source is enough",
        body: [
          "Honest gray-background photo beats perfect AI wrong color. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Mixed catalog",
        body: [
          "Tag SKUs internally: source-only vs AI-allowed. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Team communication",
        body: [
          "Teach buying and warehouse why rushed AI hurts ratings. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Jewelry guide", href: "/en/blog/how-to-create-jewelry-product-photos-for-a-marketplace" },
      { label: "Preserve product", href: "/en/blog/how-to-make-ai-preserve-the-product" },
      { label: "AI vs shoot", href: "/en/blog/ai-product-photos-or-a-photoshoot-what-to-choose" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_063": {
    title: "How to Check the Quality of AI Product Cards",
    metaDescription: "QA for AI product cards: source match, edges, color, kit, moderation—team workflow; Vitrina AI does not guarantee platform approval.",
    intro: "Quality is not “designer taste”—it is product match and platform compliance. One checklist reduces fights between marketing and marketplace ops. Below are approve/reject steps. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Two reviewers on disputed SKUs; before/after archive; tie to AI quality page. No fully automatic accuracy guarantee. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Level 1: automatic stops",
        body: [
          "Stop: watermarks, foreign logos, empty frame, obvious artifacts. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Level 2: source match",
        body: [
          "Match shape, color, pattern, hardware at 100% edge zoom on a monitor. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Level 3: edges and shadows",
        body: [
          "Natural shadows; no halos; transparent parts not clipped. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Level 4: listing copy",
        body: [
          "Copy and kit match the frame. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Level 5: spot audit",
        body: [
          "Every 5–10 batch SKUs get full QA. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Team training",
        body: [
          "Refresh checklist quarterly from return logs. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Review before publish", href: "/en/blog/how-to-review-ai-product-photos-before-publishing" },
      { label: "Preserve product", href: "/en/blog/how-to-make-ai-preserve-the-product" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
      { label: "Exact card", href: "/en/use-cases/exact-product-card" },
    ],
  },
  "blog_067": {
    title: "How to Remove Unwanted Objects from a Product Photo",
    metaDescription: "Remove unwanted objects from product photos: set prep, Studio cleanup, QA—the product must not change.",
    intro: "Stray cables, foreign price tags, or competitor hangers cause rejections. AI removes clutter but may nick product edges. Clean the set first, then generate. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Shoot without clutter; use cleanup; verify labels and corners after AI. Pair with background removal and exact card guides. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Prevent on set",
        body: [
          "White or gray paper under the product, no stray props. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Cleanup mode",
        body: [
          "Studio cleanup after conservative product selection. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Edges and labels",
        body: [
          "Zoom hardware—AI sometimes erases tags. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Kaspi and OLX",
        body: [
          "Used goods and OLX need honesty over sterile fantasy. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Batch processing",
        body: [
          "Batch 20 SKUs with edge audits. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "When to skip AI",
        body: [
          "If shape suffers, keep the source photo. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Remove background", href: "/en/blog/how-to-remove-the-background-from-a-product-photo" },
      { label: "Photo cleanup", href: "/en/use-cases/product-photo-cleanup" },
      { label: "Kaspi", href: "/en/blog/product-photos-for-kaspi" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_075": {
    title: "Product Shot or Clothing on Model: What to Choose for Listings",
    metaDescription: "Product shot vs clothing on AI model for Wildberries and Shopify—when to use each and how to review.",
    intro: "Apparel can be flat, mannequin, or on-model. Choice affects conversion and returns. AI switches faster but never removes QA. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Product shot for fabric detail; model for silhouette—often both in gallery. On-screen product must match shipment. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "When product shot is enough",
        body: [
          "Hoodies and basics often sell with flat or product shots. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "When you need a model",
        body: [
          "Dresses and outerwear often win on-model if fit is verified. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "AI model vs mannequin",
        body: [
          "AI model is cheaper than live, but compare length to hanger shots. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Gallery structure",
        body: [
          "Wildberries mains are often neutral; model shots go to gallery. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "WB and Shopify",
        body: [
          "Shopify allows more lifestyle if the SKU stays identical. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Choice mistakes",
        body: [
          "Mistake: model hue differs from flat on the next slide. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Clothing on model", href: "/en/blog/how-to-create-clothing-photos-on-a-model" },
      { label: "Card from photo", href: "/en/blog/how-to-make-a-product-card-from-a-regular-photo" },
      { label: "Wildberries", href: "/en/blog/product-photos-for-wildberries" },
      { label: "Exact card", href: "/en/use-cases/exact-product-card" },
      { label: "Clothing use case", href: "/en/use-cases/clothing-on-ai-model" },
    ],
  },
  "blog_077": {
    title: "AI Model or Real Model: A Catalog Comparison",
    metaDescription: "AI vs real model: cost, speed, trust, moderation—honest limits for Shopify and marketplaces; no fit guarantees.",
    intro: "Live models show natural fit but cost per SKU. AI models scale, yet buyers still compare to flats. The choice is operational, not only aesthetic. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Long tail: AI with strict QA; brand campaigns: live shoots. Do not market AI as official marketplace try-on. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Cost and timeline",
        body: [
          "AI cuts weeks to days on 50-SKU series. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Buyer trust",
        body: [
          "“Not as on model” reviews drop when flats are in gallery. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Moderation rules",
        body: [
          "Check adult and sensitive category policies. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Fit and sizing",
        body: [
          "State model stats in copy. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Hybrid",
        body: [
          "Top SKUs live, rest AI—is a common hybrid. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Presentation ethics",
        body: [
          "Avoid misleading poses or faces without rights. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Clothing on model", href: "/en/blog/how-to-create-clothing-photos-on-a-model" },
      { label: "Place on AI model", href: "/en/blog/how-to-place-clothing-on-an-ai-model" },
      { label: "Lingerie", href: "/en/blog/lingerie-photos-on-an-ai-model" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_094": {
    title: "How to Write a Prompt for Product Photography",
    metaDescription: "Prompts for product photos: background and light without changing the SKU—pitfalls and post-gen review; no moderation guarantee.",
    intro: "Prompts steer the scene around the product, not your warehouse. Aggressive “enhancement” language drifts the SKU. Below: prompt structure and safer wording. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Describe background, light, mood; forbid changing shape, color, or kit. After generation, use the same QA checklist as without prompts. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Prompt structure",
        body: [
          "Template: “neutral studio background, soft light, do not alter product, keep labels.” Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "What to avoid",
        body: [
          "Avoid “make it look premium,” “add accessories,” “change color.” Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Background vs product",
        body: [
          "Creative prompts for extra slides after main QA only. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Single-SKU test",
        body: [
          "One SKU, three wordings, compare to source. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Studio workflow",
        body: [
          "Log winning presets per category. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Preset log",
        body: [
          "Prompts do not remove moderation disclaimers. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Replace background", href: "/en/blog/how-to-replace-a-product-background" },
      { label: "Preserve product", href: "/en/blog/how-to-make-ai-preserve-the-product" },
      { label: "Creative scene", href: "/en/use-cases/creative-product-scene" },
      { label: "AI quality", href: "/en/quality" },
      { label: "How it works", href: "/en/how-it-works" },
    ],
  },
  "blog_096": {
    title: "How to Describe a Model for Clothing Photos",
    metaDescription: "Prompts for AI clothing models: adult presentation, neutral pose, no cut drift—fit review after generation.",
    intro: "Model descriptions steer pose, background, and category tone. Marketplaces need restrained commercial framing. Prompts never replace garment length and color checks. Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
    shortAnswer: "Specify adult model, neutral pose, catalog style; compare to hanger after AI. For lingerie, use the dedicated guide and stricter QA. Product video and Reels-from-photo workflows are in development—do not publish video until your Studio version clearly supports it.",
    sections: [
      {
        title: "Core model parameters",
        body: [
          "Adult model; state height and worn size in listing copy, not prompt alone. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Marketplace pose",
        body: [
          "Front or 3/4 poses for Wildberries/Kaspi—avoid extreme angles. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Prompt pitfalls",
        body: [
          "Do not request sexualized framing for regular apparel. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Source pairing",
        body: [
          "Flat source + AI model: match print and length. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Lingerie and sensitive",
        body: [
          "Lingerie: see dedicated article; reject cut drift. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
      {
        title: "Preset documentation",
        body: [
          "Category presets: dresses, tops, bottoms—different checklists. Trust beats a one-time discount: buyers compare thumbnails to reviews and competing listings. Fix the source and Studio mode first—exact card or white background is safer than lifestyle for main images. Plan a content pack: main, texture detail, optional social frame—one SKU, color, and kit everywhere with no shipment surprises.",
          "Train the marketplace owner on basic QA—the designer should not be the only person who sees drift before upload. On Kaspi, Wildberries, and Ozon, preview on a phone—that is how buyers decide in the app. Compare AI output to the source on a monitor: shape, color, pattern, hardware, labels, and kit must match what ships. Reject variants where details drift—regeneration is cheaper than a return or angry review.",
          "Inspect cutout edges, shadows, and reflections—halos and clipped parts hide on phone previews. Read current marketplace seller help: Vitrina AI does not guarantee moderation and is not an official platform partner.",
          "Vitrina AI Studio is an independent tool, not an official marketplace partner, and does not guarantee moderation approval or perfect accuracy.",
        ],
      },
    ],
    checklist: ["sharp source", "product unchanged by AI", "background not misleading", "platform rules checked", "copy matches visuals"],
    faq: [
      { question: "Can I publish AI photos without manual review?", answer: "No. AI can change shape, color, patterns, logos, or small details. Compare every result to the source on a large screen and reject inaccurate variants." },
      { question: "Does Vitrina AI guarantee marketplace approval?", answer: "No. The service helps prepare images, but platform rules change and the seller remains responsible for final review." },
      { question: "Is Vitrina AI an official partner of Kaspi, Wildberries, or Ozon?", answer: "No. It is an independent tool. Check current marketplace image requirements before upload." },
      { question: "Do I need a professional photographer?", answer: "For catalog updates and test listings, a sharp phone photo is often enough. Premium hero campaigns may still need a photographer." },
      { question: "Can I publish without checking on a large screen?", answer: "No. Phones hide halos, hue drift, and small defects—compare to the source on a monitor or tablet before marketplace upload." },
    ],
    internalLinks: [
      { label: "Open studio", href: "/studio" },
      { label: "Pricing", href: "/en/cost" },
      { label: "Clothing on model", href: "/en/blog/how-to-create-clothing-photos-on-a-model" },
      { label: "Place on AI model", href: "/en/blog/how-to-place-clothing-on-an-ai-model" },
      { label: "Lingerie", href: "/en/blog/lingerie-photos-on-an-ai-model" },
      { label: "Clothing use case", href: "/en/use-cases/clothing-on-ai-model" },
      { label: "AI quality", href: "/en/quality" },
    ],
  },
};
