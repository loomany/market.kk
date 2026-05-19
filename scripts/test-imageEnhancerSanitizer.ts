/**
 * Regression checks for image post-processing enhancer output sanitizer.
 * Run: npm run test:image-sanitizer
 */
import assert from "node:assert/strict";
import { sanitizeImageEnhancerOutputText } from "../lib/studio/imageEnhancerOutputSanitizer.ts";

function assertNoVideoLeak(text: string, label: string) {
  const banned = [
    /\breels\b/i,
    /\bvideo\b/i,
    /\bseconds?\b/i,
    /\bmotion\b(?!\s*blur\b)/i,
    /\bfps\b/i,
    /\banimate/i,
    /\bcamera movement/i,
    /push-in/i,
  ];
  for (const re of banned) {
    assert.ok(
      !re.test(text),
      `${label}: expected no match for ${re} in:\n${text}`
    );
  }
}

// A) Image + FLUX-style leak
{
  const raw =
    "Vertical Reels 9:16, 6–8 seconds, slow push-in. Place same woman near window.";
  const out = sanitizeImageEnhancerOutputText(raw);
  assertNoVideoLeak(out, "A");
  assert.match(out, /window|near/i);
}

// C) Image + Nano-style leak
{
  const raw =
    "Premium product shot, 5–7 seconds TikTok motion, subtle camera pan.";
  const out = sanitizeImageEnhancerOutputText(raw);
  assertNoVideoLeak(out, "C");
}

// D) User pasted video words — sanitizer strips from enhancer output
{
  const raw =
    "Animate the dress, 10 seconds Reels vertical video with fps 30.";
  const out = sanitizeImageEnhancerOutputText(raw);
  assertNoVideoLeak(out, "D");
}

// motion blur preserved
{
  const raw = "Keep motion blur on background lights, cinematic bokeh.";
  const out = sanitizeImageEnhancerOutputText(raw);
  assert.match(out, /motion blur/i);
}

// B) When sanitizer runs on a video-style string, it strips (video route must not call it)
{
  const raw = "Vertical Reels 9:16, 6 seconds slow motion for TikTok.";
  const stripped = sanitizeImageEnhancerOutputText(raw);
  assert.ok(!/\breels\b/i.test(stripped), "B: sanitizer strips reels when applied");
}

console.log("test:image-sanitizer — ok");
