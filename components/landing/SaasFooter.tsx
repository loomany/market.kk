import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { getLandingCopy } from "@/lib/i18n/translations";

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
            <p className="text-xs text-slate-500">
              © {year} Vitrina AI Studio.{" "}
              {isRu ? "Все права защищены." : "All rights reserved."}
            </p>
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
      </div>
    </footer>
  );
}
