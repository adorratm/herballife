import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { MediaAsset } from '@entities/media-asset.entity';
import {
  convertToWebp,
  knockOutNearBlackToPng,
  shouldConvertToWebp,
  shouldProcessBrandLogo,
} from '@modules/media/image-process';
import { StorageService } from '@modules/storage/storage.service';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

const MAX_SIZE = 10 * 1024 * 1024;

@Injectable()
export class MediaService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly storage: StorageService,
  ) {}

  async upload(
    file: Express.Multer.File,
    alt?: string,
    folder = 'media',
  ): Promise<MediaAsset> {
    if (!file) {
      throw new BadRequestException('Dosya gerekli');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Desteklenmeyen dosya türü');
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Dosya boyutu 10MB sınırını aşıyor');
    }

    let buffer = file.buffer;
    let mimeType = file.mimetype;
    let filename = file.originalname;

    if (shouldProcessBrandLogo(folder, mimeType)) {
      try {
        const processed = await knockOutNearBlackToPng(buffer);
        buffer = processed.buffer;
        mimeType = processed.mimeType;
        filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + processed.ext;
      } catch {
        /* sharp yoksa veya görsel bozuksa orijinali kullan */
      }
    }

    // Logo knockout (varsa) sonrası: GIF ve SVG hariç hepsi WebP (q≈82)
    if (shouldConvertToWebp(mimeType)) {
      try {
        const webp = await convertToWebp(buffer);
        buffer = webp.buffer;
        mimeType = webp.mimeType;
        filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + webp.ext;
      } catch {
        /* dönüştürme başarısızsa mevcut buffer'ı kullan */
      }
    }

    const key = this.storage.buildKey(folder, filename);
    const uploaded = await this.storage.upload(buffer, key, mimeType);

    const asset = this.em.create(MediaAsset, {
      filename,
      storageKey: uploaded.key,
      url: uploaded.url,
      mimeType,
      size: buffer.length,
      alt: alt || null,
      provider: uploaded.provider,
    });

    return this.em.save(asset);
  }

  async listAll(): Promise<MediaAsset[]> {
    const items = await this.em.find(MediaAsset, {
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => ({
      ...item,
      url: this.storage.resolvePublicUrl(
        item.url,
        item.storageKey,
        item.provider,
      ),
    })) as MediaAsset[];
  }

  async remove(id: string): Promise<void> {
    const asset = await this.em.findOne(MediaAsset, { where: { id } });
    if (!asset) {
      throw new NotFoundException('Medya bulunamadı');
    }
    await this.storage.delete(asset.storageKey, asset.provider);
    await this.em.remove(asset);
  }
}
