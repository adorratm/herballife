import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';

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
