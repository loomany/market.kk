import Link from "next/link";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { ExamplePageContent } from "@/data/seo/examplesPages";
import { examplesHubLabels } from "@/lib/seo/examplesCopy";

type ExampleCategoryGridProps = {
  locale: Locale;
  categories: ExamplePageContent[];
};

export function ExampleCategoryGrid({ locale, categories }: ExampleCategoryGridProps) {
  const labels = examplesHubLabels(locale);

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">{labels.categories}</h2>
      <ul className="mt-4 grid gap-2 text-sm font-semibold text-teal-700">
        {categories.map((child) => (
          <li key={child.slug}>
            <Link href={`/${locale}/examples/${child.slug}`}>{child.h1}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
