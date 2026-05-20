/** Show Try-On Max A/B toggle in studio step 3 (dev / explicit flag). */
export function isTryOnMaxToggleEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_TRYON_MAX_TOGGLE === "1") return true;
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") return true;
  }
  if (process.env.NEXT_PUBLIC_AI_DEBUG === "1") return true;
  return false;
}
