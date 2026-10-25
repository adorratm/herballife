import type { InboxItem } from "@/lib/api";

type InboxValues = Record<string, string | number | boolean>;

const KNOWN_TYPES = new Set([
  "order_received",
  "order_paid",
  "order_status",
  "shipment_created",
  "shipment_status",
  "return_requested",
  "return_approved",
  "return_rejected",
  "abandoned_cart",
  "review_approved",
  "review_rejected",
  "review_moderated",
  "wellness_meal_approved",
  "wellness_meal_rejected",
  "wellness_measurement_approved",
  "wellness_measurement_rejected",
  "ops_access_approved",
  "ops_access_rejected",
]);

/** Eski kayıtlardan sipariş no / takip no tahmini */
function guessPayload(item: InboxItem): InboxValues {
  const fromDb =
    item.payload && typeof item.payload === "object" ? item.payload : {};
  const text = `${item.title || ""} ${item.body || ""}`;
  const orderGuess =
    (typeof fromDb.orderNumber === "string" && fromDb.orderNumber) ||
    text.match(/\b(HBL[-A-Z0-9]+|[A-Z]{2,}-\d{3,}[-A-Z0-9]*)\b/i)?.[1] ||
    "";
  const trackingGuess =
    (typeof fromDb.trackingNumber === "string" && fromDb.trackingNumber) ||
    text.match(/(?:Takip|Tracking|Sendung)[:\s]+([A-Z0-9-]+)/i)?.[1] ||
    "";
  return {
    orderNumber: orderGuess || "—",
    trackingNumber: trackingGuess || "",
    statusLabel:
      (typeof fromDb.statusLabel === "string" && fromDb.statusLabel) || "",
    productName:
      (typeof fromDb.productName === "string" && fromDb.productName) || "",
    itemCount:
      typeof fromDb.itemCount === "number"
        ? fromDb.itemCount
        : Number(text.match(/(\d+)\s+ürün/i)?.[1] || 0) || 0,
    note: (typeof fromDb.note === "string" && fromDb.note) || "",
    hasNote: Boolean(fromDb.hasNote) || Boolean(fromDb.note),
    ...Object.fromEntries(
      Object.entries(fromDb).map(([k, v]) => [k, v ?? ""]),
    ),
  };
}

/**
 * Bildirim metnini aktif dile çevirir.
 * Bilinen `type` yoksa DB’deki TR title/body kalır.
 */
export function localizeInboxItem(
  item: InboxItem,
  t: (key: string, values?: InboxValues) => string,
  has: (key: string) => boolean,
): { title: string; body: string } {
  let type = item.type || "";
  // Eski review_moderated kayıtları
  if (type === "review_moderated") {
    type = /yayınlanmadı|not published|nicht veröffentlicht/i.test(
      item.title + item.body,
    )
      ? "review_rejected"
      : "review_approved";
  }
  if (!KNOWN_TYPES.has(type) || !has(`${type}.title`)) {
    return { title: item.title, body: item.body };
  }
  const values = guessPayload(item);
  try {
    const title = t(`${type}.title`, values);
    let bodyKey = `${type}.body`;
    if (
      type === "shipment_created" &&
      values.trackingNumber &&
      has(`${type}.bodyWithTracking`)
    ) {
      bodyKey = `${type}.bodyWithTracking`;
    }
    if (
      (type === "wellness_meal_approved" ||
        type === "wellness_meal_rejected" ||
        type === "wellness_measurement_approved" ||
        type === "wellness_measurement_rejected") &&
      values.hasNote &&
      has(`${type}.bodyWithNote`)
    ) {
      bodyKey = `${type}.bodyWithNote`;
    }
    const body = t(bodyKey, values);
    return { title, body };
  } catch {
    return { title: item.title, body: item.body };
  }
}
