import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ImageIcon,
  Play,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  Video,
  Wand2,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/localeConfig";
import { studioEntryPath } from "@/lib/i18n/siteLocalePreference";
import { getLandingCopy } from "@/lib/i18n/translations";
import { getPlatformById, platformPages } from "@/data/seo/platforms";
import { useCasePages } from "@/data/seo/useCases";
import { getPublishedBlogArticles } from "@/lib/blog/blogResolve";
import { getAudienceChips } from "@/data/seo/audiencePages";
import { getLocalizedPath } from "@/lib/i18n/routeSlugs";

const landingPlatformChipIds = [
  "kaspi",
  "wildberries",
  "ozon",
  "instagram-shop",
  "tiktok-shop",
  "facebook-marketplace",
  "ebay",
  "amazon",
  "etsy",
  "shopify",
  "olx",
] as const;

const platformChipLabels: Partial<Record<(typeof landingPlatformChipIds)[number], string>> = {
  "instagram-shop": "Instagram",
  "tiktok-shop": "TikTok",
  "facebook-marketplace": "Facebook",
};

const platformChipClassName =
  "rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800";

const featureIcons = [Shirt, BadgeCheck, Sparkles, ImageIcon, Video, Play, Wand2, Store, ShieldCheck];

export function SaasLanding({ locale }: { locale: Locale }) {
  const copy = getLandingCopy(locale);
  const publishedArticles = getPublishedBlogArticles(locale);
  const featuredUseCases = useCasePages.slice(0, 6);
  const featuredPlatforms = platformPages.slice(0, 8);

  return (
    <main>
        <section className="px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-16">
          <div className="mx-auto max-w-7xl min-w-0">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-center lg:gap-12">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
                <Sparkles className="h-4 w-4" />
                {copy.hero.badge}
              </div>
              <h1 className="max-w-[calc(100vw-2rem)] break-words text-3xl font-bold tracking-tight text-slate-950 [overflow-wrap:anywhere] sm:max-w-4xl sm:text-5xl lg:text-6xl">
                {copy.hero.headline}
              </h1>
              <p className="mt-6 max-w-[calc(100vw-2rem)] break-words text-base leading-7 text-slate-600 [overflow-wrap:anywhere] sm:max-w-3xl sm:text-xl sm:leading-8">
                {copy.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={studioEntryPath(locale)}
                  prefetch={false}
                  data-telegram-event="cta_click"
                  data-telegram-label="hero_start"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-teal-900/15 transition-colors hover:bg-teal-800"
                >
                  {copy.hero.primaryCta}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-white px-6 text-base font-semibold text-slate-900 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50"
                >
                  {copy.hero.secondaryCta}
                </a>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              {copy.cards.map((card) => (
                <div key={card.title} className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-2 break-words text-sm leading-6 text-slate-600">{card.text}</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-border/70 bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">{copy.how.title}</h2>
              <p className="mt-3 text-lg leading-7 text-slate-600">{copy.how.intro}</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {copy.how.steps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-border bg-slate-50 p-5">
                  <span className="text-sm font-bold text-teal-700">0{index + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">{copy.features.title}</h2>
                <Link
                  href={getLocalizedPath(locale, "features")}
                  className="shrink-0 text-sm font-semibold text-teal-700 hover:text-teal-900"
                >
                  {copy.nav.features} →
                </Link>
              </div>
              <p className="mt-3 max-w-3xl text-lg leading-7 text-slate-600">{copy.features.intro}</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {copy.features.items.map((feature, index) => {
                const Icon = featureIcons[index] ?? CheckCircle2;
                return (
                  <div key={feature.title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="audiences" className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{copy.audiences.title}</h2>
              <p className="mt-3 text-lg leading-7 text-slate-300">{copy.audiences.intro}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {getAudienceChips(locale).map((chip) => (
                <Link
                  key={chip.id}
                  href={chip.href}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-teal-300/60 hover:bg-teal-500/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="platforms" className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">{copy.platforms.title}</h2>
                <Link
                  href={`/${locale}/platforms`}
                  className="shrink-0 text-sm font-semibold text-teal-700 hover:text-teal-900"
                >
                  {copy.nav.platforms} →
                </Link>
              </div>
              <p className="mt-3 max-w-3xl text-lg leading-7 text-slate-600">{copy.platforms.intro}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {landingPlatformChipIds.map((id) => {
                const page = getPlatformById(id);
                if (!page) return null;
                const label = platformChipLabels[id] ?? page.name;
                return (
                  <Link
                    key={id}
                    href={`/${locale}/platforms/${page.content[locale].slug}`}
                    className={platformChipClassName}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link href={`/${locale}/platforms`} className={platformChipClassName}>
                {locale === "ru"
                  ? "локальные каталоги"
                  : locale === "kk"
                    ? "жергілікті каталогтар"
                    : "local catalogs"}
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <SeoLinkGroup
              title={copy.nav.audiences}
              links={featuredUseCases.map((page) => ({
                label: page.content[locale].h1,
                href: `/${locale}/use-cases/${page.content[locale].slug}`,
              }))}
            />
            <SeoLinkGroup
              title={copy.nav.platforms}
              links={featuredPlatforms.map((page) => ({
                label: page.name,
                href: `/${locale}/platforms/${page.content[locale].slug}`,
              }))}
            />
            <SeoLinkGroup
              title={copy.nav.blog}
              links={publishedArticles.slice(0, 6).map(({ topic }) => ({
                label: topic.title[locale] ?? topic.title.en ?? topic.id,
                href: `/${locale}/blog/${topic.slug[locale] ?? topic.slug.en}`,
              }))}
            />
          </div>
        </section>
    </main>
  );
}

function SeoLinkGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={link.href === "/studio" ? false : undefined}
            className="text-sm leading-6 text-slate-600 hover:text-teal-800"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
