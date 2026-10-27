import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function knockOutBlack(inputPath, outputPath, threshold = 45) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    if (
      data[i] <= threshold &&
      data[i + 1] <= threshold &&
      data[i + 2] <= threshold
    ) {
      data[i + 3] = 0;
    }
  }

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * ch;
      if (data[i + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  let pipeline = sharp(data, {
    raw: { width: info.width, height: info.height, channels: ch },
  });
  if (maxX >= minX && maxY >= minY) {
    const pad = 4;
    const left = Math.max(0, minX - pad);
    const top = Math.max(0, minY - pad);
    const width = Math.min(info.width - left, maxX - minX + 1 + pad * 2);
    const height = Math.min(info.height - top, maxY - minY + 1 + pad * 2);
    pipeline = pipeline.extract({ left, top, width, height });
  }

  await pipeline.png().toFile(outputPath);
  const meta = await sharp(outputPath).metadata();
  console.log(
    `wrote ${outputPath} (${meta.width}x${meta.height}, ${fs.statSync(outputPath).size}b)`,
  );
}

const brand = path.join(root, "frontend", "public", "brand");
const assets = path.join(root, "assets", "brand");
fs.mkdirSync(assets, { recursive: true });

await knockOutBlack(path.join(brand, "logo.jpg"), path.join(brand, "logo.png"));
await knockOutBlack(
  path.join(brand, "logo-source.png"),
  path.join(brand, "logo-source-transparent.png"),
);
fs.copyFileSync(path.join(brand, "logo.png"), path.join(assets, "logo.png"));
console.log("done");
