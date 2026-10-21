import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { User } from '@entities/user.entity';
import { WellnessWaterLog } from '@entities/wellness-water-log.entity';
import {
  WellnessApprovalStatus,
  WellnessMealLog,
} from '@entities/wellness-meal-log.entity';
import { WellnessMeasurement } from '@entities/wellness-measurement.entity';
import { CoachWhatsappBlast } from '@entities/coach-whatsapp-blast.entity';

@Injectable()
export class WellnessService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async waterToday(userId: string) {
    const logDate = this.today();
    const rows = await this.em.find(WellnessWaterLog, {
      where: { userId, logDate },
      order: { createdAt: 'ASC' },
    });
    const totalMl = rows.reduce((s, r) => s + r.amountMl, 0);
    return { logDate, totalMl, goalMl: 2500, entries: rows };
  }

  async addWater(userId: string, amountMl = 250) {
    if (amountMl < 50 || amountMl > 2000) {
      throw new BadRequestException('Geçersiz su miktarı');
    }
    const row = this.em.create(WellnessWaterLog, {
      userId,
      logDate: this.today(),
      amountMl,
    });
    await this.em.save(row);
    return this.waterToday(userId);
  }

  async listMeals(userId: string, limit = 30) {
    return this.em.find(WellnessMealLog, {
      where: { userId },
      order: { logDate: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async createMeal(
    userId: string,
    input: {
      mealType?: string;
      note?: string;
      photoUrl?: string;
      logDate?: string;
    },
  ) {
    const row = this.em.create(WellnessMealLog, {
      userId,
      logDate: input.logDate || this.today(),
      mealType: input.mealType || 'other',
      note: input.note || null,
      photoUrl: input.photoUrl || null,
      status: WellnessApprovalStatus.PENDING,
    });
    return this.em.save(row);
  }

  async listMeasurements(userId: string, limit = 30) {
    return this.em.find(WellnessMeasurement, {
      where: { userId },
      order: { measuredAt: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async createMeasurement(
    userId: string,
    input: {
      measuredAt?: string;
      weightKg?: number;
      waistCm?: number;
      hipCm?: number;
      note?: string;
    },
  ) {
    if (
      input.weightKg == null &&
      input.waistCm == null &&
      input.hipCm == null
    ) {
      throw new BadRequestException('En az bir ölçüm değeri gerekli');
    }
    const row = this.em.create(WellnessMeasurement, {
      userId,
      measuredAt: input.measuredAt || this.today(),
      weightKg: input.weightKg ?? null,
      waistCm: input.waistCm ?? null,
      hipCm: input.hipCm ?? null,
      note: input.note || null,
      status: WellnessApprovalStatus.PENDING,
    });
    return this.em.save(row);
  }

  async dashboard(userId: string) {
    const [water, meals, measurements] = await Promise.all([
      this.waterToday(userId),
      this.listMeals(userId, 7),
      this.listMeasurements(userId, 7),
    ]);
    return { water, meals, measurements };
  }

  /** Koç: bekleyen onaylar */
  async pendingApprovals(limit = 40) {
    const [meals, measurements] = await Promise.all([
      this.em.find(WellnessMealLog, {
        where: { status: WellnessApprovalStatus.PENDING },
        order: { createdAt: 'DESC' },
        take: limit,
        relations: { user: true },
      }),
      this.em.find(WellnessMeasurement, {
        where: { status: WellnessApprovalStatus.PENDING },
        order: { createdAt: 'DESC' },
        take: limit,
        relations: { user: true },
      }),
    ]);
    return { meals, measurements };
  }

  async decideMeal(
    id: string,
    status: WellnessApprovalStatus,
    coachNote?: string,
  ) {
    const row = await this.em.findOne(WellnessMealLog, { where: { id } });
    if (!row) throw new NotFoundException('Öğün kaydı yok');
    row.status = status;
    row.coachNote = coachNote || null;
    return this.em.save(row);
  }

  async decideMeasurement(
    id: string,
    status: WellnessApprovalStatus,
    coachNote?: string,
  ) {
    const row = await this.em.findOne(WellnessMeasurement, { where: { id } });
    if (!row) throw new NotFoundException('Ölçüm kaydı yok');
    row.status = status;
    row.coachNote = coachNote || null;
    return this.em.save(row);
  }

  async coachKpis() {
    const pendingMeals = await this.em.count(WellnessMealLog, {
      where: { status: WellnessApprovalStatus.PENDING },
    });
    const pendingMeasurements = await this.em.count(WellnessMeasurement, {
      where: { status: WellnessApprovalStatus.PENDING },
    });
    const clients = await this.em
      .createQueryBuilder(WellnessMealLog, 'm')
      .select('COUNT(DISTINCT m.user_id)', 'c')
      .getRawOne<{ c: string }>();
    return {
      pendingMeals,
      pendingMeasurements,
      pendingTotal: pendingMeals + pendingMeasurements,
      activeClients: Number(clients?.c || 0),
    };
  }

  async listClients(limit = 50) {
    const userIds = await this.em
      .createQueryBuilder(WellnessWaterLog, 'w')
      .select('DISTINCT w.user_id', 'userId')
      .limit(limit)
      .getRawMany<{ userId: string }>();
    const mealIds = await this.em
      .createQueryBuilder(WellnessMealLog, 'm')
      .select('DISTINCT m.user_id', 'userId')
      .limit(limit)
      .getRawMany<{ userId: string }>();
    const ids = [
      ...new Set([
        ...userIds.map((r) => r.userId),
        ...mealIds.map((r) => r.userId),
      ]),
    ].slice(0, limit);
    if (!ids.length) return [];
    return this.em.find(User, {
      where: { id: In(ids) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async createWhatsappBlast(
    createdById: string,
    message: string,
    userIds?: string[],
  ) {
    const text = message.trim();
    if (!text) throw new BadRequestException('Mesaj boş olamaz');

    let users: User[];
    if (userIds?.length) {
      users = await this.em.find(User, { where: { id: In(userIds) } });
    } else {
      users = await this.listClients(100);
    }

    const recipients = users.map((u) => {
      const phone = (u.phone || '').trim();
      const name =
        [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
      return {
        userId: u.id,
        phone,
        name,
        ok: Boolean(phone),
      };
    });

    const sentCount = recipients.filter((r) => r.ok).length;
    const failedCount = recipients.length - sentCount;

    const blast = this.em.create(CoachWhatsappBlast, {
      createdById,
      message: text,
      recipientCount: recipients.length,
      sentCount,
      failedCount,
      recipients,
    });
    await this.em.save(blast);

    return {
      id: blast.id,
      message: text,
      recipientCount: recipients.length,
      sentCount,
      failedCount,
      note: 'Demo: gerçek WhatsApp API çağrısı yapılmadı; numara olan alıcılar “gönderildi” sayılır.',
      recipients,
    };
  }

  async listBlasts(limit = 20) {
    return this.em.find(CoachWhatsappBlast, {
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
