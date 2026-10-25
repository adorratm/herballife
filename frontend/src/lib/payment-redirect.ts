/** retry / initialize sonrası ortak yönlendirme */
export function redirectToPayment(result: {
  provider?: string;
  paymentPageUrl?: string;
  iframeUrl?: string | null;
  token?: string;
  checkoutFormContent?: string;
  orderId?: string;
  orderNumber?: string;
}): boolean {
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
