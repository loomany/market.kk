import { z } from "zod";

export const generateModelRequestSchema = z.object({
  gender: z.enum(["female", "male"]).default("female"),
  bodyType: z.enum(["standard", "plus-size", "slim"]).default("standard"),
  ageGroup: z.enum(["adult"]).default("adult"),
  pose: z.enum(["front", "slight-angle"]).default("front"),
  crop: z.enum(["full-body", "upper-body"]).default("full-body"),
  background: z.enum(["white", "light-gray", "studio"]).default("white"),
  categoryContext: z
    .enum(["general", "clothing", "lingerie", "jewelry"])
    .default("clothing"),
  aspectRatio: z.enum(["1:1", "3:4", "4:5", "2:3"]).default("3:4"),
  outputFormat: z.enum(["png", "jpeg", "webp"]).default("png"),
  resolution: z.enum(["0.5K", "1K", "2K"]).default("1K"),
  numImages: z.number().int().min(1).max(4).default(1),
  seed: z.number().int().optional(),
  customDescription: z.string().trim().max(1000).optional(),
});

export type GenerateModelRequest = z.infer<typeof generateModelRequestSchema>;

export type GenerateModelImage = {
  url: string;
  width?: number;
  height?: number;
};

export type GenerateModelSuccessResponse = {
  ok: true;
  provider: string;
  model: string;
  images: GenerateModelImage[];
  requestId: string;
  promptPreview: string;
  description?: string;
};

export type GenerateModelErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
  issues?: z.ZodIssue[];
};

export type GenerateModelResponse =
  | GenerateModelSuccessResponse
  | GenerateModelErrorResponse;
