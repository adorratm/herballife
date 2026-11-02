import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';

@Entity('accounting_settings')
export class AccountingSettings extends BaseEntity {
  @Column({
    name: 'company_title',
    type: 'varchar',
    length: 200,
    default: 'Herbal Kapıda',
  })
  companyTitle!: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  vkn!: string | null;

  @Column({ name: 'tax_office', type: 'varchar', length: 120, nullable: true })
  taxOffice!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city!: string | null;

  @Column({
    name: 'earchive_prefix',
    type: 'varchar',
    length: 8,
    default: 'ARC',
  })
  earchivePrefix!: string;

  @Column({
    name: 'einvoice_prefix',
    type: 'varchar',
    length: 8,
    default: 'INV',
  })
  einvoicePrefix!: string;

  /** GİB’e başarılı gönderimden sonra müşteriye e-posta (PDF/HTML ek yoksa sistem HTML’i). */
  @Column({
    name: 'auto_email_invoice_on_gib',
    type: 'boolean',
    default: false,
  })
  autoEmailInvoiceOnGib!: boolean;

  /** PayTR sanal POS komisyon oranı (%); hesaba geçen tutar hesabında kullanılır. */
  @Column({
    name: 'paytr_commission_rate_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 2.19,
  })
  paytrCommissionRatePercent!: string;

  @Column({
    name: 'paytr_merchant_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  paytrMerchantId!: string | null;

  @Column({
    name: 'paytr_merchant_key',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  paytrMerchantKey!: string | null;

  @Column({
    name: 'paytr_merchant_salt',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  paytrMerchantSalt!: string | null;

  /** '0' | '1' — null ise env */
  @Column({
    name: 'paytr_test_mode',
    type: 'varchar',
    length: 1,
    nullable: true,
  })
  paytrTestMode!: string | null;

  @Column({
    name: 'paytr_debug_on',
    type: 'varchar',
    length: 1,
    nullable: true,
  })
  paytrDebugOn!: string | null;
}
