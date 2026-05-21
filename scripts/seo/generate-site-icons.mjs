/**

 * Generates favicon + PWA icons from assets/brand/icon-source.png (VA mark).

 * Run: npm run icons:generate

 */

import { readFile, writeFile } from "node:fs/promises";

import path from "node:path";

import { fileURLToPath } from "node:url";

import sharp from "sharp";

import toIco from "to-ico";



const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const sourceCandidates = [

  path.join(root, "assets", "brand", "icon-source-raw.png"),

  path.join(root, "assets", "brand", "icon-source.png"),

  path.join(root, "public", "icon-512.png"),

];

const publicDir = path.join(root, "public");

const appDir = path.join(root, "app");



/** Brand teal — matches theme_color / mask-icon */

const BRAND_TEAL = { r: 15, g: 118, b: 110 };



async function resolveSource() {

  const { access } = await import("node:fs/promises");

  for (const candidate of sourceCandidates) {

    try {

      await access(candidate);

      return candidate;

    } catch {

      /* try next */

    }

  }

  throw new Error(

    `No icon source found. Add assets/brand/icon-source-raw.png or icon-source.png`

  );

}



/** Exterior white (corners, padding) reachable from image border — not VA letterforms. */

function isExteriorWhite(r, g, b, a) {

  if (a < 128) return true;

  return r >= 235 && g >= 235 && b >= 235;

}



/**

 * Flood-fill white from edges → teal so rounded-icon PNGs have no white corner triangles.

 */

async function flattenExteriorWhiteToTeal(inputBuffer) {

  const { data, info } = await sharp(inputBuffer)

    .ensureAlpha()

    .raw()

    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;

  const visited = new Uint8Array(w * h);

  const queue = [];



  const sample = (x, y) => {

    const i = (y * w + x) * 4;

    return [data[i], data[i + 1], data[i + 2], data[i + 3]];

  };



  const seed = (x, y) => {

    const p = y * w + x;

    if (visited[p]) return;

    const [r, g, b, a] = sample(x, y);

    if (!isExteriorWhite(r, g, b, a)) return;

    visited[p] = 1;

    queue.push([x, y]);

  };



  for (let x = 0; x < w; x++) {

    seed(x, 0);

    seed(x, h - 1);

  }

  for (let y = 0; y < h; y++) {

    seed(0, y);

    seed(w - 1, y);

  }



  while (queue.length > 0) {

    const [x, y] = queue.pop();

    for (const [nx, ny] of [

      [x - 1, y],

      [x + 1, y],

      [x, y - 1],

      [x, y + 1],

    ]) {

      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

      const p = ny * w + nx;

      if (visited[p]) continue;

      const [r, g, b, a] = sample(nx, ny);

      if (!isExteriorWhite(r, g, b, a)) continue;

      visited[p] = 1;

      queue.push([nx, ny]);

    }

  }



  for (let y = 0; y < h; y++) {

    for (let x = 0; x < w; x++) {

      if (!visited[y * w + x]) continue;

      const i = (y * w + x) * 4;

      data[i] = BRAND_TEAL.r;

      data[i + 1] = BRAND_TEAL.g;

      data[i + 2] = BRAND_TEAL.b;

      data[i + 3] = 255;

    }

  }



  return sharp(data, { raw: { width: w, height: h, channels: 4 } })

    .png()

    .toBuffer();

}



/** Light cyan fringe left by rounded-corner anti-aliasing (not VA letter white). */

function isCornerFringe(r, g, b, a) {

  if (a < 128) return true;

  if (r >= 248 && g >= 248 && b >= 248) return false;

  if (r < 95 && g > 80 && g < 160 && b > 80 && b < 160) return false;

  const lum = (r + g + b) / 3;

  return lum >= 120 && lum <= 245;

}



async function removeCornerFringe(inputBuffer) {

  const { data, info } = await sharp(inputBuffer)

    .ensureAlpha()

    .raw()

    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;



  for (let y = 0; y < h; y++) {

    for (let x = 0; x < w; x++) {

      const i = (y * w + x) * 4;

      const r = data[i];

      const g = data[i + 1];

      const b = data[i + 2];

      const a = data[i + 3];

      if (!isCornerFringe(r, g, b, a)) continue;

      data[i] = BRAND_TEAL.r;

      data[i + 1] = BRAND_TEAL.g;

      data[i + 2] = BRAND_TEAL.b;

      data[i + 3] = 255;

    }

  }



  return sharp(data, { raw: { width: w, height: h, channels: 4 } })

    .png()

    .toBuffer();

}



async function prepareMaster(inputBuffer) {

  const meta = await sharp(inputBuffer).metadata();

  const side = Math.min(meta.width, meta.height);

  const margin = Math.max(2, Math.round(side * 0.04));

  const left = Math.round((meta.width - side) / 2) + margin;

  const top = Math.round((meta.height - side) / 2) + margin;

  const cropSize = side - margin * 2;



  let pipeline = sharp(inputBuffer).extract({

    left,

    top,

    width: cropSize,

    height: cropSize,

  });



  const flattened = await flattenExteriorWhiteToTeal(await pipeline.png().toBuffer());

  return removeCornerFringe(flattened);

}



const sizes = [

  { name: "icon-16.png", size: 16, dir: publicDir },

  { name: "icon-32.png", size: 32, dir: publicDir },

  { name: "icon-48.png", size: 48, dir: publicDir },

  { name: "icon-192.png", size: 192, dir: publicDir },

  { name: "icon-512.png", size: 512, dir: publicDir },

  { name: "apple-touch-icon.png", size: 180, dir: publicDir },

  { name: "apple-icon.png", size: 180, dir: appDir },
  { name: "icon.png", size: 32, dir: appDir },
];



async function resizePng(prepared, size) {

  return sharp(prepared)

    .resize(size, size, {

      fit: "cover",

      position: "center",

      background: { ...BRAND_TEAL, alpha: 1 },

    })

    .png({ compressionLevel: 9, adaptiveFiltering: true })

    .toBuffer();

}



async function main() {

  const source = await resolveSource();

  console.log(`source: ${source}`);

  const raw = await readFile(source);

  const prepared = await prepareMaster(raw);

  const masterPath = path.join(root, "assets", "brand", "icon-source.png");

  await writeFile(masterPath, prepared);

  console.log(`wrote ${masterPath} (teal fill, no white corners)`);



  for (const { name, size, dir } of sizes) {

    const buffer = await resizePng(prepared, size);

    const target = path.join(dir, name);

    await writeFile(target, buffer);

    console.log(`wrote ${target} (${size}x${size}, ${buffer.length} bytes)`);

  }



  const icoInputs = await Promise.all(

    [16, 32, 48].map((size) => resizePng(prepared, size))

  );

  const ico = await toIco(icoInputs);

  const faviconTargets = [

    path.join(publicDir, "favicon.ico"),

    path.join(appDir, "favicon.ico"),

  ];

  for (const target of faviconTargets) {

    await writeFile(target, ico);

    console.log(`wrote ${target} (${ico.length} bytes)`);

  }

}



main().catch((err) => {

  console.error(err);

  process.exit(1);

});


