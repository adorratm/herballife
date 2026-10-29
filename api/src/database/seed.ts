import 'reflect-metadata';
import { config } from 'dotenv';
import { join } from 'path';
import { AppDataSource } from '@database/data-source';
import { AdminAllowlist } from '@entities/admin-allowlist.entity';
import { User, UserRole, AuthProvider } from '@entities/user.entity';
import { CashAccount, CashAccountKind } from '@entities/cash-account.entity';
import { AccountingSettings } from '@entities/accounting-settings.entity';
import * as bcrypt from 'bcryptjs';
import { Category } from '@entities/category.entity';
import { Product } from '@entities/product.entity';
import { ProductVariant } from '@entities/product-variant.entity';
import { LegalDocument } from '@entities/legal-document.entity';
import { BlogPost } from '@entities/blog-post.entity';
import { ProductReview } from '@entities/product-review.entity';
import { Coupon, CouponType } from '@entities/coupon.entity';
import { ShippingProviderConfig } from '@entities/shipping-provider-config.entity';
import { ShippingProviderCode } from '@entities/shipment.entity';
import { SiteSetting } from '@entities/site-setting.entity';
import { ContentSection } from '@entities/content-section.entity';
import { Order, OrderStatus } from '@entities/order.entity';
import { OrderItem } from '@entities/order-item.entity';
import { Payment, PaymentStatus } from '@entities/payment.entity';
import {
  WellnessMealLog,
  WellnessApprovalStatus,
} from '@entities/wellness-meal-log.entity';
import { WellnessWaterLog } from '@entities/wellness-water-log.entity';
import { WellnessMeasurement } from '@entities/wellness-measurement.entity';
import {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_SITE_SETTINGS,
} from '@database/cms-defaults';
import { LEGAL_DEFAULTS } from '@database/legal-defaults';
import { apiStockImage } from '../common/stock-images';
import { herbalProductImage } from '@database/herbal-product-images';
import { migrateI18nContent } from '@database/migrate-i18n-content';
import { migrateCmsI18n } from '@database/migrate-cms-i18n';
import { PROTECTED_ADMIN_EMAILS } from '@modules/auth/protected-admins';

config({ path: join(process.cwd(), '..', '.env') });
config();

function shouldSynchronizeForSeed(): boolean {
  if (process.env.DATABASE_SYNCHRONIZE === 'true') return true;
  if (process.env.DATABASE_SYNCHRONIZE === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

async function ensureSchemaForSeed(): Promise<void> {
  if (shouldSynchronizeForSeed()) {
    await AppDataSource.synchronize();
    console.log('Schema synchronized (seed)');
    return;
  }
  // Prod: migrate one-shot şemayı kurmalı; yoksa net hata ver.
  const rows: Array<{ exists: boolean }> = await AppDataSource.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'categories'
     ) AS exists`,
  );
  if (!rows[0]?.exists) {
    throw new Error(
      'categories tablosu yok — önce `node dist/migrate.js` çalıştırın (InitialSchema).',
    );
  }
}

async function seed() {
  await AppDataSource.initialize();
  await ensureSchemaForSeed();
  const em = AppDataSource.manager;

  const protectedAdmins = [...PROTECTED_ADMIN_EMAILS];
  const fromEnv = (process.env.ADMIN_ALLOWLIST || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const bootstrapEmails = Array.from(
    new Set([...protectedAdmins, ...fromEnv]),
  );

  for (const adminEmail of bootstrapEmails) {
    let allow = await em.findOne(AdminAllowlist, {
      where: { email: adminEmail },
    });
    const locked = protectedAdmins.includes(adminEmail as (typeof PROTECTED_ADMIN_EMAILS)[number]);
    if (!allow) {
      allow = em.create(AdminAllowlist, {
        email: adminEmail,
        active: true,
        note: locked
          ? 'Kilitli yönetici (sistem)'
          : 'Seed bootstrap (ADMIN_ALLOWLIST)',
      });
      await em.save(allow);
      console.log('Admin allowlist (seed bootstrap):', adminEmail);
    } else if (locked) {
      allow.active = true;
      if (!allow.note) allow.note = 'Kilitli yönetici (sistem)';
      await em.save(allow);
    }
  }

  /** herbalurunleri.com / design vitrin kategorileri */
  const herbalCategories: {
    slug: string;
    name: string;
    description: string;
    sortOrder: number;
  }[] = [
    {
      slug: 'kilo-kontrolu',
      name: 'Aşağı - Yukarı Kilo Kontrolü',
      description: 'Formül 1, Formül 2 ve kilo yönetimi ürünleri',
      sortOrder: 1,
    },
    {
      slug: 'icecekler',
      name: 'İçecekler',
      description: 'Aloe, bitkisel çaylar ve aromalı içecek tozları',
      sortOrder: 2,
    },
    {
      slug: 'avantajli-setler',
      name: 'Setler',
      description: 'Hediyeli paketler ve avantajlı setler',
      sortOrder: 3,
    },
    {
      slug: 'takviye-edici',
      name: 'Takviye Edici',
      description: 'Vitamin, mineral ve destek ürünleri',
      sortOrder: 4,
    },
    {
      slug: 'sporcu-urunleri',
      name: 'Sporcu Ürünleri',
      description: 'Protein ve performans ürünleri',
      sortOrder: 5,
    },
    {
      slug: 'atistirmalik',
      name: 'Atıştırmalık',
      description: 'Pratik protein bar ve atıştırmalıklar',
      sortOrder: 6,
    },
    {
      slug: 'kisisel-bakim',
      name: 'Kişisel Bakım',
      description: 'SKIN ve Herbal Aloe bakım serisi',
      sortOrder: 7,
    },
    {
      slug: 'tanitim-urunleri',
      name: 'Tanıtım Ürünleri',
      description: 'Shaker ve tanıtım ürünleri',
      sortOrder: 8,
    },
  ];
  const herbalSlugs = new Set(herbalCategories.map((c) => c.slug));

  for (const row of herbalCategories) {
    let cat = await em.findOne(Category, { where: { slug: row.slug } });
    if (!cat) {
      cat = em.create(Category, { ...row, isActive: true });
      await em.save(cat);
      console.log('Category:', row.slug);
    } else {
      cat.isActive = true;
      cat.name = row.name;
      cat.description = row.description;
      cat.sortOrder = row.sortOrder;
      await em.save(cat);
    }
  }

  // Seed dışı eski kategorileri kapat
  const allCategories = await em.find(Category, {});
  for (const cat of allCategories) {
    if (!herbalSlugs.has(cat.slug) && cat.isActive) {
      cat.isActive = false;
      await em.save(cat);
      console.log('Category deactivated:', cat.slug);
    }
  }

  const catBySlug = async (slug: string) => {
    const c = await em.findOne(Category, { where: { slug } });
    if (!c) throw new Error(`Kategori yok: ${slug}`);
    return c;
  };
  const setCategory = await catBySlug('avantajli-setler');
  const kiloCategory = await catBySlug('kilo-kontrolu');
  const drinkCategory = await catBySlug('icecekler');
  const supplementCategory = await catBySlug('takviye-edici');
  const sportCategory = await catBySlug('sporcu-urunleri');
  const snackCategory = await catBySlug('atistirmalik');
  const careCategory = await catBySlug('kisisel-bakim');
  const promoCategory = await catBySlug('tanitim-urunleri');

  const demoProducts: Array<{
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    price: string;
    compareAt?: string;
    badge?: string;
    categoryId: string;
    kind: string;
    featured?: boolean;
    sku: string;
    weightLabel: string;
    flavorNotes?: string[];
  }> = [
    {
      slug: '2026-paket-1-shaker-hediyeli',
      name: '2026 Paket 1 - Shaker Hediyeli',
      shortDescription: 'Başlangıç seti · Shaker hediyeli',
      description:
        'Günlük beslenme programı için avantajlı başlangıç paketi. Shaker hediyesi ile birlikte.',
      price: '2990.00',
      compareAt: '3800.00',
      badge: 'Hediyeli',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-2026-1',
      weightLabel: 'Paket',
    },
    {
      slug: '2026-paket-2-shaker-hediyeli',
      name: '2026 Paket 2 - Shaker Hediyeli',
      shortDescription: 'Popüler set · Shaker hediyeli',
      description: 'Dengeli program için avantajlı paket. Shaker hediyeli.',
      price: '2990.00',
      compareAt: '3675.00',
      badge: 'Hediyeli',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-2026-2',
      weightLabel: 'Paket',
    },
    {
      slug: '2026-paket-3-shaker-hediyeli',
      name: '2026 Paket 3 - Shaker Hediyeli',
      shortDescription: 'Genişletilmiş set · Shaker hediyeli',
      description: 'Daha kapsamlı günlük destek paketi. Shaker hediyeli.',
      price: '3920.00',
      compareAt: '4500.00',
      badge: 'Hediyeli',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-2026-3',
      weightLabel: 'Paket',
    },
    {
      slug: 'kilo-alma-seti-shaker-hediyeli',
      name: 'Kilo Alma Seti Shaker Hediyeli',
      shortDescription: 'Kilo alma hedefi · Shaker hediyeli',
      description:
        'Kilo alma programına uygun avantajlı set. Shaker hediyesi ile.',
      price: '3100.00',
      compareAt: '4445.00',
      badge: 'Hediyeli',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-GAIN',
      weightLabel: 'Paket',
    },
    {
      slug: 'paket-1',
      name: 'Paket 1',
      shortDescription: 'En çok satan set',
      description: 'Başlangıç seviyesi avantajlı set.',
      price: '1850.00',
      compareAt: '2900.00',
      badge: 'Çok Satan',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-1',
      weightLabel: 'Paket',
    },
    {
      slug: 'formul-1-shake',
      name: 'Formül 1 Shake',
      shortDescription: 'Öğün yerine geçen protein shake',
      description:
        'Dengeli öğün desteği için Formül 1 shake. Hedefinize uygun programınızda kullanın.',
      price: '1890.00',
      compareAt: '2190.00',
      badge: 'Çok Satan',
      categoryId: kiloCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'F1-SHAKE',
      weightLabel: '550g',
      flavorNotes: ['Çikolata', 'Vanilya', 'Muz', 'Çilek'],
    },
    {
      slug: 'formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet',
      name: 'Formül 2 Vitamin ve Mineral Kompleks Kadınlar İçin 60 Tablet',
      shortDescription: 'Kadınlar için günlük vitamin-mineral',
      description: 'Günlük vitamin ve mineral desteği — kadın formülü.',
      price: '640.00',
      compareAt: '950.00',
      badge: 'İndirim',
      categoryId: supplementCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'F2-W-60',
      weightLabel: '60 tablet',
    },
    {
      slug: 'formul-2-vitamin-ve-mineral-kompleks-erkekler-icin-60-tablet',
      name: 'Formül 2 Vitamin ve Mineral Kompleks Erkekler İçin 60 Tablet',
      shortDescription: 'Erkekler için günlük vitamin-mineral',
      description: 'Günlük vitamin ve mineral desteği — erkek formülü.',
      price: '640.00',
      compareAt: '950.00',
      badge: 'İndirim',
      categoryId: supplementCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'F2-M-60',
      weightLabel: '60 tablet',
    },
    {
      slug: 'thermo-complete-90-tablet',
      name: 'Thermo Complete™ 90 tablet',
      shortDescription: 'Termojenik destek',
      description: 'Aktif yaşam ve kilo yönetimi programlarına destek.',
      price: '1180.00',
      compareAt: '1900.00',
      badge: 'İndirim',
      categoryId: kiloCategory.id,
      kind: 'supplement',
      featured: false,
      sku: 'THERMO-90',
      weightLabel: '90 tablet',
    },
    {
      slug: 'multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g',
      name: 'Multi-Fiber Lifli ve Aromalı İçecek Tozu Elma 204 g',
      shortDescription: 'Lifli aromalı içecek tozu',
      description: 'Elma aromalı lifli içecek tozu — günlük lif desteği.',
      price: '740.00',
      compareAt: '1900.00',
      badge: 'İndirim',
      categoryId: drinkCategory.id,
      kind: 'beverage',
      featured: true,
      sku: 'MF-APPLE-204',
      weightLabel: '204g',
    },
    {
      slug: 'herbal-aloe-konsantre-icecek-473-ml',
      name: 'Herbal Aloe Konsantre İçecek 473 ml',
      shortDescription: 'Aloe konsantre içecek',
      description: 'Herbal Aloe konsantre içecek — seyreltilerek tüketilir.',
      price: '950.00',
      compareAt: '1600.00',
      badge: 'İndirim',
      categoryId: drinkCategory.id,
      kind: 'beverage',
      featured: true,
      sku: 'ALOE-473',
      weightLabel: '473 ml',
    },
    {
      slug: 'bitkisel-konsantre-caylar-klasik-50-g',
      name: 'Bitkisel Konsantre Çaylar Klasik 50 g',
      shortDescription: 'Klasik bitkisel konsantre çay',
      description: 'Bitkisel konsantre çay — sıcak veya soğuk hazırlanır.',
      price: '830.00',
      compareAt: '1400.00',
      badge: 'İndirim',
      categoryId: drinkCategory.id,
      kind: 'herbal_tea',
      featured: true,
      sku: 'TEA-CLASSIC-50',
      weightLabel: '50g',
    },
    {
      slug: '2026-paket-4-shaker-hediyeli',
      name: '2026 Paket 4 - Shaker Hediyeli',
      shortDescription: 'Kapsamlı set · Shaker hediyeli',
      description: 'Geniş program seti. Shaker hediyesi dahil.',
      price: '3780.00',
      compareAt: '5480.00',
      badge: 'Hediyeli',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-2026-4',
      weightLabel: 'Paket',
    },
    {
      slug: '2026-paket-5-shaker-hediyeli',
      name: '2026 Paket 5 - Shaker Hediyeli',
      shortDescription: 'Premium set · Shaker hediyeli',
      description: 'Premium avantajlı paket. Shaker hediyesi dahil.',
      price: '4850.00',
      compareAt: '6400.00',
      badge: 'Hediyeli',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-2026-5',
      weightLabel: 'Paket',
    },
    {
      slug: 'paket-2',
      name: 'Paket 2',
      shortDescription: 'Popüler avantajlı set',
      description: 'Dengeli başlangıç seti.',
      price: '2990.00',
      compareAt: '4100.00',
      badge: 'Çok Satan',
      categoryId: setCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'PKG-2',
      weightLabel: 'Paket',
    },
    {
      slug: 'formul-1-besleyici-shake-karisimi-muz-aromali-550-g',
      name: 'Formül 1 Besleyici Shake Karışımı Muz Aromalı 550 g',
      shortDescription: 'Muz aromalı Formül 1',
      description: 'Öğün yerine geçen muz aromalı protein shake.',
      price: '1890.00',
      compareAt: '2190.00',
      badge: 'Çok Satan',
      categoryId: sportCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'F1-MUZ-550',
      weightLabel: '550g',
      flavorNotes: ['Muz'],
    },
    {
      slug: 'formul-1-besleyici-shake-karisimi-ahududu-ve-beyaz-cikolata-aromali-500gr',
      name: 'Formül 1 Ahududu & Beyaz Çikolata 500 g',
      shortDescription: 'Ahududu & beyaz çikolata',
      description: 'Spor ve kilo programları için aromalı Formül 1.',
      price: '1890.00',
      compareAt: '2190.00',
      categoryId: sportCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'F1-AHUDU-500',
      weightLabel: '500g',
      flavorNotes: ['Ahududu', 'Beyaz Çikolata'],
    },
    {
      slug: 'formul-1-besleyici-shake-karisimi-cikolata-aromali-500-g',
      name: 'Formül 1 Besleyici Shake Çikolata Aromalı 500 g',
      shortDescription: 'Çikolata aromalı Formül 1',
      description:
        'Pratik öğün / atıştırmalık desteği için çikolata aromalı Formül 1 shake.',
      price: '1890.00',
      compareAt: '2190.00',
      badge: 'Çok Satan',
      categoryId: snackCategory.id,
      kind: 'supplement',
      featured: true,
      sku: 'F1-CHOC-500',
      weightLabel: '500g',
      flavorNotes: ['Çikolata'],
    },
    {
      slug: 'hl-skin-besleyici-el-ve-vucut-losyonu-147-ml',
      name: 'HL/Skin Besleyici El ve Vücut Losyonu 147 ml',
      shortDescription: 'El & vücut losyonu',
      description: 'SKIN serisi besleyici el ve vücut losyonu.',
      price: '890.00',
      compareAt: '1200.00',
      categoryId: careCategory.id,
      kind: 'other',
      featured: true,
      sku: 'SKIN-LOT-147',
      weightLabel: '147 ml',
    },
    {
      slug: 'hl-skin-besleyici-goz-kremi-15-ml',
      name: 'HL/Skin Besleyici Göz Kremi 15 ml',
      shortDescription: 'Göz kremi',
      description: 'SKIN serisi besleyici göz kremi.',
      price: '980.00',
      compareAt: '1350.00',
      categoryId: careCategory.id,
      kind: 'other',
      featured: true,
      sku: 'SKIN-EYE-15',
      weightLabel: '15 ml',
    },
    {
      slug: 'hl-skin-yenileyici-jel-temizleyici-147-ml',
      name: 'HL/Skin Yenileyici Jel Temizleyici 147 ml',
      shortDescription: 'Jel temizleyici',
      description: 'SKIN serisi yenileyici jel temizleyici.',
      price: '760.00',
      compareAt: '990.00',
      categoryId: careCategory.id,
      kind: 'other',
      featured: false,
      sku: 'SKIN-GEL-147',
      weightLabel: '147 ml',
    },
    {
      slug: 'shaker-tekli',
      name: 'Shaker Tekli',
      shortDescription: 'Tanıtım shaker',
      description: 'Pratik shaker — shake hazırlığı için.',
      price: '120.00',
      compareAt: '250.00',
      badge: 'Tanıtım',
      categoryId: promoCategory.id,
      kind: 'other',
      featured: true,
      sku: 'SHAKER-1',
      weightLabel: 'Adet',
    },
  ];

  const keepSlugs = new Set(demoProducts.map((p) => p.slug));

  for (const row of demoProducts) {
    const imageUrl = herbalProductImage(row.slug) || apiStockImage('product-1');
    let product = await em.findOne(Product, { where: { slug: row.slug } });
    if (!product) {
      product = await em.save(
        em.create(Product, {
          slug: row.slug,
          name: row.name,
          description: row.description,
          shortDescription: row.shortDescription,
          basePrice: row.price,
          stock: 50,
          currency: 'TRY',
          isActive: true,
          isFeatured: Boolean(row.featured),
          badge: row.badge || (row.compareAt ? 'İndirim' : null),
          gallery: [],
          imageUrl,
          categoryId: row.categoryId,
          kind: row.kind,
          unit: 'adet',
          vatRate: '20.00',
          flavorNotes: row.flavorNotes || [],
        }),
      );
      console.log('Product:', row.slug);
    } else {
      product.name = row.name;
      product.description = row.description;
      product.shortDescription = row.shortDescription;
      product.basePrice = row.price;
      product.isActive = true;
      product.isFeatured = Boolean(row.featured);
      product.badge = row.badge || (row.compareAt ? 'İndirim' : null);
      product.categoryId = row.categoryId;
      product.kind = row.kind;
      if (row.flavorNotes?.length) product.flavorNotes = row.flavorNotes;
      // Her zaman yerel / doğru görsele çek (eski kahve stok URL’lerini temizle)
      product.imageUrl = imageUrl;
      await em.save(product);
      console.log('Product updated:', row.slug);
    }

    const variants = await em.find(ProductVariant, {
      where: { productId: product.id },
    });
    const variant = variants[0];
    if (!variant) {
      await em.save(
        em.create(ProductVariant, {
          productId: product.id,
          sku: row.sku,
          weightLabel: row.weightLabel,
          price: row.price,
          stock: 50,
          isActive: true,
        }),
      );
    } else {
      variant.sku = row.sku;
      variant.weightLabel = row.weightLabel;
      variant.price = row.price;
      variant.isActive = true;
      variant.stock = variant.stock || 50;
      await em.save(variant);
    }
  }

  const allProducts = await em.find(Product, {});
  for (const p of allProducts) {
    if (keepSlugs.has(p.slug)) continue;
    if (p.isActive || p.isFeatured) {
      p.isActive = false;
      p.isFeatured = false;
      await em.save(p);
      console.log('Product deactivated:', p.slug);
    }
  }

  for (const [slug, meta] of Object.entries(LEGAL_DEFAULTS)) {
    const exists = await em.findOne(LegalDocument, {
      where: { slug },
    });
    if (!exists) {
      await em.save(
        em.create(LegalDocument, {
          slug,
          title: meta.title,
          content: meta.content,
          version: '1.0',
          isPublished: true,
          publishedAt: new Date(),
          locale: 'tr',
        }),
      );
      console.log('Legal:', slug);
    } else if (
      !exists.content ||
      exists.content.includes('örnek içerik') ||
      /güncellenecek/i.test(exists.content) ||
      exists.content.includes('500 000 00 00') ||
      /Büşra Özberk \(Büşra Özberk \(Herbal Kapıda/i.test(exists.content) ||
      /Büşra Özberk \(Herbal Kapıda — Bağımsız Distribütör\) \(Bağımsız Distribütör\)/i.test(
        exists.content,
      )
    ) {
      exists.title = meta.title;
      exists.content = meta.content;
      exists.isPublished = true;
      exists.publishedAt = exists.publishedAt || new Date();
      await em.save(exists);
      console.log('Legal updated:', slug);
    }
  }

  const blogPosts: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImageUrl: string;
    authorName: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
    relatedProductSlugs: string[];
    relatedCategorySlugs: string[];
  }[] = [
    {
      slug: 'formul-1-shake-nasil-hazirlanir',
      title: 'Formül 1 Shake Nasıl Hazırlanır?',
      excerpt:
        'Porsiyon, sıvı seçimi ve zamanlama ile dengeli bir öğün desteği.',
      content: `<p>Formül 1, programınıza göre öğün yerine geçen protein shake olarak kullanılır. Shaker’a önce sıvı, sonra toz ekleyin; 20–30 sn çalkalayın.</p>
<p>Süt veya bitkisel içecek tercih edebilirsiniz. Hedefinize uygun porsiyon için koçunuzla görüşün.</p>`,
      coverImageUrl: apiStockImage('product-1'),
      authorName: 'Herbal Kapıda',
      tags: ['Formül 1', 'beslenme'],
      seoTitle: 'Formül 1 Shake Nasıl Hazırlanır?',
      seoDescription:
        'Formül 1 shake hazırlama: porsiyon, sıvı ve pratik ipuçları.',
      relatedProductSlugs: ['formul-1-shake', '2026-paket-1-shaker-hediyeli'],
      relatedCategorySlugs: ['kilo-kontrolu', 'avantajli-setler'],
    },
    {
      slug: 'gunluk-su-tuketimi-hedefleri',
      title: 'Günlük Su Tüketimi Hedefleri',
      excerpt:
        'Takip ekranından su kaydı tutun; sürdürülebilir alışkanlık oluşturun.',
      content: `<p>Yeterli su, enerji ve tokluk hissini destekler. Hesabım → Beslenme Takibi üzerinden gün boyu bardak/ml kaydı ekleyebilirsiniz.</p>
<p>Koçunuz onay kuyruğundan öğün ve ölçümlerinizi görür; motivasyon mesajları WhatsApp ile iletilebilir.</p>`,
      coverImageUrl: apiStockImage('blog'),
      authorName: 'Herbal Kapıda',
      tags: ['su', 'takip', 'wellness'],
      seoTitle: 'Günlük Su Tüketimi | Beslenme Takibi',
      seoDescription:
        'Su tüketimini nasıl takip edersiniz? Wellness paneli ipuçları.',
      relatedProductSlugs: [],
      relatedCategorySlugs: ['icecekler'],
    },
    {
      slug: 'avantajli-set-secim-rehberi',
      title: 'Avantajlı Set Seçerken Nelere Bakmalı?',
      excerpt:
        'Hedef, hediye içeriği ve program süresi — set seçiminde üç temel.',
      content: `<p>Başlangıç paketleri shaker ve Formül ürünlerini bir arada sunar. Kilo yönetimi, spor veya genel wellness hedefinize göre kategori seçin.</p>
<p>WhatsApp’tan ürün danışmanlığı alabilirsiniz — Herbal Kapıda.</p>`,
      coverImageUrl: apiStockImage('product-2'),
      authorName: 'Herbal Kapıda',
      tags: ['setler', 'rehber'],
      seoTitle: 'Avantajlı Set Seçim Rehberi',
      seoDescription:
        'Herbal Kapıda avantajlı set seçerken hedef, hediye ve program nasıl değerlendirilir?',
      relatedProductSlugs: ['2026-paket-1-shaker-hediyeli'],
      relatedCategorySlugs: ['avantajli-setler'],
    },
    {
      slug: 'sabah-rutininde-protein-shake',
      title: 'Sabah Rutininde Protein Shake',
      excerpt:
        'Yoğun günlerde pratik öğün: 5 dakikada hazır, tok tutan başlangıç.',
      content: `<p>Sabah acele edenler için Formül 1 shake, kahvaltıyı hızlandırır. Shaker’ı gece önceden hazır tutmak, alışkanlığı kolaylaştırır.</p>
<p>Yanına meyve veya az yağlı süt ekleyerek doygunluğu artırabilirsiniz. Programınızı koçunuzla kişiselleştirin.</p>`,
      coverImageUrl: apiStockImage('product-1'),
      authorName: 'Herbal Kapıda',
      tags: ['rutin', 'Formül 1', 'kahvaltı'],
      seoTitle: 'Sabah Rutininde Protein Shake',
      seoDescription:
        'Sabah protein shake rutini: hızlı hazırlık ve sürdürülebilir alışkanlık ipuçları.',
      relatedProductSlugs: ['formul-1-shake'],
      relatedCategorySlugs: ['kilo-kontrolu'],
    },
    {
      slug: 'kargo-ve-teslimat-sureci',
      title: 'Sipariş Sonrası Kargo Süreci',
      excerpt:
        'Ödeme onayı, paketleme ve takip kodu — adım adım ne beklemelisiniz?',
      content: `<p>Ödeme onayından sonra siparişler genelde 1–3 iş günü içinde kargoya verilir. Takip kodunu bildirim ve hesabınızdan görebilirsiniz.</p>
<p>Mağazadan teslim seçeneği varsa hazır olduğunda sizi bilgilendiririz. Sorularınız için WhatsApp hattımız açık.</p>`,
      coverImageUrl: apiStockImage('workshop'),
      authorName: 'Herbal Kapıda',
      tags: ['kargo', 'sipariş'],
      seoTitle: 'Sipariş ve Kargo Süreci',
      seoDescription:
        'Herbal Kapıda sipariş sonrası kargo ve takip süreci hakkında bilgilendirme.',
      relatedProductSlugs: [],
      relatedCategorySlugs: ['avantajli-setler'],
    },
    {
      slug: 'iade-ve-cayma-hakki-ozeti',
      title: 'İade ve Cayma Hakkı Özeti',
      excerpt:
        'Mesafeli satışta 14 gün — nasıl başvurulur, nelere dikkat edilir?',
      content: `<p>Tüketiciler mesafeli satışta cayma hakkını kullanabilir. Ürünlerin açılmamış / hijyen şartlarına uygun olması gerekir; ayrıntılar İptal ve İade sayfasındadır.</p>
<p>Başvuru için sipariş numaranız ve iletişim bilgileriniz yeterlidir. Koçluk desteği iade sürecinden bağımsızdır.</p>`,
      coverImageUrl: apiStockImage('ethos'),
      authorName: 'Herbal Kapıda',
      tags: ['iade', 'yasal'],
      seoTitle: 'İade ve Cayma Hakkı',
      seoDescription:
        '14 gün cayma hakkı ve iade başvurusu hakkında kısa özet.',
      relatedProductSlugs: [],
      relatedCategorySlugs: [],
    },
    {
      slug: 'yeni-baslayanlar-icin-ilk-hafta',
      title: 'Yeni Başlayanlar İçin İlk Hafta',
      excerpt:
        'Set aldınız — ilk 7 günde su, öğün ve takip nasıl kurulur?',
      content: `<p>İlk hafta hedefi “mükemmel diyet” değil, düzen kurmaktır. Her gün Formül 1 öğünü, su kaydı ve akşam kısa yürüyüş iyi bir başlangıçtır.</p>
<p>Hesabım → Beslenme Takibi’nden öğün fotoğrafı yükleyin; koçunuz onaylayıp yönlendirebilir.</p>`,
      coverImageUrl: apiStockImage('hero'),
      authorName: 'Herbal Kapıda',
      tags: ['başlangıç', 'takip', 'setler'],
      seoTitle: 'Yeni Başlayanlar İçin İlk Hafta',
      seoDescription:
        'Herbal Kapıda setiyle ilk hafta rutini: su, öğün ve koç takibi.',
      relatedProductSlugs: ['2026-paket-1-shaker-hediyeli'],
      relatedCategorySlugs: ['avantajli-setler'],
    },
  ];

  const keepBlogSlugs = new Set(blogPosts.map((p) => p.slug));
  for (const post of blogPosts) {
    const exists = await em.findOne(BlogPost, { where: { slug: post.slug } });
    if (!exists) {
      await em.save(
        em.create(BlogPost, {
          ...post,
          isPublished: true,
          publishedAt: new Date(),
          locale: 'tr',
        }),
      );
      console.log('Blog:', post.slug);
    } else {
      exists.title = post.title;
      exists.excerpt = post.excerpt;
      exists.content = post.content;
      exists.coverImageUrl = post.coverImageUrl;
      exists.authorName = post.authorName;
      exists.tags = post.tags;
      exists.seoTitle = post.seoTitle;
      exists.seoDescription = post.seoDescription;
      exists.relatedProductSlugs = post.relatedProductSlugs;
      exists.relatedCategorySlugs = post.relatedCategorySlugs;
      exists.isPublished = true;
      exists.publishedAt = exists.publishedAt || new Date();
      await em.save(exists);
      console.log('Blog updated:', post.slug);
    }
  }
  const oldBlogs = await em.find(BlogPost, {});
  for (const b of oldBlogs) {
    if (!keepBlogSlugs.has(b.slug) && b.isPublished) {
      b.isPublished = false;
      await em.save(b);
      console.log('Blog unpublished:', b.slug);
    }
  }

  const shippingProviders: {
    provider: ShippingProviderCode;
    displayName: string;
  }[] = [
    { provider: ShippingProviderCode.YURTICI, displayName: 'Yurtiçi Kargo' },
    {
      provider: ShippingProviderCode.KOLAY_GELSIN,
      displayName: 'Kolay Gelsin',
    },
    { provider: ShippingProviderCode.DHL, displayName: 'DHL' },
    { provider: ShippingProviderCode.SURAT, displayName: 'Sürat Kargo' },
    { provider: ShippingProviderCode.PTT, displayName: 'PTT Kargo' },
    { provider: ShippingProviderCode.HEPSIJET, displayName: 'HepsiJet' },
    {
      provider: ShippingProviderCode.TRENDYOL_EXPRESS,
      displayName: 'Trendyol Express',
    },
  ];

  for (const sp of shippingProviders) {
    const exists = await em.findOne(ShippingProviderConfig, {
      where: { provider: sp.provider },
    });
    if (!exists) {
      await em.save(
        em.create(ShippingProviderConfig, {
          provider: sp.provider,
          displayName: sp.displayName,
          isEnabled: sp.provider === ShippingProviderCode.DHL,
          credentials: {},
          settings: { fee: '89.90', estimatedDays: '2-5 gün' },
        }),
      );
      console.log('Shipping provider:', sp.provider);
    }
  }

  for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
    const exists = await em.findOne(SiteSetting, { where: { key } });
    if (!exists) {
      await em.save(
        em.create(SiteSetting, {
          key,
          value,
          group: key,
          description: `${key} site ayarları`,
        }),
      );
      console.log('Site setting:', key);
    } else if (key === 'brand') {
      const brand = exists.value || {};
      const defaults = value;
      let changed = false;
      for (const field of [
        'logoUrl',
        'distributorName',
        'distributorTitle',
        'distributorCode',
        'legalDisclaimer',
        'location',
      ]) {
        if (brand[field] === undefined || brand[field] === '') {
          brand[field] = defaults[field];
          changed = true;
        }
      }
      // Yanlış “Herbal Kapıda Nutrition” / karışık marka metinlerini düzelt
      if (
        typeof brand.legalDisclaimer === 'string' &&
        (/Herbal Kapıda Nutrition/i.test(brand.legalDisclaimer) ||
          /resmi Herbal Kapıda sitesi/i.test(brand.legalDisclaimer) ||
          /orijinal Herbal Kapıda ürün/i.test(brand.legalDisclaimer))
      ) {
        brand.legalDisclaimer = defaults.legalDisclaimer;
        changed = true;
      }
      if (
        typeof brand.tagline === 'string' &&
        (/Herbal Kapıda Nutrition/i.test(brand.tagline) ||
          /orijinal Herbal Kapıda ürün/i.test(brand.tagline))
      ) {
        brand.tagline = defaults.tagline;
        changed = true;
      }
      if (typeof brand.name === 'string' && brand.name.trim() === '') {
        brand.name = defaults.name;
        brand.slogan = defaults.slogan;
        brand.tagline = defaults.tagline;
        changed = true;
      }
      if (brand.name !== defaults.name) {
        brand.name = defaults.name;
        changed = true;
      }
      for (const staleField of ['distributorName', 'distributorTitle', 'name']) {
        const v = brand[staleField];
        if (
          typeof v === 'string' &&
          (/emine/i.test(v) ||
            /mehmet/i.test(v) ||
            /co[sş]/i.test(v) ||
            v === 'Herbal Kapıda')
        ) {
          if (staleField === 'distributorName' || /emine|mehmet|co[sş]/i.test(v)) {
            brand[staleField] = defaults[staleField];
            changed = true;
          }
        }
      }
      if (
        typeof brand.distributorName === 'string' &&
        (brand.distributorName === 'Herbal Kapıda' ||
          /mehmet|co[sş]|emine/i.test(brand.distributorName))
      ) {
        brand.distributorName = defaults.distributorName;
        changed = true;
      }
      // Logo her seed’de defaults ile senkron (telefon/görsel güncellemeleri)
      if (brand.logoUrl !== defaults.logoUrl) {
        brand.logoUrl = defaults.logoUrl;
        changed = true;
      }
      if (changed) {
        exists.value = brand;
        await em.save(exists);
        console.log('Site setting brand: updated');
      }
    } else if (key === 'contact') {
      const contact = { ...(exists.value || {}) };
      const defaults = value as Record<string, unknown>;
      let changed = false;
      const placeholders = [
        '',
        'Türkiye',
        'Türkiye — Adetepe Mahallesi 73 Sokak No 3 Daire 9 Buca Izmir',
        '+90 541 489 42 43',
        '+90 541 489 42 43',
      ];
      for (const field of [
        'address',
        'phone',
        'hours',
        'locationLabel',
        'email',
      ]) {
        const cur = contact[field];
        if (
          cur === undefined ||
          (typeof cur === 'string' && placeholders.includes(cur.trim()))
        ) {
          contact[field] = defaults[field];
          changed = true;
        }
      }
      if (changed) {
        exists.value = contact;
        await em.save(exists);
        console.log('Site setting contact: updated');
      }
    } else if (key === 'seo') {
      const seo = { ...(exists.value || {}) };
      const defaults = value as Record<string, unknown>;
      let changed = false;
      if (!seo.ogImage) {
        seo.ogImage = defaults.ogImage;
        changed = true;
      }
      if (changed) {
        exists.value = seo;
        await em.save(exists);
        console.log('Site setting seo: updated');
      }
    } else if (key === 'whatsapp') {
      const wa = { ...(exists.value || {}) } as Record<string, unknown>;
      const defaults = value as Record<string, unknown>;
      let changed = false;
      const phoneStr = typeof wa.phone === 'string' ? wa.phone : '';
      // Eski 505 WhatsApp / boş → contact.phone ile senkron (defaults.phone boş)
      if (
        !phoneStr ||
        /505\s*142\s*0710|905051420710/.test(phoneStr.replace(/\s/g, ''))
      ) {
        wa.phone = defaults.phone ?? '';
        changed = true;
      }
      if (
        typeof wa.greeting === 'string' &&
        /emine|mehmet|co[sş]/i.test(wa.greeting)
      ) {
        wa.greeting = defaults.greeting;
        changed = true;
      }
      if (changed) {
        exists.value = wa;
        await em.save(exists);
        console.log('Site setting whatsapp: updated');
      }
    } else if (key === 'promises') {
      const promises = { ...(exists.value || {}) } as Record<string, unknown>;
      const defaults = value as Record<string, unknown>;
      let changed = false;
      if (promises.returnDays === 30 || promises.returnDays == null) {
        promises.returnDays = defaults.returnDays ?? 14;
        changed = true;
      }
      for (const field of ['sameDayCutoff', 'sameDayShipping', 'freeCoaching']) {
        if (promises[field] === undefined) {
          promises[field] = defaults[field];
          changed = true;
        }
      }
      if (changed) {
        exists.value = promises;
        await em.save(exists);
        console.log('Site setting promises: updated');
      }
    } else if (key === 'legal' || key === 'footer' || key === 'membership') {
      const cur = { ...(exists.value || {}) } as Record<string, unknown>;
      const defaults = value as Record<string, unknown>;
      let changed = false;
      for (const [field, defVal] of Object.entries(defaults)) {
        if (field === 'translations') continue;
        const curVal = cur[field];
        if (
          typeof curVal === 'string' &&
          typeof defVal === 'string' &&
          (/Herbal Kapıda Nutrition/i.test(curVal) ||
            /orijinal Herbal Kapıda ürün/i.test(curVal) ||
            /resmi Herbal Kapıda sitesi/i.test(curVal) ||
            /Herbal Kapıda\s*üyeli/i.test(curVal) ||
            /myherbalkapida/i.test(curVal) ||
            /myHerbal Kapıda/i.test(curVal) ||
            (field === 'ctaUrl' && /herbalkapida/i.test(curVal)))
        ) {
          cur[field] = defVal;
          changed = true;
        } else if (curVal === undefined || curVal === '') {
          cur[field] = defVal;
          changed = true;
        }
      }
      if (key === 'membership') {
        const url = typeof cur.ctaUrl === 'string' ? cur.ctaUrl : '';
        if (!url || /herbalkapida/i.test(url) || !/^https?:\/\//i.test(url)) {
          cur.ctaUrl = defaults.ctaUrl || 'https://www.myherbalife.com';
          changed = true;
        }
        const label = typeof cur.ctaLabel === 'string' ? cur.ctaLabel : '';
        if (!label || /Herbal Kapıda\s*üyeli/i.test(label)) {
          cur.ctaLabel = defaults.ctaLabel;
          changed = true;
        }
      }
      if (changed) {
        exists.value = cur;
        await em.save(exists);
        console.log(`Site setting ${key}: branding cleaned`);
      }
    } else if (key === 'welcomePopup') {
      const popup = { ...(exists.value || {}) } as Record<string, unknown>;
      const defaults = value as Record<string, unknown>;
      let changed = false;
      for (const [field, defVal] of Object.entries(defaults)) {
        if (field === 'translations') continue;
        if (popup[field] === undefined || popup[field] === '') {
          popup[field] = defVal;
          changed = true;
        }
      }
      if (
        typeof popup.distributorName === 'string' &&
        /mehmet|co[sş]|emine/i.test(popup.distributorName)
      ) {
        popup.distributorName = defaults.distributorName;
        popup.headline = defaults.headline;
        popup.leftBody = defaults.leftBody;
        changed = true;
      }
      const defT = (defaults.translations || {}) as Record<
        string,
        Record<string, unknown>
      >;
      const curT = {
        ...((popup.translations || {}) as Record<
          string,
          Record<string, unknown>
        >),
      };
      for (const [loc, block] of Object.entries(defT)) {
        if (!block) continue;
        const prev = curT[loc] || {};
        const headline = typeof prev.headline === 'string' ? prev.headline : '';
        const needs =
          !headline ||
          /Bağımsız Distribütörü|MEVCUT MÜŞTERİ/i.test(headline);
        if (needs) {
          curT[loc] = { ...prev, ...block };
          changed = true;
        } else {
          curT[loc] = { ...block, ...prev };
        }
      }
      if (JSON.stringify(curT) !== JSON.stringify(popup.translations || {})) {
        popup.translations = curT;
        changed = true;
      }
      if (changed) {
        exists.value = popup;
        await em.save(exists);
        console.log('Site setting welcomePopup: updated');
      }
    } else if (key === 'navigation') {
      const nav = (exists.value || {}) as {
        header?: { href: string; label: string }[];
        footerNav?: { href: string; label: string }[];
        footerLegal?: { href: string; label: string }[];
      };
      let changed = false;
      const ensureLinks = (
        list: { href: string; label: string }[] | undefined,
        extras: { href: string; label: string }[],
      ) => {
        if (!list) return list;
        for (const extra of extras) {
          if (!list.some((l) => l.href === extra.href)) {
            list.push(extra);
            changed = true;
          }
        }
        return list;
      };
      // Header’ı tekrarsız varsayılana çek (utility / kategori ile çakışmasın)
      const desiredHeader = [
        { href: '/urunler', label: 'Ürünler' },
        { href: '/hakkimizda', label: 'Hakkımızda' },
        { href: '/blog', label: 'Yazılar' },
        { href: '/medya', label: 'Medya' },
        { href: '/sss', label: 'SSS' },
        { href: '/yorum', label: 'Yorumlar' },
        { href: '/iletisim', label: 'İletişim' },
      ];
      const headerKey = (nav.header ?? []).map((l) => l.href).join('|');
      const desiredKey = desiredHeader.map((l) => l.href).join('|');
      if (headerKey !== desiredKey) {
        nav.header = desiredHeader;
        changed = true;
      }
      nav.footerNav =
        ensureLinks(nav.footerNav ?? [], [
          { href: '/blog', label: 'Yazılar' },
          { href: '/medya', label: 'Medya' },
          { href: '/sss', label: 'SSS' },
          { href: '/odeme-bildirimi', label: 'Ödeme Bildirimi' },
          { href: '/banka-hesaplari', label: 'Banka Hesapları' },
          { href: '/yorum', label: 'Google Yorum' },
          { href: '/hesabim/favoriler', label: 'Favorilerim' },
          { href: '/hesabim/takip', label: 'Beslenme Takibi' },
          { href: '/hesabim/rapor', label: 'Gelişim Raporu' },
        ]) ?? [];
      for (const list of [nav.header, nav.footerNav]) {
        if (!list) continue;
        for (const link of list) {
          if (link.href === '/takip/ornek') {
            link.href = '/takip';
            changed = true;
          }
          if (link.href === '/siparis-sorgula' && link.label === 'Sipariş') {
            link.label = 'Sipariş Sorgula';
            changed = true;
          }
          if (link.href === '/blog' && link.label === 'Blog') {
            link.label = 'Yazılar';
            changed = true;
          }
        }
      }
      if (nav.footerLegal) {
        const extras = [
          { href: '/teslimat', label: 'Teslimat ve Kargo' },
          {
            href: '/musteri-memnuniyeti',
            label: 'Müşteri Memnuniyeti',
          },
          { href: '/guvenli-alisveris', label: 'Güvenli Alışveriş' },
        ];
        for (const extra of extras) {
          if (!nav.footerLegal.some((l) => l.href === extra.href)) {
            const idx = nav.footerLegal.findIndex(
              (l) => l.href === '/iptal-iade',
            );
            nav.footerLegal.splice(
              idx >= 0 ? idx + 1 : nav.footerLegal.length,
              0,
              extra,
            );
            changed = true;
          }
        }
        for (const link of nav.footerLegal) {
          if (
            link.href === '/cerez-politikasi' &&
            link.label === 'Çerez Politikası'
          ) {
            link.label = 'Çerez Kullanımı';
            changed = true;
          }
          if (link.href === '/iptal-iade' && link.label.includes('İptal')) {
            link.label = 'İade Politikası';
            changed = true;
          }
        }
      }
      if (changed) {
        exists.value = nav;
        await em.save(exists);
        console.log('Site setting navigation: updated');
      }
    }
  }

  for (const section of DEFAULT_HOME_SECTIONS) {
    const exists = await em.findOne(ContentSection, {
      where: { page: section.page, sectionKey: section.sectionKey },
    });
    if (!exists) {
      await em.save(
        em.create(ContentSection, {
          page: section.page,
          sectionKey: section.sectionKey,
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder,
          isPublished: true,
        }),
      );
      console.log('Content section:', section.page, section.sectionKey);
    } else {
      const raw = JSON.stringify(exists.content || {});
      const looksStale =
        /unsplash\.com/i.test(raw) ||
        /Herbal Kapıda Nutrition/i.test(raw) ||
        /orijinal Herbal Kapıda ürün/i.test(raw);
      if (looksStale) {
        exists.content = section.content;
        exists.title = section.title;
        exists.isPublished = true;
        await em.save(exists);
        console.log(
          'Content section refreshed:',
          section.page,
          section.sectionKey,
        );
      }
    }
  }

  await migrateCmsI18n(em);

  const welcomeCoupon = await em.findOne(Coupon, {
    where: { code: 'HOSGELDIN10' },
  });
  if (!welcomeCoupon) {
    await em.save(
      em.create(Coupon, {
        code: 'HOSGELDIN10',
        title: 'Hoş geldin %10',
        type: CouponType.PERCENT,
        value: '10',
        minSubtotal: '0',
        maxUses: null,
        usedCount: 0,
        firstOrderOnly: true,
        startsAt: null,
        endsAt: null,
        isActive: true,
      }),
    );
    console.log('Coupon: HOSGELDIN10');
  }

  const cashDefaults: { name: string; kind: CashAccountKind }[] = [
    { name: 'Nakit Kasa', kind: CashAccountKind.CASH },
    { name: 'Banka', kind: CashAccountKind.BANK },
    { name: 'PayTR', kind: CashAccountKind.PAYTR },
    { name: 'POS / ÖKC Kart', kind: CashAccountKind.POS },
  ];
  for (const row of cashDefaults) {
    const exists = await em.findOne(CashAccount, { where: { kind: row.kind } });
    if (!exists) {
      await em.save(em.create(CashAccount, row));
      console.log('Cash account:', row.name);
    }
  }

  const settings = await em.findOne(AccountingSettings, { where: {} });
  if (!settings) {
    await em.save(
      em.create(AccountingSettings, {
        companyTitle: 'Herbal Kapıda — Bağımsız Distribütör',
        city: 'Türkiye',
      }),
    );
    console.log('Accounting settings');
  }

  const staffEmail = (process.env.OPS_STAFF_EMAIL || '').trim().toLowerCase();
  const staffPassword = process.env.OPS_STAFF_PASSWORD || '';
  if (staffEmail && staffPassword) {
    let staff = await em.findOne(User, { where: { email: staffEmail } });
    if (!staff) {
      staff = em.create(User, {
        email: staffEmail,
        passwordHash: await bcrypt.hash(staffPassword, 12),
        firstName: 'Ops',
        lastName: 'Staff',
        provider: AuthProvider.LOCAL,
        role: UserRole.STAFF,
        emailVerified: true,
        isActive: true,
      });
      await em.save(staff);
      console.log('Ops staff:', staffEmail);
    }
  }

  // ── Demo müşteri + sipariş + wellness (sunum) ──
  const demoEmail = 'demo@herbalurunleri.local';
  let demoUser = await em.findOne(User, { where: { email: demoEmail } });
  if (!demoUser) {
    demoUser = await em.save(
      em.create(User, {
        email: demoEmail,
        passwordHash: await bcrypt.hash('Demo1234!', 12),
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        phone: '+90 532 000 00 01',
        provider: AuthProvider.LOCAL,
        role: UserRole.CUSTOMER,
        emailVerified: true,
        isActive: true,
      }),
    );
    console.log('Demo customer:', demoEmail, '(şifre: Demo1234!)');
  }

  // Demo ürün yorumları (öne çıkan ürünler)
  const reviewAuthors: {
    email: string;
    firstName: string;
    lastName: string;
  }[] = [
    { email: 'yorumcu1@herbalurunleri.local', firstName: 'Selin', lastName: 'A.' },
    { email: 'yorumcu2@herbalurunleri.local', firstName: 'Can', lastName: 'D.' },
    { email: 'yorumcu3@herbalurunleri.local', firstName: 'Zeynep', lastName: 'K.' },
    { email: 'yorumcu4@herbalurunleri.local', firstName: 'Burak', lastName: 'T.' },
  ];
  const reviewUsers: User[] = [];
  for (const a of reviewAuthors) {
    let u = await em.findOne(User, { where: { email: a.email } });
    if (!u) {
      u = await em.save(
        em.create(User, {
          email: a.email,
          passwordHash: await bcrypt.hash('Demo1234!', 12),
          firstName: a.firstName,
          lastName: a.lastName,
          provider: AuthProvider.LOCAL,
          role: UserRole.CUSTOMER,
          emailVerified: true,
          isActive: true,
        }),
      );
    }
    reviewUsers.push(u);
  }

  const reviewSeeds: {
    productSlug: string;
    reviews: { userIdx: number; rating: number; title: string; body: string }[];
  }[] = [
    {
      productSlug: '2026-paket-1-shaker-hediyeli',
      reviews: [
        {
          userIdx: 0,
          rating: 5,
          title: 'Başlangıç için ideal',
          body: 'Shaker hediyeli setle başladım, takip mesajları motivasyonumu yüksek tuttu. Kargo hızlıydı.',
        },
        {
          userIdx: 1,
          rating: 5,
          title: 'Net paket önerisi',
          body: 'WhatsApp’tan danışınca hedefime göre set önerdiler. Ürünler orijinal, paketleme özenli.',
        },
        {
          userIdx: 2,
          rating: 4,
          title: 'Tat ve doygunluk',
          body: 'Formül 1’i her sabah kullanıyorum. İlk hafta alışmak biraz zaman aldı ama rutin oturdu.',
        },
      ],
    },
    {
      productSlug: 'formul-1-shake',
      reviews: [
        {
          userIdx: 1,
          rating: 5,
          title: 'Sabah rutini',
          body: 'İşe gitmeden önce 5 dakikada hazırlanıyor. Sütle daha doyurucu oluyor.',
        },
        {
          userIdx: 3,
          rating: 4,
          title: 'Pratik öğün',
          body: 'Öğle yerine kullandığım günler daha tok hissediyorum. Koç desteği fark yaratıyor.',
        },
      ],
    },
    {
      productSlug: '2026-paket-2-shaker-hediyeli',
      reviews: [
        {
          userIdx: 2,
          rating: 5,
          title: 'Hediyeli set memnuniyeti',
          body: 'Karıştırıcı hediyesi işime yaradı. Site üzerinden sipariş ve takip kolay.',
        },
        {
          userIdx: 0,
          rating: 5,
          title: 'Tekrar sipariş',
          body: 'İkinci setimi aldım. Fiyat/performans ve kişisel destek için tercih ediyorum.',
        },
      ],
    },
  ];

  for (const block of reviewSeeds) {
    const product = await em.findOne(Product, {
      where: { slug: block.productSlug },
    });
    if (!product) continue;
    for (const r of block.reviews) {
      const user = reviewUsers[r.userIdx];
      if (!user) continue;
      const existing = await em.findOne(ProductReview, {
        where: { productId: product.id, userId: user.id },
      });
      if (existing) continue;
      await em.save(
        em.create(ProductReview, {
          productId: product.id,
          userId: user.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          authorName: `${user.firstName} ${user.lastName}`.trim(),
          isApproved: true,
          isVerifiedPurchase: true,
        }),
      );
    }
    const raw = await em
      .createQueryBuilder(ProductReview, 'r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.product_id = :pid', { pid: product.id })
      .andWhere('r.is_approved = true')
      .getRawOne<{ avg: string; count: string }>();
    const count = Number(raw?.count || 0);
    product.ratingAvg = count ? Number(raw?.avg || 0).toFixed(2) : '0.00';
    product.ratingCount = count;
    await em.save(product);
  }
  console.log('Demo product reviews seeded');

  const paket = await em.findOne(Product, {
    where: { slug: '2026-paket-1-shaker-hediyeli' },
  });
  const paketVariant = paket
    ? (
        await em.find(ProductVariant, {
          where: { productId: paket.id },
        })
      )[0]
    : null;

  const demoOrderSpecs: {
    orderNumber: string;
    status: OrderStatus;
    total: string;
  }[] = [
    {
      orderNumber: 'DEMO-2026-001',
      status: OrderStatus.PAID,
      total: '2990.00',
    },
    {
      orderNumber: 'DEMO-2026-002',
      status: OrderStatus.PROCESSING,
      total: '1890.00',
    },
  ];

  for (const spec of demoOrderSpecs) {
    let order = await em.findOne(Order, {
      where: { orderNumber: spec.orderNumber },
    });
    if (order) continue;
    order = await em.save(
      em.create(Order, {
        orderNumber: spec.orderNumber,
        userId: demoUser.id,
        status: spec.status,
        customerEmail: demoEmail,
        customerName: 'Ayşe Yılmaz',
        customerPhone: '+90 532 000 00 01',
        shippingAddress: {
          fullName: 'Ayşe Yılmaz',
          phone: '+90 532 000 00 01',
          addressLine: 'Örnek Mah. Demo Cad. No:1',
          neighborhood: 'Örnek Mah.',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710',
          country: 'TR',
        },
        billingAddress: null,
        subtotal: spec.total,
        shippingFee: '0.00',
        discountAmount: '0.00',
        taxAmount: '0.00',
        total: spec.total,
        currency: 'TRY',
        notes: 'Sunum demo siparişi',
        stockDecremented: false,
      }),
    );
    if (paket && paketVariant) {
      await em.save(
        em.create(OrderItem, {
          orderId: order.id,
          productId: paket.id,
          variantId: paketVariant.id,
          productName: paket.name,
          variantLabel: paketVariant.weightLabel,
          quantity: 1,
          unitPrice: spec.total,
          lineTotal: spec.total,
        }),
      );
    }
    await em.save(
      em.create(Payment, {
        orderId: order.id,
        provider: 'paytr',
        status: PaymentStatus.SUCCESS,
        amount: spec.total,
        currency: 'TRY',
        conversationId: `demo-${spec.orderNumber}`,
        paymentId: `demo-pay-${spec.orderNumber}`,
        rawResponse: { mock: true, demo: true },
      }),
    );
    console.log('Demo order:', spec.orderNumber);
  }

  const today = new Date();
  const isoDate = (d: Date) => d.toISOString().slice(0, 10);
  const d0 = isoDate(today);
  const d1 = isoDate(new Date(today.getTime() - 86400000));
  const d2 = isoDate(new Date(today.getTime() - 2 * 86400000));

  const waterExists = await em.findOne(WellnessWaterLog, {
    where: { userId: demoUser.id, logDate: d0 },
  });
  if (!waterExists) {
    for (const [date, ml] of [
      [d0, 1500],
      [d1, 2000],
      [d2, 1750],
    ] as const) {
      await em.save(
        em.create(WellnessWaterLog, {
          userId: demoUser.id,
          logDate: date,
          amountMl: ml,
        }),
      );
    }
    console.log('Demo wellness water logs');
  }

  const mealExists = await em.findOne(WellnessMealLog, {
    where: { userId: demoUser.id, logDate: d0 },
  });
  if (!mealExists) {
    await em.save(
      em.create(WellnessMealLog, {
        userId: demoUser.id,
        logDate: d0,
        mealType: 'breakfast',
        note: 'Formül 1 shake + meyve',
        photoUrl: null,
        status: WellnessApprovalStatus.PENDING,
      }),
    );
    await em.save(
      em.create(WellnessMealLog, {
        userId: demoUser.id,
        logDate: d1,
        mealType: 'lunch',
        note: 'Protein öğünü',
        photoUrl: null,
        status: WellnessApprovalStatus.APPROVED,
        coachNote: 'Harika ilerleme!',
      }),
    );
    console.log('Demo wellness meal logs');
  }

  const measExists = await em.findOne(WellnessMeasurement, {
    where: { userId: demoUser.id, measuredAt: d0 },
  });
  if (!measExists) {
    await em.save(
      em.create(WellnessMeasurement, {
        userId: demoUser.id,
        measuredAt: d2,
        weightKg: 72.5,
        waistCm: 78,
        hipCm: 98,
        note: 'Başlangıç ölçümü',
        status: WellnessApprovalStatus.APPROVED,
      }),
    );
    await em.save(
      em.create(WellnessMeasurement, {
        userId: demoUser.id,
        measuredAt: d0,
        weightKg: 71.8,
        waistCm: 77,
        hipCm: 97,
        note: 'Haftalık kontrol',
        status: WellnessApprovalStatus.PENDING,
      }),
    );
    console.log('Demo wellness measurements');
  }

  await migrateI18nContent(em);

  console.log('Seed tamamlandı.');
  await AppDataSource.destroy();
}

seed().catch(async (err) => {
  console.error(err);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
