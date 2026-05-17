# Product Selection / Mask Editor Audit — 2026-05-18

## Scope

Files reviewed:

- `components/studio/StudioShell.tsx`
- `components/studio/ProductShotSettingsPanel.tsx`
- `components/studio/ImageUploader.tsx`
- `components/studio/GenerationResultGrid.tsx`
- `lib/studio/exactProductCard.ts`
- `app/api/ai/remove-background/route.ts`

## Where the product image comes from

- **Upload:** `ImageUploader` in `StudioShell` sets `productFile` and `productPreviewUrl` via `handleProductFile` / `useObjectUrlPreview`.
- **URL:** `productUrl` + HTTP preview when no file is selected.
- **Effective preview:** `effectiveProductPreviewUrl` = file object URL or valid `https://` URL (used in sidebar preview and generation input).

## Where remove-background is called

- **Exact card:** `handleExactProductCard` → `removeBackgroundForProduct` → `POST /api/ai/remove-background` with `imageFile` (multipart) or `imageUrl` (JSON).
- **Background-only mode:** separate handler with URL only.
- **Try-on post-process:** optional per-result remove in `handleRemoveBackground`.

Exact card previously always sent the **full original** image (file or URL) to Fal Bria background removal.

## Where the exact card canvas is built

1. `remove-background` returns cutout URL.
2. `composeExactProductCard` in `lib/studio/exactProductCard.ts` loads cutout, scales on client canvas, applies marketplace background and export size from `shotSizePreset`.

No server-side compositing; final card is a client `canvas` data URL.

## Why a branch appears in the result (earrings test)

1. Background removal segments **all foreground** connected or visually grouped with the product.
2. A branch touching or overlapping the earrings is interpreted as one object.
3. The cutout passed to `composeExactProductCard` still contains branch pixels.
4. There was **no user-controlled mask** before remove-background.

## Best place for “Выделить товар”

| Step | Location | Rationale |
|------|----------|-----------|
| After upload | `StudioShell` sidebar, between `ImageUploader` and primary CTA | User sees source preview first; selection is optional but recommended before exact card. |
| Mask UI | New `ProductMaskEditor` (modal panel in sidebar) | Keeps API routes unchanged; mask → PNG happens on client. |
| Pipeline hook | `handleExactProductCard` → pass `selectedProductFile` into `removeBackgroundForProduct` | Refine step only sees masked PNG; branch pixels are already transparent. |
| Results | `GenerationResultGrid` + `mapProductShotStudioResults` | Show selected product, cutout, and final card with badges. |

## Real Fal calls during audit

**Not run** (per project rules).

## Manual QA scenario (reference)

See fix report `product-selection-mask-fix-2026-05-18.md` § Manual QA.
