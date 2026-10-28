/**
 * Logo PNG'deki gerçek üç yaprağı çıkarır; beyaz zeminli favicon/icon üretir.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const LOGO_CANDIDATES = [
  path.join(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-adorr-Downloads-herballife/assets/logo-9d7943f0-722e97d5-b8d0-4827-b862-0c958193999f.png",
  ),
  path.join(root, "assets", "brand", "logo-source.png"),
];

function findLogo() {
  for (const p of LOGO_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Logo PNG bulunamadı");
}

function isGreen(r, g, b, a) {
  return a >= 40 && g > 50 && g > r + 12 && g > b + 12;
}

async function findLeafBBox(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const x0 = Math.floor(width * 0.45);
  const x1 = Math.floor(width * 0.75);
  const y0 = 0;
  const y1 = Math.floor(height * 0.4);

  const visited = new Uint8Array(width * height);
  const clusters = [];

  const idx = (x, y) => y * width + x;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = idx(x, y);
      if (visited[p]) continue;
      const i = p * channels;
      if (!isGreen(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;

      const q = [p];
      visited[p] = 1;
      let minX = x,
        maxX = x,
        minY = y,
        maxY = y,
        count = 0;
      while (q.length) {
        const cur = q.pop();
        const cx = cur % width;
        const cy = (cur / width) | 0;
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < x0 || nx >= x1 || ny < y0 || ny >= y1) continue;
          const np = idx(nx, ny);
          if (visited[np]) continue;
          const ni = np * channels;
          if (!isGreen(data[ni], data[ni + 1], data[ni + 2], data[ni + 3]))
            continue;
          visited[np] = 1;
          q.push(np);
        }
      }
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      clusters.push({ minX, maxX, minY, maxY, count, bw, bh });
    }
  }

  // Dikey ayırıcı: çok ince ve uzun
  const divider = clusters.find((c) => c.bw <= 10 && c.bh > 80);
  const dividerX = divider ? divider.minX : Math.floor(width * 0.65);

  // Üç yaprak: ayırıcının solunda, harflerden yukarıda, orta boy ayrı parçalar
  const leaves = clusters.filter(
    (c) =>
      c.maxX < dividerX - 8 &&
      c.minY < 80 &&
      c.maxY < 130 &&
      c.count >= 200 &&
      c.count <= 2500 &&
      c.bw >= 25 &&
      c.bw <= 70 &&
      c.bh >= 30 &&
      c.bh <= 80,
  );

  if (leaves.length < 1) {
    throw new Error(
      `Yaprak kümesi bulunamadı (dividerX=${dividerX}, clusters=${clusters.length})`,
    );
  }

  const minX = Math.min(...leaves.map((c) => c.minX));
  const maxX = Math.max(...leaves.map((c) => c.maxX));
  const minY = Math.min(...leaves.map((c) => c.minY));
  const maxY = Math.max(...leaves.map((c) => c.maxY));

  const pad = 8;
  return {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: Math.min(width - Math.max(0, minX - pad), maxX - minX + 1 + pad * 2),
    height: Math.min(
      height - Math.max(0, minY - pad),
      maxY - minY + 1 + pad * 2,
    ),
    leaves,
    _meta: { dividerX, leafCount: leaves.length, leaves },
  };
}

/** Sadece üç yaprak piksellerini tut; harf kalıntısı + siyah → şeffaf */
async function leafOnTransparent(srcPath, bbox, leaves) {
  const { data, info } = await sharp(srcPath)
    .extract(bbox)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * channels);

  // Yaprak bbox'larının birleşimi (kaynak koordinat → extract lokal)
  const keep = (gx, gy) =>
    leaves.some(
      (L) =>
        gx >= L.minX - 1 &&
        gx <= L.maxX + 1 &&
        gy >= L.minY - 1 &&
        gy <= L.maxY + 1,
    );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const a = data[o + 3];
      const gx = bbox.left + x;
      const gy = bbox.top + y;
      if (r < 25 && g < 25 && b < 25) {
        out[o] = 0;
        out[o + 1] = 0;
        out[o + 2] = 0;
        out[o + 3] = 0;
        continue;
      }
      if (isGreen(r, g, b, a) && keep(gx, gy)) {
        out[o] = r;
        out[o + 1] = g;
        out[o + 2] = b;
        out[o + 3] = 255;
      } else {
        out[o] = 0;
        out[o + 1] = 0;
        out[o + 2] = 0;
        out[o + 3] = 0;
      }
    }
  }

  // Trim şeffaf kenarlar
  return sharp(out, { raw: { width, height, channels } })
    .png()
    .trim()
    .toBuffer();
}

async function whiteSquare(leafPng, size) {
  const meta = await sharp(leafPng).metadata();
  const pad = Math.round(size * 0.14);
  const inner = size - pad * 2;
  const scale = Math.min(inner / meta.width, inner / meta.height);
  const w = Math.max(1, Math.round(meta.width * scale));
  const h = Math.max(1, Math.round(meta.height * scale));
  const resized = await sharp(leafPng)
    .resize(w, h, { fit: "inside" })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.floor((size - w) / 2),
        top: Math.floor((size - h) / 2),
      },
    ])
    .png()
    .toBuffer();
}

function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const png of pngBuffers) {
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    entries.push({
      width: w >= 256 ? 0 : w,
      height: h >= 256 ? 0 : h,
      size: png.length,
      offset,
      png,
    });
    offset += png.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  let entryPos = 6;
  for (const e of entries) {
    out.writeUInt8(e.width, entryPos);
    out.writeUInt8(e.height, entryPos + 1);
    out.writeUInt8(0, entryPos + 2);
    out.writeUInt8(0, entryPos + 3);
    out.writeUInt16LE(1, entryPos + 4);
    out.writeUInt16LE(32, entryPos + 6);
    out.writeUInt32LE(e.size, entryPos + 8);
    out.writeUInt32LE(e.offset, entryPos + 12);
    entryPos += 16;
  }
  for (const e of entries) e.png.copy(out, e.offset);
  return out;
}

async function main() {
  const src = findLogo();
  console.log("logo:", src);

  const { _meta, leaves, ...bbox } = await findLeafBBox(src);
  console.log("bbox:", bbox);
  console.log("meta:", JSON.stringify(_meta, null, 2));

  const brandDir = path.join(root, "assets", "brand");
  fs.mkdirSync(brandDir, { recursive: true });

  // Kaynak logoyu da sakla
  fs.copyFileSync(src, path.join(brandDir, "logo-source.png"));

  const cropped = await sharp(src).extract(bbox).png().toBuffer();
  await sharp(cropped).toFile(path.join(brandDir, "leaf-crop-raw.png"));

  const leafPng = await leafOnTransparent(src, bbox, leaves);
  await sharp(leafPng).toFile(path.join(brandDir, "leaf.png"));
  await sharp(await whiteSquare(leafPng, 256)).toFile(
    path.join(brandDir, "leaf-preview.png"),
  );

  const icoPngs = [];
  for (const s of [16, 32, 48]) icoPngs.push(await whiteSquare(leafPng, s));
  const ico = pngsToIco(icoPngs);
  const icon64 = await whiteSquare(leafPng, 64);
  const apple180 = await whiteSquare(leafPng, 180);
  const icon192 = await whiteSquare(leafPng, 192);

  for (const dest of [
    path.join(root, "frontend", "src", "app", "favicon.ico"),
    path.join(root, "frontend", "public", "favicon.ico"),
    path.join(root, "admin", "src", "app", "favicon.ico"),
    path.join(root, "admin", "public", "favicon.ico"),
    path.join(root, "assets", "brand", "favicon.ico"),
  ]) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, ico);
    console.log("wrote", dest);
  }

  for (const [buf, dest] of [
    [icon64, path.join(root, "frontend", "src", "app", "icon.png")],
    [apple180, path.join(root, "frontend", "src", "app", "apple-icon.png")],
    [icon64, path.join(root, "admin", "src", "app", "icon.png")],
    [apple180, path.join(root, "admin", "src", "app", "apple-icon.png")],
    [
      await whiteSquare(leafPng, 48),
      path.join(root, "assets", "brand", "favicon-48.png"),
    ],
    [icon192, path.join(root, "assets", "brand", "icon-192.png")],
  ]) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await sharp(buf).toFile(dest);
    console.log("wrote", dest);
  }

  for (const dest of [
    path.join(root, "frontend", "public", "leaf.png"),
    path.join(root, "admin", "public", "leaf.png"),
  ]) {
    await sharp(leafPng).toFile(dest);
    console.log("wrote", dest);
  }

  for (const dyn of [
    path.join(root, "admin", "src", "app", "icon.tsx"),
    path.join(root, "admin", "src", "app", "apple-icon.tsx"),
  ]) {
    if (fs.existsSync(dyn)) {
      fs.unlinkSync(dyn);
      console.log("removed", dyn);
    }
  }

  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
