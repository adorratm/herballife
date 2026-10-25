/** Backend notification.templates STATUS_LABELS ile senkron — locale metinleri orderStatus.* */

export const ORDER_STEP_KEYS = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
] as const;

export function isTerminalFailure(status: string): boolean {
  return status === "cancelled" || status === "refunded";
}

/** 0–4 aktif adım; iptal/iade için -1 */
export function getOrderStepIndex(status: string): number {
  switch (status) {
    case "pending_payment":
      return 0;
    case "paid":
      return 1;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    default:
      return -1;
  }
}
