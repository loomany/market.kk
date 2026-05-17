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
| `reels_9_16` | 9:16 | 1080×1920 | Reels / Stories |

Helper under formats:

> Для маркетплейсов чаще всего подходит 1:1 или 4:5. Для Reels, Stories и TikTok используйте 9:16.

### Update: 9:16 for Reels / Stories

- **Key:** `reels_9_16`
- **Size:** 1080×1920 (~2.07M px; standard vertical social export)
- **Use:** Instagram Reels, Stories, TikTok vertical video covers / stills
- **Exact-card canvas:** same `[1080, 1920]` via `shotSizePresetToDimensions`
- **Bria creative `shot_size`:** same `[1080, 1920]`
- **UI:** fifth format card spans full width on 2-column mobile grid (`col-span-2`)
- **Creative mode UX:** `ProductShotCreativeReview` warning + 3 self-check prompts before Accept (does not block accept)

Legacy form/API values `portrait`, `vertical`, `wide` are normalized to the new keys.

## `shot_size` sent to Fal (creative Bria product-shot)

| Preset | `shot_size` [width, height] | ~Megapixels |
|--------|-----------------------------|-------------|
| `square` | [1000, 1000] | 1.0M |
| `vertical_4_5` | [1000, 1250] | 1.25M |
| `vertical_3_4` | [900, 1200] | 1.08M |
| `horizontal_4_3` | [1200, 900] | 1.08M |
| `reels_9_16` | [1080, 1920] | 2.07M |

## Exact-card canvas

Same dimensions via `shotSizePresetToDimensions()` in `lib/studio/exactProductCard.ts`.

## Files touched

- `lib/ai/productShotSchemas.ts` — keys, labels, mapping, legacy normalize
- `components/studio/ProductShotSettingsPanel.tsx` — UI cards + helper
- `components/studio/ProductShotCreativeReview.tsx` — creative-mode review prompts
- `components/studio/GenerationResultGrid.tsx` — shows review block for creative product shot
- `components/studio/types.ts` — re-export `ShotSizePreset`

## Real Fal calls

**Not run.**

## Mobile

Format grid uses `min-w-0` on grid and buttons to reduce horizontal overflow on narrow viewports.
