import type { Locale } from "@/lib/i18n/localeConfig";
import { getMarketingFooterProps } from "@/lib/landing/marketingFooterProps";
import { SaasFooter } from "@/components/landing/SaasFooter";
import { SaasHeader } from "@/components/landing/SaasHeader";

export function MarketingShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { copy, productLinks, useCaseLinks, platformLinks, resourceLinks } =
    getMarketingFooterProps(locale);

  return (
    <>
      <SaasHeader locale={locale} copy={copy} />
      <div className="flex flex-1 flex-col">{children}</div>
      <SaasFooter
        locale={locale}
        copy={copy}
        productLinks={productLinks}
        useCaseLinks={useCaseLinks}
        platformLinks={platformLinks}
        resourceLinks={resourceLinks}
      />
    </>
  );
}
