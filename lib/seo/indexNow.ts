import "server-only";

import { siteUrl } from "./site";

export type IndexNowSubmitResult = {
  enabled: boolean;
  submitted: boolean;
  status?: number;
  message: string;
};

const indexNowEndpoint = "https://api.indexnow.org/indexnow";

export function isIndexNowEnabled() {
  return process.env.INDEXNOW_ENABLED === "true";
}

export function getIndexNowKey() {
  return process.env.INDEXNOW_KEY || "";
}

export function getIndexNowHost() {
  return process.env.INDEXNOW_HOST || new URL(siteUrl).host;
}

export function isOwnUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.host === getIndexNowHost();
  } catch {
    return false;
  }
}

export async function submitIndexNowUrls(
  urls: string[]
): Promise<IndexNowSubmitResult> {
  if (!isIndexNowEnabled()) {
    return {
      enabled: false,
      submitted: false,
      message: "IndexNow is disabled by INDEXNOW_ENABLED.",
    };
  }

  const key = getIndexNowKey();
  if (!key) {
    return {
      enabled: true,
      submitted: false,
      message: "INDEXNOW_KEY is missing.",
    };
  }

  const ownUrls = [...new Set(urls)].filter(isOwnUrl).slice(0, 100);
  if (ownUrls.length === 0) {
    return {
      enabled: true,
      submitted: false,
      message: "No own-domain URLs to submit.",
    };
  }

  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      host: getIndexNowHost(),
      key,
      keyLocation: `https://${getIndexNowHost()}/${key}.txt`,
      urlList: ownUrls,
    }),
  });

  return {
    enabled: true,
    submitted: response.ok,
    status: response.status,
    message: response.ok
      ? "IndexNow URLs submitted."
      : `IndexNow request failed with ${response.status}.`,
  };
}
