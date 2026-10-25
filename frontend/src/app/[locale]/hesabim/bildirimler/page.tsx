"use client";

import { useEffect, useMemo, useState } from "react";
import { asRouterHref, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { AccountTabs } from "@/components/AccountTabs";
import {
  fetchInbox,
  fetchNotificationPrefs,
  markInboxAllRead,
  markInboxRead,
  updateNotificationPrefs,
  type InboxItem,
  type NotificationPrefs,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { requestBrowserPushPermission } from "@/lib/inbox";

export default function AccountNotificationsPage() {
  const t = useTranslations("notificationsPage");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [error, setError] = useState<string | null>(null);

  const CUSTOMER_TOGGLES = useMemo(
    () =>
      [
        { key: "inAppEnabled" as const, label: t("toggleInApp") },
        { key: "pushEnabled" as const, label: t("togglePush") },
        { key: "ordersEnabled" as const, label: t("toggleOrders") },
        { key: "shippingEnabled" as const, label: t("toggleShipping") },
        { key: "returnsEnabled" as const, label: t("toggleReturns") },
        { key: "accountEnabled" as const, label: t("toggleAccount") },
        { key: "marketingEnabled" as const, label: t("toggleMarketing") },
      ] as const,
    [t],
  );

  async function load() {
    const token = getToken();
    if (!token) {
      router.replace(asRouterHref("/giris?next=/hesabim/bildirimler"));
      return;
    }
    try {
      const [inbox, p] = await Promise.all([
        fetchInbox(token),
        fetchNotificationPrefs(token),
      ]);
      setItems(inbox.items);
      setPrefs(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loadError"));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(key: keyof NotificationPrefs, value: boolean) {
    const token = getToken();
    if (!token || !prefs) return;
    if (key === "pushEnabled" && value) {
      const ok = await requestBrowserPushPermission();
      if (!ok) return;
    }
    const next = await updateNotificationPrefs(token, { [key]: value });
    setPrefs(next);
  }

  async function openItem(item: InboxItem) {
    const token = getToken();
    if (token && !item.readAt)
      await markInboxRead(token, item.id).catch(() => undefined);
    if (item.href) router.push(asRouterHref(item.href));
    else void load();
  }

  return (
    <div className="page-shell py-16 md:py-24">
      <div className="mb-2 font-meta text-xs uppercase tracking-widest text-primary">
        {t("breadcrumb")}
      </div>
      <h1 className="font-display text-4xl">{t("title")}</h1>
      <p className="mt-3 font-meta text-xs uppercase text-secondary">
        {t("subtitle")}
      </p>

      <AccountTabs active="bildirimler" />

      {error ? (
        <p className="mt-6 font-meta text-sm uppercase text-error">{error}</p>
      ) : null}

      {prefs ? (
        <section className="mt-10 max-w-xl space-y-3">
          <h2 className="font-display text-2xl">{t("prefs")}</h2>
          {CUSTOMER_TOGGLES.map((row) => (
            <label
              key={row.key}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-white px-4 py-3 shadow-sm"
            >
              <span className="font-meta text-xs uppercase">{row.label}</span>
              <input
                type="checkbox"
                checked={Boolean(prefs[row.key])}
                onChange={(e) => void toggle(row.key, e.target.checked)}
              />
            </label>
          ))}
        </section>
      ) : null}

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">{t("inbox")}</h2>
          <button
            type="button"
            onClick={() => {
              const token = getToken();
              if (token) void markInboxAllRead(token).then(() => load());
            }}
            className="rounded-full px-3 py-1.5 font-meta text-[11px] uppercase text-primary hover:bg-primary-fixed"
          >
            {t("markAllRead")}
          </button>
        </div>
        {!items.length ? (
          <p className="rounded-2xl border border-outline-variant/25 bg-white px-5 py-10 font-meta text-xs uppercase text-secondary">
            {t("empty")}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => void openItem(item)}
                  className={`block w-full rounded-2xl border border-outline-variant/25 bg-white px-5 py-4 text-left shadow-sm transition-colors hover:border-primary/35 hover:bg-surface-container-low ${
                    item.readAt
                      ? "opacity-60"
                      : "ring-1 ring-inset ring-primary/15"
                  }`}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 font-meta text-[11px] text-secondary">
                    {item.body}
                  </p>
                  {item.createdAt ? (
                    <p className="mt-1 font-meta text-[10px] uppercase text-secondary">
                      {new Date(item.createdAt).toLocaleString(locale)}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
