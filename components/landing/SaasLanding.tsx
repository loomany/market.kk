import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
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
import { getLandingCopy } from "@/lib/i18n/translations";
import {
  MOCK_MODEL_IMAGE,
  MOCK_PRODUCT_IMAGE,
  MOCK_PRODUCT_SHOT_IMAGES,
} from "@/lib/ai/mockResults";
import { platformPages } from "@/data/seo/platforms";
import { useCasePages } from "@/data/seo/useCases";
import { getPublishedBlogArticles } from "@/lib/blog/blogResolve";
import { getLocalizedPath } from "@/lib/i18n/routeSlugs";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { SaasFooter } from "@/components/landing/SaasFooter";

const platformNames = [
  "Kaspi",
  "Wildberries",
  "Ozon",
  "eBay",
  "Amazon",
  "Etsy",
  "Shopify",
  "Instagram Shop",
  "TikTok Shop",
  "Facebook Marketplace",
  "OLX",
  "AliExpress",
  "Temu",
  "локальные каталоги",
];

const featureIcons = [Shirt, BadgeCheck, Sparkles, ImageIcon, Video, Play, Wand2, Store, ShieldCheck];

export function SaasLanding({ locale }: { locale: Locale }) {
  const copy = getLandingCopy(locale);
  const publishedArticles = getPublishedBlogArticles(locale);
  const featuredUseCases = useCasePages.slice(0, 6);
  const featuredPlatforms = platformPages.slice(0, 8);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} className="shrink-0 text-lg font-bold tracking-tight text-slate-950">
            Vitrina <span className="text-teal-700">AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="#features" className="hover:text-slate-950">
              {copy.nav.features}
            </a>
            <a href="#audiences" className="hover:text-slate-950">
              {copy.nav.audiences}
            </a>
            <a href="#platforms" className="hover:text-slate-950">
              {copy.nav.platforms}
            </a>
            <Link href={`/${locale}/blog`} className="hover:text-slate-950">
              {copy.nav.blog}
            </Link>
            <Link href="/studio" prefetch={false} className="hover:text-slate-950">
              {copy.nav.studio}
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <Link
              href="/studio"
              prefetch={false}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition-colors hover:bg-teal-800 sm:px-4"
            >
              <span className="hidden sm:inline">{copy.nav.openStudio}</span>
              <span className="sm:hidden">{copy.nav.studio}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-16">
          <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-none">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
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
                  href="/studio"
                  prefetch={false}
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
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {copy.cards.map((card) => (
                  <div key={card.title} className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-950">{card.title}</p>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { title: copy.cards[0].title, src: MOCK_PRODUCT_IMAGE, label: "Input" },
                { title: copy.cards[0].title, src: MOCK_MODEL_IMAGE, label: "Model" },
                { title: copy.cards[1].title, src: MOCK_PRODUCT_SHOT_IMAGES[0].url, label: "Output" },
              ].map((item) => (
                <figure key={item.label} className="rounded-lg border border-border bg-white p-2 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="aspect-[4/5] w-full rounded-md object-cover"
                  />
                  <figcaption className="px-1 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </figcaption>
                </figure>
              ))}
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
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">{copy.features.title}</h2>
                <p className="mt-3 text-lg leading-7 text-slate-600">{copy.features.intro}</p>
              </div>
              <Link href={getLocalizedPath(locale, "features")} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                {copy.nav.features} →
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {copy.features.items.map((feature, index) => {
                const Icon = featureIcons[index] ?? CheckCircle2;
                return (
                  <div key={feature.title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {feature.status}
                      </span>
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
              {copy.audiences.items.map((audience) => (
                <span key={audience} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100">
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="platforms" className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">{copy.platforms.title}</h2>
                <p className="mt-3 text-lg leading-7 text-slate-600">{copy.platforms.intro}</p>
              </div>
              <Link href={`/${locale}/platforms`} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                {copy.nav.platforms} →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {platformNames.map((name) => (
                <span key={name} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  {name}
                </span>
              ))}
            </div>
            <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-500">{copy.platforms.disclaimer}</p>
          </div>
        </section>

        <section className="border-y border-border/70 bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
              <ShieldCheck className="h-7 w-7 text-amber-700" />
              <h2 className="mt-4 text-2xl font-bold tracking-tight">{copy.trust.title}</h2>
              <ul className="mt-5 space-y-3">
                {copy.trust.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-teal-100 bg-teal-50 p-6 text-teal-950">
              <CircleDollarSign className="h-7 w-7 text-teal-700" />
              <h2 className="mt-4 text-2xl font-bold tracking-tight">{copy.modes.title}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <p className="rounded-lg bg-white p-4 text-sm leading-6 shadow-sm">{copy.modes.demo}</p>
                <p className="rounded-lg bg-white p-4 text-sm leading-6 shadow-sm">{copy.modes.real}</p>
              </div>
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

        <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight">{copy.finalCta.title}</h2>
              <p className="mt-3 text-lg leading-7 text-slate-300">{copy.finalCta.text}</p>
            </div>
            <Link
              href="/studio"
              prefetch={false}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-slate-950 transition-colors hover:bg-teal-50"
            >
              {copy.finalCta.button}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <SaasFooter
        locale={locale}
        copy={copy}
        productLinks={[
          { label: copy.nav.openStudio, href: "/studio" },
          { label: copy.nav.features, href: `/${locale}/features` },
          {
            label: locale === "ru" ? "Кратко для AI" : "AI summary",
            href: `/${locale}/ai-summary`,
          },
        ]}
        useCaseLinks={featuredUseCases.slice(0, 4).map((page) => ({
          label: page.content[locale].h1,
          href: `/${locale}/use-cases/${page.content[locale].slug}`,
        }))}
        platformLinks={featuredPlatforms.slice(0, 4).map((page) => ({
          label: page.name,
          href: `/${locale}/platforms/${page.content[locale].slug}`,
        }))}
        resourceLinks={[
          { label: copy.nav.blog, href: `/${locale}/blog` },
          { label: "llms.txt", href: "/llms.txt" },
        ]}
      />
    </>
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
