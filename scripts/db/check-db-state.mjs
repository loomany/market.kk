import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

const tables = [
  "profiles",
  "studio_projects",
  "studio_assets",
  "generation_jobs",
  "auth_codes",
  "user_token_balances",
  "token_transactions",
];

for (const t of tables) {
  const { error } = await sb.from(t).select("*", { count: "exact", head: true });
  console.log(t, error ? `MISSING: ${error.code} ${error.message}` : "exists");
}

const { data: rpc, error: rpcErr } = await sb.rpc("credit_purchased_tokens", {
  p_user_id: "00000000-0000-0000-0000-000000000000",
  p_tokens: 0,
  p_amount_cents: 0,
  p_currency: "USD",
  p_provider: "test",
  p_provider_order_id: null,
  p_provider_checkout_id: null,
  p_provider_event_id: null,
});
console.log(
  "credit_purchased_tokens rpc",
  rpcErr ? `${rpcErr.code} ${rpcErr.message}` : "callable"
);

const { error: spendErr } = await sb.rpc("spend_user_tokens", {
  p_user_id: "00000000-0000-0000-0000-000000000000",
  p_tokens: 0,
});
console.log(
  "spend_user_tokens rpc",
  spendErr ? `${spendErr.code} ${spendErr.message}` : "callable"
);
