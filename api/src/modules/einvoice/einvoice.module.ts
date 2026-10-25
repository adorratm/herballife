import { Module } from '@nestjs/common';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { EinvoiceGateway } from '@modules/einvoice/einvoice.gateway';
import { EinvoiceService } from '@modules/einvoice/einvoice.service';
import { MockEinvoiceAdapter } from '@modules/einvoice/mock.adapter';
import { TurkcellEinvoiceAdapter } from '@modules/einvoice/turkcell.adapter';
import { EinvoiceController } from '@modules/einvoice/einvoice.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [EinvoiceController],
  providers: [
    MockEinvoiceAdapter,
    TurkcellEinvoiceAdapter,
    EinvoiceService,
    { provide: EinvoiceGateway, useExisting: EinvoiceService },
  ],
  exports: [EinvoiceService, EinvoiceGateway],
})
export class EinvoiceModule {}
