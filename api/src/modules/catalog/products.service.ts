import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { ProductTranslations } from '@common/catalog/localization.types';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Product } from '@entities/product.entity';
import { ProductVariant } from '@entities/product-variant.entity';
import { Category } from '@entities/category.entity';
import {
  CreateProductDto,
  ProductQueryDto,
  ProductVariantDto,
  UpdateProductDto,
} from '@modules/catalog/dto/catalog.dto';
import { paginateResult, PaginatedResult } from '@common/utils/pagination';
import { LowStockService } from '@modules/catalog/low-stock.service';
import { CampaignsService } from '@modules/campaigns/campaigns.service';
import { sortByWeightLabel } from '@common/utils/weight-sort';
import {
  assertImagesByLocaleWhenNotShared,
  assertRequiredLocales,
  ensureProductPrices,
  localizeProductForCatalog,
  normalizeCurrency,
  normalizeLocale,
} from '@common/catalog/localization.util';

/** Seed / varsayılan kategori slug → ürün kind eşlemesi */
const CATEGORY_SLUG_KIND: Record<string, string> = {
  'kilo-kontrolu': 'supplement',
  icecekler: 'beverage',
  'avantajli-setler': 'supplement',
  'takviye-edici': 'supplement',
  'sporcu-urunleri': 'supplement',
  atistirmalik: 'other',
  'kisisel-bakim': 'other',
  'tanitim-urunleri': 'other',
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly lowStock: LowStockService,
    private readonly campaigns: CampaignsService,
  ) {}

  async findAllPublic(
    query: ProductQueryDto = {},
  ): Promise<PaginatedResult<Product>> {
    const locale = normalizeLocale(query.locale);
    const currency = normalizeCurrency(query.currency, locale);
    const result = await this.queryProducts({
      ...query,
      includeInactive: false,
    });
    result.items = result.items.map((p) =>
      localizeProductForCatalog(p, locale, currency),
    );
    result.items = await this.campaigns.decorateProducts(result.items, locale);
    return result;
  }

  async findAllAdmin(
    query: ProductQueryDto = {},
  ): Promise<PaginatedResult<Product>> {
    return this.queryProducts({
      ...query,
      includeInactive: query.includeInactive ?? true,
    });
  }

  private async queryProducts(
    query: ProductQueryDto,
  ): Promise<PaginatedResult<Product>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 12;
    const sort = query.sort || 'name';
    const orderDir = (
      query.order || (sort === 'name' ? 'asc' : 'desc')
    ).toUpperCase() as 'ASC' | 'DESC';

    const qb = this.em
      .createQueryBuilder(Product, 'p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.variants', 'variants');

    if (!query.includeInactive) {
      qb.andWhere('p.is_active = true');
    }

    if (query.featured === true) {
      qb.andWhere('p.is_featured = true');
    }

    if (query.categoryId) {
      qb.andWhere('p.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.categorySlug) {
      qb.andWhere('category.slug = :categorySlug', {
        categorySlug: query.categorySlug,
      });
    }

    if (query.originCountry) {
      qb.andWhere('p.origin_country ILIKE :originCountry', {
        originCountry: `%${query.originCountry}%`,
      });
    }

    if (query.kind) {
      qb.andWhere('p.kind = :kind', { kind: query.kind });
    }

    if (query.minPrice != null && !Number.isNaN(query.minPrice)) {
      qb.andWhere('p.base_price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice != null && !Number.isNaN(query.maxPrice)) {
      qb.andWhere('p.base_price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`;
      qb.andWhere(
        `(
          p.name ILIKE :q OR
          p.slug ILIKE :q OR
          p.description ILIKE :q OR
          COALESCE(p.short_description, '') ILIKE :q OR
          COALESCE(p.origin_country, '') ILIKE :q OR
          COALESCE(p.origin_region, '') ILIKE :q OR
          COALESCE(p.process, '') ILIKE :q OR
          COALESCE(p.varietal, '') ILIKE :q OR
          COALESCE(p.batch_id, '') ILIKE :q OR
          COALESCE(p.badge, '') ILIKE :q OR
          EXISTS (
            SELECT 1 FROM unnest(p.flavor_notes) AS note
            WHERE note ILIKE :q
          )
        )`,
        { q },
      );
    }

    const sortMap: Record<string, string> = {
      name: 'p.name',
      price: 'p.base_price',
      createdAt: 'p.created_at',
      stock: 'p.stock',
    };
    const sortColumn = sortMap[sort] || 'p.name';

    if (!query.includeInactive) {
      // Vitrin: önce kategori sırası, sonra kullanıcı sıralaması (NULLS LAST ≈ COALESCE(..., 9999))
      qb.orderBy('category.sort_order', 'ASC', 'NULLS LAST');
      qb.addOrderBy(sortColumn, orderDir);
      if (sort !== 'name') {
        qb.addOrderBy('p.name', 'ASC');
      }
    } else {
      qb.orderBy(sortColumn, orderDir);
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    for (const item of items) {
      this.sortProductVariants(item);
    }

    return paginateResult(items, total, page, limit);
  }

  async findBySlug(
    slug: string,
    query: Pick<ProductQueryDto, 'locale' | 'currency'> = {},
  ): Promise<Product> {
    const locale = normalizeLocale(query.locale);
    const currency = normalizeCurrency(query.currency, locale);
    const normalized = slug.trim().toLowerCase();
    let product: Product | null;
    if (locale === 'tr') {
      product = await this.em.findOne(Product, {
        where: { slug: normalized, isActive: true },
        relations: { category: true, variants: true },
      });
    } else {
      product = await this.em
        .createQueryBuilder(Product, 'p')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.variants', 'variants')
        .where('p.is_active = true')
        .andWhere(
          `(p.slug = :slug OR p.translations -> :locale ->> 'slug' = :slug)`,
          { slug: normalized, locale },
        )
        .getOne();
    }
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }
    this.sortProductVariants(product);
    const localized = localizeProductForCatalog(product, locale, currency);
    return await this.campaigns.decorateProduct(localized, locale);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.em.findOne(Product, {
      where: { id },
      relations: { category: true, variants: true },
    });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }
    this.sortProductVariants(product);
    return product;
  }

  private validateProductI18n(
    dto: Pick<
      CreateProductDto,
      'translations' | 'useSharedImage' | 'imageUrl' | 'imagesByLocale'
    >,
  ): void {
    assertRequiredLocales(
      dto.translations as ProductTranslations | null | undefined,
      ['name', 'description', 'slug'],
      'Ürün',
    );
    assertImagesByLocaleWhenNotShared(
      dto.useSharedImage,
      dto.imageUrl,
      dto.imagesByLocale,
    );
  }

  async create(dto: CreateProductDto): Promise<Product> {
    this.validateProductI18n(dto);
    const exists = await this.em.findOne(Product, {
      where: { slug: dto.slug },
    });
    if (exists) {
      throw new ConflictException('Bu slug zaten kullanılıyor');
    }
    const { variants, ...productFields } = dto;
    let kind = productFields.kind ?? 'other';
    let category: Category | null = null;
    if (productFields.categoryId) {
      category = await this.em.findOne(Category, {
        where: { id: productFields.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Kategori bulunamadı');
      }
      if (!productFields.kind) {
        const mapped = CATEGORY_SLUG_KIND[category.slug];
        if (mapped) kind = mapped;
      }
    }
    const product = this.em.create(Product, {
      slug: productFields.slug,
      name: productFields.name,
      description: productFields.description,
      shortDescription: productFields.shortDescription ?? null,
      seoTitle: productFields.seoTitle ?? null,
      seoDescription: productFields.seoDescription ?? null,
      originCountry: productFields.originCountry ?? null,
      originRegion: productFields.originRegion ?? null,
      altitude: productFields.altitude ?? null,
      process: productFields.process ?? null,
      varietal: productFields.varietal ?? null,
      batchId: productFields.batchId ?? null,
      flavorNotes: productFields.flavorNotes ?? [],
      imageUrl: productFields.imageUrl ?? null,
      imagesByLocale: productFields.imagesByLocale ?? {},
      useSharedImage: productFields.useSharedImage !== false,
      gallery: productFields.gallery ?? [],
      badge: productFields.badge ?? null,
      basePrice: productFields.basePrice,
      prices: ensureProductPrices(
        productFields.basePrice,
        productFields.prices,
      ),
      translations: productFields.translations ?? null,
      priceTaxIncluded: productFields.priceTaxIncluded ?? true,
      currency: productFields.currency ?? 'TRY',
      stock: productFields.stock ?? 0,
      isActive: productFields.isActive ?? true,
      isFeatured: productFields.isFeatured ?? false,
      category,
      categoryId: category?.id ?? productFields.categoryId ?? null,
      hepsiburadaCategoryId: productFields.hepsiburadaCategoryId?.trim()
        ? productFields.hepsiburadaCategoryId.trim()
        : null,
      hepsiburadaAttributes:
        productFields.hepsiburadaAttributes &&
        typeof productFields.hepsiburadaAttributes === 'object'
          ? productFields.hepsiburadaAttributes
          : null,
      kind,
      unit: productFields.unit ?? 'adet',
      barcode: productFields.barcode ?? null,
      expiresAt: productFields.expiresAt ?? null,
      allergens: productFields.allergens ?? [],
      ingredients: productFields.ingredients ?? null,
      brewGuide: productFields.brewGuide ?? null,
      storageNotes: productFields.storageNotes ?? null,
      vatRate:
        productFields.vatRate != null ? String(productFields.vatRate) : '20.00',
    });
    const saved = await this.em.save(product);
    if (variants?.length) {
      await this.syncVariants(saved.id, variants);
    }
    await this.safeLowStockCheck(saved.id);
    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    this.validateProductI18n({
      translations:
        dto.translations !== undefined ? dto.translations : product.translations,
      useSharedImage:
        dto.useSharedImage !== undefined
          ? dto.useSharedImage
          : product.useSharedImage,
      imageUrl:
        dto.imageUrl !== undefined ? dto.imageUrl : product.imageUrl,
      imagesByLocale:
        dto.imagesByLocale !== undefined
          ? dto.imagesByLocale
          : product.imagesByLocale,
    });
    if (dto.slug && dto.slug !== product.slug) {
      const exists = await this.em.findOne(Product, {
        where: { slug: dto.slug },
      });
      if (exists) {
        throw new ConflictException('Bu slug zaten kullanılıyor');
      }
    }
    const {
      variants,
      categoryId,
      kind,
      prices: _prices,
      translations: _translations,
      priceTaxIncluded: _priceTaxIncluded,
      ...rest
    } = dto;

    // category ilişkisi yüklüyken yalnız categoryId atamak TypeORM'de FK'yi
    // güncellemez; ilişkiyi açıkça set etmek gerekir.
    if (categoryId !== undefined) {
      if (categoryId) {
        const category = await this.em.findOne(Category, {
          where: { id: categoryId },
        });
        if (!category) {
          throw new NotFoundException('Kategori bulunamadı');
        }
        product.category = category;
        product.categoryId = category.id;
        if (kind === undefined) {
          const mapped = CATEGORY_SLUG_KIND[category.slug];
          if (mapped) {
            product.kind = mapped;
          }
        }
      } else {
        product.category = null;
        product.categoryId = null;
      }
    }

    if (kind !== undefined) {
      product.kind = kind;
    }

    if (dto.prices !== undefined) {
      product.prices = ensureProductPrices(
        dto.basePrice ?? product.basePrice,
        dto.prices,
      );
    } else if (dto.basePrice !== undefined) {
      product.prices = ensureProductPrices(dto.basePrice, product.prices);
    }
    if (dto.translations !== undefined) {
      product.translations = dto.translations ?? null;
    }
    if (dto.imagesByLocale !== undefined) {
      product.imagesByLocale = dto.imagesByLocale ?? {};
    }
    if (dto.useSharedImage !== undefined) {
      product.useSharedImage = dto.useSharedImage;
    }
    if (dto.priceTaxIncluded !== undefined) {
      product.priceTaxIncluded = dto.priceTaxIncluded;
    }

    Object.assign(product, {
      ...rest,
      hepsiburadaCategoryId:
        rest.hepsiburadaCategoryId !== undefined
          ? rest.hepsiburadaCategoryId?.trim() || null
          : product.hepsiburadaCategoryId,
      hepsiburadaAttributes:
        rest.hepsiburadaAttributes !== undefined
          ? rest.hepsiburadaAttributes &&
            typeof rest.hepsiburadaAttributes === 'object'
            ? rest.hepsiburadaAttributes
            : null
          : product.hepsiburadaAttributes,
      shortDescription:
        rest.shortDescription !== undefined
          ? rest.shortDescription
          : product.shortDescription,
      seoTitle:
        rest.seoTitle !== undefined ? rest.seoTitle || null : product.seoTitle,
      seoDescription:
        rest.seoDescription !== undefined
          ? rest.seoDescription || null
          : product.seoDescription,
      brewGuide:
        rest.brewGuide !== undefined ? rest.brewGuide : product.brewGuide,
      storageNotes:
        rest.storageNotes !== undefined
          ? rest.storageNotes || null
          : product.storageNotes,
    });
    if (rest.vatRate !== undefined) {
      product.vatRate = String(rest.vatRate);
    }
    await this.em.save(product);
    if (variants !== undefined) {
      await this.syncVariants(product.id, variants);
    }
    await this.safeLowStockCheck(product.id);
    return this.findById(product.id);
  }

  private sortProductVariants(product: Product): void {
    if (product.variants?.length) {
      product.variants = sortByWeightLabel(product.variants);
    }
  }

  private async syncVariants(
    productId: string,
    variants: ProductVariantDto[],
  ): Promise<void> {
    const existing = await this.em.find(ProductVariant, {
      where: { productId },
    });
    const keepIds = new Set(
      variants.map((v) => v.id).filter((id): id is string => Boolean(id)),
    );

    for (const row of existing) {
      if (!keepIds.has(row.id)) {
        await this.em.remove(row);
      }
    }

    for (const v of variants) {
      if (v.id) {
        const current = existing.find((e) => e.id === v.id);
        if (!current) continue;
        current.sku = v.sku;
        current.weightLabel = v.weightLabel;
        current.price = v.price;
        current.prices =
          v.prices != null
            ? ensureProductPrices(v.price, v.prices)
            : ensureProductPrices(v.price, current.prices);
        current.categoryKey =
          v.categoryKey !== undefined
            ? v.categoryKey?.trim() || null
            : current.categoryKey;
        current.translations =
          v.translations !== undefined ? v.translations ?? null : current.translations;
        current.stock = v.stock ?? current.stock;
        current.isActive = v.isActive ?? true;
        if (v.barcode !== undefined) current.barcode = v.barcode || null;
        if (v.expiresAt !== undefined) current.expiresAt = v.expiresAt || null;
        await this.em.save(current);
      } else {
        await this.em.save(
          this.em.create(ProductVariant, {
            productId,
            sku: v.sku,
            weightLabel: v.weightLabel,
            price: v.price,
            prices: ensureProductPrices(v.price, v.prices),
            categoryKey: v.categoryKey?.trim() || null,
            translations: v.translations ?? null,
            stock: v.stock ?? 0,
            isActive: v.isActive ?? true,
            barcode: v.barcode || null,
            expiresAt: v.expiresAt || null,
          }),
        );
      }
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.em.remove(product);
  }

  private async safeLowStockCheck(productId: string): Promise<void> {
    try {
      await this.lowStock.checkAndAlert(productId);
    } catch {
      // stok kaydı asıl işlem; bildirim hatası checkout'u bozmasın
    }
  }
}
