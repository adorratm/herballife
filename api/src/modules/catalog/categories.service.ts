import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { CategoryTranslations } from '@common/catalog/localization.types';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Category } from '@entities/category.entity';
import { Product } from '@entities/product.entity';

export type PublicCategory = Category & { productCount: number };
import {
  CatalogLocaleQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@modules/catalog/dto/catalog.dto';
import {
  applyCategoryLocale,
  assertRequiredLocales,
  normalizeLocale,
  requiredExtraLocalesFromLocalization,
  sqlMatchSlugAnyLocale,
} from '@common/catalog/localization.util';
import { SiteSetting } from '@entities/site-setting.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  private async requiredExtraLocales(): Promise<string[]> {
    try {
      const row = await this.em.findOne(SiteSetting, {
        where: { key: 'localization' },
      });
      return requiredExtraLocalesFromLocalization(
        (row?.value || null) as Record<string, unknown> | null,
      );
    } catch {
      return [];
    }
  }

  async findAllPublic(
    query: CatalogLocaleQueryDto = {},
  ): Promise<PublicCategory[]> {
    const locale = normalizeLocale(query.locale);
    const rows = await this.em.find(Category, {
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    const countRows = await this.em
      .createQueryBuilder(Product, 'p')
      .select('p.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('p.isActive = :active', { active: true })
      .andWhere('p.categoryId IS NOT NULL')
      .groupBy('p.categoryId')
      .getRawMany<{ categoryId: string; count: string }>();
    const countById = new Map(
      countRows.map((r) => [r.categoryId, Number(r.count) || 0]),
    );
    return rows.map((c) => {
      const localized = applyCategoryLocale(c, locale);
      return Object.assign(localized, {
        productCount: countById.get(c.id) ?? 0,
      }) as PublicCategory;
    });
  }

  async findAllAdmin(): Promise<Category[]> {
    return this.em.find(Category, {
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findBySlug(
    slug: string,
    query: CatalogLocaleQueryDto = {},
  ): Promise<Category> {
    const locale = normalizeLocale(query.locale);
    const normalized = slug.trim().toLowerCase();
    const category = await this.em
      .createQueryBuilder(Category, 'c')
      .where('c.is_active = true')
      .andWhere(sqlMatchSlugAnyLocale('c'), { slug: normalized })
      .getOne();
    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }
    return applyCategoryLocale(category, locale);
  }

  async findById(id: string): Promise<Category> {
    const category = await this.em.findOne(Category, { where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }
    return category;
  }

  private async validateCategoryI18n(
    translations: CategoryTranslations | null | undefined,
  ): Promise<void> {
    const locales = await this.requiredExtraLocales();
    assertRequiredLocales(
      translations,
      ['name', 'description', 'slug'],
      'Kategori',
      locales,
    );
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.validateCategoryI18n(
      dto.translations as CategoryTranslations | null | undefined,
    );
    const exists = await this.em.findOne(Category, {
      where: { slug: dto.slug },
    });
    if (exists) {
      throw new ConflictException('Bu slug zaten kullanılıyor');
    }
    const category = this.em.create(Category, {
      ...dto,
      description: dto.description ?? null,
      translations: dto.translations ?? null,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
    return this.em.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    await this.validateCategoryI18n(
      (dto.translations !== undefined
        ? dto.translations
        : category.translations) as CategoryTranslations | null | undefined,
    );
    if (dto.slug && dto.slug !== category.slug) {
      const exists = await this.em.findOne(Category, {
        where: { slug: dto.slug },
      });
      if (exists) {
        throw new ConflictException('Bu slug zaten kullanılıyor');
      }
    }
    Object.assign(category, dto);
    return this.em.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.em.remove(category);
  }
}
