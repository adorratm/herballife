import { Module, forwardRef } from '@nestjs/common';
import { PaytrService } from '@modules/payments/paytr.service';
import { PaytrConfigService } from '@modules/payments/paytr-config.service';
import { PaymentsService } from '@modules/payments/payments.service';
import { PaymentFulfillmentService } from '@modules/payments/payment-fulfillment.service';
import { PaymentsController } from '@modules/payments/payments.controller';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { CatalogModule } from '@modules/catalog/catalog.module';
import { CartModule } from '@modules/cart/cart.module';
import { CouponsModule } from '@modules/coupons/coupons.module';
import { AccountingModule } from '@modules/accounting/accounting.module';

@Module({
  imports: [
    NotificationsModule,
    CatalogModule,
    CartModule,
    CouponsModule,
    forwardRef(() => AccountingModule),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentFulfillmentService,
    PaytrConfigService,
    PaytrService,
    PaymentsService,
  ],
  exports: [PaymentsService, PaytrService, PaytrConfigService],
})
export class PaymentsModule {}
