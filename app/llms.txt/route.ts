import { NextResponse } from "next/server";
import { platformPages } from "@/data/seo/platforms";
import { useCasePages } from "@/data/seo/useCases";
import { siteName, absoluteUrl } from "@/lib/seo/site";

export function GET() {
  const text = [
    `# ${siteName}`,
    "",
    "Vitrina AI Studio is an AI product photo and video studio for marketplace sellers, online stores, Instagram shops, and catalogs.",
    "",
    "Core pages:",
    `- Landing: ${absoluteUrl("/ru")}`,
    `- Studio: ${absoluteUrl("/studio")}`,
    `- Features: ${absoluteUrl("/ru/features")}`,
    `- Platforms: ${absoluteUrl("/ru/platforms")}`,
    `- Use cases: ${absoluteUrl("/ru/use-cases")}`,
    `- Blog: ${absoluteUrl("/ru/blog")}`,
    `- AI summary: ${absoluteUrl("/ru/ai-summary")}`,
    "",
    "Important limitations:",
    "- AI can make mistakes and change product details.",
    "- Users must manually review outputs before publishing.",
    "- Vitrina AI Studio is independent and not an official partner of listed marketplaces.",
    "- The service does not promise marketplace acceptance or guaranteed sales growth.",
    "",
    `Supported platform topics: ${platformPages.map((item) => item.name).join(", ")}.`,
    `Use case topics: ${useCasePages.map((item) => item.id).join(", ")}.`,
  ].join("\n");

  return new NextResponse(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
