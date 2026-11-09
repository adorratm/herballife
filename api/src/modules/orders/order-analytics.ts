import { createHmac, timingSafeEqual } from 'crypto';
import type { ConfigService } from '@nestjs/config';

/**
 * Ödeme başarı sayfasının (misafir dahil) sipariş tutarını okuyabilmesi için
 * sipariş ID'sine bağlı, tahmin edilemeyen imza. DB alanı gerektirmez.
 * Yalnızca dönüşüm ölçümü için gereken alanları açar (kişisel veri yok).
 */
function secret(config: ConfigService): string {
  return (
    config.get<string>('analyticsTokenSecret') ||
    config.get<string>('jwt.secret') ||
    'change-me-in-production'
  );
}

export function orderAnalyticsToken(
  config: ConfigService,
  orderId: string,
): string {
  return createHmac('sha256', secret(config))
    .update(`order-analytics:${orderId}`)
    .digest('base64url')
    .slice(0, 32);
}

export function verifyOrderAnalyticsToken(
  config: ConfigService,
  orderId: string,
  token: string | undefined | null,
): boolean {
  if (!token) return false;
  const expected = Buffer.from(orderAnalyticsToken(config, orderId));
  const received = Buffer.from(String(token));
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
