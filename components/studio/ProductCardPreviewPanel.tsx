"use client";

import { useState, type ReactNode } from "react";
import type { FalModelAspectRatio } from "@/lib/ai/modelOutputSizes";
import {
  previewAspectFromFal,
  type PreviewAspectState,
} from "@/lib/studio/previewImageAspect";
import {
  saasPreviewCardClass,
  StudioPreviewResultColumnHeader,
  StudioPreviewTabBar,
} from "./StudioSaaSPreviewChrome";

export type ProductCardPreviewTabId = "product" | "result";

const DESKTOP_PRODUCT_TABS: { id: "product"; label: string }[] = [
  { id: "product", label: "Товар" },
];

const MOBILE_TABS: { id: ProductCardPreviewTabId; label: string }[] = [
  { id: "product", label: "Товар" },
  { id: "result", label: "Итог" },
];

type ProductCardSaaSPreviewLayoutProps = {
  previewAspect: PreviewAspectState;
  productReady: boolean;
  resultReady: boolean;
  productPanel: ReactNode;
  resultPanel: ReactNode;
};

export function ProductCardSaaSPreviewLayout({
  previewAspect,
  productReady,
  resultReady,
  productPanel,
  resultPanel,
}: ProductCardSaaSPreviewLayoutProps) {
  const [activeTab, setActiveTab] = useState<ProductCardPreviewTabId>("product");
  const tabReady: Record<ProductCardPreviewTabId, boolean> = {
    product: productReady,
    result: resultReady,
  };

  return (
    <>
      <div className="hidden w-full max-w-[656px] items-start gap-4 lg:flex">
        <div className="w-[320px] shrink-0">
          <StudioPreviewTabBar
            tabs={DESKTOP_PRODUCT_TABS}
            activeTab="product"
            tabReady={{ product: productReady }}
            onTabChange={() => {}}
            aspectLabel={previewAspect.badge}
            ariaLabel="Товарная карточка"
          />
          <div role="tabpanel">{productPanel}</div>
        </div>

        <div className="w-[320px] shrink-0" aria-label="Результат генерации">
          {!resultReady ? (
            <StudioPreviewResultColumnHeader aspectLabel={previewAspect.badge} />
          ) : null}
          {resultPanel}
        </div>
      </div>

      <div className="flex w-full flex-col max-lg:-mx-4 max-lg:w-[calc(100%+2rem)] lg:hidden">
        <StudioPreviewTabBar
          tabs={MOBILE_TABS}
          activeTab={activeTab}
          tabReady={tabReady}
          onTabChange={setActiveTab}
          aspectLabel={previewAspect.badge}
          fullWidth
          ariaLabel="Товарная карточка"
        />
        <div role="tabpanel" className="w-full min-w-0">
          {activeTab === "product" ? productPanel : resultPanel}
        </div>
      </div>
    </>
  );
}

export function productCardPreviewPropsFor(aspect: PreviewAspectState) {
  return {
    compact: true as const,
    scrollableViewport: false as const,
    className: saasPreviewCardClass,
    viewportAspect: undefined as FalModelAspectRatio | undefined,
    viewportAspectRatio: aspect.ratio,
    aspectBadge: aspect.badge,
  };
}

export function previewAspectFromShotRatio(
  ratio: FalModelAspectRatio
): PreviewAspectState {
  return previewAspectFromFal(ratio);
}
