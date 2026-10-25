import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaModule } from '@modules/media/media.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { QUEUE_WHATSAPP_BLAST } from '@modules/queues/queue.constants';
import { WellnessController } from '@modules/wellness/wellness.controller';
import { WellnessService } from '@modules/wellness/wellness.service';
import { WhatsappBlastProcessor } from '@modules/wellness/whatsapp-blast.processor';

@Module({
  imports: [
    MediaModule,
    NotificationsModule,
    BullModule.registerQueue({ name: QUEUE_WHATSAPP_BLAST }),
  ],
  controllers: [WellnessController],
  providers: [WellnessService, WhatsappBlastProcessor],
  exports: [WellnessService],
})
export class WellnessModule {}
