import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import type { User } from '@entities/user.entity';
import { WellnessApprovalStatus } from '@entities/wellness-meal-log.entity';
import { numericTransformer } from '@common/utils/numeric';

@Entity('wellness_measurements')
export class WellnessMeasurement extends BaseEntity {
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ name: 'measured_at', type: 'date' })
  measuredAt!: string;

  @Column({
    name: 'weight_kg',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  weightKg!: number | null;

  @Column({
    name: 'waist_cm',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  waistCm!: number | null;

  @Column({
    name: 'hip_cm',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  hipCm!: number | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: WellnessApprovalStatus.PENDING,
  })
  status!: WellnessApprovalStatus;

  @Column({ name: 'coach_note', type: 'text', nullable: true })
  coachNote!: string | null;
}
