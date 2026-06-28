import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TokensPageClient } from "@/components/tokens/TokensPageClient";
import { assertLocale, type IndexableLocale } from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const titles: Record<IndexableLocale, string> = {
  ru: "Токены — Vitrina AI Studio",
  en: "Tokens — Vitrina AI Studio",
  kk: "Токендер — Vitrina AI Studio",
};

const descriptions: Record<IndexableLocale, string> = {
  ru: "Пополнение баланса токенов Vitrina AI: 10 токенов за $10, 1 токен = $1, одна AI-задача = 1 токен.",
  en: "Top up Vitrina AI tokens: 10 tokens for $10, 1 token = $1, one AI task = 1 token.",
  kk: "Vitrina AI токен балансын толтыру: 10 токен $10, 1 токен = $1.",
};

const pageCopy: Record<
  IndexableLocale,
  { h1: string; intro: string; guideTitle: string; facts: readonly string[] }
> = {
  ru: {
    h1: "Пополнить баланс токенов",
    intro:
      "1 токен = $1. Точная стоимость задачи зависит от режима и показывается в студии до запуска.",
    guideTitle: "Как работают токены",
    facts: [
      "Минимальное пополнение — 10 токенов за $10. Для покупки нужно войти в аккаунт.",
      "Студия показывает стоимость выбранной задачи до запуска. Баланс списывается только после успешного выполнения.",
      "После оплаты баланс обновляет подтверждение Lemon Squeezy; переход на страницу успеха сам по себе токены не начисляет.",
    ],
  },
  en: {
    h1: "Top up token balance",
    intro:
      "1 token = $1. The exact task cost depends on the mode and is shown in the studio before you start.",
    guideTitle: "How tokens work",
    facts: [
      "The minimum top-up is 10 tokens for $10. You need to sign in before purchasing.",
      "The studio shows the selected task cost before launch. Tokens are charged only after a successful task.",
      "After payment, Lemon Squeezy confirmation updates the balance; visiting the success page does not grant tokens by itself.",
    ],
  },
  kk: {
    h1: "Токен балансын толтыру",
    intro:
      "1 токен = $1. Тапсырманың нақты құны режимге байланысты және іске қосар алдында студияда көрсетіледі.",
    guideTitle: "Токендер қалай жұмыс істейді",
    facts: [
      "Ең төменгі толықтыру — $10-ға 10 токен. Сатып алу үшін аккаунтқа кіру керек.",
      "Студия таңдалған тапсырманың құнын іске қосар алдында көрсетеді. Баланс тапсырма сәтті аяқталғаннан кейін ғана есептен шығарылады.",
      "Төлемнен кейін балансты Lemon Squeezy растауы жаңартады; success бетіне өту токендерді өздігінен қоспайды.",
    ],
  },
};

function asIndexableLocale(raw: string): IndexableLocale | null {
  const locale = assertLocale(raw);
  if (locale === "ru" || locale === "en" || locale === "kk") return locale;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = asIndexableLocale(raw);
  if (!locale) return {};

  const pathByLocale = {
    ru: "/ru/tokens",
    en: "/en/tokens",
    kk: "/kk/tokens",
  };

  return createSeoMetadata({
    locale,
    title: titles[locale],
    description: descriptions[locale],
    h1: pageCopy[locale].h1,
    status: "published",
    pathByLocale,
    sectionCount: 3,
    internalLinkCount: 2,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function TokensPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = asIndexableLocale(raw);
  if (!locale) notFound();
  const copy = pageCopy[locale];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto w-full max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {copy.h1}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{copy.intro}</p>
      </header>
      <Suspense fallback={<p className="text-sm text-slate-600">…</p>}>
        <TokensPageClient locale={locale} />
      </Suspense>
      <section
        aria-labelledby="tokens-guide-title"
        className="mx-auto mt-10 w-full max-w-lg rounded-[24px] border border-border bg-slate-50/70 p-6"
      >
        <h2
          id="tokens-guide-title"
          className="text-xl font-bold tracking-tight text-slate-950"
        >
          {copy.guideTitle}
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {copy.facts.map((fact) => (
            <li key={fact} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
