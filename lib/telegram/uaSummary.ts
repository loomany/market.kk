export function summarizeUserAgent(userAgent: string | undefined): string {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return "Unknown device";

  const device = /mobile|android|iphone|ipad/i.test(ua) ? "Mobile" : "Desktop";

  let browser = "Browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";

  let os = "OS";
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua) && !/iphone|ipad/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return `${device} / ${browser} / ${os}`;
}
