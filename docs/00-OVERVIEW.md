# Herbal Kapıda — Dönüşüm Özeti

**Marka:** Herbal Kapıda  
**Domain:** herbalkapida.com  
**Ana e-posta:** info@herbalkapida.com  
**Panel dili:** Türkçe  
**Vitrin dilleri:** TR, EN, DE, FR, ES  
**Para birimleri:** TRY, USD, EUR, GBP  

## Kilitli kararlar

| Konu | Karar |
|------|--------|
| Toplu WhatsApp | Meta Cloud API + onaylı şablonlar |
| Ödeme | Yalnızca PayTR (iyzico kaldırıldı) |
| Kargo | Yalnızca DHL; API yokken manuel takip kodu |
| Logo | Yokken metin “Herbal Kapıda” |
| Fatura | Faturalar/ÖKC/GİB modülleri kaldırıldı; siparişten fatura iletme kaldı |
| Analytics | Panel Site Ayarları’ndan (env’e gerek yok) |

## Uygulama durumu

Kod tabanında Faz 0–11 uygulandı (2026-10). Yeni DB kolonları için `DATABASE_SYNCHRONIZE=true` (dev) veya migration gerekir. Meta toplu WA için onaylı şablon + `WHATSAPP_PROVIDER=meta` şart.

## Faz sırası

0. Dokümantasyon (bu klasör) — tamam  
1. Marka temizliği + iyzico/ÖKC/fatura kaldırma — tamam  
2. i18n + para birimi — tamam  
3. DHL + takip — tamam  
4. Bildirimler + Meta toplu WhatsApp + BullMQ — tamam  
5. Ürün UX (varyant kategori, badge, görseller, KDV) — tamam  
6. Koçluk / onay merkezi — tamam  
7. Panel CMS UX + medya + analytics — tamam  
8. Kurumsal adres + e-posta design + marketing — tamam  
9. Blog / Hakkımızda / ikonlar / WA widget / site turu — tamam  
10. Pazaryeri prod (mock yasak) — tamam  
11. Checkout kolaylaştırma + conversion — tamam  
12. UX / zorunlu i18n / rakip parity — bkz. [14-PHASE-ux-i18n-qa.md](./14-PHASE-ux-i18n-qa.md), [13-PHASE-competitor-parity.md](./13-PHASE-competitor-parity.md)  

## WooCommerce parity matrisi

Bkz. [WOOCOMMERCE-PARITY.md](./WOOCOMMERCE-PARITY.md).

## İlgili dokümanlar

- [ENV-VS-PANEL.md](./ENV-VS-PANEL.md)
- [WHATSAPP-BULK.md](./WHATSAPP-BULK.md)
- Faz dosyaları: `01-PHASE-*.md` … `12-PHASE-*.md`
