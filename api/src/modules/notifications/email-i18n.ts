/** Müşteri e-postaları: tr/en/de/fr/es (diğer vitrin dilleri → en). Ops/admin TR kalır. */

export const EMAIL_LOCALES = ['tr', 'en', 'de', 'fr', 'es'] as const;
export type EmailLocale = (typeof EMAIL_LOCALES)[number];

const STORE_LOCALES = [
  'tr',
  'en',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'pt',
  'pl',
  'ru',
  'az',
] as const;

export function normalizeStoreLocale(raw?: string | null): string {
  const code = String(raw || 'tr')
    .trim()
    .toLowerCase()
    .split(/[-_]/)[0];
  return (STORE_LOCALES as readonly string[]).includes(code) ? code : 'tr';
}

export function resolveEmailLocale(raw?: string | null): EmailLocale {
  const code = normalizeStoreLocale(raw);
  if ((EMAIL_LOCALES as readonly string[]).includes(code)) {
    return code as EmailLocale;
  }
  return 'en';
}

const PATHS = {
  account: {
    tr: '/hesabim',
    en: '/account',
    de: '/konto',
    fr: '/compte',
    es: '/cuenta',
  },
  cart: {
    tr: '/sepet',
    en: '/cart',
    de: '/warenkorb',
    fr: '/panier',
    es: '/carrito',
  },
  resetPassword: {
    tr: '/sifre-sifirla',
    en: '/reset-password',
    de: '/passwort-zuruecksetzen',
    fr: '/reinitialiser-mot-de-passe',
    es: '/restablecer-contrasena',
  },
  tracking: {
    tr: '/takip',
    en: '/tracking',
    de: '/sendungsverfolgung',
    fr: '/suivi',
    es: '/seguimiento',
  },
} as const;

type StorePathKey = keyof typeof PATHS;

/** next-intl as-needed: tr önek yok; diğer diller /{locale}{path} */
export function storefrontHref(
  frontendUrl: string,
  localeRaw: string | null | undefined,
  route: StorePathKey,
  suffix = '',
): string {
  const base = frontendUrl.replace(/\/$/, '');
  const storeLocale = normalizeStoreLocale(localeRaw);
  const pathMap = PATHS[route] as Record<string, string>;
  const segment =
    pathMap[storeLocale] || pathMap[resolveEmailLocale(storeLocale)] || pathMap.tr;
  const path = `${segment}${suffix}`;
  if (storeLocale === 'tr') return `${base}${path}`;
  return `${base}/${storeLocale}${path}`;
}

const STATUS_BY_LOCALE: Record<EmailLocale, Record<string, string>> = {
  tr: {
    pending_payment: 'Ödeme bekleniyor',
    paid: 'Ödeme alındı',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoya verildi',
    delivered: 'Teslim edildi',
    cancelled: 'İptal edildi',
    refunded: 'İade edildi',
    pending: 'Beklemede',
    label_created: 'Etiket oluşturuldu',
    in_transit: 'Yolda',
    failed: 'Başarısız',
    returned: 'İade kargo',
  },
  en: {
    pending_payment: 'Awaiting payment',
    paid: 'Payment received',
    processing: 'Preparing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    pending: 'Pending',
    label_created: 'Label created',
    in_transit: 'In transit',
    failed: 'Failed',
    returned: 'Return shipment',
  },
  de: {
    pending_payment: 'Zahlung ausstehend',
    paid: 'Zahlung erhalten',
    processing: 'In Vorbereitung',
    shipped: 'Versendet',
    delivered: 'Zugestellt',
    cancelled: 'Storniert',
    refunded: 'Erstattet',
    pending: 'Ausstehend',
    label_created: 'Etikett erstellt',
    in_transit: 'Unterwegs',
    failed: 'Fehlgeschlagen',
    returned: 'Rücksendung',
  },
  fr: {
    pending_payment: 'Paiement en attente',
    paid: 'Paiement reçu',
    processing: 'En préparation',
    shipped: 'Expédié',
    delivered: 'Livré',
    cancelled: 'Annulé',
    refunded: 'Remboursé',
    pending: 'En attente',
    label_created: 'Étiquette créée',
    in_transit: 'En transit',
    failed: 'Échoué',
    returned: 'Retour',
  },
  es: {
    pending_payment: 'Pago pendiente',
    paid: 'Pago recibido',
    processing: 'En preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
    pending: 'Pendiente',
    label_created: 'Etiqueta creada',
    in_transit: 'En tránsito',
    failed: 'Fallido',
    returned: 'Devolución',
  },
};

export function localizedStatusLabel(
  status: string,
  locale?: string | null,
): string {
  const loc = resolveEmailLocale(locale);
  return STATUS_BY_LOCALE[loc][status] || STATUS_BY_LOCALE.en[status] || status;
}

const NUMBER_LOCALE: Record<EmailLocale, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
};

export function formatMoneyLocalized(
  amount: string | number,
  currency = 'TRY',
  locale?: string | null,
): string {
  const loc = resolveEmailLocale(locale);
  const n = Number(amount);
  const formatted = Number.isFinite(n)
    ? n.toLocaleString(NUMBER_LOCALE[loc], {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : String(amount);
  return currency === 'TRY' ? `${formatted} ₺` : `${formatted} ${currency}`;
}

export type EmailCopy = {
  distributorTag: string;
  hello: string;
  helloName: (name: string) => string;
  order: string;
  status: string;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  products: string;
  orderContents: string;
  noItems: string;
  customer: string;
  shippingAddress: string;
  billingAddress: string;
  note: string;
  taxId: string;
  taxOffice: string;
  trackingCode: string;
  delivery: string;
  document: string;
  myOrders: string;
  trackShipment: string;
  liveTracking: string;
  backToCart: string;
  stock: string;
  sku: string;
  manageProducts: string;
  adminOrders: string;
  orderReceivedTitle: string;
  orderReceivedSubject: (orderNo: string) => string;
  orderReceivedBody: (orderNoHtml: string) => string;
  orderReceivedText: (orderNo: string) => string;
  orderPaidTitle: string;
  orderPaidSubject: (orderNo: string) => string;
  orderPaidBody: (orderNoHtml: string) => string;
  orderPaidText: (orderNo: string) => string;
  orderStatusTitle: string;
  orderStatusSubject: (label: string, orderNo: string) => string;
  orderStatusBody: (orderNoHtml: string, labelHtml: string) => string;
  orderStatusText: (orderNo: string, label: string) => string;
  returnRequestedTitle: string;
  returnRequestedSubject: (orderNo: string) => string;
  returnRequestedBody: (orderNoHtml: string) => string;
  returnRequestedText: (orderNo: string) => string;
  returnReviewing: string;
  returnApprovedTitle: string;
  returnApprovedSubject: (orderNo: string) => string;
  returnApprovedBody: (orderNoHtml: string) => string;
  returnApprovedText: (orderNo: string) => string;
  approved: string;
  returnRejectedTitle: string;
  returnRejectedSubject: (orderNo: string) => string;
  returnRejectedBody: (orderNoHtml: string) => string;
  returnRejectedText: (orderNo: string) => string;
  rejected: string;
  shipmentCreatedTitle: string;
  shipmentCreatedSubject: (orderNo: string) => string;
  shipmentCreatedBody: (orderNoHtml: string) => string;
  shipmentCreatedText: (orderNo: string, track: string) => string;
  shipmentStatusTitle: string;
  shipmentStatusSubject: (label: string, orderNo: string) => string;
  shipmentStatusBody: (labelHtml: string) => string;
  shipmentStatusText: (label: string, trackUrl: string) => string;
  defaultNotifyTitle: string;
  defaultNotifySubject: (brand: string, orderNo: string) => string;
  defaultNotifyBody: (labelHtml: string) => string;
  defaultNotifyText: (label: string) => string;
  waOrderReceived: (name: string, orderNo: string, brand: string) => string;
  waOrderPaid: (name: string, orderNo: string, brand: string) => string;
  waShipmentCreated: (
    name: string,
    orderNo: string,
    trackCode: string | undefined,
    trackUrl: string,
    brand: string,
  ) => string;
  waShipmentStatus: (
    name: string,
    label: string,
    trackCode: string | undefined,
    trackUrl: string,
    brand: string,
  ) => string;
  waOrderStatus: (
    name: string,
    orderNo: string,
    label: string,
    brand: string,
  ) => string;
  waDefault: (name: string, orderNo: string, label: string, brand: string) => string;
  passwordResetSubject: string;
  passwordSetSubject: string;
  passwordResetBody: string;
  passwordSetBody: string;
  passwordResetCta: string;
  passwordSetCta: string;
  passwordAppLink: (url: string) => string;
  passwordResetText: (name: string, url: string, app?: string) => string;
  passwordSetText: (name: string, url: string, app?: string) => string;
  abandonedSubject1: string;
  abandonedSubject2: string;
  abandonedTitle1: string;
  abandonedTitle2: string;
  abandonedBody1: (countHtml: string) => string;
  abandonedBody2: (countHtml: string) => string;
  abandonedText: (name: string, count: number, url: string) => string;
  invoiceEarchive: string;
  invoiceEinvoice: string;
  invoiceBody: (orderHtml: string, invHtml: string) => string;
  invoiceContact: string;
  invoiceText: (name: string, orderNo: string, invNo: string, url: string) => string;
  invoiceSubject: (docLabel: string, invNo: string) => string;
};

function buildCopy(locale: EmailLocale): EmailCopy {
  const helloName =
    locale === 'tr'
      ? (name: string) => `Merhaba ${name},`
      : locale === 'de'
        ? (name: string) => `Hallo ${name},`
        : locale === 'fr'
          ? (name: string) => `Bonjour ${name},`
          : locale === 'es'
            ? (name: string) => `Hola ${name},`
            : (name: string) => `Hello ${name},`;

  const hello =
    locale === 'tr'
      ? 'Merhaba'
      : locale === 'de'
        ? 'Hallo'
        : locale === 'fr'
          ? 'Bonjour'
          : locale === 'es'
            ? 'Hola'
            : 'Hello';

  if (locale === 'en') {
    return {
      distributorTag: 'Independent Distributor',
      hello,
      helloName,
      order: 'Order',
      status: 'Status',
      subtotal: 'Subtotal',
      discount: 'Discount',
      shipping: 'Shipping',
      total: 'Total',
      products: 'Items',
      orderContents: 'Order contents',
      noItems: 'No items',
      customer: 'Customer',
      shippingAddress: 'Shipping address',
      billingAddress: 'Billing address',
      note: 'Note',
      taxId: 'Tax ID',
      taxOffice: 'Tax office',
      trackingCode: 'Tracking number',
      delivery: 'Delivery',
      document: 'Document',
      myOrders: 'My orders',
      trackShipment: 'Track shipment',
      liveTracking: 'Live tracking',
      backToCart: 'Return to cart',
      stock: 'Stock',
      sku: 'SKU',
      manageProducts: 'Manage products',
      adminOrders: 'Admin orders',
      orderReceivedTitle: 'Order received',
      orderReceivedSubject: (n) => `Your order was received — ${n}`,
      orderReceivedBody: (h) =>
        `${h} has been received. We will start preparing it once payment is complete.`,
      orderReceivedText: (n) => `Your order ${n} was received.`,
      orderPaidTitle: 'Payment received',
      orderPaidSubject: (n) => `Payment received — ${n}`,
      orderPaidBody: (h) =>
        `Payment for ${h} was received. Your order is now being prepared.`,
      orderPaidText: (n) => `Payment for ${n} was received.`,
      orderStatusTitle: 'Order update',
      orderStatusSubject: (l, n) => `Order status: ${l} — ${n}`,
      orderStatusBody: (oh, lh) =>
        `The new status for ${oh} is: ${lh}.`,
      orderStatusText: (n, l) => `${n} status: ${l}.`,
      returnRequestedTitle: 'Request received',
      returnRequestedSubject: (n) => `Return / cancel request received — ${n}`,
      returnRequestedBody: (h) =>
        `Your cancel/return request for ${h} was received. We will update you after review.`,
      returnRequestedText: (n) =>
        `Your cancel/return request for ${n} was received.`,
      returnReviewing: 'Under review',
      returnApprovedTitle: 'Request approved',
      returnApprovedSubject: (n) => `Return / cancel request approved — ${n}`,
      returnApprovedBody: (h) =>
        `Your request for ${h} was approved. You will be notified when the refund is complete.`,
      returnApprovedText: (n) =>
        `Your cancel/return request for ${n} was approved.`,
      approved: 'Approved',
      returnRejectedTitle: 'Request outcome',
      returnRejectedSubject: (n) => `Return / cancel request — ${n}`,
      returnRejectedBody: (h) =>
        `Your request for ${h} could not be approved at this time. Please contact us for details.`,
      returnRejectedText: (n) =>
        `Your cancel/return request for ${n} was not approved.`,
      rejected: 'Rejected',
      shipmentCreatedTitle: 'Shipped',
      shipmentCreatedSubject: (n) => `Shipped — ${n}`,
      shipmentCreatedBody: (h) => `${h} has been shipped.`,
      shipmentCreatedText: (n, t) => `${n} has been shipped. Tracking: ${t}`,
      shipmentStatusTitle: 'Shipment update',
      shipmentStatusSubject: (l, n) => `Shipment update: ${l} — ${n}`,
      shipmentStatusBody: (lh) => `Your shipment status was updated: ${lh}.`,
      shipmentStatusText: (l, u) => `Shipment status ${l}. Tracking: ${u}`,
      defaultNotifyTitle: 'Order notification',
      defaultNotifySubject: (b, n) => `${b} notification — ${n}`,
      defaultNotifyBody: (lh) => `There is an update on your order: ${lh}.`,
      defaultNotifyText: (l) => `Order update: ${l}.`,
      waOrderReceived: (name, orderNo, brand) =>
        `Hello ${name},\n\nOrder ${orderNo} was received. We will start preparing it once payment is complete.\n\n${brand}`,
      waOrderPaid: (name, orderNo, brand) =>
        `Hello ${name},\n\nPayment for order ${orderNo} was received. Your order is being prepared.\n\n${brand}`,
      waShipmentCreated: (name, orderNo, trackCode, trackUrl, brand) =>
        `Hello ${name},\n\nOrder ${orderNo} has been shipped.${trackCode ? `\nTracking number: ${trackCode}` : ''}\nTrack: ${trackUrl}\n\n${brand}`,
      waShipmentStatus: (name, label, trackCode, trackUrl, brand) =>
        `Hello ${name},\n\nShipment status: ${label}.${trackCode ? `\nTracking number: ${trackCode}` : ''}\nTrack: ${trackUrl}\n\n${brand}`,
      waOrderStatus: (name, orderNo, label, brand) =>
        `Hello ${name},\n\nNew status for order ${orderNo}: ${label}.\n\n${brand}`,
      waDefault: (name, orderNo, label, brand) =>
        `Hello ${name},\n\n${orderNo} — ${label}\n\n${brand}`,
      passwordResetSubject: 'Password reset',
      passwordSetSubject: 'Set your password',
      passwordResetBody:
        'We received a password reset request for your account. The link is valid for 1 hour. If you did not request this, you can ignore this email.',
      passwordSetBody:
        'You can set a password to also sign in with email and password. Your Google sign-in stays available. The link is valid for 1 hour.',
      passwordResetCta: 'Reset password',
      passwordSetCta: 'Set password',
      passwordAppLink: (url) =>
        `If you use the app, open this link: ${url}`,
      passwordResetText: (name, url, app) =>
        `Hello ${name}, reset your password: ${url}${app ? ` · app: ${app}` : ''} (valid 1 hour)`,
      passwordSetText: (name, url, app) =>
        `Hello ${name}, set your password: ${url}${app ? ` · app: ${app}` : ''} (valid 1 hour). Google sign-in stays available.`,
      abandonedSubject1: 'Items in your cart are waiting',
      abandonedSubject2: 'Your cart is still waiting',
      abandonedTitle1: 'Cart reminder',
      abandonedTitle2: 'Final reminder',
      abandonedBody1: (c) =>
        `You still have ${c} item(s) in your cart. Complete your order before the offer ends.`,
      abandonedBody2: (c) =>
        `${c} item(s) in your cart are still waiting. This is a final reminder to complete your order.`,
      abandonedText: (name, count, url) =>
        `Hello ${name}, you have ${count} item(s) in your cart: ${url}`,
      invoiceEarchive: 'Your e-Archive invoice',
      invoiceEinvoice: 'e-Invoice',
      invoiceBody: (o, i) =>
        `The document ${i} for order ${o} is attached.`,
      invoiceContact:
        'You can reply to this email or contact us with any questions.',
      invoiceText: (name, orderNo, invNo, url) =>
        `Hello ${name},\n\nInvoice ${invNo} for order ${orderNo} is attached.\n\n${url}`,
      invoiceSubject: (doc, inv) => `${doc} — ${inv}`,
    };
  }

  if (locale === 'de') {
    return {
      distributorTag: 'Unabhängiger Distributor',
      hello,
      helloName,
      order: 'Bestellung',
      status: 'Status',
      subtotal: 'Zwischensumme',
      discount: 'Rabatt',
      shipping: 'Versand',
      total: 'Gesamt',
      products: 'Artikel',
      orderContents: 'Bestellinhalt',
      noItems: 'Keine Artikel',
      customer: 'Kunde',
      shippingAddress: 'Lieferadresse',
      billingAddress: 'Rechnungsadresse',
      note: 'Hinweis',
      taxId: 'Steuernummer',
      taxOffice: 'Finanzamt',
      trackingCode: 'Sendungsnummer',
      delivery: 'Lieferung',
      document: 'Dokument',
      myOrders: 'Meine Bestellungen',
      trackShipment: 'Sendung verfolgen',
      liveTracking: 'Live-Sendungsverfolgung',
      backToCart: 'Zum Warenkorb',
      stock: 'Bestand',
      sku: 'SKU',
      manageProducts: 'Produkte verwalten',
      adminOrders: 'Admin-Bestellungen',
      orderReceivedTitle: 'Bestellung erhalten',
      orderReceivedSubject: (n) => `Ihre Bestellung wurde erhalten — ${n}`,
      orderReceivedBody: (h) =>
        `${h} wurde erhalten. Nach Zahlungseingang beginnen wir mit der Vorbereitung.`,
      orderReceivedText: (n) => `Ihre Bestellung ${n} wurde erhalten.`,
      orderPaidTitle: 'Zahlung erhalten',
      orderPaidSubject: (n) => `Zahlung erhalten — ${n}`,
      orderPaidBody: (h) =>
        `Die Zahlung für ${h} wurde erhalten. Ihre Bestellung wird vorbereitet.`,
      orderPaidText: (n) => `Zahlung für ${n} erhalten.`,
      orderStatusTitle: 'Bestellaktualisierung',
      orderStatusSubject: (l, n) => `Bestellstatus: ${l} — ${n}`,
      orderStatusBody: (oh, lh) =>
        `Neuer Status für ${oh}: ${lh}.`,
      orderStatusText: (n, l) => `${n} Status: ${l}.`,
      returnRequestedTitle: 'Anfrage erhalten',
      returnRequestedSubject: (n) =>
        `Storno-/Rückgabeanfrage erhalten — ${n}`,
      returnRequestedBody: (h) =>
        `Ihre Storno-/Rückgabeanfrage für ${h} wurde erhalten. Wir melden uns nach Prüfung.`,
      returnRequestedText: (n) =>
        `Ihre Storno-/Rückgabeanfrage für ${n} wurde erhalten.`,
      returnReviewing: 'In Prüfung',
      returnApprovedTitle: 'Anfrage genehmigt',
      returnApprovedSubject: (n) =>
        `Storno-/Rückgabeanfrage genehmigt — ${n}`,
      returnApprovedBody: (h) =>
        `Ihre Anfrage für ${h} wurde genehmigt. Sie werden benachrichtigt, sobald die Erstattung abgeschlossen ist.`,
      returnApprovedText: (n) =>
        `Ihre Storno-/Rückgabeanfrage für ${n} wurde genehmigt.`,
      approved: 'Genehmigt',
      returnRejectedTitle: 'Anfrageergebnis',
      returnRejectedSubject: (n) => `Storno-/Rückgabeanfrage — ${n}`,
      returnRejectedBody: (h) =>
        `Ihre Anfrage für ${h} konnte derzeit nicht genehmigt werden. Bitte kontaktieren Sie uns.`,
      returnRejectedText: (n) =>
        `Ihre Storno-/Rückgabeanfrage für ${n} wurde nicht genehmigt.`,
      rejected: 'Abgelehnt',
      shipmentCreatedTitle: 'Versendet',
      shipmentCreatedSubject: (n) => `Versendet — ${n}`,
      shipmentCreatedBody: (h) => `${h} wurde versendet.`,
      shipmentCreatedText: (n, t) => `${n} wurde versendet. Sendung: ${t}`,
      shipmentStatusTitle: 'Sendungsaktualisierung',
      shipmentStatusSubject: (l, n) => `Sendungsaktualisierung: ${l} — ${n}`,
      shipmentStatusBody: (lh) =>
        `Ihr Sendungsstatus wurde aktualisiert: ${lh}.`,
      shipmentStatusText: (l, u) => `Sendungsstatus ${l}. Track: ${u}`,
      defaultNotifyTitle: 'Bestellbenachrichtigung',
      defaultNotifySubject: (b, n) => `${b} Benachrichtigung — ${n}`,
      defaultNotifyBody: (lh) =>
        `Es gibt ein Update zu Ihrer Bestellung: ${lh}.`,
      defaultNotifyText: (l) => `Bestellaktualisierung: ${l}.`,
      waOrderReceived: (name, orderNo, brand) =>
        `Hallo ${name},\n\nBestellung ${orderNo} wurde erhalten. Nach Zahlungseingang beginnen wir mit der Vorbereitung.\n\n${brand}`,
      waOrderPaid: (name, orderNo, brand) =>
        `Hallo ${name},\n\nZahlung für Bestellung ${orderNo} erhalten. Ihre Bestellung wird vorbereitet.\n\n${brand}`,
      waShipmentCreated: (name, orderNo, trackCode, trackUrl, brand) =>
        `Hallo ${name},\n\nBestellung ${orderNo} wurde versendet.${trackCode ? `\nSendungsnummer: ${trackCode}` : ''}\nTrack: ${trackUrl}\n\n${brand}`,
      waShipmentStatus: (name, label, trackCode, trackUrl, brand) =>
        `Hallo ${name},\n\nSendungsstatus: ${label}.${trackCode ? `\nSendungsnummer: ${trackCode}` : ''}\nTrack: ${trackUrl}\n\n${brand}`,
      waOrderStatus: (name, orderNo, label, brand) =>
        `Hallo ${name},\n\nNeuer Status für Bestellung ${orderNo}: ${label}.\n\n${brand}`,
      waDefault: (name, orderNo, label, brand) =>
        `Hallo ${name},\n\n${orderNo} — ${label}\n\n${brand}`,
      passwordResetSubject: 'Passwort zurücksetzen',
      passwordSetSubject: 'Passwort festlegen',
      passwordResetBody:
        'Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Der Link ist 1 Stunde gültig. Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.',
      passwordSetBody:
        'Sie können ein Passwort festlegen, um sich auch per E-Mail und Passwort anzumelden. Die Google-Anmeldung bleibt verfügbar. Der Link ist 1 Stunde gültig.',
      passwordResetCta: 'Passwort zurücksetzen',
      passwordSetCta: 'Passwort festlegen',
      passwordAppLink: (url) =>
        `Wenn Sie die App nutzen, öffnen Sie diesen Link: ${url}`,
      passwordResetText: (name, url, app) =>
        `Hallo ${name}, Passwort zurücksetzen: ${url}${app ? ` · App: ${app}` : ''} (1 Stunde gültig)`,
      passwordSetText: (name, url, app) =>
        `Hallo ${name}, Passwort festlegen: ${url}${app ? ` · App: ${app}` : ''} (1 Stunde gültig). Google-Anmeldung bleibt verfügbar.`,
      abandonedSubject1: 'Artikel in Ihrem Warenkorb warten',
      abandonedSubject2: 'Ihr Warenkorb wartet noch',
      abandonedTitle1: 'Warenkorb-Erinnerung',
      abandonedTitle2: 'Letzte Erinnerung',
      abandonedBody1: (c) =>
        `Sie haben noch ${c} Artikel im Warenkorb. Schließen Sie Ihre Bestellung ab, bevor das Angebot endet.`,
      abandonedBody2: (c) =>
        `${c} Artikel in Ihrem Warenkorb warten noch. Dies ist eine letzte Erinnerung.`,
      abandonedText: (name, count, url) =>
        `Hallo ${name}, Sie haben ${count} Artikel im Warenkorb: ${url}`,
      invoiceEarchive: 'Ihre e-Archiv-Rechnung',
      invoiceEinvoice: 'e-Rechnung',
      invoiceBody: (o, i) =>
        `Das Dokument ${i} zu Bestellung ${o} liegt im Anhang.`,
      invoiceContact:
        'Bei Fragen antworten Sie auf diese E-Mail oder kontaktieren Sie uns.',
      invoiceText: (name, orderNo, invNo, url) =>
        `Hallo ${name},\n\nRechnung ${invNo} zu Bestellung ${orderNo} im Anhang.\n\n${url}`,
      invoiceSubject: (doc, inv) => `${doc} — ${inv}`,
    };
  }

  if (locale === 'fr') {
    return {
      distributorTag: 'Distributeur indépendant',
      hello,
      helloName,
      order: 'Commande',
      status: 'Statut',
      subtotal: 'Sous-total',
      discount: 'Remise',
      shipping: 'Livraison',
      total: 'Total',
      products: 'Articles',
      orderContents: 'Contenu de la commande',
      noItems: 'Aucun article',
      customer: 'Client',
      shippingAddress: 'Adresse de livraison',
      billingAddress: 'Adresse de facturation',
      note: 'Note',
      taxId: 'N° fiscal',
      taxOffice: 'Bureau des impôts',
      trackingCode: 'N° de suivi',
      delivery: 'Livraison',
      document: 'Document',
      myOrders: 'Mes commandes',
      trackShipment: 'Suivre le colis',
      liveTracking: 'Suivi en direct',
      backToCart: 'Retour au panier',
      stock: 'Stock',
      sku: 'SKU',
      manageProducts: 'Gérer les produits',
      adminOrders: 'Commandes admin',
      orderReceivedTitle: 'Commande reçue',
      orderReceivedSubject: (n) => `Votre commande a été reçue — ${n}`,
      orderReceivedBody: (h) =>
        `${h} a été reçue. Nous commencerons la préparation une fois le paiement effectué.`,
      orderReceivedText: (n) => `Votre commande ${n} a été reçue.`,
      orderPaidTitle: 'Paiement reçu',
      orderPaidSubject: (n) => `Paiement reçu — ${n}`,
      orderPaidBody: (h) =>
        `Le paiement de ${h} a été reçu. Votre commande est en préparation.`,
      orderPaidText: (n) => `Paiement de ${n} reçu.`,
      orderStatusTitle: 'Mise à jour de commande',
      orderStatusSubject: (l, n) => `Statut de commande : ${l} — ${n}`,
      orderStatusBody: (oh, lh) =>
        `Nouveau statut pour ${oh} : ${lh}.`,
      orderStatusText: (n, l) => `${n} statut : ${l}.`,
      returnRequestedTitle: 'Demande reçue',
      returnRequestedSubject: (n) =>
        `Demande d'annulation / retour reçue — ${n}`,
      returnRequestedBody: (h) =>
        `Votre demande d'annulation/retour pour ${h} a été reçue. Nous vous informerons après examen.`,
      returnRequestedText: (n) =>
        `Votre demande d'annulation/retour pour ${n} a été reçue.`,
      returnReviewing: 'En cours d’examen',
      returnApprovedTitle: 'Demande approuvée',
      returnApprovedSubject: (n) =>
        `Demande d'annulation / retour approuvée — ${n}`,
      returnApprovedBody: (h) =>
        `Votre demande pour ${h} a été approuvée. Vous serez informé lorsque le remboursement sera terminé.`,
      returnApprovedText: (n) =>
        `Votre demande d'annulation/retour pour ${n} a été approuvée.`,
      approved: 'Approuvée',
      returnRejectedTitle: 'Résultat de la demande',
      returnRejectedSubject: (n) => `Demande d'annulation / retour — ${n}`,
      returnRejectedBody: (h) =>
        `Votre demande pour ${h} n'a pas pu être approuvée pour le moment. Contactez-nous pour plus de détails.`,
      returnRejectedText: (n) =>
        `Votre demande d'annulation/retour pour ${n} n'a pas été approuvée.`,
      rejected: 'Refusée',
      shipmentCreatedTitle: 'Expédiée',
      shipmentCreatedSubject: (n) => `Expédiée — ${n}`,
      shipmentCreatedBody: (h) => `${h} a été expédiée.`,
      shipmentCreatedText: (n, t) => `${n} a été expédiée. Suivi : ${t}`,
      shipmentStatusTitle: 'Mise à jour d’expédition',
      shipmentStatusSubject: (l, n) =>
        `Mise à jour d’expédition : ${l} — ${n}`,
      shipmentStatusBody: (lh) =>
        `Le statut de votre envoi a été mis à jour : ${lh}.`,
      shipmentStatusText: (l, u) => `Statut d’expédition ${l}. Suivi : ${u}`,
      defaultNotifyTitle: 'Notification de commande',
      defaultNotifySubject: (b, n) => `${b} notification — ${n}`,
      defaultNotifyBody: (lh) =>
        `Il y a une mise à jour concernant votre commande : ${lh}.`,
      defaultNotifyText: (l) => `Mise à jour de commande : ${l}.`,
      waOrderReceived: (name, orderNo, brand) =>
        `Bonjour ${name},\n\nLa commande ${orderNo} a été reçue. Nous commencerons la préparation une fois le paiement effectué.\n\n${brand}`,
      waOrderPaid: (name, orderNo, brand) =>
        `Bonjour ${name},\n\nPaiement reçu pour la commande ${orderNo}. Votre commande est en préparation.\n\n${brand}`,
      waShipmentCreated: (name, orderNo, trackCode, trackUrl, brand) =>
        `Bonjour ${name},\n\nLa commande ${orderNo} a été expédiée.${trackCode ? `\nN° de suivi : ${trackCode}` : ''}\nSuivi : ${trackUrl}\n\n${brand}`,
      waShipmentStatus: (name, label, trackCode, trackUrl, brand) =>
        `Bonjour ${name},\n\nStatut d’expédition : ${label}.${trackCode ? `\nN° de suivi : ${trackCode}` : ''}\nSuivi : ${trackUrl}\n\n${brand}`,
      waOrderStatus: (name, orderNo, label, brand) =>
        `Bonjour ${name},\n\nNouveau statut pour la commande ${orderNo} : ${label}.\n\n${brand}`,
      waDefault: (name, orderNo, label, brand) =>
        `Bonjour ${name},\n\n${orderNo} — ${label}\n\n${brand}`,
      passwordResetSubject: 'Réinitialisation du mot de passe',
      passwordSetSubject: 'Définir un mot de passe',
      passwordResetBody:
        'Nous avons reçu une demande de réinitialisation de mot de passe. Le lien est valable 1 heure. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.',
      passwordSetBody:
        'Vous pouvez définir un mot de passe pour vous connecter aussi par e-mail. La connexion Google reste disponible. Le lien est valable 1 heure.',
      passwordResetCta: 'Réinitialiser le mot de passe',
      passwordSetCta: 'Définir le mot de passe',
      passwordAppLink: (url) =>
        `Si vous utilisez l’application, ouvrez ce lien : ${url}`,
      passwordResetText: (name, url, app) =>
        `Bonjour ${name}, réinitialisez votre mot de passe : ${url}${app ? ` · app : ${app}` : ''} (valable 1 h)`,
      passwordSetText: (name, url, app) =>
        `Bonjour ${name}, définissez votre mot de passe : ${url}${app ? ` · app : ${app}` : ''} (valable 1 h). Connexion Google disponible.`,
      abandonedSubject1: 'Des articles vous attendent dans le panier',
      abandonedSubject2: 'Votre panier vous attend encore',
      abandonedTitle1: 'Rappel de panier',
      abandonedTitle2: 'Dernier rappel',
      abandonedBody1: (c) =>
        `Il reste ${c} article(s) dans votre panier. Finalisez votre commande avant la fin de l’offre.`,
      abandonedBody2: (c) =>
        `${c} article(s) vous attendent encore. Ceci est un dernier rappel pour finaliser votre commande.`,
      abandonedText: (name, count, url) =>
        `Bonjour ${name}, vous avez ${count} article(s) dans votre panier : ${url}`,
      invoiceEarchive: 'Votre facture e-Archive',
      invoiceEinvoice: 'e-Facture',
      invoiceBody: (o, i) =>
        `Le document ${i} pour la commande ${o} est en pièce jointe.`,
      invoiceContact:
        'Pour toute question, répondez à cet e-mail ou contactez-nous.',
      invoiceText: (name, orderNo, invNo, url) =>
        `Bonjour ${name},\n\nFacture ${invNo} pour la commande ${orderNo} en pièce jointe.\n\n${url}`,
      invoiceSubject: (doc, inv) => `${doc} — ${inv}`,
    };
  }

  if (locale === 'es') {
    return {
      distributorTag: 'Distribuidor independiente',
      hello,
      helloName,
      order: 'Pedido',
      status: 'Estado',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      shipping: 'Envío',
      total: 'Total',
      products: 'Artículos',
      orderContents: 'Contenido del pedido',
      noItems: 'Sin artículos',
      customer: 'Cliente',
      shippingAddress: 'Dirección de envío',
      billingAddress: 'Dirección de facturación',
      note: 'Nota',
      taxId: 'NIF/CIF',
      taxOffice: 'Oficina tributaria',
      trackingCode: 'Código de seguimiento',
      delivery: 'Entrega',
      document: 'Documento',
      myOrders: 'Mis pedidos',
      trackShipment: 'Seguir envío',
      liveTracking: 'Seguimiento en vivo',
      backToCart: 'Volver al carrito',
      stock: 'Stock',
      sku: 'SKU',
      manageProducts: 'Gestionar productos',
      adminOrders: 'Pedidos admin',
      orderReceivedTitle: 'Pedido recibido',
      orderReceivedSubject: (n) => `Tu pedido ha sido recibido — ${n}`,
      orderReceivedBody: (h) =>
        `${h} ha sido recibido. Empezaremos a prepararlo cuando se complete el pago.`,
      orderReceivedText: (n) => `Tu pedido ${n} ha sido recibido.`,
      orderPaidTitle: 'Pago recibido',
      orderPaidSubject: (n) => `Pago recibido — ${n}`,
      orderPaidBody: (h) =>
        `Se recibió el pago de ${h}. Tu pedido se está preparando.`,
      orderPaidText: (n) => `Pago de ${n} recibido.`,
      orderStatusTitle: 'Actualización del pedido',
      orderStatusSubject: (l, n) => `Estado del pedido: ${l} — ${n}`,
      orderStatusBody: (oh, lh) =>
        `El nuevo estado de ${oh} es: ${lh}.`,
      orderStatusText: (n, l) => `${n} estado: ${l}.`,
      returnRequestedTitle: 'Solicitud recibida',
      returnRequestedSubject: (n) =>
        `Solicitud de cancelación / devolución recibida — ${n}`,
      returnRequestedBody: (h) =>
        `Tu solicitud de cancelación/devolución de ${h} fue recibida. Te informaremos tras la revisión.`,
      returnRequestedText: (n) =>
        `Tu solicitud de cancelación/devolución de ${n} fue recibida.`,
      returnReviewing: 'En revisión',
      returnApprovedTitle: 'Solicitud aprobada',
      returnApprovedSubject: (n) =>
        `Solicitud de cancelación / devolución aprobada — ${n}`,
      returnApprovedBody: (h) =>
        `Tu solicitud de ${h} fue aprobada. Te avisaremos cuando se complete el reembolso.`,
      returnApprovedText: (n) =>
        `Tu solicitud de cancelación/devolución de ${n} fue aprobada.`,
      approved: 'Aprobada',
      returnRejectedTitle: 'Resultado de la solicitud',
      returnRejectedSubject: (n) =>
        `Solicitud de cancelación / devolución — ${n}`,
      returnRejectedBody: (h) =>
        `Tu solicitud de ${h} no pudo aprobarse por ahora. Contáctanos para más detalles.`,
      returnRejectedText: (n) =>
        `Tu solicitud de cancelación/devolución de ${n} no fue aprobada.`,
      rejected: 'Rechazada',
      shipmentCreatedTitle: 'Enviado',
      shipmentCreatedSubject: (n) => `Enviado — ${n}`,
      shipmentCreatedBody: (h) => `${h} ha sido enviado.`,
      shipmentCreatedText: (n, t) => `${n} ha sido enviado. Seguimiento: ${t}`,
      shipmentStatusTitle: 'Actualización de envío',
      shipmentStatusSubject: (l, n) => `Actualización de envío: ${l} — ${n}`,
      shipmentStatusBody: (lh) =>
        `El estado de tu envío se actualizó: ${lh}.`,
      shipmentStatusText: (l, u) => `Estado de envío ${l}. Seguimiento: ${u}`,
      defaultNotifyTitle: 'Aviso del pedido',
      defaultNotifySubject: (b, n) => `${b} aviso — ${n}`,
      defaultNotifyBody: (lh) =>
        `Hay una actualización de tu pedido: ${lh}.`,
      defaultNotifyText: (l) => `Actualización del pedido: ${l}.`,
      waOrderReceived: (name, orderNo, brand) =>
        `Hola ${name},\n\nEl pedido ${orderNo} ha sido recibido. Empezaremos a prepararlo cuando se complete el pago.\n\n${brand}`,
      waOrderPaid: (name, orderNo, brand) =>
        `Hola ${name},\n\nPago recibido del pedido ${orderNo}. Tu pedido se está preparando.\n\n${brand}`,
      waShipmentCreated: (name, orderNo, trackCode, trackUrl, brand) =>
        `Hola ${name},\n\nEl pedido ${orderNo} ha sido enviado.${trackCode ? `\nCódigo de seguimiento: ${trackCode}` : ''}\nSeguimiento: ${trackUrl}\n\n${brand}`,
      waShipmentStatus: (name, label, trackCode, trackUrl, brand) =>
        `Hola ${name},\n\nEstado del envío: ${label}.${trackCode ? `\nCódigo de seguimiento: ${trackCode}` : ''}\nSeguimiento: ${trackUrl}\n\n${brand}`,
      waOrderStatus: (name, orderNo, label, brand) =>
        `Hola ${name},\n\nNuevo estado del pedido ${orderNo}: ${label}.\n\n${brand}`,
      waDefault: (name, orderNo, label, brand) =>
        `Hola ${name},\n\n${orderNo} — ${label}\n\n${brand}`,
      passwordResetSubject: 'Restablecer contraseña',
      passwordSetSubject: 'Establecer contraseña',
      passwordResetBody:
        'Recibimos una solicitud para restablecer la contraseña. El enlace es válido 1 hora. Si no lo solicitaste, ignora este correo.',
      passwordSetBody:
        'Puedes establecer una contraseña para iniciar sesión también con email. Tu acceso con Google sigue disponible. El enlace es válido 1 hora.',
      passwordResetCta: 'Restablecer contraseña',
      passwordSetCta: 'Establecer contraseña',
      passwordAppLink: (url) =>
        `Si usas la app, abre este enlace: ${url}`,
      passwordResetText: (name, url, app) =>
        `Hola ${name}, restablece tu contraseña: ${url}${app ? ` · app: ${app}` : ''} (válido 1 h)`,
      passwordSetText: (name, url, app) =>
        `Hola ${name}, establece tu contraseña: ${url}${app ? ` · app: ${app}` : ''} (válido 1 h). Google sigue disponible.`,
      abandonedSubject1: 'Hay productos esperándote en el carrito',
      abandonedSubject2: 'Tu carrito sigue esperando',
      abandonedTitle1: 'Recordatorio del carrito',
      abandonedTitle2: 'Último recordatorio',
      abandonedBody1: (c) =>
        `Todavía tienes ${c} producto(s) en el carrito. Completa tu pedido antes de que termine la oferta.`,
      abandonedBody2: (c) =>
        `${c} producto(s) siguen en tu carrito. Este es un último recordatorio para completar el pedido.`,
      abandonedText: (name, count, url) =>
        `Hola ${name}, tienes ${count} producto(s) en el carrito: ${url}`,
      invoiceEarchive: 'Tu factura e-Archivo',
      invoiceEinvoice: 'e-Factura',
      invoiceBody: (o, i) =>
        `El documento ${i} del pedido ${o} está adjunto.`,
      invoiceContact:
        'Para cualquier duda, responde a este correo o contáctanos.',
      invoiceText: (name, orderNo, invNo, url) =>
        `Hola ${name},\n\nFactura ${invNo} del pedido ${orderNo} adjunta.\n\n${url}`,
      invoiceSubject: (doc, inv) => `${doc} — ${inv}`,
    };
  }

  // tr (default)
  return {
    distributorTag: 'Bağımsız Distribütör',
    hello,
    helloName,
    order: 'Sipariş',
    status: 'Durum',
    subtotal: 'Ara toplam',
    discount: 'İndirim',
    shipping: 'Kargo',
    total: 'Toplam',
    products: 'Ürünler',
    orderContents: 'Sipariş içeriği',
    noItems: 'Kalem yok',
    customer: 'Müşteri',
    shippingAddress: 'Teslimat adresi',
    billingAddress: 'Fatura adresi',
    note: 'Not',
    taxId: 'VKN',
    taxOffice: 'Vergi dairesi',
    trackingCode: 'Takip kodu',
    delivery: 'Teslimat',
    document: 'Belge',
    myOrders: 'Siparişlerim',
    trackShipment: 'Kargo takip',
    liveTracking: 'Canlı takip',
    backToCart: 'Sepete dön',
    stock: 'Stok',
    sku: 'SKU',
    manageProducts: 'Ürünleri yönet',
    adminOrders: 'Admin siparişler',
    orderReceivedTitle: 'Sipariş alındı',
    orderReceivedSubject: (n) => `Siparişiniz alındı — ${n}`,
    orderReceivedBody: (h) =>
      `${h} numaralı siparişiniz alındı. Ödeme tamamlandığında hazırlığa başlıyoruz.`,
    orderReceivedText: (n) => `${n} siparişiniz alındı.`,
    orderPaidTitle: 'Ödeme alındı',
    orderPaidSubject: (n) => `Ödemeniz alındı — ${n}`,
    orderPaidBody: (h) =>
      `${h} numaralı siparişinizin ödemesi alındı. Siparişiniz hazırlanmaya başlıyor.`,
    orderPaidText: (n) => `${n} ödemesi alındı.`,
    orderStatusTitle: 'Sipariş güncellemesi',
    orderStatusSubject: (l, n) => `Sipariş durumu: ${l} — ${n}`,
    orderStatusBody: (oh, lh) =>
      `${oh} siparişinizin yeni durumu: ${lh}.`,
    orderStatusText: (n, l) => `${n} durumu: ${l}.`,
    returnRequestedTitle: 'Talep alındı',
    returnRequestedSubject: (n) => `İade / iptal talebiniz alındı — ${n}`,
    returnRequestedBody: (h) =>
      `${h} için iptal/iade talebiniz alındı. İnceleme sonrası size bilgi vereceğiz.`,
    returnRequestedText: (n) => `${n} iptal/iade talebiniz alındı.`,
    returnReviewing: 'Talep incelemede',
    returnApprovedTitle: 'Talep onaylandı',
    returnApprovedSubject: (n) => `İade / iptal talebiniz onaylandı — ${n}`,
    returnApprovedBody: (h) =>
      `${h} için talebiniz onaylandı. Ödeme iadesi tamamlandığında bildirim alacaksınız.`,
    returnApprovedText: (n) => `${n} iptal/iade talebiniz onaylandı.`,
    approved: 'Onaylandı',
    returnRejectedTitle: 'Talep sonucu',
    returnRejectedSubject: (n) => `İade / iptal talebiniz — ${n}`,
    returnRejectedBody: (h) =>
      `${h} için talebiniz şu an onaylanamadı. Detay için bizimle iletişime geçebilirsiniz.`,
    returnRejectedText: (n) => `${n} iptal/iade talebiniz onaylanamadı.`,
    rejected: 'Reddedildi',
    shipmentCreatedTitle: 'Kargoya verildi',
    shipmentCreatedSubject: (n) => `Kargoya verildi — ${n}`,
    shipmentCreatedBody: (h) => `${h} siparişiniz kargoya verildi.`,
    shipmentCreatedText: (n, t) =>
      `${n} kargoya verildi. Takip: ${t}`,
    shipmentStatusTitle: 'Kargo güncellemesi',
    shipmentStatusSubject: (l, n) => `Kargo güncellemesi: ${l} — ${n}`,
    shipmentStatusBody: (lh) =>
      `Kargo durumunuz güncellendi: ${lh}.`,
    shipmentStatusText: (l, u) => `Kargo durumu ${l}. Takip: ${u}`,
    defaultNotifyTitle: 'Sipariş bildirimi',
    defaultNotifySubject: (b, n) => `${b} bildirimi — ${n}`,
    defaultNotifyBody: (lh) =>
      `Siparişiniz hakkında bir güncelleme var: ${lh}.`,
    defaultNotifyText: (l) => `Sipariş güncellemesi: ${l}.`,
    waOrderReceived: (name, orderNo, brand) =>
      `Merhaba ${name},\n\n${orderNo} numaralı siparişiniz alındı. Ödeme tamamlandığında hazırlığa başlıyoruz.\n\n${brand}`,
    waOrderPaid: (name, orderNo, brand) =>
      `Merhaba ${name},\n\n${orderNo} numaralı siparişinizin ödemesi alındı. Siparişiniz hazırlanmaya başlıyor.\n\n${brand}`,
    waShipmentCreated: (name, orderNo, trackCode, trackUrl, brand) =>
      `Merhaba ${name},\n\n${orderNo} siparişiniz kargoya verildi.${trackCode ? `\nTakip kodu: ${trackCode}` : ''}\nTakip: ${trackUrl}\n\n${brand}`,
    waShipmentStatus: (name, label, trackCode, trackUrl, brand) =>
      `Merhaba ${name},\n\nKargo durumu: ${label}.${trackCode ? `\nTakip kodu: ${trackCode}` : ''}\nTakip: ${trackUrl}\n\n${brand}`,
    waOrderStatus: (name, orderNo, label, brand) =>
      `Merhaba ${name},\n\n${orderNo} siparişinizin yeni durumu: ${label}.\n\n${brand}`,
    waDefault: (name, orderNo, label, brand) =>
      `Merhaba ${name},\n\n${orderNo} — ${label}\n\n${brand}`,
    passwordResetSubject: 'Şifre sıfırlama',
    passwordSetSubject: 'Şifre belirleme',
    passwordResetBody:
      'Hesabınız için şifre sıfırlama talebi aldık. Bağlantı 1 saat geçerlidir. Siz talep etmediyseniz bu e-postayı yok sayabilirsiniz.',
    passwordSetBody:
      'Hesabınıza e-posta ve şifre ile de giriş yapabilmeniz için bir şifre belirleyebilirsiniz. Google ile girişiniz açık kalır. Bağlantı 1 saat geçerlidir.',
    passwordResetCta: 'Şifreyi sıfırla',
    passwordSetCta: 'Şifre belirle',
    passwordAppLink: (url) =>
      `Uygulamayı kullanıyorsanız bu bağlantıyı açın: ${url}`,
    passwordResetText: (name, url, app) =>
      `Merhaba ${name}, şifrenizi sıfırlamak için: ${url}${app ? ` · uygulama: ${app}` : ''} (1 saat geçerli)`,
    passwordSetText: (name, url, app) =>
      `Merhaba ${name}, şifre belirlemek için: ${url}${app ? ` · uygulama: ${app}` : ''} (1 saat geçerli). Google ile girişiniz açık kalır.`,
    abandonedSubject1: 'Sepetinizde ürünler sizi bekliyor',
    abandonedSubject2: 'Sepetiniz hâlâ sizi bekliyor',
    abandonedTitle1: 'Sepet hatırlatması',
    abandonedTitle2: 'Son hatırlatma',
    abandonedBody1: (c) =>
      `Sepetinizde ${c} ürün kaldı. Siparişinizi tamamlayın — kampanya bitmeden.`,
    abandonedBody2: (c) =>
      `Sepetinizdeki ${c} ürün hâlâ sizi bekliyor. Siparişinizi tamamlamak için son bir hatırlatma.`,
    abandonedText: (name, count, url) =>
      `Merhaba ${name}, sepetinizde ${count} ürün var: ${url}`,
    invoiceEarchive: 'e-Arşiv faturanız',
    invoiceEinvoice: 'e-Fatura',
    invoiceBody: (o, i) =>
      `${o} numaralı siparişinize ait ${i} belgesi ekte yer almaktadır.`,
    invoiceContact:
      'Sorularınız için bu e-postaya yanıt verebilir veya bizimle iletişime geçebilirsiniz.',
    invoiceText: (name, orderNo, invNo, url) =>
      `Merhaba ${name},\n\n${orderNo} siparişinize ait ${invNo} faturanız ekte.\n\n${url}`,
    invoiceSubject: (doc, inv) => `${doc} — ${inv}`,
  };
}

const COPY_CACHE: Record<EmailLocale, EmailCopy> = {
  tr: buildCopy('tr'),
  en: buildCopy('en'),
  de: buildCopy('de'),
  fr: buildCopy('fr'),
  es: buildCopy('es'),
};

export function emailCopy(locale?: string | null): EmailCopy {
  return COPY_CACHE[resolveEmailLocale(locale)];
}
