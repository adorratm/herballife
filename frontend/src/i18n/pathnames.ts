/**
 * Internal pathnames = app/[locale]/… folder structure (TR).
 * External pathnames per locale — non-TR locales must not expose Turkish URL segments.
 * Extra store locales (it/nl/pt/pl/ru/az) inherit English paths unless overridden.
 */
const EXTENDED_LOCALES = ["it", "nl", "pt", "pl", "ru", "az"] as const;

function extendLocaleMap(
  map: Record<string, string>,
): Record<string, string> {
  const en = map.en || Object.values(map)[0];
  const out = { ...map };
  for (const loc of EXTENDED_LOCALES) {
    if (!out[loc]) out[loc] = en;
  }
  return out;
}

function withExtendedPaths<T extends Record<string, string | Record<string, string>>>(
  input: T,
): T {
  const out: Record<string, string | Record<string, string>> = {};
  for (const [key, val] of Object.entries(input)) {
    out[key] =
      typeof val === "string" ? val : extendLocaleMap(val as Record<string, string>);
  }
  return out as T;
}

const pathnamesBase = {
  "/": "/",

  "/urunler": {
    en: "/products",
    de: "/produkte",
    fr: "/produits",
    es: "/productos",
  },
  "/urunler/kategori/[slug]": {
    en: "/products/category/[slug]",
    de: "/produkte/kategorie/[slug]",
    fr: "/produits/categorie/[slug]",
    es: "/productos/categoria/[slug]",
  },
  "/urunler/[slug]": {
    en: "/products/[slug]",
    de: "/produkte/[slug]",
    fr: "/produits/[slug]",
    es: "/productos/[slug]",
  },

  "/hakkimizda": {
    en: "/about",
    de: "/ueber-uns",
    fr: "/a-propos",
    es: "/nosotros",
  },
  "/blog": "/blog",
  "/blog/[slug]": "/blog/[slug]",
  "/medya": {
    en: "/media",
    de: "/medien",
    fr: "/medias",
    es: "/medios",
  },
  "/sss": {
    en: "/faq",
    de: "/faq",
    fr: "/faq",
    es: "/faq",
  },
  "/yorum": {
    en: "/reviews",
    de: "/bewertungen",
    fr: "/avis",
    es: "/opiniones",
  },
  "/iletisim": {
    en: "/contact",
    de: "/kontakt",
    fr: "/contact",
    es: "/contacto",
  },
  "/kocluk": {
    en: "/coaching",
    de: "/coaching",
    fr: "/coaching",
    es: "/coaching",
  },
  "/danismanlik": {
    en: "/consulting",
    de: "/beratung",
    fr: "/conseil",
    es: "/asesoria",
  },

  "/sepet": {
    en: "/cart",
    de: "/warenkorb",
    fr: "/panier",
    es: "/carrito",
  },
  "/odeme": {
    en: "/checkout",
    de: "/kasse",
    fr: "/paiement",
    es: "/pago",
  },
  "/odeme/basarili": {
    en: "/checkout/success",
    de: "/kasse/erfolg",
    fr: "/paiement/succes",
    es: "/pago/exito",
  },
  "/odeme/basarisiz": {
    en: "/checkout/failed",
    de: "/kasse/fehlgeschlagen",
    fr: "/paiement/echec",
    es: "/pago/fallido",
  },
  "/odeme/paytr": {
    en: "/checkout/paytr",
    de: "/kasse/paytr",
    fr: "/paiement/paytr",
    es: "/pago/paytr",
  },
  "/odeme-bildirimi": {
    en: "/payment-notification",
    de: "/zahlungsmitteilung",
    fr: "/notification-paiement",
    es: "/aviso-pago",
  },
  "/banka-hesaplari": {
    en: "/bank-accounts",
    de: "/bankkonten",
    fr: "/comptes-bancaires",
    es: "/cuentas-bancarias",
  },
  "/siparis-sorgula": {
    en: "/order-lookup",
    de: "/bestellung-verfolgen",
    fr: "/suivi-commande",
    es: "/consultar-pedido",
  },
  "/takip": {
    en: "/tracking",
    de: "/sendungsverfolgung",
    fr: "/suivi",
    es: "/seguimiento",
  },
  "/takip/[kod]": {
    en: "/tracking/[kod]",
    de: "/sendungsverfolgung/[kod]",
    fr: "/suivi/[kod]",
    es: "/seguimiento/[kod]",
  },

  "/giris": {
    en: "/login",
    de: "/anmelden",
    fr: "/connexion",
    es: "/iniciar-sesion",
  },
  "/kayit": {
    en: "/register",
    de: "/registrieren",
    fr: "/inscription",
    es: "/registro",
  },
  "/sifremi-unuttum": {
    en: "/forgot-password",
    de: "/passwort-vergessen",
    fr: "/mot-de-passe-oublie",
    es: "/olvide-contrasena",
  },
  "/sifre-sifirla": {
    en: "/reset-password",
    de: "/passwort-zuruecksetzen",
    fr: "/reinitialiser-mot-de-passe",
    es: "/restablecer-contrasena",
  },
  "/auth/callback": "/auth/callback",

  "/hesabim": {
    en: "/account",
    de: "/konto",
    fr: "/compte",
    es: "/cuenta",
  },
  "/hesabim/favoriler": {
    en: "/account/favorites",
    de: "/konto/favoriten",
    fr: "/compte/favoris",
    es: "/cuenta/favoritos",
  },
  "/hesabim/bildirimler": {
    en: "/account/notifications",
    de: "/konto/benachrichtigungen",
    fr: "/compte/notifications",
    es: "/cuenta/notificaciones",
  },
  "/hesabim/takip": {
    en: "/account/nutrition",
    de: "/konto/ernaehrung",
    fr: "/compte/nutrition",
    es: "/cuenta/nutricion",
  },
  "/hesabim/olcumler": {
    en: "/account/measurements",
    de: "/konto/messungen",
    fr: "/compte/mesures",
    es: "/cuenta/medidas",
  },
  "/hesabim/rapor": {
    en: "/account/report",
    de: "/konto/bericht",
    fr: "/compte/rapport",
    es: "/cuenta/informe",
  },
  "/hesabim/siparisler/[id]": {
    en: "/account/orders/[id]",
    de: "/konto/bestellungen/[id]",
    fr: "/compte/commandes/[id]",
    es: "/cuenta/pedidos/[id]",
  },

  "/gizlilik": {
    en: "/privacy",
    de: "/datenschutz",
    fr: "/confidentialite",
    es: "/privacidad",
  },
  "/kvkk": {
    en: "/privacy-notice",
    de: "/datenschutzhinweis",
    fr: "/avis-confidentialite",
    es: "/aviso-privacidad",
  },
  "/cerez-politikasi": {
    en: "/cookie-policy",
    de: "/cookie-richtlinie",
    fr: "/politique-cookies",
    es: "/politica-cookies",
  },
  "/mesafeli-satis": {
    en: "/distance-sales",
    de: "/fernabsatz",
    fr: "/vente-a-distance",
    es: "/venta-a-distancia",
  },
  "/on-bilgilendirme": {
    en: "/pre-information",
    de: "/vorabinformationen",
    fr: "/information-precontractuelle",
    es: "/informacion-previa",
  },
  "/iptal-iade": {
    en: "/returns",
    de: "/widerruf",
    fr: "/retours",
    es: "/devoluciones",
  },
  "/aydinlatma-metni": {
    en: "/disclosure",
    de: "/offenlegung",
    fr: "/information-legale",
    es: "/texto-informativo",
  },
  "/guvenli-alisveris": {
    en: "/secure-shopping",
    de: "/sicheres-einkaufen",
    fr: "/achat-securise",
    es: "/compra-segura",
  },
  "/musteri-memnuniyeti": {
    en: "/customer-satisfaction",
    de: "/kundenzufriedenheit",
    fr: "/satisfaction-client",
    es: "/satisfaccion-cliente",
  },
} as const;

export const pathnames = withExtendedPaths(
  pathnamesBase as unknown as Record<string, string | Record<string, string>>,
) as typeof pathnamesBase;

export type AppPathname = keyof typeof pathnamesBase;
