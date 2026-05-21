export type TelegramConfig = {
  enabled: boolean;
  botToken: string | null;
  adminChatId: string | null;
  debug: boolean;
  silentHours: { startMinutes: number; endMinutes: number } | null;
};

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === "") return defaultValue;
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return defaultValue;
}

/** Parses "23:00-08:00" as minutes from midnight. Supports overnight ranges. */
function parseSilentHours(raw: string | undefined): TelegramConfig["silentHours"] {
  if (!raw?.trim()) return null;
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const endMinutes = Number(match[3]) * 60 + Number(match[4]);
  if (startMinutes < 0 || endMinutes < 0 || startMinutes >= 24 * 60 || endMinutes >= 24 * 60) {
    return null;
  }
  return { startMinutes, endMinutes };
}

export function getTelegramConfig(): TelegramConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() || null;
  const notificationsEnabled = parseBool(process.env.TELEGRAM_NOTIFICATIONS_ENABLED, true);
  const debug = parseBool(process.env.TELEGRAM_DEBUG, false);
  const silentHours = parseSilentHours(process.env.TELEGRAM_SILENT_HOURS);

  const enabled = Boolean(
    notificationsEnabled && botToken && adminChatId
  );

  return {
    enabled,
    botToken,
    adminChatId,
    debug,
    silentHours,
  };
}

export function isInSilentHours(config: TelegramConfig, now = new Date()): boolean {
  if (!config.silentHours) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const { startMinutes, endMinutes } = config.silentHours;
  if (startMinutes <= endMinutes) {
    return minutes >= startMinutes && minutes < endMinutes;
  }
  return minutes >= startMinutes || minutes < endMinutes;
}
