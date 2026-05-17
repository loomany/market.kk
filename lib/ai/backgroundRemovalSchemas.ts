import { z } from "zod";

export const removeBackgroundRequestSchema = z.object({
  imageUrl: z.string().min(1),
  provider: z.enum(["bria"]).default("bria"),
  syncMode: z.boolean().default(false),
});

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
