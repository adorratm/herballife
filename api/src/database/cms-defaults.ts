/** Seed / bootstrap site ayarları — marka CMS’ten sonradan değiştirilir. */

export const DEFAULT_SITE_SETTINGS: Record<string, Record<string, unknown>> = {
  brand: {
    name: 'Herbal Ürünleri',
    slogan: 'Daha sağlıklı, daha mutlu bir yaşam',
    tagline:
      'Bağımsız distribütör rehberliğinde orijinal Herbalife ürünleri ve kişiselleştirilmiş beslenme desteği.',
    established: 'EST. 2024',
    location: 'Türkiye',
    logoUrl: '',
    distributorName: 'Emine Özberk',
    distributorTitle: 'Bağımsız Distribütör',
    legalDisclaimer:
      'Bu site bağımsız bir Herbalife Nutrition distribütörüne aittir. Herbalife Nutrition resmi sitesi değildir. Ürünler orijinal Herbalife ürünleridir.',
  },
  contact: {
    address: 'Türkiye',
    email: 'info@ornek.com',
    phone: '+90 500 000 00 00',
    hours: 'Pzt — Paz / 09:00 — 20:00',
    locationLabel: 'Türkiye',
    latitude: '',
    longitude: '',
  },
  seo: {
    title: 'Herbal Ürünleri | Orijinal Herbalife Ürünleri',
    description:
      'Orijinal Herbalife ürünleri, avantajlı setler ve kişiselleştirilmiş beslenme danışmanlığı. Bağımsız distribütör Emine Özberk.',
    keywords: [
      'Herbalife',
      'Formül 1',
      'kilo kontrolü',
      'protein shake',
      'avantajlı setler',
      'beslenme',
      'Emine Özberk',
    ],
    ogImage: '',
  },
  navigation: {
    header: [
      { href: '/urunler', label: 'Ürünler' },
      { href: '/hakkimizda', label: 'Hakkımızda' },
      { href: '/blog', label: 'Blog' },
      { href: '/medya', label: 'Medya' },
      { href: '/sss', label: 'SSS' },
      { href: '/yorum', label: 'Yorumlar' },
      { href: '/iletisim', label: 'İletişim' },
    ],
    footerNav: [
      { href: '/urunler', label: 'Ürünler' },
      { href: '/urunler/kategori/avantajli-setler', label: 'Avantajlı Setler' },
      { href: '/hakkimizda', label: 'Hakkımızda' },
      { href: '/blog', label: 'Blog' },
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
  whatsapp: {
    enabled: true,
    phone: '',
    greeting: 'Merhaba — Emine Özberk. Size nasıl yardımcı olabiliriz?',
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
      'Bağımsız distribütör Emine Özberk ile orijinal Herbalife ürünleri ve birebir beslenme desteği.',
    copyrightSuffix: 'Bağımsız Distribütör',
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
      body: 'Kişiselleştirilmiş beslenme programları, sürdürülebilir kilo kontrolü ve %100 orijinal Herbalife ürünleri.',
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
            'Evet. Satılan ürünler orijinal Herbalife ürünleridir. Bu site bağımsız bir Herbalife Nutrition distribütörüne aittir.',
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
        'Bağımsız Herbalife distribütörü Emine Özberk ile orijinal ürünler ve kişiselleştirilmiş beslenme desteği.',
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
        'Bağımsız distribütör Emine Özberk olarak orijinal Herbalife ürünlerini, avantajlı paketleri ve birebir beslenme danışmanlığını bir arada sunuyoruz.',
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
      linkLabel: 'Blog notlarını oku →',
      linkHref: '/blog',
    },
    sortOrder: 3,
    isPublished: true,
  },
];
