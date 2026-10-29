import type { LocaleCode } from '@common/catalog/localization.types';
import { MANDATORY_LOCALES } from '@common/catalog/localization.types';

type LocaleBlock = Record<string, unknown>;

const NAV_LABELS: Partial<
  Record<LocaleCode, Record<string, string>>
> = {
  tr: {},
  en: {
    '/urunler': 'Products',
    '/hakkimizda': 'About',
    '/kocluk': 'Coaching',
    '/blog': 'Blog',
    '/medya': 'Media',
    '/sss': 'FAQ',
    '/yorum': 'Reviews',
    '/iletisim': 'Contact',
    '/urunler/kategori/avantajli-setler': 'Value Bundles',
    '/siparis-sorgula': 'Track order',
    '/odeme-bildirimi': 'Payment notice',
    '/banka-hesaplari': 'Bank accounts',
    '/takip': 'Shipping tracking',
    '/hesabim': 'Account',
    '/hesabim/favoriler': 'Favorites',
    '/hesabim/takip': 'Nutrition tracking',
    '/hesabim/rapor': 'Progress report',
    '/sepet': 'Cart',
    '/kvkk': 'Privacy (KVKK)',
    '/gizlilik': 'Privacy policy',
    '/cerez-politikasi': 'Cookie policy',
    '/mesafeli-satis': 'Distance sales',
    '/on-bilgilendirme': 'Pre-contract info',
    '/iptal-iade': 'Returns policy',
    '/musteri-memnuniyeti': 'Customer satisfaction',
    '/guvenli-alisveris': 'Secure shopping',
    '/aydinlatma-metni': 'Privacy notice',
  },
  de: {
    '/urunler': 'Produkte',
    '/hakkimizda': 'Über uns',
    '/kocluk': 'Coaching',
    '/blog': 'Blog',
    '/medya': 'Medien',
    '/sss': 'FAQ',
    '/yorum': 'Bewertungen',
    '/iletisim': 'Kontakt',
    '/urunler/kategori/avantajli-setler': 'Vorteilspakete',
    '/siparis-sorgula': 'Bestellung verfolgen',
    '/odeme-bildirimi': 'Zahlungsmitteilung',
    '/banka-hesaplari': 'Bankkonten',
    '/takip': 'Sendungsverfolgung',
    '/hesabim': 'Konto',
    '/hesabim/favoriler': 'Favoriten',
    '/hesabim/takip': 'Ernährungstracking',
    '/hesabim/rapor': 'Fortschrittsbericht',
    '/sepet': 'Warenkorb',
    '/kvkk': 'Datenschutz (KVKK)',
    '/gizlilik': 'Datenschutz',
    '/cerez-politikasi': 'Cookie-Richtlinie',
    '/mesafeli-satis': 'Fernabsatz',
    '/on-bilgilendirme': 'Vorabinformation',
    '/iptal-iade': 'Rückgabe',
    '/musteri-memnuniyeti': 'Kundenzufriedenheit',
    '/guvenli-alisveris': 'Sicher einkaufen',
    '/aydinlatma-metni': 'Datenschutzhinweis',
  },
  fr: {
    '/urunler': 'Produits',
    '/hakkimizda': 'À propos',
    '/kocluk': 'Coaching',
    '/blog': 'Blog',
    '/medya': 'Médias',
    '/sss': 'FAQ',
    '/yorum': 'Avis',
    '/iletisim': 'Contact',
    '/urunler/kategori/avantajli-setler': 'Offres groupées',
    '/siparis-sorgula': 'Suivi de commande',
    '/odeme-bildirimi': 'Avis de paiement',
    '/banka-hesaplari': 'Comptes bancaires',
    '/takip': 'Suivi colis',
    '/hesabim': 'Compte',
    '/hesabim/favoriler': 'Favoris',
    '/hesabim/takip': 'Suivi nutrition',
    '/hesabim/rapor': 'Rapport de progrès',
    '/sepet': 'Panier',
    '/kvkk': 'Confidentialité (KVKK)',
    '/gizlilik': 'Politique de confidentialité',
    '/cerez-politikasi': 'Politique cookies',
    '/mesafeli-satis': 'Vente à distance',
    '/on-bilgilendirme': 'Informations précontractuelles',
    '/iptal-iade': 'Retours',
    '/musteri-memnuniyeti': 'Satisfaction client',
    '/guvenli-alisveris': 'Achats sécurisés',
    '/aydinlatma-metni': 'Notice d’information',
  },
  es: {
    '/urunler': 'Productos',
    '/hakkimizda': 'Sobre nosotros',
    '/kocluk': 'Coaching',
    '/blog': 'Blog',
    '/medya': 'Medios',
    '/sss': 'FAQ',
    '/yorum': 'Reseñas',
    '/iletisim': 'Contacto',
    '/urunler/kategori/avantajli-setler': 'Packs ventajosos',
    '/siparis-sorgula': 'Seguimiento de pedido',
    '/odeme-bildirimi': 'Aviso de pago',
    '/banka-hesaplari': 'Cuentas bancarias',
    '/takip': 'Seguimiento de envío',
    '/hesabim': 'Cuenta',
    '/hesabim/favoriler': 'Favoritos',
    '/hesabim/takip': 'Seguimiento nutricional',
    '/hesabim/rapor': 'Informe de progreso',
    '/sepet': 'Carrito',
    '/kvkk': 'Privacidad (KVKK)',
    '/gizlilik': 'Política de privacidad',
    '/cerez-politikasi': 'Política de cookies',
    '/mesafeli-satis': 'Venta a distancia',
    '/on-bilgilendirme': 'Información previa',
    '/iptal-iade': 'Devoluciones',
    '/musteri-memnuniyeti': 'Satisfacción del cliente',
    '/guvenli-alisveris': 'Compra segura',
    '/aydinlatma-metni': 'Aviso de privacidad',
  },
};

function translateNav(
  links: { href: string; label: string }[] | undefined,
  locale: LocaleCode,
): { href: string; label: string }[] | undefined {
  if (!links?.length || locale === 'tr') return undefined;
  const map = NAV_LABELS[locale] || {};
  return links.map((link) => ({
    href: link.href,
    label: map[link.href] || link.label,
  }));
}

export function buildNavigationTranslations(nav: {
  header?: { href: string; label: string }[];
  footerNav?: { href: string; label: string }[];
  footerLegal?: { href: string; label: string }[];
}): Partial<Record<LocaleCode, LocaleBlock>> {
  const out: Partial<Record<LocaleCode, LocaleBlock>> = {};
  for (const loc of MANDATORY_LOCALES) {
    const header = translateNav(nav.header, loc);
    const footerNav = translateNav(nav.footerNav, loc);
    const footerLegal = translateNav(nav.footerLegal, loc);
    if (header || footerNav || footerLegal) {
      out[loc] = {
        ...(header ? { header } : {}),
        ...(footerNav ? { footerNav } : {}),
        ...(footerLegal ? { footerLegal } : {}),
      };
    }
  }
  return out;
}

export const CMS_SETTING_LOCALE_BLOCKS: Partial<
  Record<
    string,
    Partial<Record<LocaleCode, LocaleBlock>>
  >
> = {
  welcomePopup: {
    en: {
      distributorName: 'Büşra Özberk',
      headline:
        'This website is operated by an Independent Herbalife Nutrition Distributor: Büşra Özberk',
      leftTitle: 'EXISTING CUSTOMER?',
      leftBody:
        'A one-to-one relationship with your Personal Distributor is essential to reaching your nutrition goals. If Büşra Özberk is not your current distributor, we recommend purchasing your products from your current distributor. To find your current Distributor,',
      leftLinkLabel: 'click here.',
      leftLinkUrl: 'https://www.herbalife.com/en-gb/',
      rightTitle:
        'ARE YOU ALREADY A HERBALIFE NUTRITION DISTRIBUTOR OR PREFERRED CUSTOMER?',
      rightBody:
        'If you already have your own Distributor account, please place orders and enjoy full benefits at',
      rightLinkLabel: 'myherbalife.com',
      rightLinkUrl: 'https://www.myherbalife.com',
      closeLabel: 'Close',
    },
    de: {
      distributorName: 'Büşra Özberk',
      headline:
        'Diese Website wird von einem unabhängigen Herbalife Nutrition Distributor betrieben: Büşra Özberk',
      leftTitle: 'BESTEHENDER KUNDE?',
      leftBody:
        'Eine persönliche Beziehung zu Ihrem Distributor ist entscheidend, um Ihre Ernährungsziele zu erreichen. Wenn Büşra Özberk nicht Ihr aktueller Distributor ist, empfehlen wir, Ihre Produkte bei Ihrem aktuellen Distributor zu kaufen. Um Ihren aktuellen Distributor zu finden,',
      leftLinkLabel: 'klicken Sie hier.',
      leftLinkUrl: 'https://www.herbalife.com/de-de/',
      rightTitle:
        'SIND SIE BEREITS HERBALIFE NUTRITION DISTRIBUTOR ODER PREFERRED CUSTOMER?',
      rightBody:
        'Wenn Sie bereits ein eigenes Distributor-Konto haben, bestellen Sie bitte und nutzen Sie alle Vorteile unter',
      rightLinkLabel: 'myherbalife.com',
      rightLinkUrl: 'https://www.myherbalife.com',
      closeLabel: 'Schließen',
    },
    fr: {
      distributorName: 'Büşra Özberk',
      headline:
        'Ce site est géré par un Distributeur indépendant Herbalife Nutrition : Büşra Özberk',
      leftTitle: 'CLIENT EXISTANT ?',
      leftBody:
        'La relation individuelle avec votre Distributeur personnel est essentielle pour atteindre vos objectifs nutritionnels. Si Büşra Özberk n’est pas votre distributeur actuel, nous vous recommandons d’acheter vos produits auprès de votre distributeur actuel. Pour trouver votre Distributeur actuel,',
      leftLinkLabel: 'cliquez ici.',
      leftLinkUrl: 'https://www.herbalife.com/fr-fr/',
      rightTitle:
        'ÊTES-VOUS DÉJÀ DISTRIBUTEUR HERBALIFE NUTRITION OU CLIENT PRIVILÉGIÉ ?',
      rightBody:
        'Si vous avez déjà votre propre compte Distributeur, veuillez passer commande et bénéficier de tous vos droits sur',
      rightLinkLabel: 'myherbalife.com',
      rightLinkUrl: 'https://www.myherbalife.com',
      closeLabel: 'Fermer',
    },
    es: {
      distributorName: 'Büşra Özberk',
      headline:
        'Este sitio web es administrado por un Distribuidor Independiente de Herbalife Nutrition: Büşra Özberk',
      leftTitle: '¿CLIENTE ACTUAL?',
      leftBody:
        'La relación personal con su Distribuidor es fundamental para alcanzar sus objetivos de nutrición. Si Büşra Özberk no es su distribuidor actual, le recomendamos comprar sus productos a su distribuidor actual. Para encontrar a su Distribuidor actual,',
      leftLinkLabel: 'haga clic aquí.',
      leftLinkUrl: 'https://www.herbalife.com/es-es/',
      rightTitle:
        '¿YA ES DISTRIBUIDOR DE HERBALIFE NUTRITION O CLIENTE PREFERENTE?',
      rightBody:
        'Si ya tiene su propia cuenta de Distribuidor, realice sus pedidos y disfrute de todos los beneficios en',
      rightLinkLabel: 'myherbalife.com',
      rightLinkUrl: 'https://www.myherbalife.com',
      closeLabel: 'Cerrar',
    },
  },
  brand: {
    en: {
      slogan: 'A healthier, happier life',
      tagline:
        'Original Herbal Kapıda products and personalized nutrition support with independent distributor guidance.',
      established: 'Since 2024',
      location: 'Türkiye',
      distributorTitle: 'Independent Distributor',
      legalDisclaimer:
        'This site is operated under the Herbal Kapıda brand by an independent Herbalife distributor. It is not the official Herbalife website. Products sold are original Herbalife products.',
    },
    de: {
      slogan: 'Ein gesünderes, glücklicheres Leben',
      tagline:
        'Original Herbal Kapıda-Produkte und personalisierte Ernährungsberatung durch einen unabhängigen Distributor.',
      established: 'Seit 2024',
      location: 'Türkei',
      distributorTitle: 'Unabhängiger Distributor',
      legalDisclaimer:
        'Diese Website wird unter der Marke Herbal Kapıda von einem unabhängigen Herbalife-Vertriebspartner betrieben. Es ist nicht die offizielle Herbalife-Website. Verkaufte Produkte sind original Herbalife-Produkte.',
    },
    fr: {
      slogan: 'Une vie plus saine, plus heureuse',
      tagline:
        'Produits Herbal Kapıda originaux et accompagnement nutritionnel personnalisé avec un distributeur indépendant.',
      established: 'Depuis 2024',
      location: 'Turquie',
      distributorTitle: 'Distributeur indépendant',
      legalDisclaimer:
        'Ce site est exploité sous la marque Herbal Kapıda par un distributeur indépendant Herbalife. Ce n’est pas le site officiel Herbalife. Les produits vendus sont des produits Herbalife d’origine.',
    },
    es: {
      slogan: 'Una vida más sana y feliz',
      tagline:
        'Productos Herbal Kapıda originales y apoyo nutricional personalizado con un distribuidor independiente.',
      established: 'Desde 2024',
      location: 'Turquía',
      distributorTitle: 'Distribuidor independiente',
      legalDisclaimer:
        'Este sitio opera bajo la marca Herbal Kapıda como distribuidor independiente de Herbalife. No es el sitio oficial de Herbalife. Los productos vendidos son Herbalife originales.',
    },
  },
  seo: {
    en: {
      title: 'Herbal Kapıda | Original Herbal Kapıda Products',
      description:
        'Original Herbal Kapıda products, value bundles, and personalized nutrition coaching. Independent distributor Herbal Kapıda — herbalkapida.com.',
      keywords: [
        'Herbal Kapıda',
        'Herbal Kapıda',
        'Formula 1',
        'weight management',
        'protein shake',
        'value bundles',
        'nutrition',
      ],
    },
    de: {
      title: 'Herbal Kapıda | Original Herbal Kapıda Produkte',
      description:
        'Original Herbal Kapıda Produkte, Vorteilspakete und personalisierte Ernährungsberatung. Unabhängiger Distributor Herbal Kapıda.',
      keywords: [
        'Herbal Kapıda',
        'Herbal Kapıda',
        'Formula 1',
        'Gewichtsmanagement',
        'Protein-Shake',
        'Pakete',
        'Ernährung',
      ],
    },
    fr: {
      title: 'Herbal Kapıda | Produits Herbal Kapıda originaux',
      description:
        'Produits Herbal Kapıda originaux, offres groupées et coaching nutritionnel personnalisé. Distributeur indépendant Herbal Kapıda.',
      keywords: [
        'Herbal Kapıda',
        'Herbal Kapıda',
        'Formula 1',
        'contrôle du poids',
        'shake protéiné',
        'offres',
        'nutrition',
      ],
    },
    es: {
      title: 'Herbal Kapıda | Productos Herbal Kapıda originales',
      description:
        'Productos Herbal Kapıda originales, packs ventajosos y asesoría nutricional personalizada. Distribuidor independiente Herbal Kapıda.',
      keywords: [
        'Herbal Kapıda',
        'Herbal Kapıda',
        'Formula 1',
        'control de peso',
        'batido proteico',
        'packs',
        'nutrición',
      ],
    },
  },
  footer: {
    en: {
      description:
        'Original Herbal Kapıda products, value bundles, and one-to-one nutrition support with Herbal Kapıda.',
      copyrightSuffix: 'Independent Distributor',
    },
    de: {
      description:
        'Original Herbal Kapıda Produkte, Vorteilspakete und persönliche Ernährungsunterstützung mit Herbal Kapıda.',
      copyrightSuffix: 'Unabhängiger Distributor',
    },
    fr: {
      description:
        'Produits Herbal Kapıda originaux, offres groupées et accompagnement nutritionnel personnalisé avec Herbal Kapıda.',
      copyrightSuffix: 'Distributeur indépendant',
    },
    es: {
      description:
        'Productos Herbal Kapıda originales, packs ventajosos y apoyo nutricional personalizado con Herbal Kapıda.',
      copyrightSuffix: 'Distribuidor independiente',
    },
  },
  whatsapp: {
    en: {
      greeting: 'Hello — Herbal Kapıda. How can we help you?',
      presets: [
        {
          label: 'Order status',
          message: 'Hello, I would like an update on my order status.',
        },
        {
          label: 'Product advice',
          message:
            'Hello, can you recommend products or bundles for my goals?',
        },
        {
          label: 'Nutrition tracking',
          message: 'Hello, I have a question about nutrition tracking.',
        },
        {
          label: 'Shipping & delivery',
          message: 'Hello, I have a question about shipping and delivery.',
        },
        {
          label: 'Something else',
          message: 'Hello, I am reaching out.',
        },
      ],
    },
    de: {
      greeting: 'Hallo — Herbal Kapıda. Wie können wir Ihnen helfen?',
      presets: [
        {
          label: 'Bestellstatus',
          message:
            'Hallo, ich möchte den Status meiner Bestellung erfahren.',
        },
        {
          label: 'Produktberatung',
          message:
            'Hallo, können Sie mir Produkte oder Pakete für meine Ziele empfehlen?',
        },
        {
          label: 'Ernährungstracking',
          message: 'Hallo, ich habe eine Frage zum Ernährungstracking.',
        },
        {
          label: 'Versand & Lieferung',
          message: 'Hallo, ich habe eine Frage zu Versand und Lieferung.',
        },
        {
          label: 'Anderes Thema',
          message: 'Hallo, ich melde mich.',
        },
      ],
    },
    fr: {
      greeting: 'Bonjour — Herbal Kapıda. Comment pouvons-nous vous aider ?',
      presets: [
        {
          label: 'Statut de commande',
          message:
            'Bonjour, je souhaite des informations sur le statut de ma commande.',
        },
        {
          label: 'Conseil produit',
          message:
            'Bonjour, pouvez-vous me recommander des produits ou offres adaptés à mes objectifs ?',
        },
        {
          label: 'Suivi nutrition',
          message: 'Bonjour, j’ai une question sur le suivi nutritionnel.',
        },
        {
          label: 'Livraison',
          message: 'Bonjour, j’ai une question sur la livraison.',
        },
        {
          label: 'Autre sujet',
          message: 'Bonjour, je vous contacte.',
        },
      ],
    },
    es: {
      greeting: 'Hola — Herbal Kapıda. ¿Cómo podemos ayudarte?',
      presets: [
        {
          label: 'Estado del pedido',
          message: 'Hola, me gustaría información sobre el estado de mi pedido.',
        },
        {
          label: 'Asesoría de productos',
          message:
            'Hola, ¿pueden recomendarme productos o packs para mis objetivos?',
        },
        {
          label: 'Seguimiento nutricional',
          message: 'Hola, tengo una pregunta sobre el seguimiento nutricional.',
        },
        {
          label: 'Envío y entrega',
          message: 'Hola, tengo una pregunta sobre envío y entrega.',
        },
        {
          label: 'Otro tema',
          message: 'Hola, me pongo en contacto.',
        },
      ],
    },
  },
  legal: {
    en: {
      supplementDisclaimer:
        'These products are food supplements; they are not intended to diagnose, treat, or prevent disease. A balanced diet and healthy lifestyle matter. Pregnant or nursing women and people with chronic conditions should consult a physician before use.',
      weightDisclaimer:
        'Weight management and body composition results vary by individual; product use alone is not enough. Calorie intake, physical activity, and consistent tracking should be considered together. This site is an independent Herbalife distributor store under the Herbal Kapıda brand.',
    },
    de: {
      supplementDisclaimer:
        'Diese Produkte sind Nahrungsergänzungsmittel; sie dienen nicht der Diagnose, Behandlung oder Vorbeugung von Krankheiten. Ausgewogene Ernährung und ein gesunder Lebensstil sind wichtig. Schwangere, Stillende und Personen mit chronischen Erkrankungen sollten vor der Einnahme einen Arzt konsultieren.',
      weightDisclaimer:
        'Ergebnisse bei Gewichtsmanagement und Körperzusammensetzung sind individuell; alleinige Produktnutzung reicht nicht aus. Kalorienaufnahme, Bewegung und regelmäßiges Tracking gehören zusammen. Diese Website ist ein unabhängiger Herbalife-Vertriebspartner unter der Marke Herbal Kapıda.',
    },
    fr: {
      supplementDisclaimer:
        'Ces produits sont des compléments alimentaires ; ils ne visent pas à diagnostiquer, traiter ou prévenir une maladie. Une alimentation équilibrée et un mode de vie sain sont essentiels. Femmes enceintes ou allaitantes et personnes atteintes de maladies chroniques : consultez un médecin avant utilisation.',
      weightDisclaimer:
        'Les résultats en matière de poids et de composition corporelle varient selon les personnes ; l’usage des produits seul ne suffit pas. Apports caloriques, activité physique et suivi régulier doivent être envisagés ensemble. Ce site est un magasin de distributeur indépendant Herbalife sous la marque Herbal Kapıda.',
    },
    es: {
      supplementDisclaimer:
        'Estos productos son complementos alimenticios; no están destinados a diagnosticar, tratar o prevenir enfermedades. Una dieta equilibrada y un estilo de vida saludable son importantes. Embarazadas, lactantes y personas con enfermedades crónicas deben consultar a un médico antes de usarlos.',
      weightDisclaimer:
        'Los resultados de control de peso y composición corporal varían; el uso del producto por sí solo no basta. Ingesta calórica, actividad física y seguimiento regular deben considerarse juntos. Este sitio es una tienda de distribuidor independiente Herbalife bajo la marca Herbal Kapıda.',
    },
  },
  membership: {
    en: {
      ctaLabel: 'Official Herbal Kapıda membership',
      disclaimer:
        'To become a Herbalife distributor, registration is only through the official myHerbalife platform. This site is an independent Herbal Kapıda storefront.',
    },
    de: {
      ctaLabel: 'Offizielle Herbal Kapıda-Mitgliedschaft',
      disclaimer:
        'Die Registrierung als Herbalife-Distributor erfolgt nur über die offizielle myHerbalife-Plattform. Diese Website ist ein unabhängiger Herbal Kapıda-Shop.',
    },
    fr: {
      ctaLabel: 'Adhésion officielle Herbal Kapıda',
      disclaimer:
        'Pour devenir distributeur Herbalife, l’inscription se fait uniquement via la plateforme officielle myHerbalife. Ce site est une boutique indépendante Herbal Kapıda.',
    },
    es: {
      ctaLabel: 'Membresía oficial Herbal Kapıda',
      disclaimer:
        'Para ser distribuidor de Herbalife, el registro solo se realiza en la plataforma oficial myHerbalife. Este sitio es una tienda independiente Herbal Kapıda.',
    },
  },
  contact: {
    en: {
      locationLabel: 'Türkiye',
      hours: 'Mon — Sun / 09:00 — 20:00',
    },
    de: {
      locationLabel: 'Türkei',
      hours: 'Mo — So / 09:00 — 20:00',
    },
    fr: {
      locationLabel: 'Turquie',
      hours: 'Lun — Dim / 09:00 — 20:00',
    },
    es: {
      locationLabel: 'Turquía',
      hours: 'Lun — Dom / 09:00 — 20:00',
    },
  },
};

/** İçerik bölümü çevirileri — sectionKey + page ile eşleştirilir. */
export const CMS_SECTION_LOCALE_BLOCKS: Record<
  string,
  Partial<Record<LocaleCode, LocaleBlock>>
> = {
  'home:hero': {
    en: {
      eyebrow: 'Official Independent Distributor Assurance',
      headline: 'Take a Step Toward a Healthier, Happier Life',
      body: 'Personalized nutrition programs, sustainable weight management, and 100% original Herbal Kapıda products.',
      ctaLabel: 'Explore Popular Bundles',
      secondaryCtaLabel: 'Get Free Consultation',
    },
    de: {
      eyebrow: 'Offizielle unabhängige Distributor-Garantie',
      headline: 'Ein Schritt zu einem gesünderen, glücklicheren Leben',
      body: 'Personalisierte Ernährungsprogramme, nachhaltiges Gewichtsmanagement und 100 % original Herbal Kapıda Produkte.',
      ctaLabel: 'Beliebte Pakete entdecken',
      secondaryCtaLabel: 'Kostenlose Beratung',
    },
    fr: {
      eyebrow: 'Garantie distributeur indépendant officiel',
      headline: 'Un pas vers une vie plus saine et plus heureuse',
      body: 'Programmes nutritionnels personnalisés, gestion durable du poids et produits Herbal Kapıda 100 % originaux.',
      ctaLabel: 'Découvrir les offres populaires',
      secondaryCtaLabel: 'Consultation gratuite',
    },
    es: {
      eyebrow: 'Garantía de distribuidor independiente oficial',
      headline: 'Da un paso hacia una vida más sana y feliz',
      body: 'Programas de nutrición personalizados, control de peso sostenible y productos Herbal Kapıda 100 % originales.',
      ctaLabel: 'Explorar packs populares',
      secondaryCtaLabel: 'Consulta gratuita',
    },
  },
  'home:promo': {
    en: {
      title: 'Special Value Campaign',
      badge: 'DEAL',
      body: 'Gift advantage on selected bundles and free shipping.',
    },
    de: {
      title: 'Spezielle Vorteilsaktion',
      badge: 'ANGEBOT',
      body: 'Geschenkvorteil bei ausgewählten Paketen und kostenloser Versand.',
    },
    fr: {
      title: 'Campagne avantage spéciale',
      badge: 'OFFRE',
      body: 'Avantage cadeau sur les offres sélectionnées et livraison gratuite.',
    },
    es: {
      title: 'Campaña de ventaja especial',
      badge: 'OFERTA',
      body: 'Ventaja de regalo en packs seleccionados y envío gratis.',
    },
  },
  'home:faq': {
    en: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'Are the products original?',
          answer:
            'Yes. Products sold are original Herbalife products. This site is an independent distributor store under the Herbal Kapıda brand; it is not the official Herbalife website.',
        },
        {
          question: 'Which bundle should I choose?',
          answer:
            'We offer value bundles for your goals. You can get free product advice on WhatsApp.',
        },
        {
          question: 'How long does shipping take?',
          answer:
            'After payment confirmation, orders are usually shipped within 1–3 business days.',
        },
        {
          question: 'How does nutrition tracking work?',
          answer:
            'You can log water, meals, and measurements under Account → Nutrition Tracking.',
        },
      ],
    },
    de: {
      title: 'Häufig gestellte Fragen',
      items: [
        {
          question: 'Sind die Produkte original?',
          answer:
            'Ja. Es werden original Herbalife-Produkte verkauft. Diese Website ist ein unabhängiger Vertriebspartner-Shop unter der Marke Herbal Kapıda; nicht die offizielle Herbalife-Website.',
        },
        {
          question: 'Welches Paket soll ich wählen?',
          answer:
            'Wir bieten Vorteilspakete für Ihre Ziele. Kostenlose Produktberatung per WhatsApp.',
        },
        {
          question: 'Wie lange dauert der Versand?',
          answer:
            'Nach Zahlungsbestätigung werden Bestellungen in der Regel innerhalb von 1–3 Werktagen versendet.',
        },
        {
          question: 'Wie funktioniert das Ernährungstracking?',
          answer:
            'Unter Konto → Ernährungstracking können Sie Wasser, Mahlzeiten und Messungen erfassen.',
        },
      ],
    },
    fr: {
      title: 'Questions fréquentes',
      items: [
        {
          question: 'Les produits sont-ils originaux ?',
          answer:
            'Oui. Les produits vendus sont des produits Herbalife d’origine. Ce site est une boutique de distributeur indépendant sous la marque Herbal Kapıda ; ce n’est pas le site officiel Herbalife.',
        },
        {
          question: 'Quelle offre choisir ?',
          answer:
            'Nous proposons des offres groupées selon vos objectifs. Conseil produit gratuit sur WhatsApp.',
        },
        {
          question: 'Quel est le délai de livraison ?',
          answer:
            'Après confirmation du paiement, les commandes sont généralement expédiées sous 1 à 3 jours ouvrés.',
        },
        {
          question: 'Comment fonctionne le suivi nutritionnel ?',
          answer:
            'Enregistrez eau, repas et mesures dans Compte → Suivi nutrition.',
        },
      ],
    },
    es: {
      title: 'Preguntas frecuentes',
      items: [
        {
          question: '¿Los productos son originales?',
          answer:
            'Sí. Se venden productos Herbalife originales. Este sitio es una tienda de distribuidor independiente bajo la marca Herbal Kapıda; no es el sitio oficial de Herbalife.',
        },
        {
          question: '¿Qué pack debo elegir?',
          answer:
            'Ofrecemos packs ventajosos según tus objetivos. Asesoría gratuita por WhatsApp.',
        },
        {
          question: '¿Cuánto tarda el envío?',
          answer:
            'Tras confirmar el pago, los pedidos suelen enviarse en 1–3 días laborables.',
        },
        {
          question: '¿Cómo funciona el seguimiento nutricional?',
          answer:
            'Registra agua, comidas y mediciones en Cuenta → Seguimiento nutricional.',
        },
      ],
    },
  },
  'about:hero': {
    en: {
      title: 'About us',
      seoDescription:
        'Herbal Kapıda — original products and personalized nutrition support with an independent Herbal Kapıda distributor.',
    },
    de: {
      title: 'Über uns',
      seoDescription:
        'Herbal Kapıda — Originalprodukte und personalisierte Ernährungsunterstützung durch einen unabhängigen Herbal Kapıda Distributor.',
    },
    fr: {
      title: 'À propos',
      seoDescription:
        'Herbal Kapıda — produits originaux et accompagnement nutritionnel avec un distributeur Herbal Kapıda indépendant.',
    },
    es: {
      title: 'Sobre nosotros',
      seoDescription:
        'Herbal Kapıda — productos originales y apoyo nutricional personalizado con un distribuidor Herbal Kapıda independiente.',
    },
  },
  'about:body': {
    en: {
      titleLine1: 'Healthy living',
      titleLine2: 'by your side',
      paragraphs: [
        'At Herbal Kapıda we bring together original Herbal Kapıda products, value bundles, and one-to-one nutrition coaching.',
        'Our goal is to provide a program suited to your target, sustainable habits, and reliable product access.',
        'Reach us via WhatsApp and contact channels for product selection or wellness tracking.',
      ],
      ctaPrimary: { label: 'Browse products', href: '/urunler' },
      ctaSecondary: { label: 'Contact', href: '/iletisim' },
    },
    de: {
      titleLine1: 'Gesund leben',
      titleLine2: 'an Ihrer Seite',
      paragraphs: [
        'Bei Herbal Kapıda verbinden wir original Herbal Kapıda Produkte, Vorteilspakete und persönliches Ernährungscoaching.',
        'Unser Ziel: ein passendes Programm, nachhaltige Gewohnheiten und zuverlässiger Produktzugang.',
        'Für Produktwahl oder Wellness-Tracking erreichen Sie uns per WhatsApp und Kontakt.',
      ],
      ctaPrimary: { label: 'Produkte ansehen', href: '/urunler' },
      ctaSecondary: { label: 'Kontakt', href: '/iletisim' },
    },
    fr: {
      titleLine1: 'Vie saine',
      titleLine2: 'à vos côtés',
      paragraphs: [
        'Chez Herbal Kapıda, nous réunissons produits Herbal Kapıda originaux, offres groupées et coaching nutritionnel personnalisé.',
        'Notre objectif : un programme adapté, des habitudes durables et un accès fiable aux produits.',
        'Contactez-nous via WhatsApp pour le choix des produits ou le suivi bien-être.',
      ],
      ctaPrimary: { label: 'Voir les produits', href: '/urunler' },
      ctaSecondary: { label: 'Contact', href: '/iletisim' },
    },
    es: {
      titleLine1: 'Vida saludable',
      titleLine2: 'a tu lado',
      paragraphs: [
        'En Herbal Kapıda reunimos productos Herbal Kapıda originales, packs ventajosos y coaching nutricional personalizado.',
        'Nuestro objetivo: un programa acorde a tu meta, hábitos sostenibles y acceso fiable a productos.',
        'Escríbenos por WhatsApp para elegir productos o seguimiento wellness.',
      ],
      ctaPrimary: { label: 'Ver productos', href: '/urunler' },
      ctaSecondary: { label: 'Contacto', href: '/iletisim' },
    },
  },
  'about:ethos': {
    en: {
      eyebrow: 'Our nutrition approach',
      quote:
        'Sustainable results come from the right products, consistent tracking, and personal guidance.',
      linkLabel: 'Read articles →',
    },
    de: {
      eyebrow: 'Unser Ernährungsansatz',
      quote:
        'Nachhaltige Ergebnisse entstehen durch die richtigen Produkte, regelmäßiges Tracking und persönliche Begleitung.',
      linkLabel: 'Artikel lesen →',
    },
    fr: {
      eyebrow: 'Notre approche nutrition',
      quote:
        'Des résultats durables viennent des bons produits, d’un suivi régulier et d’un accompagnement personnel.',
      linkLabel: 'Lire les articles →',
    },
    es: {
      eyebrow: 'Nuestro enfoque nutricional',
      quote:
        'Los resultados sostenibles vienen de los productos adecuados, seguimiento constante y guía personal.',
      linkLabel: 'Leer artículos →',
    },
  },
  'coaching:hero': {
    en: {
      eyebrow: 'Nutrition coaching',
      headline: 'Personal coaching and sustainable tracking',
      body: 'A nutrition plan for your goals, meal approval, and measurement tracking — with independent distributor guidance.',
      whatsappPresetLabel: 'Nutrition tracking',
    },
    de: {
      eyebrow: 'Ernährungsberatung',
      headline: 'Persönliches Coaching und nachhaltiges Tracking',
      body: 'Ernährungsplan für Ihre Ziele, Mahlzeiten-Freigabe und Mess-Tracking — mit unabhängigem Distributor.',
      whatsappPresetLabel: 'Ernährungstracking',
    },
    fr: {
      eyebrow: 'Coaching nutrition',
      headline: 'Coaching personnel et suivi durable',
      body: 'Plan nutritionnel adapté à vos objectifs, validation des repas et suivi des mesures — avec distributeur indépendant.',
      whatsappPresetLabel: 'Suivi nutrition',
    },
    es: {
      eyebrow: 'Asesoría nutricional',
      headline: 'Coaching personal y seguimiento sostenible',
      body: 'Plan nutricional según tus objetivos, aprobación de comidas y seguimiento de medidas — con distribuidor independiente.',
      whatsappPresetLabel: 'Seguimiento nutricional',
    },
  },
  'coaching:body': {
    en: {
      titleLine1: 'Your program',
      titleLine2: 'with you',
      paragraphs: [
        'From Formula 1 and supplement choices to daily meal structure — we offer a personalized roadmap.',
        'Share meal photos and measurements via Nutrition Tracking in your account; your coach reviews and feedback.',
        'Get quick Q&A and motivation support on our WhatsApp line.',
      ],
    },
    de: {
      titleLine1: 'Ihr Programm',
      titleLine2: 'gemeinsam mit Ihnen',
      paragraphs: [
        'Von Formula 1 und Supplementen bis zum Tagesrhythmus — eine personalisierte Roadmap.',
        'Teilen Sie Mahlzeiten und Messungen im Konto; Ihr Coach prüft und gibt Feedback.',
        'Schnelle Fragen und Motivation über unsere WhatsApp-Linie.',
      ],
    },
    fr: {
      titleLine1: 'Votre programme',
      titleLine2: 'avec vous',
      paragraphs: [
        'Du Formula 1 aux compléments et à l’organisation des repas — une feuille de route personnalisée.',
        'Partagez repas et mesures dans Suivi nutrition ; votre coach valide et répond.',
        'Questions rapides et motivation sur WhatsApp.',
      ],
    },
    es: {
      titleLine1: 'Tu programa',
      titleLine2: 'contigo',
      paragraphs: [
        'Desde Formula 1 y suplementos hasta la rutina diaria — hoja de ruta personalizada.',
        'Comparte comidas y mediciones en Seguimiento nutricional; tu coach revisa y responde.',
        'Preguntas rápidas y motivación por WhatsApp.',
      ],
    },
  },
  'coaching:steps': {
    en: {
      title: 'How it works',
      items: [
        {
          title: 'Set your goal',
          body: 'Weight management, energy, or sports performance — product and program recommendations for your goal.',
        },
        {
          title: 'Daily tracking',
          body: 'Log water, meals, and measurements through the app.',
        },
        {
          title: 'Coach approval',
          body: 'Your entries are reviewed; you receive approval or adjustment notes.',
        },
        {
          title: 'Ongoing support',
          body: 'WhatsApp and periodic check-ins keep your program updated.',
        },
      ],
    },
    de: {
      title: 'So funktioniert es',
      items: [
        {
          title: 'Ziel festlegen',
          body: 'Gewicht, Energie oder Sport — Empfehlungen passend zu Ihrem Ziel.',
        },
        {
          title: 'Tägliches Tracking',
          body: 'Wasser, Mahlzeiten und Messungen in der App erfassen.',
        },
        {
          title: 'Coach-Freigabe',
          body: 'Einträge werden geprüft; Freigabe oder Hinweise erhalten Sie zurück.',
        },
        {
          title: 'Fortlaufende Unterstützung',
          body: 'WhatsApp und regelmäßige Checks halten Ihr Programm aktuell.',
        },
      ],
    },
    fr: {
      title: 'Comment ça marche',
      items: [
        {
          title: 'Définir l’objectif',
          body: 'Poids, énergie ou sport — recommandations produits et programme.',
        },
        {
          title: 'Suivi quotidien',
          body: 'Enregistrez eau, repas et mesures via l’application.',
        },
        {
          title: 'Validation coach',
          body: 'Vos saisies sont examinées ; validation ou corrections.',
        },
        {
          title: 'Support continu',
          body: 'WhatsApp et contrôles réguliers pour mettre à jour le programme.',
        },
      ],
    },
    es: {
      title: 'Cómo funciona',
      items: [
        {
          title: 'Define tu objetivo',
          body: 'Peso, energía o rendimiento — recomendaciones de productos y programa.',
        },
        {
          title: 'Seguimiento diario',
          body: 'Registra agua, comidas y mediciones en la app.',
        },
        {
          title: 'Aprobación del coach',
          body: 'Se revisan tus registros; recibes aprobación o notas de ajuste.',
        },
        {
          title: 'Apoyo continuo',
          body: 'WhatsApp y revisiones periódicas actualizan tu programa.',
        },
      ],
    },
  },
};
