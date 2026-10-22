import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Campaign } from '@entities/campaign.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
} from '@modules/campaigns/dto/campaigns.dto';

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

  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const slug = this.slugify(dto.slug || dto.name);
    const existing = await this.em.findOne(Campaign, { where: { slug } });
    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor');
    }
    const row = this.em.create(Campaign, {
      name: dto.name.trim(),
      slug,
      discountPercent: Number(dto.discountPercent).toFixed(2),
      badge: dto.badge?.trim() || null,
      theme: dto.theme?.trim() || 'default',
      headline: dto.headline?.trim() || null,
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
    if (dto.badge !== undefined) {
      row.badge = dto.badge?.trim() || null;
    }
    if (dto.theme !== undefined) {
      row.theme = dto.theme?.trim() || 'default';
    }
    if (dto.headline !== undefined) {
      row.headline = dto.headline?.trim() || null;
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
  async listActiveNow(): Promise<Campaign[]> {
    const now = new Date();
    const rows = await this.em.find(Campaign, {
      where: { isActive: true },
      order: { discountPercent: 'DESC' },
    });
    return rows.filter((c) => {
      if (c.startsAt && c.startsAt.getTime() > now.getTime()) return false;
      if (c.endsAt && c.endsAt.getTime() < now.getTime()) return false;
      return true;
    });
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
  ): Promise<CampaignPriceInfo | null> {
    const campaign = await this.resolveForProduct(productId);
    if (!campaign) return null;
    const percent = Number(campaign.discountPercent);
    return {
      compareAtPrice: Number(basePrice).toFixed(2),
      salePrice: this.applyPercent(basePrice, percent),
      campaignName: campaign.name,
      discountPercent: percent,
      campaignBadge: campaign.badge,
      campaignTheme: campaign.theme,
      campaignHeadline: campaign.headline,
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
    const info = await this.priceForProduct(product.id, product.basePrice);
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
    const active = await this.listActiveNow();
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
      const percent = Number(campaign.discountPercent);
      const info: CampaignPriceInfo = {
        salePrice: this.applyPercent(product.basePrice, percent),
        compareAtPrice: Number(product.basePrice).toFixed(2),
        campaignName: campaign.name,
        discountPercent: percent,
        campaignBadge: campaign.badge,
        campaignTheme: campaign.theme,
        campaignHeadline: campaign.headline,
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
