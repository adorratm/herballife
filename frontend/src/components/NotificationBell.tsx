"use client";

import { Link, asRouterHref, toLinkHref, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  fetchInbox,
  fetchNotificationPrefs,
  fetchUnreadCount,
  markInboxAllRead,
  markInboxRead,
  type InboxItem,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  connectNotifySocket,
  requestBrowserPushPermission,
  showBrowserNotification,
} from "@/lib/inbox";
import { localizeInboxItem } from "@/lib/inbox-copy";

export function NotificationBell({
  listHref = "/hesabim/bildirimler",
}: {
  listHref?: string;
}) {
  const t = useTranslations("notificationsBell");
  const tNav = useTranslations("nav");
  const tInbox = useTranslations("notificationsPage");
  const tCopy = useTranslations("inboxCopy");
  const tAria = useTranslations("aria");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<InboxItem[]>([]);

  function copyFor(item: InboxItem) {
    return localizeInboxItem(
      item,
      (key, values) => tCopy(key as never, values as never),
      (key) => tCopy.has(key as never),
    );
  }

  const copyForRef = useRef(copyFor);
  copyForRef.current = copyFor;

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    function load() {
      const t = getToken();
      if (!t) return;
      void fetchUnreadCount(t)
        .then((r) => setUnread(r.count))
        .catch(() => undefined);
      void fetchInbox(t, 1)
        .then((r) => setItems(r.items.slice(0, 8)))
        .catch(() => undefined);
    }

    load();
    const poll = setInterval(load, 40000);
    void fetchNotificationPrefs(token)
      .then((p) => {
        if (p.pushEnabled) return requestBrowserPushPermission();
      })
      .catch(() => undefined);
    const socket = connectNotifySocket(token);
    socket.on("notify:new", (row: InboxItem) => {
      setItems((prev) => [row, ...prev].slice(0, 8));
      setUnread((n) => n + 1);
      void fetchNotificationPrefs(token)
        .then((p) => {
          if (p.pushEnabled) {
            showBrowserNotification({ ...row, ...copyForRef.current(row) });
          }
        })
        .catch(() => undefined);
    });
    return () => {
      clearInterval(poll);
      socket.disconnect();
    };
  }, []);

  async function openItem(item: InboxItem) {
    const token = getToken();
    if (token && !item.readAt) {
      await markInboxRead(token, item.id).catch(() => undefined);
      setUnread((n) => Math.max(0, n - 1));
      setItems((prev) =>
        prev.map((r) =>
          r.id === item.id ? { ...r, readAt: new Date().toISOString() } : r,
        ),
      );
    }
    setOpen(false);
    if (item.href) router.push(asRouterHref(item.href));
  }

  async function readAll() {
    const token = getToken();
    if (!token) return;
    await markInboxAllRead(token).catch(() => undefined);
    setUnread(0);
    setItems((prev) =>
      prev.map((r) => ({ ...r, readAt: r.readAt || new Date().toISOString() })),
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-low"
        aria-label={tAria("notifications")}
      >
        <BellIcon />
        {unread > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-70 mt-3 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="font-meta text-[10px] uppercase tracking-widest text-secondary">
              {tNav("notifications")}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => void readAll()}
                className="rounded-full px-2 py-0.5 font-meta text-[10px] uppercase text-primary hover:bg-primary-fixed"
              >
                {t("markAllRead")}
              </button>
            ) : null}
          </div>
          {!items.length ? (
            <p className="py-4 font-meta text-[11px] uppercase text-secondary">
              {tInbox("empty")}
            </p>
          ) : (
            <ul className="max-h-80 space-y-1.5 overflow-auto">
              {items.map((item) => {
                const copy = copyFor(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void openItem(item)}
                      className={`block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-container-low ${
                        item.readAt
                          ? "opacity-60"
                          : "bg-primary-fixed/50 ring-1 ring-inset ring-primary/15"
                      }`}
                    >
                      <p className="text-sm font-semibold text-on-surface">
                        {copy.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 font-meta text-[11px] leading-snug text-secondary">
                        {copy.body}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 border-t border-outline-variant/25 pt-3">
            <Link
              href={toLinkHref(listHref)}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 20a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
