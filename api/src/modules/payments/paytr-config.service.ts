import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AccountingSettings } from '@entities/accounting-settings.entity';

export type PaytrCredentials = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: string;
  debugOn: string;
  noInstallment: string;
  maxInstallment: string;
};

/**
 * PayTR kimlik bilgileri: panel (accounting_settings) doluysa DB, değilse .env.
 */
@Injectable()
export class PaytrConfigService {
  constructor(
    private readonly config: ConfigService,
    @InjectEntityManager() private readonly em: EntityManager,
  ) {}

  async getCredentials(): Promise<PaytrCredentials> {
    const row = await this.em.findOne(AccountingSettings, { where: {} });
    const dbId = row?.paytrMerchantId?.trim() || '';
    const dbKey = row?.paytrMerchantKey?.trim() || '';
    const dbSalt = row?.paytrMerchantSalt?.trim() || '';
    const useDb = Boolean(dbId && dbKey && dbSalt);

    return {
      merchantId: useDb
        ? dbId
        : this.config.get<string>('paytr.merchantId') || '',
      merchantKey: useDb
        ? dbKey
        : this.config.get<string>('paytr.merchantKey') || '',
      merchantSalt: useDb
        ? dbSalt
        : this.config.get<string>('paytr.merchantSalt') || '',
      testMode:
        row?.paytrTestMode === '0' || row?.paytrTestMode === '1'
          ? row.paytrTestMode
          : this.config.get<string>('paytr.testMode') || '0',
      debugOn:
        row?.paytrDebugOn === '0' || row?.paytrDebugOn === '1'
          ? row.paytrDebugOn
          : this.config.get<string>('paytr.debugOn') || '1',
      noInstallment: this.config.get<string>('paytr.noInstallment') || '0',
      maxInstallment: this.config.get<string>('paytr.maxInstallment') || '0',
    };
  }

  async isConfigured(): Promise<boolean> {
    const c = await this.getCredentials();
    return Boolean(c.merchantId && c.merchantKey && c.merchantSalt);
  }
}
