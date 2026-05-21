import { getTelegramConfig } from "@/lib/telegram/telegramConfig";

export type SendMessageResult = {
  ok: boolean;
  error?: string;
};

export async function sendTelegramHtml(
  text: string,
  config = getTelegramConfig()
): Promise<SendMessageResult> {
  if (!config.enabled || !config.botToken || !config.adminChatId) {
    return { ok: true };
  }

  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.adminChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "unknown");
      if (config.debug) {
        console.error("[telegram] send failed:", res.status, errText.slice(0, 200));
      }
      return { ok: false, error: `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    if (config.debug) {
      console.error("[telegram] send error:", err instanceof Error ? err.message : err);
    }
    return { ok: false, error: err instanceof Error ? err.message : "network_error" };
  }
}

export async function sendTestMessage(): Promise<SendMessageResult> {
  const config = getTelegramConfig();
  if (!config.botToken) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN is missing" };
  }
  if (!config.adminChatId) {
    return { ok: false, error: "TELEGRAM_ADMIN_CHAT_ID is missing" };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "vitrina.help";
  const envLabel = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "local";

  const { formatTestMessage } = await import("@/lib/telegram/telegramFormatter");
  return sendTelegramHtml(formatTestMessage(siteUrl, envLabel), config);
}
