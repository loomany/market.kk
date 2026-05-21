import type { BotDetection } from "@/lib/telegram/types";

type BotPattern = {
  name: string;
  tier: "important" | "noise";
  test: RegExp;
};

const BOT_PATTERNS: BotPattern[] = [
  { name: "Googlebot", tier: "important", test: /googlebot/i },
  { name: "YandexBot", tier: "important", test: /yandexbot|yandex\.com\/bots/i },
  { name: "Bingbot", tier: "important", test: /bingbot/i },
  { name: "AhrefsBot", tier: "noise", test: /ahrefsbot/i },
  { name: "SemrushBot", tier: "noise", test: /semrushbot/i },
  { name: "GPTBot", tier: "important", test: /gptbot/i },
  { name: "ChatGPT-User", tier: "important", test: /chatgpt-user/i },
  { name: "ClaudeBot", tier: "important", test: /claudebot|anthropic-ai/i },
  { name: "PerplexityBot", tier: "important", test: /perplexitybot/i },
  { name: "Bytespider", tier: "noise", test: /bytespider/i },
  { name: "TelegramBot", tier: "noise", test: /telegrambot/i },
  { name: "FacebookExternalHit", tier: "noise", test: /facebookexternalhit/i },
];

const GENERIC_BOT = /bot|crawler|spider|slurp|wget|curl\/|python-requests|headless/i;

export function detectBot(userAgent: string | undefined): BotDetection {
  const ua = userAgent?.trim() ?? "";
  if (!ua) {
    return { isBot: false };
  }

  for (const pattern of BOT_PATTERNS) {
    if (pattern.test.test(ua)) {
      return { isBot: true, botName: pattern.name, tier: pattern.tier };
    }
  }

  if (GENERIC_BOT.test(ua)) {
    return { isBot: true, botName: "Unknown bot", tier: "noise" };
  }

  return { isBot: false };
}

export function botPathGroup(path: string): string {
  const normalized = path.split("?")[0] ?? path;
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length >= 2 && (segments[1] === "blog" || segments[0] === "blog")) {
    return "/blog/*";
  }
  if (segments.includes("articles")) return "/articles/*";
  if (segments.length === 0) return "/";
  const last = segments[segments.length - 1] ?? "";
  if (segments.length >= 2) {
    return `/${segments.slice(0, 2).join("/")}/*`;
  }
  return `/${last || "*"}`;
}
