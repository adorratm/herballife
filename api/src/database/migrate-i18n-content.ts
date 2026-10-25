import type { EntityManager } from 'typeorm';
import { Category } from '@entities/category.entity';
import { Product } from '@entities/product.entity';
import { BlogPost } from '@entities/blog-post.entity';
import { Campaign } from '@entities/campaign.entity';
import type {
  BlogTranslations,
  CampaignTranslations,
  CategoryTranslations,
  MandatoryLocale,
  ProductTranslations,
} from '@common/catalog/localization.types';
import { MANDATORY_LOCALES } from '@common/catalog/localization.types';

type TextPack = Record<MandatoryLocale, string>;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function uniqueLocaleSlug(
  base: string,
  locale: MandatoryLocale,
  used: Set<string>,
): string {
  let slug = slugify(base);
  if (!slug) slug = `item-${locale}`;
  if (used.has(slug)) slug = `${slug}-${locale}`;
  used.add(slug);
  return slug;
}

function assignProductTranslationSlugs(
  product: Product,
  translations: ProductTranslations,
): ProductTranslations {
  const used = new Set<string>([product.slug.toLowerCase()]);
  const out: ProductTranslations = { ...translations };
  for (const loc of MANDATORY_LOCALES) {
    const block = out[loc];
    if (!block) continue;
    if (!block.slug?.trim()) {
      block.slug = uniqueLocaleSlug(block.name || product.name, loc, used);
    } else {
      used.add(block.slug.trim().toLowerCase());
    }
  }
  return out;
}

function assignCategoryTranslationSlugs(
  category: Category,
  translations: CategoryTranslations,
): CategoryTranslations {
  const used = new Set<string>([category.slug.toLowerCase()]);
  const out: CategoryTranslations = { ...translations };
  for (const loc of MANDATORY_LOCALES) {
    const block = out[loc];
    if (!block) continue;
    if (!block.slug?.trim()) {
      block.slug = uniqueLocaleSlug(block.name || category.name, loc, used);
    } else {
      used.add(block.slug.trim().toLowerCase());
    }
  }
  return out;
}

function assignBlogTranslationSlugs(
  post: BlogPost,
  translations: BlogTranslations,
): BlogTranslations {
  const used = new Set<string>([post.slug.toLowerCase()]);
  const out: BlogTranslations = { ...translations };
  for (const loc of MANDATORY_LOCALES) {
    const block = out[loc];
    if (!block) continue;
    if (!block.slug?.trim()) {
      block.slug = uniqueLocaleSlug(block.title || post.title, loc, used);
    } else {
      used.add(block.slug.trim().toLowerCase());
    }
  }
  return out;
}

function pack(
  en: string,
  de: string,
  fr: string,
  es: string,
): TextPack {
  return { en, de, fr, es };
}

const CATEGORY_I18N: Record<
  string,
  { name: TextPack; description: TextPack }
> = {
  'kilo-kontrolu': {
    name: pack(
      'Weight Management',
      'Gewichtskontrolle',
      'Gestion du poids',
      'Control de peso',
    ),
    description: pack(
      'Formula 1, Formula 2 and weight management products',
      'Formel 1, Formel 2 und Produkte zur Gewichtskontrolle',
      'Formule 1, Formule 2 et produits de gestion du poids',
      'Fórmula 1, Fórmula 2 y productos de control de peso',
    ),
  },
  icecekler: {
    name: pack('Beverages', 'Getränke', 'Boissons', 'Bebidas'),
    description: pack(
      'Aloe drinks, herbal teas and flavored beverage powders',
      'Aloe-Getränke, Kräutertees und aromatisierte Getränkepulver',
      'Boissons à l’aloe, tisanes et poudres aromatisées',
      'Bebidas de aloe, infusiones y polvos aromatizados',
    ),
  },
  'avantajli-setler': {
    name: pack('Bundles', 'Sets', 'Packs', 'Packs'),
    description: pack(
      'Gift bundles and value starter packs',
      'Geschenksets und vorteilhafte Starterpakete',
      'Coffrets cadeaux et packs avantageux',
      'Packs con regalo y sets ventajosos',
    ),
  },
  'takviye-edici': {
    name: pack('Supplements', 'Nahrungsergänzung', 'Compléments', 'Suplementos'),
    description: pack(
      'Vitamins, minerals and daily support products',
      'Vitamine, Mineralstoffe und Unterstützungsprodukte',
      'Vitamines, minéraux et produits de soutien',
      'Vitaminas, minerales y productos de apoyo',
    ),
  },
  'sporcu-urunleri': {
    name: pack(
      'Sports Nutrition',
      'Sportprodukte',
      'Nutrition sportive',
      'Nutrición deportiva',
    ),
    description: pack(
      'Protein and performance products',
      'Protein- und Leistungsprodukte',
      'Produits protéinés et performance',
      'Productos de proteína y rendimiento',
    ),
  },
  atistirmalik: {
    name: pack('Snacks', 'Snacks', 'Collations', 'Snacks'),
    description: pack(
      'Protein bars and practical snacks',
      'Proteinriegel und praktische Snacks',
      'Barres protéinées et collations pratiques',
      'Barras de proteína y snacks prácticos',
    ),
  },
  'kisisel-bakim': {
    name: pack('Personal Care', 'Körperpflege', 'Soins personnels', 'Cuidado personal'),
    description: pack(
      'SKIN and Herbal Aloe care range',
      'SKIN- und Herbal-Aloe-Pflegeserie',
      'Gamme de soins SKIN et Herbal Aloe',
      'Línea de cuidado SKIN y Herbal Aloe',
    ),
  },
  'tanitim-urunleri': {
    name: pack('Promo Items', 'Werbematerial', 'Articles promo', 'Artículos promo'),
    description: pack(
      'Shakers and promotional items',
      'Shaker und Werbeartikel',
      'Shakers et articles promotionnels',
      'Shakers y artículos promocionales',
    ),
  },
};

const PRODUCT_I18N: Record<
  string,
  {
    name: TextPack;
    shortDescription: TextPack;
    description: TextPack;
  }
> = {
  '2026-paket-1-shaker-hediyeli': {
    name: pack(
      '2026 Pack 1 — Free Shaker',
      '2026 Paket 1 — Gratis Shaker',
      'Pack 2026 n°1 — Shaker offert',
      'Pack 2026 1 — Shaker de regalo',
    ),
    shortDescription: pack(
      'Starter bundle · Free shaker included',
      'Starter-Set · Gratis Shaker',
      'Pack débutant · Shaker inclus',
      'Pack inicial · Shaker incluido',
    ),
    description: pack(
      'Advantageous starter pack for your daily nutrition program. Includes a free shaker.',
      'Vorteilhaftes Starterpaket für Ihr Tagesprogramm. Gratis Shaker inklusive.',
      'Pack de démarrage avantageux pour votre programme quotidien. Shaker offert.',
      'Pack inicial ventajoso para su programa diario. Shaker de regalo incluido.',
    ),
  },
  'formul-1-shake': {
    name: pack(
      'Formula 1 Nutritional Shake Mix',
      'Formel 1 Shake-Mischung',
      'Mélange shake Formule 1',
      'Mezcla batido Fórmula 1',
    ),
    shortDescription: pack(
      'Meal replacement shake',
      'Mahlzeitenersatz-Shake',
      'Shake substitut de repas',
      'Batido sustitutivo',
    ),
    description: pack(
      'Balanced protein shake to support your meal plan when prepared as directed.',
      'Ausgewogener Protein-Shake zur Unterstützung Ihres Ernährungsplans.',
      'Shake protéiné équilibré pour accompagner votre plan de repas.',
      'Batido proteico equilibrado para apoyar su plan de comidas.',
    ),
  },
  'shaker-tekli': {
    name: pack('Single Shaker', 'Einzel-Shaker', 'Shaker unitaire', 'Shaker individual'),
    shortDescription: pack(
      'Promotional shaker',
      'Werbeshaker',
      'Shaker promotionnel',
      'Shaker promocional',
    ),
    description: pack(
      'Handy shaker for preparing your shakes on the go.',
      'Praktischer Shaker zur Zubereitung unterwegs.',
      'Shaker pratique pour préparer vos shakes partout.',
      'Shaker práctico para preparar batidos donde vaya.',
    ),
  },
};

function hasMandatoryProductTranslations(
  translations: ProductTranslations | null | undefined,
): boolean {
  if (!translations) return false;
  return MANDATORY_LOCALES.every((loc) => {
    const b = translations[loc];
    return Boolean(b?.name?.trim() && b?.description?.trim());
  });
}

function buildProductTranslations(product: Product): ProductTranslations {
  const known = PRODUCT_I18N[product.slug];
  if (known) {
    const out: ProductTranslations = {};
    const used = new Set<string>([product.slug.toLowerCase()]);
    for (const loc of MANDATORY_LOCALES) {
      out[loc] = {
        name: known.name[loc],
        shortDescription: known.shortDescription[loc],
        description: known.description[loc],
        slug: uniqueLocaleSlug(known.name[loc], loc, used),
      };
    }
    return out;
  }
  const short = product.shortDescription?.trim() || product.name;
  const desc = product.description?.trim() || product.name;
  const out: ProductTranslations = {};
  for (const loc of MANDATORY_LOCALES) {
    const prefix =
      loc === 'en' ? '' : loc === 'de' ? '[DE] ' : loc === 'fr' ? '[FR] ' : '[ES] ';
    const name =
      loc === 'en'
        ? product.name.replace(/Formül/g, 'Formula').replace(/Paket/g, 'Pack')
        : `${prefix}${product.name}`;
    out[loc] = {
      name,
      shortDescription:
        loc === 'en'
          ? short.replace(/Formül/g, 'Formula')
          : `${prefix}${short}`,
      description:
        loc === 'en'
          ? desc.slice(0, 500)
          : `${prefix}${desc.slice(0, 480)}`,
    };
  }
  return assignProductTranslationSlugs(product, out);
}

function buildCategoryTranslations(category: Category): CategoryTranslations {
  const known = CATEGORY_I18N[category.slug];
  if (known) {
    const out: CategoryTranslations = {};
    const used = new Set<string>([category.slug.toLowerCase()]);
    for (const loc of MANDATORY_LOCALES) {
      out[loc] = {
        name: known.name[loc],
        description: known.description[loc],
        slug: uniqueLocaleSlug(known.name[loc], loc, used),
      };
    }
    return out;
  }
  const out: CategoryTranslations = {};
  for (const loc of MANDATORY_LOCALES) {
    const prefix =
      loc === 'en' ? '' : loc === 'de' ? '[DE] ' : loc === 'fr' ? '[FR] ' : '[ES] ';
    const name = loc === 'en' ? category.name : `${prefix}${category.name}`;
    out[loc] = {
      name,
      description:
        loc === 'en'
          ? category.description || category.name
          : `${prefix}${category.description || category.name}`,
    };
  }
  return assignCategoryTranslationSlugs(category, out);
}

const BLOG_I18N: Record<
  string,
  {
    title: TextPack;
    excerpt: TextPack;
    content: TextPack;
    seoTitle: TextPack;
    seoDescription: TextPack;
  }
> = {
  'formul-1-shake-nasil-hazirlanir': {
    title: pack(
      'How to Prepare a Formula 1 Shake',
      'Formel-1-Shake zubereiten',
      'Préparer un shake Formule 1',
      'Cómo preparar un batido Fórmula 1',
    ),
    excerpt: pack(
      'Portion size, liquid choice and timing for a balanced meal support.',
      'Portionsgröße, Flüssigkeit und Timing für ausgewogene Mahlzeiten.',
      'Portion, liquide et timing pour un repas équilibré.',
      'Porción, líquido y momento para una comida equilibrada.',
    ),
    content: pack(
      '<p>Formula 1 is used as a meal-replacement protein shake. Add liquid first, then powder; shake 20–30 seconds.</p><p>Use milk or plant-based drinks. Adjust portions with your coach.</p>',
      '<p>Formel 1 dient als Mahlzeitenersatz-Shake. Zuerst Flüssigkeit, dann Pulver; 20–30 Sek. schütteln.</p>',
      '<p>La Formule 1 remplace un repas. Liquide d’abord, puis poudre; secouez 20–30 secondes.</p>',
      '<p>Fórmula 1 sustituye una comida. Líquido primero, luego polvo; agite 20–30 segundos.</p>',
    ),
    seoTitle: pack(
      'How to Prepare Formula 1 Shake',
      'Formel 1 Shake Anleitung',
      'Préparation shake Formule 1',
      'Preparación batido Fórmula 1',
    ),
    seoDescription: pack(
      'Formula 1 shake prep: portions, liquids and practical tips.',
      'Formel-1-Shake: Portionen, Flüssigkeit und Tipps.',
      'Shake Formule 1 : portions, liquides et conseils.',
      'Batido Fórmula 1: porciones, líquidos y consejos.',
    ),
  },
  'gunluk-su-tuketimi-hedefleri': {
    title: pack(
      'Daily Water Intake Goals',
      'Tägliche Wasserziele',
      'Objectifs d’hydratation',
      'Metas de hidratación diaria',
    ),
    excerpt: pack(
      'Track water in the app and build sustainable habits.',
      'Wasser in der App tracken und Gewohnheiten aufbauen.',
      'Suivez l’eau dans l’app et créez des habitudes durables.',
      'Registre agua en la app y cree hábitos sostenibles.',
    ),
    content: pack(
      '<p>Enough water supports energy and satiety. Log glasses from My Account → Wellness.</p>',
      '<p>Ausreichend Wasser unterstützt Energie und Sättigung. Tragen Sie es unter Mein Konto → Wellness ein.</p>',
      '<p>Une bonne hydratation soutient énergie et satiété. Enregistrez-la dans Mon compte → Wellness.</p>',
      '<p>Beber suficiente apoya energía y saciedad. Regístrelo en Mi cuenta → Wellness.</p>',
    ),
    seoTitle: pack(
      'Daily Water Intake | Wellness',
      'Wasserziele | Wellness',
      'Hydratation | Wellness',
      'Hidratación | Wellness',
    ),
    seoDescription: pack(
      'How to track water intake with the wellness dashboard.',
      'Wasseraufnahme im Wellness-Dashboard tracken.',
      'Suivre l’hydratation avec le tableau wellness.',
      'Seguimiento de agua en el panel wellness.',
    ),
  },
};

function buildBlogTranslations(post: BlogPost): BlogTranslations {
  const known = BLOG_I18N[post.slug];
  if (known) {
    const out: BlogTranslations = {};
    const used = new Set<string>([post.slug.toLowerCase()]);
    for (const loc of MANDATORY_LOCALES) {
      out[loc] = {
        title: known.title[loc],
        excerpt: known.excerpt[loc],
        content: known.content[loc],
        seoTitle: known.seoTitle[loc],
        seoDescription: known.seoDescription[loc],
        slug: uniqueLocaleSlug(known.title[loc], loc, used),
      };
    }
    return out;
  }
  const out: BlogTranslations = {};
  for (const loc of MANDATORY_LOCALES) {
    const prefix =
      loc === 'en' ? '' : loc === 'de' ? '[DE] ' : loc === 'fr' ? '[FR] ' : '[ES] ';
    const title = loc === 'en' ? post.title : `${prefix}${post.title}`;
    out[loc] = {
      title,
      excerpt: loc === 'en' ? post.excerpt || '' : `${prefix}${post.excerpt || ''}`,
      content:
        loc === 'en'
          ? post.content
          : `<p>${prefix}${post.title}</p>${post.content}`,
      seoTitle: loc === 'en' ? post.seoTitle || post.title : `${prefix}${post.seoTitle || post.title}`,
      seoDescription:
        loc === 'en'
          ? post.seoDescription || post.excerpt || ''
          : `${prefix}${post.seoDescription || post.excerpt || ''}`,
    };
  }
  return assignBlogTranslationSlugs(post, out);
}

function buildCampaignTranslations(campaign: Campaign): CampaignTranslations {
  const out: CampaignTranslations = {};
  for (const loc of MANDATORY_LOCALES) {
    const prefix =
      loc === 'en' ? '' : loc === 'de' ? '[DE] ' : loc === 'fr' ? '[FR] ' : '[ES] ';
    out[loc] = {
      name:
        loc === 'en'
          ? campaign.name.replace(/İndirim/g, 'Sale')
          : `${prefix}${campaign.name}`,
      headline:
        loc === 'en'
          ? campaign.headline || campaign.name
          : `${prefix}${campaign.headline || campaign.name}`,
    };
  }
  return out;
}

/** Mevcut kayıtlara zorunlu en/de/fr/es çevirileri ve ortak görsel bayrağını uygular. */
export async function migrateI18nContent(em: EntityManager): Promise<void> {
  let updated = 0;

  const categories = await em.find(Category, {});
  for (const cat of categories) {
    const next = buildCategoryTranslations(cat);
    if (JSON.stringify(next) !== JSON.stringify(cat.translations || {})) {
      cat.translations = next;
      await em.save(cat);
      updated += 1;
    }
  }

  const products = await em.find(Product, {});
  for (const p of products) {
    // Her seed’de bilinen sözlük + slug’ları yenile (TR metin sızıntısını temizler)
    const next = buildProductTranslations(p);
    const changed =
      JSON.stringify(next) !== JSON.stringify(p.translations || {}) ||
      p.useSharedImage !== true ||
      !p.imagesByLocale;
    p.translations = next;
    p.useSharedImage = true;
    if (!p.imagesByLocale) p.imagesByLocale = {};
    if (changed) {
      await em.save(p);
      updated += 1;
    }
  }

  const posts = await em.find(BlogPost, {});
  for (const post of posts) {
    let dirty = false;
    const rebuilt = buildBlogTranslations(post);
    if (JSON.stringify(rebuilt) !== JSON.stringify(post.translations || {})) {
      post.translations = rebuilt;
      dirty = true;
    } else if (post.translations) {
      const next = assignBlogTranslationSlugs(post, post.translations);
      if (JSON.stringify(next) !== JSON.stringify(post.translations)) {
        post.translations = next;
        dirty = true;
      }
    }
    if (post.useSharedImage !== true) {
      post.useSharedImage = true;
      dirty = true;
    }
    if (!post.imagesByLocale) {
      post.imagesByLocale = {};
      dirty = true;
    }
    if (dirty) {
      await em.save(post);
      updated += 1;
    }
  }

  const campaigns = await em.find(Campaign, {});
  for (const c of campaigns) {
    let dirty = false;
    if (
      !c.translations ||
      !MANDATORY_LOCALES.every((l) => c.translations?.[l]?.name?.trim())
    ) {
      c.translations = buildCampaignTranslations(c);
      dirty = true;
    }
    if (c.useSharedImage !== true) {
      c.useSharedImage = true;
      dirty = true;
    }
    if (!c.imagesByLocale) {
      c.imagesByLocale = {};
      dirty = true;
    }
    if (dirty) {
      await em.save(c);
      updated += 1;
    }
  }

  console.log(`i18n migrate: ${updated} kayıt güncellendi`);
}
