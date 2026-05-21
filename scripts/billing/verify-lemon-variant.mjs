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

const res = await fetch(
  `https://api.lemonsqueezy.com/v1/variants/${variantId}?include=product`,
  {
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
  }
);
const json = await res.json();
const v = json?.data?.attributes ?? {};
const product =
  json?.included?.find((x) => x.type === "products")?.attributes ?? {};
console.log(
  JSON.stringify(
    {
      httpStatus: res.status,
      variantId: json?.data?.id,
      name: v.name,
      price: v.price,
      status: v.status,
      is_subscription: v.is_subscription,
      slug: v.slug,
      storeIdExpected: storeId,
      productName: product.name,
      productId: json?.included?.find((x) => x.type === "products")?.id,
    },
    null,
    2
  )
);
