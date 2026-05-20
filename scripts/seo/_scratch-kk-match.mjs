import fs from "node:fs";
const s = fs.readFileSync("c:/dev/kaspi/scripts/seo/gen-kk-blog-bodies-a.mjs", "utf8");
const re = /\u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430[\u0410-\u044f\u0492-\u0493\u0401\u0451]*/gu;
console.log([...new Set([...s.matchAll(re)].map((x) => x[0]))].sort().join("\n"));
