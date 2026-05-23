/** Tell header balance pill to refetch after a billed generation completes. */
export function notifyTokenBalanceChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("vitrina-tokens-changed"));
}
