import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  EmailMarketingJobPayload,
  QUEUE_EMAIL_MARKETING,
} from '@modules/queues/queue.constants';
import { EmailProvider } from '@modules/notifications/providers/email.provider';

@Processor(QUEUE_EMAIL_MARKETING)
export class EmailMarketingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailMarketingProcessor.name);

  constructor(private readonly email: EmailProvider) {
    super();
  }

  async process(job: Job<EmailMarketingJobPayload>): Promise<void> {
    const { to, subject, html } = job.data;
    if (!to?.trim() || !subject?.trim() || !html?.trim()) {
      this.logger.warn(`Email marketing job ${job.id}: eksik alan`);
      return;
    }
    await this.email.send({
      to: to.trim(),
      subject: subject.trim(),
      html,
    });
    this.logger.log(`Marketing email sent to ${to.trim()}`);
  }
}
