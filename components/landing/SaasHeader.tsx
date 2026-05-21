import Link from "next/link";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { getLandingCopy } from "@/lib/i18n/translations";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { TokenBalancePill } from "@/components/auth/TokenBalancePill";
import { WhatsAppLoginModal } from "@/components/auth/WhatsAppLoginModal";

type LandingCopy = ReturnType<typeof getLandingCopy>;

export function SaasHeader({ locale, copy }: { locale: Locale; copy: LandingCopy }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:gap-8 sm:px-6">
        <Link href={`/${locale}`} className="shrink-0 text-lg font-bold tracking-tight text-slate-950">
          Vitrina <span className="text-teal-700">AI</span>
        </Link>
        <nav className="hidden min-w-0 items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          <Link href={`/${locale}#features`} className="hover:text-slate-950">
            {copy.nav.features}
          </Link>
          <Link href={`/${locale}#audiences`} className="hover:text-slate-950">
            {copy.nav.audiences}
          </Link>
          <Link href={`/${locale}#platforms`} className="hover:text-slate-950">
            {copy.nav.platforms}
          </Link>
          <Link href={`/${locale}/blog`} className="hover:text-slate-950">
            {copy.nav.blog}
          </Link>
          <Link
            href="/studio"
            prefetch={false}
            data-telegram-event="cta_click"
            data-telegram-label="nav_studio"
            className="hover:text-slate-950"
          >
            {copy.nav.studio}
          </Link>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <TokenBalancePill />
          <WhatsAppLoginModal />
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
