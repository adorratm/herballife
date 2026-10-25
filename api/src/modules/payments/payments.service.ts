import { Injectable } from '@nestjs/common';
import { PaytrService } from '@modules/payments/paytr.service';
import {
  InitializePaymentDto,
  RetryPaymentDto,
} from '@modules/payments/dto/payments.dto';
import { User } from '@entities/user.entity';

export type PaymentProviderName = 'paytr';

@Injectable()
export class PaymentsService {
  constructor(private readonly paytr: PaytrService) {}

  activeProvider(): PaymentProviderName {
    return 'paytr';
  }

  initializeCheckout(dto: InitializePaymentDto, userIp?: string) {
    return this.paytr.initializeCheckout(dto, userIp);
  }

  retryCheckout(dto: RetryPaymentDto, user?: User | null, userIp?: string) {
    return this.paytr.retryCheckout(dto, user, userIp);
  }
}
