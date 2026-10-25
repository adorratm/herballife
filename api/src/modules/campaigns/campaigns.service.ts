import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  Campaign,
  type CampaignItemRule,
  type CampaignRuleMode,
} from '@entities/campaign.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
} from '@modules/campaigns/dto/campaigns.dto';
import type { CampaignTranslations } from '@common/catalog/localization.types';
import {
  applyCampaignLocale,
  assertImagesByLocaleWhenNotShared,
  assertRequiredLocales,
  normalizeLocale,
} from '@common/catalog/localization.util';

export type CampaignPriceInfo = {
  salePrice: string;
  compareAtPrice: string;
  campaignName: string;
  discountPercent: number;
  campaignBadge?: string | null;
  campaignTheme?: string | null;
  campaignHeadline?: string | null;
};

@Injectable()
export class CampaignsService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async listAdmin(): Promise<Campaign[]> {
    return this.em.find(Campaign, { order: { createdAt: 'DESC' } });
  }

  private validateCampaignI18n(
    dto: Pick<
      CreateCampaignDto,
      'translations' | 'useSharedImage' | 'imageUrl' | 'imagesByLocale'
    >,
  ): void {
    assertRequiredLocales(
      dto.translations as CampaignTranslations | null | undefined,
      ['name', 'headline'],
      'Kampanya',
    );
    assertImagesByLocaleWhenNotShared(
      dto.useSharedImage,
      dto.imageUrl,
      dto.imagesByLocale,
    );
  }

  async create(dto: CreateCampaignDto): Promise<Campaign> {
    this.validateCampaignI18n(dto);
    const slug = this.slugify(dto.slug || dto.name);
    const existing = await this.em.findOne(Campaign, { where: { slug } });
    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor');
    }
    const row = this.em.create(Campaign, {
      name: dto.name.trim(),
      slug,
      discountPercent: Number(dto.discountPercent).toFixed(2),
      itemRules: this.normalizeItemRules(dto.itemRules),
      ruleMode: dto.ruleMode ?? 'flat',
      badge: dto.badge?.trim() || null,
      theme: dto.theme?.trim() || 'default',
      headline: dto.headline?.trim() || null,
      imageUrl: dto.imageUrl?.trim() || null,
      translations: dto.translations ?? null,
      imagesByLocale: dto.imagesByLocale ?? {},
      useSharedImage: dto.useSharedImage !== false,
      productIds: dto.productIds || [],
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      isActive: dto.isActive !== false,
    });
    return this.em.save(row);
  }

  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const row = await this.em.findOne(Campaign, { where: { id } });
    if (!row) throw new NotFoundException('Kampanya bulunamadı');

    this.validateCampaignI18n({
      translations:
        dto.translations !== undefined ? dto.translations : row.translations,
      useSharedImage:
        dto.useSharedImage !== undefined ? dto.useSharedImage : row.useSharedImage,
      imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : row.imageUrl,
      imagesByLocale:
        dto.imagesByLocale !== undefined
          ? dto.imagesByLocale
          : row.imagesByLocale,
    });

    if (dto.name != null) row.name = dto.name.trim();
    if (dto.slug != null) {
      const slug = this.slugify(dto.slug);
      const clash = await this.em.findOne(Campaign, { where: { slug } });
      if (clash && clash.id !== id) {
        throw new ConflictException('Bu slug zaten kullanılıyor');
      }
      row.slug = slug;
    }
    if (dto.discountPercent != null) {
      row.discountPercent = Number(dto.discountPercent).toFixed(2);
    }
    if (dto.itemRules !== undefined) {
      row.itemRules = this.normalizeItemRules(dto.itemRules);
    }
    if (dto.ruleMode !== undefined) {
      row.ruleMode = dto.ruleMode;
    }
    if (dto.badge !== undefined) {
      row.badge = dto.badge?.trim() || null;
    }
    if (dto.theme !== undefined) {
      row.theme = dto.theme?.trim() || 'default';
    }
    if (dto.headline !== undefined) {
      row.headline = dto.headline?.trim() || null;
    }
    if (dto.imageUrl !== undefined) {
      row.imageUrl = dto.imageUrl?.trim() || null;
    }
    if (dto.translations !== undefined) {
      row.translations = dto.translations ?? null;
    }
    if (dto.imagesByLocale !== undefined) {
      row.imagesByLocale = dto.imagesByLocale ?? {};
    }
    if (dto.useSharedImage !== undefined) {
      row.useSharedImage = dto.useSharedImage;
    }
    if (dto.productIds != null) row.productIds = dto.productIds;
    if (dto.startsAt !== undefined) {
      row.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      row.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }
    if (dto.isActive != null) row.isActive = dto.isActive;
    return this.em.save(row);
  }

  async remove(id: string): Promise<{ ok: true }> {
    const row = await this.em.findOne(Campaign, { where: { id } });
    if (!row) throw new NotFoundException('Kampanya bulunamadı');
    await this.em.remove(row);
    return { ok: true };
  }

  /** Şu an geçerli kampanyalar (cache’siz; düşük hacim) */
  async listActiveNow(locale?: string | null): Promise<Campaign[]> {
    const loc = normalizeLocale(locale);
    const now = new Date();
    const rows = await this.em.find(Campaign, {
      where: { isActive: true },
      order: { discountPercent: 'DESC' },
    });
    return rows
      .filter((c) => {
        if (c.startsAt && c.startsAt.getTime() > now.getTime()) return false;
        if (c.endsAt && c.endsAt.getTime() < now.getTime()) return false;
        return true;
      })
      .map((c) => applyCampaignLocale(c, loc));
  }

  /**
   * Ürün için en yüksek indirimli aktif kampanya.
   * productIds boş → tüm ürünler.
   */
  async resolveForProduct(productId: string): Promise<Campaign | null> {
    const active = await this.listActiveNow();
    const matches = active.filter(
      (c) => !c.productIds?.length || c.productIds.includes(productId),
    );
    return matches[0] || null;
  }

  /** Sepetteki 1 tabanlı sıra için geçerli indirim yüzdesi */
  effectiveDiscountPercent(
    campaign: Campaign | null | undefined,
    cartPosition: number,
  ): number {
    if (!campaign || cartPosition < 1) return 0;
    const base = Number(campaign.discountPercent) || 0;
    const mode: CampaignRuleMode = campaign.ruleMode || 'flat';
    const rules = campaign.itemRules || [];
    const rule = rules.find((r) => r.position === cartPosition);
    const nth = rule ? Number(rule.discountPercent) : 0;

    switch (mode) {
      case 'nth_item':
        return Math.min(90, Math.max(0, nth));
      case 'both':
        return Math.min(90, Math.max(0, base + nth));
      default:
        return Math.min(90, Math.max(0, base));
    }
  }

  normalizeItemRules(
    rules?: CampaignItemRule[] | null,
  ): CampaignItemRule[] {
    if (!rules?.length) return [];
    const byPos = new Map<number, number>();
    for (const r of rules) {
      const pos = Math.floor(Number(r.position));
      const pct = Number(r.discountPercent);
      if (pos >= 1 && Number.isFinite(pct)) {
        byPos.set(pos, Math.min(90, Math.max(0, pct)));
      }
    }
    return [...byPos.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([position, discountPercent]) => ({ position, discountPercent }));
  }

  applyPercent(price: string | number, percent: number): string {
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      throw new BadRequestException('Geçersiz fiyat');
    }
    const discounted = n * (1 - percent / 100);
    return Math.max(0, discounted).toFixed(2);
  }

  async priceForProduct(
    productId: string,
    basePrice: string | number,
    localeRaw?: string | null,
  ): Promise<CampaignPriceInfo | null> {
    const campaign = await this.resolveForProduct(productId);
    if (!campaign) return null;
    const loc = normalizeLocale(localeRaw);
    const localized = applyCampaignLocale(campaign, loc);
    const percent = this.effectiveDiscountPercent(campaign, 1);
    return {
      compareAtPrice: Number(basePrice).toFixed(2),
      salePrice: this.applyPercent(basePrice, percent),
      campaignName: localized.name,
      discountPercent: percent,
      campaignBadge: localized.badge ?? campaign.badge,
      campaignTheme: campaign.theme,
      campaignHeadline: localized.headline,
    };
  }

  private applyCampaignFields<
    T extends {
      salePrice?: string | null;
      compareAtPrice?: string | null;
      campaignName?: string | null;
      campaignBadge?: string | null;
      campaignTheme?: string | null;
      campaignHeadline?: string | null;
    },
  >(decorated: T, info: CampaignPriceInfo | null): T {
    if (!info) {
      decorated.salePrice = null;
      decorated.compareAtPrice = null;
      decorated.campaignName = null;
      decorated.campaignBadge = null;
      decorated.campaignTheme = null;
      decorated.campaignHeadline = null;
      return decorated;
    }
    decorated.salePrice = info.salePrice;
    decorated.compareAtPrice = info.compareAtPrice;
    decorated.campaignName = info.campaignName;
    decorated.campaignBadge = info.campaignBadge ?? null;
    decorated.campaignTheme = info.campaignTheme ?? null;
    decorated.campaignHeadline = info.campaignHeadline ?? null;
    return decorated;
  }

  async decorateProduct<
    T extends {
      id: string;
      basePrice: string;
      variants?: Array<{ price: string }>;
    },
  >(
    product: T,
    localeRaw?: string | null,
  ): Promise<
    T & {
      salePrice?: string | null;
      compareAtPrice?: string | null;
      campaignName?: string | null;
      campaignBadge?: string | null;
      campaignTheme?: string | null;
      campaignHeadline?: string | null;
    }
  > {
    const info = await this.priceForProduct(
      product.id,
      product.basePrice,
      localeRaw,
    );
    const decorated = product as T & {
      salePrice?: string | null;
      compareAtPrice?: string | null;
      campaignName?: string | null;
      campaignBadge?: string | null;
      campaignTheme?: string | null;
      campaignHeadline?: string | null;
    };
    this.applyCampaignFields(decorated, info);
    if (info && product.variants?.length) {
      decorated.variants = product.variants.map((v) => ({
        ...v,
        price: this.applyPercent(v.price, info.discountPercent),
        compareAtPrice: Number(v.price).toFixed(2),
      }));
    }
    return decorated;
  }

  async decorateProducts<
    T extends {
      id: string;
      basePrice: string;
      variants?: Array<{ price: string }>;
    },
  >(
    products: T[],
    localeRaw?: string | null,
  ): Promise<
    Array<
      T & {
        salePrice?: string | null;
        compareAtPrice?: string | null;
        campaignName?: string | null;
        campaignBadge?: string | null;
        campaignTheme?: string | null;
        campaignHeadline?: string | null;
      }
    >
  > {
    const loc = normalizeLocale(localeRaw);
    const active = await this.listActiveNow(loc);
    return products.map((product) => {
      const decorated = product as T & {
        salePrice?: string | null;
        compareAtPrice?: string | null;
        campaignName?: string | null;
        campaignBadge?: string | null;
        campaignTheme?: string | null;
        campaignHeadline?: string | null;
      };
      const campaign =
        active.find(
          (c) => !c.productIds?.length || c.productIds.includes(product.id),
        ) || null;
      if (!campaign) {
        return this.applyCampaignFields(decorated, null);
      }
      const percent = this.effectiveDiscountPercent(campaign, 1);
      const localized = applyCampaignLocale(campaign, loc);
      const info: CampaignPriceInfo = {
        salePrice: this.applyPercent(product.basePrice, percent),
        compareAtPrice: Number(product.basePrice).toFixed(2),
        campaignName: localized.name,
        discountPercent: percent,
        campaignBadge: localized.badge ?? campaign.badge,
        campaignTheme: campaign.theme,
        campaignHeadline: localized.headline,
      };
      this.applyCampaignFields(decorated, info);
      if (product.variants?.length) {
        decorated.variants = product.variants.map((v) => ({
          ...v,
          price: this.applyPercent(v.price, percent),
          compareAtPrice: Number(v.price).toFixed(2),
        }));
      }
      return decorated;
    });
  }

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 160);
  }
}
