"use client";

import { Link, toLinkHref, asRouterHref, useRouter } from "@/i18n/routing";
import { trackingHref } from "@/i18n/hrefs";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { Reveal } from "@/components/Reveal";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ApiError,
  createReturnRequest,
  getOrderById,
  getOrderReturnRequests,
  retryPayment,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { shippingMethodLabel } from "@/lib/shipping";
import { formatMoney } from "@/lib/format";
import {
  orderStatusHint,
  shipmentStatusLabel,
} from "@/lib/order-status-i18n";
import { redirectToPayment } from "@/lib/payment-redirect";
import type { Order, ReturnRequest, ReturnRequestType } from "@/lib/types";

function returnStatusLabel(
  status: string,
  tr: (key: string) => string,
): string {
  const map: Record<string, string> = {
    requested: tr("returnRequested"),
    approved: tr("returnApproved"),
    rejected: tr("returnRejected"),
    completed: tr("returnCompleted"),
  };
  return map[status] || status;
}

export default function OrderDetailPage() {
  const t = useTranslations("orderDetail");
  const tStatus = useTranslations("orderStatus");
  const tShipping = useTranslations("shipping");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [returnType, setReturnType] = useState<ReturnRequestType>("cancel");
  const [returnReason, setReturnReason] = useState("");
  const [returnBusy, setReturnBusy] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnOk, setReturnOk] = useState<string | null>(null);

  async function load() {
    const token = getToken();
    if (!token) {
      router.replace(asRouterHref("/giris?next=/hesabim"));
      return;
    }
    const [o, r] = await Promise.all([
      getOrderById(params.id, token),
      getOrderReturnRequests(params.id, token),
    ]);
    setOrder(o);
    setReturns(r);
    if (o?.status === "paid" || o?.status === "processing") {
      setReturnType("cancel");
    } else if (o?.status === "shipped" || o?.status === "delivered") {
      setReturnType("return");
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="page-shell py-24 font-meta text-sm uppercase text-secondary animate-fade-up">
        {t("loading")}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-shell py-24 page-enter">
        <p className="font-meta text-sm uppercase text-error">
          {t("notFound")}
        </p>
        <Link
          href={toLinkHref("/hesabim?sekme=siparisler")}
          className="btn-ghost mt-8 inline-block px-8 py-4 text-xs"
        >
          {t("backAccount")}
        </Link>
      </div>
    );
  }

  const shipments = order.shipments || [];
  const hint = orderStatusHint(order.status, tStatus);
  const discount = Number(order.discountAmount || 0);
  function paymentMethodLabel(provider?: string | null): string {
    if (provider === "cod") return t("paymentMethodCod");
    if (provider === "bank_transfer") return t("paymentMethodBank");
    return t("paymentMethodPaytr");
  }
  const openReturn = returns.find((r) => r.status === "requested");
  const canRequestCancel =
    !openReturn &&
    (order.status === "paid" || order.status === "processing");
  const canRequestReturn =
    !openReturn &&
    (order.status === "shipped" || order.status === "delivered");
  const showReturnForm = canRequestCancel || canRequestReturn;

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function onRetryPay() {
    const token = getToken();
    if (!token || !order) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const result = await retryPayment(
        order.id,
        order.customerEmail,
        token,
      );
      if (!redirectToPayment(result)) {
        setRetryError(t("errRedirect"));
      }
    } catch (err) {
      setRetryError(
        err instanceof ApiError ? err.message : t("errRetry"),
      );
    } finally {
      setRetrying(false);
    }
  }

  async function onSubmitReturn(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !order) return;
    setReturnBusy(true);
    setReturnError(null);
    setReturnOk(null);
    try {
      await createReturnRequest(order.id, token, {
        type: returnType,
        reason: returnReason.trim(),
      });
      setReturnReason("");
      setReturnOk(t("requestSent"));
      await load();
    } catch (err) {
      setReturnError(
        err instanceof ApiError ? err.message : t("requestFailed"),
      );
    } finally {
      setReturnBusy(false);
    }
  }

  return (
    <div className="page-shell py-16 md:py-24">
      <div className="page-enter">
        <Link
          href={toLinkHref("/hesabim?sekme=siparisler")}
          className="font-meta text-[11px] uppercase text-secondary hover:text-primary"
        >
          ← Hesabım
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl">
              {order.orderNumber}
            </h1>
            <p className="mt-2 font-meta text-[11px] uppercase text-secondary">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString(locale)
                : null}
              {order.shippingProvider
                ? ` · ${shippingMethodLabel(order.shippingProvider, tShipping("storePickup"))}`
                : null}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <Reveal className="mt-10" delay={40}>
        <OrderStatusStepper status={order.status} />
        {hint ? (
          <p className="mt-4  font-meta text-xs uppercase leading-relaxed text-secondary">
            {hint}
          </p>
        ) : null}
        {order.status === "pending_payment" &&
        order.payment?.provider === "bank_transfer" ? (
          <p className="mt-4 font-meta text-xs uppercase leading-relaxed text-secondary">
            {t("bankTransferHint")}{" "}
            <Link href="/banka-hesaplari" className="text-primary underline">
              {t("bankAccountsLink")}
            </Link>
          </p>
        ) : null}
        {order.status === "pending_payment" &&
        order.payment?.provider !== "bank_transfer" &&
        order.payment?.provider !== "cod" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={retrying}
              onClick={() => void onRetryPay()}
              className="btn-cta px-6 py-3 text-xs disabled:opacity-50"
            >
              {retrying ? t("redirecting") : t("completePayment")}
            </button>
            {retryError ? (
              <p className="font-meta text-[11px] uppercase text-error">
                {retryError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <Reveal variant="left">
            <section className="panel-motion industrial-border bg-surface-container-low p-6">
              <h2 className="mb-4 font-display text-2xl">{t("itemsHeading")}</h2>
              <div className="divide-y divide-outline-variant/20">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="row-motion flex justify-between gap-4 py-4 font-meta text-xs uppercase"
                  >
                    <div className="flex min-w-0 gap-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg border border-outline-variant/30 object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                      <div className="text-on-surface">{item.productName}</div>
                      <div className="mt-1 text-secondary">
                        {[item.variantLabel].filter(Boolean).join(" · ") ||
                          "—"}{" "}
                        × {item.quantity}
                      </div>
                      </div>
                    </div>
                    <div className="text-primary">
                      {formatMoney(item.lineTotal, order.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal variant="left" delay={80}>
            <section className="panel-motion industrial-border bg-surface-container-low p-6">
              <h2 className="mb-4 font-display text-2xl">
                {order.shippingProvider === "store_pickup" ? t("deliveryHeading") : t("shippingHeading")}
              </h2>
              {order.shippingProvider === "store_pickup" ? (
                <p className="font-meta text-xs uppercase text-secondary">
                  {t("pickupInfo")}
                </p>
              ) : shipments.length === 0 ? (
                <p className="font-meta text-xs uppercase text-secondary">
                  {t("noShipmentYet")}
                </p>
              ) : (
                <div className="space-y-6">
                  {shipments.map((s) => (
                    <div
                      key={s.id}
                      className="border border-outline-variant/30 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-meta text-[10px] uppercase text-secondary">
                            {s.provider}
                          </p>
                          <p className="mt-1 font-display text-xl">
                            {s.trackingNumber || t("trackingPending")}
                          </p>
                        </div>
                        <StatusBadge status={s.status} kind="shipment" />
                      </div>
                      <p className="mt-2 font-meta text-[10px] uppercase text-secondary">
                        {shipmentStatusLabel(s.status, tStatus)}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {s.trackingNumber ? (
                          <>
                            <Link
                              href={trackingHref(s.trackingNumber)}
                              className="btn-cta px-5 py-3 text-[10px]"
                            >
                              {t("liveTrack")}
                            </Link>
                            <button
                              type="button"
                              onClick={() => void copyCode(s.trackingNumber!)}
                              className="border border-outline-variant/40 px-5 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
                            >
                              {copied ? t("copied") : t("copyCode")}
                            </button>
                          </>
                        ) : null}
                        {s.trackingUrl ? (
                          <a
                            href={s.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="border border-outline-variant/40 px-5 py-3 font-meta text-[10px] uppercase tracking-widest hover:border-primary"
                          >
                            {t("carrierSite")}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>

          <Reveal variant="left" delay={120}>
            <section className="panel-motion industrial-border bg-surface-container-low p-6">
              <h2 className="mb-4 font-display text-2xl">{t("returnsHeading")}</h2>
              {returns.length > 0 ? (
                <ul className="mb-6 space-y-3">
                  {returns.map((r) => (
                    <li
                      key={r.id}
                      className="border border-outline-variant/30 p-4 font-meta text-[11px] uppercase"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-primary">
                          {r.type === "cancel" ? t("typeCancel") : t("typeReturn")}
                        </span>
                        <span className="text-secondary">
                          {returnStatusLabel(r.status, t)}
                        </span>
                      </div>
                      <p className="mt-2 normal-case tracking-normal text-secondary">
                        {r.reason}
                      </p>
                      {r.adminNote ? (
                        <p className="mt-2 normal-case tracking-normal text-on-surface">
                          {t("adminNote")}: {r.adminNote}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {showReturnForm ? (
                <form onSubmit={onSubmitReturn} className="space-y-4">
                  <p className="font-meta text-[11px] uppercase leading-relaxed text-secondary">
                    {canRequestCancel ? t("cancelHint") : t("returnHint")}
                  </p>
                  {canRequestCancel && canRequestReturn ? (
                    <select
                      value={returnType}
                      onChange={(e) =>
                        setReturnType(e.target.value as ReturnRequestType)
                      }
                      className="field-input"
                    >
                      <option value="cancel">{t("typeCancel")}</option>
                      <option value="return">{t("typeReturn")}</option>
                    </select>
                  ) : null}
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                    minLength={10}
                    rows={4}
                    placeholder={t("reasonPlaceholder")}
                    className="field-input min-h-28 normal-case"
                  />
                  {returnError ? (
                    <p className="font-meta text-[11px] uppercase text-error">
                      {returnError}
                    </p>
                  ) : null}
                  {returnOk ? (
                    <p className="font-meta text-[11px] uppercase text-primary">
                      {returnOk}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={returnBusy || returnReason.trim().length < 10}
                    className="btn-cta px-6 py-3 text-xs disabled:opacity-50"
                  >
                    {returnBusy ? t("sending") : t("submitRequest")}
                  </button>
                  <p className="font-meta text-[10px] uppercase text-secondary">
                    {t("returnsPolicyBefore")}{" "}
                    <Link href="/iptal-iade" className="text-primary underline">
                      {t("returnsPolicyLink")}
                    </Link>
                    .
                  </p>
                </form>
              ) : openReturn ? (
                <p className="font-meta text-xs uppercase text-secondary">
                  {t("openRequestReview")}
                </p>
              ) : (
                <p className="font-meta text-xs uppercase text-secondary">
                  {t("cannotOpenRequest")}
                </p>
              )}
            </section>
          </Reveal>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <Reveal variant="right" delay={60}>
            <div className="panel-motion industrial-border p-6 font-meta text-xs uppercase">
              <h3 className="mb-4 font-display text-xl normal-case tracking-normal">
                {t("amountHeading")}
              </h3>
              <div className="space-y-2 text-secondary">
                <div className="flex justify-between">
                  <span>{t("subtotal")}</span>
                  <span>{formatMoney(order.subtotal, order.currency)}</span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between">
                    <span>
                      {t("discount")}
                      {order.couponCode ? ` (${order.couponCode})` : ""}
                    </span>
                    <span>−{formatMoney(discount, order.currency)}</span>
                  </div>
                ) : null}
                  <div className="flex justify-between">
                    <span>
                      {order.shippingProvider === "store_pickup"
                        ? t("deliveryLabel")
                        : t("shippingLabel")}
                    </span>
                    <span>
                      {order.shippingProvider === "store_pickup"
                        ? t("pickupFree")
                        : formatMoney(order.shippingFee, order.currency)}
                    </span>
                  </div>
                {order.taxAmount ? (
                  <div className="flex justify-between">
                    <span>{t("vat")}</span>
                    <span>{formatMoney(order.taxAmount, order.currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-primary">
                  <span>{t("total")}</span>
                  <span>{formatMoney(order.total, order.currency)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>{t("paymentMethod")}</span>
                  <span className="text-right text-on-surface">
                    {paymentMethodLabel(order.payment?.provider)}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div className="panel-motion industrial-border p-6 font-meta text-xs uppercase">
              <h3 className="mb-4 font-display text-xl normal-case tracking-normal">
                {t("deliveryAddress")}
              </h3>
              {order.shippingProvider === "store_pickup" ? (
                <p className="mb-3 text-primary">{t("pickupInfo")}</p>
              ) : null}
              <p className="text-secondary">
                {order.customerName}
                <br />
                {order.shippingAddress?.addressLine}
                <br />
                {order.shippingAddress?.district} / {order.shippingAddress?.city}
                {order.shippingAddress?.postalCode
                  ? ` · ${order.shippingAddress.postalCode}`
                  : null}
              </p>
            </div>
          </Reveal>

          <Reveal variant="right" delay={180}>
            <div className="panel-motion industrial-border p-6 font-meta text-xs uppercase">
              <h3 className="mb-4 font-display text-xl normal-case tracking-normal">
                Fatura
              </h3>
              <p className="text-secondary">
                {(order.billingAddress || order.shippingAddress)?.addressLine}
                <br />
                {(order.billingAddress || order.shippingAddress)?.district} /{" "}
                {(order.billingAddress || order.shippingAddress)?.city}
              </p>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
