import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

export type GarmentMaskStrategy = "full_white" | "center_product_zone";

export type GarmentMaskOptions = {
  strategy?: GarmentMaskStrategy;
  /** Inset from each edge for center_product_zone (0.05 = 5%). */
  marginRatio?: number;
};

/**
 * Read width/height from JPEG or PNG buffer (no extra dependencies).
 */
export function readImageDimensions(
  buffer: Buffer,
  contentType?: string | null
): { width: number; height: number } {
  const isPng =
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  if (isPng || contentType?.includes("png")) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }

  throw new Error("Could not read image dimensions for garment preparation mask");
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]!;
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/**
 * Grayscale mask PNG: white = edit region, black = preserve (FASHN Edit semantics).
 */
export function createGarmentPreparationMaskPng(
  width: number,
  height: number,
  options?: GarmentMaskOptions
): Buffer {
  const strategy = options?.strategy ?? "center_product_zone";
  const marginRatio = options?.marginRatio ?? 0.05;

  const x0 =
    strategy === "full_white"
      ? 0
      : Math.floor(width * marginRatio);
  const y0 =
    strategy === "full_white"
      ? 0
      : Math.floor(height * marginRatio);
  const x1 =
    strategy === "full_white"
      ? width
      : Math.ceil(width * (1 - marginRatio));
  const y1 =
    strategy === "full_white"
      ? height
      : Math.ceil(height * (1 - marginRatio));

  const rowSize = 1 + width;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const inZone = x >= x0 && x < x1 && y >= y0 && y < y1;
      raw[rowStart + 1 + x] = inZone ? 255 : 0;
    }
  }

  const compressed = deflateSync(raw);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 0;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

export function garmentMaskDebugFilename(
  width: number,
  height: number,
  strategy: GarmentMaskStrategy
): string {
  const hash = createHash("sha256")
    .update(`${width}x${height}:${strategy}`)
    .digest("hex")
    .slice(0, 8);
  return `garment-prep-mask-${width}x${height}-${strategy}-${hash}.png`;
}
