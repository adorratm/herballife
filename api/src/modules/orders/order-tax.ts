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

export type OrderTaxResult = {
  taxAmount: number;
  total: number;
  /** Oran → o orandaki KDV tutarı */
  taxByRate: Record<string, number>;
  /** Benzersiz ürün KDV oranları */
  rates: number[];
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

export function calculateOrderTax(
  input: CalculateOrderTaxInput,
): OrderTaxResult {
  const fallback = input.fallbackRatePercent ?? 20;
  const included = input.taxIncluded !== false;
  const discount = Math.min(
    Math.max(0, input.discountAmount ?? 0),
    Math.max(0, input.subtotal),
  );
  const discountRatio = input.subtotal > 0 ? discount / input.subtotal : 0;
  const shippingFee = Math.max(0, input.shippingFee ?? 0);
  const paymentFee = Math.max(0, input.paymentFee ?? 0);

  const taxByRate: Record<string, number> = {};
  let itemsVat = 0;
  for (const item of input.items) {
    const rate = vatRateOf(item, fallback);
    const key = String(rate);
    const lineGross =
      parseMoney(item.unitPrice) * item.quantity * (1 - discountRatio);
    const vat = included
      ? includedTax(lineGross, rate)
      : excludedTax(lineGross, rate);
    itemsVat += vat;
    taxByRate[key] = (taxByRate[key] || 0) + vat;
  }

  const feeRate = weightedVatRate(input.items, fallback);
  const fees = shippingFee + paymentFee;
  const feesVat = included
    ? includedTax(fees, feeRate)
    : excludedTax(fees, feeRate);

  if (feesVat > 0 && itemsVat > 0) {
    const shares = { ...taxByRate };
    for (const key of Object.keys(shares)) {
      taxByRate[key] =
        (shares[key] || 0) + feesVat * ((shares[key] || 0) / itemsVat);
    }
  } else if (feesVat > 0) {
    const key = String(feeRate);
    taxByRate[key] = (taxByRate[key] || 0) + feesVat;
  }

  const afterDiscount = Math.max(0, input.subtotal - discount);
  const total = afterDiscount + shippingFee + paymentFee;
  const taxAmount = itemsVat + feesVat;
  const rates = [
    ...new Set(
      input.items
        .map((i) => vatRateOf(i, fallback))
        .filter((n) => Number.isFinite(n)),
    ),
  ].sort((a, b) => a - b);

  return { taxAmount, total, taxByRate, rates };
}
