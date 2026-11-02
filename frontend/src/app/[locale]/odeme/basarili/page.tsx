"use client";

import { Link, toLinkHref } from "@/i18n/routing";
import { orderHref } from "@/i18n/hrefs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { Reveal } from "@/components/Reveal";
import { getToken } from "@/lib/auth";
import { getOrderById } from "@/lib/api";
import { trackPurchase } from "@/lib/analytics";
import { useAnalyticsIds } from "@/lib/analytics-ids";

function SuccessContent() {
  const t = useTranslations("paymentSuccess");
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const rawMethod = params.get("method");
  const method: "cod" | "bank_transfer" | null =
    rawMethod === "cod" || rawMethod === "bank_transfer" ? rawMethod : null;
  const orderNumber =
    params.get("orderNumber") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("herbalkapida_last_order_number")
      : null);
  const [loggedIn, setLoggedIn] = useState(false);
  const analyticsIds = useAnalyticsIds();

  useEffect(() => {
    const token = getToken();
    setLoggedIn(Boolean(token));
    if (orderNumber) {
      sessionStorage.setItem("herbalkapida_last_order_number", orderNumber);
    }
    if (!orderId) return;
    sessionStorage.setItem("herbalkapida_last_order_id", orderId);

    let cancelled = false;
    (async () => {
      let value: number | undefined;
      let currency = "TRY";
      if (token) {
        const order = await getOrderById(orderId, token);
        if (order) {
          value = Number(order.total);
          currency = order.currency || "TRY";
        }
      }
      if (cancelled) return;
      trackPurchase({
        id: orderId,
        orderNumber,
        value,
        currency,
        ga4Id: analyticsIds.ga4Id || undefined,
        gtmId: analyticsIds.gtmId || undefined,
        googleAdsId: analyticsIds.googleAdsId || undefined,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, orderNumber, analyticsIds.ga4Id, analyticsIds.gtmId, analyticsIds.googleAdsId]);

  const outlineBtn =
    "inline-flex items-center justify-center border border-outline-variant/40 px-5 py-3 font-meta text-[10px] uppercase tracking-widest transition-colors hover:border-primary sm:px-6";

  return (
    <div className="page-shell bg-surface py-10 md:py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-10 flex w-full justify-center">
          <CheckoutSteps active={3} />
        </div>

        <div className="page-enter w-full">
          <div className="relative mx-auto mb-6 inline-flex">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-3xl text-primary">
              ✓
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {method === "cod"
              ? t("codKicker")
              : method === "bank_transfer"
                ? t("bankKicker")
                : t("kicker")}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-on-surface-variant">
            {method === "cod"
              ? t("codLead")
              : method === "bank_transfer"
                ? t("bankLead")
                : t("lead")}
          </p>
          <p className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            {t("orderReceived")}
          </p>
        </div>

        <Reveal fill={false} className="mt-10 w-full" delay={60}>
          <div className="industrial-border bg-surface-container-low p-5 text-center sm:p-7 md:p-8">
            {orderNumber ? (
              <div className="mb-7">
                <p className="font-meta text-[10px] uppercase text-secondary">
                  {t("orderNo")}
                </p>
                <p className="mt-2 break-all font-display text-2xl sm:text-3xl">
                  {orderNumber}
                </p>
              </div>
            ) : (
              <p className="mb-7 font-meta text-xs uppercase text-secondary">
                {t("orderNoEmail")}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              {method === "bank_transfer" ? (
                <>
                  <Link
                    href="/banka-hesaplari"
                    className="btn-cta px-5 py-3 text-xs sm:px-6"
                  >
                    {t("bankAccountsLink")}
                  </Link>
                  <Link href="/odeme-bildirimi" className={outlineBtn}>
                    {t("paymentNoticeLink")}
                  </Link>
                </>
              ) : null}
              {loggedIn && orderId ? (
                <Link
                  href={orderHref(orderId)}
                  className="btn-cta px-5 py-3 text-xs sm:px-6"
                >
                  {t("orderDetail")}
                </Link>
              ) : (
                <Link
                  href={toLinkHref(
                    orderNumber
                      ? `/siparis-sorgula?orderNumber=${encodeURIComponent(orderNumber)}`
                      : "/siparis-sorgula",
                  )}
                  className="btn-cta px-5 py-3 text-xs sm:px-6"
                >
                  {t("lookupOrder")}
                </Link>
              )}
              {loggedIn ? (
                <Link href="/hesabim" className={outlineBtn}>
                  {t("myAccount")}
                </Link>
              ) : (
                <Link href="/giris" className={outlineBtn}>
                  {t("signIn")}
                </Link>
              )}
              <Link href="/urunler" className={outlineBtn}>
                {t("continueShopping")}
              </Link>
              <Link href="/takip" className={outlineBtn}>
                {t("trackShipment")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const t = useTranslations("paymentSuccess");
  return (
    <Suspense
      fallback={
        <div className="page-shell py-24 text-center font-meta text-sm uppercase text-secondary">
          {t("loading")}
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
