/** Silinemez / pasifleştirilemez yönetici allowlist e-postaları */
export const PROTECTED_ADMIN_EMAILS = [
  'emrekilic19983@gmail.com',
  'info@herbalkapida.com',
] as const;

export function isProtectedAdminEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return (PROTECTED_ADMIN_EMAILS as readonly string[]).includes(normalized);
}
