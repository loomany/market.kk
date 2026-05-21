import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { AudienceLocalized } from "@/data/seo/audiencePages";
import type { Locale } from "@/lib/i18n/localeConfig";
import { getAudienceHubSegment } from "@/lib/seo/audiencePaths";

type AudienceSeoPageProps = {
  locale: Locale;
  content: AudienceLocalized;
  hubLabel: string;
};

export function AudienceSeoPage({ locale, content, hubLabel }: AudienceSeoPageProps) {
  const isRu = locale === "ru";
  const hub = getAudienceHubSegment(locale);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm font-semibold text-teal-700">
        <Link href={`/${locale}`} className="hover:text-teal-900">
          {isRu ? "Главная" : locale === "kk" ? "Басты" : "Home"}
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <Link href={`/${locale}#audiences`} className="hover:text-teal-900">
          {hubLabel}
        </Link>
      </nav>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">{content.h1}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{content.intro}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/studio"
          prefetch={false}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-teal-900/15 transition-colors hover:bg-teal-800"
        >
          {isRu ? "Открыть студию" : locale === "kk" ? "Студияны ашу" : "Open studio"}
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
        <Link
          href={`/${locale}/cost`}
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-white px-6 text-base font-semibold text-slate-900 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50"
        >
          {isRu ? "Стоимость" : locale === "kk" ? "Тарифтер" : "Pricing"}
        </Link>
      </div>

      <section className="mt-10 rounded-lg border border-border bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-950">
          {isRu ? "Для кого эта страница" : locale === "kk" ? "Бұл бет кімге" : "Who this page is for"}
        </h2>
        <ul className="mt-4 space-y-2">
          {content.forWho.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          {isRu ? "Какие задачи решает" : locale === "kk" ? "Қандай міндеттерді шешеді" : "Tasks it solves"}
        </h2>
        <ul className="mt-4 space-y-2">
          {content.tasks.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          {isRu ? "Как помогает Vitrina AI Studio" : locale === "kk" ? "Vitrina AI Studio қалай көмектеседі" : "How Vitrina AI Studio helps"}
        </h2>
        <ul className="mt-4 space-y-2">
          {content.howHelps.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 grid gap-5">
        {content.sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          {isRu ? "Практические сценарии" : locale === "kk" ? "Практикалық сценарийлер" : "Practical scenarios"}
        </h2>
        <div className="mt-5 grid gap-4">
          {content.scenarios.map((scenario) => (
            <div key={scenario.title} className="rounded-lg border border-border bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-950">{scenario.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{scenario.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50/80 p-6">
        <h2 className="text-xl font-bold text-slate-950">
          {isRu ? "Ограничения и честные ожидания" : locale === "kk" ? "Шектеулер мен күтілетін нәтиже" : "Limitations and honest expectations"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">{content.limitations}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">FAQ</h2>
        <div className="mt-5 grid gap-4">
          {content.faq.map((item) => (
            <details key={item.question} className="rounded-lg border border-border bg-white p-4">
              <summary className="cursor-pointer font-semibold text-slate-950">{item.question}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          {isRu ? "Полезные материалы" : locale === "kk" ? "Пайдалы сілтемелер" : "Related resources"}
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {content.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={link.href === "/studio" ? false : undefined}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-200 hover:text-teal-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
