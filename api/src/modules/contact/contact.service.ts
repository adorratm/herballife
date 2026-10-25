import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import { ContactMessage } from '@entities/contact-message.entity';
import { NewsletterSubscriber } from '@entities/newsletter-subscriber.entity';
import {
  CreateContactMessageDto,
  MarkContactReadDto,
  NewsletterSubscribeDto,
  SendNewsletterCampaignDto,
} from '@modules/contact/dto/contact.dto';
import { InboxService } from '@modules/notifications/inbox.service';
import {
  EmailMarketingJobPayload,
  QUEUE_EMAIL_MARKETING,
} from '@modules/queues/queue.constants';

@Injectable()
export class ContactService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly inbox: InboxService,
    @InjectQueue(QUEUE_EMAIL_MARKETING)
    private readonly emailMarketingQueue: Queue<EmailMarketingJobPayload>,
  ) {}

  async createMessage(dto: CreateContactMessageDto): Promise<ContactMessage> {
    const msg = this.em.create(ContactMessage, {
      senderName: dto.senderName,
      senderEmail: dto.senderEmail.toLowerCase().trim(),
      protocolType: dto.protocolType,
      message: dto.message,
      isRead: false,
    });
    const saved = await this.em.save(msg);
    void this.inbox.notifyContactMessage(saved.senderName);
    return saved;
  }

  async listMessages(): Promise<ContactMessage[]> {
    return this.em.find(ContactMessage, {
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(id: string, dto: MarkContactReadDto): Promise<ContactMessage> {
    const msg = await this.em.findOne(ContactMessage, { where: { id } });
    if (!msg) {
      throw new NotFoundException('Mesaj bulunamadı');
    }
    msg.isRead = dto.isRead ?? true;
    return this.em.save(msg);
  }

  async subscribeNewsletter(
    dto: NewsletterSubscribeDto,
  ): Promise<NewsletterSubscriber> {
    const email = dto.email.toLowerCase().trim();
    let sub = await this.em.findOne(NewsletterSubscriber, { where: { email } });
    if (sub) {
      sub.isActive = true;
      if (dto.source) sub.source = dto.source;
      return this.em.save(sub);
    }
    sub = this.em.create(NewsletterSubscriber, {
      email,
      isActive: true,
      source: dto.source ?? 'website',
    });
    return this.em.save(sub);
  }

  async listSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.em.find(NewsletterSubscriber, {
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async enqueueNewsletterCampaign(
    dto: SendNewsletterCampaignDto,
  ): Promise<{ queued: number; campaignId: string }> {
    const subject = dto.subject.trim();
    const html = dto.html.trim();
    if (!subject || !html) {
      throw new BadRequestException('Konu ve HTML gövde zorunludur');
    }

    const subscribers = await this.listSubscribers();
    if (!subscribers.length) {
      throw new BadRequestException('Aktif bülten abonesi yok');
    }

    const campaignId = randomUUID();
    const jobs = subscribers.map((sub) => ({
      name: 'newsletter-campaign',
      data: {
        to: sub.email,
        subject,
        html,
        campaignId,
      } satisfies EmailMarketingJobPayload,
    }));

    await this.emailMarketingQueue.addBulk(jobs);
    return { queued: jobs.length, campaignId };
  }
}
