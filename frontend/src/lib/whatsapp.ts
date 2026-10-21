/** Varsayılan iş hattı (kurumsal WA yokken / contact.phone boşken). */
export const DEFAULT_WHATSAPP_PHONE = "+90 500 000 00 00";

export type WhatsAppPreset = {
  label: string;
  message: string;
};

export type WhatsAppSettings = {
  enabled: boolean;
  /** Boşsa contact.phone kullanılır */
  phone: string;
  greeting: string;
  presets: WhatsAppPreset[];
};

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  enabled: true,
  phone: "",
  greeting: "Merhaba — Emine Özberk. Size nasıl yardımcı olabiliriz?",
  presets: [
    {
      label: "Sipariş durumu",
      message: "Merhaba, sipariş durumum hakkında bilgi almak istiyorum.",
    },
    {
      label: "Ürün danışmanlığı",
      message:
        "Merhaba, hedeflerime uygun ürün / paket önerisi alabilir miyim?",
    },
    {
      label: "Beslenme takibi",
      message: "Merhaba, beslenme ve takip programı hakkında yazıyorum.",
    },
    {
      label: "Kargo & teslimat",
      message:
        "Merhaba, kargo süresi ve teslimat seçenekleri hakkında yazıyorum.",
    },
    {
      label: "Başka bir konu",
      message: "Merhaba, yazıyorum.",
    },
  ],
};

export function normalizeWhatsAppPresets(value: unknown): WhatsAppPreset[] {
  if (!Array.isArray(value)) return DEFAULT_WHATSAPP_SETTINGS.presets;
  const items = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { label?: unknown; message?: unknown };
      const label = typeof row.label === "string" ? row.label.trim() : "";
      const message =
        typeof row.message === "string" ? row.message.trim() : "";
      if (!label || !message) return null;
      return { label, message };
    })
    .filter((item): item is WhatsAppPreset => item !== null);
  return items.length ? items : DEFAULT_WHATSAPP_SETTINGS.presets;
}

export function mergeWhatsAppSettings(raw: unknown): WhatsAppSettings {
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_WHATSAPP_SETTINGS,
      presets: [...DEFAULT_WHATSAPP_SETTINGS.presets],
    };
  }
  const row = raw as Record<string, unknown>;
  return {
    enabled: typeof row.enabled === "boolean" ? row.enabled : true,
    phone: typeof row.phone === "string" ? row.phone : "",
    greeting:
      typeof row.greeting === "string" && row.greeting.trim()
        ? row.greeting
        : DEFAULT_WHATSAPP_SETTINGS.greeting,
    presets: normalizeWhatsAppPresets(row.presets),
  };
}

export function digitsOnlyPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppUrl(
  phone: string | null | undefined,
  text: string,
): string {
  const digits = digitsOnlyPhone(phone || DEFAULT_WHATSAPP_PHONE);
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}

export function resolveWhatsAppPhone(input: {
  whatsappPhone?: string | null;
  contactPhone?: string | null;
}): string {
  const wa = (input.whatsappPhone || "").trim();
  if (wa) return wa;
  const contact = (input.contactPhone || "").trim();
  if (contact) return contact;
  return DEFAULT_WHATSAPP_PHONE;
}

export function productWhatsAppMessage(
  productName: string,
  productUrl: string,
  brandName?: string,
): string {
  const brand = brandName || "mağaza";
  return `Merhaba, ${brand} üzerinden "${productName}" ürünü hakkında bilgi almak istiyorum.\n${productUrl}`;
}
