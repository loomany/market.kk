import { NextResponse } from "next/server";
import { blogTopics } from "@/data/seo/blogTopics";
import { platformPages } from "@/data/seo/platforms";
import { useCasePages } from "@/data/seo/useCases";
import { absoluteUrl, siteName } from "@/lib/seo/site";

export function GET() {
  const text = [
    `# ${siteName} full AI-readable summary`,
    "",
    "Positioning: AI product photo and video studio for marketplaces.",
    "",
    "Who it helps: marketplace sellers, clothing sellers, jewelry sellers, suppliers, showrooms, Instagram shops, online stores, marketplace managers, photographers, content managers, and small ecommerce teams.",
    "",
    "Available/current workflows: clothing on adult AI model, exact product card, product shot, background removal/replacement, creative scene demo, manual quality checklist.",
    "",
    "Roadmap/in development workflows: video from product photo, Reels/Stories, prompt enhance, asset history. These should not be described as fully production-ready until implemented.",
    "",
    "Safety and quality: AI can distort product color, shape, logos, patterns, and small details. Users must review outputs manually and reject inaccurate variants. Do not claim guaranteed marketplace acceptance or guaranteed sales growth.",
    "",
    "Canonical entry points:",
    `- ${absoluteUrl("/ru")}`,
    `- ${absoluteUrl("/en")}`,
    `- ${absoluteUrl("/studio")}`,
    "",
    "Platform pages:",
    ...platformPages.map((page) => `- ${page.name}: ${absoluteUrl(`/ru/platforms/${page.content.ru.slug}`)}`),
    "",
    "Use-case pages:",
    ...useCasePages.map((page) => `- ${page.content.ru.h1}: ${absoluteUrl(`/ru/use-cases/${page.content.ru.slug}`)}`),
    "",
    "Keyword-first blog plan:",
    ...blogTopics.map((topic) => `- ${topic.id}: ${topic.title.ru} / ${topic.title.en} [${topic.priority}, ${topic.status.ru}]`),
  ].join("\n");

  return new NextResponse(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
