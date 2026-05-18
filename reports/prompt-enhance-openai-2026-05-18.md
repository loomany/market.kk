# Prompt Enhance OpenAI Report — 2026-05-18

## Scope

Added server-side prompt enhancement for Vitrina AI Studio. OpenAI real calls were not run.

Sources:

- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI structured outputs guide: https://platform.openai.com/docs/guides/structured-outputs

## Route

`POST /api/ai/prompt/enhance`

Body:

```json
{
  "context": "model-description | product-shot | video | background | scene",
  "userPrompt": "...",
  "sourceImageDescription": "...",
  "targetPlatform": "marketplace | instagram | reels | catalog",
  "language": "ru"
}
```

Response:

```json
{
  "ok": true,
  "originalPrompt": "...",
  "enhancedPrompt": "...",
  "negativePrompt": "...",
  "safetyNotes": "...",
  "suggestions": []
}
```

## Implementation

- Reads `OPENAI_API_KEY` server-side only.
- Uses `OPENAI_PROMPT_MODEL`, default `gpt-5.5`.
- Uses Responses API with structured JSON output.
- Sets `store: false`.
- Does not log full private prompts.
- In demo mode or without `OPENAI_API_KEY`, returns a mock enhanced prompt.

## UI

Button “Усилить промт” added in:

- AI model description.
- Проработка: video, background, scene prompts.

The user must confirm:

- `Применить`;
- `Оставить мой`;
- edit manually in the textarea.

No generation starts automatically after prompt enhancement.

## Safety Rules

- Do not invent product details.
- Preserve product identity.
- For marketplace: no fake claims, logos, text, or watermark.
- For video: include motion/camera/fidelity instructions.
- For clothing model: adult only, non-explicit, commercial catalog style.

## Not Done

- No OpenAI paid calls were run.
- Prompt history consent UI is not implemented yet.
