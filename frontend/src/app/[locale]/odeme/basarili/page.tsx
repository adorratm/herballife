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
  const orderNumber =
    params.get("orderNumber") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("herbalife_last_order_number")
      : null);
  const [loggedIn, setLoggedIn] = useState(false);
  const analyticsIds = useAnalyticsIds();

  useEffect(() => {
    const token = getToken();
    setLoggedIn(Boolean(token));
    if (orderNumber) {
      sessionStorage.setItem("herbalife_last_order_number", orderNumber);
    }
    if (!orderId) return;
    sessionStorage.setItem("herbalife_last_order_id", orderId);

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

  return (
    <div className="page-shell bg-surface py-10 md:py-14">
      <div className="mb-8 flex justify-end">
        <CheckoutSteps active={3} />
      </div>
      <div className="page-enter max-w-xl">
        <div className="relative mb-6 inline-flex">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-2xl text-primary">
            ✓
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
          {t("lead")}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          {t("orderReceived")}
        </p>
      </div>

      <Reveal className="mt-10 max-w-xl" delay={60}>
        <div className="industrial-border bg-surface-container-low p-6 md:p-8">
          {orderNumber ? (
            <div className="mb-6">
              <p className="font-meta text-[10px] uppercase text-secondary">
                {t("orderNo")}
              </p>
              <p className="mt-1 font-display text-3xl">{orderNumber}</p>
            </div>
          ) : (
            <p className="mb-6 font-meta text-xs uppercase text-secondary">
              {t("orderNoEmail")}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {loggedIn && orderId ? (
              <Link
                href={orderHref(orderId)}
                className="btn-cta px-6 py-3 text-xs"
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
                className="btn-cta px-6 py-3 text-xs"
              >
                {t("lookupOrder")}
              </Link>
            )}
            {loggedIn ? (
              <Link
                href="/hesabim"
                className="border border-outline-variant/40 px-6 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
              >
                {t("myAccount")}
              </Link>
            ) : (
              <Link
                href="/giris"
                className="border border-outline-variant/40 px-6 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
              >
                {t("signIn")}
              </Link>
            )}
            <Link
              href="/urunler"
              className="border border-outline-variant/40 px-6 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
            >
              {t("continueShopping")}
            </Link>
            <Link
              href="/takip"
              className="border border-outline-variant/40 px-6 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
            >
              {t("trackShipment")}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const t = useTranslations("paymentSuccess");
  return (
    <Suspense
      fallback={
        <div className="page-shell py-24 font-meta text-sm uppercase text-secondary">
          {t("loading")}
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
