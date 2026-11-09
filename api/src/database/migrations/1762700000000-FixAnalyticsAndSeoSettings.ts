import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Veri düzeltmesi (idempotent):
 * 1) analytics: yanlış alana yazılmış / snippet olarak yapıştırılmış Google
 *    kimliklerini doğru alanlara taşır, geçersiz metinleri temizler.
 * 2) seo: toplu bul-değiştir sonrası “Orijinal Herbal Kapıda Ürünleri” olarak
 *    kalan ifadeleri “Orijinal Herbalife Ürünleri”ne çevirir; anahtar
 *    kelimelerdeki tekrarları temizler.
 */
const RE_GTM = /\bGTM-[A-Z0-9]{4,12}\b/;
const RE_GA4 = /\bG-[A-Z0-9]{6,16}\b/;
const RE_AW = /\bAW-(\d{6,14})(?:\/([A-Za-z0-9_-]{4,64}))?/;

const BROKEN_TITLE = 'Herbal Kapıda | Orijinal Herbal Kapıda Ürünleri';
const NEW_TITLE =
  'Herbalife Ürünleri | Orijinal ve Hediyeli Paketler — Herbal Kapıda';

function s(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function fixProductPhrase(text: string): string {
  return text
    .replace(
      /\b(orijinal|Orijinal|ORİJİNAL)(\s+)Herbal Kapıda(\s+)(ürün|Ürün)/g,
      '$1$2Herbalife$3$4',
    )
    .replace(
      /\b(original|Original)(\s+)Herbal Kapıda(\s+|-)(product|Product|Produkt)/g,
      '$1$2Herbalife$3$4',
    )
    .replace(
      /\b(independent|bağımsız|Bağımsız)(\s+)Herbal Kapıda(\s+)(distrib)/g,
      '$1$2Herbalife$3$4',
    );
}

function fixStringsDeep(v: unknown): unknown {
  if (typeof v === 'string') return fixProductPhrase(v);
  if (Array.isArray(v)) return v.map(fixStringsDeep);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [
        k,
        fixStringsDeep(x),
      ]),
    );
  }
  return v;
}

export class FixAnalyticsAndSeoSettings1762700000000
  implements MigrationInterface
{
  name = 'FixAnalyticsAndSeoSettings1762700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(
      `SELECT "key", "value" FROM "site_settings" WHERE "key" IN ('analytics', 'seo')`,
    )) as Array<{ key: string; value: Record<string, unknown> }>;

    for (const row of rows) {
      const value = { ...(row.value || {}) };
      let next: Record<string, unknown> = value;

      if (row.key === 'analytics') {
        const fields = [s(value.ga4Id), s(value.gtmId), s(value.googleAdsId)];
        const pick = (re: RegExp, own: string) =>
          own.match(re)?.[0] ||
          fields.map((f) => f.match(re)?.[0]).find(Boolean) ||
          '';
        const aw =
          s(value.googleAdsId).match(RE_AW) ||
          fields.map((f) => f.match(RE_AW)).find(Boolean) ||
          null;
        next = {
          ...value,
          gtmId: pick(RE_GTM, s(value.gtmId)),
          ga4Id: pick(RE_GA4, s(value.ga4Id)),
          googleAdsId: aw ? `AW-${aw[1]}` : '',
          googleAdsPurchaseLabel:
            s(value.googleAdsPurchaseLabel) || (aw?.[2] ?? ''),
          googleAdsWhatsappLabel: s(value.googleAdsWhatsappLabel),
        };
      }

      if (row.key === 'seo') {
        next = fixStringsDeep(value) as Record<string, unknown>;
        if (s(value.title) === BROKEN_TITLE) next.title = NEW_TITLE;
        if (Array.isArray(next.keywords)) {
          const seen = new Set<string>();
          const kws = [
            'Herbalife ürünleri',
            'Herbalife',
            ...(next.keywords as unknown[]).map(s),
          ].filter((k) => {
            const key = k.toLocaleLowerCase('tr-TR');
            if (!k || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          next.keywords = kws;
        }
      }

      if (JSON.stringify(next) !== JSON.stringify(value)) {
        await queryRunner.query(
          `UPDATE "site_settings" SET "value" = $1::jsonb, "updated_at" = now() WHERE "key" = $2`,
          [JSON.stringify(next), row.key],
        );
      }
    }
  }

  public async down(): Promise<void> {
    // Veri düzeltmesi; geri alınmaz.
  }
}
