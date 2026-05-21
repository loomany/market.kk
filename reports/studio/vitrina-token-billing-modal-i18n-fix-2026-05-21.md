# TokenBillingModal Studio i18n fix — 2026-05-21

## Verdict

**FIX READY IN SOURCE** — `check:studio:i18n` снова PASS. Commit / push / deploy **не выполнялись** (ждут команды владельца).

---

## Проблема

`npm run check:studio:i18n` падал на `components/studio/TokenBillingModal.tsx`:

| Строка | Hardcoded |
|--------|-----------|
| `BALANCE_HINT` | RU/KK шаблон баланса |
| `aria-label` | «Закрыть» |
| fallback CTA | `locale === "kk" ? "Токен сатып алу" : "Купить токены"` |

---

## Решение

1. Добавлен блок **`tokenBilling`** в `lib/studio/i18n/studioCopyPass2.ts` для **ru / en / kk** (9 ключей × 3 локали → **536** leaf keys, было 527).

2. `TokenBillingModal.tsx`:
   - `useStudioCopy()` + `formatStudioString()`
   - title/message для `INSUFFICIENT_TOKENS` и `GUEST_GENERATION_LIMIT` из studio copy (синхрон с переключателем языка Studio)
   - CTA: `signIn`, `topUpBalance`, `buyTokens` из copy
   - убран prop `locale` (берётся из `StudioLocaleContext`)

3. `StudioShell.tsx` — вызов модалки без `locale={...}`.

### Ключи `copy.tokenBilling`

| Key | RU | EN | KK |
|-----|----|----|-----|
| `insufficientTitle` | Недостаточно токенов | Not enough tokens | Токен жеткіліксіз |
| `insufficientBody` | Для этой AI-операции нужен 1 токен… | This AI task requires 1 token… | Бұл AI әрекетіне 1 токен қажет… |
| `balanceHint` | Баланс: {balance} · нужно: {required} | Balance: {balance} · required: {required} | Баланс: {balance} · қажет: {required} |
| `topUpBalance` | Пополнить баланс | Top up balance | Балансты толтыру |
| `close` | Закрыть | Close | Жабу |
| `buyTokens` | Купить токены | Buy tokens | Токен сатып алу |
| `guestUsedTitle` | Бесплатная генерация уже использована | Free generation already used | Тегін генерация қолданылып қойды |
| `guestUsedBody` | Войдите в аккуунт… | Sign in and top up… | Су таңбасыз жалғастыру… |
| `signIn` | Войти | Sign in | Кіру |

---

## Проверки (`C:\dev\kaspi`)

| Command | Result |
|---------|--------|
| `npm run check:studio:i18n` | **PASS** |
| `npm run test:tokens` | **PASS** |
| `npm run build` | **PASS** |

---

## Изменённые файлы

```
components/studio/TokenBillingModal.tsx
components/studio/StudioShell.tsx
lib/studio/i18n/studioCopyPass2.ts
```

**Не трогали:** SEO audience, icons, Lemon env, migrations, AI prompts, `lib/tokens/generationBilling.ts` (server copy остаётся; UI в Studio переопределяет тексты по `errorCode`).

---

## Куда переносить fix

| Ветка | Действие |
|-------|----------|
| **Dirty source** (`C:\dev\kaspi`, текущая работа) | Уже применено |
| **`snapshot/vitrina-all-work-2026-05-21`** | Cherry-pick или повторный commit snapshot после merge fix |
| **`feat/vitrina-tokens`** | **Рекомендуется перенести** — тот же patch в `C:\dev\kaspi-vitrina-tokens` (там `TokenBillingModal` ещё с `BALANCE_HINT` / hardcoded) |
| Studio-only split branch (будущий) | Войдёт вместе с `lib/studio/i18n/**` |

Минимальный перенос в token worktree: 3 файла выше.

---

## Git

Commit / push **не делались** по ТЗ.
