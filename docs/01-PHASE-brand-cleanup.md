# Faz 1 — Marka, domain, temizlik

## Kapsam

- Emine Özberk kaldır; marka **Herbal Kapıda**
- Domain / e-posta: herbalkapida.com, info@herbalkapida.com
- Logo yokken metin marka
- Kahve alanları → Herbal Kapıda ürün alanları
- iyzico tamamen kaldır
- ÖKC tamamen kaldır
- Faturalar modülü kaldır; siparişten fatura ilet kalır
- Kargo UI: yalnızca DHL aktif / varsayılan

## Ana dosyalar

- `api/src/database/cms-defaults.ts`, `legal-defaults.ts`, `seed.ts`
- `frontend/src/lib/cms.ts`, hakkımızda, banka-hesaplari, yorum, takip, rapor
- `admin` sidebar, site-ayarlari, okc/faturalar sayfaları
- `api/src/modules/payments/iyzico.service.ts` (sil)
- `api/src/modules/accounting/okc-*`, einvoice kuyruk

## Kabul

Sitede Emine Özberk yok; PayTR only; ÖKC/faturalar menüde yok.
