import { parseMoney } from '@modules/accounting/money';

export type OrderTaxLineInput = {
  unitPrice: string | number;
  quantity: number;
  vatRate?: string | number | null;
};

export type CalculateOrderTaxInput = {
  items: OrderTaxLineInput[];
  subtotal: number;
  discountAmount?: number;
  shippingFee?: number;
  paymentFee?: number;
  fallbackRatePercent?: number;
  taxIncluded?: boolean;
};

function vatRateOf(
  item: OrderTaxLineInput,
  fallbackRatePercent: number,
): number {
  if (item.vatRate != null && item.vatRate !== '') {
    return parseMoney(item.vatRate);
  }
  return fallbackRatePercent;
}

function weightedVatRate(
  items: OrderTaxLineInput[],
  fallbackRatePercent: number,
): number {
  let gross = 0;
  let weighted = 0;
  for (const item of items) {
    const lineGross = parseMoney(item.unitPrice) * item.quantity;
    if (lineGross <= 0) continue;
    gross += lineGross;
    weighted += lineGross * vatRateOf(item, fallbackRatePercent);
  }
  return gross > 0 ? weighted / gross : fallbackRatePercent;
}

function includedTax(gross: number, ratePercent: number): number {
  if (ratePercent <= 0 || gross <= 0) return 0;
  return (gross * ratePercent) / (100 + ratePercent);
}

function excludedTax(net: number, ratePercent: number): number {
  if (ratePercent <= 0 || net <= 0) return 0;
  return (net * ratePercent) / 100;
}

export function calculateOrderTax(input: CalculateOrderTaxInput): {
  taxAmount: number;
  total: number;
} {
  const fallback = input.fallbackRatePercent ?? 20;
  const included = input.taxIncluded !== false;
  const discount = Math.min(
    Math.max(0, input.discountAmount ?? 0),
    Math.max(0, input.subtotal),
  );
  const discountRatio = input.subtotal > 0 ? discount / input.subtotal : 0;
  const shippingFee = Math.max(0, input.shippingFee ?? 0);
  const paymentFee = Math.max(0, input.paymentFee ?? 0);

  let itemsVat = 0;
  for (const item of input.items) {
    const rate = vatRateOf(item, fallback);
    const lineGross =
      parseMoney(item.unitPrice) * item.quantity * (1 - discountRatio);
    itemsVat += included
      ? includedTax(lineGross, rate)
      : excludedTax(lineGross, rate);
  }

  const feeRate = weightedVatRate(input.items, fallback);
  const fees = shippingFee + paymentFee;
  const feesVat = included
    ? includedTax(fees, feeRate)
    : excludedTax(fees, feeRate);

  const afterDiscount = Math.max(0, input.subtotal - discount);
  const total = afterDiscount + shippingFee + paymentFee;
  const taxAmount = itemsVat + feesVat;

  return { taxAmount, total };
}
