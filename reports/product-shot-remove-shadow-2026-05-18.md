# Product Shot — Remove Shadow from Exact Card — 2026-05-18

## Problem

In **Product Shot → Точная карточка**, the client canvas compositor drew a soft gray blurred ellipse under the product. For marketplace listings this looked artificial and conflicted with a clean white/light card.

## Where the shadow was

`lib/studio/exactProductCard.ts` — function `composeExactProductCard`:

- `ctx.filter = "blur(18px)"`
- Filled ellipse under the product (`ctx.ellipse` + `rgba(15, 23, 42, 0.12)`)
- Drawn before `ctx.drawImage` of the cutout

Not in Fal API, `StudioShell`, or `ProductShotSettingsPanel` logic (only copy text).

## How it was removed

- Shadow drawing is **disabled by default** (`showShadow` omitted or `false`).
- Optional `showShadow?: boolean` kept on `ComposeExactProductCardOptions` for a future UI toggle; no studio UI wired yet.
- Preset hint in `ProductShotSettingsPanel` for «Маркетплейс» updated from «Светлый фон и аккуратная тень» to «Чистый фон без изменения товара».

## Files changed

| File | Change |
|------|--------|
| `lib/studio/exactProductCard.ts` | Shadow behind `showShadow`; default off |
| `components/studio/ProductShotSettingsPanel.tsx` | Marketplace preset hint |
| `reports/product-shot-remove-shadow-2026-05-18.md` | This report |

## Format coverage

Shadow removal applies to all presets via shared `shotSizePresetToDimensions` layout (1:1, 4:5, 3:4, 4:3, 9:16) — same compose path, no per-ratio shadow branch.

## Build / lint

- `npm run build` — **success**
- `npm run lint` — **success**

## Real Fal calls

**Not run** (per project rules).

## Manual QA

1. Open `/studio` → Product Shot → Точная карточка.
2. Upload product → create card.
3. **Pass:** flat white/light-gray background, product centered, no gray oval blur under product.
4. **Fail:** visible drop shadow or product pixels altered by compositor.
