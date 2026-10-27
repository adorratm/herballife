import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Cart } from "@/lib/types";

const SESSION_KEY = "herbalkapida_cart_session";

function canUseDom() {
  return typeof window !== "undefined";
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCartSessionId(): string {
  if (!canUseDom()) return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function setCartSessionId(id: string) {
  if (!canUseDom()) return;
  window.localStorage.setItem(SESSION_KEY, id);
}

export async function fetchCart(): Promise<Cart | null> {
  const sessionId = getCartSessionId();
  if (!sessionId) return null;
  // Hata yukarı fırlatılır — boş sepet ile karıştırılmaz (login merge dahil)
  return getCart(sessionId, getToken());
}

/** Sepet değiştiğinde (ekle/güncelle/sil/boşalt) rozetleri anında güncellemek için. */
const CART_EVENT = "herbal:cart-changed";

let cartVersion = 0;

/** Her sepet yayınında artar; yarış durumunda eski fetch sonucunu atmak için. */
export function getCartVersion() {
  return cartVersion;
}

/** Güncel sepeti tüm dinleyicilere (SiteHeader, MobileBottomNav…) bildirir. */
export function emitCartChanged(cart: Cart | null | undefined) {
  cartVersion += 1;
  if (!canUseDom()) return;
  window.dispatchEvent(
    new CustomEvent(CART_EVENT, { detail: { count: cartItemCount(cart) } }),
  );
}

/** Sepet adedi değiştiğinde çağrılır. Dönen fonksiyon aboneliği kaldırır. */
export function subscribeCart(cb: (count: number) => void) {
  if (!canUseDom()) return () => undefined;
  function onChange(e: Event) {
    const count = (e as CustomEvent<{ count?: number }>).detail?.count;
    if (typeof count === "number") cb(count);
  }
  window.addEventListener(CART_EVENT, onChange);
  return () => window.removeEventListener(CART_EVENT, onChange);
}

export async function cartAddItem(payload: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
}) {
  const sessionId = getCartSessionId();
  const cart = await addCartItem(
    sessionId,
    {
      productId: payload.productId,
      variantId: payload.variantId ?? null,
      quantity: payload.quantity ?? 1,
    },
    getToken(),
  );
  emitCartChanged(cart);
  return cart;
}

export async function cartUpdateQuantity(itemId: string, quantity: number) {
  const sessionId = getCartSessionId();
  const cart = await updateCartItem(sessionId, itemId, quantity, getToken());
  emitCartChanged(cart);
  return cart;
}

export async function cartRemoveItem(itemId: string) {
  const sessionId = getCartSessionId();
  const cart = await removeCartItem(sessionId, itemId, getToken());
  emitCartChanged(cart);
  return cart;
}

export function cartItemCount(cart: Cart | null | undefined) {
  if (!cart?.items?.length) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(cart: Cart | null | undefined) {
  if (!cart?.items?.length) return 0;
  if (cart.subtotal) return Number(cart.subtotal);
  return cart.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
}
