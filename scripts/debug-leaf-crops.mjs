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

const m = await sharp(src).metadata();
fs.writeFileSync(
  path.join(out, "meta.txt"),
  `${m.width}x${m.height}\n`,
);

await sharp(src)
  .extract({ left: 0, top: 0, width: m.width, height: Math.min(220, m.height) })
  .png()
  .toFile(path.join(out, "top.png"));

const crops = [
  [400, 0, 280, 200],
  [480, 0, 200, 180],
  [520, 0, 160, 160],
  [560, 0, 120, 150],
  [580, 0, 100, 140],
  [500, 5, 140, 120],
  [530, 5, 110, 110],
];
for (const [l, t, w, h] of crops) {
  await sharp(src)
    .extract({ left: l, top: t, width: w, height: h })
    .png()
    .toFile(path.join(out, `c${l}.png`));
}
fs.writeFileSync(path.join(out, "done.txt"), "ok\n");
