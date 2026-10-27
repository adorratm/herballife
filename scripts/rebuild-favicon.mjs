import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'frontend/public/brand/favicon.jpg');

async function rgbaPng(size) {
  return sharp(src)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function pngToIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  let offset = 6 + count * 16;
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    entries.push({ size: sizes[i], data: pngBuffers[i], offset });
    offset += pngBuffers[i].length;
  }
  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);
  let p = 6;
  for (const e of entries) {
    buf.writeUInt8(e.size >= 256 ? 0 : e.size, p);
    buf.writeUInt8(e.size >= 256 ? 0 : e.size, p + 1);
    buf.writeUInt8(0, p + 2);
    buf.writeUInt8(0, p + 3);
    buf.writeUInt16LE(1, p + 4);
    buf.writeUInt16LE(32, p + 6);
    buf.writeUInt32LE(e.data.length, p + 8);
    buf.writeUInt32LE(e.offset, p + 12);
    e.data.copy(buf, e.offset);
    p += 16;
  }
  return buf;
}

const p16 = await rgbaPng(16);
const p32 = await rgbaPng(32);
const p48 = await rgbaPng(48);
const p64 = await rgbaPng(64);
const p180 = await rgbaPng(180);

for (const [name, buf] of [
  ['16', p16],
  ['32', p32],
  ['48', p48],
]) {
  const meta = await sharp(buf).metadata();
  if (meta.channels !== 4 || !meta.hasAlpha) {
    throw new Error(`${name}px PNG is not RGBA: channels=${meta.channels}`);
  }
  console.log(`ok ${name}px RGBA`);
}

const ico = pngToIco([p16, p32, p48], [16, 32, 48]);
const targets = [
  path.join(root, 'frontend/src/app/favicon.ico'),
  path.join(root, 'frontend/public/favicon.ico'),
  path.join(root, 'assets/brand/favicon.ico'),
];
for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, ico);
  console.log('wrote', t, ico.length);
}

await sharp(p64).toFile(path.join(root, 'frontend/src/app/icon.png'));
await sharp(p180).toFile(path.join(root, 'frontend/src/app/apple-icon.png'));
console.log('wrote icon.png + apple-icon.png');
