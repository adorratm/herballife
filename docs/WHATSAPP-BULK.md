# Toplu WhatsApp — Neden Çalışmıyordu ve Hedef Mimari

## Bugünkü kırılma

`POST /wellness/coach/whatsapp-blast` → `WellnessService.createWhatsappBlast`:

1. Wellness log’u olan danışanları listeler
2. Telefonu olanları `ok: true` sayar
3. **Meta / WhatsAppProviderRouter çağrılmaz**
4. Dönüşte `note: 'Demo: gerçek WhatsApp API çağrısı yapılmadı…'`

Gerçek gönderim yalnızca sipariş bildirim kuyruğunda (`notifications`) ve `WHATSAPP_PROVIDER=meta` ile serbest `text` tipindedir.

## Hedef (karar: Meta + onaylı şablon)

```
Admin /kocluk/whatsapp
  → POST blast { templateName, language, paramsMap, userIds? }
  → BullMQ whatsapp-blast (throttle)
  → Meta Graph API type=template
  → coach_whatsapp_blasts + recipient sonuçları
```

### Gereksinimler

- Meta Business’ta onaylı şablon (örn. `coach_motivation`)
- Panel: şablon adı, dil kodu (`tr`, `en_US`), body parametre sırası
- `{Danışan Adı}` → template variable mapping
- `WHATSAPP_PROVIDER=meta` + `META_WA_TOKEN` + `META_WA_PHONE_NUMBER_ID`
- WellnessModule → NotificationsModule / WhatsAppProviderRouter import

### Sipariş bildirimleri

Serbest text (24s pencere) veya ayrı transactional şablonlar; kuyruk `notifications` aynı kalır.
