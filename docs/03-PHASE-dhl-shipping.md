# Faz 3 — DHL kargo + takip

## Kapsam

- DHL API adapter (credentials panel)
- Diğer provider `isActive=false`
- Kargo oluştur: DHL varsayılan
- API olmasa bile takip kodu → müşteri + admin takip
- Durum değişiminde e-posta + in-app

## Dosyalar

- `api/src/modules/shipping/`
- `api/src/modules/tracking/`
- `admin/src/app/kargo/`
- `frontend` takip / sipariş sayfaları

## Kabul

Manuel takip kodu ile uçtan uca takip; DHL credentials ile etiket.
