export const SAVED_MODEL_STORAGE_KEY = "vitrina-saved-ai-model-v1";
export const SAVED_MODEL_ASSET_TYPE = "ai-model";

export type SavedStudioModel = {
  id: string;
  url: string;
  savedAt: string;
  settings?: Record<string, unknown>;
};

export function readSavedModelFromStorage(): SavedStudioModel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVED_MODEL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedStudioModel;
    if (!parsed?.url || typeof parsed.url !== "string") return null;
    return {
      id: parsed.id ?? `local-${parsed.savedAt}`,
      url: parsed.url,
      savedAt: parsed.savedAt ?? new Date(0).toISOString(),
      settings: parsed.settings,
    };
  } catch {
    return null;
  }
}

export function writeSavedModelToStorage(model: SavedStudioModel) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_MODEL_STORAGE_KEY, JSON.stringify(model));
}

export function clearSavedModelStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVED_MODEL_STORAGE_KEY);
}
