"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  changePassword,
  createAddress,
  deleteAddress,
  deleteMyAccount,
  getMe,
  getMyAddresses,
  getMyOrders,
  updateAddress,
  ApiError,
} from "@/lib/api";
import {
  AccountTabs,
  resolveAccountTab,
  type AccountTabId,
} from "@/components/AccountTabs";
import { Reveal } from "@/components/Reveal";
import { StatusBadge } from "@/components/StatusBadge";
import { clearToken, getToken } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { clearWishlistCache } from "@/lib/wishlist";
import type { Address, AddressPayload, Order, User } from "@/lib/types";

const emptyAddressForm = (): AddressPayload => ({
  title: "",
  fullName: "",
  phone: "",
  city: "",
  district: "",
  neighborhood: "",
  addressLine: "",
  postalCode: "",
  isDefaultShipping: false,
  isDefaultBilling: false,
  companyTitle: "",
  taxNumber: "",
  taxOffice: "",
});

function AccountLoadingFallback() {
  const t = useTranslations("account");
  return (
    <div className="page-shell py-24 font-meta text-sm uppercase text-secondary">
      {t("loading")}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoadingFallback />}>
      <AccountPageInner />
    </Suspense>
  );
}

function AccountPageInner() {
  const tAccount = useTranslations("account");
  const tForms = useTranslations("forms");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: AccountTabId = resolveAccountTab(
    "/hesabim",
    searchParams.get("sekme"),
  );
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AddressPayload>(emptyAddressForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState<string | null>(null);
  const [closeAccountOpen, setCloseAccountOpen] = useState(false);
  const [closingAccount, setClosingAccount] = useState(false);
  const [closeAccountError, setCloseAccountError] = useState<string | null>(
    null,
  );

  async function reload(token: string) {
    const [me, myOrders, myAddresses] = await Promise.all([
      getMe(token),
      getMyOrders(token),
      getMyAddresses(token),
    ]);
    setUser(me);
    setOrders(myOrders);
    setAddresses(myAddresses);
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/giris?next=/hesabim");
      return;
    }

    reload(token)
      .catch(() => {
        setError(tAccount("sessionInvalid"));
        clearToken();
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearToken();
    clearWishlistCache();
    router.push("/giris");
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !user) return;
    if (newPassword !== newPassword2) {
      setPwError(tAccount("passwordMismatch"));
      return;
    }
    if (user.hasPassword && !currentPassword) {
      setPwError(tAccount("currentPasswordRequired"));
      return;
    }
    setPwBusy(true);
    setPwError(null);
    setPwOk(null);
    try {
      await changePassword(token, {
        newPassword,
        ...(user.hasPassword ? { currentPassword } : {}),
      });
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
      setPwOk(
        user.hasPassword
          ? tAccount("passwordUpdated")
          : tAccount("passwordSet"),
      );
      await reload(token);
    } catch (err) {
      setPwError(
        err instanceof ApiError ? err.message : tAccount("passwordUpdateFailed"),
      );
    } finally {
      setPwBusy(false);
    }
  }

  async function confirmCloseAccount() {
    const token = getToken();
    if (!token) return;
    setClosingAccount(true);
    setCloseAccountError(null);
    try {
      await deleteMyAccount(token);
      clearToken();
      clearWishlistCache();
      router.replace("/");
    } catch (err) {
      setCloseAccountError(
        err instanceof ApiError ? err.message : tAccount("closeAccountFailed"),
      );
    } finally {
      setClosingAccount(false);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyAddressForm());
    setFormError(null);
    setShowForm(true);
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      title: addr.title,
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city,
      district: addr.district,
      neighborhood: addr.neighborhood || "",
      addressLine: addr.addressLine,
      postalCode: addr.postalCode,
      isDefaultShipping: addr.isDefaultShipping,
      isDefaultBilling: addr.isDefaultBilling,
      companyTitle: addr.companyTitle || "",
      taxNumber: addr.taxNumber || "",
      taxOffice: addr.taxOffice || "",
    });
    setFormError(null);
    setShowForm(true);
  }

  async function onSubmitAddress(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload: AddressPayload = {
        ...form,
        neighborhood: form.neighborhood || undefined,
      };
      if (editingId) {
        await updateAddress(token, editingId, payload);
      } else {
        await createAddress(token, payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyAddressForm());
      await reload(token);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : tAccount("addressSaveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string, kind: "shipping" | "billing") {
    const token = getToken();
    if (!token) return;
    try {
      await updateAddress(
        token,
        id,
        kind === "shipping"
          ? { isDefaultShipping: true }
          : { isDefaultBilling: true },
      );
      await reload(token);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : tAccount("defaultFailed"),
      );
    }
  }

  async function confirmDelete() {
    const token = getToken();
    if (!token || !deleteId) return;
    setDeleting(true);
    try {
      await deleteAddress(token, deleteId);
      setDeleteId(null);
      await reload(token);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : tAccount("deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell py-24 font-meta text-sm uppercase text-secondary">
        Hesap yükleniyor…
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-shell py-24">
        <p className="font-meta text-sm uppercase text-error">
          {error || tAccount("unauthorized")}
        </p>
        <Link
          href="/giris?next=/hesabim"
          className="btn-cta mt-8 inline-block px-8 py-4 text-xs"
        >
          {tAccount("login")}
        </Link>
      </div>
    );
  }

  const pendingDelete = addresses.find((a) => a.id === deleteId);
  const tabTitle =
    tab === "adresler"
      ? tAccount("tabAddresses")
      : tab === "hesap"
        ? tAccount("tabAccount")
        : tAccount("tabOrders");

  return (
    <div className="page-shell py-16 md:py-24">
      <div className="mb-2 flex items-center justify-between gap-4 page-enter">
        <div className="font-meta text-xs uppercase tracking-widest text-primary">
          {tAccount("breadcrumb", { tab: tabTitle })}
        </div>
        <button
          type="button"
          onClick={logout}
          className="font-meta text-[11px] uppercase text-secondary underline hover:text-primary"
        >
          {tAccount("logout")}
        </button>
      </div>
      <h1 className="font-display text-4xl md:text-5xl animate-fade-up">
        {tAccount("title")}
      </h1>
      <p
        className="mt-3 font-meta text-xs uppercase text-secondary animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        {user.firstName || user.email}
      </p>

      <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <AccountTabs active={tab} />
      </div>

      {tab === "siparisler" ? (
        <section className="mt-10" role="tabpanel">
          {!orders.length ? (
            <Reveal delay={60}>
              <div className="industrial-border p-8 font-meta text-xs uppercase text-secondary">
                {tAccount("noOrders")}{" "}
                <Link href="/urunler" className="text-primary underline">
                  {tAccount("browseCatalog")}
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="divide-y divide-outline-variant/20 border border-outline-variant/20">
              {orders.map((order, i) => {
                const trackCode = order.shipments?.[0]?.trackingNumber;
                return (
                  <Reveal
                    key={order.id}
                    delay={Math.min(i, 6) * 55}
                    variant="fade"
                  >
                    <div className="row-motion flex flex-col justify-between gap-4 px-5 py-5 hover:bg-surface-container-low md:flex-row md:items-center">
                      <Link
                        href={`/hesabim/siparisler/${order.id}`}
                        className="min-w-0 flex-1"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-meta text-sm uppercase text-primary">
                            {order.orderNumber}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="mt-2 font-meta text-[11px] uppercase text-secondary">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                locale,
                              )
                            : null}
                          {order.shippingProvider
                            ? ` · ${order.shippingProvider}`
                            : null}
                        </div>
                        <div className="mt-1 font-meta text-[11px] text-secondary">
                          {(order.items || [])
                            .map((it) => {
                              const detail = it.variantLabel || "";
                              return detail
                                ? `${it.productName} (${detail}) ×${it.quantity}`
                                : `${it.productName} ×${it.quantity}`;
                            })
                            .join(", ") || "—"}
                        </div>
                      </Link>
                      <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                        <div className="font-meta text-sm text-on-surface">
                          {formatMoney(order.total, order.currency)}
                        </div>
                        {trackCode ? (
                          <Link
                            href={`/takip/${encodeURIComponent(trackCode)}`}
                            className="font-meta text-[10px] uppercase tracking-widest text-primary underline"
                          >
                            {tAccount("trackShipment")}
                          </Link>
                        ) : (
                          <Link
                            href={`/hesabim/siparisler/${order.id}`}
                            className="font-meta text-[10px] uppercase tracking-widest text-secondary underline hover:text-primary"
                          >
                            {tAccount("detail")}
                          </Link>
                        )}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {tab === "adresler" ? (
        <section className="mt-10" role="tabpanel">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <p className="font-meta text-[11px] uppercase text-secondary">
              {tAccount("addressesHint")}
            </p>
            <button
              type="button"
              onClick={startCreate}
              className="btn-ghost px-5 py-3 text-xs"
            >
              {tAccount("addAddress")}
            </button>
          </div>

          {formError ? (
            <p className="mb-4 font-meta text-[11px] uppercase text-error">
              {formError}
            </p>
          ) : null}

          {showForm ? (
            <Reveal variant="scale" className="mb-8">
              <form
                onSubmit={onSubmitAddress}
                className="industrial-border bg-surface-container-low p-6 md:p-8"
              >
                <h2 className="mb-6 font-display text-xl">
                  {editingId ? tAccount("editAddress") : tAccount("newAddress")}
                </h2>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label={tAccount("addressTitle")}
                    value={form.title}
                    onChange={(title) => setForm((f) => ({ ...f, title }))}
                    required
                    placeholder={tAccount("addressTitlePlaceholder")}
                  />
                  <Field
                    label={tForms("fullName")}
                    value={form.fullName}
                    onChange={(fullName) =>
                      setForm((f) => ({ ...f, fullName }))
                    }
                    required
                  />
                  <Field
                    label={tForms("phone")}
                    value={form.phone}
                    onChange={(phone) => setForm((f) => ({ ...f, phone }))}
                    required
                  />
                  <Field
                    label={tAccount("city")}
                    value={form.city}
                    onChange={(city) => setForm((f) => ({ ...f, city }))}
                    required
                  />
                  <Field
                    label={tAccount("district")}
                    value={form.district}
                    onChange={(district) =>
                      setForm((f) => ({ ...f, district }))
                    }
                    required
                  />
                  <Field
                    label={tAccount("neighborhood")}
                    value={form.neighborhood || ""}
                    onChange={(neighborhood) =>
                      setForm((f) => ({ ...f, neighborhood }))
                    }
                  />
                  <div className="md:col-span-2">
                    <Field
                      label={tAccount("addressLine")}
                      value={form.addressLine}
                      onChange={(addressLine) =>
                        setForm((f) => ({ ...f, addressLine }))
                      }
                      required
                    />
                  </div>
                  <Field
                    label={tAccount("postalCode")}
                    value={form.postalCode}
                    onChange={(postalCode) =>
                      setForm((f) => ({ ...f, postalCode }))
                    }
                    required
                  />
                </div>
                <div className="mt-6 space-y-4 border-t border-outline-variant/20 pt-5">
                  <p className="font-meta text-[10px] uppercase tracking-widest text-secondary">
                    {tAccount("corporateBillingOptional")}
                  </p>
                  <Field
                    label={tAccount("companyTitle")}
                    value={form.companyTitle || ""}
                    onChange={(companyTitle) =>
                      setForm((f) => ({ ...f, companyTitle }))
                    }
                  />
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label={tAccount("taxNumber")}
                      value={form.taxNumber || ""}
                      onChange={(taxNumber) =>
                        setForm((f) => ({ ...f, taxNumber }))
                      }
                    />
                    <Field
                      label={tAccount("taxOffice")}
                      value={form.taxOffice || ""}
                      onChange={(taxOffice) =>
                        setForm((f) => ({ ...f, taxOffice }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <ToggleCheck
                    checked={Boolean(form.isDefaultShipping)}
                    onChange={(isDefaultShipping) =>
                      setForm((f) => ({ ...f, isDefaultShipping }))
                    }
                    label={tAccount("defaultShipping")}
                  />
                  <ToggleCheck
                    checked={Boolean(form.isDefaultBilling)}
                    onChange={(isDefaultBilling) =>
                      setForm((f) => ({ ...f, isDefaultBilling }))
                    }
                    label={tAccount("defaultBilling")}
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-cta px-8 py-3 text-xs disabled:opacity-50"
                  >
                    {saving ? tCommon("saving") : tAccount("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="btn-ghost px-8 py-3 text-xs"
                  >
                    {tAccount("cancel")}
                  </button>
                </div>
              </form>
            </Reveal>
          ) : null}

          {!addresses.length ? (
            <Reveal>
              <div className="industrial-border p-8 font-meta text-xs uppercase text-secondary">
                {tAccount("noAddressesHint")}
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((addr, i) => (
                <Reveal
                  key={addr.id}
                  delay={i * 70}
                  variant={i % 2 ? "right" : "left"}
                >
                  <article className="panel-motion industrial-border bg-surface-container-low p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl">{addr.title}</h3>
                        <p className="mt-1 font-meta text-xs uppercase text-secondary">
                          {addr.fullName} · {addr.phone}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {addr.isDefaultShipping ? (
                          <span className="font-meta text-[10px] uppercase text-primary">
                            {tAccount("shippingBadge")}
                          </span>
                        ) : null}
                        {addr.isDefaultBilling ? (
                          <span className="font-meta text-[10px] uppercase text-primary">
                            {tAccount("billingBadge")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {addr.companyTitle ? (
                      <p className="mt-3 font-meta text-[10px] uppercase text-primary">
                        {addr.companyTitle}
                        {addr.taxNumber ? ` · VKN ${addr.taxNumber}` : ""}
                      </p>
                    ) : null}
                    <p className="mt-4 font-meta text-xs leading-relaxed text-on-surface">
                      {addr.addressLine}
                      <br />
                      {addr.neighborhood ? `${addr.neighborhood}, ` : ""}
                      {addr.district} / {addr.city}
                      <br />
                      {addr.postalCode}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-outline-variant/20 pt-4 font-meta text-[11px] uppercase">
                      {!addr.isDefaultShipping ? (
                        <button
                          type="button"
                          onClick={() => void setDefault(addr.id, "shipping")}
                          className="text-secondary underline hover:text-primary"
                        >
                          {tAccount("makeDefaultShipping")}
                        </button>
                      ) : null}
                      {!addr.isDefaultBilling ? (
                        <button
                          type="button"
                          onClick={() => void setDefault(addr.id, "billing")}
                          className="text-secondary underline hover:text-primary"
                        >
                          {tAccount("makeDefaultBilling")}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => startEdit(addr)}
                        className="text-secondary underline hover:text-primary"
                      >
                        {tAccount("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(addr.id)}
                        className="text-error underline"
                      >
                        {tAccount("delete")}
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "hesap" ? (
        <section className="mt-10 space-y-12" role="tabpanel">
          <div>
            <Reveal>
              <h2 className="mb-6 font-display text-2xl">
                {user.hasPassword
                  ? tAccount("changePassword")
                  : tAccount("setPassword")}
              </h2>
            </Reveal>
            <Reveal delay={40}>
              <form
                onSubmit={onChangePassword}
                className="industrial-border bg-surface-container-low max-w-xl space-y-4 p-6"
              >
                {!user.hasPassword ? (
                  <p className="font-meta text-[11px] uppercase leading-relaxed text-secondary">
                    {tAccount("googlePasswordHint")}
                  </p>
                ) : null}
                {user.hasPassword ? (
                  <Field
                    label={tAccount("currentPassword")}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    required
                    type="password"
                  />
                ) : null}
                <Field
                  label={tAccount("newPassword")}
                  value={newPassword}
                  onChange={setNewPassword}
                  required
                  type="password"
                />
                <Field
                  label={tAccount("newPasswordRepeat")}
                  value={newPassword2}
                  onChange={setNewPassword2}
                  required
                  type="password"
                />
                {pwError ? (
                  <p className="font-meta text-[11px] uppercase text-error">
                    {pwError}
                  </p>
                ) : null}
                {pwOk ? (
                  <p className="font-meta text-[11px] uppercase text-primary">
                    {pwOk}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={pwBusy}
                  className="btn-cta px-6 py-3 text-xs disabled:opacity-50"
                >
                  {pwBusy
                    ? tCommon("saving")
                    : user.hasPassword
                      ? tAccount("updatePassword")
                      : tAccount("setPasswordAction")}
                </button>
              </form>
            </Reveal>
          </div>

          <div className="max-w-xl">
            <Reveal>
              <h2 className="mb-4 font-display text-2xl">
                {tAccount("closeAccount")}
              </h2>
            </Reveal>
            <Reveal delay={40}>
              <p className="font-meta text-[11px] uppercase leading-relaxed text-secondary">
                {tAccount("closeAccountDetail")}
              </p>
              {closeAccountError ? (
                <p className="mt-3 font-meta text-[11px] uppercase text-error">
                  {closeAccountError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setCloseAccountOpen(true)}
                className="mt-6 border border-error/50 px-6 py-3 font-meta text-xs uppercase tracking-widest text-error hover:bg-error hover:text-deep-carbon"
              >
                {tAccount("deleteMyAccount")}
              </button>
            </Reveal>
          </div>
        </section>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={tAccount("closeDialog")}
            className="absolute inset-0 bg-deep-carbon/80"
            onClick={() => setDeleteId(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md border border-outline-variant/40 bg-surface-container-high p-6"
          >
            <p className="font-meta text-[10px] uppercase tracking-widest text-secondary">
              {tAccount("confirmLabel")}
            </p>
            <h3 className="mt-2 font-display text-2xl">
              {tAccount("deleteAddressTitle")}
            </h3>
            <p className="mt-3 font-meta text-xs leading-relaxed text-secondary">
              {pendingDelete
                ? tAccount("deleteAddressNamed", {
                    title: pendingDelete.title,
                  })
                : tAccount("deleteAddressBody")}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="btn-ghost px-6 py-3 text-xs"
              >
                {tAccount("dismiss")}
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="bg-error px-6 py-3 font-meta text-xs uppercase text-deep-carbon disabled:opacity-50"
              >
                {deleting ? tAccount("deleting") : tAccount("deleteAddressConfirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {closeAccountOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={tAccount("closeDialog")}
            className="absolute inset-0 bg-deep-carbon/80"
            onClick={() => setCloseAccountOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md border border-outline-variant/40 bg-surface-container-high p-6"
          >
            <p className="font-meta text-[10px] uppercase tracking-widest text-secondary">
              {tAccount("confirmLabel")}
            </p>
            <h3 className="mt-2 font-display text-2xl">
              {tAccount("deleteAccountTitle")}
            </h3>
            <p className="mt-3 font-meta text-xs leading-relaxed text-secondary">
              {tAccount("closeAccountConfirmDetail")}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setCloseAccountOpen(false)}
                disabled={closingAccount}
                className="btn-ghost px-6 py-3 text-xs"
              >
                {tAccount("dismiss")}
              </button>
              <button
                type="button"
                onClick={() => void confirmCloseAccount()}
                disabled={closingAccount}
                className="bg-error px-6 py-3 font-meta text-xs uppercase text-deep-carbon disabled:opacity-50"
              >
                {closingAccount
                  ? tAccount("closingAccount")
                  : tAccount("deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
        autoComplete={
          type === "password" ? "current-password" : undefined
        }
      />
    </div>
  );
}

function ToggleCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 font-meta text-xs uppercase text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}
