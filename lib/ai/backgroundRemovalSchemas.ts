import { z } from "zod";
import { validateImageFile } from "@/lib/ai/imageConstraints";
import { normalizeTryOnFormValue } from "@/lib/ai/falSchemas";

export const removeBackgroundRequestSchema = z.object({
  imageUrl: z.string().min(1).optional(),
  provider: z.enum(["bria"]).default("bria"),
  syncMode: z.boolean().default(false),
});

export type RemoveBackgroundFormPayload = {
  imageUrl?: string;
  imageFile: File | null;
  provider: "bria";
  syncMode: boolean;
};

function getFileFromFormData(
  formData: FormData,
  fieldName: string
): File | null {
  const entry = formData.get(fieldName);
  if (entry instanceof File && entry.size > 0) {
    return entry;
  }
  return null;
}

export function buildRemoveBackgroundFormPayload(
  formData: FormData
): RemoveBackgroundFormPayload {
  const imageFile = getFileFromFormData(formData, "imageFile");
  const imageUrl = normalizeTryOnFormValue(formData.get("imageUrl"));

  if (!imageFile && !imageUrl) {
    throw new Error("Image file or URL is required.");
  }

  if (imageFile) {
    validateImageFile(imageFile, "Image");
  }

  return {
    imageUrl,
    imageFile,
    provider: "bria",
    syncMode: formData.get("syncMode") === "true",
  };
}

export type RemoveBackgroundRequest = z.infer<
  typeof removeBackgroundRequestSchema
>;

export type BackgroundRemovedImage = {
  url: string;
  width?: number;
  height?: number;
  content_type?: string;
  file_name?: string;
  file_size?: number;
};

export type RemoveBackgroundSuccessResponse = {
  ok: true;
  provider: "mock" | "fal";
  model: string;
  image: BackgroundRemovedImage;
  requestId?: string;
};

export type RemoveBackgroundErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
  issues?: z.ZodIssue[];
};

export type RemoveBackgroundResponse =
  | RemoveBackgroundSuccessResponse
  | RemoveBackgroundErrorResponse;
