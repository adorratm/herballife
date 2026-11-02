import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AccountingSettings } from '@entities/accounting-settings.entity';
import { UpdateAccountingSettingsDto } from '@modules/accounting/dto/accounting.dto';

export type AccountingSettingsPublic = Omit<
  AccountingSettings,
  'paytrMerchantKey' | 'paytrMerchantSalt'
> & {
  paytrMerchantKeySet: boolean;
  paytrMerchantSaltSet: boolean;
};

@Injectable()
export class AccountingSettingsService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async get(): Promise<AccountingSettings> {
    let row = await this.em.findOne(AccountingSettings, { where: {} });
    if (!row) {
      row = await this.em.save(
        this.em.create(AccountingSettings, {
          companyTitle: 'Herbal Kapıda',
        }),
      );
    }
    return row;
  }

  async getPublic(): Promise<AccountingSettingsPublic> {
    const row = await this.get();
    const {
      paytrMerchantKey: _key,
      paytrMerchantSalt: _salt,
      ...rest
    } = row;
    return {
      ...rest,
      paytrMerchantKeySet: Boolean(row.paytrMerchantKey?.trim()),
      paytrMerchantSaltSet: Boolean(row.paytrMerchantSalt?.trim()),
    };
  }

  async update(dto: UpdateAccountingSettingsDto): Promise<AccountingSettingsPublic> {
    const row = await this.get();

    if (dto.companyTitle !== undefined) row.companyTitle = dto.companyTitle;
    if (dto.vkn !== undefined) row.vkn = dto.vkn || null;
    if (dto.taxOffice !== undefined) row.taxOffice = dto.taxOffice || null;
    if (dto.address !== undefined) row.address = dto.address || null;
    if (dto.city !== undefined) row.city = dto.city || null;
    if (dto.earchivePrefix !== undefined)
      row.earchivePrefix = dto.earchivePrefix;
    if (dto.einvoicePrefix !== undefined)
      row.einvoicePrefix = dto.einvoicePrefix;
    if (dto.autoEmailInvoiceOnGib !== undefined) {
      row.autoEmailInvoiceOnGib = Boolean(dto.autoEmailInvoiceOnGib);
    }
    if (dto.paytrCommissionRatePercent !== undefined) {
      row.paytrCommissionRatePercent = String(dto.paytrCommissionRatePercent);
    }
    if (dto.paytrMerchantId !== undefined) {
      row.paytrMerchantId = dto.paytrMerchantId?.trim() || null;
    }
    // Boş string = secret’ı değiştirme
    if (dto.paytrMerchantKey !== undefined && dto.paytrMerchantKey.trim()) {
      row.paytrMerchantKey = dto.paytrMerchantKey.trim();
    }
    if (dto.paytrMerchantSalt !== undefined && dto.paytrMerchantSalt.trim()) {
      row.paytrMerchantSalt = dto.paytrMerchantSalt.trim();
    }
    if (dto.paytrTestMode !== undefined) {
      row.paytrTestMode =
        dto.paytrTestMode === '0' || dto.paytrTestMode === '1'
          ? dto.paytrTestMode
          : null;
    }
    if (dto.paytrDebugOn !== undefined) {
      row.paytrDebugOn =
        dto.paytrDebugOn === '0' || dto.paytrDebugOn === '1'
          ? dto.paytrDebugOn
          : null;
    }

    await this.em.save(row);
    return this.getPublic();
  }
}
