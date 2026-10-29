/** Admin sipariş kaynak tespiti (web vs pazaryeri) */

export type OrderSource = {
  kind: 'web' | 'trendyol' | 'trendyol_go_market' | 'hepsiburada' | 'n11' | 'marketplace';
  label: string;
};

const MP_CODES = new Set(['trendyol', 'trendyol_go_market', 'hepsiburada', 'n11']);

export function resolveOrderSource(order: {
  shippingProvider?: string | null;
  notes?: string | null;
  legalAcceptances?: Record<string, unknown> | null;
}): OrderSource {
  const legal = order.legalAcceptances;
  if (legal?.marketplaceImport) {
    const p = String(legal.platform || '').toLowerCase();
    if (p === 'trendyol') return { kind: 'trendyol', label: 'Trendyol' };
    if (p === 'trendyol_go_market')
      return { kind: 'trendyol_go_market', label: 'Trendyol Go Market' };
    if (p === 'hepsiburada') return { kind: 'hepsiburada', label: 'Hepsiburada' };
    if (p === 'n11') return { kind: 'n11', label: 'N11' };
    return { kind: 'marketplace', label: 'Pazaryeri' };
  }

  const provider = (order.shippingProvider || '').toLowerCase();
  if (MP_CODES.has(provider)) {
    if (provider === 'trendyol') return { kind: 'trendyol', label: 'Trendyol' };
    if (provider === 'trendyol_go_market')
      return { kind: 'trendyol_go_market', label: 'Trendyol Go Market' };
    if (provider === 'hepsiburada')
      return { kind: 'hepsiburada', label: 'Hepsiburada' };
    if (provider === 'n11') return { kind: 'n11', label: 'N11' };
  }

  const notes = order.notes || '';
  if (/trendyol go/i.test(notes))
    return { kind: 'trendyol_go_market', label: 'Trendyol Go Market' };
  if (/trendyol/i.test(notes)) return { kind: 'trendyol', label: 'Trendyol' };
  if (/hepsiburada/i.test(notes))
    return { kind: 'hepsiburada', label: 'Hepsiburada' };
  if (/\bn11\b/i.test(notes)) return { kind: 'n11', label: 'N11' };
  if (/pazaryeri|marketplace/i.test(notes))
    return { kind: 'marketplace', label: 'Pazaryeri' };

  return { kind: 'web', label: 'Site' };
}

export function formatAddress(addr?: Record<string, string> | null): string[] {
  if (!addr) return [];
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = addr[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
  };
  const lines: string[] = [];
  const fullName = pick('fullName', 'name', 'receiverName');
  const phone = pick('phone', 'gsm', 'mobile');
  const street = pick(
    'addressLine',
    'line1',
    'address1',
    'address',
    'fullAddress',
    'street',
  );
  const locality = [
    pick('neighborhood', 'mahalle'),
    pick('district', 'districtName', 'ilce'),
    pick('city', 'cityName', 'il'),
  ]
    .filter(Boolean)
    .join(' / ');
  const postal = pick('postalCode', 'zip', 'zipCode');
  const country = pick('country');
  if (fullName) lines.push(fullName);
  if (phone) lines.push(phone);
  if (street) lines.push(street);
  if (locality) lines.push(locality);
  if (postal) lines.push(postal);
  if (country && country !== 'TR' && country !== 'Türkiye') lines.push(country);
  return lines;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Ödeme bekliyor',
  paid: 'Ödendi',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim edildi',
  cancelled: 'İptal',
  refunded: 'İade',
};
