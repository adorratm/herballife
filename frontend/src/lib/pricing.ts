/** Backend `order-tax.ts` ile uyumlu — satır satır ürün KDV’si */

export type TaxLineInput = {
  unitPrice: string | number;
  quantity: number;
  vatRate?: string | number | null;
};

export type OrderTotals = {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  paymentFee: number;
  taxAmount: number;
  /** Oran → o orandaki KDV tutarı (ürün + ücret payı) */
  taxByRate: Record<string, number>;
  /** Sepetteki benzersiz KDV oranları (küçükten büyüğe) */
  rates: number[];
  total: number;
  taxIncluded: boolean;
  /** Tek oran varsa o; karışıksa ağırlıklı ortalama (gösterim için) */
  ratePercent: number;
};

function parseMoney(v: string | number | null | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function vatRateOf(item: TaxLineInput, fallbackRatePercent: number): number {
  if (item.vatRate != null && String(item.vatRate).trim() !== "") {
    const n = parseMoney(item.vatRate);
    return Number.isFinite(n) ? n : fallbackRatePercent;
  }
  return fallbackRatePercent;
}

function includedTax(gross: number, ratePercent: number): number {
  if (ratePercent <= 0 || gross <= 0) return 0;
  return (gross * ratePercent) / (100 + ratePercent);
}

function excludedTax(net: number, ratePercent: number): number {
  if (ratePercent <= 0 || net <= 0) return 0;
  return (net * ratePercent) / 100;
}

function weightedVatRate(
  items: TaxLineInput[],
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

/** Eski tek-oran yardımcısı (test / basit kullanım) */
export function extractIncludedTax(netTotal: number, ratePercent = 20) {
  return includedTax(netTotal, ratePercent);
}

/**
 * Sepet kalemlerinin kendi KDV oranlarıyla toplam hesaplar.
 * `items` verilmezse tek `ratePercent` (varsayılan 20) kullanılır.
 */
export function calculateOrderTotals(
  subtotal: number,
  shippingFee: number,
  options?: {
    ratePercent?: number;
    included?: boolean;
    discountAmount?: number;
    paymentFee?: number;
    items?: TaxLineInput[];
  },
): OrderTotals {
  const fallback = options?.ratePercent ?? 20;
  const included = options?.included !== false;
  const discountAmount = Math.min(
    Math.max(0, options?.discountAmount ?? 0),
    Math.max(0, subtotal),
  );
  const paymentFee = Math.max(0, options?.paymentFee ?? 0);
  const ship = Math.max(0, shippingFee);
  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const items =
    options?.items?.length && options.items.length > 0
      ? options.items
      : [
          {
            unitPrice: subtotal,
            quantity: 1,
            vatRate: fallback,
          },
        ];

  const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
  const taxByRate: Record<string, number> = {};
  let itemsVat = 0;

  for (const item of items) {
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

  const feeRate = weightedVatRate(items, fallback);
  const fees = ship + paymentFee;
  const feesVat = included
    ? includedTax(fees, feeRate)
    : excludedTax(fees, feeRate);

  // Ücret KDV’sini mevcut oranlara satır KDV payı oranında dağıt
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

  const taxAmount = itemsVat + feesVat;
  const rates = [
    ...new Set(
      items
        .map((i) => vatRateOf(i, fallback))
        .filter((n) => Number.isFinite(n)),
    ),
  ].sort((a, b) => a - b);

  const ratePercent =
    rates.length === 1 ? rates[0]! : weightedVatRate(items, fallback);

  if (included) {
    return {
      subtotal,
      discountAmount,
      shippingFee: ship,
      paymentFee,
      taxAmount,
      taxByRate,
      rates,
      total: afterDiscount + ship + paymentFee,
      taxIncluded: true,
      ratePercent,
    };
  }

  return {
    subtotal,
    discountAmount,
    shippingFee: ship,
    paymentFee,
    taxAmount,
    taxByRate,
    rates,
    total: afterDiscount + ship + paymentFee + taxAmount,
    taxIncluded: false,
    ratePercent,
  };
}
