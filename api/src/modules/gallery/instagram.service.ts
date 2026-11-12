import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type IgMedia = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type IgMediaResponse = {
  data?: IgMedia[];
  paging?: { next?: string };
  error?: { message: string };
};

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('instagram.accessToken'));
  }

  profileUrl(): string {
    const username =
      this.config.get<string>('instagram.username') || 'herbalkapida';
    return `https://www.instagram.com/${username.replace(/^@/, '')}/`;
  }

  private accessToken(): string | null {
    const raw = this.config.get<string>('instagram.accessToken') || '';
    // .env'den gelen tırnak, boşluk ve \r karakterlerini temizle
    const token = raw.trim().replace(/^['"]|['"]$/g, '').trim();
    return token || null;
  }

  /**
   * EAA… ile başlayan token'lar Facebook Login (Instagram Graph API) token'ıdır
   * ve yalnızca graph.facebook.com'da çalışır. IGAA… / IG… token'ları ise
   * Instagram Login token'ıdır ve graph.instagram.com'da çalışır.
   */
  private isFacebookToken(token: string): boolean {
    return token.startsWith('EAA');
  }

  private mediaBase(path: 'media' | 'stories', token: string): string {
    const userId = (this.config.get<string>('instagram.userId') || '').trim();
    if (this.isFacebookToken(token)) {
      if (!userId) {
        throw new BadRequestException(
          'Instagram API: EAA… (Facebook) token için INSTAGRAM_USER_ID olarak Instagram Business hesap ID (17841…) girilmeli.',
        );
      }
      return `https://graph.facebook.com/v21.0/${userId}/${path}`;
    }
    return `https://graph.instagram.com/v21.0/${userId || 'me'}/${path}`;
  }

  async fetchRecentMedia(limit = 24): Promise<IgMedia[]> {
    const token = this.accessToken();
    if (!token) return [];

    const fields =
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const url = `${this.mediaBase('media', token)}?fields=${fields}&limit=${Math.min(limit, 50)}&access_token=${encodeURIComponent(token)}`;
    return this.paginateMedia(url, limit, true);
  }

  /** Aktif Instagram hikayeleri (≈24 saat). Kalıcı DB’ye yazılmaz. */
  async fetchStories(): Promise<IgMedia[]> {
    const token = this.accessToken();
    if (!token) return [];

    const fields = 'id,media_type,media_url,thumbnail_url,permalink,timestamp';
    try {
      const url = `${this.mediaBase('stories', token)}?fields=${fields}&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      const json = (await res.json()) as IgMediaResponse;
      if (!res.ok || json.error) {
        this.logger.warn(
          `Instagram stories: ${json.error?.message || res.statusText}`,
        );
        return [];
      }
      return (json.data || []).filter(
        (row) => row.media_url || row.thumbnail_url,
      );
    } catch (err) {
      this.logger.warn(
        `Instagram stories fetch failed: ${err instanceof Error ? err.message : err}`,
      );
      return [];
    }
  }

  private async paginateMedia(
    startUrl: string,
    limit: number,
    throwIfEmptyError: boolean,
  ): Promise<IgMedia[]> {
    const items: IgMedia[] = [];
    let nextUrl: string | undefined = startUrl;

    while (nextUrl && items.length < limit) {
      const res = await fetch(nextUrl);
      const json = (await res.json()) as IgMediaResponse;
      if (!res.ok || json.error) {
        const msg =
          json.error?.message || res.statusText || 'Instagram API hatası';
        this.logger.warn(`Instagram API: ${msg}`);
        if (throwIfEmptyError && items.length === 0) {
          throw new BadRequestException(`Instagram API: ${msg}`);
        }
        break;
      }
      for (const row of json.data || []) {
        if (row.media_url || row.thumbnail_url) {
          items.push(row);
        }
        if (items.length >= limit) break;
      }
      nextUrl = json.paging?.next;
    }

    return items.slice(0, limit);
  }
}
