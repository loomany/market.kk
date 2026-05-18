import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/localeConfig";
import { supportedLocales } from "@/lib/i18n/localeConfig";
import type { getLandingCopy } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

type LandingCopy = ReturnType<typeof getLandingCopy>;

type FooterLink = { label: string; href: string };

type SaasFooterProps = {
  locale: Locale;
  copy: LandingCopy;
  productLinks: FooterLink[];
  useCaseLinks: FooterLink[];
  platformLinks: FooterLink[];
  resourceLinks: FooterLink[];
};

function FooterColumn({
  title,
  links,
  viewAll,
}: {
  title: string;
  links: FooterLink[];
  viewAll?: FooterLink;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={link.href === "/studio" ? false : undefined}
              className="text-sm leading-snug text-slate-600 transition-colors hover:text-teal-800"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      {viewAll ? (
        <Link
          href={viewAll.href}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 transition-colors hover:text-teal-900"
        >
          {viewAll.label}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

function FooterLanguageGrid({
  locale,
  title,
  subtitle,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Globe2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{subtitle}</p>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-400 sm:pb-0.5">
          {supportedLocales.length}{" "}
          {locale === "ru" ? "локалей" : "locales"}
        </p>
      </div>

      <div
        className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        role="navigation"
        aria-label={title}
      >
        {supportedLocales.map((item) => {
          const active = item.code === locale;
          return (
            <Link
              key={item.code}
              href={`/${item.code}`}
              className={cn(
                "group flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 transition-all",
                active
                  ? "border-teal-300 bg-teal-50 shadow-sm ring-1 ring-teal-500/10"
                  : "border-border/70 bg-slate-50/60 hover:border-teal-200 hover:bg-white hover:shadow-sm"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "shrink-0 text-xs font-bold uppercase tracking-wide",
                  active ? "text-teal-800" : "text-slate-500 group-hover:text-teal-700"
                )}
              >
                {item.code.toUpperCase()}
              </span>
              <span
                className={cn(
                  "truncate text-sm",
                  active ? "font-medium text-slate-900" : "text-slate-600"
                )}
              >
                {item.nativeLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SaasFooter({
  locale,
  copy,
  productLinks,
  useCaseLinks,
  platformLinks,
  resourceLinks,
}: SaasFooterProps) {
  const isRu = locale === "ru";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-gradient-to-b from-white via-white to-slate-50/90">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-14">
          <div className="space-y-5">
            <Link href={`/${locale}`} className="inline-block">
              <span className="text-xl font-bold tracking-tight text-slate-950">
                Vitrina <span className="text-teal-700">AI</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-slate-600">
              {isRu
                ? "AI-студия товарных фото и видео для маркетплейсов. Независимый инструмент для подготовки и проверки визуала."
                : "AI product photo and video studio for marketplaces. An independent tool to prepare and review visuals."}
            </p>
            <Link
              href="/studio"
              prefetch={false}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition-colors hover:bg-teal-800"
            >
              {copy.nav.openStudio}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn title={isRu ? "Продукт" : "Product"} links={productLinks} />
            <FooterColumn
              title={isRu ? "Для кого" : "Use cases"}
              links={useCaseLinks}
              viewAll={{
                label: isRu ? "Все сценарии" : "All use cases",
                href: `/${locale}/use-cases`,
              }}
            />
            <FooterColumn
              title={isRu ? "Площадки" : "Platforms"}
              links={platformLinks}
              viewAll={{
                label: isRu ? "Все площадки" : "All platforms",
                href: `/${locale}/platforms`,
              }}
            />
            <FooterColumn
              title={isRu ? "Материалы" : "Resources"}
              links={resourceLinks}
            />
          </div>
        </div>

        <div className="mt-10 lg:mt-12">
          <FooterLanguageGrid
            locale={locale}
            title={isRu ? "Язык интерфейса" : "Interface language"}
            subtitle={
              isRu
                ? "Выберите локаль — откроется главная на нужном языке."
                : "Pick a locale to open the homepage in that language."
            }
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {year} Vitrina AI Studio.{" "}
            {isRu ? "Все права защищены." : "All rights reserved."}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href={`/${locale}/privacy`}
              className="text-xs font-medium text-slate-500 transition-colors hover:text-teal-800"
            >
              {isRu ? "Приватность" : "Privacy"}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="text-xs font-medium text-slate-500 transition-colors hover:text-teal-800"
            >
              {isRu ? "Условия" : "Terms"}
            </Link>
            <Link
              href="/llms.txt"
              className="text-xs font-medium text-slate-500 transition-colors hover:text-teal-800"
            >
              llms.txt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
