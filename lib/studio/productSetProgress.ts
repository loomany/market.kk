export type ProductSetSlotPhase =
  | "pending"
  | "analyzing"
  | "model"
  | "tryon"
  | "done"
  | "error";

export type ProductSetSlotProgress = {
  photoId: string;
  label: string;
  phase: ProductSetSlotPhase;
};

export function createInitialProductSetSlots(
  photos: { id: string }[],
  labels: string[]
): ProductSetSlotProgress[] {
  return photos.map((photo, index) => ({
    photoId: photo.id,
    label: labels[index]?.trim() || `Ракурс ${index + 1}`,
    phase: "pending",
  }));
}

export function patchProductSetSlot(
  slots: ProductSetSlotProgress[],
  photoId: string,
  patch: Partial<Pick<ProductSetSlotProgress, "phase" | "label">>
): ProductSetSlotProgress[] {
  return slots.map((slot) =>
    slot.photoId === photoId ? { ...slot, ...patch } : slot
  );
}

export function completedProductSetCount(slots: ProductSetSlotProgress[]): number {
  return slots.filter((s) => s.phase === "done").length;
}
