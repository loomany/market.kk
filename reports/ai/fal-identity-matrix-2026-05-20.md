# Fal identity matrix — live run 2026-05-20

**Script:** `node scripts/diagnose-fal-identity-matrix.mjs`  
**Production back-angle:** `node scripts/diagnose-fal-lingerie-production.mjs`

## Short prompts (11 calls) — 11/11 OK

| ID | Test | Model | Result | requestId |
|----|------|-------|--------|-----------|
| C1 | clothing t2i front | nano-banana-pro | OK | `019e45ff-ac0d-70c1-ab8f-ee6dafdc40c0` |
| C2a | clothing edit 3/4 + ref | edit | OK | `019e4600-0b9a-7f41-ae4f-0308bf1580e4` |
| C2b | clothing t2i 3/4 text | pro | OK | `019e4600-71d3-77f2-96a0-019722e29cc0` |
| L1 | lingerie SKU t2i front | pro | OK | `019e4600-c676-7511-b344-2001dabea825` |
| L2a | lingerie SKU edit 3/4 + ref | edit | OK | `019e4601-34d8-7351-9ce4-bba289fd20c7` |
| L2b | lingerie SKU t2i 3/4 append | pro | OK | `019e4601-8eb5-7ad2-adc7-8c893f7b7fba` |
| L2c | lingerie SKU t2i followUpAngle | pro | OK | `019e4601-e786-7033-a1f1-3bc8d828d64c` |
| L2d | lingerie SKU t2i identity bible | pro | OK | `019e4602-4e41-7110-83a8-61b9767174b7` |
| N1 | neutral-base t2i front | pro | OK | `019e4602-ac0a-76d2-b814-3e050890474e` |
| N2a | neutral-base edit 3/4 + ref | edit | OK | `019e4602-fe80-7340-95dc-b59f7c2ecec2` |
| N2b | neutral-base t2i followUp | pro | OK | `019e4603-56f1-7020-94cd-0751febc3e12` |

URLs: `reports/ai/fal-identity-matrix-latest.json`

**Note:** Fal `description` field was empty on all runs — identity-from-description (L2e) not tested.

## Production-length neutral lingerie + BACK angle (3 calls)

| ID | Test | Result | requestId |
|----|------|--------|-----------|
| P1 | long t2i front (~1170 chars) | OK | `019e4604-5754-7751-9819-7b0d06feb758` |
| P2a | edit BACK + ref (~978 chars) | **FAIL 422** | — |
| P2b | t2i BACK followUp (~1599 chars) | OK | `019e4605-c962-7cd3-9cb5-182cc4ed73bc` |

URLs: `reports/ai/fal-lingerie-production-latest.json`

## Conclusions

1. **Lingerie edit is not always blocked** — short 3/4 edit after SKU lingerie t2i passed (L2a).
2. **Edit can fail on harder angles** — back view + production-style prompt → 422; **t2i fallback passed** (P2b).
3. **t2i-only multi-angle is viable** for cases where edit fails; identity consistency is visual-only (compare L1 vs L2b/c/d in Fal UI).
4. User-reported “edit always fails on lingerie” may be **pose-dependent (back/side)**, **prompt length/content**, or **specific generated ref image** — not a hard API ban on all lingerie edits.
