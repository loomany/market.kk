# Product Shot Fidelity Fix — 2026-05-18

## What was wrong

- All Product Shot presets used **Bria Product Shot**, which can redraw the product.
- Marketplace presets did not use a fidelity-safe pipeline.
- Background removal was not part of Product Shot.
- Prompts were too weak for jewelry and creative scenes.

## What changed

### Two sub-modes (UI)

| Mode | Label | Behavior |
|------|--------|----------|
| A | **Точная карточка** (default) | BG remove → client canvas card; **no** Bria product-shot |
| B | **Креативная сцена** | Bria product-shot with strengthened prompts |

- Preset **Маркетплейс** / white / light-gray → forces **Точная карточка**.
- Creative-only presets disabled in exact mode.

### Exact card pipeline

1. Product image (file or URL)
2. `POST /api/ai/remove-background` (JSON or multipart `imageFile`)
3. Cutout preview in results (“Вырезка без фона”)
4. Client `composeExactProductCard()` — white/light-gray background, contain, soft shadow, 1:1 / 4:5 / 3:4
5. Badge: **Точная карточка**

### Creative pipeline

- Still `POST /api/ai/product-shot` with `fidelityMode: creative-scene`
- API rejects `exact-card` and marketplace presets on this route
- Prompts: `CREATIVE_FIDELITY_SUFFIX` + jewelry-specific suffix for `jewelry-display`
- Badge: **Креативная сцена — проверьте товар**
- Product Shot checklist (8 items) + creative warning

### API safety

- `product-shot` returns 400 if `fidelityMode=exact-card` or marketplace preset
- `remove-background` extended with multipart upload (no breaking change to JSON API)

## Files changed

| File | Change |
|------|--------|
| `lib/ai/productShotFidelity.ts` | Modes, suffixes, marketplace helpers |
| `lib/ai/productShotChecklist.ts` | Product Shot QC keys |
| `lib/ai/productShotPrompts.ts` | Creative-only prompts |
| `lib/ai/productShotSchemas.ts` | `fidelityMode` field |
| `lib/studio/exactProductCard.ts` | Canvas compositing |
| `lib/studio/resultUtils.ts` | `mapProductShotStudioResults` |
| `app/api/ai/product-shot/route.ts` | Block exact/marketplace on Bria |
| `app/api/ai/remove-background/route.ts` | Multipart + shared runner |
| `lib/ai/backgroundRemovalSchemas.ts` | Form payload builder |
| `components/studio/types.ts` | Settings + result fields |
| `components/studio/ProductShotSettingsPanel.tsx` | Mode selector, hints |
| `components/studio/ProductShotChecklist.tsx` | New checklist UI |
| `components/studio/StudioShell.tsx` | Exact vs creative handlers |
| `components/studio/GenerationResultGrid.tsx` | Badges, cutout, checklist |

## Build / lint

```
npm run build  → success
npm run lint   → success
```

## Real Fal calls

**Not run** during this fix (mock/dev rules; no paid calls without approve).

## Remaining risks

1. **Exact card** depends on Bria background removal quality; complex edges/hair on product photos may fail.
2. **Canvas CORS**: remote cutout URLs need CORS headers; fallback is open-in-tab if canvas fails.
3. **Creative mode** can still alter product despite stronger prompts — manual accept/reject required.
4. **Mock mode** uses demo SVG assets; fidelity must be validated in controlled real Fal test.

## Controlled real Fal test (when approved)

1. Set `AI_MOCK_MODE=0` + valid `FAL_KEY`
2. Run earrings test in **Точная карточка** + **Маркетплейс**
3. Compare cutout + card vs source
4. Run same SKU in **Креативная сцена** / **Бижутерия** only with checklist + reject if product changes
