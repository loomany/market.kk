# Telegram site notifications — setup

## What you need

1. Create a bot in [@BotFather](https://t.me/BotFather) and copy the **bot token**.
2. Get your **chat id** (message [@userinfobot](https://t.me/userinfobot) or add the bot to a group and use the group id).
3. Add to `.env.local` (never commit real values):

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_ADMIN_CHAT_ID=123456789
TELEGRAM_NOTIFICATIONS_ENABLED=true
```

Optional:

```env
TELEGRAM_DEBUG=false
TELEGRAM_SILENT_HOURS=23:00-08:00
```

## Verify

```bash
npm run telegram:test
npm run build
```

You should receive:

> Telegram notifications connected

## Deploy

Set the same variables in your hosting provider (Vercel → Project → Environment Variables). Redeploy after saving.

If `TELEGRAM_BOT_TOKEN` or `TELEGRAM_ADMIN_CHAT_ID` is empty, the site works normally and notifications are silently disabled.
