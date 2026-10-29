import { LEGAL_SELLER } from '@database/legal-defaults';

export const LEGAL_LOCALES = ['tr', 'en', 'de', 'fr', 'es'] as const;
export type LegalLocale = (typeof LEGAL_LOCALES)[number];

type DocMeta = { title: string; content: string };
type LocalePack = Record<string, DocMeta>;

function fill(template: string): string {
  return template.replace(/\{\{seller\.(\w+)\}\}/g, (_m, key: string) => {
    const v = (LEGAL_SELLER as Record<string, string>)[key];
    return v != null ? String(v) : '';
  });
}

function pack(raw: LocalePack): LocalePack {
  const out: LocalePack = {};
  for (const [slug, meta] of Object.entries(raw)) {
    out[slug] = { title: fill(meta.title), content: fill(meta.content) };
  }
  return out;
}

const EN_RAW: LocalePack = {
  kvkk: {
    title: 'KVKK Privacy Notice',
    content: `{{seller.name}} processes personal data under Turkish Law No. 6698 (KVKK). Data is used for orders, delivery, support, payments, and legal duties.

Data controller: {{seller.name}}
Address: {{seller.address}}
Contact: {{seller.email}} · {{seller.phone}}

Your rights (KVKK Art. 11): access, correction, deletion, restriction, objection, complaint. Contact: {{seller.email}}.`,
  },
  'cerez-politikasi': {
    title: 'Cookie Policy',
    content: `This Cookie Policy explains how {{seller.name}} uses cookies on {{seller.website}}.

1. Cookies are small text files for sessions, carts, security, and performance.
2. Types: necessary, functional, analytics (with consent), payment/security (PayTR).
3. Manage cookies in your browser; blocking required cookies may break checkout.
4. Contact: {{seller.email}}`,
  },
  'mesafeli-satis': {
    title: 'Distance Sales Agreement',
    content: `Distance Sales Agreement under Turkish Consumer Law No. 6502.

Seller: {{seller.name}}
Address: {{seller.address}}
Phone: {{seller.phone}}
Email: {{seller.email}}
Web: {{seller.website}}
Tax: {{seller.taxOffice}} / {{seller.taxNumber}}
MERSİS: {{seller.mersis}}

Subject: sale and delivery of products ordered online.
Payment: PayTR; card data is not stored on our servers.
Withdrawal: 14 days from delivery (exceptions under the Regulation).`,
  },
  'on-bilgilendirme': {
    title: 'Pre-contract Information Form',
    content: `Pre-contract information under Law No. 6502.

SELLER
{{seller.name}}
{{seller.address}}
{{seller.phone}} · {{seller.email}}

TOTAL PRICE shown before payment.
PAYMENT via PayTR.
WITHDRAWAL: 14 days from delivery.
COMPLAINTS: {{seller.email}} · {{seller.phone}}.`,
  },
  'iptal-iade': {
    title: 'Cancellation & Returns Policy',
    content: `{{seller.name}} follows Turkish consumer law.

1. Cancel before shipment via {{seller.email}}.
2. Withdrawal: 14 days from delivery.
3. Non-returnable: opened food/supplements, personalized or damaged goods (except defects).
4. Return address: {{seller.address}}
5. Refunds within 14 days after inspection.
6. Contact: {{seller.email}} · {{seller.phone}}`,
  },
  teslimat: {
    title: 'Delivery & Shipping Terms',
    content: `{{seller.name}} ships paid orders usually within 1–3 business days.

Delivery to the checkout address via carrier. Shipping fees shown at payment; free shipping may apply above threshold.

Damaged packages: note with courier and contact {{seller.email}} · {{seller.phone}} within 48 hours.

Return address: {{seller.address}}
Hours: {{seller.hours}}`,
  },
  'musteri-memnuniyeti': {
    title: 'Customer Satisfaction Policy',
    content: `{{seller.name}} commits to quality and fast support.

Email: {{seller.email}}
Phone: {{seller.phone}}
Hours: {{seller.hours}}

Complaints: include order number; first reply within 3 business days.`,
  },
  'guvenli-alisveris': {
    title: 'Secure Shopping',
    content: `Shopping at {{seller.name}} is protected technically and legally.

1. PayTR payments — card data not stored on our servers; SSL/TLS; 3D Secure.
2. Personal data processed under KVKK.
3. Security concerns: {{seller.email}}`,
  },
  'aydinlatma-metni': {
    title: 'Privacy Notice (KVKK Art. 10)',
    content: `Under KVKK Art. 10, {{seller.name}} informs you about personal data processing.

Controller: {{seller.name}}
{{seller.address}}
{{seller.email}} · {{seller.phone}}

Rights (Art. 11): access, rectification, erasure, restriction, objection. Apply: {{seller.email}}`,
  },
  gizlilik: {
    title: 'Privacy Policy',
    content: `{{seller.name}} respects your privacy.

We share data only with partners needed to fulfil the service (PayTR, carriers) and authorities when required. We do not sell your data.

Contact: {{seller.email}} · {{seller.phone}}
{{seller.address}}`,
  },
};

const DE_RAW: LocalePack = {
  kvkk: {
    title: 'KVKK Datenschutzerklärung',
    content: `{{seller.name}} verarbeitet personenbezogene Daten gemäß dem türkischen Gesetz Nr. 6698 (KVKK).

Datenverantwortlicher: {{seller.name}}
Adresse: {{seller.address}}
Kontakt: {{seller.email}} · {{seller.phone}}

Ihre Rechte (KVKK Art. 11): Zugriff, Berichtigung, Löschung, Einschränkung, Einspruch. Anfragen: {{seller.email}}.`,
  },
  'cerez-politikasi': {
    title: 'Cookie-Richtlinie',
    content: `Diese Cookie-Richtlinie erläutert, wie {{seller.name}} Cookies auf {{seller.website}} verwendet.

1. Cookies sind kleine Textdateien für Sitzung, Warenkorb, Sicherheit und Leistung.
2. Typen: erforderlich, funktional, Analyse (mit Einwilligung), Zahlung/Sicherheit (PayTR).
3. Verwaltung in den Browsereinstellungen.
4. Kontakt: {{seller.email}}`,
  },
  'mesafeli-satis': {
    title: 'Fernabsatzvertrag',
    content: `Fernabsatzvertrag gemäß türkischem Verbraucherschutzgesetz Nr. 6502.

Verkäufer: {{seller.name}}
Adresse: {{seller.address}}
Telefon: {{seller.phone}}
E-Mail: {{seller.email}}
Web: {{seller.website}}
Steuer: {{seller.taxOffice}} / {{seller.taxNumber}}
MERSİS: {{seller.mersis}}

Zahlung über PayTR. Widerruf: 14 Tage ab Lieferung.`,
  },
  'on-bilgilendirme': {
    title: 'Informationsformular vor Vertragsabschluss',
    content: `Informationen vor der Bestellung gemäß Gesetz Nr. 6502.

VERKÄUFER
{{seller.name}}
{{seller.address}}
{{seller.phone}} · {{seller.email}}

Gesamtpreis vor Zahlung. Zahlung über PayTR. Widerruf: 14 Tage.
Beschwerden: {{seller.email}} · {{seller.phone}}.`,
  },
  'iptal-iade': {
    title: 'Stornierungs- und Rückgabebedingungen',
    content: `{{seller.name}} folgt dem türkischen Verbraucherrecht.

1. Stornierung vor Versand: {{seller.email}}
2. Widerruf: 14 Tage ab Lieferung
3. Ausgeschlossen: geöffnete Lebensmittel/Nahrungsergänzungsmittel, personalisierte oder beschädigte Waren
4. Rücksendeadresse: {{seller.address}}
5. Erstattung innerhalb von 14 Tagen nach Prüfung
6. Kontakt: {{seller.email}} · {{seller.phone}}`,
  },
  teslimat: {
    title: 'Liefer- und Versandbedingungen',
    content: `{{seller.name}} übergibt bezahlte Bestellungen in der Regel innerhalb von 1–3 Werktagen an den Versand.

Lieferung an die Checkout-Adresse. Versandkosten und ggf. kostenloser Versand ab Schwellenwert an der Kasse.

Beschädigte Pakete: beim Kurier vermerken und innerhalb von 48 Stunden {{seller.email}} · {{seller.phone}} kontaktieren.

Rücksendeadresse: {{seller.address}}
Öffnungszeiten: {{seller.hours}}`,
  },
  'musteri-memnuniyeti': {
    title: 'Richtlinie zur Kundenzufriedenheit',
    content: `{{seller.name}} steht für Qualität und schnellen Support.

E-Mail: {{seller.email}}
Telefon: {{seller.phone}}
Öffnungszeiten: {{seller.hours}}

Reklamationen mit Bestellnummer; Antwort innerhalb von 3 Werktagen.`,
  },
  'guvenli-alisveris': {
    title: 'Sicheres Einkaufen',
    content: `Einkaufen bei {{seller.name}} ist technisch und rechtlich geschützt.

1. PayTR — Kartendaten nicht auf unseren Servern; SSL/TLS; 3D Secure
2. Personenbezogene Daten unter KVKK
3. Sicherheitsfragen: {{seller.email}}`,
  },
  'aydinlatma-metni': {
    title: 'Datenschutzerklärung (KVKK Art. 10)',
    content: `Gemäß KVKK Art. 10 informiert {{seller.name}} über die Datenverarbeitung.

Verantwortlicher: {{seller.name}}
{{seller.address}}
{{seller.email}} · {{seller.phone}}

Rechte (Art. 11): Zugriff, Berichtigung, Löschung. Anfragen: {{seller.email}}`,
  },
  gizlilik: {
    title: 'Datenschutzrichtlinie',
    content: `{{seller.name}} respektiert Ihre Privatsphäre.

Daten werden nur mit erforderlichen Partnern (PayTR, Spediteure) und Behörden geteilt. Kein Verkauf von Daten.

Kontakt: {{seller.email}} · {{seller.phone}}
{{seller.address}}`,
  },
};

const FR_RAW: LocalePack = {
  kvkk: {
    title: 'KVKK Avis de confidentialité',
    content: `{{seller.name}} traite les données personnelles selon la loi turque n° 6698 (KVKK).

Responsable : {{seller.name}}
Adresse : {{seller.address}}
Contact : {{seller.email}} · {{seller.phone}}

Vos droits (art. 11) : accès, rectification, suppression, opposition. Demandes : {{seller.email}}.`,
  },
  'cerez-politikasi': {
    title: 'Politique en matière de cookies',
    content: `Cette politique explique comment {{seller.name}} utilise les cookies sur {{seller.website}}.

1. Les cookies maintiennent session, panier, sécurité et mesure de performance.
2. Types : nécessaires, fonctionnels, analytiques (avec consentement), paiement/sécurité (PayTR).
3. Gestion dans les paramètres du navigateur.
4. Contact : {{seller.email}}`,
  },
  'mesafeli-satis': {
    title: 'Contrat de vente à distance',
    content: `Contrat de vente à distance selon la loi turque n° 6502.

Vendeur : {{seller.name}}
Adresse : {{seller.address}}
Téléphone : {{seller.phone}}
E-mail : {{seller.email}}
Web : {{seller.website}}
Fiscal : {{seller.taxOffice}} / {{seller.taxNumber}}
MERSİS : {{seller.mersis}}

Paiement via PayTR. Rétractation : 14 jours après livraison.`,
  },
  'on-bilgilendirme': {
    title: "Formulaire d'informations pré-contrat",
    content: `Informations avant commande selon la loi n° 6502.

VENDEUR
{{seller.name}}
{{seller.address}}
{{seller.phone}} · {{seller.email}}

Prix total avant paiement. Paiement PayTR. Rétractation : 14 jours.
Réclamations : {{seller.email}} · {{seller.phone}}.`,
  },
  'iptal-iade': {
    title: "Politique d'annulation et de retour",
    content: `{{seller.name}} respecte le droit de la consommation turc.

1. Annulation avant expédition : {{seller.email}}
2. Rétractation : 14 jours après livraison
3. Non retournables : denrées/compléments ouverts, biens personnalisés ou endommagés
4. Adresse de retour : {{seller.address}}
5. Remboursement sous 14 jours après contrôle
6. Contact : {{seller.email}} · {{seller.phone}}`,
  },
  teslimat: {
    title: 'Conditions de livraison',
    content: `{{seller.name}} confie les commandes payées au transporteur sous 1–3 jours ouvrés en général.

Livraison à l'adresse du checkout. Frais et seuil de livraison gratuite à l'étape de paiement.

Colis endommagé : constater avec le coursier et contacter {{seller.email}} · {{seller.phone}} sous 48 h.

Adresse de retour : {{seller.address}}
Horaires : {{seller.hours}}`,
  },
  'musteri-memnuniyeti': {
    title: 'Politique de satisfaction client',
    content: `{{seller.name}} s'engage sur la qualité et un support rapide.

E-mail : {{seller.email}}
Téléphone : {{seller.phone}}
Horaires : {{seller.hours}}

Réclamations avec n° de commande ; réponse sous 3 jours ouvrés.`,
  },
  'guvenli-alisveris': {
    title: 'Achats sécurisés',
    content: `Les achats chez {{seller.name}} sont protégés.

1. PayTR — données carte non stockées ; SSL/TLS ; 3D Secure
2. Données personnelles sous KVKK
3. Sécurité : {{seller.email}}`,
  },
  'aydinlatma-metni': {
    title: 'Avis de confidentialité (KVKK Art. 10)',
    content: `Selon KVKK art. 10, {{seller.name}} vous informe sur le traitement des données.

Responsable : {{seller.name}}
{{seller.address}}
{{seller.email}} · {{seller.phone}}

Droits (art. 11) : accès, rectification, effacement. Demandes : {{seller.email}}`,
  },
  gizlilik: {
    title: 'Politique de confidentialité',
    content: `{{seller.name}} respecte votre vie privée.

Partage uniquement avec les partenaires nécessaires (PayTR, transporteurs) et autorités. Pas de vente de données.

Contact : {{seller.email}} · {{seller.phone}}
{{seller.address}}`,
  },
};

const ES_RAW: LocalePack = {
  kvkk: {
    title: 'KVKK Aviso de Privacidad',
    content: `{{seller.name}} trata datos personales según la Ley turca N° 6698 (KVKK).

Responsable: {{seller.name}}
Dirección: {{seller.address}}
Contacto: {{seller.email}} · {{seller.phone}}

Sus derechos (art. 11): acceso, rectificación, supresión, oposición. Solicitudes: {{seller.email}}.`,
  },
  'cerez-politikasi': {
    title: 'Política de cookies',
    content: `Esta política explica cómo {{seller.name}} usa cookies en {{seller.website}}.

1. Las cookies mantienen sesión, carrito, seguridad y rendimiento.
2. Tipos: necesarias, funcionales, analíticas (con consentimiento), pago/seguridad (PayTR).
3. Gestión en el navegador.
4. Contacto: {{seller.email}}`,
  },
  'mesafeli-satis': {
    title: 'Acuerdo de venta a distancia',
    content: `Acuerdo de venta a distancia según la Ley turca N° 6502.

Vendedor: {{seller.name}}
Dirección: {{seller.address}}
Teléfono: {{seller.phone}}
Correo: {{seller.email}}
Web: {{seller.website}}
Fiscal: {{seller.taxOffice}} / {{seller.taxNumber}}
MERSİS: {{seller.mersis}}

Pago vía PayTR. Desistimiento: 14 días desde la entrega.`,
  },
  'on-bilgilendirme': {
    title: 'Formulario de información previa al contrato',
    content: `Información previa al pedido según la Ley N° 6502.

VENDEDOR
{{seller.name}}
{{seller.address}}
{{seller.phone}} · {{seller.email}}

Precio total antes del pago. Pago PayTR. Desistimiento: 14 días.
Quejas: {{seller.email}} · {{seller.phone}}.`,
  },
  'iptal-iade': {
    title: 'Política de cancelación y devoluciones',
    content: `{{seller.name}} sigue la ley turca del consumidor.

1. Cancelar antes del envío: {{seller.email}}
2. Desistimiento: 14 días desde la entrega
3. No retornables: alimentos/suplementos abiertos, productos personalizados o dañados
4. Dirección de devolución: {{seller.address}}
5. Reembolso en 14 días tras inspección
6. Contacto: {{seller.email}} · {{seller.phone}}`,
  },
  teslimat: {
    title: 'Condiciones de entrega y envío',
    content: `{{seller.name}} entrega los pedidos pagados al transportista en 1–3 días laborables en general.

Envío a la dirección del checkout. Gastos y umbral de envío gratis en el pago.

Paquete dañado: anótelo con el repartidor y contacte {{seller.email}} · {{seller.phone}} en 48 h.

Dirección de devolución: {{seller.address}}
Horario: {{seller.hours}}`,
  },
  'musteri-memnuniyeti': {
    title: 'Política de satisfacción del cliente',
    content: `{{seller.name}} se compromete con calidad y soporte rápido.

Correo: {{seller.email}}
Teléfono: {{seller.phone}}
Horario: {{seller.hours}}

Quejas con número de pedido; respuesta en 3 días hábiles.`,
  },
  'guvenli-alisveris': {
    title: 'Compras Seguras',
    content: `Las compras en {{seller.name}} están protegidas.

1. PayTR — datos de tarjeta no almacenados; SSL/TLS; 3D Secure
2. Datos personales bajo KVKK
3. Seguridad: {{seller.email}}`,
  },
  'aydinlatma-metni': {
    title: 'Aviso de Privacidad (KVKK Art. 10)',
    content: `Según KVKK art. 10, {{seller.name}} informa sobre el tratamiento de datos.

Responsable: {{seller.name}}
{{seller.address}}
{{seller.email}} · {{seller.phone}}

Derechos (art. 11): acceso, rectificación, supresión. Solicitar: {{seller.email}}`,
  },
  gizlilik: {
    title: 'Política de privacidad',
    content: `{{seller.name}} respeta su privacidad.

Solo compartimos con socios necesarios (PayTR, transportistas) y autoridades. No vendemos sus datos.

Contacto: {{seller.email}} · {{seller.phone}}
{{seller.address}}`,
  },
};

const PACKS: Record<Exclude<LegalLocale, 'tr'>, LocalePack> = {
  en: pack(EN_RAW),
  de: pack(DE_RAW),
  fr: pack(FR_RAW),
  es: pack(ES_RAW),
};

/** TR dışı diller için varsayılan çeviriler. */
export function getLegalDefaultsForLocale(
  localeRaw: string,
): LocalePack | null {
  const locale = String(localeRaw || 'tr')
    .trim()
    .toLowerCase()
    .split(/[-_]/)[0] as LegalLocale;
  if (locale === 'tr' || !LEGAL_LOCALES.includes(locale)) return null;
  return PACKS[locale as Exclude<LegalLocale, 'tr'>] ?? null;
}
