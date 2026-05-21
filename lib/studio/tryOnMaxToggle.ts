/** Show Try-On Max A/B toggle only when explicitly enabled (not for end users). */
export function isTryOnMaxToggleEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TRYON_MAX_TOGGLE === "1";
}
