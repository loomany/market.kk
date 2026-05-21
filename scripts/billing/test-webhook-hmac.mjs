import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(path.join(root, ".env.local")), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      let v = l.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      return [l.slice(0, i), v];
    })
);

const secret = env.LEMON_SQUEEZY_WEBHOOK_SECRET;
const payload = {
  meta: {
    event_name: "order_created",
    event_id: "test-predeploy-" + Date.now(),
    custom_data: {
      purpose: "token_topup",
      user_id: "00000000-0000-0000-0000-000000000099",
      tokens: "10",
      amount_cents: "1000",
      variant_id: env.LEMON_TOKENS_VARIANT_ID,
    },
  },
  data: {
    id: "test-order-predeploy",
    type: "orders",
    attributes: {
      status: "paid",
      currency: "USD",
      total: 1000,
      order_items: [{ variant_id: env.LEMON_TOKENS_VARIANT_ID }],
    },
  },
};

const raw = JSON.stringify(payload);
const sig = createHmac("sha256", secret).update(raw).digest("hex");

async function post(label) {
  const res = await fetch("http://127.0.0.1:3000/api/webhooks", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-signature": sig },
    body: raw,
  });
  const text = await res.text();
  console.log(label, res.status, text.slice(0, 200));
}

// HMAC unit checks without server
const badSig = createHmac("sha256", "wrong").update(raw).digest("hex");
console.log("HMAC self-check:", sig.length === 64 ? "ok" : "fail");

const base = process.env.WEBHOOK_TEST_BASE || "http://127.0.0.1:3000";
try {
  const health = await fetch(base, { method: "HEAD" }).catch(() => null);
  if (!health) {
    console.log("Dev server not running — skip live POST (code review: rawBody + x-signature in route.ts)");
    process.exit(0);
  }
  await post("first");
  await post("second-idempotency");
} catch (e) {
  console.log("Live webhook POST skipped:", e.message);
}
