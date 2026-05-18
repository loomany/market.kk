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

export async function downloadImageFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    return;
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
