import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
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
import { InboxService } from '@modules/notifications/inbox.service';
import { EmailProvider } from '@modules/notifications/providers/email.provider';
import {
  wellnessMealDecisionCopy,
  wellnessMeasurementDecisionCopy,
} from '@modules/notifications/inbox.templates';
import {
  QUEUE_WHATSAPP_BLAST,
  WhatsappBlastJobPayload,
} from '@modules/queues/queue.constants';

@Injectable()
export class WellnessService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    @InjectQueue(QUEUE_WHATSAPP_BLAST)
    private readonly whatsappBlastQueue: Queue<WhatsappBlastJobPayload>,
    private readonly inbox: InboxService,
    private readonly email: EmailProvider,
  ) {}

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
    const saved = await this.em.save(row);
    const approved = status === WellnessApprovalStatus.APPROVED;
    const copy = wellnessMealDecisionCopy(approved, coachNote);
    void this.inbox.notifyUser(row.userId, copy);
    void this.maybeEmailWellnessDecision(row.userId, copy.title, copy.body);
    return saved;
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
    const saved = await this.em.save(row);
    const approved = status === WellnessApprovalStatus.APPROVED;
    const copy = wellnessMeasurementDecisionCopy(approved, coachNote);
    void this.inbox.notifyUser(row.userId, copy);
    void this.maybeEmailWellnessDecision(row.userId, copy.title, copy.body);
    return saved;
  }

  private async maybeEmailWellnessDecision(
    userId: string,
    subject: string,
    body: string,
  ) {
    const user = await this.em.findOne(User, { where: { id: userId } });
    const to = user?.email?.trim();
    if (!to) return;
    try {
      await this.email.send({
        to,
        subject,
        text: body,
        html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
      });
    } catch {
      /* e-posta opsiyonel */
    }
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
    input: {
      templateName: string;
      languageCode?: string;
      bodyParams?: string[];
      message?: string;
      userIds?: string[];
    },
  ) {
    const templateName = input.templateName?.trim();
    if (!templateName) {
      throw new BadRequestException('Meta şablon adı gerekli');
    }
    const languageCode = (input.languageCode || 'tr').trim();
    const bodyParams = input.bodyParams?.length
      ? input.bodyParams
      : ['{{1}}'];
    const message =
      input.message?.trim() ||
      `template:${templateName} (${languageCode})`;

    let users: User[];
    if (input.userIds?.length) {
      users = await this.em.find(User, { where: { id: In(input.userIds) } });
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
        ok: false,
      };
    });

    const blast = this.em.create(CoachWhatsappBlast, {
      createdById,
      message,
      templateName,
      languageCode,
      bodyParams,
      recipientCount: recipients.length,
      sentCount: 0,
      failedCount: 0,
      recipients,
    });
    await this.em.save(blast);

    await this.whatsappBlastQueue.add(
      'blast',
      { blastId: blast.id },
      {
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    );

    return {
      id: blast.id,
      message,
      templateName,
      languageCode,
      recipientCount: recipients.length,
      sentCount: 0,
      failedCount: 0,
      queued: true,
      recipients,
    };
  }

  async listBlasts(limit = 20) {
    return this.em.find(CoachWhatsappBlast, {
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getBlast(id: string) {
    const blast = await this.em.findOne(CoachWhatsappBlast, {
      where: { id },
    });
    if (!blast) throw new NotFoundException('Gönderim kaydı yok');
    return blast;
  }
}
