import { getPathname } from "@/i18n/routing";

/** retry / initialize sonrası ortak yönlendirme */
export function redirectToPayment(
  result: {
    provider?: string;
    paymentPageUrl?: string | null;
    iframeUrl?: string | null;
    token?: string;
    checkoutFormContent?: string;
    orderId?: string;
    orderNumber?: string;
  },
  locale: string = "tr",
): boolean {
  // Kapıda ödeme / havale-EFT: online ödeme adımı yok, onay sayfasına git
  if (result.provider === "cod" || result.provider === "bank_transfer") {
    const query: Record<string, string> = { method: result.provider };
    if (result.orderId) query.orderId = result.orderId;
    if (result.orderNumber) query.orderNumber = result.orderNumber;
    window.location.href = getPathname({
      href: { pathname: "/odeme/basarili", query },
      locale,
    });
    return true;
  }

  if (result.paymentPageUrl) {
    window.location.href = result.paymentPageUrl;
    return true;
  }

  if (result.provider === "paytr" && result.token) {
    const qs = new URLSearchParams({ token: result.token });
    if (result.orderId) qs.set("orderId", result.orderId);
    if (result.orderNumber) qs.set("orderNumber", result.orderNumber);
    window.location.href = `/odeme/paytr?${qs}`;
    return true;
  }

  return false;
}
