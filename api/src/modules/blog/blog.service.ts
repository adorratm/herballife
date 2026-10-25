import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BlogPost } from '@entities/blog-post.entity';
import {
  BlogQueryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from '@modules/blog/dto/blog.dto';
import { PaginatedResult, paginateResult } from '@common/utils/pagination';
import type { BlogTranslations } from '@common/catalog/localization.types';
import {
  applyBlogLocale,
  assertImagesByLocaleWhenNotShared,
  assertRequiredLocales,
  normalizeLocale,
  sqlMatchSlugAnyLocale,
} from '@common/catalog/localization.util';

@Injectable()
export class BlogService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  private validateBlogI18n(
    dto: Pick<
      CreateBlogPostDto,
      'translations' | 'useSharedImage' | 'coverImageUrl' | 'imagesByLocale'
    >,
  ): void {
    assertRequiredLocales(
      dto.translations as BlogTranslations | null | undefined,
      ['title', 'excerpt', 'content', 'slug'],
      'Blog',
    );
    assertImagesByLocaleWhenNotShared(
      dto.useSharedImage,
      dto.coverImageUrl,
      dto.imagesByLocale,
    );
  }

  async query(query: BlogQueryDto): Promise<PaginatedResult<BlogPost>> {
    const locale = normalizeLocale(query.locale);
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const sort = query.sort ?? 'publishedAt';
    const order = (query.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    const sortCol =
      sort === 'title'
        ? 'p.title'
        : sort === 'createdAt'
          ? 'p.created_at'
          : sort === 'updatedAt'
            ? 'p.updated_at'
            : 'p.published_at';

    const qb = this.em.createQueryBuilder(BlogPost, 'p');

    if (!query.includeDrafts) {
      qb.andWhere('p.is_published = true');
    }

    if (query.q?.trim()) {
      const like = `%${query.q.trim()}%`;
      qb.andWhere(
        `(p.title ILIKE :like OR p.slug ILIKE :like OR COALESCE(p.excerpt,'') ILIKE :like OR COALESCE(p.author_name,'') ILIKE :like)`,
        { like },
      );
    }

    if (query.tag?.trim()) {
      qb.andWhere(`:tag = ANY(p.tags)`, { tag: query.tag.trim() });
    }

    if (query.categorySlug?.trim()) {
      qb.andWhere(`:categorySlug = ANY(p.related_category_slugs)`, {
        categorySlug: query.categorySlug.trim(),
      });
    }

    qb.orderBy(sortCol, order, 'NULLS LAST').addOrderBy('p.created_at', 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const localized = items.map((p) => applyBlogLocale(p, locale));
    return paginateResult(localized, total, page, limit);
  }

  async getBySlug(
    slug: string,
    includeDraft = false,
    localeRaw?: string | null,
  ): Promise<BlogPost> {
    const locale = normalizeLocale(localeRaw);
    const normalized = slug.trim().toLowerCase();
    const qb = this.em
      .createQueryBuilder(BlogPost, 'p')
      .andWhere(sqlMatchSlugAnyLocale('p'), { slug: normalized });
    if (!includeDraft) {
      qb.andWhere('p.is_published = true');
    }
    const post = await qb.getOne();
    if (!post) {
      throw new NotFoundException('Blog yazısı bulunamadı');
    }
    return applyBlogLocale(post, locale);
  }

  async getById(id: string): Promise<BlogPost> {
    const post = await this.em.findOne(BlogPost, { where: { id } });
    if (!post) {
      throw new NotFoundException('Blog yazısı bulunamadı');
    }
    return post;
  }

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    this.validateBlogI18n(dto);
    const existing = await this.em.findOne(BlogPost, {
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor');
    }

    const post = this.em.create(BlogPost, {
      slug: dto.slug,
      title: dto.title,
      excerpt: dto.excerpt ?? null,
      content: dto.content,
      coverImageUrl: dto.coverImageUrl ?? null,
      translations: dto.translations ?? null,
      imagesByLocale: dto.imagesByLocale ?? {},
      useSharedImage: dto.useSharedImage !== false,
      authorName: dto.authorName ?? null,
      tags: dto.tags ?? [],
      relatedProductSlugs: normalizeSlugs(dto.relatedProductSlugs),
      relatedCategorySlugs: normalizeSlugs(dto.relatedCategorySlugs),
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
      isPublished: dto.isPublished ?? false,
      publishedAt: dto.isPublished ? new Date() : null,
      locale: dto.locale ?? 'tr',
    });
    return this.em.save(post);
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const post = await this.getById(id);

    this.validateBlogI18n({
      translations:
        dto.translations !== undefined ? dto.translations : post.translations,
      useSharedImage:
        dto.useSharedImage !== undefined
          ? dto.useSharedImage
          : post.useSharedImage,
      coverImageUrl:
        dto.coverImageUrl !== undefined
          ? dto.coverImageUrl
          : post.coverImageUrl,
      imagesByLocale:
        dto.imagesByLocale !== undefined
          ? dto.imagesByLocale
          : post.imagesByLocale,
    });

    if (dto.slug && dto.slug !== post.slug) {
      const existing = await this.em.findOne(BlogPost, {
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Bu slug zaten kullanılıyor');
      }
    }

    const wasPublished = post.isPublished;
    Object.assign(post, {
      ...dto,
      excerpt: dto.excerpt === undefined ? post.excerpt : dto.excerpt || null,
      coverImageUrl:
        dto.coverImageUrl === undefined
          ? post.coverImageUrl
          : dto.coverImageUrl || null,
      translations:
        dto.translations === undefined ? post.translations : dto.translations,
      imagesByLocale:
        dto.imagesByLocale === undefined
          ? post.imagesByLocale
          : dto.imagesByLocale ?? {},
      useSharedImage:
        dto.useSharedImage === undefined
          ? post.useSharedImage
          : dto.useSharedImage,
      authorName:
        dto.authorName === undefined ? post.authorName : dto.authorName || null,
      seoTitle:
        dto.seoTitle === undefined ? post.seoTitle : dto.seoTitle || null,
      seoDescription:
        dto.seoDescription === undefined
          ? post.seoDescription
          : dto.seoDescription || null,
      tags: dto.tags === undefined ? post.tags : dto.tags,
      relatedProductSlugs:
        dto.relatedProductSlugs === undefined
          ? post.relatedProductSlugs
          : normalizeSlugs(dto.relatedProductSlugs),
      relatedCategorySlugs:
        dto.relatedCategorySlugs === undefined
          ? post.relatedCategorySlugs
          : normalizeSlugs(dto.relatedCategorySlugs),
    });

    if (dto.isPublished === true && !wasPublished) {
      post.publishedAt = new Date();
    }
    if (dto.isPublished === false) {
      post.publishedAt = null;
    }

    return this.em.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.getById(id);
    await this.em.remove(post);
  }

  async listPublishedSlugs(): Promise<
    Pick<BlogPost, 'slug' | 'updatedAt' | 'publishedAt'>[]
  > {
    return this.em.find(BlogPost, {
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      order: { publishedAt: 'DESC' },
    });
  }
}

function normalizeSlugs(value?: string[] | null): string[] {
  if (!value?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value) {
    const slug = String(raw || '')
      .trim()
      .toLowerCase();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}
