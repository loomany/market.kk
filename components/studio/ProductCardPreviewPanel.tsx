"use client";

import { useMemo, useState, type ReactNode } from "react";
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
import { useStudioCopy } from "./StudioLocaleContext";

export type ProductCardPreviewTabId = "product" | "result";

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
  const { copy } = useStudioCopy();
  const pc = copy.productCard;
  const [activeTab, setActiveTab] = useState<ProductCardPreviewTabId>("product");

  const desktopProductTabs = useMemo(
    () => [{ id: "product" as const, label: pc.tabProduct }],
    [pc.tabProduct]
  );
  const mobileTabs = useMemo(
    () => [
      { id: "product" as const, label: pc.tabProduct },
      { id: "result" as const, label: pc.tabResult },
    ],
    [pc.tabProduct, pc.tabResult]
  );

  const tabReady: Record<ProductCardPreviewTabId, boolean> = {
    product: productReady,
    result: resultReady,
  };

  return (
    <>
      <div className="hidden w-full max-w-[656px] items-start gap-4 lg:flex">
        <div className="w-[320px] shrink-0">
          <StudioPreviewTabBar
            tabs={desktopProductTabs}
            activeTab="product"
            tabReady={{ product: productReady }}
            onTabChange={() => {}}
            aspectLabel={previewAspect.badge}
            ariaLabel={pc.ariaProductCard}
          />
          <div role="tabpanel">{productPanel}</div>
        </div>

        <div className="w-[320px] shrink-0" aria-label={pc.ariaResult}>
          {!resultReady ? (
            <StudioPreviewResultColumnHeader aspectLabel={previewAspect.badge} />
          ) : null}
          {resultPanel}
        </div>
      </div>

      <div className="flex w-full flex-col max-lg:-mx-4 max-lg:w-[calc(100%+2rem)] lg:hidden">
        <StudioPreviewTabBar
          tabs={mobileTabs}
          activeTab={activeTab}
          tabReady={tabReady}
          onTabChange={setActiveTab}
          aspectLabel={previewAspect.badge}
          fullWidth
          ariaLabel={pc.ariaProductCard}
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
