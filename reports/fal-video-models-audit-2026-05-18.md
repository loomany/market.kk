# Fal Video Models Audit — 2026-05-18

## Scope

Проверены image-to-video кандидаты для раздела “Проработка” в Vitrina AI Studio. Real video calls не запускались.

Sources:

- Fal Kling O3 image-to-video API: https://fal.ai/models/fal-ai/kling-video/o3/standard/image-to-video/api
- Fal MiniMax Hailuo 02 Standard image-to-video API: https://fal.ai/models/fal-ai/minimax/hailuo-02/standard/image-to-video/api
- Fal Veo 3.1 image-to-video API: https://fal.ai/models/fal-ai/veo3.1/image-to-video/api
- Fal pricing docs: https://fal.ai/docs/documentation/model-apis/pricing

## Candidate 1 — Kling O3 Standard / Pro image-to-video

- Endpoint used in config: `fal-ai/kling-video/o3/standard/image-to-video`
- Type: image-to-video.
- Start image: yes. Fal schema exposes `start_image_url` for the V3-style image-to-video request and `image_url` for the generic image-to-video request.
- Duration: docs list `5` / `10` for generic image-to-video and `3` to `15` for O3/V3 image-to-video variants.
- Prompt: supported.
- Negative prompt: supported in schema.
- Audio: `generate_audio` exists; Vitrina config sets it to `false` for ecommerce clips.
- Pricing: Fal pricing is per model and can be per second for video. Current UI estimate uses `$0.084/sec`, but this must be confirmed through Fal pricing API before paid runs.
- Recommended use: premium product/model motion when product fidelity matters.

## Candidate 2 — MiniMax Hailuo 02 Standard

- Endpoint: `fal-ai/minimax/hailuo-02/standard/image-to-video`
- Type: image-to-video.
- Start image: yes, `image_url` is required.
- Prompt: required.
- Duration: `6` or `10`; docs note 10 seconds are not supported for 1080p. Current config only exposes `6` to avoid invalid combinations.
- Resolution: `512P` or `768P`.
- Prompt optimizer: supported; config enables it.
- Pricing estimate: config uses `$0.045/sec`, pending pricing API confirmation before paid runs.
- Recommended use: lower-cost short ecommerce clips.

## Candidate 3 — Veo 3.1 image-to-video

- Endpoint: `fal-ai/veo3.1/image-to-video`
- Type: image-to-video.
- Start image: yes, `image_url` is required.
- Prompt: required.
- Duration: `4s`, `6s`, `8s`.
- Aspect ratio: `auto`, `16:9`, `9:16`; UI exposes `16:9` and `9:16`.
- Resolution: `720p`, `1080p`, `4k`; config uses `720p` by default.
- Audio: supported; config sets `generate_audio: false`.
- Pricing estimate: config uses `$0.20/sec`, pending pricing API confirmation before paid runs.
- Recommended use: higher-quality vertical or widescreen clips after explicit budget approval.

## Config Added

Created `lib/ai/videoModels.ts` with typed config:

- `VIDEO_MODELS.kling`
- `VIDEO_MODELS.minimax`
- `VIDEO_MODELS.veo`

Each model includes:

- endpoint id;
- label;
- quality options;
- duration options;
- aspect ratio options;
- image-to-video support flag;
- pricing type and estimate;
- recommended use;
- `inputMapper`.

## Risk

Fal model schemas and prices can change. Before any real video batch, call Fal pricing API server-side and run one approved paid smoke per selected model.
