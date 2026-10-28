#!/usr/bin/env node
/**
 * Mevcut yerel marka + ürün görsellerini WebP'ye çevirip S3'e yükler.
 *
 * Kullanım (kök dizinde, .env içinde AWS_* dolu):
 *   node scripts/migrate-images-to-s3-webp.mjs            # yükle
 *   node scripts/migrate-images-to-s3-webp.mjs --dry-run  # sadece listele/çevir, yükleme yok
 *
 * Kaynaklar → S3 klasörü:
 *   frontend/public/brand/*            → brand/
 *   frontend/public/images/brand/*     → brand/
 *   assets/brand/*                     → brand/
 *   frontend/public/images/products/*  → products/
 *   frontend/public/images/cutouts/*   → cutouts/
 *   api/uploads/*, uploads/*           → media/   (varsa)
 *   assets/*                           → assets/  (brand dışı, varsa)
 *
 * GIF ve SVG dönüştürülmez, olduğu gibi yüklenir. Sonuç URL'leri ekrana ve
 * scripts/.migrated-images.json dosyasına yazılır.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { basename, dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

loadEnv({ path: join(root, ".env") });
loadEnv({ path: join(root, "api", ".env") });

const DRY_RUN = process.argv.includes("--dry-run");
const QUALITY = 82;

const region = process.env.AWS_REGION || "eu-central-1";
const bucket = (process.env.AWS_S3_BUCKET || "").trim();
const accessKey = process.env.AWS_ACCESS_KEY_ID || "";
const secretKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const cdnUrl = (process.env.AWS_CDN_URL || process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/$/, "");

const s3 =
  !DRY_RUN && bucket && accessKey && secretKey
    ? new S3Client({ region, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } })
    : null;

if (!s3 && !DRY_RUN) {
  console.error(
    "AWS yapılandırması eksik (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET). " +
      "Yükleme yapılmadı; sadece kuru çalıştırma için --dry-run kullanın.",
  );
  process.exit(1);
}

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg", ".tiff"]);

/** [yerel dizin, S3 klasörü, özyinelemeli mi] */
const SOURCES = [
  [join(root, "frontend", "public", "brand"), "brand", false],
  [join(root, "frontend", "public", "images", "brand"), "brand", false],
  [join(root, "assets", "brand"), "brand", false],
  [join(root, "frontend", "public", "images", "products"), "products", true],
  [join(root, "frontend", "public", "images", "cutouts"), "cutouts", true],
  [join(root, "api", "uploads"), "media", true],
  [join(root, "uploads"), "media", true],
  [join(root, "assets"), "assets", false],
];

function listFiles(dir, recursive) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (recursive) out.push(...listFiles(full, true));
    } else if (IMAGE_EXT.has(extname(name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function publicUrl(key) {
  return cdnUrl ? `${cdnUrl}/${key}` : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function toUploadPayload(file) {
  const ext = extname(file).toLowerCase();
  const base = basename(file, extname(file));
  const input = readFileSync(file);
  if (ext === ".gif" || ext === ".svg") {
    return {
      body: input,
      contentType: ext === ".gif" ? "image/gif" : "image/svg+xml",
      name: `${slug(base)}${ext}`,
    };
  }
  const body = await sharp(input, { animated: true }).rotate().webp({ quality: QUALITY }).toBuffer();
  return { body, contentType: "image/webp", name: `${slug(base)}.webp` };
}

const seen = new Set();
const results = [];
let failed = 0;

console.log(
  DRY_RUN ? "DRY RUN — S3'e yükleme yok" : `S3 → s3://${bucket} (${region})${cdnUrl ? ` · CDN ${cdnUrl}` : ""}`,
);

for (const [dir, folder, recursive] of SOURCES) {
  const files = listFiles(dir, recursive);
  if (files.length === 0) continue;
  console.log(`\n# ${relative(root, dir)} → ${folder}/ (${files.length} dosya)`);

  for (const file of files) {
    try {
      const { body, contentType, name } = await toUploadPayload(file);
      const key = `${folder}/${name}`;
      if (seen.has(key)) {
        console.log(`  - atlandı (aynı anahtar): ${key}`);
        continue;
      }
      seen.add(key);

      if (s3) {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );
      }
      const url = publicUrl(key);
      const before = statSync(file).size;
      console.log(`  ✓ ${relative(root, file)} (${before} B) → ${key} (${body.length} B)\n    ${url}`);
      results.push({ source: relative(root, file).replace(/\\/g, "/"), key, url, bytes: body.length });
    } catch (err) {
      failed += 1;
      console.error(`  ✗ ${relative(root, file)}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

if (results.length === 0) console.log("\nYüklenecek görsel bulunamadı.");

if (!DRY_RUN && results.length > 0) {
  const manifest = join(root, "scripts", ".migrated-images.json");
  mkdirSync(dirname(manifest), { recursive: true });
  writeFileSync(manifest, JSON.stringify(results, null, 2));
  console.log(`\nManifest: ${relative(root, manifest)}`);
}

console.log("\n--- Sonuç URL'leri ---");
for (const r of results) console.log(`${r.source} -> ${r.url}`);
console.log(`\nToplam: ${results.length} görsel${failed ? `, ${failed} hata` : ""}`);
if (failed) process.exit(1);
