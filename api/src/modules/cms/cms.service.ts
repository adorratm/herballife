import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { SiteSetting } from '@entities/site-setting.entity';
import { ContentSection } from '@entities/content-section.entity';
import {
  mergeCmsSettingPreserveTranslations,
  normalizeLocale,
  resolveLocalizedRecord,
} from '@common/catalog/localization.util';
import type { LocaleCode } from '@common/catalog/localization.types';
import {
  catalogEntry,
  defaultLanguages,
  isStoreLocaleCode,
  languagesToLocalizationFields,
  LOCALE_CATALOG,
  normalizeLanguages,
  type LanguageRecord,
  type LocaleCurrencyCode,
  type StoreLocaleCode,
} from '@common/catalog/locale-catalog';
import {
  BulkSiteSettingsDto,
  CreateContentSectionDto,
  UpdateContentSectionDto,
} from '@modules/cms/dto/cms.dto';

const PRIVATE_SETTING_KEYS = new Set(['wholesale_catalog', 'ui_messages']);

@Injectable()
export class CmsService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async getPublicSettings(
    localeRaw?: string | null,
  ): Promise<Record<string, Record<string, unknown>>> {
    const locale = normalizeLocale(localeRaw);
    const rows = await this.em.find(SiteSetting, {
      order: { key: 'ASC' },
    });
    return Object.fromEntries(
      rows
        .filter((row) => !PRIVATE_SETTING_KEYS.has(row.key))
        .map((row) => {
          const value = row.value as Record<string, unknown>;
          return [row.key, resolveLocalizedRecord(value, locale)];
        }),
    );
  }

  async getUiMessages(localeRaw?: string | null): Promise<Record<string, unknown>> {
    const locale = normalizeLocale(localeRaw);
    const row = await this.em.findOne(SiteSetting, {
      where: { key: 'ui_messages' },
    });
    if (!row?.value || typeof row.value !== 'object') {
      return {};
    }
    const root = row.value as {
      locales?: Partial<Record<LocaleCode, Record<string, unknown>>>;
    };
    return root.locales?.[locale] ?? root.locales?.tr ?? {};
  }

  async getUiMessagesAdmin(): Promise<{
    locales: Partial<Record<LocaleCode, Record<string, unknown>>>;
  }> {
    const row = await this.em.findOne(SiteSetting, {
      where: { key: 'ui_messages' },
    });
    const root = (row?.value || {}) as {
      locales?: Partial<Record<LocaleCode, Record<string, unknown>>>;
    };
    return { locales: root.locales || {} };
  }

  async upsertUiMessagesLocale(
    localeRaw: string,
    messages: Record<string, unknown>,
  ): Promise<{
    locales: Partial<Record<LocaleCode, Record<string, unknown>>>;
  }> {
    const locale = normalizeLocale(localeRaw);
    let row = await this.em.findOne(SiteSetting, {
      where: { key: 'ui_messages' },
    });
    const prev = ((row?.value || {}) as {
      locales?: Partial<Record<LocaleCode, Record<string, unknown>>>;
    }).locales || {};
    const next = {
      locales: {
        ...prev,
        [locale]: messages,
      },
    };
    if (!row) {
      row = this.em.create(SiteSetting, {
        key: 'ui_messages',
        value: next,
        group: 'localization',
        description: 'next-intl UI message trees by locale',
      });
    } else {
      row.value = next;
    }
    await this.em.save(row);
    return next;
  }

  private async readLocalizationRaw(): Promise<Record<string, unknown>> {
    const row = await this.em.findOne(SiteSetting, {
      where: { key: 'localization' },
    });
    return (row?.value as Record<string, unknown>) || {};
  }

  private async writeLocalization(
    value: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    let row = await this.em.findOne(SiteSetting, {
      where: { key: 'localization' },
    });
    if (!row) {
      row = this.em.create(SiteSetting, {
        key: 'localization',
        value,
        group: 'localization',
        description: 'Languages, currencies, locale→currency map',
      });
    } else {
      row.value = value;
    }
    await this.em.save(row);
    return row.value as Record<string, unknown>;
  }

  private buildLocalizationValue(
    prev: Record<string, unknown>,
    languages: LanguageRecord[],
  ): Record<string, unknown> {
    const fields = languagesToLocalizationFields(languages);
    const currencies = Array.isArray(prev.currencies)
      ? (prev.currencies as string[])
      : ['TRY', 'USD', 'EUR', 'GBP'];
    const defaultCurrency =
      typeof prev.defaultCurrency === 'string' &&
      ['TRY', 'USD', 'EUR', 'GBP'].includes(prev.defaultCurrency)
        ? prev.defaultCurrency
        : 'TRY';
    return {
      ...prev,
      ...fields,
      currencies: currencies.includes('TRY')
        ? currencies
        : ['TRY', ...currencies],
      defaultCurrency,
    };
  }

  async getLocalizationAdmin(): Promise<Record<string, unknown>> {
    const raw = await this.readLocalizationRaw();
    const languages = normalizeLanguages(
      raw.languages ??
        (Array.isArray(raw.enabledLocales)
          ? (raw.enabledLocales as string[]).map((code, i) => {
              const cat = catalogEntry(code);
              return cat
                ? {
                    code: cat.code,
                    name: cat.name,
                    nativeName: cat.nativeName,
                    enabled: true,
                    currency: cat.defaultCurrency,
                    sortOrder: i,
                  }
                : null;
            }).filter(Boolean)
          : defaultLanguages()),
    );
    return this.buildLocalizationValue(raw, languages);
  }

  async upsertLocalization(
    value: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const prev = await this.readLocalizationRaw();
    const languages = normalizeLanguages(
      value.languages ?? prev.languages ?? defaultLanguages(),
    );
    const merged = {
      ...prev,
      ...value,
      ...this.buildLocalizationValue(
        { ...prev, ...value },
        languages,
      ),
    };
    return this.writeLocalization(merged);
  }

  async listLanguagesAdmin(): Promise<{
    languages: LanguageRecord[];
    catalog: typeof LOCALE_CATALOG;
    availableToAdd: typeof LOCALE_CATALOG;
  }> {
    const loc = await this.getLocalizationAdmin();
    const languages = normalizeLanguages(loc.languages);
    const used = new Set(languages.map((l) => l.code));
    return {
      languages,
      catalog: LOCALE_CATALOG,
      availableToAdd: LOCALE_CATALOG.filter((c) => !used.has(c.code)),
    };
  }

  async createLanguage(body: {
    code: string;
    name?: string;
    nativeName?: string;
    currency?: string;
    enabled?: boolean;
    sortOrder?: number;
    copyMessagesFrom?: string;
  }): Promise<{
    languages: LanguageRecord[];
    localization: Record<string, unknown>;
  }> {
    const code = String(body.code || '')
      .toLowerCase()
      .split('-')[0];
    if (!isStoreLocaleCode(code)) {
      throw new BadRequestException(
        `Desteklenmeyen dil kodu: ${code}. Sistem havuzundan seçin.`,
      );
    }
    const cat = catalogEntry(code)!;
    const loc = await this.getLocalizationAdmin();
    const languages = normalizeLanguages(loc.languages);
    if (languages.some((l) => l.code === code)) {
      throw new BadRequestException('Bu dil zaten ekli');
    }
    const currencyRaw = String(body.currency || cat.defaultCurrency).toUpperCase();
    const currency = (
      ['TRY', 'USD', 'EUR', 'GBP'].includes(currencyRaw)
        ? currencyRaw
        : cat.defaultCurrency
    ) as LocaleCurrencyCode;
    const next: LanguageRecord = {
      code,
      name: (body.name || cat.name).trim() || cat.name,
      nativeName: (body.nativeName || cat.nativeName).trim() || cat.nativeName,
      enabled: body.enabled !== false,
      currency: code === 'tr' ? 'TRY' : currency,
      sortOrder:
        body.sortOrder ??
        Math.max(0, ...languages.map((l) => l.sortOrder)) + 1,
    };
    const updated = normalizeLanguages([...languages, next]);
    const localization = await this.writeLocalization(
      this.buildLocalizationValue(loc, updated),
    );

    // UI mesaj ağacını şablon dilden kopyala
    const from = normalizeLocale(body.copyMessagesFrom || 'en');
    const ui = await this.getUiMessagesAdmin();
    const template =
      ui.locales[from] ||
      ui.locales.en ||
      ui.locales.tr ||
      {};
    if (Object.keys(template).length > 0 && !ui.locales[code as LocaleCode]) {
      await this.upsertUiMessagesLocale(code, structuredClone(template));
    }

    return { languages: updated, localization };
  }

  async updateLanguage(
    codeRaw: string,
    body: {
      name?: string;
      nativeName?: string;
      currency?: string;
      enabled?: boolean;
      sortOrder?: number;
    },
  ): Promise<{
    languages: LanguageRecord[];
    localization: Record<string, unknown>;
  }> {
    const code = String(codeRaw || '')
      .toLowerCase()
      .split('-')[0];
    if (!isStoreLocaleCode(code)) {
      throw new NotFoundException('Dil bulunamadı');
    }
    const loc = await this.getLocalizationAdmin();
    const languages = normalizeLanguages(loc.languages);
    const idx = languages.findIndex((l) => l.code === code);
    if (idx < 0) throw new NotFoundException('Dil bulunamadı');

    const current = languages[idx];
    const currencyRaw = String(
      body.currency ?? current.currency,
    ).toUpperCase();
    const currency = (
      ['TRY', 'USD', 'EUR', 'GBP'].includes(currencyRaw)
        ? currencyRaw
        : current.currency
    ) as LocaleCurrencyCode;

    languages[idx] = {
      ...current,
      name:
        body.name !== undefined
          ? String(body.name).trim() || current.name
          : current.name,
      nativeName:
        body.nativeName !== undefined
          ? String(body.nativeName).trim() || current.nativeName
          : current.nativeName,
      enabled: code === 'tr' ? true : body.enabled ?? current.enabled,
      currency: code === 'tr' ? 'TRY' : currency,
      sortOrder:
        body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))
          ? Number(body.sortOrder)
          : current.sortOrder,
    };

    const updated = normalizeLanguages(languages);
    const localization = await this.writeLocalization(
      this.buildLocalizationValue(loc, updated),
    );
    return { languages: updated, localization };
  }

  async deleteLanguage(codeRaw: string): Promise<{
    languages: LanguageRecord[];
    localization: Record<string, unknown>;
  }> {
    const code = String(codeRaw || '')
      .toLowerCase()
      .split('-')[0] as StoreLocaleCode;
    if (code === 'tr') {
      throw new BadRequestException('Türkçe dil silinemez');
    }
    if (!isStoreLocaleCode(code)) {
      throw new NotFoundException('Dil bulunamadı');
    }
    const loc = await this.getLocalizationAdmin();
    const languages = normalizeLanguages(loc.languages).filter(
      (l) => l.code !== code,
    );
    if (languages.length === normalizeLanguages(loc.languages).length) {
      throw new NotFoundException('Dil bulunamadı');
    }
    const localization = await this.writeLocalization(
      this.buildLocalizationValue(loc, languages),
    );

    // UI mesajlarını da kaldır
    const uiRow = await this.em.findOne(SiteSetting, {
      where: { key: 'ui_messages' },
    });
    if (uiRow?.value && typeof uiRow.value === 'object') {
      const root = uiRow.value as {
        locales?: Record<string, Record<string, unknown>>;
      };
      if (root.locales?.[code]) {
        const { [code]: _removed, ...rest } = root.locales;
        uiRow.value = { locales: rest };
        await this.em.save(uiRow);
      }
    }

    return { languages, localization };
  }

  async getPublicLanguages(): Promise<{
    defaultLocale: string;
    languages: Array<{
      code: string;
      name: string;
      nativeName: string;
      currency: string;
      sortOrder: number;
    }>;
  }> {
    const loc = await this.getLocalizationAdmin();
    const languages = normalizeLanguages(loc.languages)
      .filter((l) => l.enabled)
      .map((l) => ({
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
        currency: l.currency,
        sortOrder: l.sortOrder,
      }));
    return {
      defaultLocale: String(loc.defaultLocale || 'tr'),
      languages,
    };
  }

  async listSettingsAdmin(): Promise<SiteSetting[]> {
    return this.em.find(SiteSetting, { order: { key: 'ASC' } });
  }

  async upsertSettings(dto: BulkSiteSettingsDto): Promise<SiteSetting[]> {
    const saved: SiteSetting[] = [];
    for (const item of dto.settings) {
      let row = await this.em.findOne(SiteSetting, {
        where: { key: item.key },
      });
      if (!row) {
        row = this.em.create(SiteSetting, {
          key: item.key,
          value: item.value,
          group: item.group ?? null,
          description: item.description ?? null,
        });
      } else if (item.key === 'ui_messages') {
        const prev = (row.value || {}) as {
          locales?: Record<string, Record<string, unknown>>;
        };
        const incoming = (item.value || {}) as {
          locales?: Record<string, Record<string, unknown>>;
        };
        row.value = {
          locales: {
            ...(prev.locales || {}),
            ...(incoming.locales || {}),
          },
        };
        row.group = item.group ?? row.group;
        row.description = item.description ?? row.description;
      } else if (item.key === 'localization') {
        row.value = item.value;
        row.group = item.group ?? row.group;
        row.description = item.description ?? row.description;
      } else {
        row.value = mergeCmsSettingPreserveTranslations(
          row.value as Record<string, unknown>,
          item.value as Record<string, unknown>,
        );
        row.group = item.group ?? row.group;
        row.description = item.description ?? row.description;
      }
      saved.push(await this.em.save(row));
    }
    return saved;
  }

  async getPublicSections(
    page?: string,
    localeRaw?: string | null,
  ): Promise<ContentSection[]> {
    const locale = normalizeLocale(localeRaw);
    const qb = this.em
      .createQueryBuilder(ContentSection, 's')
      .where('s.is_published = :published', { published: true })
      .orderBy('s.sort_order', 'ASC')
      .addOrderBy('s.section_key', 'ASC');

    if (page) {
      qb.andWhere('s.page = :page', { page });
    }

    const sections = await qb.getMany();
    return sections.map((section) => {
      const rawContent = section.content as Record<string, unknown>;
      const translations = rawContent.translations as
        | Partial<Record<LocaleCode, Record<string, unknown>>>
        | undefined;
      let title = section.title;
      if (locale !== 'tr') {
        const block = translations?.[locale];
        if (block && typeof block.sectionTitle === 'string') {
          title = block.sectionTitle;
        }
      }
      const content = resolveLocalizedRecord(rawContent, locale, {
        missingLocale: 'structural',
      });
      return { ...section, title, content };
    });
  }

  async listSectionsAdmin(page?: string): Promise<ContentSection[]> {
    const where = page ? { page } : {};
    return this.em.find(ContentSection, {
      where,
      order: { sortOrder: 'ASC', sectionKey: 'ASC' },
    });
  }

  async createSection(dto: CreateContentSectionDto): Promise<ContentSection> {
    const section = this.em.create(ContentSection, {
      page: dto.page,
      sectionKey: dto.sectionKey,
      title: dto.title ?? null,
      content: dto.content,
      sortOrder: dto.sortOrder ?? 0,
      isPublished: dto.isPublished ?? true,
    });
    return this.em.save(section);
  }

  async updateSection(
    id: string,
    dto: UpdateContentSectionDto,
  ): Promise<ContentSection> {
    const section = await this.em.findOne(ContentSection, { where: { id } });
    if (!section) {
      throw new NotFoundException('İçerik bölümü bulunamadı');
    }
    Object.assign(section, dto);
    return this.em.save(section);
  }

  async removeSection(id: string): Promise<void> {
    const section = await this.em.findOne(ContentSection, { where: { id } });
    if (!section) {
      throw new NotFoundException('İçerik bölümü bulunamadı');
    }
    await this.em.remove(section);
  }
}
