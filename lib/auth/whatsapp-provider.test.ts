import assert from "node:assert/strict";
import test from "node:test";

test("getWhatsAppProvider defaults to green", async () => {
  const prev = process.env.WHATSAPP_PROVIDER;
  delete process.env.WHATSAPP_PROVIDER;
  const { getWhatsAppProvider } = await import("@/lib/auth/whatsapp-provider");
  assert.equal(getWhatsAppProvider(), "green");
  if (prev === undefined) delete process.env.WHATSAPP_PROVIDER;
  else process.env.WHATSAPP_PROVIDER = prev;
});

test("isWhatsAppSendConfigured uses evolution env", async () => {
  const keys = [
    "WHATSAPP_PROVIDER",
    "EVOLUTION_API_URL",
    "EVOLUTION_API_KEY",
    "EVOLUTION_INSTANCE",
    "GREEN_API_INSTANCE_ID",
    "GREEN_API_TOKEN",
  ] as const;
  const prev: Record<string, string | undefined> = {};
  for (const key of keys) prev[key] = process.env[key];

  process.env.WHATSAPP_PROVIDER = "evolution";
  process.env.EVOLUTION_API_URL = "http://127.0.0.1:8080";
  process.env.EVOLUTION_API_KEY = "test-key";
  process.env.EVOLUTION_INSTANCE = "freebee_otp";
  delete process.env.GREEN_API_INSTANCE_ID;
  delete process.env.GREEN_API_TOKEN;

  const { isWhatsAppSendConfigured } = await import("@/lib/auth/whatsapp-provider");
  assert.equal(isWhatsAppSendConfigured(), true);

  for (const key of keys) {
    if (prev[key] === undefined) delete process.env[key];
    else process.env[key] = prev[key];
  }
});
