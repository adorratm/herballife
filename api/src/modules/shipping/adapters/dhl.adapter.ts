import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  ShippingProviderCode,
  ShipmentStatus,
} from '@entities/shipment.entity';
import {
  CreateShipmentInput,
  CreateShipmentResult,
  TrackShipmentResult,
} from '@modules/shipping/adapters/shipping.adapter';

export const DHL_TRACKING_BASE =
  'https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=';

export function hasDhlCredentials(credentials: Record<string, string>): boolean {
  const apiKey = credentials?.apiKey?.trim();
  const apiSecret = credentials?.apiSecret?.trim();
  const accountNumber = credentials?.accountNumber?.trim();
  return Boolean(apiKey && apiSecret && accountNumber);
}

function dhlApiBase(credentials: Record<string, string>): string {
  const sandbox = credentials?.sandbox === 'true';
  return sandbox
    ? 'https://express.api.dhl.com/mydhlapi/test'
    : 'https://express.api.dhl.com/mydhlapi';
}

function basicAuth(credentials: Record<string, string>): string {
  const apiKey = credentials.apiKey.trim();
  const apiSecret = credentials.apiSecret.trim();
  return Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
}

function mapDhlStatus(code?: string): ShipmentStatus {
  const c = (code || '').toUpperCase();
  if (c.includes('DELIVERED') || c === 'OK') return ShipmentStatus.DELIVERED;
  if (c.includes('TRANSIT') || c.includes('PICKUP') || c.includes('PROCESS'))
    return ShipmentStatus.IN_TRANSIT;
  if (c.includes('LABEL') || c.includes('CREATED') || c.includes('MANIFEST'))
    return ShipmentStatus.LABEL_CREATED;
  return ShipmentStatus.IN_TRANSIT;
}

@Injectable()
export class DhlApiAdapter {
  readonly code = ShippingProviderCode.DHL;
  private readonly logger = new Logger(DhlApiAdapter.name);

  manualResult(
    trackingNumber: string,
    trackingUrl?: string | null,
    status: ShipmentStatus = ShipmentStatus.IN_TRANSIT,
  ): CreateShipmentResult {
    const code = trackingNumber.trim();
    return {
      trackingNumber: code,
      trackingUrl: trackingUrl?.trim() || `${DHL_TRACKING_BASE}${encodeURIComponent(code)}`,
      labelUrl: null,
      status,
      rawResponse: { manual: true, provider: this.code },
      mock: false,
    };
  }

  async createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    const manual = input.trackingNumber?.trim();
    if (manual) {
      return this.manualResult(
        manual,
        input.trackingUrl,
        input.manualStatus ?? ShipmentStatus.IN_TRANSIT,
      );
    }

    if (!hasDhlCredentials(input.credentials)) {
      throw new BadRequestException(
        'DHL API kimlik bilgileri eksik (apiKey, apiSecret, accountNumber). Manuel takip kodu girin veya credentials tanımlayın.',
      );
    }

    return this.createViaApi(input);
  }

  private async createViaApi(
    input: CreateShipmentInput,
  ): Promise<CreateShipmentResult> {
    const creds = input.credentials;
    const base = dhlApiBase(creds);
    const addr = input.address || {};
    const planned = new Date(Date.now() + 3600_000).toISOString();

    const payload = {
      plannedShippingDateAndTime: planned,
      pickup: { isRequested: false },
      productCode: creds.productCode?.trim() || 'N',
      accounts: [
        {
          typeCode: 'shipper',
          number: creds.accountNumber.trim(),
        },
      ],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: creds.shipperPostalCode?.trim() || '34000',
            cityName: creds.shipperCity?.trim() || 'Istanbul',
            countryCode: creds.shipperCountryCode?.trim() || 'TR',
            addressLine1: creds.shipperAddress?.trim() || 'Gönderici adresi',
          },
          contactInformation: {
            companyName: creds.shipperCompany?.trim() || 'Herbal Kapıda',
            fullName: creds.shipperName?.trim() || 'Gönderici',
            phone: creds.shipperPhone?.trim() || '+902121234567',
          },
        },
        receiverDetails: {
          postalAddress: {
            postalCode: addr.postalCode || addr.zip || '34000',
            cityName: addr.city || addr.province || 'Istanbul',
            countryCode: addr.countryCode || 'TR',
            addressLine1:
              addr.line1 || addr.addressLine1 || addr.fullAddress || 'Adres',
          },
          contactInformation: {
            companyName: input.recipientName,
            fullName: input.recipientName,
            phone: input.recipientPhone || '+900000000000',
          },
        },
      },
      content: {
        isCustomsDeclarable: false,
        description: `Sipariş ${input.orderNumber}`,
        unitOfMeasurement: 'metric',
        packages: [
          {
            weight: input.weightKg ?? 1,
            dimensions: { length: 20, width: 15, height: 10 },
          },
        ],
      },
    };

    const res = await fetch(`${base}/shipments`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth(creds)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      this.logger.warn(`DHL create failed: ${JSON.stringify(data)}`);
      throw new BadRequestException(
        `DHL gönderi oluşturulamadı: ${typeof data.detail === 'string' ? data.detail : res.status}. Manuel takip kodu ile deneyin.`,
      );
    }

    const shipmentTrackingNumber =
      (data.shipmentTrackingNumber as string) ||
      (data as { packages?: { trackingNumber?: string }[] }).packages?.[0]
        ?.trackingNumber ||
      '';

    if (!shipmentTrackingNumber) {
      throw new BadRequestException(
        'DHL yanıtında takip numarası yok; manuel takip kodu kullanın.',
      );
    }

    const documents = data.documents as { url?: string }[] | undefined;
    const labelUrl = documents?.[0]?.url ?? null;

    return {
      trackingNumber: shipmentTrackingNumber,
      trackingUrl: `${DHL_TRACKING_BASE}${encodeURIComponent(shipmentTrackingNumber)}`,
      labelUrl,
      status: ShipmentStatus.LABEL_CREATED,
      rawResponse: { provider: this.code, api: data },
      mock: false,
    };
  }

  async trackShipment(
    trackingNumber: string,
    credentials: Record<string, string>,
  ): Promise<TrackShipmentResult> {
    if (!hasDhlCredentials(credentials)) {
      return {
        trackingNumber,
        status: ShipmentStatus.IN_TRANSIT,
        events: [
          {
            date: new Date().toISOString(),
            description:
              'Takip bilgisi veritabanından; DHL public link üzerinden güncel durumu kontrol edebilirsiniz.',
          },
        ],
        rawResponse: { dbFallback: true, provider: this.code },
        mock: false,
      };
    }

    const base = dhlApiBase(credentials);
    const url = `${base}/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${basicAuth(credentials)}` },
    });

    const data = (await res.json()) as {
      shipments?: Array<{
        status?: string;
        events?: Array<{
          timestamp?: string;
          description?: string;
          location?: { address?: { addressLocality?: string } };
        }>;
      }>;
      detail?: string;
    };

    if (!res.ok) {
      this.logger.warn(`DHL track ${trackingNumber}: ${JSON.stringify(data)}`);
      return {
        trackingNumber,
        status: ShipmentStatus.IN_TRANSIT,
        events: [
          {
            date: new Date().toISOString(),
            description: 'DHL API takip yanıt vermedi; kayıtlı durum geçerli.',
          },
        ],
        rawResponse: { error: data, provider: this.code },
        mock: false,
      };
    }

    const ship = data.shipments?.[0];
    const status = mapDhlStatus(ship?.status);
    const events =
      ship?.events?.map((ev) => ({
        date: ev.timestamp || new Date().toISOString(),
        description: ev.description || 'Durum güncellendi',
        location: ev.location?.address?.addressLocality,
      })) ?? [];

    if (!events.length) {
      events.push({
        date: new Date().toISOString(),
        description: ship?.status || 'Kargo takibi',
      });
    }

    return {
      trackingNumber,
      status,
      events,
      rawResponse: { provider: this.code, api: data },
      mock: false,
    };
  }
}
