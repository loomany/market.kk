# Vitrina AI Studio — i18n Pass 2 (RU / EN / KK)

**Date:** 2026-05-21  
**Scope:** Finish visible Studio UI i18n; strict `check:studio:i18n`; verification commands  
**Deploy / push / commit:** not performed

---

## 1. Pass 1 → Pass 2 delta

| Metric | Pass 1 | Pass 2 |
|--------|--------|--------|
| Copy leaf keys | ~373 | **527** |
| `check:studio:i18n` | WARN (~428 Cyrillic lines) | **PASS** (hardcoded Cyrillic in `components/studio/**` = FAIL) |
| Migrated priority panels | Partial (`StudioShell`, upload, product check, modes) | **All** `components/studio/*.tsx` user-visible strings |

---

## 2. Remaining Russian zones found (start of Pass 2)

Hardcoded Cyrillic lived in ~28 components (~153 failing lines under strict scan), plus:

- `components/studio/types.ts` — legacy RU label arrays (`PRODUCT_CATEGORIES`, `STUDIO_MODES`, `MODEL_BODY_TYPES`, …) kept for `lib/ai/modelSettingsSummary.ts` (not touched); **UI uses** `lib/studio/i18n/studioOptionLists.ts` instead.
- `ProcessedAssetsPanel` editor-switch fallback messages.
- `StudioShell` try-on progress regex (`көшір` for KK progress detection).
- Post-processing editor catalog (moved to `postProcessingEditorsI18n.ts` in Pass 1/2).

---

## 3. Components translated in Pass 2

### Priority (task list)

- `ModelPresetSelector.tsx`
- `GenerationResultGrid.tsx`
- `ClothingPreviewPanel.tsx`
- `ProcessedAssetsPanel.tsx`
- `ProductMaskEditor.tsx`
- `StudioShell.tsx` (progress / angle progress)

### Remainder batch

- `ImageSettingsForm.tsx`, `VideoSettingsForm.tsx`
- `TryOnResultActions.tsx`, `AiEditorPicker.tsx`, `AspectRatioSelectField.tsx`
- `BeforeAfterPreview.tsx`, `GarmentSettingsPanel.tsx`, `ImageUploader.tsx`
- `ModelAnglesField.tsx`, `ModelInputModeSelector.tsx`, `ModelPromptComposer.tsx`
- `ModelReadyCard.tsx`, `PreviewImageCarousel.tsx`, `PreviewCard.tsx`
- `ProductCardPreviewPanel.tsx`, `ProductCardDualExportPanel.tsx`
- `ProductSetProgressRail.tsx`, `ProductPoseFromPhotoCard.tsx`
- `ProductShotSettingsPanel.tsx`, `ProductShotChecklist.tsx`, `QualityChecklist.tsx`
- `SaasPipelineCountdown.tsx`, `StudioFilesList.tsx`, `StudioFilesPagination.tsx`
- `StudioWorkflowStep.tsx`, `StudioAssetPreview.tsx`, `PostProcessingActions.tsx`
- Plus Pass 1 carry-over: `ProductSelectionPanel`, `ModelSourcePanel`, `ModelScenarioSelector`, `StudioSaaSPreviewChrome`, `StudioLanguageSwitcher`, `StudioLocaleContext`, etc.

---

## 4. Dictionary structure (single system, no parallel dict)

| Layer | Files |
|-------|--------|
| Base | `lib/studio/i18n/studioCopy{Ru,En,Kk}.ts` |
| Pass 2 core | `lib/studio/i18n/studioCopyPass2.ts` — `modelPreset`, `generationResults`, `clothingPreview`, `processedAssets`, `maskEditor`, `progress`, `angleProgress`, `postProcessing`, … |
| Pass 2 remainder | `lib/studio/i18n/studioCopyPass2Remainder.ts` — `imageSettings`, `videoSettings`, `productShot`, `modelPrompt`, checklists, files, carousel, … |
| Merge | `lib/studio/i18n/index.ts` — `mergeCopy(base, pass2 + remainder)` |
| Helpers | `studioFormOptions.ts`, `studioOptionLists.ts`, `postProcessingEditorsI18n.ts`, `friendlyAiErrors.ts`, `assetDisplayLabels.ts` |

New key groups added in Pass 2 (remainder file): `form`, `imageSettings`, `videoSettings`, `processedAssetsEditorReset`, `aiEditorPicker`, `beforeAfter`, `garmentSettings`, `imageUploader`, `modelAngles`, `modelInputMode`, `modelPrompt`, `modelReady`, `previewCarousel`, `resultActions`, `productShot`, `productCard`, `productSetProgress`, `productPoseFromPhoto`, `productShotChecklist`, `qualityChecklist`, `saasCountdown`, `previewCard`, `studioFiles`, `studioFilesPagination`, `postProcessingActions`, `productCardExport`, `studioWorkflowStep`, `studioAssetPreview`.

---

## 5. Cyrillic in Studio components after Pass 2

| Location | Status |
|----------|--------|
| `components/studio/**/*.tsx` user-visible strings | **None** (strict check PASS) |
| JSDoc / comments only | Allowed (e.g. `PreviewCard`, `GenerationResultGrid`, `StudioWorkflowRail`) |
| Regex / allowlisted lines | `StudioShell` try-on progress; `ProcessedAssetsPanel` error-pattern regex; `не включён` in API error matcher |
| `components/studio/types.ts` | Legacy RU constants — **allowlisted** in checker; not used by migrated UI |

### Allowed Cyrillic (not migrated)

- `lib/studio/i18n/studioCopyRu.ts`, `studioCopyKk.ts`, `studioCopyPass2*.ts`
- `reports/studio/**`
- AI / pipeline output: `buildModelCombinedPromptRu`, `productPoseLabelForUi`, `sourceModel*Ru`, `garmentLabelRu` in progress templates
- Labels **around** AI content use `copy.*`; preview body may stay RU when AI builds RU prompt text

---

## 6. Strict checker (`scripts/studio/check-studio-i18n.ts`)

- **FAIL** on hardcoded Cyrillic in `components/studio/**` (except allowlist).
- **PASS** parity: same keys in `ru` / `en` / `kk`; no empty / `TODO` strings.
- **EN copy** Cyrillic count ≤ 3 (badge tolerance).
- Allowlist: comments, imports, `types.ts`, AI field names, regex lines, `hintForAspectRatioOption`, config error patterns.

---

## 7. Manual UI smoke (URLs)

Requested port **3007** — another `next dev` instance was already bound to **3000**; smoke used **3000**.

| URL | HTTP | Notes |
|-----|------|--------|
| `/studio?lang=en` | 200 | No common RU UI tokens in HTML (`Скачать`, `Товар`, …) |
| `/en/studio` | 200 | Same |
| `/kk/studio` | 200 | Same |
| `/ru/studio` | 200 | RU studio route OK |

Studio shell is **client-rendered**; initial HTML still contains **site-level RU meta** (e.g. «студия товарных фото…») from layout/SEO — outside `components/studio/**`. Full panel copy requires browser check on 3000/3007 after single dev server.

---

## 8. Command results

| Command | Result |
|---------|--------|
| `npm run check:studio:i18n` | **PASS** (527 keys) |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |
| `npm run audience:build` | **PASS** |
| `npm run check:seo:audience-pages` | **PASS** |
| `npm run check:seo:content` | **PASS** |
| `npm run check:seo:trust` | **PASS** |
| `npm run check:seo:examples` | **PASS** |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** |
| `NEXT_PUBLIC_SITE_URL=https://vitrina.help npm run smoke:seo:prelaunch` | **FAIL** — unrelated: missing `app/icon.png` (SEO gate, not Studio i18n) |

---

## 9. What was NOT touched

- `lib/ai/**`, `app/api/ai/**`
- Token charging, Lemon, billing, Supabase, auth, migrations
- `.env*`
- `components/studio/types.ts` body (legacy RU labels for `lib/ai` consumers)
- Deploy, push, commit, `git add .`

---

## 10. Risks before combined pre-push audit

1. **Browser pass** — confirm EN/KK panels after hydration (SSR HTML is sparse for studio).
2. **`types.ts` legacy RU** — safe for UI if all selects use `studioOptionLists`; any new import of `STUDIO_MODES` from `types` would regress locale.
3. **Model prompt preview** — `buildModelCombinedPromptRu` still shows Russian in preview box by design.
4. **Date formatting** — `StudioFilesList` may still use `toLocaleString("ru-RU")` for timestamps (allowlisted); consider locale-aware dates later.
5. **Prelaunch SEO** — fix `app/icon.png` separately before production SEO gate.

---

## 11. Ready for combined pre-push audit?

| Gate | Ready? |
|------|--------|
| Studio i18n strict check | Yes |
| Typecheck / build | Yes |
| Studio scope isolation (no AI/billing diff) | Yes (within stated paths) |
| Full product prelaunch | After `app/icon.png` + manual Studio browser smoke on one dev port |

**Verdict:** Pass 2 Studio i18n is **complete for automated gates**; proceed to combined PR after quick **browser** smoke on `/en/studio` and `/kk/studio`, and optional SEO icon fix.
