/**
 * assets/brand/leaf.png (logo'dan çıkarılmış yaprak) → beyaz zemin favicon/icon.
 * Yaprak yoksa önce: node scripts/extract-leaf-favicon.mjs
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const leafPath = path.join(root, "assets", "brand", "leaf.png");

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
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    entries.push({
      width: width >= 256 ? 0 : width,
      height: height >= 256 ? 0 : height,
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
  if (!fs.existsSync(leafPath)) {
    console.error("Eksik:", leafPath, "— önce node scripts/extract-leaf-favicon.mjs");
    process.exit(1);
  }
  const leafPng = fs.readFileSync(leafPath);

  const icoPngs = [];
  for (const s of [16, 32, 48]) icoPngs.push(await whiteSquare(leafPng, s));
  const ico = pngsToIco(icoPngs);

  for (const dest of [
    path.join(root, "frontend", "src", "app", "favicon.ico"),
    path.join(root, "frontend", "public", "favicon.ico"),
    path.join(root, "admin", "src", "app", "favicon.ico"),
    path.join(root, "admin", "public", "favicon.ico"),
    path.join(root, "assets", "brand", "favicon.ico"),
  ]) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, ico);
    console.log("wrote", dest, ico.length);
  }

  const pngTargets = [
    [64, path.join(root, "frontend", "src", "app", "icon.png")],
    [180, path.join(root, "frontend", "src", "app", "apple-icon.png")],
    [64, path.join(root, "admin", "src", "app", "icon.png")],
    [180, path.join(root, "admin", "src", "app", "apple-icon.png")],
    [48, path.join(root, "assets", "brand", "favicon-48.png")],
  ];
  for (const [size, dest] of pngTargets) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await sharp(await whiteSquare(leafPng, size)).toFile(dest);
    console.log("wrote", dest);
  }

  for (const dest of [
    path.join(root, "frontend", "public", "leaf.png"),
    path.join(root, "admin", "public", "leaf.png"),
  ]) {
    fs.copyFileSync(leafPath, dest);
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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
