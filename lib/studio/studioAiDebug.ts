/** Dev / power-user studio controls (?debug=1 or NEXT_PUBLIC_AI_DEBUG=1). */
export function isStudioAiDebugEnabled(): boolean {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") return true;
  }
  if (process.env.NEXT_PUBLIC_AI_DEBUG === "1") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}
