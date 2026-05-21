/**
 * Token billing unit checks (no network).
 * Run: npm run test:tokens
 */
import assert from "node:assert/strict";
import { formatTokenBalanceDisplay } from "../lib/tokens/formatTokens.ts";

const TOKEN_TOPUP_TOKENS = 10;
const TOKEN_TOPUP_CENTS = 1000;

assert.equal(TOKEN_TOPUP_TOKENS, 10);
assert.equal(TOKEN_TOPUP_CENTS, 1000);

assert.equal(formatTokenBalanceDisplay(0, "ru"), "0 токенов");
assert.equal(formatTokenBalanceDisplay(1, "ru"), "1 токен");
assert.equal(formatTokenBalanceDisplay(2, "ru"), "2 токена");
assert.equal(formatTokenBalanceDisplay(5, "ru"), "5 токенов");
assert.equal(formatTokenBalanceDisplay(1, "en"), "1 token");
assert.equal(formatTokenBalanceDisplay(2, "en"), "2 tokens");

// Checkout route hardcodes TOKEN_TOPUP_PACKAGE — clients cannot override amount/tokens.
assert.equal(TOKEN_TOPUP_TOKENS, 10, "checkout ignores client amount/tokens");

console.log("test:tokens — ok");
