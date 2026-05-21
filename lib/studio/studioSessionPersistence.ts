import type { StudioSessionAsset } from "@/components/studio/types";

const SESSION_ASSETS_KEY = "vitrina-studio-session-assets-v1";
const MAX_ASSETS = 48;

/** Strip non-serializable Vision cache for storage. */
function toStoredAsset(asset: StudioSessionAsset): StudioSessionAsset {
  const { productPreservation: _p, ...rest } = asset;
  return rest;
}

export function loadStudioSessionAssets(): StudioSessionAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSION_ASSETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudioSessionAsset[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((a) => a?.id).slice(0, MAX_ASSETS);
  } catch {
    return [];
  }
}

export function saveStudioSessionAssets(assets: StudioSessionAsset[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SESSION_ASSETS_KEY,
      JSON.stringify(assets.map(toStoredAsset).slice(0, MAX_ASSETS))
    );
  } catch {
    /* quota */
  }
}

export function upsertStudioSessionAsset(asset: StudioSessionAsset): void {
  const prev = loadStudioSessionAssets();
  const next = [asset, ...prev.filter((a) => a.id !== asset.id)].slice(0, MAX_ASSETS);
  saveStudioSessionAssets(next);
}

export function removeStudioSessionAsset(id: string): void {
  saveStudioSessionAssets(loadStudioSessionAssets().filter((a) => a.id !== id));
}
