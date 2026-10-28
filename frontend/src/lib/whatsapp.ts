/** Son çare — tercihen CMS contact.phone / whatsapp.phone kullanın. */
export const DEFAULT_WHATSAPP_PHONE = "";

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

export type WhatsAppTranslator = (key: string) => string;

/** English-neutral CMS / merge fallback; UI should prefer buildLocalizedWhatsAppSettings(t). */
export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  enabled: true,
  phone: "",
  greeting: "Hello — how can we help you today?",
  presets: [
    {
      label: "Order status",
      message: "Hello, I would like an update on my order status.",
    },
    {
      label: "Product advice",
      message:
        "Hello, can you suggest products / bundles for my goals?",
    },
    {
      label: "Nutrition tracking",
      message: "Hello, I have a question about nutrition tracking.",
    },
    {
      label: "Shipping & delivery",
      message:
        "Hello, I have a question about shipping times and delivery options.",
    },
    {
      label: "Something else",
      message: "Hello, I'm writing to you.",
    },
  ],
};

export function buildLocalizedWhatsAppSettings(
  t: WhatsAppTranslator,
): WhatsAppSettings {
  return {
    enabled: true,
    phone: "",
    greeting: t("defaultGreeting"),
    presets: [
      {
        label: t("presetOrderStatusLabel"),
        message: t("presetOrderStatusMessage"),
      },
      {
        label: t("presetProductLabel"),
        message: t("presetProductMessage"),
      },
      {
        label: t("presetTrackingLabel"),
        message: t("presetTrackingMessage"),
      },
      {
        label: t("presetShippingLabel"),
        message: t("presetShippingMessage"),
      },
      {
        label: t("presetOtherLabel"),
        message: t("presetOtherMessage"),
      },
    ],
  };
}

export function isDefaultWhatsAppPresets(presets: WhatsAppPreset[]): boolean {
  if (presets.length !== DEFAULT_WHATSAPP_SETTINGS.presets.length) return false;
  return presets.every(
    (p, i) => p.message === DEFAULT_WHATSAPP_SETTINGS.presets[i]?.message,
  );
}

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
  const brand = brandName || "store";
  return `Hello, I would like information about "${productName}" on ${brand}.\n${productUrl}`;
}
