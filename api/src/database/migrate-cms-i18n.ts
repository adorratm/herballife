import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { EntityManager } from 'typeorm';
import { SiteSetting } from '@entities/site-setting.entity';
import { ContentSection } from '@entities/content-section.entity';
import type { LocaleCode } from '@common/catalog/localization.types';
import { SUPPORTED_LOCALES } from '@common/catalog/localization.types';
import {
  CMS_SECTION_LOCALE_BLOCKS,
  CMS_SETTING_LOCALE_BLOCKS,
  buildNavigationTranslations,
} from '@database/cms-i18n-translations';

const CMS_I18N_SETTING_KEYS = [
  'brand',
  'seo',
  'navigation',
  'footer',
  'whatsapp',
  'legal',
  'membership',
  'promises',
  'contact',
  'welcomePopup',
] as const;

function loadFrontendMessageLocales(): { locales: Record<string, unknown> } {
  const locales: Record<string, unknown> = {};
  const candidates = [
    join(process.cwd(), '..', 'frontend', 'messages'),
    join(process.cwd(), 'frontend', 'messages'),
  ];
  const dir = candidates.find((p) => existsSync(p));
  if (!dir) {
    console.warn('migrate-cms-i18n: frontend/messages bulunamadı, ui_messages atlanabilir');
    return { locales };
  }
  for (const loc of SUPPORTED_LOCALES) {
    const file = join(dir, `${loc}.json`);
    if (existsSync(file)) {
      locales[loc] = JSON.parse(readFileSync(file, 'utf8')) as unknown;
    }
  }
  return { locales };
}

function mergeTranslationsIntoValue(
  value: Record<string, unknown>,
  blocks: Partial<Record<LocaleCode, Record<string, unknown>>>,
): Record<string, unknown> {
  const existing = (value.translations || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const translations = { ...existing };
  for (const [loc, block] of Object.entries(blocks)) {
    if (!block) continue;
    translations[loc] = { ...(translations[loc] || {}), ...block };
  }
  return { ...value, translations };
}

export async function migrateCmsI18n(em: EntityManager): Promise<void> {
  for (const key of CMS_I18N_SETTING_KEYS) {
    const row = await em.findOne(SiteSetting, { where: { key } });
    if (!row?.value || typeof row.value !== 'object') continue;

    let value = { ...(row.value as Record<string, unknown>) };

    if (key === 'navigation') {
      const nav = value as {
        header?: { href: string; label: string }[];
        footerNav?: { href: string; label: string }[];
        footerLegal?: { href: string; label: string }[];
      };
      value = mergeTranslationsIntoValue(value, buildNavigationTranslations(nav));
    } else {
      const blocks = CMS_SETTING_LOCALE_BLOCKS[key];
      if (blocks) {
        value = mergeTranslationsIntoValue(value, blocks);
      }
    }

    row.value = value;
    await em.save(row);
    console.log('CMS i18n setting:', key);
  }

  const uiPayload = loadFrontendMessageLocales();
  if (Object.keys(uiPayload.locales).length > 0) {
    let uiRow = await em.findOne(SiteSetting, { where: { key: 'ui_messages' } });
    if (!uiRow) {
      uiRow = em.create(SiteSetting, {
        key: 'ui_messages',
        value: uiPayload,
        group: 'localization',
        description: 'next-intl UI message trees by locale',
      });
    } else {
      const prev = (uiRow.value || {}) as { locales?: Record<string, unknown> };
      uiRow.value = {
        locales: { ...(prev.locales || {}), ...uiPayload.locales },
      };
    }
    await em.save(uiRow);
    console.log('CMS i18n ui_messages updated');
  }

  const sections = await em.find(ContentSection);
  for (const section of sections) {
    const mapKey = `${section.page}:${section.sectionKey}`;
    const blocks = CMS_SECTION_LOCALE_BLOCKS[mapKey];
    if (!blocks) continue;

    const content = { ...(section.content as Record<string, unknown>) };
    section.content = mergeTranslationsIntoValue(content, blocks);
    await em.save(section);
    console.log('CMS i18n section:', mapKey);
  }
}
