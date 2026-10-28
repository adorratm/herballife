/**
 * Marka logolarında gömülü siyah arka planı şeffafa çevirir (PNG).
 * Gerçekten şeffaf PNG’lerde neredeyse hiç değişiklik olmaz.
 */
export async function knockOutNearBlackToPng(
  buffer: Buffer,
  threshold = 45,
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sharp = require('sharp') as typeof import('sharp');
  const { data, info } = await sharp(buffer)
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

  const png = await pipeline.png().toBuffer();
  return { buffer: png, mimeType: 'image/png', ext: '.png' };
}

export const WEBP_QUALITY = 82;

/** GIF (animasyon) ve SVG (vektör) dışındaki tüm görseller WebP'ye çevrilir. */
export function shouldConvertToWebp(mimeType: string) {
  return mimeType !== 'image/gif' && mimeType !== 'image/svg+xml';
}

export async function convertToWebp(
  buffer: Buffer,
  quality = WEBP_QUALITY,
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sharp = require('sharp') as typeof import('sharp');
  const out = await sharp(buffer, { animated: true })
    .rotate() // EXIF yönünü uygula (metadata WebP çıktısında atılır)
    .webp({ quality })
    .toBuffer();
  return { buffer: out, mimeType: 'image/webp', ext: '.webp' };
}

export function shouldProcessBrandLogo(folder: string, mimeType: string) {
  const f = (folder || '').toLowerCase();
  if (!f.includes('brand') && !f.includes('logo')) return false;
  return (
    mimeType === 'image/png' ||
    mimeType === 'image/jpeg' ||
    mimeType === 'image/webp' ||
    mimeType === 'image/jpg'
  );
}
