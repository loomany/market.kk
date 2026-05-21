/**
 * Sends a test Telegram notification using server env vars.
 * Run: npm run telegram:test
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID in .env.local
 */
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

import { sendTestMessage } from "../lib/telegram/telegramClient";

async function main() {
  const result = await sendTestMessage();
  if (!result.ok) {
    console.error(result.error ?? "Failed to send test message");
    process.exit(1);
  }
  console.log("Test message sent successfully.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
