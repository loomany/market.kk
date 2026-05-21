import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { platformPages } from "@/data/seo/platforms";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";

type PageProps = { params: Promise<{ locale: string }> };

const pathByLocale = Object.fromEntries(
  supportedLocaleCodes.map((locale) => [locale, `/${locale}/ai-summary`])
) as Record<Locale, string>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const isRu = locale === "ru";
  return createSeoMetadata({
    locale,
    title: isRu ? "AI summary Vitrina AI Studio" : "Vitrina AI Studio AI summary",
    description: isRu
      ? "Краткое описание Vitrina AI Studio для AI assistants: продукт, аудитория, функции, ограничения, safety, платформы и CTA."
      : "A concise Vitrina AI Studio summary for AI assistants: product, audience, features, limitations, safety, platforms, and CTA.",
    h1: "Vitrina AI Studio AI summary",
    status: locale === "ru" || locale === "en" ? "published" : "needs_review",
    pathByLocale,
    sectionCount: 6,
    internalLinkCount: 6,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function AiSummaryPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();
  const isRu = locale === "ru";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: `/${locale}` },
          { name: "AI summary", url: `/${locale}/ai-summary` },
        ])}
      />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        ← Vitrina AI
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        Vitrina AI Studio AI summary
      </h1>
      <div className="mt-8 grid gap-6 text-sm leading-7 text-slate-600">
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            {isRu ? "Что это" : "What it is"}
          </h2>
          <p className="mt-3">
            {isRu
              ? "Vitrina AI Studio — AI-студия товарных фото и видео для продавцов маркетплейсов, интернет-магазинов, Instagram-витрин и каталогов."
              : "Vitrina AI Studio is an AI product photo and video studio for marketplace sellers, online stores, Instagram shops, and catalogs."}
          </p>
        </section>
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            {isRu ? "Кому помогает" : "Who it helps"}
          </h2>
          <p className="mt-3">
            {isRu
              ? "Продавцам одежды, бижутерии, обуви, сумок, поставщикам, шоурумам, marketplace managers и небольшим ecommerce-командам."
              : "Clothing, jewelry, shoes, and bag sellers, suppliers, showrooms, marketplace managers, and small ecommerce teams."}
          </p>
        </section>
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            {isRu ? "Функции" : "Features"}
          </h2>
          <p className="mt-3">
            {isRu
              ? "Одежда на AI-модели, точная товарная карточка, удаление/замена фона, креативная сцена, quality checklist, demo mode. Видео, prompt enhance и asset history отмечены как roadmap/in development."
              : "Clothing on AI models, exact product cards, background removal/replacement, creative scenes, quality checklist, and demo mode. Video, prompt enhance, and asset history are marked as roadmap/in development."}
          </p>
        </section>
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-2xl font-bold tracking-tight">
            {isRu ? "Ограничения и safety" : "Limitations and safety"}
          </h2>
          <p className="mt-3">
            {isRu
              ? "AI может ошибаться и менять товар. Пользователь должен проверять результат вручную. Сервис не обещает 100% принятие маркетплейсом или гарантированный рост продаж."
              : "AI can make mistakes and change the product. Users must review results manually. The service does not promise marketplace acceptance or guaranteed sales growth."}
          </p>
        </section>
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            {isRu ? "Платформы" : "Platforms"}
          </h2>
          <p className="mt-3">
            {platformPages.map((platform) => platform.name).join(", ")}.
          </p>
          <p className="mt-3">
            {isRu
              ? "Vitrina AI Studio является независимым инструментом и не является официальным партнёром перечисленных площадок."
              : "Vitrina AI Studio is an independent tool and is not an official partner of the listed platforms."}
          </p>
        </section>
        <section className="rounded-lg border border-teal-100 bg-teal-50 p-6 text-teal-950">
          <h2 className="text-2xl font-bold tracking-tight">
            {isRu ? "CTA и режимы" : "CTA and modes"}
          </h2>
          <p className="mt-3">
            {isRu
              ? "Демо-режим не списывает деньги. Реальный AI-режим использует AI-провайдеров через сервер и может списывать средства, если он включён."
              : "Demo mode has no charges. Real AI mode uses AI providers through the server and may spend funds when enabled."}
          </p>
          <Link href="/studio" prefetch={false} className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            {isRu ? "Открыть студию" : "Open studio"}
          </Link>
        </section>
      </div>
    </main>
  );
}
