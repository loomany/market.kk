import { isDownloadableImageUrl } from "@/lib/studio/isDownloadableImageUrl";

function slugifyFilename(label: string) {
  return (
    label
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "image"
  );
}

export function previewImageFilename(prefix: string, label: string, index: number) {
  const slug = slugifyFilename(label);
  return `${prefix}-${String(index + 1).padStart(2, "0")}-${slug}.png`;
}

function sanitizeDownloadFilename(filename: string): string {
  const trimmed = filename.trim().replace(/[^\w.\-()]+/g, "_").slice(0, 120);
  if (!trimmed) return "image.png";
  return trimmed.includes(".") ? trimmed : `${trimmed}.png`;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = sanitizeDownloadFilename(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

async function fetchImageBlob(url: string, filename: string): Promise<Blob> {
  if (url.startsWith("blob:") || url.startsWith("data:")) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("blob_fetch_failed");
    return res.blob();
  }

  if (isDownloadableImageUrl(url)) {
    const params = new URLSearchParams({ url, filename });
    const res = await fetch(`/api/studio/download-image?${params.toString()}`);
    if (!res.ok) throw new Error("proxy_fetch_failed");
    return res.blob();
  }

  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin === window.location.origin) {
      const res = await fetch(parsed.href);
      if (res.ok) return res.blob();
    }
  } catch {
    // fall through
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("direct_fetch_failed");
  return res.blob();
}

export async function downloadImageFile(url: string, filename: string) {
  try {
    const blob = await fetchImageBlob(url, filename);
    triggerBlobDownload(blob, filename);
  } catch (error) {
    console.error("[downloadImageFile]", error);
  }
}

export async function downloadAllImages(
  items: { url: string; label: string }[],
  filenamePrefix: string
) {
  for (let index = 0; index < items.length; index++) {
    const item = items[index]!;
    await downloadImageFile(
      item.url,
      previewImageFilename(filenamePrefix, item.label, index)
    );
    if (index < items.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
    }
  }
}
