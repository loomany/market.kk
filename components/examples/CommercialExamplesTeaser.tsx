import Link from "next/link";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { ExampleCategoryId } from "@/data/seo/exampleCases";
import { getCategoryMeta } from "@/data/seo/exampleCases";
import { examplesLpTeaser } from "@/lib/seo/examplesCopy";

type CommercialExamplesTeaserProps = {
  locale: Locale;
  categoryId: ExampleCategoryId;
};

/**
 * Text-only teaser for indexable commercial LPs — no links to noindex /examples, no fake images.
 */
export function CommercialExamplesTeaser({
  locale,
  categoryId,
}: CommercialExamplesTeaserProps) {
  const copy = examplesLpTeaser(locale);
  const meta = getCategoryMeta(categoryId);
  const checklist =
    meta?.plannedChecklist[locale] ?? meta?.plannedChecklist.en ?? [];

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-xl font-bold tracking-tight text-slate-950">{copy.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{copy.body}</p>
      {checklist.length > 0 ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-slate-800">{copy.checklistTitle}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
        <Link href={`/${locale}/how-it-works`} className="text-teal-700">
          {locale === "ru" ? "Как работает" : locale === "kk" ? "Қалай жұмыс істейді" : "How it works"}
        </Link>
        <Link href={`/${locale}/quality`} className="text-teal-700">
          {locale === "ru" ? "Качество AI" : locale === "kk" ? "AI сапасы" : "AI quality"}
        </Link>
      </div>
    </section>
  );
}
