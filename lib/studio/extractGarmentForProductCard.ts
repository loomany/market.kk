import type { GarmentSelectionRefinement } from "@/lib/ai/refineGarmentSelectionSchemas";
import type {
  RefineProductMaskErrorResponse,
  RefineProductMaskSuccessResponse,
} from "@/lib/ai/refineGarmentSelectionSchemas";
import { cropImageToAlphaBounds } from "@/lib/studio/maskedProductCrop";
import { loadImageElement } from "@/lib/studio/productMask";
import {
  applyVisionGarmentRefinement,
  buildRoughMaskFileFromSelection,
} from "@/lib/studio/visionGarmentRefinement";

export type GarmentExtractionResult = {
  extractionFile: File;
  usedVision: boolean;
  garmentLabelRu?: string;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return loadImageElement(url).finally(() => URL.revokeObjectURL(url));
}

async function assertExtractionHasGarment(file: File): Promise<void> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! >= 32) opaque++;
  }
  const total = canvas.width * canvas.height;
  if (opaque / Math.max(1, total) < 0.002) {
    throw new Error(
      "После выделения не осталось товара. Сузьте рамку до самого предмета (трусы/лиф), без кожи, рук и всей фигуры модели."
    );
  }
}

async function fetchVisionRefinement(
  originalFile: File,
  maskedSelectionFile: File
): Promise<GarmentSelectionRefinement | null> {
  const roughMask = await buildRoughMaskFileFromSelection(maskedSelectionFile);
  const formData = new FormData();
  formData.append("productImageFile", originalFile);
  formData.append("maskImageFile", roughMask);

  const res = await fetch("/api/ai/refine-product-mask", {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as
    | RefineProductMaskSuccessResponse
    | RefineProductMaskErrorResponse;

  if (!res.ok || !data.ok) {
    return null;
  }

  if (!data.usedVision) {
    return null;
  }

  return data.refinement;
}

export async function prepareGarmentExtractionFile(input: {
  originalFile: File;
  maskedSelectionFile: File;
  onProgress?: (message: string) => void;
}): Promise<GarmentExtractionResult> {
  const { originalFile, maskedSelectionFile, onProgress } = input;

  let refinedFile = maskedSelectionFile;
  let usedVision = false;
  let garmentLabelRu: string | undefined;

  onProgress?.("Уточняем выделение…");
  try {
    const refinement = await fetchVisionRefinement(
      originalFile,
      maskedSelectionFile
    );
    if (refinement) {
      refinedFile = await applyVisionGarmentRefinement(
        originalFile,
        maskedSelectionFile,
        refinement
      );
      usedVision = true;
      garmentLabelRu = refinement.garmentLabelRu;
    }
  } catch {
    refinedFile = maskedSelectionFile;
  }

  onProgress?.("Подготавливаем фрагмент…");
  const extractionFile = await cropImageToAlphaBounds(refinedFile, 0.1);
  await assertExtractionHasGarment(extractionFile);

  return { extractionFile, usedVision, garmentLabelRu };
}
