# Vitrina AI Studio — UI i18n (RU / EN / KK)

**Date:** 2026-05-21  
**Scope:** Studio UI copy only (no AI pipeline, billing, auth, Supabase changes)  
**Deploy / push / commit:** not performed

---

## 1. Audit summary

| Area | Finding |
|------|---------|
| **Where text lived** | Mostly hardcoded Russian in `components/studio/**` (~512 lines) and some `lib/studio/**` display helpers (~206 lines). |
| **Largest files** | `StudioShell.tsx`, `ModelPresetSelector.tsx`, `GenerationResultGrid.tsx`, `ProcessedAssetsPanel.tsx`, `ProductMaskEditor.tsx`. |
| **Existing locale hook** | `useStudioLocale` read `/ru/studio` path segment only; no dictionary. |
| **Routes** | `/studio` (default) and `/[locale]/studio` for `ru` / `en` / `kk`. |

---

## 2. Architecture chosen

| Piece | Path |
|-------|------|
| Copy schema | `lib/studio/i18n/studioCopyTypes.ts` |
| Dictionaries | `lib/studio/i18n/studioCopyRu.ts`, `studioCopyEn.ts`, `studioCopyKk.ts` |
| API | `lib/studio/i18n/index.ts` — `getStudioCopy()`, `toStudioLocale()`, `formatStudioString()` |
| Option lists | `lib/studio/i18n/studioOptionLists.ts` |
| AI error mapping | `lib/studio/i18n/friendlyAiErrors.ts` |
| Upload validation (UI) | `lib/studio/i18n/validateStudioImageFile.ts` (does not change `lib/ai`) |
| Assets / lingerie labels | `lib/studio/i18n/assetDisplayLabels.ts`, `lingerieCropCopy.ts` |
| React context | `components/studio/StudioLocaleContext.tsx` + `useStudioCopy()` |
| Switcher | `components/studio/StudioLanguageSwitcher.tsx` (RU / EN / KK) |

**Fallback:** unknown locale → `ru`.

---

## 3. How Studio picks language

Priority (via `StudioLocaleProvider`):

1. Server prop `locale` from `/[locale]/studio`
2. First URL segment (`/en/studio`, `/kk/studio`, `/ru/studio`)
3. Query `?lang=ru|en|kk` on `/studio`
4. `localStorage` key `vitrina-studio-locale`
5. Default `ru`

Switcher updates localized route or `?lang=` and persists to `localStorage`.

---

## 4. Translated zones (this pass)

| Zone | Status |
|------|--------|
| Hero, loading, nav, mode cards | Done |
| Main workflow labels (product, mask, model, card, done) | Done |
| Primary CTA / blocker messages (core paths) | Done |
| Product upload panel | Done |
| Product check panel (static UI) | Done |
| Friendly AI / network errors (mapped) | Done |
| Language switcher | Done |

**Still Russian in UI (follow-up):** model angle progress strings, `ModelPresetSelector`, `GenerationResultGrid`, `ClothingPreviewPanel`, `ProcessedAssetsPanel`, mask editor, post-processing editors catalog, dynamic analysis lines from `sourceModel*Ru` helpers (content from AI, not static copy).

---

## 5. Files changed (Studio i18n)

**New**

- `lib/studio/i18n/**` (types, ru/en/kk copy, helpers)
- `components/studio/StudioLocaleContext.tsx`
- `components/studio/StudioLanguageSwitcher.tsx`
- `scripts/studio/check-studio-i18n.ts`
- `reports/studio/vitrina-ai-studio-i18n-ru-en-kk-2026-05-21.md`

**Updated**

- `components/studio/StudioShell.tsx`
- `components/studio/StudioModeSelector.tsx`
- `components/studio/ProductPhotosUploader.tsx`
- `components/studio/ProductCheckPanel.tsx`
- `components/studio/useStudioLocale.ts`
- `lib/studio/assetDisplayLabels.ts` (wrapper → i18n)
- `lib/studio/lingerieCropUiCopy.ts` (wrapper → i18n)
- `package.json` — script `check:studio:i18n`

**Not touched**

- `lib/ai/**`, `app/api/**`, Supabase, billing, Lemon, `.env*`

---

## 6. Verification

| Command | Result |
|---------|--------|
| `npm run check:studio:i18n` | **PASS** (226 copy keys; ~428 Cyrillic lines in not-yet-migrated components = warning only) |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** (after clean `.next`) |

**Manual URLs to check**

- http://localhost:3007/studio
- http://localhost:3007/studio?lang=en
- http://localhost:3007/studio?lang=kk
- http://localhost:3007/ru/studio
- http://localhost:3007/en/studio
- http://localhost:3007/kk/studio

---

## 7. Risks before combined push

1. **Partial migration** — secondary panels still show Russian until next pass; EN/KK shell and main flow should switch correctly.
2. **Analysis summaries** — `sourceModelSummaryRu` / pose lines stay RU when analysis returns Russian (by design for AI output).
3. **Do not `git add .`** — working tree may include SEO/billing/studio AI changes; stage only i18n paths for a clean commit.

---

## 8. Recommended next steps

1. Second pass: `ModelPresetSelector`, `GenerationResultGrid`, `ClothingPreviewPanel`, `ProcessedAssetsPanel`, `ProductMaskEditor`.
2. Add `progress.angle.*` keys for multi-angle model generation strings in `StudioShell`.
3. Re-enable strict Cyrillic scan on `StudioShell.tsx` in `check-studio-i18n.ts` when complete.
4. Manual smoke on `/studio?lang=en` and `/kk/studio` with upload + try-on (no logic changes expected).
