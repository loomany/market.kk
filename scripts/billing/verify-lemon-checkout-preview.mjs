import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const apiKey = env.LEMON_SQUEEZY_API_KEY;
const storeId = env.LEMON_SQUEEZY_STORE_ID;
const variantId = env.LEMON_TOKENS_VARIANT_ID;
const site = env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vitrina.help";

const custom = {
  purpose: "token_topup",
  user_id: "00000000-0000-0000-0000-000000000001",
  tokens: "10",
  amount_cents: "1000",
};

const body = {
  data: {
    type: "checkouts",
    attributes: {
      checkout_options: { embed: false, media: true, logo: true },
      checkout_data: { custom },
      product_options: {
        enabled_variants: [Number(variantId)],
        redirect_url: `${site}/ru/tokens?checkout=success`,
      },
      preview: true,
    },
    relationships: {
      store: { data: { type: "stores", id: String(storeId) } },
      variant: { data: { type: "variants", id: String(variantId) } },
    },
  },
};

const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
  method: "POST",
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify(body),
});
const json = await res.json().catch(() => null);
console.log(
  JSON.stringify(
    {
      status: res.status,
      url: json?.data?.attributes?.url ? "(present)" : null,
      errors: json?.errors?.map((e) => e.detail ?? e.title),
      customSent: custom,
    },
    null,
    2
  )
);
