const TOKEN_KEY = "herbalife_access_token";
const COOKIE_NAME = "herbalife_token";
const AUTH_NEXT_KEY = "herbalife_auth_next";

function canUseDom() {
  return typeof window !== "undefined";
}

/** Açık yönlendirme yolları — open redirect engeli */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/hesabim",
): string {
  if (!next) return fallback;
  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (
    path.startsWith("/giris") ||
    path.startsWith("/kayit") ||
    path.startsWith("/auth")
  ) {
    return fallback;
  }
  return path;
}

export function rememberAuthNext(path: string) {
  if (!canUseDom()) return;
  const safe = safeNextPath(path, "");
  if (safe) window.sessionStorage.setItem(AUTH_NEXT_KEY, safe);
}

export function consumeAuthNext(fallback = "/hesabim"): string {
  if (!canUseDom()) return fallback;
  const raw = window.sessionStorage.getItem(AUTH_NEXT_KEY);
  window.sessionStorage.removeItem(AUTH_NEXT_KEY);
  return safeNextPath(raw, fallback);
}

export function loginPath(next?: string | null): string {
  const safe = safeNextPath(next, "");
  return safe ? `/giris?next=${encodeURIComponent(safe)}` : "/giris";
}

/** Typed href for next-intl Link / router (internal `/giris` pathname). */
export function loginHref(next?: string | null) {
  const safe = safeNextPath(next, "");
  if (safe) {
    return { pathname: "/giris" as const, query: { next: safe } };
  }
  return "/giris" as const;
}

export function registerHref(next?: string | null) {
  const safe = safeNextPath(next, "");
  if (safe) {
    return { pathname: "/kayit" as const, query: { next: safe } };
  }
  return "/kayit" as const;
}

export function getToken(): string | null {
  if (!canUseDom()) return null;
  return (
    window.localStorage.getItem(TOKEN_KEY) ||
    readCookie(COOKIE_NAME) ||
    null
  );
}

export function setToken(token: string) {
  if (!canUseDom()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearToken() {
  if (!canUseDom()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

const OPS_ROLES = ["admin", "staff", "accountant"] as const;

export function isOpsRole(role: string | undefined | null): boolean {
  return Boolean(role && (OPS_ROLES as readonly string[]).includes(role));
}

function readCookie(name: string): string | null {
  if (!canUseDom()) return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}
