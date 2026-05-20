import Image from "next/image";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { ExampleCase } from "@/data/seo/exampleCases";
import { canRenderBeforeAfter } from "@/data/seo/exampleCases";

type BeforeAfterCardProps = {
  caseItem: ExampleCase;
  locale: Locale;
  beforeLabel: string;
  afterLabel: string;
};

export function BeforeAfterCard({
  caseItem,
  locale,
  beforeLabel,
  afterLabel,
}: BeforeAfterCardProps) {
  if (!canRenderBeforeAfter(caseItem)) {
    return null;
  }

  const before = caseItem.beforeImage!;
  const after = caseItem.afterImage!;
  const title = caseItem.title[locale] ?? caseItem.title.en;
  const description = caseItem.shortDescription[locale] ?? caseItem.shortDescription.en;
  const disclaimer = caseItem.disclaimer[locale] ?? caseItem.disclaimer.en;

  return (
    <article className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <figure>
          <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {beforeLabel}
          </figcaption>
          <Image
            src={before.src}
            alt={before.alt}
            width={before.width}
            height={before.height}
            loading="lazy"
            className="h-auto w-full rounded-md border border-slate-200 bg-white object-contain"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        </figure>
        <figure>
          <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {afterLabel}
          </figcaption>
          <Image
            src={after.src}
            alt={after.alt}
            width={after.width}
            height={after.height}
            loading="lazy"
            className="h-auto w-full rounded-md border border-slate-200 bg-white object-contain"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        </figure>
      </div>
      <p className="mt-3 text-xs text-slate-500">{disclaimer}</p>
    </article>
  );
}
