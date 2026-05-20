import type { StudioProductPhotoMode } from "@/lib/studio/studioProductPhotoMode";

const DB_NAME = "vitrina-studio-product-photos";
const DB_VERSION = 2;
const LEGACY_STORE = "blobs";

export type PersistedProductPhotoBlob = {
  id: string;
  name: string;
  type: string;
  blob: Blob;
};

/** Отдельная запись выделения товара (товарная карточка) */
export const PRODUCT_SHOT_MASK_BLOB_ID = "__product-shot-mask__";

function storeForMode(mode: StudioProductPhotoMode): string {
  return mode;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      const oldVersion = (event as IDBVersionChangeEvent).oldVersion;
      if (oldVersion < 2 && db.objectStoreNames.contains(LEGACY_STORE)) {
        db.deleteObjectStore(LEGACY_STORE);
      }
      for (const mode of ["clothing-tryon", "product-shot"] as const) {
        if (!db.objectStoreNames.contains(mode)) {
          db.createObjectStore(mode, { keyPath: "id" });
        }
      }
    };
  });
}

export async function persistProductPhotoBlobs(
  mode: StudioProductPhotoMode,
  items: PersistedProductPhotoBlob[]
): Promise<void> {
  let preservedMask: PersistedProductPhotoBlob | undefined;
  if (mode === "product-shot") {
    const existing = await loadPersistedProductPhotoBlobs(mode);
    preservedMask = existing.find((row) => row.id === PRODUCT_SHOT_MASK_BLOB_ID);
  }

  const db = await openDb();
  const storeName = storeForMode(mode);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    for (const item of items) {
      store.put(item);
    }
    if (preservedMask) {
      store.put(preservedMask);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPersistedProductPhotoBlobs(
  mode: StudioProductPhotoMode
): Promise<PersistedProductPhotoBlob[]> {
  const db = await openDb();
  const storeName = storeForMode(mode);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => {
      db.close();
      resolve((req.result as PersistedProductPhotoBlob[]) ?? []);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearPersistedProductPhotoBlobs(
  mode: StudioProductPhotoMode
): Promise<void> {
  const db = await openDb();
  const storeName = storeForMode(mode);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Сброс обоих режимов (полный сброс студии) */
export async function clearAllPersistedProductPhotoBlobs(): Promise<void> {
  await Promise.all([
    clearPersistedProductPhotoBlobs("clothing-tryon"),
    clearPersistedProductPhotoBlobs("product-shot"),
  ]);
}

export async function persistProductShotMaskBlob(file: File): Promise<void> {
  const db = await openDb();
  const storeName = storeForMode("product-shot");
  const row: PersistedProductPhotoBlob = {
    id: PRODUCT_SHOT_MASK_BLOB_ID,
    name: file.name || "selected-product.png",
    type: file.type || "image/png",
    blob: file,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(row);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadProductShotMaskBlob(): Promise<File | null> {
  const rows = await loadPersistedProductPhotoBlobs("product-shot");
  const mask = rows.find((row) => row.id === PRODUCT_SHOT_MASK_BLOB_ID);
  if (!mask) return null;
  return new File([mask.blob], mask.name, { type: mask.type });
}

export async function clearProductShotMaskBlob(): Promise<void> {
  const db = await openDb();
  const storeName = storeForMode("product-shot");
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(PRODUCT_SHOT_MASK_BLOB_ID);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
