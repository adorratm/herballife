import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ContactService } from '@modules/contact/contact.service';
import { ContactController } from '@modules/contact/contact.controller';
import { EmailMarketingProcessor } from '@modules/contact/email-marketing.processor';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { QUEUE_EMAIL_MARKETING } from '@modules/queues/queue.constants';

@Module({
  imports: [
    NotificationsModule,
    BullModule.registerQueue({ name: QUEUE_EMAIL_MARKETING }),
  ],
  controllers: [ContactController],
  providers: [ContactService, EmailMarketingProcessor],
  exports: [ContactService],
})
export class ContactModule {}
