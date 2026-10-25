"use client";

import { AppImage as Image } from "@/components/AppImage";
import { Link, asRouterHref, useRouter } from "@/i18n/routing";
import { productHref } from "@/i18n/hrefs";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { FreeShippingBanner } from "@/components/FreeShippingBanner";
import { Reveal } from "@/components/Reveal";
import {
  cartItemCount,
  cartRemoveItem,
  cartSubtotal,
  cartUpdateQuantity,
  fetchCart,
  getCartSessionId,
} from "@/lib/cart";
import { getProductsPaged, setCartGuestEmail } from "@/lib/api";
import { useActiveCurrency } from "@/hooks/useActiveCurrency";
import { getToken, isAuthenticated, loginHref } from "@/lib/auth";
import { formatMoney, productImage } from "@/lib/format";
import { toggleWishlistProduct } from "@/lib/wishlist";
import type { Cart, Product } from "@/lib/types";

export default function CartPage() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const intlLocale = useLocale();
  const { currency: activeCurrency } = useActiveCurrency();
  const catalogLocale = useMemo(
    () => ({
      locale: intlLocale,
      currency: activeCurrency,
    }),
    [intlLocale, activeCurrency],
  );
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [upsells, setUpsells] = useState<Product[]>([]);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCart();
      setCart(data);
      if (data?.guestEmail) setGuestEmail(data.guestEmail);
    } catch {
      setCart(null);
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    reload();
  }, []);

  useEffect(() => {
    void getProductsPaged({
      ...catalogLocale,
      limit: 8,
      sort: "createdAt",
      order: "desc",
    })
      .then((page) => setUpsells(page.items || []))
      .catch(() => setUpsells([]));
  }, [catalogLocale]);

  const cartProductIds = useMemo(
    () => new Set((cart?.items || []).map((i) => i.productId)),
    [cart],
  );

  const suggested = useMemo(
    () => upsells.filter((p) => !cartProductIds.has(p.id)).slice(0, 3),
    [upsells, cartProductIds],
  );

  async function saveGuestEmail() {
    const email = guestEmail.trim();
    if (!email) return;
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      const next = await setCartGuestEmail(
        getCartSessionId(),
        email,
        getToken(),
      );
      setCart(next);
      setEmailMsg(t("emailSaved"));
    } catch {
      setEmailMsg(t("emailSaveError"));
    } finally {
      setEmailSaving(false);
    }
  }

  async function changeQty(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setBusy(itemId);
    setError(null);
    try {
      setCart(await cartUpdateQuantity(itemId, quantity));
    } catch {
      setError(t("qtyError"));
    } finally {
      setBusy(null);
    }
  }

  async function remove(itemId: string) {
    setBusy(itemId);
    setError(null);
    try {
      setCart(await cartRemoveItem(itemId));
    } catch {
      setError(t("removeError"));
    } finally {
      setBusy(null);
    }
  }

  async function moveToFavorites(itemId: string, productId: string) {
    setBusy(itemId);
    setError(null);
    try {
      const result = await toggleWishlistProduct(productId);
      if ("needsAuth" in result) {
        router.push(loginHref("/sepet"));
        return;
      }
      if (!result.inWishlist) {
        await toggleWishlistProduct(productId);
      }
      setCart(await cartRemoveItem(itemId));
    } catch {
      setError(t("favoritesError"));
    } finally {
      setBusy(null);
    }
  }

  const count = cartItemCount(cart);
  const subtotal = cartSubtotal(cart);

  return (
    <div className="page-shell min-h-screen bg-surface py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs text-on-surface-variant">
            <Link href="/" className="hover:text-primary">
              {tCommon("home")}
            </Link>
            <span className="mx-1">/</span>
            <span className="font-semibold text-on-surface">{t("title")}</span>
          </p>
          <h1 className="font-display text-3xl text-on-surface md:text-4xl">
            {t("pageTitle")}
          </h1>
        </div>
        <CheckoutSteps active={1} />
      </div>

      {error ? (
        <p className="mb-6 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-on-surface-variant">{tCommon("loading")}</p>
      ) : !count ? (
        <div className="rounded-xl bg-surface-container-lowest p-10 shadow-sm">
          <p className="text-sm text-on-surface-variant">{t("empty")}</p>
          <Link href="/urunler" className="btn-cta mt-6 inline-block px-6 py-3">
            {t("emptyAction")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <FreeShippingBanner subtotal={subtotal} />

            <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm md:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-surface-container pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl">{t("itemsHeading")}</h2>
                  <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-primary">
                    {t("itemCount", { count })}
                  </span>
                </div>
                <Link
                  href="/urunler"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("continueShopping")}
                </Link>
              </div>

              <div className="divide-y divide-surface-container">
                {cart?.items.map((item) => {
                  const name = item.product?.name || tCommon("product");
                  const productSlug = item.product?.slug?.trim();
                  const img = productImage(
                    item.product?.imageUrl,
                    productSlug || item.productId,
                  );
                  const productLeft = (
                    <>
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                        <Image
                          src={img}
                          alt={name}
                          fill
                          className="object-contain p-2"
                          sizes="96px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                          {item.product?.category?.name || tCommon("product")}
                        </p>
                        <h3 className="truncate text-sm font-semibold text-on-surface">
                          {name}
                        </h3>
                          {item.variant?.weightLabel ? (
                            <p className="mt-1 text-xs text-on-surface-variant">
                              {item.variant.weightLabel}
                            </p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <button
                              type="button"
                              disabled={busy === item.id}
                              onClick={() => void remove(item.id)}
                              className="text-error hover:underline"
                            >
                              {t("remove")}
                            </button>
                            <span className="text-outline-variant">·</span>
                            <button
                              type="button"
                              disabled={busy === item.id}
                              onClick={() =>
                                void moveToFavorites(item.id, item.productId)
                              }
                              className="text-on-surface-variant hover:text-primary"
                            >
                              {t("moveToFavorites")}
                            </button>
                          </div>
                        </div>
                    </>
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {productSlug ? (
                        <Link
                          href={productHref(productSlug)}
                          className="flex min-w-0 items-center gap-4 transition-opacity hover:opacity-90"
                        >
                          {productLeft}
                        </Link>
                      ) : (
                        <div className="flex min-w-0 items-center gap-4">
                          {productLeft}
                        </div>
                      )}
                      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
                        <div className="flex items-center rounded-full bg-surface-container-low px-2 py-1 shadow-sm">
                          <button
                            type="button"
                            disabled={busy === item.id}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest"
                            onClick={() =>
                              changeQty(item.id, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={busy === item.id}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest"
                            onClick={() =>
                              changeQty(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {formatMoney(
                            Number(item.unitPrice) * item.quantity,
                            item.product?.currency || "TRY",
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {suggested.length > 0 ? (
              <Reveal>
                <div className="rounded-xl bg-surface-container-lowest p-5 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {t("upsellEyebrow")}
                  </p>
                  <h2 className="mt-1 font-display text-xl">
                    {t("upsellTitle")}
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {suggested.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col rounded-xl border border-surface-container p-3"
                      >
                        <Link href={productHref(p.slug)} className="group">
                          <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
                            <Image
                              src={productImage(p.imageUrl, p.slug)}
                              alt={p.name}
                              fill
                              className="object-cover transition group-hover:scale-105"
                              sizes="180px"
                            />
                          </div>
                          <p className="line-clamp-2 text-sm font-semibold">
                            {p.name}
                          </p>
                          <p className="mt-1 text-sm text-primary">
                            {formatMoney(
                              p.salePrice ?? p.basePrice,
                              p.currency,
                            )}
                          </p>
                        </Link>
                        <div className="mt-2">
                          <AddToCartButton
                            productId={p.id}
                            productName={p.name}
                            price={Number(p.salePrice ?? p.basePrice)}
                            label={tCommon("add")}
                            goToCart={false}
                            className="btn-ghost w-full py-2 text-xs"
                            onAdded={() => void reload()}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <h2 className="mb-4 font-display text-xl">{t("orderSummary")}</h2>
              <div className="space-y-3 border-b border-surface-container pb-4 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t("productsLine", { count })}</span>
                  <span>{formatMoney(subtotal, "TRY")}</span>
                </div>
                <div className="flex justify-between font-semibold text-on-surface">
                  <span>{t("subtotal")}</span>
                  <span className="text-primary">{formatMoney(subtotal, "TRY")}</span>
                </div>
              </div>
              {!loggedIn ? (
                <div className="mt-4 space-y-2">
                  <label className="field-label">{t("guestEmailLabel")}</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder={t("guestEmailPlaceholder")}
                    className="field-input"
                  />
                  <button
                    type="button"
                    disabled={emailSaving || !guestEmail.trim()}
                    onClick={() => void saveGuestEmail()}
                    className="btn-ghost w-full py-2 text-xs disabled:opacity-50"
                  >
                    {emailSaving ? tCommon("saving") : t("saveEmail")}
                  </button>
                  {emailMsg ? (
                    <p className="text-[11px] text-on-surface-variant">
                      {emailMsg}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <Link
                href="/odeme"
                className="btn-cta mt-5 block w-full py-3.5 text-center text-sm"
              >
                {t("checkout")}
              </Link>
              <ul className="mt-4 space-y-1.5 text-[11px] text-on-surface-variant">
                <li>{t("trustPaytr")}</li>
                <li>{t("trustReturn")}</li>
                <li>{t("trustOriginal")}</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
