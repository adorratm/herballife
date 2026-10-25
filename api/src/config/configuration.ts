import { existsSync } from 'fs';

/** Compose içindeki `redis` hostname'ini host'ta localhost'a çevir. */
function resolveRedisUrl(): string {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'redis') return url;

    // Image build: compose DNS yok (/.dockerenv build'te de var).
    if (process.env.DOCKER_BUILD === '1') {
      parsed.hostname = '127.0.0.1';
      return parsed.href;
    }
    // Runtime compose: `redis` servis adı kalsın.
    if (existsSync('/.dockerenv')) return url;

    // Host makine: redis → localhost
    parsed.hostname = 'localhost';
    return parsed.href;
  } catch {
    return url;
  }
}

function isLoopbackUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return (
      h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '::1'
    );
  } catch {
    return false;
  }
}

function resolvePublicUrl(
  raw: string | undefined,
  fallbackDev: string,
  fallbackProd: string,
): string {
  const value = (raw || '').trim();
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  if (isProd && (!value || isLoopbackUrl(value))) return fallbackProd;
  return value || fallbackDev;
}

export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPort: parseInt(process.env.API_PORT || '4000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  frontendUrl: resolvePublicUrl(
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://herbalife.com.tr',
  ),
  adminUrl: resolvePublicUrl(
    process.env.ADMIN_URL,
    'http://localhost:3001',
    'https://admin.herbalife.com.tr',
  ),
  /**
   * @deprecated Auth/yetki için kullanılmaz — `admin_allowlist` tablosu + Kullanıcılar UI.
   * Yalnızca `yarn seed` ilk bootstrap’ta DB’ye yazmak için okunur.
   */
  adminAllowlist: (process.env.ADMIN_ALLOWLIST || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'herbalife',
    password: process.env.POSTGRES_PASSWORD || 'herbalife_secret',
    name: process.env.POSTGRES_DB || 'herbalife',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:4000/auth/google/callback',
    adminCallbackUrl:
      process.env.GOOGLE_ADMIN_CALLBACK_URL ||
      'http://localhost:4000/auth/google/admin/callback',
  },
  apple: {
    /** Virgülle: iOS bundle id ve isteğe bağlı Services ID */
    clientIds: process.env.APPLE_CLIENT_ID || 'tr.herbalife.ops',
  },
  payment: {
    /** Yalnızca PayTR */
    provider: 'paytr' as const,
  },
  paytr: {
    merchantId: process.env.PAYTR_MERCHANT_ID || '',
    merchantKey: process.env.PAYTR_MERCHANT_KEY || '',
    merchantSalt: process.env.PAYTR_MERCHANT_SALT || '',
    /** 1 = test modu */
    testMode: process.env.PAYTR_TEST_MODE || '1',
    debugOn: process.env.PAYTR_DEBUG_ON || '1',
    noInstallment: process.env.PAYTR_NO_INSTALLMENT || '0',
    maxInstallment: process.env.PAYTR_MAX_INSTALLMENT || '0',
    /** Yerel geliştirmede dış IP yoksa kullanılır */
    fallbackIp: process.env.PAYTR_FALLBACK_IP || '1.1.1.1',
    /**
     * PayTR anahtarı yokken mock ödeme açılsın mı?
     * production’da yalnızca PAYTR_ALLOW_MOCK=true ile açılır.
     */
    allowMock:
      process.env.NODE_ENV === 'production'
        ? process.env.PAYTR_ALLOW_MOCK === 'true'
        : process.env.PAYTR_ALLOW_MOCK !== 'false',
  },
  aws: {
    region: process.env.AWS_REGION || 'eu-central-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    cdnUrl: process.env.AWS_CDN_URL || '',
  },
  redis: {
    url: resolveRedisUrl(),
  },
  mail: {
    from:
      process.env.MAIL_FROM || 'Herbal Kapıda <info@herbalkapida.com>',
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    /** true = 465 SSL; false = 587 STARTTLS */
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    /**
     * Yeni sipariş / ödeme admin e-postaları.
     * Boşsa aktif `admin_allowlist` kayıtları; o da yoksa info@ kullanılır.
     */
    orderAlertEmails: (process.env.ORDER_ALERT_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  },
  whatsapp: {
    /** console | meta — otomatik sipariş WhatsApp’ı için Meta Cloud API */
    provider: process.env.WHATSAPP_PROVIDER || 'console',
    /** İş / WhatsApp Business numarası */
    from: process.env.WHATSAPP_FROM || '+905553332211',
    metaToken: process.env.META_WA_TOKEN || '',
    metaPhoneNumberId: process.env.META_WA_PHONE_NUMBER_ID || '',
  },
  /** @deprecated SMS kaldırıldı */
  sms: {
    provider: process.env.SMS_PROVIDER || 'console',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFrom: process.env.TWILIO_FROM || '',
    netgsmUsercode: process.env.NETGSM_USERCODE || '',
    netgsmPassword: process.env.NETGSM_PASSWORD || '',
    netgsmMsgHeader: process.env.NETGSM_MSGHEADER || '',
  },
  bullBoard: {
    path: process.env.BULL_BOARD_PATH || '/admin/queues',
  },
  tax: {
    /** Türkiye B2C için varsayılan KDV % */
    ratePercent: parseFloat(process.env.TAX_RATE_PERCENT || '20'),
    /** true: fiyatlar KDV dahil; taxAmount içinden ayrıştırılır */
    included: process.env.TAX_INCLUDED !== 'false',
  },
  shipping: {
    freeOver: parseFloat(process.env.FREE_SHIPPING_OVER || '0'),
    defaultFee: parseFloat(process.env.DEFAULT_SHIPPING_FEE || '89.90'),
    /**
     * Credentials yokken mock kargo oluşturulsun mu?
     * production’da yalnızca SHIPPING_ALLOW_MOCK=true ile açılır.
     */
    allowMock:
      process.env.NODE_ENV === 'production'
        ? process.env.SHIPPING_ALLOW_MOCK === 'true'
        : process.env.SHIPPING_ALLOW_MOCK !== 'false',
  },
  abandonedCart: {
    /** Sepet güncellenmeden kaç saat sonra 1. hatırlatma (varsayılan 4) */
    hours: parseInt(process.env.ABANDONED_CART_HOURS || '4', 10),
    /** 1. hatırlatmadan kaç saat sonra 2. hatırlatma (varsayılan 24) */
    secondHours: parseInt(process.env.ABANDONED_CART_SECOND_HOURS || '24', 10),
  },
  marketplaceSync: {
    enabled: process.env.MARKETPLACE_SYNC_ENABLED !== 'false',
    /** Saatlik varsayılan; en az 5 dk */
    intervalMinutes: parseInt(
      process.env.MARKETPLACE_SYNC_INTERVAL_MINUTES || '60',
      10,
    ),
  },
  marketplace: {
    trendyol: {
      baseUrl:
        process.env.TRENDYOL_API_BASE_URL ||
        'https://apigw.trendyol.com/integration',
    },
    trendyolGoMarket: {
      /** Varsayılan stage; prod deploy'da TRENDYOL_GO_MARKET_API_BASE_URL=https://api.tgoapis.com */
      baseUrl:
        process.env.TRENDYOL_GO_MARKET_API_BASE_URL ||
        'https://stageapi.tgoapis.com',
    },
    hepsiburada: {
      listingBaseUrl:
        process.env.HEPSIBURADA_LISTING_BASE_URL ||
        'https://listing-external.hepsiburada.com',
      omsBaseUrl:
        process.env.HEPSIBURADA_OMS_BASE_URL ||
        'https://oms-external.hepsiburada.com',
      mpopBaseUrl:
        process.env.HEPSIBURADA_MPOP_BASE_URL || 'https://mpop.hepsiburada.com',
      /** HB Developer Username (User-Agent); credentials.userAgent override eder */
      userAgent: process.env.HEPSIBURADA_USER_AGENT || 'herbalife_dev',
      /** Opsiyonel; set edilirse webhook ?secret= veya x-webhook-secret ister */
      webhookSecret: process.env.HEPSIBURADA_WEBHOOK_SECRET || '',
    },
    n11: {
      baseUrl: process.env.N11_API_BASE_URL || 'https://api.n11.com',
      integrator: process.env.N11_INTEGRATOR_NAME || 'Herbalife',
    },
  },
  lowStock: {
    threshold: parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10),
    /** Virgülle ayrılmış ekstra alıcılar; boşsa admin allowlist + DB allowlist */
    alertEmails: (process.env.LOW_STOCK_ALERT_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    scanIntervalHours: parseInt(
      process.env.LOW_STOCK_SCAN_INTERVAL_HOURS || '24',
      10,
    ),
  },
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    userId: process.env.INSTAGRAM_USER_ID || '',
    username: process.env.INSTAGRAM_USERNAME || 'herbalife',
  },
});
