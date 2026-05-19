const ALLOWED_HOST_SUFFIXES = [
  "fal.media",
  "fal.run",
  "fal.ai",
  "supabase.co",
  "storage.googleapis.com",
] as const;

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) {
    return true;
  }
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
    return true;
  }
  return false;
}

/** Remote HTTPS image URLs safe to fetch server-side for studio downloads. */
export function isDownloadableImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (isPrivateOrLocalHost(host)) {
      return process.env.NODE_ENV === "development";
    }
    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    );
  } catch {
    return false;
  }
}
