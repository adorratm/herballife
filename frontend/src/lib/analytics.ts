import { getLoadedAnalyticsIds, loadAnalyticsIds } from "@/lib/analytics-ids";

type DataLayer = Array<Record<string, unknown>>;

declare global {
  interface Window {
    dataLayer?: DataLayer;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type AnalyticsItem = {
  /** Merchant feed g:id ile aynı (catalogItemId) */
  item_id: string;
  item_name?: string;
  item_brand?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

const BRAND = process.env.NEXT_PUBLIC_PRODUCT_BRAND?.trim() || "Herbalife";

function cleanItem(i: AnalyticsItem): AnalyticsItem {
  return {
    item_id: i.item_id,
    ...(i.item_name ? { item_name: i.item_name } : {}),
    item_brand: i.item_brand || BRAND,
    ...(i.item_variant ? { item_variant: i.item_variant } : {}),
    ...(typeof i.price === "number" && Number.isFinite(i.price)
      ? { price: i.price }
      : {}),
    quantity: i.quantity ?? 1,
  };
}

/**
 * GTM için dataLayer olayı. gtag.js yolunda (GTM yoksa) GA4'e ayrıca
 * gtag('event') gönderilir; GTM varken çift sayım olmaması için gönderilmez.
 */
function emit(event: string, ecommerce: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });

  const ids = getLoadedAnalyticsIds();
  if (ids && !ids.gtmId && ids.ga4Id && typeof window.gtag === "function") {
    window.gtag("event", event, { ...ecommerce, send_to: ids.ga4Id });
  }
}

/** Google Ads dönüşümü (panelde AW-… ve etiket tanımlıysa, gtag.js ile). */
async function adsConversion(
  labelKey: "googleAdsPurchaseLabel" | "googleAdsWhatsappLabel",
  params: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  const ids = await loadAnalyticsIds();
  const label = ids[labelKey];
  if (!ids.googleAdsId || !label || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: `${ids.googleAdsId}/${label}`,
    ...params,
  });
}

export function trackViewContent(item: {
  itemId: string;
  name?: string;
  price?: number;
  currency?: string;
}) {
  const currency = item.currency || "TRY";
  const value = item.price ?? 0;
  emit("view_item", {
    currency,
    value,
    items: [cleanItem({ item_id: item.itemId, item_name: item.name, price: item.price })],
  });
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_ids: [item.itemId],
      content_name: item.name,
      content_type: "product",
      value,
      currency,
    });
  }
}

export function trackAddToCart(item: {
  itemId: string;
  name?: string;
  variant?: string | null;
  price?: number;
  quantity?: number;
  currency?: string;
}) {
  const qty = item.quantity ?? 1;
  const value = (item.price ?? 0) * qty;
  const currency = item.currency || "TRY";
  emit("add_to_cart", {
    currency,
    value,
    items: [
      cleanItem({
        item_id: item.itemId,
        item_name: item.name,
        item_variant: item.variant || undefined,
        price: item.price,
        quantity: qty,
      }),
    ],
  });
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_ids: [item.itemId],
      content_name: item.name,
      content_type: "product",
      value,
      currency,
    });
  }
}

export function trackBeginCheckout(input: {
  value?: number;
  currency?: string;
  items: AnalyticsItem[];
}) {
  const value = input.value ?? 0;
  const currency = input.currency || "TRY";
  const items = input.items.map(cleanItem);
  emit("begin_checkout", { currency, value, items });
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      value,
      currency,
      num_items: items.reduce((n, i) => n + (i.quantity || 1), 0),
      content_ids: items.map((i) => i.item_id),
    });
  }
}

export type PurchaseData = {
  transaction_id: string;
  value: number;
  currency: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
  payment_type?: string | null;
  items: AnalyticsItem[];
};

/**
 * Yalnızca sunucuda doğrulanmış sipariş verisiyle çağrılmalı.
 * Aynı sipariş bu tarayıcıda ikinci kez sayılmaz; GA4 / Ads ayrıca
 * transaction_id ile tekilleştirir.
 */
export function trackPurchase(order: PurchaseData) {
  if (typeof window === "undefined" || !order.transaction_id) return;
  const key = `herbalkapida_purchase_tracked_${order.transaction_id}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // storage kapalıysa GA4/Ads transaction_id tekilleştirmesine güven
  }

  const items = order.items.map(cleanItem);
  emit("purchase", {
    transaction_id: order.transaction_id,
    value: order.value,
    currency: order.currency,
    ...(order.shipping ? { shipping: order.shipping } : {}),
    ...(order.tax ? { tax: order.tax } : {}),
    ...(order.coupon ? { coupon: order.coupon } : {}),
    ...(order.payment_type ? { payment_type: order.payment_type } : {}),
    items,
  });

  void adsConversion("googleAdsPurchaseLabel", {
    value: order.value,
    currency: order.currency,
    transaction_id: order.transaction_id,
  });

  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Purchase",
      {
        value: order.value,
        currency: order.currency,
        content_ids: items.map((i) => i.item_id),
        content_type: "product",
        num_items: items.reduce((n, i) => n + (i.quantity || 1), 0),
      },
      { eventID: order.transaction_id },
    );
  }
}

/** WhatsApp danışmanlık tıklaması — Ads'te ikincil dönüşüm olarak kullanılmalı. */
export function trackWhatsAppClick(context: string) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "whatsapp_click", whatsapp_context: context });
  const ids = getLoadedAnalyticsIds();
  if (ids && !ids.gtmId && ids.ga4Id && typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_click", {
      whatsapp_context: context,
      send_to: ids.ga4Id,
    });
  }
  void adsConversion("googleAdsWhatsappLabel", {});
  if (typeof window.fbq === "function") {
    window.fbq("track", "Contact", { method: "whatsapp", context });
  }
}
