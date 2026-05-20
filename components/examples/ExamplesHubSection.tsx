import Link from "next/link";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { ExamplePageContent } from "@/data/seo/examplesPages";
import { exampleCategoryMeta } from "@/data/seo/exampleCases";
import { examplesHubLabels } from "@/lib/seo/examplesCopy";
import { AssetMissingNotice } from "./AssetMissingNotice";
import { ExampleCategoryGrid } from "./ExampleCategoryGrid";

type ExamplesHubSectionProps = {
  locale: Locale;
  page: ExamplePageContent;
  childPages: ExamplePageContent[];
};

export function ExamplesHubSection({ locale, page, childPages }: ExamplesHubSectionProps) {
  const labels = examplesHubLabels(locale);
  const globalChecklist =
    locale === "ru"
      ? [
          "Собственные исходники или лицензия на коммерческое использование",
          "Экспорт из Studio с QA (цвет, форма, комплект)",
          "Подпись «иллюстрация workflow», не «результат клиента»",
        ]
      : locale === "kk"
        ? [
            "Өз немесе лицензиялық исходник",
            "Studio экспорт + QA",
            "Workflow иллюстрациясы",
          ]
        : [
            "Owned source or commercial license",
            "Studio export with manual QA",
            "Label as workflow illustration, not a client guarantee",
          ];

  return (
    <>
      <div className="mt-10 grid gap-6">
        {page.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-lg border border-border bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
          </section>
        ))}
        <AssetMissingNotice
          title={labels.visuals}
          body={page.assetNote}
          checklistTitle={labels.plannedCases}
          checklist={globalChecklist}
        />
      </div>

      <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800">
          {locale === "ru" ? "Категории (текст)" : locale === "kk" ? "Санаттар" : "Categories (text)"}
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {exampleCategoryMeta
            .filter((c) => c.locales.includes(locale))
            .map((c) => (
              <li key={c.id}>{c.id.replace(/-/g, " ")}</li>
            ))}
        </ul>
      </section>

      <ExampleCategoryGrid locale={locale} categories={childPages} />

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{labels.related}</h2>
        <ul className="mt-4 grid gap-2 text-sm font-semibold text-teal-700">
          {page.relatedLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
