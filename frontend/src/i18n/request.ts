import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getApiBase } from '@/lib/api';

const UI_MESSAGES_TIMEOUT_MS = 4000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMergeMessages(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, overlayVal] of Object.entries(overlay)) {
    const baseVal = result[key];
    if (isPlainObject(overlayVal) && isPlainObject(baseVal)) {
      result[key] = deepMergeMessages(baseVal, overlayVal);
    } else {
      result[key] = overlayVal;
    }
  }
  return result;
}

async function fetchUiMessagesFromApi(
  locale: string,
): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UI_MESSAGES_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getApiBase()}/cms/ui-messages?locale=${encodeURIComponent(locale)}`,
      {
        signal: controller.signal,
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  let localMessages: Record<string, unknown>;
  try {
    localMessages = (await import(`../../messages/${locale}.json`))
      .default as Record<string, unknown>;
  } catch {
    localMessages = (await import(`../../messages/en.json`))
      .default as Record<string, unknown>;
  }
  const remoteMessages = await fetchUiMessagesFromApi(locale);
  const messages = remoteMessages
    ? (deepMergeMessages(localMessages, remoteMessages) as typeof localMessages)
    : localMessages;

  return {
    locale,
    messages,
    timeZone: 'Europe/Istanbul',
  };
});
