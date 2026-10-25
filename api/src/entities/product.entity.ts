import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import type { Category } from '@entities/category.entity';
import type { ProductVariant } from '@entities/product-variant.entity';
import { numericTransformer } from '@common/utils/numeric';
import type {
  ImagesByLocale,
  ProductPrices,
  ProductTranslations,
} from '@common/catalog/localization.types';

@Entity('products')
export class Product extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180 })
  slug!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    name: 'short_description',
    type: 'varchar',
    length: 400,
    nullable: true,
  })
  shortDescription!: string | null;

  @Column({ name: 'seo_title', type: 'varchar', length: 220, nullable: true })
  seoTitle!: string | null;

  @Column({ name: 'seo_description', type: 'text', nullable: true })
  seoDescription!: string | null;

  /** Üretim / menşei ülke (UI); eski kahve menşei alanı */
  @Column({
    name: 'origin_country',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  originCountry!: string | null;

  /** Hedef kullanım bölgesi (UI) */
  @Column({
    name: 'origin_region',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  originRegion!: string | null;

  /** Porsiyon / servis (UI); DB sütunu: altitude */
  @Column({ name: 'altitude', type: 'varchar', length: 80, nullable: true })
  altitude!: string | null;

  /** Form / tip (UI); eski işlem alanı */
  @Column({ name: 'process', type: 'varchar', length: 80, nullable: true })
  process!: string | null;

  /** İçerik vurgusu (UI); eski çeşit alanı */
  @Column({ name: 'varietal', type: 'varchar', length: 120, nullable: true })
  varietal!: string | null;

  /** Herbalife lot / parti numarası */
  @Column({ name: 'batch_id', type: 'varchar', length: 80, nullable: true })
  batchId!: string | null;

  /** Tat / lezzet seçenekleri veya aroma listesi */
  @Column({ name: 'flavor_notes', type: 'text', array: true, default: '{}' })
  flavorNotes!: string[];

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'images_by_locale', type: 'jsonb', default: {} })
  imagesByLocale!: ImagesByLocale;

  @Column({ name: 'use_shared_image', type: 'boolean', default: true })
  useSharedImage!: boolean;

  @Column({ name: 'gallery', type: 'text', array: true, default: '{}' })
  gallery!: string[];

  @Column({ name: 'badge', type: 'varchar', length: 80, nullable: true })
  badge!: string | null;

  /** Katalog türü: supplement, beverage, herbal_tea, tea, other */
  @Column({ name: 'kind', type: 'varchar', length: 40, default: 'other' })
  kind!: string;

  @Column({ name: 'unit', type: 'varchar', length: 20, default: 'adet' })
  unit!: string;

  /** Satır KDV oranı (%). Varsayılan 20. */
  @Column({
    name: 'vat_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 20,
  })
  vatRate!: string;

  @Column({ name: 'barcode', type: 'varchar', length: 64, nullable: true })
  barcode!: string | null;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt!: string | null;

  @Column({ name: 'allergens', type: 'text', array: true, default: '{}' })
  allergens!: string[];

  @Column({ name: 'ingredients', type: 'text', nullable: true })
  ingredients!: string | null;

  /** Kullanım / hazırlama önerisi: method, ratio, notes */
  @Column({ name: 'brew_guide', type: 'jsonb', nullable: true })
  brewGuide!: Record<string, string> | null;

  @Column({ name: 'storage_notes', type: 'text', nullable: true })
  storageNotes!: string | null;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
  basePrice!: string;

  /** Para birimi başına liste fiyatları (TRY zorunlu; boşsa basePrice TRY sayılır) */
  @Column({ name: 'prices', type: 'jsonb', default: {} })
  prices!: ProductPrices;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'TRY' })
  currency!: string;

  /** TR ana sütunlarda; en/de/fr/es çevirileri */
  @Column({ name: 'translations', type: 'jsonb', nullable: true })
  translations!: ProductTranslations | null;

  /** Liste fiyatı KDV dahil mi */
  @Column({ name: 'price_tax_included', type: 'boolean', default: true })
  priceTaxIncluded!: boolean;

  @Column({
    name: 'stock',
    type: 'numeric',
    precision: 12,
    scale: 3,
    default: 0,
    transformer: numericTransformer,
  })
  stock!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  /** Onaylı yorum ortalaması (1–5) */
  @Column({
    name: 'rating_avg',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  ratingAvg!: string;

  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount!: number;

  @ManyToOne('Category', 'products', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId!: string | null;

  /** Hepsiburada MPOP leaf kategori ID (ürün push için) */
  @Column({
    name: 'hepsiburada_category_id',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  hepsiburadaCategoryId!: string | null;

  /**
   * HB kategori zorunlu enum/alan override’ları (attribute.id → değer).
   * Hesap credentials.attributes üzerine yazar.
   */
  @Column({ name: 'hepsiburada_attributes', type: 'jsonb', nullable: true })
  hepsiburadaAttributes!: Record<string, string | number | boolean> | null;

  @OneToMany('ProductVariant', 'product')
  variants!: ProductVariant[];
}
