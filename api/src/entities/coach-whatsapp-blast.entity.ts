import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import type { User } from '@entities/user.entity';

@Entity('coach_whatsapp_blasts')
export class CoachWhatsappBlast extends BaseEntity {
  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: User | null;

  @Index()
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById!: string | null;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'recipient_count', type: 'int', default: 0 })
  recipientCount!: number;

  @Column({ name: 'sent_count', type: 'int', default: 0 })
  sentCount!: number;

  @Column({ name: 'failed_count', type: 'int', default: 0 })
  failedCount!: number;

  /** Demo: alıcı özeti */
  @Column({ name: 'recipients', type: 'jsonb', default: [] })
  recipients!: Array<{
    userId: string;
    phone: string;
    name: string;
    ok: boolean;
  }>;
}
