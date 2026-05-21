import { z } from "zod";

export const normalizedBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

export const excludeRegionSchema = normalizedBoxSchema.extend({
  reason: z.string(),
});

export const garmentSelectionRefinementSchema = z.object({
  garmentPiece: z.enum([
    "bottom",
    "top",
    "full_garment",
    "accessory",
    "unknown",
  ]),
  garmentLabelRu: z.string(),
  tightGarmentBox: normalizedBoxSchema,
  excludeRegions: z.array(excludeRegionSchema),
  confidence: z.number().min(0).max(1),
  notes: z.string(),
});

export type GarmentSelectionRefinement = z.infer<
  typeof garmentSelectionRefinementSchema
>;

export type RefineProductMaskSuccessResponse = {
  ok: true;
  refinement: GarmentSelectionRefinement;
  usedVision: boolean;
  model?: string;
};

export type RefineProductMaskErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
};

/** OpenAI strict JSON schema */
export const GARMENT_SELECTION_REFINEMENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    garmentPiece: {
      type: "string",
      enum: ["bottom", "top", "full_garment", "accessory", "unknown"],
    },
    garmentLabelRu: { type: "string" },
    tightGarmentBox: {
      type: "object",
      additionalProperties: false,
      properties: {
        x: { type: "number" },
        y: { type: "number" },
        width: { type: "number" },
        height: { type: "number" },
      },
      required: ["x", "y", "width", "height"],
    },
    excludeRegions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
          reason: { type: "string" },
        },
        required: ["x", "y", "width", "height", "reason"],
      },
    },
    confidence: { type: "number" },
    notes: { type: "string" },
  },
  required: [
    "garmentPiece",
    "garmentLabelRu",
    "tightGarmentBox",
    "excludeRegions",
    "confidence",
    "notes",
  ],
} as const;

export const GARMENT_SELECTION_REFINEMENT_VISION_RULES = [
  "Image 1 is the merchant product photo (may show a model wearing the item).",
  "Image 2 is the user's rough selection mask: white/opaque = selected area, black = ignored.",
  "Identify the ONE sellable garment piece the merchant likely wants inside the selection (e.g. panties/briefs, bra, dress fabric).",
  "tightGarmentBox: normalized 0–1 box tightly around ONLY that garment fabric (not face, not hands, not bare skin, not other garments unless they are the target).",
  "excludeRegions: normalized boxes for skin, hands, fingers, hair, other clothing pieces that intersect the user mask but are NOT the target garment.",
  "If the user selected only underwear bottom, exclude bra, torso skin, hands on hips, thighs outside the brief.",
  "garmentLabelRu: short Russian label for UI (e.g. «Трусы», «Лиф»).",
  "confidence: 0–1 how sure you are about the tight box.",
] as const;
