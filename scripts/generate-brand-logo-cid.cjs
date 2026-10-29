/**
 * Frontend CMS logosu → e-posta CID (brand-logo.ts).
 * Kaynak: canlı brand.logoUrl (S3) veya api/assets/email/logo-live.png
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const livePng = path.join(ROOT, 'api/assets/email/logo-live.png');
const emailPng = path.join(ROOT, 'api/assets/email/logo-email.png');
const outTs = path.join(
  ROOT,
  'api/src/modules/notifications/brand-logo.ts',
);

const DEFAULT_LOGO_URL =
  'https://herbalkapida.s3.eu-central-1.amazonaws.com/brand/2026-10-29/logo-phone-updated.png';

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib
      .get(url, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          fetchBuffer(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function main() {
  const url = process.env.BRAND_LOGO_URL || DEFAULT_LOGO_URL;
  fs.mkdirSync(path.dirname(emailPng), { recursive: true });

  try {
    const buf = await fetchBuffer(url);
    fs.writeFileSync(livePng, buf);
    console.log('downloaded', url, 'bytes=', buf.length);
  } catch (e) {
    console.warn('download failed, using local logo-live.png:', e.message);
  }

  if (!fs.existsSync(livePng)) {
    throw new Error('logo-live.png yok — BRAND_LOGO_URL veya dosyayı ekleyin');
  }

  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    sharp = null;
  }

  if (sharp) {
    // Mail: siyah zemin → beyaz (site logosu siyah kalır: logo-live.png)
    const { data, info } = await sharp(livePng)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < 40 && g < 40 && b < 40) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
    await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .resize({ width: 560, withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toFile(emailPng);
  } else {
    fs.copyFileSync(livePng, emailPng);
  }

  const b64 = fs.readFileSync(emailPng).toString('base64');
  const src = `/** Auto-generated from frontend brand logo — run: node scripts/generate-brand-logo-cid.cjs */
export const BRAND_LOGO_CID = 'herbalkapida-brand-logo';
export const BRAND_LOGO_FILENAME = 'logo-email.png';
export const BRAND_LOGO_CONTENT_TYPE = 'image/png';
export const BRAND_LOGO_BASE64 =
  '${b64}';
`;
  fs.writeFileSync(outTs, src);
  console.log('wrote', outTs, 'pngBytes=', Buffer.from(b64, 'base64').length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
