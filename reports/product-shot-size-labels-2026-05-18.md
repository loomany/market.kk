# Product Shot Size Labels — 2026-05-18

## Before

UI showed opaque format names:

| Old key | UI label | UI hint |
|---------|----------|---------|
| `square` | 1:1 | Квадрат |
| `portrait` | 4:5 | Вертикально |
| `vertical` | 3:4 | Каталог |
| `wide` | **Wide** | **Шире** |

Users did not see output pixel dimensions.

## After

| Key | Ratio | Pixels shown | Subtitle |
|-----|-------|--------------|----------|
| `square` | 1:1 | 1000×1000 | — |
| `vertical_4_5` | 4:5 | 1000×1250 | Вертикально |
| `vertical_3_4` | 3:4 | 900×1200 | Каталог |
| `horizontal_4_3` | 4:3 | 1200×900 | Горизонтально |

Helper under formats:

> Размер используется для финальной карточки. Для маркетплейсов чаще всего подходит 1:1 или 4:5.

Legacy form/API values `portrait`, `vertical`, `wide` are normalized to the new keys.

## `shot_size` sent to Fal (creative Bria product-shot)

| Preset | `shot_size` [width, height] | ~Megapixels |
|--------|-----------------------------|-------------|
| `square` | [1000, 1000] | 1.0M |
| `vertical_4_5` | [1000, 1250] | 1.25M |
| `vertical_3_4` | [900, 1200] | 1.08M |
| `horizontal_4_3` | [1200, 900] | 1.08M |

## Exact-card canvas

Same dimensions via `shotSizePresetToDimensions()` in `lib/studio/exactProductCard.ts`.

## Files touched

- `lib/ai/productShotSchemas.ts` — keys, labels, mapping, legacy normalize
- `components/studio/ProductShotSettingsPanel.tsx` — UI cards + helper
- `components/studio/types.ts` — re-export `ShotSizePreset`

## Real Fal calls

**Not run.**

## Mobile

Format grid uses `min-w-0` on grid and buttons to reduce horizontal overflow on narrow viewports.
