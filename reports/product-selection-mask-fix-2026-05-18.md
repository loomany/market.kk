# Product Selection / Mask Editor Fix — 2026-05-18

## What was wrong

Exact Product Card sent the **entire photo** to Fal background removal. Nearby objects (branches, hands, decor) were segmented together with the product and appeared on the final marketplace card.

## How selection works now

1. User uploads product photo (Product Shot → Точная карточка).
2. Optional step **«Выделить товар»** opens `ProductMaskEditor` (native canvas: brush, eraser, rectangle, clear, apply).
3. **Apply** builds `selected-product.png` on the client (`lib/studio/productMask.ts`): pixels outside the mask are transparent.
4. Exact card pipeline: **masked PNG → remove-background refine → `composeExactProductCard` → final card**.
5. Without mask: legacy pipeline still runs, with UI warning about extra objects.

Creative scene: optional checkbox **«Использовать выделенный товар для креативной сцены»** (default off; original file used).

## Masked PNG

- Off-screen mask canvas (full image resolution).
- View canvas shows dimmed outside + teal overlay on selection.
- `applyMaskToProductImage` multiplies source alpha by mask alpha and exports PNG `Blob` / `File`.

## Files changed

| File | Change |
|------|--------|
| `components/studio/ProductMaskEditor.tsx` | New mask editor UI |
| `lib/studio/productMask.ts` | Mask apply + coverage helpers |
| `components/studio/StudioShell.tsx` | Selection state, UI step, pipeline wiring |
| `components/studio/ProductShotSettingsPanel.tsx` | Creative checkbox + exact-card hint |
| `components/studio/GenerationResultGrid.tsx` | Previews, badges, warnings |
| `components/studio/types.ts` | Result metadata fields |
| `lib/studio/resultUtils.ts` | Map mask metadata to results |
| `lib/ai/productShotChecklist.ts` | `noExtraObjectsInCard` checklist item |
| `reports/product-selection-mask-audit-2026-05-18.md` | Audit |
| `reports/product-selection-mask-fix-2026-05-18.md` | This report |

## Mobile

- Canvas sized to `min(viewport, 520×480)`; `touch-action: none` on wrapper to reduce scroll while drawing.
- Pointer events for touch; large Apply/Cancel buttons; brush size slider full width.
- **Not run on physical devices in this session** — layout targets 360–768px widths via responsive classes; recommend manual pass on 360×740, 390×844, 430×932, 768×1024.

## Real Fal calls

**Not run** (per project rules; mock/build verification only).

## Build / lint

- `npm run build` — **success** (Next.js 16.2.6, TypeScript OK)
- `npm run lint` — **success** (eslint, no errors)

## Remaining risks

- URL-only sources may fail CORS in mask editor (file upload is reliable).
- Very small masks warn but still apply; user must verify coverage.
- Background removal can still trim fine details on masked edges.
- Rectangle tool is a quick fill, not a perfect lasso for complex shapes.

## Manual QA

**Input:** Photo of earrings with a branch nearby.

**Steps:**

1. Product Shot.
2. Точная карточка.
3. Upload earrings photo.
4. Tap **Выделить товар**.
5. Brush only the earrings (not the branch).
6. **Применить выделение**.
7. **Создать Product Shot** / create card.

**Pass:**

- Branch not on card.
- Earrings, blue flowers, chains/pendants preserved.
- Clean white/light background.
- No new objects.

**Fail:**

- Branch remains; earrings cropped; new flowers/gems; product altered; mask canvas broken on mobile.
