/** Seed / bootstrap site ayarları — marka CMS’ten sonradan değiştirilir. */

export const DEFAULT_SITE_SETTINGS: Record<string, Record<string, unknown>> = {
  brand: {
    name: 'Herbal Kapıda',
    slogan: 'Daha sağlıklı, daha mutlu bir yaşam',
    tagline:
      'Bağımsız distribütör rehberliğinde orijinal Herbal Kapıda ürünleri ve kişiselleştirilmiş beslenme desteği.',
    established: '2024’ten beri',
    location: 'Buca / İzmir',
    logoUrl:
      'https://herbalkapida.s3.eu-central-1.amazonaws.com/brand/logo.webp',
    distributorName: 'Büşra Özberk',
    distributorTitle: 'Bağımsız Distribütör',
    distributorCode: '',
    legalDisclaimer:
      'Bu site bağımsız bir Herbalife Nutrition / Herbal Kapıda distribütörüne aittir. Resmi Herbalife sitesi değildir. Ürünler orijinal Herbalife ürünleridir.',
  },
  contact: {
    address: 'Adatepe Mahallesi 73 Sokak No: 3 Daire: 9 Buca / İzmir',
    email: 'info@herbalkapida.com',
    phone: '+90 541 489 42 43',
    hours: 'Pzt — Paz / 09:00 — 20:00',
    locationLabel: 'Buca / İzmir',
    latitude: '',
    longitude: '',
  },
  seo: {
    title: 'Herbal Kapıda | Büşra Özberk — Bağımsız Distribütör',
    description:
      'Orijinal Herbalife / Herbal Kapıda ürünleri, avantajlı setler ve kişiselleştirilmiş beslenme danışmanlığı. Bağımsız distribütör Büşra Özberk — herbalkapida.com.',
    keywords: [
      'Herbal Kapıda',
      'Herbalife',
      'Büşra Özberk',
      'Formül 1',
      'kilo kontrolü',
      'protein shake',
      'avantajlı setler',
      'beslenme',
      'İzmir',
    ],
    ogImage:
      'https://herbalkapida.s3.eu-central-1.amazonaws.com/brand/og.webp',
  },
  navigation: {
    header: [
      { href: '/urunler', label: 'Ürünler' },
      { href: '/hakkimizda', label: 'Hakkımızda' },
      { href: '/kocluk', label: 'Koçluk' },
      { href: '/blog', label: 'Yazılar' },
      { href: '/medya', label: 'Medya' },
      { href: '/sss', label: 'SSS' },
      { href: '/yorum', label: 'Yorumlar' },
      { href: '/iletisim', label: 'İletişim' },
    ],
    footerNav: [
      { href: '/urunler', label: 'Ürünler' },
      { href: '/urunler/kategori/avantajli-setler', label: 'Avantajlı Setler' },
      { href: '/hakkimizda', label: 'Hakkımızda' },
      { href: '/blog', label: 'Yazılar' },
      { href: '/medya', label: 'Medya' },
      { href: '/sss', label: 'SSS' },
      { href: '/iletisim', label: 'İletişim' },
      { href: '/siparis-sorgula', label: 'Sipariş Sorgula' },
      { href: '/odeme-bildirimi', label: 'Ödeme Bildirimi' },
      { href: '/banka-hesaplari', label: 'Banka Hesapları' },
      { href: '/takip', label: 'Kargo Takip' },
      { href: '/yorum', label: 'Google Yorum' },
      { href: '/hesabim', label: 'Hesabım' },
      { href: '/hesabim/favoriler', label: 'Favorilerim' },
      { href: '/hesabim/takip', label: 'Beslenme Takibi' },
      { href: '/hesabim/rapor', label: 'Gelişim Raporu' },
      { href: '/sepet', label: 'Sepet' },
    ],
    footerLegal: [
      { href: '/kvkk', label: 'KVKK' },
      { href: '/gizlilik', label: 'Gizlilik' },
      { href: '/cerez-politikasi', label: 'Çerez Kullanımı' },
      { href: '/mesafeli-satis', label: 'Mesafeli Satış' },
      { href: '/on-bilgilendirme', label: 'Ön Bilgilendirme' },
      { href: '/iptal-iade', label: 'İade Politikası' },
      { href: '/musteri-memnuniyeti', label: 'Müşteri Memnuniyeti' },
      { href: '/guvenli-alisveris', label: 'Güvenli Alışveriş' },
      { href: '/aydinlatma-metni', label: 'Aydınlatma Metni' },
    ],
  },
  social: {
    instagram: '',
    facebook: '',
    googleMaps: '',
    googleReviewUrl: '',
  },
  features: {
    googleReviewsPageEnabled: false,
  },
  welcomePopup: {
    enabled: true,
    delayMs: 600,
    frequency: 'once', // once | session | always
    showOnPaths: ['/'], // boş = tüm sayfalar; locale öneki yok
    excludePaths: ['/giris', '/kayit', '/odeme', '/auth'],
    storageKey: 'hk_welcome_popup_v1',
    distributorName: 'Büşra Özberk',
    headline:
      'Bu internet sitesi Herbalife Nutrition Bağımsız Distribütörü tarafından yönetilmektedir: Büşra Özberk',
    leftTitle: 'MEVCUT MÜŞTERİ ?',
    leftBody:
      'Beslenme hedeflerinize ulaşmada kişisel Distribütörünüzle kuracağınız birebir ilişki çok önemlidir. Eğer Büşra Özberk mevcut distribütörünüz değil ise, ürünlerinizi mevcut distribütörünüzden almanızı öneririz. Mevcut Distribütörünüzü bulmak için',
    leftLinkLabel: 'buraya tıklayınız.',
    leftLinkUrl: 'https://www.herbalife.com/tr-tr/',
    rightTitle:
      'HALİHAZIRDA HERBALIFE NUTRITION DİSTRİBÜTÖRÜ YA DA AYRICALIKLI MÜŞTERİ MİSİNİZ?',
    rightBody:
      'Eğer kendi Distribütör hesabınız varsa, lütfen sipariş vermek ve tüm haklardan yararlanmak için',
    rightLinkLabel: 'myherbalife.com',
    rightLinkUrl: 'https://www.myherbalife.com',
    closeLabel: 'Kapat',
    translations: {
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
  },
  whatsapp: {
    enabled: true,
    phone: '+905051420710',
    greeting: 'Merhaba — Büşra Özberk / Herbal Kapıda. Size nasıl yardımcı olabiliriz?',
    presets: [
      {
        label: 'Sipariş durumu',
        message: 'Merhaba, sipariş durumum hakkında bilgi almak istiyorum.',
      },
      {
        label: 'Ürün danışmanlığı',
        message:
          'Merhaba, hedeflerime uygun ürün / paket önerisi alabilir miyim?',
      },
      {
        label: 'Beslenme takibi',
        message: 'Merhaba, beslenme ve takip programı hakkında yazıyorum.',
      },
      {
        label: 'Kargo & teslimat',
        message:
          'Merhaba, kargo süresi ve teslimat seçenekleri hakkında yazıyorum.',
      },
      {
        label: 'Başka bir konu',
        message: 'Merhaba, yazıyorum.',
      },
    ],
  },
  footer: {
    description:
      'Herbal Kapıda ile orijinal Herbal Kapıda ürünleri, avantajlı setler ve birebir beslenme desteği.',
    copyrightSuffix: 'Bağımsız Distribütör',
  },
  localization: {
    defaultLocale: 'tr',
    enabledLocales: ['tr', 'en', 'de', 'fr', 'es'],
    defaultCurrency: 'TRY',
    currencies: ['TRY', 'USD', 'EUR', 'GBP'],
    currencyByLocale: {
      tr: 'TRY',
      en: 'USD',
      de: 'EUR',
      fr: 'EUR',
      es: 'EUR',
    },
    /** 1 TRY = X foreign (ürün prices[currency] yoksa kullanılır) */
    exchangeRates: {
      TRY: 1,
      USD: 0.029,
      EUR: 0.027,
      GBP: 0.023,
    },
    languages: [
      {
        code: 'tr',
        name: 'Türkçe',
        nativeName: 'Türkçe',
        enabled: true,
        currency: 'TRY',
        sortOrder: 0,
      },
      {
        code: 'en',
        name: 'İngilizce',
        nativeName: 'English',
        enabled: true,
        currency: 'USD',
        sortOrder: 1,
      },
      {
        code: 'de',
        name: 'Almanca',
        nativeName: 'Deutsch',
        enabled: true,
        currency: 'EUR',
        sortOrder: 2,
      },
      {
        code: 'fr',
        name: 'Fransızca',
        nativeName: 'Français',
        enabled: true,
        currency: 'EUR',
        sortOrder: 3,
      },
      {
        code: 'es',
        name: 'İspanyolca',
        nativeName: 'Español',
        enabled: true,
        currency: 'EUR',
        sortOrder: 4,
      },
    ],
  },
  analytics: {
    ga4Id: '',
    gtmId: '',
    googleAdsId: '',
    metaPixelId: '',
    facebookPixelId: '',
    yandexMetrikaId: '',
    tiktokPixelId: '',
  },
  shipping: {
    defaultFee: 89.9,
    freeShippingOver: 750,
  },
  promises: {
    sameDayCutoff: '13:00',
    sameDayShipping: true,
    freeCoaching: true,
    returnDays: 30,
  },
  legal: {
    supplementDisclaimer:
      'Bu ürünler gıda takviyesidir; hastalıkların teşhis, tedavi veya önlenmesi amacıyla kullanılmaz. Dengeli ve çeşitli beslenme ile sağlıklı yaşam tarzı önemlidir. Hamileler, emzirenler ve kronik rahatsızlığı olanlar kullanmadan önce hekimine danışmalıdır.',
    weightDisclaimer:
      'Kilo kontrolü ve vücut kompozisyonu sonuçları kişiden kişiye değişir; tek başına ürün kullanımı yeterli değildir. Kalori alımı, fiziksel aktivite ve düzenli takip birlikte değerlendirilmelidir. Bu site bağımsız bir Herbal Kapıda Nutrition distribütörüne aittir.',
  },
  membership: {
    ctaLabel: 'Resmi Herbalife üyeliği',
    ctaUrl: 'https://www.myherbalife.com',
    disclaimer:
      'Herbalife Nutrition distribütörü olmak için kayıt yalnızca resmi myHerbalife platformu üzerinden yapılır. Bu site bağımsız bir distribütör sitesidir.',
  },
};

export const DEFAULT_HOME_SECTIONS: Array<{
  page: string;
  sectionKey: string;
  title: string;
  content: Record<string, unknown>;
  sortOrder: number;
  isPublished: boolean;
}> = [
  {
    page: 'home',
    sectionKey: 'hero',
    title: 'Hero',
    content: {
      eyebrow: 'Resmi Bağımsız Distribütör Güvencesi',
      headline: 'Daha Sağlıklı, Daha Mutlu Bir Yaşama Adım Atın',
      body: 'Kişiselleştirilmiş beslenme programları, sürdürülebilir kilo kontrolü ve %100 orijinal Herbal Kapıda ürünleri.',
      ctaLabel: 'Popüler Paketleri Keşfet',
      ctaHref: '/urunler/kategori/avantajli-setler',
      secondaryCtaLabel: 'Ücretsiz Danışmanlık Al',
    },
    sortOrder: 1,
    isPublished: true,
  },
  {
    page: 'home',
    sectionKey: 'promo',
    title: 'Kampanya',
    content: {
      title: 'Özel Avantaj Kampanyası',
      badge: 'FIRSAT',
      body: 'Seçili setlerde hediye avantajı ve ücretsiz kargo.',
      couponCode: 'SAGLIK2026',
      endsAt: '2026-10-31T23:59:59+03:00',
    },
    sortOrder: 2,
    isPublished: true,
  },
  {
    page: 'home',
    sectionKey: 'faq',
    title: 'SSS',
    content: {
      title: 'Sıkça Sorulan Sorular',
      items: [
        {
          question: 'Ürünler orijinal mi?',
          answer:
            'Evet. Satılan ürünler orijinal Herbal Kapıda ürünleridir. Bu site bağımsız bir Herbal Kapıda Nutrition distribütörüne aittir.',
        },
        {
          question: 'Hangi paketi seçmeliyim?',
          answer:
            'Hedefinize göre avantajlı setler sunuyoruz. WhatsApp’tan ücretsiz ürün danışmanlığı alabilirsiniz.',
        },
        {
          question: 'Kargo süresi ne kadar?',
          answer:
            'Ödeme onayı sonrası siparişler genellikle 1–3 iş günü içinde kargoya verilir.',
        },
        {
          question: 'Beslenme takibi nasıl çalışır?',
          answer:
            'Hesabım → Beslenme Takibi üzerinden su, öğün ve ölçüm kaydı ekleyebilirsiniz.',
        },
      ],
    },
    sortOrder: 10,
    isPublished: true,
  },
  {
    page: 'about',
    sectionKey: 'hero',
    title: 'Hakkımızda hero',
    content: {
      imageUrl: '',
      title: 'Hakkımızda',
      seoDescription:
        'Herbal Kapıda — bağımsız Herbal Kapıda distribütörü ile orijinal ürünler ve kişiselleştirilmiş beslenme desteği.',
    },
    sortOrder: 1,
    isPublished: true,
  },
  {
    page: 'about',
    sectionKey: 'body',
    title: 'Hakkımızda metin',
    content: {
      titleLine1: 'Sağlıklı yaşam',
      titleLine2: 'yanınızda',
      paragraphs: [
        'Herbal Kapıda olarak orijinal Herbal Kapıda ürünlerini, avantajlı paketleri ve birebir beslenme danışmanlığını bir arada sunuyoruz.',
        'Amacımız hedefinize uygun program, sürdürülebilir alışkanlıklar ve güvenilir ürün erişimi sağlamaktır.',
        'Ürün seçimi veya wellness takibi için WhatsApp ve iletişim kanallarımızdan bize ulaşabilirsiniz.',
      ],
      ctaPrimary: { label: 'Ürünleri İncele', href: '/urunler' },
      ctaSecondary: { label: 'İletişim', href: '/iletisim' },
      showContactAside: true,
    },
    sortOrder: 2,
    isPublished: true,
  },
  {
    page: 'about',
    sectionKey: 'ethos',
    title: 'Hakkımızda ethos',
    content: {
      imageUrl: '',
      eyebrow: 'Beslenme yaklaşımımız',
      quote:
        'Sürdürülebilir sonuçlar; doğru ürün, düzenli takip ve kişisel rehberlikle gelir.',
      linkLabel: 'Yazıları oku →',
      linkHref: '/blog',
    },
    sortOrder: 3,
    isPublished: true,
  },
  {
    page: 'coaching',
    sectionKey: 'hero',
    title: 'Koçluk hero',
    content: {
      eyebrow: 'Beslenme danışmanlığı',
      headline: 'Kişisel koçluk ve sürdürülebilir takip',
      body: 'Hedeflerinize uygun beslenme planı, öğün onayı ve ölçüm takibi — bağımsız distribütör rehberliğinde.',
      imageUrl: '',
      whatsappPresetLabel: 'Beslenme takibi',
    },
    sortOrder: 1,
    isPublished: true,
  },
  {
    page: 'coaching',
    sectionKey: 'body',
    title: 'Koçluk içerik',
    content: {
      titleLine1: 'Programınız',
      titleLine2: 'sizinle birlikte',
      paragraphs: [
        'Formül 1 ve takviye seçiminden günlük öğün düzenine kadar kişiselleştirilmiş bir yol haritası sunuyoruz.',
        'Hesabınızdaki Beslenme Takibi ile öğün fotoğrafı ve ölçümlerinizi paylaşın; koçunuz onaylayıp geri bildirim verir.',
        'WhatsApp hattımızdan hızlı soru-cevap ve motivasyon desteği alabilirsiniz.',
      ],
    },
    sortOrder: 2,
    isPublished: true,
  },
  {
    page: 'coaching',
    sectionKey: 'steps',
    title: 'Koçluk adımları',
    content: {
      title: 'Nasıl işler?',
      items: [
        {
          title: 'Hedef belirleme',
          body: 'Kilo kontrolü, enerji veya spor performansı — hedefinize göre ürün ve program önerisi.',
        },
        {
          title: 'Günlük takip',
          body: 'Su, öğün ve ölçüm kayıtlarınızı uygulama üzerinden iletin.',
        },
        {
          title: 'Koç onayı',
          body: 'Kayıtlarınız incelenir; onay veya düzeltme notu ile geri bildirim alırsınız.',
        },
        {
          title: 'Sürekli destek',
          body: 'WhatsApp ve periyodik kontrol ile programınız güncellenir.',
        },
      ],
    },
    sortOrder: 3,
    isPublished: true,
  },
];
