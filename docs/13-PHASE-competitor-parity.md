# Faz C — Rakip paritesi (herbalurunleri / herbalkapinda)

Kısa özet: herbalkapinda.com ve herbalurunleri.com vitrin güven sinyalleri.

## Eklenenler

- **Fiyat güven satırı** — İndirimli `ProductCard` ve ürün detay (`ProductBuyBox`); `product.bestPrice30Days` (next-intl).
- **Kampanya geçerlilik şeridi** — `CampaignDateBanner.tsx`; ana sayfada hero sonrası, `getActiveCampaigns` `startsAt` / `endsAt`.
- **CMS `promises`** — `sameDayCutoff`, `sameDayShipping`, `freeCoaching`, `returnDays`; `BenefitsBar` hero altında.
- **CMS `legal`** — `supplementDisclaimer`, `weightDisclaimer`; footer altı + ürün detay küçük punt.
- **CMS `membership`** — myHerbal Kapıda CTA + disclaimer; footer ve ana sayfa bölümü.
- **Kategori hub sayıları** — Public kategorilerde `productCount` (API COUNT).
- **Footer distribütör ID** — `distributorCode` marka yanında (header ile uyumlu).
- **Mobil menü telefon** — Menü açılışında üstte belirgin `tel:` CTA.

## CMS varsayılanları

`api/src/database/cms-defaults.ts` ve `frontend/src/lib/cms.ts` (`DEFAULT_SETTINGS`).
