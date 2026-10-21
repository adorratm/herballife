import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import type { User } from '@entities/user.entity';

export enum WellnessApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('wellness_meal_logs')
export class WellnessMealLog extends BaseEntity {
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ name: 'log_date', type: 'date' })
  logDate!: string;

  @Column({ name: 'meal_type', type: 'varchar', length: 40, default: 'other' })
  mealType!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: WellnessApprovalStatus.PENDING,
  })
  status!: WellnessApprovalStatus;

  @Column({ name: 'coach_note', type: 'text', nullable: true })
  coachNote!: string | null;
}
