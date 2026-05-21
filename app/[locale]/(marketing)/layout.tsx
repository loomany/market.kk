import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { assertLocale } from "@/lib/i18n/localeConfig";

type MarketingLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({ children, params }: MarketingLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  return <MarketingShell locale={locale}>{children}</MarketingShell>;
}
