import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  QUEUE_WHATSAPP_BLAST,
  WhatsappBlastJobPayload,
} from '@modules/queues/queue.constants';
import { CoachWhatsappBlast } from '@entities/coach-whatsapp-blast.entity';
import { WhatsAppProviderRouter } from '@modules/notifications/providers/whatsapp.provider';

const THROTTLE_MS = 200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Processor(QUEUE_WHATSAPP_BLAST)
export class WhatsappBlastProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsappBlastProcessor.name);

  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly whatsapp: WhatsAppProviderRouter,
  ) {
    super();
  }

  async process(job: Job<WhatsappBlastJobPayload>): Promise<void> {
    const blast = await this.em.findOne(CoachWhatsappBlast, {
      where: { id: job.data.blastId },
    });
    if (!blast) {
      this.logger.warn(`Blast ${job.data.blastId} not found`);
      return;
    }

    const templateName = blast.templateName?.trim();
    const languageCode = blast.languageCode?.trim() || 'tr';
    if (!templateName) {
      this.logger.warn(`Blast ${blast.id} missing templateName`);
      return;
    }

    let sentCount = 0;
    let failedCount = 0;
    const recipients = [...(blast.recipients || [])];

    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      if (!r.phone?.trim()) {
        r.ok = false;
        r.error = 'Telefon yok';
        failedCount++;
        continue;
      }

      const bodyParams = (blast.bodyParams || []).map((p) =>
        p.replace(/\{\{1\}\}/g, r.name).replace(/\{Danışan Adı\}/g, r.name),
      );
      const parameters = bodyParams.length
        ? bodyParams.map((text) => ({ type: 'text' as const, text }))
        : [{ type: 'text' as const, text: r.name }];

      try {
        const res = await this.whatsapp.sendTemplate({
          to: r.phone,
          templateName,
          languageCode,
          components: [{ type: 'body', parameters }],
        });
        r.ok = true;
        r.messageId = res.id;
        r.error = undefined;
        sentCount++;
      } catch (err) {
        r.ok = false;
        r.error = err instanceof Error ? err.message : String(err);
        failedCount++;
        this.logger.warn(
          `Blast ${blast.id} failed for ${r.phone}: ${r.error}`,
        );
      }

      recipients[i] = r;
      blast.recipients = recipients;
      blast.sentCount = sentCount;
      blast.failedCount = failedCount;
      await this.em.save(blast);

      if (i < recipients.length - 1) {
        await sleep(THROTTLE_MS);
      }
    }

    this.logger.log(
      `Blast ${blast.id} done: sent=${sentCount} failed=${failedCount}`,
    );
  }
}
