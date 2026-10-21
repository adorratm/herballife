import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import type { User } from '@entities/user.entity';

@Entity('wellness_water_logs')
export class WellnessWaterLog extends BaseEntity {
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /** YYYY-MM-DD */
  @Index()
  @Column({ name: 'log_date', type: 'date' })
  logDate!: string;

  /** ml */
  @Column({ name: 'amount_ml', type: 'int', default: 250 })
  amountMl!: number;
}
