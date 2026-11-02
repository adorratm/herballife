/** Backend TAX_INCLUDED=true varsayılanıyla uyumlu KDV ayırımı */
export function extractIncludedTax(netTotal: number, ratePercent = 20) {
  if (ratePercent <= 0) return 0;
  return (netTotal * ratePercent) / (100 + ratePercent);
}

export function calculateOrderTotals(
  subtotal: number,
  shippingFee: number,
  options?: {
    ratePercent?: number;
    included?: boolean;
    discountAmount?: number;
    paymentFee?: number;
  },
) {
  const rate = options?.ratePercent ?? 20;
  const included = options?.included !== false;
  const discountAmount = Math.min(
    Math.max(0, options?.discountAmount ?? 0),
    Math.max(0, subtotal),
  );
  const paymentFee = Math.max(0, options?.paymentFee ?? 0);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const net = afterDiscount + shippingFee + paymentFee;
  if (included) {
    return {
      subtotal,
      discountAmount,
      shippingFee,
      paymentFee,
      taxAmount: extractIncludedTax(net, rate),
      total: net,
      taxIncluded: true,
      ratePercent: rate,
    };
  }
  const taxAmount = (net * rate) / 100;
  return {
    subtotal,
    discountAmount,
    shippingFee,
    paymentFee,
    taxAmount,
    total: net + taxAmount,
    taxIncluded: false,
    ratePercent: rate,
  };
}
