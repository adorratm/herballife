import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import type {
  CampaignTranslations,
  ImagesByLocale,
} from '@common/catalog/localization.types';

export type CampaignItemRule = {
  /** Sepetteki sıra (1 tabanlı) */
  position: number;
  discountPercent: number;
};

export type CampaignRuleMode = 'flat' | 'nth_item' | 'both';

/**
 * Flash / özel gün indirim kampanyası (11.11, Halloween vb.).
 * productIds boşsa tüm aktif ürünlere uygulanır.
 */
@Entity('campaigns')
export class Campaign extends BaseEntity {
  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  slug!: string;

  @Column({
    name: 'discount_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  discountPercent!: string;

  /**
   * Sepette N. ürün (adet bazlı, 1 tabanlı) için ek indirim kuralları.
   * ruleMode ile birlikte kullanılır.
   */
  @Column({ name: 'item_rules', type: 'jsonb', default: [] })
  itemRules!: CampaignItemRule[];

  /** flat: tüm kalemlerde discountPercent; nth_item: yalnız itemRules; both: ikisi birlikte */
  @Column({ name: 'rule_mode', type: 'varchar', length: 16, default: 'flat' })
  ruleMode!: CampaignRuleMode;

  /** Vitrin rozeti: 11.11, HALLOWEEN, BLACK FRIDAY… */
  @Column({ type: 'varchar', length: 64, nullable: true })
  badge!: string | null;

  /**
   * Görsel tema anahtarı:
   * default | singles-day | halloween | black-friday | valentine | new-year | ramadan | kurban
   */
  @Column({ type: 'varchar', length: 40, nullable: true, default: 'default' })
  theme!: string | null;

  /** Kısa vitrin açıklaması */
  @Column({ type: 'varchar', length: 280, nullable: true })
  headline!: string | null;

  /** Ana sayfa flash şeridi / vitrin görseli */
  @Column({ name: 'image_url', type: 'varchar', length: 512, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'translations', type: 'jsonb', nullable: true })
  translations!: CampaignTranslations | null;

  @Column({ name: 'images_by_locale', type: 'jsonb', default: {} })
  imagesByLocale!: ImagesByLocale;

  @Column({ name: 'use_shared_image', type: 'boolean', default: true })
  useSharedImage!: boolean;

  /** Boş dizi = tüm ürünler */
  @Column({ name: 'product_ids', type: 'jsonb', default: [] })
  productIds!: string[];

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt!: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
