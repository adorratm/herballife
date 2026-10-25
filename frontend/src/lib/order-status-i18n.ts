/** Çeviri anahtarları: messages.orderStatus (status, shipment_*, step_*, hint_*) */

export type OrderStatusTranslator = ((
  key: string,
  values?: Record<string, string | number | Date>,
) => string) & {
  has?: (key: string) => boolean;
};

export function orderStatusLabel(
  status: string,
  t: OrderStatusTranslator,
): string {
  return t(status);
}

export function shipmentStatusLabel(
  status: string,
  t: OrderStatusTranslator,
): string {
  return t(`shipment_${status}`);
}

export function orderStatusHint(
  status: string,
  t: OrderStatusTranslator,
): string | null {
  const key = `hint_${status}`;
  if (typeof t.has === "function" && !t.has(key)) return null;
  return t(key);
}

export function orderStepLabel(
  stepKey: string,
  t: OrderStatusTranslator,
): string {
  return t(`step_${stepKey}`);
}
