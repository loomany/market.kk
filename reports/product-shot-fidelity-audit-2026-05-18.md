# Product Shot Fidelity Audit — 2026-05-18

## Scope

Files reviewed:

- `app/api/ai/product-shot/route.ts`
- `lib/ai/productShotPrompts.ts`
- `components/studio/ProductShotSettingsPanel.tsx`
- `components/studio/StudioShell.tsx`
- `components/studio/GenerationResultGrid.tsx`
- `app/api/ai/remove-background/route.ts`

## Findings (before fix)

### Prompt too creative

- `lib/ai/productShotPrompts.ts` used Bria Product Shot scene presets with only a short suffix: “Keep the original product shape…”
- Presets like `luxury-boutique`, `jewelry-display`, `flat-lay` invite scene generation; Bria `optimize_description: true` can rewrite the scene and **redraw** the product.
- **Marketplace** presets still went through Bria Product Shot — the model can add props (flowers, branches) and change composition.

### Product mixed with background

- Single-step Bria Product Shot (`fal-ai/bria/product-shot`) generates background and product together.
- No isolation step: the product pixels are not protected before scene synthesis.

### Remove-background before product-shot

- **Not used** in the Product Shot flow.
- `remove-background` existed only for “Удалить фон” mode and optional post-processing on try-on results.

### Marketplace preset selection

- UI preset “Маркетплейс” (`marketplace-clean`) only changed `scene_description` for Bria.
- No separate fidelity pipeline; same API as creative presets.

### Why the product changes (earrings test)

1. Generative product-shot model interprets “professional product photography” holistically.
2. `optimize_description: true` expands the scene.
3. Jewelry/flower earrings are high-risk: model adds flowers, chains, branches.
4. No hard constraint that pixels of the product must be preserved.

## Manual QA scenario (earrings)

**Input:** blue flower earrings, thin chain, small pendant.

**Fail examples:**

- New large cream flowers added
- Color/shape changed
- Extra chains/gems/pendants
- Product merged with branch/background
- Different jewelry item

**Pass criteria:**

- Same earrings, blue/white colors, chain and pendant preserved
- No new large flowers
- Cleaner background
- Suitable for marketplace card

## Real Fal calls during audit

**Not run** (per project rules; audit was code review only).
