"use client";

import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { ApiError, retryPayment } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirectToPayment } from "@/lib/payment-redirect";

function FailureContent() {
  const t = useTranslations("paymentFailure");
  const params = useSearchParams();
  const orderId =
    params.get("orderId") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("herbalife_last_order_id")
      : null);
  const orderNumber =
    params.get("orderNumber") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("herbalife_last_order_number")
      : null);
  const reason = params.get("reason");
  const [loggedIn, setLoggedIn] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, []);

  async function onRetry() {
    if (!orderId) {
      setError(t("errNoOrder"));
      return;
    }
    setRetrying(true);
    setError(null);
    try {
      const email =
        typeof window !== "undefined"
          ? sessionStorage.getItem("herbalife_last_order_email") || undefined
          : undefined;
      const result = await retryPayment(orderId, email, getToken());
      if (!redirectToPayment(result)) {
        setError(t("errRedirect"));
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("errRetry"),
      );
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="page-shell py-16 md:py-24">
      <div className="page-enter max-w-xl">
        <p className="font-meta text-xs uppercase tracking-widest text-error">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 font-meta text-xs uppercase leading-relaxed text-secondary">
          {t("lead")}
        </p>
      </div>

      <Reveal className="mt-10 max-w-xl" delay={60}>
        <div className="industrial-border bg-surface-container-low p-6 md:p-8">
          {orderNumber ? (
            <div className="mb-4">
              <p className="font-meta text-[10px] uppercase text-secondary">
                {t("orderNo")}
              </p>
              <p className="mt-1 font-display text-2xl">{orderNumber}</p>
            </div>
          ) : null}
          {reason ? (
            <p className="mb-6 font-meta text-[11px] uppercase text-error">
              {reason}
            </p>
          ) : (
            <p className="mb-6 font-meta text-[11px] uppercase text-secondary">
              {t("providerDeclined")}
            </p>
          )}
          {error ? (
            <p className="mb-4 font-meta text-[11px] uppercase text-error">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {orderId ? (
              <button
                type="button"
                disabled={retrying}
                onClick={() => void onRetry()}
                className="btn-cta px-6 py-3 text-xs disabled:opacity-50"
              >
                {retrying ? t("redirecting") : t("retry")}
              </button>
            ) : (
              <Link href="/urunler" className="btn-cta px-6 py-3 text-xs">
                {t("newOrder")}
              </Link>
            )}
            <Link
              href="/urunler"
              className="border border-outline-variant/40 px-6 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
            >
              {t("continueShopping")}
            </Link>
            {loggedIn && orderId ? (
              <Link
                href={`/hesabim/siparisler/${orderId}`}
                className="border border-outline-variant/40 px-6 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
              >
                {t("orderStatus")}
              </Link>
            ) : null}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default function PaymentFailurePage() {
  const t = useTranslations("paymentFailure");
  return (
    <Suspense
      fallback={
        <div className="page-shell py-24 font-meta text-sm uppercase text-secondary">
          {t("loading")}
        </div>
      }
    >
      <FailureContent />
    </Suspense>
  );
}
