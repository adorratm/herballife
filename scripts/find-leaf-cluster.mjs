import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-adorr-Downloads-herballife/assets/logo-9d7943f0-722e97d5-b8d0-4827-b862-0c958193999f.png",
);
const out = path.join(root, "assets", "brand", "_debug");
fs.mkdirSync(out, { recursive: true });

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

function isGreen(i) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  return a >= 40 && g > 50 && g > r + 12 && g > b + 12;
}

// ROI: Herbalife sonrası üst bant
const x0 = Math.floor(width * 0.45);
const x1 = Math.floor(width * 0.75);
const y0 = 0;
const y1 = Math.floor(height * 0.4);

const visited = new Uint8Array(width * height);
const clusters = [];

function idx(x, y) {
  return y * width + x;
}

for (let y = y0; y < y1; y++) {
  for (let x = x0; x < x1; x++) {
    const p = idx(x, y);
    if (visited[p]) continue;
    const i = p * channels;
    if (!isGreen(i)) continue;

    // BFS
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
        if (!isGreen(np * channels)) continue;
        visited[np] = 1;
        q.push(np);
      }
    }
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    clusters.push({ minX, maxX, minY, maxY, count, bw, bh, aspect: bw / bh });
  }
}

clusters.sort((a, b) => b.count - a.count);
const lines = clusters.slice(0, 20).map(
  (c, i) =>
    `${i}: count=${c.count} box=${c.minX},${c.minY} ${c.bw}x${c.bh} aspect=${c.aspect.toFixed(2)}`,
);
fs.writeFileSync(path.join(out, "clusters.txt"), lines.join("\n") + "\n");
console.log(lines.join("\n"));

// Yaprak: orta boy, aspect ~0.7-1.4, divider değil (çok ince uzun)
const leafish = clusters.filter(
  (c) =>
    c.count >= 80 &&
    c.bw >= 20 &&
    c.bh >= 20 &&
    c.bw < 120 &&
    c.bh < 120 &&
    c.aspect > 0.5 &&
    c.aspect < 2.0 &&
    !(c.bw <= 6 && c.bh > 40),
);
console.log("\nleafish:", leafish.length);
for (const c of leafish.slice(0, 10)) {
  console.log(c);
  const pad = 6;
  const box = {
    left: Math.max(0, c.minX - pad),
    top: Math.max(0, c.minY - pad),
    width: c.bw + pad * 2,
    height: c.bh + pad * 2,
  };
  await sharp(src)
    .extract(box)
    .png()
    .toFile(path.join(out, `cluster-${c.minX}-${c.minY}.png`));
}

// Ayrıca üç yaprak ayrı cluster olabilir — yakın olanları birleştir
if (leafish.length >= 1) {
  let minX = Math.min(...leafish.map((c) => c.minX));
  let maxX = Math.max(...leafish.map((c) => c.maxX));
  let minY = Math.min(...leafish.map((c) => c.minY));
  let maxY = Math.max(...leafish.map((c) => c.maxY));
  // Sadece üst-orta gruptaki (divider'dan solda, harften sağda)
  // En büyük leafish cluster'ın etrafındaki 80px
  const main = leafish[0];
  const near = leafish.filter(
    (c) =>
      Math.abs(c.minX - main.minX) < 80 &&
      Math.abs(c.minY - main.minY) < 80,
  );
  minX = Math.min(...near.map((c) => c.minX));
  maxX = Math.max(...near.map((c) => c.maxX));
  minY = Math.min(...near.map((c) => c.minY));
  maxY = Math.max(...near.map((c) => c.maxY));
  const pad = 8;
  const box = {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: maxX - minX + 1 + pad * 2,
    height: maxY - minY + 1 + pad * 2,
  };
  console.log("\nmerged leaf box", box, "from", near.length, "clusters");
  await sharp(src)
    .extract(box)
    .png()
    .toFile(path.join(out, "merged-leaf.png"));
  fs.writeFileSync(
    path.join(out, "merged-box.json"),
    JSON.stringify(box, null, 2),
  );
}
