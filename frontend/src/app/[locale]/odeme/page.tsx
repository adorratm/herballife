"use client";

import { Link } from "@/i18n/routing";
import { loginHref } from "@/lib/auth";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import {
  checkout,
  createAddress,
  getMe,
  getMyAddresses,
  getShippingProviders,
  updateAddress,
  validateCoupon,
} from "@/lib/api";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { getToken } from "@/lib/auth";
import {
  cartSubtotal,
  fetchCart,
  getCartSessionId,
} from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { calculateOrderTotals } from "@/lib/pricing";
import { trackBeginCheckout } from "@/lib/analytics";
import type {
  Address,
  Cart,
  CouponPreview,
  PaymentMethod,
  ShippingProvider,
  User,
} from "@/lib/types";

type AddressFields = {
  city: string;
  district: string;
  neighborhood: string;
  addressLine: string;
  postalCode: string;
};

type AddressMode = "saved" | "new";

const PAYMENT_METHOD_OPTIONS = [
  {
    value: "paytr",
    labelKey: "payMethodPaytr",
    descKey: "payMethodPaytrDesc",
  },
  {
    value: "cod",
    labelKey: "payMethodCod",
    descKey: "payMethodCodDesc",
  },
  {
    value: "bank_transfer",
    labelKey: "payMethodBank",
    descKey: "payMethodBankDesc",
  },
] as const satisfies ReadonlyArray<{
  value: PaymentMethod;
  labelKey: string;
  descKey: string;
}>;

const emptyAddr = (): AddressFields => ({
  city: "",
  district: "",
  neighborhood: "",
  addressLine: "",
  postalCode: "",
});

export default function CheckoutPage() {
  const locale = useLocale();
  const tCheckout = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tAccount = useTranslations("account");
  const tForms = useTranslations("forms");
  const [cart, setCart] = useState<Cart | null>(null);
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(
    null,
  );
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [shippingId, setShippingId] = useState<string>("");
  const [billingId, setBillingId] = useState<string>("");
  const [billingSame, setBillingSame] = useState(true);
  const [shippingMode, setShippingMode] = useState<AddressMode>("new");
  const [billingMode, setBillingMode] = useState<AddressMode>("new");
  const [saveShippingAddress, setSaveShippingAddress] = useState(true);
  const [saveBillingAddress, setSaveBillingAddress] = useState(false);
  const [defaultShippingOnSave, setDefaultShippingOnSave] = useState(true);
  const [defaultBillingOnSave, setDefaultBillingOnSave] = useState(false);
  const [newShippingTitle, setNewShippingTitle] = useState("");
  const [newBillingTitle, setNewBillingTitle] = useState("");
  const [defaultBusy, setDefaultBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paytr");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shipping: emptyAddr(),
    billing: emptyAddr(),
    shippingProvider: "",
    mesafeliSatis: false,
    onBilgilendirme: false,
    kvkk: false,
    notes: "",
  });
  const [corporateBilling, setCorporateBilling] = useState(false);
  const [corporate, setCorporate] = useState({
    companyTitle: "",
    taxNumber: "",
    taxOffice: "",
  });
  const [panelContact, setPanelContact] = useState(true);
  const [panelAddress, setPanelAddress] = useState(true);

  useEffect(() => {
    const token = getToken();
    Promise.all([
      fetchCart().catch(() => null),
      getShippingProviders(),
      token ? getMyAddresses(token) : Promise.resolve([] as Address[]),
      token ? getMe(token).catch(() => null) : Promise.resolve(null),
    ]).then(([cartData, providerData, addressData, me]) => {
      setCart(cartData);
      setProviders(providerData);
      setAddresses(addressData);
      setUser(me);

      if (cartData?.items?.length) {
        const subtotal = cartSubtotal(cartData);
        trackBeginCheckout({
          value: subtotal,
          currency: "TRY",
          itemCount: cartData.items.reduce((n, i) => n + i.quantity, 0),
        });
      }

      const defShip =
        addressData.find((a) => a.isDefaultShipping) || addressData[0];
      const defBill =
        addressData.find((a) => a.isDefaultBilling) || defShip;

      setForm((f) => {
        const next = { ...f };
        if (providerData[0] && !f.shippingProvider) {
          next.shippingProvider = providerData[0].code;
        }
        if (me) {
          next.customerEmail = me.email || f.customerEmail;
          next.customerName =
            [me.firstName, me.lastName].filter(Boolean).join(" ") ||
            f.customerName;
          next.customerPhone = me.phone || f.customerPhone;
        }
        if (defShip) {
          next.customerName = defShip.fullName || next.customerName;
          next.customerPhone = defShip.phone || next.customerPhone;
          next.shipping = {
            city: defShip.city,
            district: defShip.district,
            neighborhood: defShip.neighborhood || "",
            addressLine: defShip.addressLine,
            postalCode: defShip.postalCode,
          };
        }
        if (defBill && defBill.id !== defShip?.id) {
          next.billing = {
            city: defBill.city,
            district: defBill.district,
            neighborhood: defBill.neighborhood || "",
            addressLine: defBill.addressLine,
            postalCode: defBill.postalCode,
          };
        }
        return next;
      });

      if (defShip) {
        setShippingId(defShip.id);
        setShippingMode("saved");
      } else {
        setShippingMode("new");
      }
      if (defBill && defBill.id !== defShip?.id) {
        setBillingSame(false);
        setBillingId(defBill.id);
        setBillingMode("saved");
      } else if (defBill) {
        setBillingId(defBill.id);
        setBillingMode("saved");
      }

      setLoading(false);
    });
  }, [locale]);

  function applyAddressToShipping(addr: Address) {
    setForm((f) => ({
      ...f,
      customerName: addr.fullName || f.customerName,
      customerPhone: addr.phone || f.customerPhone,
      shipping: {
        city: addr.city,
        district: addr.district,
        neighborhood: addr.neighborhood || "",
        addressLine: addr.addressLine,
        postalCode: addr.postalCode,
      },
    }));
  }

  function applyAddressToBilling(addr: Address) {
    setForm((f) => ({
      ...f,
      billing: {
        city: addr.city,
        district: addr.district,
        neighborhood: addr.neighborhood || "",
        addressLine: addr.addressLine,
        postalCode: addr.postalCode,
      },
    }));
    if (addr.companyTitle || addr.taxNumber || addr.taxOffice) {
      setCorporateBilling(true);
      setCorporate({
        companyTitle: addr.companyTitle || "",
        taxNumber: addr.taxNumber || "",
        taxOffice: addr.taxOffice || "",
      });
    }
  }

  const contactComplete = useMemo(
    () =>
      form.customerName.trim().length >= 2 &&
      form.customerEmail.includes("@") &&
      form.customerPhone.replace(/\D/g, "").length >= 10,
    [form.customerName, form.customerEmail, form.customerPhone],
  );

  const addressComplete = useMemo(() => {
    if (shippingMode === "saved" && shippingId) return true;
    return (
      form.shipping.addressLine.trim().length > 3 &&
      form.shipping.city.trim().length > 0 &&
      form.shipping.district.trim().length > 0
    );
  }, [shippingMode, shippingId, form.shipping]);

  useEffect(() => {
    if (contactComplete && !addressComplete) {
      setPanelContact(false);
      setPanelAddress(true);
    }
  }, [contactComplete, addressComplete]);

  function corporatePayload() {
    if (!corporateBilling) return {};
    return {
      companyTitle: corporate.companyTitle.trim() || undefined,
      taxNumber: corporate.taxNumber.trim() || undefined,
      taxOffice: corporate.taxOffice.trim() || undefined,
    };
  }

  function selectSavedShipping(addr: Address) {
    setShippingMode("saved");
    setShippingId(addr.id);
    applyAddressToShipping(addr);
  }

  function startNewShipping() {
    setShippingMode("new");
    setShippingId("");
    setForm((f) => ({ ...f, shipping: emptyAddr() }));
  }

  function selectSavedBilling(addr: Address) {
    setBillingMode("saved");
    setBillingId(addr.id);
    applyAddressToBilling(addr);
  }

  function startNewBilling() {
    setBillingMode("new");
    setBillingId("");
    setForm((f) => ({ ...f, billing: emptyAddr() }));
  }

  function setField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setShippingField<K extends keyof AddressFields>(
    key: K,
    value: AddressFields[K],
  ) {
    setForm((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [key]: value },
    }));
  }

  function setBillingField<K extends keyof AddressFields>(
    key: K,
    value: AddressFields[K],
  ) {
    setForm((prev) => ({
      ...prev,
      billing: { ...prev.billing, [key]: value },
    }));
  }

  async function refreshAddresses() {
    const token = getToken();
    if (!token) return;
    const next = await getMyAddresses(token);
    setAddresses(next);
  }

  async function makeDefault(
    id: string,
    kind: "shipping" | "billing",
  ) {
    const token = getToken();
    if (!token) return;
    setDefaultBusy(true);
    setError(null);
    try {
      await updateAddress(
        token,
        id,
        kind === "shipping"
          ? { isDefaultShipping: true }
          : { isDefaultBilling: true },
      );
      await refreshAddresses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : tCheckout("errDefaultAddress"),
      );
    } finally {
      setDefaultBusy(false);
    }
  }

  async function persistNewAddressesIfNeeded() {
    const token = getToken();
    if (!token || !user) return;

    if (shippingMode === "new" && saveShippingAddress) {
      const created = await createAddress(token, {
        title: newShippingTitle.trim() || tCheckout("defaultShippingTitle"),
        fullName: form.customerName,
        phone: form.customerPhone,
        city: form.shipping.city,
        district: form.shipping.district,
        neighborhood: form.shipping.neighborhood || undefined,
        addressLine: form.shipping.addressLine,
        postalCode: form.shipping.postalCode,
        isDefaultShipping: defaultShippingOnSave,
        isDefaultBilling:
          billingSame && defaultShippingOnSave
            ? true
            : defaultBillingOnSave && billingSame,
      });
      setShippingId(created.id);
      setShippingMode("saved");
    }

    if (
      !billingSame &&
      billingMode === "new" &&
      saveBillingAddress
    ) {
      await createAddress(token, {
        title: newBillingTitle.trim() || tCheckout("defaultBillingTitle"),
        fullName: form.customerName,
        phone: form.customerPhone,
        city: form.billing.city,
        district: form.billing.district,
        neighborhood: form.billing.neighborhood || undefined,
        addressLine: form.billing.addressLine,
        postalCode: form.billing.postalCode,
        isDefaultBilling: defaultBillingOnSave,
        ...corporatePayload(),
      });
    }

    await refreshAddresses();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.mesafeliSatis || !form.onBilgilendirme || !form.kvkk) {
      setError(tCheckout("errLegalRequired"));
      return;
    }

    if (shippingMode === "saved" && !shippingId && addresses.length > 0) {
      setError(tCheckout("errSelectSavedAddress"));
      return;
    }

    if (!form.shippingProvider) {
      setError(tCheckout("errSelectShippingProvider"));
      return;
    }

    setSubmitting(true);
    try {
      await persistNewAddressesIfNeeded();

      const sessionId = getCartSessionId();
      const shippingAddress = {
        fullName: form.customerName,
        phone: form.customerPhone,
        city: form.shipping.city,
        district: form.shipping.district,
        neighborhood: form.shipping.neighborhood,
        addressLine: form.shipping.addressLine,
        postalCode: form.shipping.postalCode,
      };
      const billingSource = billingSame ? form.shipping : form.billing;
      const corp = corporatePayload();
      const billingAddress = {
        fullName: form.customerName,
        phone: form.customerPhone,
        city: billingSource.city,
        district: billingSource.district,
        neighborhood: billingSource.neighborhood,
        addressLine: billingSource.addressLine,
        postalCode: billingSource.postalCode,
        ...corp,
      };

      const result = await checkout(
        sessionId,
        {
          customerEmail: form.customerEmail,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          shippingAddress,
          billingAddress,
          shippingProvider: form.shippingProvider,
          paymentMethod,
          couponCode: couponPreview?.valid ? couponPreview.code : undefined,
          locale,
          legalAcceptances: {
            mesafeliSatis: form.mesafeliSatis,
            onBilgilendirme: form.onBilgilendirme,
            kvkk: form.kvkk,
          },
          notes: form.notes || undefined,
        },
        getToken(),
      );

      if (result.orderId) {
        try {
          sessionStorage.setItem("herbalkapida_last_order_id", result.orderId);
          sessionStorage.setItem(
            "herbalkapida_last_order_email",
            form.customerEmail.trim(),
          );
          if (result.orderNumber) {
            sessionStorage.setItem(
              "herbalkapida_last_order_number",
              result.orderNumber,
            );
          }
        } catch {
          /* ignore */
        }
      }

      const { redirectToPayment } = await import("@/lib/payment-redirect");
      if (!redirectToPayment(result, locale)) {
        setError(tCheckout("errPaymentRedirect"));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tCheckout("errPaymentStart"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal = cartSubtotal(cart);
  const selected = providers.find((p) => p.code === form.shippingProvider);
  const shippingFee = Number(selected?.fee || 0);
  const discountAmount = couponPreview?.valid
    ? Number(couponPreview.discountAmount)
    : 0;
  const totals = calculateOrderTotals(subtotal, shippingFee, {
    discountAmount,
  });
  const total = totals.total;

  async function applyCoupon() {
    setCouponError(null);
    setCouponPreview(null);
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Kupon kodu girin");
      return;
    }
    setCouponLoading(true);
    try {
      const preview = await validateCoupon(
        code,
        subtotal,
        form.customerEmail || undefined,
        getToken(),
      );
      if (!preview.valid) {
        setCouponError(preview.message || tCheckout("invalidCoupon"));
        return;
      }
      setCouponPreview(preview);
      setCouponInput(preview.code);
    } catch (err) {
      setCouponError(
        err instanceof Error ? err.message : "Kupon doğrulanamadı",
      );
    } finally {
      setCouponLoading(false);
    }
  }

  function clearCoupon() {
    setCouponPreview(null);
    setCouponError(null);
    setCouponInput("");
  }

  if (loading) {
    return (
      <div className="page-shell py-24 font-meta text-sm uppercase text-secondary">
        {tCheckout("preparing")}
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="page-shell py-24">
        <h1 className="font-display text-4xl">{tCheckout("title")}</h1>
        <p className="mt-4 font-meta text-sm uppercase text-secondary">
          {tCheckout("emptyCart")}
        </p>
        <Link href="/urunler" className="btn-cta mt-8 inline-block px-8 py-4 text-xs">
          {tCheckout("backToShop")}
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell min-w-0 bg-surface py-6 sm:py-10 md:py-14">
      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-xs text-on-surface-variant">
            <Link href="/sepet" className="hover:text-primary">
              {tCart("title")}
            </Link>
            <span className="mx-1">/</span>
            <span className="font-semibold text-on-surface">
              {tCheckout("breadcrumbDelivery")}
            </span>
          </p>
          <h1 className="font-display text-2xl text-on-surface sm:text-3xl md:text-4xl">
            {tCheckout("titleDeliveryPayment")}
          </h1>
          {user ? (
            <p className="mt-2 text-sm text-on-surface-variant">
              {tCheckout("savedAddressHint")}{" "}
              <Link href="/hesabim" className="text-primary underline">
                {tAccount("title")}
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-sm text-on-surface-variant">
              {tCheckout("loginForAddressBook")}{" "}
              <Link href={loginHref("/odeme")} className="text-primary underline">
                {tCheckout("signInLink")}
              </Link>
              .
            </p>
          )}
        </div>
        <CheckoutSteps active={2} />
      </div>

      <form
        id="checkout-form"
        onSubmit={onSubmit}
        className="mt-6 grid grid-cols-1 gap-6 pb-28 sm:mt-10 sm:gap-10 lg:mt-12 lg:grid-cols-12 lg:pb-0"
      >
        <div className="min-w-0 space-y-6 sm:space-y-8 lg:col-span-8">
          <Reveal fill={false} variant="left">
          <section className="panel-motion industrial-border relative z-1 min-w-0 bg-white p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl">{tCheckout("contactHeading")}</h2>
              {contactComplete ? (
                <button
                  type="button"
                  onClick={() => setPanelContact((v) => !v)}
                  className="font-meta text-[10px] uppercase tracking-widest text-primary underline"
                >
                  {panelContact ? tCheckout("collapse") : tCheckout("edit")}
                </button>
              ) : null}
            </div>
            {!panelContact && contactComplete ? (
              <p className="wrap-break-word font-meta text-xs uppercase text-secondary">
                {form.customerName} · {form.customerPhone} · {form.customerEmail}
              </p>
            ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label={tForms("fullName")}
                value={form.customerName}
                onChange={(v) => setField("customerName", v)}
                required
              />
              <Field
                label={tForms("phone")}
                value={form.customerPhone}
                onChange={(v) => setField("customerPhone", v)}
                required
              />
              <Field
                label={tForms("email")}
                type="email"
                value={form.customerEmail}
                onChange={(v) => setField("customerEmail", v)}
                required
              />
            </div>
            )}
          </section>
          </Reveal>

          <Reveal fill={false} variant="left" delay={40}>
          <section className="panel-motion industrial-border relative z-1 min-w-0 bg-white p-4 sm:p-6 md:p-8">
            <h2 className="mb-6 font-display text-2xl">
              {tCheckout("deliveryMethodHeading")}
            </h2>
            <div className="border border-primary px-3 py-3 font-meta text-xs uppercase text-primary sm:px-4 sm:py-4">
              {tCheckout("shipByCargo")}
            </div>
          </section>
          </Reveal>

          <Reveal fill={false} variant="left" delay={70}>
          <section className="panel-motion industrial-border relative z-1 min-w-0 bg-white p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl">{tCheckout("shippingAddressHeading")}</h2>
              {addressComplete ? (
                <button
                  type="button"
                  onClick={() => setPanelAddress((v) => !v)}
                  className="font-meta text-[10px] uppercase tracking-widest text-primary underline"
                >
                  {panelAddress ? tCheckout("collapse") : tCheckout("edit")}
                </button>
              ) : null}
            </div>
            {!panelAddress && addressComplete ? (
              <p className="wrap-break-word font-meta text-xs uppercase text-secondary">
                {form.shipping.district}, {form.shipping.city} ·{" "}
                {form.shipping.addressLine}
              </p>
            ) : (
            <>
            {addresses.length > 0 ? (
              <div className="mb-6 space-y-2">
                {addresses.map((addr) => {
                  const selected =
                    shippingMode === "saved" && shippingId === addr.id;
                  const live =
                    addresses.find((a) => a.id === addr.id) || addr;
                  return (
                    <div
                      key={addr.id}
                      className={`border px-4 py-3 transition-colors ${
                        selected
                          ? "border-primary"
                          : "border-outline-variant/30 hover:border-outline"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectSavedShipping(addr)}
                        className={`w-full wrap-break-word text-left font-meta text-[11px] uppercase ${
                          selected ? "text-primary" : "text-secondary"
                        }`}
                      >
                        <span className="font-medium">{addr.title}</span>
                        {live.isDefaultShipping ? tCheckout("defaultBadge") : ""}
                        <span className="mt-1 block normal-case tracking-normal text-secondary">
                          {addr.fullName} · {addr.addressLine}
                          <br />
                          {addr.district}, {addr.city}
                          {addr.postalCode ? ` · ${addr.postalCode}` : ""}
                        </span>
                      </button>
                      {selected && !live.isDefaultShipping ? (
                        <button
                          type="button"
                          disabled={defaultBusy}
                          onClick={() => void makeDefault(addr.id, "shipping")}
                          className="mt-3 font-meta text-[10px] uppercase text-secondary underline hover:text-primary disabled:opacity-50"
                        >
                          {tCheckout("makeDefaultShipping")}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={startNewShipping}
                  className={`w-full border px-4 py-3 text-left font-meta text-[11px] uppercase transition-colors ${
                    shippingMode === "new"
                      ? "border-primary text-primary"
                      : "border-outline-variant/30 text-secondary hover:border-outline"
                  }`}
                >
                  {tCheckout("addNewAddress")}
                </button>
              </div>
            ) : null}

            {shippingMode === "saved" && shippingId ? (
              <SelectedAddressSummary
                address={addresses.find((a) => a.id === shippingId)}
                fields={form.shipping}
                name={form.customerName}
                phone={form.customerPhone}
              />
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label={tForms("city")}
                    value={form.shipping.city}
                    onChange={(v) => setShippingField("city", v)}
                    required
                  />
                  <Field
                    label={tForms("district")}
                    value={form.shipping.district}
                    onChange={(v) => setShippingField("district", v)}
                    required
                  />
                  <Field
                    label={tForms("neighborhood")}
                    value={form.shipping.neighborhood}
                    onChange={(v) => setShippingField("neighborhood", v)}
                  />
                  <Field
                    label={tForms("postalCode")}
                    value={form.shipping.postalCode}
                    onChange={(v) => setShippingField("postalCode", v)}
                    required
                  />
                  <div className="md:col-span-2">
                    <Field
                      label={tForms("addressLine")}
                      value={form.shipping.addressLine}
                      onChange={(v) => setShippingField("addressLine", v)}
                      required
                    />
                  </div>
                </div>
                {user ? (
                  <div className="mt-6 space-y-3 border-t border-outline-variant/20 pt-5">
                    <Check
                      checked={saveShippingAddress}
                      onChange={setSaveShippingAddress}
                      label={<span>{tCheckout("saveToAddressBook")}</span>}
                    />
                    {saveShippingAddress ? (
                      <>
                        <Field
                          label={tForms("addressTitle")}
                          value={newShippingTitle}
                          onChange={setNewShippingTitle}
                          required
                        />
                        <Check
                          checked={defaultShippingOnSave}
                          onChange={setDefaultShippingOnSave}
                          label={
                            <span>{tCheckout("setDefaultShippingAddress")}</span>
                          }
                        />
                      </>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
            </>
            )}
          </section>
          </Reveal>

          <Reveal fill={false} variant="left" delay={120}>
          <section className="panel-motion industrial-border relative z-1 min-w-0 bg-white p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl">{tCheckout("billingAddressHeading")}</h2>
              <Check
                checked={billingSame}
                onChange={(v) => {
                  setBillingSame(v);
                  if (v) {
                    setBillingId(shippingId);
                    setBillingMode(shippingMode);
                  }
                }}
                label={
                  <span>
                    {tCheckout("billingSameDelivery")}
                  </span>
                }
              />
            </div>
            {!billingSame ? (
              <>
                {addresses.length > 0 ? (
                  <div className="mb-6 space-y-2">
                    {addresses.map((addr) => {
                      const selected =
                        billingMode === "saved" && billingId === addr.id;
                      const live =
                        addresses.find((a) => a.id === addr.id) || addr;
                      return (
                        <div
                          key={`bill-${addr.id}`}
                          className={`border px-4 py-3 transition-colors ${
                            selected
                              ? "border-primary"
                              : "border-outline-variant/30 hover:border-outline"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectSavedBilling(addr)}
                            className={`w-full wrap-break-word text-left font-meta text-[11px] uppercase ${
                              selected ? "text-primary" : "text-secondary"
                            }`}
                          >
                            <span className="font-medium">{addr.title}</span>
                            {live.isDefaultBilling ? tCheckout("defaultBillingBadge") : ""}
                            <span className="mt-1 block normal-case tracking-normal text-secondary">
                              {addr.district}, {addr.city}
                            </span>
                          </button>
                          {selected && !live.isDefaultBilling ? (
                            <button
                              type="button"
                              disabled={defaultBusy}
                              onClick={() =>
                                void makeDefault(addr.id, "billing")
                              }
                              className="mt-3 font-meta text-[10px] uppercase text-secondary underline hover:text-primary disabled:opacity-50"
                            >
                              {tCheckout("makeDefaultBilling")}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={startNewBilling}
                      className={`w-full border px-4 py-3 text-left font-meta text-[11px] uppercase transition-colors ${
                        billingMode === "new"
                          ? "border-primary text-primary"
                          : "border-outline-variant/30 text-secondary hover:border-outline"
                      }`}
                    >
                      {tCheckout("addNewBillingAddress")}
                    </button>
                  </div>
                ) : null}

                {billingMode === "saved" && billingId ? (
                  <SelectedAddressSummary
                    address={addresses.find((a) => a.id === billingId)}
                    fields={form.billing}
                    name={form.customerName}
                    phone={form.customerPhone}
                  />
                ) : (
                  <>
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field
                        label={tForms("city")}
                        value={form.billing.city}
                        onChange={(v) => setBillingField("city", v)}
                        required
                      />
                      <Field
                        label={tForms("district")}
                        value={form.billing.district}
                        onChange={(v) => setBillingField("district", v)}
                        required
                      />
                      <Field
                        label={tForms("neighborhood")}
                        value={form.billing.neighborhood}
                        onChange={(v) => setBillingField("neighborhood", v)}
                      />
                      <Field
                        label={tForms("postalCode")}
                        value={form.billing.postalCode}
                        onChange={(v) => setBillingField("postalCode", v)}
                        required
                      />
                      <div className="md:col-span-2">
                        <Field
                          label={tForms("addressLine")}
                          value={form.billing.addressLine}
                          onChange={(v) => setBillingField("addressLine", v)}
                          required
                        />
                      </div>
                    </div>
                    {user ? (
                      <div className="mt-6 space-y-3 border-t border-outline-variant/20 pt-5">
                        <Check
                          checked={saveBillingAddress}
                          onChange={setSaveBillingAddress}
                          label={<span>{tCheckout("saveToAddressBook")}</span>}
                        />
                        {saveBillingAddress ? (
                          <>
                            <Field
                              label={tForms("addressTitle")}
                              value={newBillingTitle}
                              onChange={setNewBillingTitle}
                              required
                            />
                            <Check
                              checked={defaultBillingOnSave}
                              onChange={setDefaultBillingOnSave}
                              label={
                                <span>
                                  {tAccount("defaultBilling")}
                                </span>
                              }
                            />
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <p className="font-meta text-xs uppercase text-secondary">
                {tCheckout("billingSameAsShipping")}
              </p>
            )}
            <div className="mt-6 space-y-4 border-t border-outline-variant/20 pt-5">
              <Check
                checked={corporateBilling}
                onChange={setCorporateBilling}
                label={<span>{tCheckout("corporateBilling")}</span>}
              />
              {corporateBilling ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label={tForms("companyTitle")}
                    value={corporate.companyTitle}
                    onChange={(v) =>
                      setCorporate((c) => ({ ...c, companyTitle: v }))
                    }
                    required
                  />
                  <Field
                    label={tForms("taxNumber")}
                    value={corporate.taxNumber}
                    onChange={(v) =>
                      setCorporate((c) => ({ ...c, taxNumber: v }))
                    }
                    required
                  />
                  <div className="md:col-span-2">
                    <Field
                      label={tForms("taxOffice")}
                      value={corporate.taxOffice}
                      onChange={(v) =>
                        setCorporate((c) => ({ ...c, taxOffice: v }))
                      }
                      required
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
          </Reveal>

          <Reveal fill={false} variant="left" delay={160}>
          <section className="panel-motion industrial-border relative z-1 min-w-0 bg-white p-4 sm:p-6 md:p-8">
            <h2 className="mb-6 font-display text-2xl">{tCheckout("shippingProviderHeading")}</h2>
            <div className="space-y-3">
              {providers.map((p) => (
                <label
                  key={p.code}
                  className={`flex cursor-pointer items-center justify-between gap-3 wrap-break-word border px-3 py-3 font-meta text-xs uppercase sm:px-4 sm:py-4 ${
                    form.shippingProvider === p.code
                      ? "border-primary text-primary"
                      : "border-outline-variant/30 text-secondary"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={form.shippingProvider === p.code}
                      onChange={() => setField("shippingProvider", p.code)}
                    />
                    {p.name}
                  </span>
                  <span>{formatMoney(p.fee)}</span>
                </label>
              ))}
            </div>
          </section>
          </Reveal>

          <Reveal fill={false} variant="left" delay={200}>
          <section className="panel-motion industrial-border relative z-1 min-w-0 bg-white p-4 sm:p-6 md:p-8">
            <h2 className="mb-6 font-display text-2xl">
              {tCheckout("paymentMethodHeading")}
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 wrap-break-word border px-3 py-3 font-meta text-xs uppercase sm:px-4 sm:py-4 ${
                    paymentMethod === opt.value
                      ? "border-primary text-primary"
                      : "border-outline-variant/30 text-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-0.5"
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                  />
                  <span>
                    {tCheckout(opt.labelKey)}
                    <span className="mt-1 block normal-case tracking-normal text-secondary">
                      {tCheckout(opt.descKey)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
          </Reveal>

        </div>

        <aside className="min-w-0 lg:col-span-4">
          {/* sticky yalnızca masaüstü: mobilde footer/menü üstüne binmesin */}
          <div className="relative z-10 border border-outline-variant/30 bg-white p-4 panel-motion sm:p-6 lg:sticky lg:top-24">
            <h2 className="mb-6 font-display text-2xl">{tCheckout("summaryHeading")}</h2>
            {cart?.items?.length ? (
              <ul className="mb-5 max-h-48 space-y-2.5 overflow-y-auto border-b border-outline-variant/20 pb-4">
                {cart.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-on-surface">
                        {item.product?.name || tCheckout("summaryHeading")}
                        <span className="text-on-surface-variant">
                          {" "}
                          ×{item.quantity}
                        </span>
                      </p>
                      {item.variant?.weightLabel ? (
                        <p className="mt-0.5 text-[11px] text-primary">
                          {item.variant.weightLabel}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-semibold text-on-surface">
                      {formatMoney(Number(item.unitPrice) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mb-6 space-y-2">
              <label className="field-label">{tCheckout("couponLabel")}</label>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) =>
                    setCouponInput(e.target.value.toUpperCase())
                  }
                  disabled={Boolean(couponPreview?.valid)}
                  placeholder="HOSGELDIN10"
                  className="field-input flex-1 uppercase"
                />
                {couponPreview?.valid ? (
                  <button
                    type="button"
                    onClick={clearCoupon}
                    className="shrink-0 border border-outline-variant/40 px-3 font-meta text-[10px] uppercase"
                  >
                    {tCheckout("removeCoupon")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void applyCoupon()}
                    disabled={couponLoading}
                    className="shrink-0 border border-primary px-3 font-meta text-[10px] uppercase text-primary disabled:opacity-50"
                  >
                    {couponLoading ? "…" : tCheckout("applyCoupon")}
                  </button>
                )}
              </div>
              {couponError ? (
                <p className="font-meta text-[10px] uppercase text-error">
                  {couponError}
                </p>
              ) : null}
              {couponPreview?.valid ? (
                <p className="font-meta text-[10px] uppercase text-primary">
                  {tCheckout("couponApplied", {
                    title: couponPreview.title || couponPreview.code,
                  })}
                </p>
              ) : null}
            </div>
            <div className="space-y-3 border-b border-outline-variant/20 pb-6 font-meta text-xs uppercase">
              <Row label={tCheckout("subtotal")} value={formatMoney(subtotal)} />
              {discountAmount > 0 ? (
                <Row
                  label={tCheckout("discount", { code: couponPreview?.code ?? "" })}
                  value={`−${formatMoney(discountAmount)}`}
                />
              ) : null}
              <Row
                label={tCheckout("labelShipping")}
                value={formatMoney(shippingFee)}
              />
              <Row
                label={tCheckout("vatLine", { rate: totals.ratePercent, included: totals.taxIncluded ? tCheckout("vatIncluded") : "" })}
                value={formatMoney(totals.taxAmount)}
              />
              <Row label={tCheckout("total")} value={formatMoney(total)} accent />
            </div>
            {error ? (
              <p className="mt-4 font-meta text-[11px] uppercase text-error">
                {error}
              </p>
            ) : null}
            <div className="mt-6 space-y-3 border-t border-outline-variant/20 pt-5 font-meta text-[10px] uppercase leading-relaxed text-secondary">
              <p className="font-meta text-[10px] tracking-widest text-on-surface-variant">
                {tCheckout("legalApprovals")}
              </p>
              <Check
                checked={form.mesafeliSatis}
                onChange={(v) => setField("mesafeliSatis", v)}
                label={
                  <>
                    <Link href="/mesafeli-satis" className="text-primary underline">
                      {tCheckout("legalMesafeliLink")}
                    </Link>{" "}
                    {tCheckout("legalMesafeli")}
                  </>
                }
              />
              <Check
                checked={form.onBilgilendirme}
                onChange={(v) => setField("onBilgilendirme", v)}
                label={
                  <>
                    <Link href="/on-bilgilendirme" className="text-primary underline">
                      {tCheckout("legalOnBilgiLink")}
                    </Link>{" "}
                    {tCheckout("legalOnBilgi")}
                  </>
                }
              />
              <Check
                checked={form.kvkk}
                onChange={(v) => setField("kvkk", v)}
                label={
                  <>
                    <Link href="/kvkk" className="text-primary underline">
                      {tCheckout("legalKvkkLink")}
                    </Link>{" "}
                    {tCheckout("legalKvkk")}{" "}
                    <Link href="/guvenli-alisveris" className="text-primary underline">
                      {tCheckout("legalSecure")}
                    </Link>{" "}
                    {tCheckout("legalInform")}{" "}
                    <Link href="/iptal-iade" className="text-primary underline">
                      {tCheckout("legalReturns")}
                    </Link>{" "}
                    {tCheckout("legalRead")}
                  </>
                }
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 border border-outline-variant/25 bg-surface-container px-3 py-3 text-[11px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                {tCheckout("paySecure")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-primary" aria-hidden />
                {tCheckout("ssl256")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" aria-hidden />
                {tCheckout("originalGuarantee")}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-cta mt-5 w-full py-4 text-xs"
            >
              {submitting
                ? tCheckout("redirecting")
                : paymentMethod === "cod"
                  ? tCheckout("placeOrderCod")
                  : paymentMethod === "bank_transfer"
                    ? tCheckout("placeOrderBank")
                    : tCheckout("payWithPaytr")}
            </button>
          </div>
        </aside>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/30 bg-surface-container-lowest px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="page-shell flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-meta text-[10px] uppercase text-secondary">{tCheckout("total")}</p>
            <p className="font-display text-xl text-primary">{formatMoney(total)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="btn-cta shrink-0 px-5 py-3 text-xs"
          >
            {submitting
              ? "…"
              : paymentMethod === "paytr"
                ? tCheckout("mobilePay")
                : tCheckout("mobilePlaceOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectedAddressSummary({
  address,
  fields,
  name,
  phone,
}: {
  address?: Address;
  fields: AddressFields;
  name: string;
  phone: string;
}) {
  const tCheckout = useTranslations("checkout");
  return (
    <div className="wrap-break-word border border-outline-variant/20 bg-surface-container px-4 py-4 font-meta text-xs leading-relaxed text-on-surface">
      {address ? (
        <p className="mb-2 text-[10px] uppercase tracking-widest text-primary">
          {address.title}
          {address.isDefaultShipping ? tCheckout("selectedDefaultShipping") : ""}
          {address.isDefaultBilling ? tCheckout("selectedDefaultBilling") : ""}
        </p>
      ) : null}
      <p className="uppercase text-secondary">
        {name}
        {phone ? ` · ${phone}` : ""}
      </p>
      <p className="mt-2 normal-case tracking-normal">
        {fields.addressLine}
        <br />
        {fields.neighborhood ? `${fields.neighborhood}, ` : ""}
        {fields.district} / {fields.city}
        {fields.postalCode ? (
          <>
            <br />
            {fields.postalCode}
          </>
        ) : null}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
          checked
            ? "border-primary bg-primary text-on-primary"
            : "border-outline-variant/50"
        }`}
        aria-hidden
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6.2L4.6 9L10 3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
            />
          </svg>
        ) : null}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-secondary">{label}</span>
      <span className={accent ? "text-primary" : "text-on-surface"}>{value}</span>
    </div>
  );
}
