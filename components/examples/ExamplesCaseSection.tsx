import type { Locale } from "@/lib/i18n/localeConfig";
import {
  getCategoryMetaByPageKey,
  getExampleCasesForCategory,
  getRenderableCasesForCategory,
  type ExampleCategoryId,
} from "@/data/seo/exampleCases";
import type { ExamplePageKey } from "@/data/seo/examplesPages";
import { examplesHubLabels } from "@/lib/seo/examplesCopy";
import { AssetMissingNotice } from "./AssetMissingNotice";
import { BeforeAfterCard } from "./BeforeAfterCard";

type ExamplesCaseSectionProps = {
  locale: Locale;
  pageKey: ExamplePageKey;
  categoryId?: ExampleCategoryId;
};

export function ExamplesCaseSection({ locale, pageKey }: ExamplesCaseSectionProps) {
  const meta = getCategoryMetaByPageKey(pageKey);
  const labels = examplesHubLabels(locale);
  if (!meta) return null;

  const renderable = getRenderableCasesForCategory(meta.id, locale);
  const allCases = getExampleCasesForCategory(meta.id, locale);
  const checklist =
    meta.plannedChecklist[locale] ??
    meta.plannedChecklist.en ??
    [];

  if (renderable.length > 0) {
    return (
      <section className="mt-10 grid gap-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          {labels.plannedCases}
        </h2>
        {renderable.map((caseItem) => (
          <BeforeAfterCard
            key={caseItem.id}
            caseItem={caseItem}
            locale={locale}
            beforeLabel={labels.before}
            afterLabel={labels.after}
          />
        ))}
      </section>
    );
  }

  return (
    <div className="mt-10">
      <AssetMissingNotice
        title={labels.noAssetsYet}
        body={
          locale === "ru"
            ? "Пары до/после не опубликованы: нет подтверждённых owned/licensed файлов в /public/examples/. Ниже — чеклист подготовки без фейковых изображений."
            : locale === "kk"
              ? "Before/after жоқ: /public/examples/ ішінде расталған файлдар жоқ."
              : "No before/after published: no verified owned/licensed files under /public/examples/. Use the preparation checklist below."
        }
        checklistTitle={labels.plannedCases}
        checklist={checklist}
      />
      {allCases.length > 0 ? (
        <p className="mt-4 text-xs text-slate-500">
          {locale === "ru"
            ? `${allCases.length} кейс(ов) в данных, но без безопасных изображений.`
            : `${allCases.length} case(s) in data without safe images.`}
        </p>
      ) : null}
    </div>
  );
}
