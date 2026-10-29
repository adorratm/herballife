/**
 * Türkiye telefonlarını E.164 (+90…) formatına çevirir.
 * Geçersiz / çok kısa numaralarda null döner.
 */
export function normalizePhoneE164(
  input?: string | null,
  defaultCountry = 'TR',
): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, '');
  if (!digits) return null;

  if (defaultCountry === 'TR') {
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('90') && digits.length >= 12) {
      return `+${digits}`;
    }
    if (digits.startsWith('0') && digits.length === 11) {
      return `+90${digits.slice(1)}`;
    }
    if (digits.length === 10 && digits.startsWith('5')) {
      return `+90${digits}`;
    }
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

/** E-posta / UI için okunabilir TR cep: +90 5XX XXX XX XX */
export function formatPhoneDisplay(input?: string | null): string {
  if (!input?.trim()) return '';
  const e164 = normalizePhoneE164(input);
  if (!e164) return input.trim();
  const digits = e164.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) {
    const local = digits.slice(2);
    return `+90 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
  }
  return e164;
}
