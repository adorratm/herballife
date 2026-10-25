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
  '2026-paket-2-shaker-hediyeli': {
    name: pack(
      '2026 Pack 2 — Free Shaker',
      '2026 Paket 2 — Gratis Shaker',
      'Pack 2026 n°2 — Shaker offert',
      'Pack 2026 2 — Shaker de regalo',
    ),
    shortDescription: pack(
      'Popular bundle · Free shaker',
      'Beliebtes Set · Gratis Shaker',
      'Pack populaire · Shaker offert',
      'Pack popular · Shaker de regalo',
    ),
    description: pack(
      'Value pack for a balanced program. Free shaker included.',
      'Vorteilspaket für ein ausgewogenes Programm. Gratis Shaker inklusive.',
      'Pack avantageux pour un programme équilibré. Shaker offert.',
      'Pack ventajoso para un programa equilibrado. Shaker de regalo incluido.',
    ),
  },
  '2026-paket-3-shaker-hediyeli': {
    name: pack(
      '2026 Pack 3 — Free Shaker',
      '2026 Paket 3 — Gratis Shaker',
      'Pack 2026 n°3 — Shaker offert',
      'Pack 2026 3 — Shaker de regalo',
    ),
    shortDescription: pack(
      'Extended bundle · Free shaker',
      'Erweitertes Set · Gratis Shaker',
      'Pack étendu · Shaker offert',
      'Pack ampliado · Shaker de regalo',
    ),
    description: pack(
      'More complete daily support pack. Free shaker included.',
      'Umfassenderes Tagespaket. Gratis Shaker inklusive.',
      'Pack de soutien quotidien plus complet. Shaker offert.',
      'Pack de apoyo diario más completo. Shaker de regalo incluido.',
    ),
  },
  '2026-paket-4-shaker-hediyeli': {
    name: pack(
      '2026 Pack 4 — Free Shaker',
      '2026 Paket 4 — Gratis Shaker',
      'Pack 2026 n°4 — Shaker offert',
      'Pack 2026 4 — Shaker de regalo',
    ),
    shortDescription: pack(
      'Comprehensive bundle · Free shaker',
      'Umfassendes Set · Gratis Shaker',
      'Pack complet · Shaker offert',
      'Pack completo · Shaker de regalo',
    ),
    description: pack(
      'Wide program set. Free shaker included.',
      'Breites Programm-Set. Gratis Shaker inklusive.',
      'Set programme élargi. Shaker offert.',
      'Set de programa amplio. Shaker de regalo incluido.',
    ),
  },
  '2026-paket-5-shaker-hediyeli': {
    name: pack(
      '2026 Pack 5 — Free Shaker',
      '2026 Paket 5 — Gratis Shaker',
      'Pack 2026 n°5 — Shaker offert',
      'Pack 2026 5 — Shaker de regalo',
    ),
    shortDescription: pack(
      'Premium bundle · Free shaker',
      'Premium-Set · Gratis Shaker',
      'Pack premium · Shaker offert',
      'Pack premium · Shaker de regalo',
    ),
    description: pack(
      'Premium value pack. Free shaker included.',
      'Premium-Vorteilspaket. Gratis Shaker inklusive.',
      'Pack premium avantageux. Shaker offert.',
      'Pack premium ventajoso. Shaker de regalo incluido.',
    ),
  },
  'kilo-alma-seti-shaker-hediyeli': {
    name: pack(
      'Weight Gain Set — Free Shaker',
      'Zunehm-Set — Gratis Shaker',
      'Set prise de poids — Shaker offert',
      'Set de aumento de peso — Shaker de regalo',
    ),
    shortDescription: pack(
      'Weight gain goal · Free shaker',
      'Zunehmen-Ziel · Gratis Shaker',
      'Objectif prise de poids · Shaker offert',
      'Objetivo de aumento · Shaker de regalo',
    ),
    description: pack(
      'Value set suited to a weight-gain program. Free shaker included.',
      'Vorteilhaften Set für ein Zunehm-Programm. Gratis Shaker inklusive.',
      'Set avantageux pour un programme de prise de poids. Shaker offert.',
      'Set ventajoso para un programa de aumento de peso. Shaker de regalo incluido.',
    ),
  },
  'paket-1': {
    name: pack('Pack 1', 'Paket 1', 'Pack 1', 'Pack 1'),
    shortDescription: pack(
      'Best-selling set',
      'Bestseller-Set',
      'Pack best-seller',
      'Pack más vendido',
    ),
    description: pack(
      'Entry-level value set.',
      'Einsteiger-Vorteilspaket.',
      'Pack avantageux niveau débutant.',
      'Pack ventajoso de nivel inicial.',
    ),
  },
  'paket-2': {
    name: pack('Pack 2', 'Paket 2', 'Pack 2', 'Pack 2'),
    shortDescription: pack(
      'Popular value set',
      'Beliebtes Vorteilspaket',
      'Pack avantageux populaire',
      'Pack ventajoso popular',
    ),
    description: pack(
      'Balanced starter set.',
      'Ausgewogenes Starter-Set.',
      'Set de démarrage équilibré.',
      'Set inicial equilibrado.',
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
  'formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet': {
    name: pack(
      'Formula 2 Vitamin & Mineral Complex for Women — 60 Tablets',
      'Formel 2 Vitamin- & Mineralstoffkomplex für Frauen — 60 Tabletten',
      'Formule 2 complexe vitamines & minéraux femmes — 60 comprimés',
      'Fórmula 2 complejo de vitaminas y minerales para mujeres — 60 tabletas',
    ),
    shortDescription: pack(
      'Daily vitamins & minerals for women',
      'Tägliche Vitamine & Mineralstoffe für Frauen',
      'Vitamines & minéraux quotidiens pour femmes',
      'Vitaminas y minerales diarios para mujeres',
    ),
    description: pack(
      'Daily vitamin and mineral support — women’s formula.',
      'Tägliche Vitamin- und Mineralstoffunterstützung — Frauenformel.',
      'Soutien quotidien en vitamines et minéraux — formule femmes.',
      'Apoyo diario de vitaminas y minerales — fórmula para mujeres.',
    ),
  },
  'formul-2-vitamin-ve-mineral-kompleks-erkekler-icin-60-tablet': {
    name: pack(
      'Formula 2 Vitamin & Mineral Complex for Men — 60 Tablets',
      'Formel 2 Vitamin- & Mineralstoffkomplex für Männer — 60 Tabletten',
      'Formule 2 complexe vitamines & minéraux hommes — 60 comprimés',
      'Fórmula 2 complejo de vitaminas y minerales para hombres — 60 tabletas',
    ),
    shortDescription: pack(
      'Daily vitamins & minerals for men',
      'Tägliche Vitamine & Mineralstoffe für Männer',
      'Vitamines & minéraux quotidiens pour hommes',
      'Vitaminas y minerales diarios para hombres',
    ),
    description: pack(
      'Daily vitamin and mineral support — men’s formula.',
      'Tägliche Vitamin- und Mineralstoffunterstützung — Männerformel.',
      'Soutien quotidien en vitamines et minéraux — formule hommes.',
      'Apoyo diario de vitaminas y minerales — fórmula para hombres.',
    ),
  },
  'thermo-complete-90-tablet': {
    name: pack(
      'Thermo Complete™ — 90 Tablets',
      'Thermo Complete™ — 90 Tabletten',
      'Thermo Complete™ — 90 comprimés',
      'Thermo Complete™ — 90 tabletas',
    ),
    shortDescription: pack(
      'Thermogenic support',
      'Thermogene Unterstützung',
      'Soutien thermogénique',
      'Apoyo termogénico',
    ),
    description: pack(
      'Support for active lifestyles and weight-management programs.',
      'Unterstützung für aktiven Lifestyle und Gewichtsmanagement.',
      'Soutien pour un mode de vie actif et la gestion du poids.',
      'Apoyo para un estilo de vida activo y control de peso.',
    ),
  },
  'multi-fiber-multi-fiber-lifli-ve-aromali-icecek-tozu-elma-204-g': {
    name: pack(
      'Multi-Fiber Flavored Drink Mix — Apple 204 g',
      'Multi-Fiber aromatisierter Getränkepulver — Apfel 204 g',
      'Multi-Fiber boisson aromatisée — pomme 204 g',
      'Multi-Fiber bebida aromatizada — manzana 204 g',
    ),
    shortDescription: pack(
      'Flavored fiber drink powder',
      'Aromatisiertes Ballaststoff-Getränkepulver',
      'Poudre boisson fibres aromatisée',
      'Polvo de bebida con fibra aromatizada',
    ),
    description: pack(
      'Apple-flavored fiber drink powder — daily fiber support.',
      'Apfel-aromatisiertes Ballaststoffpulver — tägliche Faserunterstützung.',
      'Poudre fibres goût pomme — soutien quotidien en fibres.',
      'Polvo de fibra sabor manzana — apoyo diario de fibra.',
    ),
  },
  'herbal-aloe-konsantre-icecek-473-ml': {
    name: pack(
      'Herbal Aloe Concentrate Drink 473 ml',
      'Herbal Aloe Konzentratgetränk 473 ml',
      'Boisson concentrée Herbal Aloe 473 ml',
      'Bebida concentrada Herbal Aloe 473 ml',
    ),
    shortDescription: pack(
      'Aloe concentrate drink',
      'Aloe-Konzentratgetränk',
      'Boisson concentrée à l’aloe',
      'Bebida concentrada de aloe',
    ),
    description: pack(
      'Herbal Aloe concentrate drink — dilute before drinking.',
      'Herbal-Aloe-Konzentrat — vor dem Trinken verdünnen.',
      'Boisson concentrée Herbal Aloe — à diluer avant consommation.',
      'Bebida concentrada Herbal Aloe — diluir antes de beber.',
    ),
  },
  'bitkisel-konsantre-caylar-klasik-50-g': {
    name: pack(
      'Herbal Concentrate Tea Classic 50 g',
      'Kräuterkonzentrat-Tee Klassik 50 g',
      'Tisane concentrée classique 50 g',
      'Té concentrado herbal clásico 50 g',
    ),
    shortDescription: pack(
      'Classic herbal concentrate tea',
      'Klassischer Kräuterkonzentrat-Tee',
      'Tisane concentrée classique',
      'Té concentrado herbal clásico',
    ),
    description: pack(
      'Herbal concentrate tea — prepare hot or cold.',
      'Kräuterkonzentrat-Tee — heiß oder kalt zubereiten.',
      'Tisane concentrée — préparation chaude ou froide.',
      'Té concentrado herbal — preparar caliente o frío.',
    ),
  },
  'formul-1-besleyici-shake-karisimi-muz-aromali-550-g': {
    name: pack(
      'Formula 1 Nutritional Shake Mix — Banana 550 g',
      'Formel 1 Shake-Mischung — Banane 550 g',
      'Mélange shake Formule 1 — banane 550 g',
      'Mezcla batido Fórmula 1 — plátano 550 g',
    ),
    shortDescription: pack(
      'Banana Formula 1',
      'Formel 1 Banane',
      'Formule 1 banane',
      'Fórmula 1 plátano',
    ),
    description: pack(
      'Meal-replacement protein shake with banana flavor.',
      'Mahlzeitenersatz-Proteinshake mit Bananengeschmack.',
      'Shake protéiné substitut de repas goût banane.',
      'Batido proteico sustitutivo sabor plátano.',
    ),
  },
  'formul-1-besleyici-shake-karisimi-ahududu-ve-beyaz-cikolata-aromali-500gr': {
    name: pack(
      'Formula 1 — Raspberry & White Chocolate 500 g',
      'Formel 1 — Himbeere & weiße Schokolade 500 g',
      'Formule 1 — framboise & chocolat blanc 500 g',
      'Fórmula 1 — frambuesa y chocolate blanco 500 g',
    ),
    shortDescription: pack(
      'Raspberry & white chocolate',
      'Himbeere & weiße Schokolade',
      'Framboise & chocolat blanc',
      'Frambuesa y chocolate blanco',
    ),
    description: pack(
      'Flavored Formula 1 for sports and weight programs.',
      'Aromatisierte Formel 1 für Sport- und Gewichtsprogramme.',
      'Formule 1 aromatisée pour programmes sport et poids.',
      'Fórmula 1 aromatizada para programas de deporte y peso.',
    ),
  },
  'formul-1-besleyici-shake-karisimi-cikolata-aromali-500-g': {
    name: pack(
      'Formula 1 Nutritional Shake — Chocolate 500 g',
      'Formel 1 Shake — Schokolade 500 g',
      'Shake Formule 1 — chocolat 500 g',
      'Batido Fórmula 1 — chocolate 500 g',
    ),
    shortDescription: pack(
      'Chocolate Formula 1',
      'Formel 1 Schokolade',
      'Formule 1 chocolat',
      'Fórmula 1 chocolate',
    ),
    description: pack(
      'Chocolate Formula 1 shake for practical meal or snack support.',
      'Schokoladen-Formel-1-Shake für praktische Mahlzeiten- oder Snack-Unterstützung.',
      'Shake Formule 1 chocolat pour un repas ou une collation pratique.',
      'Batido Fórmula 1 chocolate para apoyo práctico de comida o snack.',
    ),
  },
  'hl-skin-besleyici-el-ve-vucut-losyonu-147-ml': {
    name: pack(
      'HL/Skin Nourishing Hand & Body Lotion 147 ml',
      'HL/Skin nährende Hand- & Körperlotion 147 ml',
      'HL/Skin lotion mains & corps nourrissante 147 ml',
      'HL/Skin loción nutritiva manos y cuerpo 147 ml',
    ),
    shortDescription: pack(
      'Hand & body lotion',
      'Hand- & Körperlotion',
      'Lotion mains & corps',
      'Loción manos y cuerpo',
    ),
    description: pack(
      'SKIN series nourishing hand and body lotion.',
      'Nährende Hand- und Körperlotion der SKIN-Serie.',
      'Lotion mains et corps nourrissante de la gamme SKIN.',
      'Loción nutritiva de manos y cuerpo de la serie SKIN.',
    ),
  },
  'hl-skin-besleyici-goz-kremi-15-ml': {
    name: pack(
      'HL/Skin Nourishing Eye Cream 15 ml',
      'HL/Skin nährende Augencreme 15 ml',
      'HL/Skin crème contour des yeux nourrissante 15 ml',
      'HL/Skin crema de ojos nutritiva 15 ml',
    ),
    shortDescription: pack(
      'Eye cream',
      'Augencreme',
      'Crème contour des yeux',
      'Crema de ojos',
    ),
    description: pack(
      'SKIN series nourishing eye cream.',
      'Nährende Augencreme der SKIN-Serie.',
      'Crème contour des yeux nourrissante de la gamme SKIN.',
      'Crema de ojos nutritiva de la serie SKIN.',
    ),
  },
  'hl-skin-yenileyici-jel-temizleyici-147-ml': {
    name: pack(
      'HL/Skin Renewing Gel Cleanser 147 ml',
      'HL/Skin erneuerndes Gel-Reinigungsmittel 147 ml',
      'HL/Skin nettoyant gel renouvelant 147 ml',
      'HL/Skin limpiador en gel renovador 147 ml',
    ),
    shortDescription: pack(
      'Gel cleanser',
      'Gel-Reiniger',
      'Nettoyant gel',
      'Limpiador en gel',
    ),
    description: pack(
      'SKIN series renewing gel cleanser.',
      'Erneuerndes Gel-Reinigungsmittel der SKIN-Serie.',
      'Nettoyant gel renouvelant de la gamme SKIN.',
      'Limpiador en gel renovador de la serie SKIN.',
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

/** TR ürün metnini temel marka terimleriyle EN/DE/FR/ES’e yaklaştırır ([DE] öneki yok). */
function localizeProductPhrase(
  text: string,
  locale: MandatoryLocale,
): string {
  let out = text;
  const pairs: Array<[RegExp, Record<MandatoryLocale, string>]> = [
    [/Formül/gi, { en: 'Formula', de: 'Formel', fr: 'Formule', es: 'Fórmula' }],
    [/Paket/gi, { en: 'Pack', de: 'Paket', fr: 'Pack', es: 'Pack' }],
    [/Hediyeli/gi, { en: 'Free gift', de: 'Mit Geschenk', fr: 'Cadeau inclus', es: 'Con regalo' }],
    [/Shaker hediyeli/gi, { en: 'Free shaker', de: 'Gratis Shaker', fr: 'Shaker offert', es: 'Shaker de regalo' }],
    [/Öğün yerine geçen/gi, { en: 'Meal replacement', de: 'Mahlzeitenersatz', fr: 'Substitut de repas', es: 'Sustitutivo de comida' }],
    [/Besleyici/gi, { en: 'Nutritional', de: 'Nährstoffreich', fr: 'Nutritif', es: 'Nutritivo' }],
    [/Aromalı/gi, { en: 'Flavored', de: 'Aromatisiert', fr: 'Aromatisée', es: 'Aromatizado' }],
    [/İçecek/gi, { en: 'Drink', de: 'Getränk', fr: 'Boisson', es: 'Bebida' }],
    [/Çaylar?/gi, { en: 'Tea', de: 'Tee', fr: 'Thé', es: 'Té' }],
    [/Vitamin ve Mineral/gi, { en: 'Vitamin & Mineral', de: 'Vitamin & Mineralstoff', fr: 'Vitamines & minéraux', es: 'Vitaminas y minerales' }],
    [/Kadınlar İçin/gi, { en: 'for Women', de: 'für Frauen', fr: 'pour femmes', es: 'para mujeres' }],
    [/Erkekler İçin/gi, { en: 'for Men', de: 'für Männer', fr: 'pour hommes', es: 'para hombres' }],
    [/Tablet/gi, { en: 'Tablets', de: 'Tabletten', fr: 'comprimés', es: 'tabletas' }],
    [/Losyonu?/gi, { en: 'Lotion', de: 'Lotion', fr: 'Lotion', es: 'Loción' }],
    [/Göz Kremi/gi, { en: 'Eye Cream', de: 'Augencreme', fr: 'Crème yeux', es: 'Crema de ojos' }],
    [/Jel Temizleyici/gi, { en: 'Gel Cleanser', de: 'Gel-Reiniger', fr: 'Nettoyant gel', es: 'Limpiador en gel' }],
    [/Konsantre/gi, { en: 'Concentrate', de: 'Konzentrat', fr: 'Concentré', es: 'Concentrado' }],
    [/Bitkisel/gi, { en: 'Herbal', de: 'Kräuter', fr: 'Herbal', es: 'Herbal' }],
    [/Kilo Alma/gi, { en: 'Weight Gain', de: 'Zunehmen', fr: 'Prise de poids', es: 'Aumento de peso' }],
    [/Başlangıç/gi, { en: 'Starter', de: 'Starter', fr: 'Débutant', es: 'Inicial' }],
    [/avantajlı/gi, { en: 'value', de: 'vorteilhaft', fr: 'avantageux', es: 'ventajoso' }],
  ];
  for (const [re, map] of pairs) {
    out = out.replace(re, map[locale]);
  }
  return out;
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
    out[loc] = {
      name: localizeProductPhrase(product.name, loc),
      shortDescription: localizeProductPhrase(short, loc),
      description: localizeProductPhrase(desc.slice(0, 500), loc),
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
  'avantajli-set-secim-rehberi': {
    title: pack(
      'What to Look for When Choosing a Value Bundle',
      'Worauf Sie bei Vorteilsets achten sollten',
      'Que regarder pour choisir un pack avantageux',
      'Qué mirar al elegir un pack ventajoso',
    ),
    excerpt: pack(
      'Goal, gift contents and program length — three basics for choosing a set.',
      'Ziel, Geschenkinhalt und Programmdauer — drei Grundlagen für die Set-Wahl.',
      'Objectif, contenu cadeau et durée — trois bases pour choisir un pack.',
      'Objetivo, contenido del regalo y duración — tres bases para elegir un set.',
    ),
    content: pack(
      '<p>Starter packs combine a shaker with Formula products. Pick a category for weight management, sport or general wellness.</p><p>You can get product advice on WhatsApp — Herbal Kapıda.</p>',
      '<p>Starterpakete kombinieren Shaker und Formel-Produkte. Wählen Sie nach Gewichtsmanagement, Sport oder Wellness.</p>',
      '<p>Les packs de démarrage associent shaker et produits Formule. Choisissez selon poids, sport ou bien-être.</p>',
      '<p>Los packs iniciales combinan shaker y productos Fórmula. Elija según peso, deporte o bienestar.</p>',
    ),
    seoTitle: pack(
      'Value Bundle Selection Guide',
      'Leitfaden Vorteilsets',
      'Guide des packs avantageux',
      'Guía de packs ventajosos',
    ),
    seoDescription: pack(
      'How to evaluate goal, gifts and program when choosing a Herbalife value set.',
      'Ziel, Geschenk und Programm bei Herbalife-Vorteilsets bewerten.',
      'Évaluer objectif, cadeau et programme pour un pack Herbalife.',
      'Evaluar objetivo, regalo y programa al elegir un set Herbalife.',
    ),
  },
  'sabah-rutininde-protein-shake': {
    title: pack(
      'Protein Shake in Your Morning Routine',
      'Protein-Shake in der Morgenroutine',
      'Shake protéiné dans la routine du matin',
      'Batido de proteína en la rutina matutina',
    ),
    excerpt: pack(
      'Busy days, practical meal: ready in 5 minutes, a filling start.',
      'Volle Tage, praktische Mahlzeit: in 5 Minuten fertig, sättigender Start.',
      'Journées chargées, repas pratique : prêt en 5 minutes, début rassasiant.',
      'Días ocupados, comida práctica: listo en 5 minutos, inicio saciante.',
    ),
    content: pack(
      '<p>For rushed mornings, a Formula 1 shake speeds up breakfast. Keeping the shaker ready overnight makes the habit easier.</p><p>Add fruit or low-fat milk for more satiety. Personalize with your coach.</p>',
      '<p>An eiligen Morgen beschleunigt Formel 1 das Frühstück. Shaker über Nacht bereithalten erleichtert die Gewohnheit.</p>',
      '<p>Le matin pressé, la Formule 1 accélère le petit-déjeuner. Préparer le shaker la veille facilite l’habitude.</p>',
      '<p>En mañanas con prisa, Fórmula 1 agiliza el desayuno. Tener el shaker listo facilita el hábito.</p>',
    ),
    seoTitle: pack(
      'Morning Protein Shake Routine',
      'Morgen-Protein-Shake-Routine',
      'Routine shake protéiné du matin',
      'Rutina de batido proteico matutino',
    ),
    seoDescription: pack(
      'Morning protein shake tips for fast prep and lasting habits.',
      'Tipps für schnelle Morgen-Shakes und nachhaltige Gewohnheiten.',
      'Conseils shake du matin : préparation rapide et habitudes durables.',
      'Consejos de batido matutino: preparación rápida y hábitos sostenibles.',
    ),
  },
  'kargo-ve-teslimat-sureci': {
    title: pack(
      'Shipping After Your Order',
      'Versand nach der Bestellung',
      'Livraison après commande',
      'Envío tras el pedido',
    ),
    excerpt: pack(
      'Payment confirmation, packing and tracking — what to expect step by step.',
      'Zahlungsbestätigung, Verpackung und Tracking — Schritt für Schritt.',
      'Confirmation de paiement, emballage et suivi — étape par étape.',
      'Confirmación de pago, embalaje y seguimiento — paso a paso.',
    ),
    content: pack(
      '<p>After payment confirmation, orders usually ship within 1–3 business days. You can see the tracking code in notifications and your account.</p><p>If store pickup is available, we notify you when ready. WhatsApp support stays open for questions.</p>',
      '<p>Nach Zahlungsbestätigung gehen Bestellungen meist in 1–3 Werktagen in den Versand. Tracking finden Sie in Benachrichtigungen und im Konto.</p>',
      '<p>Après confirmation du paiement, expédition sous 1–3 jours ouvrés en général. Le suivi apparaît dans les notifications et votre compte.</p>',
      '<p>Tras confirmar el pago, los pedidos suelen enviarse en 1–3 días hábiles. El código de seguimiento está en notificaciones y su cuenta.</p>',
    ),
    seoTitle: pack(
      'Order & Shipping Process',
      'Bestell- und Versandprozess',
      'Processus commande et livraison',
      'Proceso de pedido y envío',
    ),
    seoDescription: pack(
      'What happens after you order at Herbal Kapıda: shipping and tracking.',
      'Was nach der Bestellung bei Herbal Kapıda passiert: Versand und Tracking.',
      'Après commande chez Herbal Kapıda : livraison et suivi.',
      'Tras pedir en Herbal Kapıda: envío y seguimiento.',
    ),
  },
  'iade-ve-cayma-hakki-ozeti': {
    title: pack(
      'Returns & Withdrawal Rights Summary',
      'Rückgabe- und Widerrufsrecht — Kurzfassung',
      'Résumé droit de rétractation et retours',
      'Resumen de devoluciones y desistimiento',
    ),
    excerpt: pack(
      '14 days on distance sales — how to apply and what to watch for.',
      '14 Tage bei Fernabsatz — Antrag und Hinweise.',
      '14 jours en vente à distance — comment demander et points d’attention.',
      '14 días en venta a distancia — cómo solicitar y qué vigilar.',
    ),
    content: pack(
      '<p>Consumers may use the withdrawal right on distance sales. Products should be unused / hygiene-compliant; see Cancel & Return for details.</p><p>Order number and contact details are enough to apply. Coaching support is separate from returns.</p>',
      '<p>Verbraucher können beim Fernabsatz widerrufen. Produkte sollten ungeöffnet / hygienisch sein; Details auf der Widerrufsseite.</p>',
      '<p>Les consommateurs peuvent se rétracter en vente à distance. Produits non ouverts / conformes à l’hygiène ; détails sur la page retours.</p>',
      '<p>Los consumidores pueden desistir en venta a distancia. Productos sin abrir / higiénicos; detalles en la página de devoluciones.</p>',
    ),
    seoTitle: pack(
      'Returns & Withdrawal Rights',
      'Rückgabe & Widerruf',
      'Retours & rétractation',
      'Devoluciones y desistimiento',
    ),
    seoDescription: pack(
      'Short summary of the 14-day withdrawal right and how to request a return.',
      'Kurzfassung 14-Tage-Widerruf und Rückgabeantrag.',
      'Résumé du délai de 14 jours et de la demande de retour.',
      'Resumen del plazo de 14 días y cómo solicitar devolución.',
    ),
  },
  'yeni-baslayanlar-icin-ilk-hafta': {
    title: pack(
      'First Week for Beginners',
      'Erste Woche für Einsteiger',
      'Première semaine pour débutants',
      'Primera semana para principiantes',
    ),
    excerpt: pack(
      'You got a set — how to set up water, meals and tracking in the first 7 days.',
      'Sie haben ein Set — Wasser, Mahlzeiten und Tracking in den ersten 7 Tagen.',
      'Vous avez un pack — eau, repas et suivi dans les 7 premiers jours.',
      'Tiene un set — agua, comidas y seguimiento en los primeros 7 días.',
    ),
    content: pack(
      '<p>Week one is about building routine, not a perfect diet. A daily Formula 1 meal, water logging and a short evening walk are a strong start.</p><p>Upload meal photos from My Account → Nutrition Tracking; your coach can approve and guide you.</p>',
      '<p>Die erste Woche geht um Routine, nicht um die perfekte Diät. Täglich Formel 1, Wassertracking und ein kurzer Abendspaziergang sind ein guter Start.</p>',
      '<p>La première semaine vise la routine, pas le régime parfait. Formule 1 quotidienne, hydratation et une courte marche le soir forment un bon départ.</p>',
      '<p>La primera semana es rutina, no dieta perfecta. Una comida Fórmula 1 al día, agua y un paseo corto por la noche son un buen inicio.</p>',
    ),
    seoTitle: pack(
      'First Week for Beginners',
      'Erste Woche für Einsteiger',
      'Première semaine débutants',
      'Primera semana principiantes',
    ),
    seoDescription: pack(
      'First-week routine with a Herbalife set: water, meals and coach tracking.',
      'Erste Woche mit Herbalife-Set: Wasser, Mahlzeiten und Coach-Tracking.',
      'Première semaine avec un pack Herbalife : eau, repas et suivi coach.',
      'Primera semana con un set Herbalife: agua, comidas y seguimiento del coach.',
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
    out[loc] = {
      title: localizeProductPhrase(post.title, loc),
      excerpt: localizeProductPhrase(post.excerpt || '', loc),
      content: localizeProductPhrase(post.content, loc),
      seoTitle: localizeProductPhrase(post.seoTitle || post.title, loc),
      seoDescription: localizeProductPhrase(
        post.seoDescription || post.excerpt || '',
        loc,
      ),
    };
  }
  return assignBlogTranslationSlugs(post, out);
}

function buildCampaignTranslations(campaign: Campaign): CampaignTranslations {
  const out: CampaignTranslations = {};
  for (const loc of MANDATORY_LOCALES) {
    const name = localizeProductPhrase(
      campaign.name.replace(/İndirim/g, loc === 'en' ? 'Sale' : 'İndirim'),
      loc,
    ).replace(
      /İndirim/g,
      loc === 'de' ? 'Sale' : loc === 'fr' ? 'Promo' : loc === 'es' ? 'Oferta' : 'Sale',
    );
    out[loc] = {
      name,
      headline: localizeProductPhrase(
        campaign.headline || campaign.name,
        loc,
      ),
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
