import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizePhoneE164 } from '@common/utils/phone';

export type SendWhatsAppInput = {
  to: string;
  body: string;
};

export type WhatsAppTemplateComponent = {
  type: 'body' | 'header' | 'button';
  sub_type?: string;
  index?: string;
  parameters: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; image: { link: string } }
  >;
};

export type SendWhatsAppTemplateInput = {
  to: string;
  templateName: string;
  languageCode: string;
  components?: WhatsAppTemplateComponent[];
};

export interface IWhatsAppProvider {
  send(input: SendWhatsAppInput): Promise<{ id?: string }>;
  sendTemplate(input: SendWhatsAppTemplateInput): Promise<{ id?: string }>;
}

@Injectable()
export class ConsoleWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(ConsoleWhatsAppProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(input: SendWhatsAppInput): Promise<{ id?: string }> {
    const from = this.config.get<string>('whatsapp.from') || '+905553332211';
    const to = normalizePhoneE164(input.to) || input.to;
    this.logger.log(
      `[console-whatsapp] from=${from} to=${to} body=${input.body}`,
    );
    return { id: `console-wa-${Date.now()}` };
  }

  async sendTemplate(
    input: SendWhatsAppTemplateInput,
  ): Promise<{ id?: string }> {
    const to = normalizePhoneE164(input.to) || input.to;
    this.logger.log(
      `[console-whatsapp-template] to=${to} template=${input.templateName} lang=${input.languageCode} components=${JSON.stringify(input.components || [])}`,
    );
    return { id: `console-wa-tpl-${Date.now()}` };
  }
}

/**
 * Meta WhatsApp Cloud API — otomatik sipariş bildirimleri için.
 * Not: Aynı numara hem WhatsApp Business uygulamasında hem Cloud API’de
 * aynı anda kullanılamaz. Müşteri sohbeti uygulama ile yapılıyorsa
 * otomatik gönderim kapalı (console) kalabilir.
 */
@Injectable()
export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);

  constructor(private readonly config: ConfigService) {}

  private async postMessage(body: Record<string, unknown>) {
    const token = this.config.get<string>('whatsapp.metaToken');
    const phoneNumberId = this.config.get<string>('whatsapp.metaPhoneNumberId');
    if (!token || !phoneNumberId) {
      throw new Error(
        'Meta WhatsApp credentials eksik (META_WA_TOKEN / META_WA_PHONE_NUMBER_ID)',
      );
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data = (await res.json()) as {
      messages?: { id: string }[];
      error?: { message: string };
    };

    if (!res.ok || data.error) {
      throw new Error(
        `Meta WhatsApp hata: ${data.error?.message || res.status}`,
      );
    }

    return data.messages?.[0]?.id;
  }

  async send(input: SendWhatsAppInput): Promise<{ id?: string }> {
    const e164 = normalizePhoneE164(input.to);
    if (!e164) {
      throw new Error(`Geçersiz WhatsApp numarası: ${input.to}`);
    }

    const id = await this.postMessage({
      messaging_product: 'whatsapp',
      to: e164.replace(/\D/g, ''),
      type: 'text',
      text: { body: input.body, preview_url: false },
    });

    this.logger.log(`Meta WhatsApp sent: ${id}`);
    return { id };
  }

  async sendTemplate(
    input: SendWhatsAppTemplateInput,
  ): Promise<{ id?: string }> {
    const e164 = normalizePhoneE164(input.to);
    if (!e164) {
      throw new Error(`Geçersiz WhatsApp numarası: ${input.to}`);
    }

    const template: Record<string, unknown> = {
      name: input.templateName,
      language: { code: input.languageCode },
    };
    if (input.components?.length) {
      template.components = input.components;
    }

    const id = await this.postMessage({
      messaging_product: 'whatsapp',
      to: e164.replace(/\D/g, ''),
      type: 'template',
      template,
    });

    this.logger.log(`Meta WhatsApp template sent: ${id}`);
    return { id };
  }
}

@Injectable()
export class WhatsAppProviderRouter implements IWhatsAppProvider {
  private readonly logger = new Logger(WhatsAppProviderRouter.name);
  private readonly provider: IWhatsAppProvider;

  constructor(
    config: ConfigService,
    consoleWa: ConsoleWhatsAppProvider,
    metaWa: MetaWhatsAppProvider,
  ) {
    const name = (
      config.get<string>('whatsapp.provider') || 'console'
    ).toLowerCase();
    this.provider = name === 'meta' ? metaWa : consoleWa;
    const from = config.get<string>('whatsapp.from') || '+905553332211';
    this.logger.log(
      `WhatsApp provider: ${name === 'meta' ? 'meta' : 'console'} (from=${from})`,
    );
  }

  send(input: SendWhatsAppInput) {
    return this.provider.send(input);
  }

  sendTemplate(input: SendWhatsAppTemplateInput) {
    return this.provider.sendTemplate(input);
  }
}
