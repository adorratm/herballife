import { ConfigService } from '@nestjs/config';
import { Order } from '@entities/order.entity';
import { Shipment } from '@entities/shipment.entity';
import { BRAND_LOGO_CID } from '@modules/notifications/brand-logo';
import {
  emailCopy,
  formatMoneyLocalized,
  localizedStatusLabel,
  normalizeStoreLocale,
  resolveEmailLocale,
  storefrontHref,
  type EmailCopy,
} from '@modules/notifications/email-i18n';

export type NotificationTemplateContext = {
  order: Order;
  shipment?: Shipment | null;
  statusLabel?: string;
  trackingUrl?: string;
  frontendUrl: string;
  adminUrl?: string;
  /** Admin sipariş maili: received | paid */
  opsEvent?: 'received' | 'paid';
  /** Müşteri dili (yoksa order.locale) */
  locale?: string;
};

const BRAND = 'Herbal Kapıda';
const BRAND_EMAIL = 'info@herbalkapida.com';
const BRAND_PHONE = '+90 541 214 79 63';
const DEFAULT_SITE_URL = 'https://herbalkapida.com';

function isLoopbackHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1'
    );
  } catch {
    return false;
  }
}

export function statusLabel(status: string, locale?: string | null): string {
  return localizedStatusLabel(status, locale);
}

function ctxLocale(ctx: NotificationTemplateContext): string {
  return normalizeStoreLocale(ctx.locale || ctx.order.locale || 'tr');
}

/**
 * E-posta / yönlendirme linkleri için vitrin URL.
 * Production'da localhost asla kullanılmaz (yanlış FRONTEND_URL koruması).
 */
export function resolveFrontendUrl(config: ConfigService): string {
  const raw = (config.get<string>('frontendUrl') || '')
    .trim()
    .replace(/\/$/, '');
  const nodeEnv =
    config.get<string>('nodeEnv') || process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production') {
    if (raw && !isLoopbackHost(raw)) return raw;
    return DEFAULT_SITE_URL;
  }
  return raw || 'http://localhost:3000';
}

export function resolveAdminUrl(config: ConfigService): string {
  const raw = (config.get<string>('adminUrl') || '').trim().replace(/\/$/, '');
  const nodeEnv =
    config.get<string>('nodeEnv') || process.env.NODE_ENV || 'development';
  const defaultAdmin = 'https://admin.herbalkapida.com';
  if (nodeEnv === 'production') {
    if (raw && !isLoopbackHost(raw)) return raw;
    return defaultAdmin;
  }
  return raw || 'http://localhost:3001';
}

/** Marka renkleri — logo (#8c6566) ile uyumlu */
const C = {
  page: '#14110f',
  card: '#1c1714',
  header: '#f4efe8',
  ink: '#1a1410',
  cream: '#f5efe6',
  muted: '#a89888',
  soft: '#e8ddd0',
  line: '#3d3229',
  lineSoft: '#e5ddd2',
  accent: '#8c6566',
  accentSoft: '#c4a574',
  footer: '#120f0d',
};

/** Gmail: uzak URL yerine CID (EmailProvider inline attachment) */
export function brandLogoUrl(_siteUrl?: string): string {
  return `cid:${BRAND_LOGO_CID}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(
  amount: string | number,
  currency = 'TRY',
  locale?: string | null,
): string {
  return formatMoneyLocalized(amount, currency, locale);
}

function formatAddress(
  addr: Record<string, string> | null | undefined,
  copy?: EmailCopy,
): string {
  if (!addr) return '—';
  const c = copy || emailCopy('tr');
  const lines = [
    addr.companyTitle,
    addr.taxNumber ? `${c.taxId}: ${addr.taxNumber}` : null,
    addr.taxOffice ? `${c.taxOffice}: ${addr.taxOffice}` : null,
    addr.fullName,
    addr.phone,
    addr.addressLine,
    [addr.neighborhood, addr.district, addr.city].filter(Boolean).join(', '),
    addr.postalCode,
  ].filter((x) => Boolean(x && String(x).trim()));
  return lines.length ? lines.join('\n') : '—';
}

function formatAddressOneLine(
  addr: Record<string, string> | null | undefined,
  copy?: EmailCopy,
): string {
  return formatAddress(addr, copy).replace(/\n/g, ' · ');
}

function orderItemsList(order: Order, locale?: string | null): string {
  const items = order.items || [];
  if (!items.length) return '—';
  return items
    .map((it) => {
      const parts = [it.productName];
      if (it.variantLabel) parts.push(it.variantLabel);
      return `${parts.join(' · ')} ×${it.quantity} — ${formatMoney(it.lineTotal, order.currency, locale)}`;
    })
    .join('\n');
}

function sectionLabel(text: string): string {
  return `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.accentSoft};">${escapeHtml(text)}</p>`;
}

function infoCard(label: string, bodyHtml: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;background:#241e1a;border:1px solid ${C.line};">
    <tr>
      <td style="padding:16px 18px;">
        ${sectionLabel(label)}
        ${bodyHtml}
      </td>
    </tr>
  </table>`;
}

/** Sipariş özeti HTML bloğu (ürünler + iletişim + adres + tutarlar) */
export function buildOrderDetailsHtml(
  order: Order,
  opts?: { includePersonal?: boolean; locale?: string | null },
): string {
  const includePersonal = opts?.includePersonal !== false;
  const locale = opts?.locale || order.locale || 'tr';
  const copy = emailCopy(locale);
  const items = order.items || [];
  const itemRows = items.length
    ? items
        .map((it, idx) => {
          const name = [it.productName, it.variantLabel]
            .filter(Boolean)
            .join(' · ');
          const border =
            idx === items.length - 1 ? 'none' : `1px solid ${C.line}`;
          const lineItem = it as typeof it & {
            imageUrl?: string | null;
            product?: { imageUrl?: string | null } | null;
          };
          const imageUrl =
            lineItem.imageUrl?.trim() ||
            lineItem.product?.imageUrl?.trim() ||
            '';
          const thumb = imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" alt="" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:cover;border:1px solid ${C.line};margin-right:12px;" />`
            : '';
          return `<tr>
            <td style="padding:12px 0;border-bottom:${border};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:${C.soft};vertical-align:top;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                ${thumb ? `<td style="vertical-align:top;">${thumb}</td>` : ''}
                <td style="vertical-align:top;">
                  ${escapeHtml(name)}
                  <span style="display:inline-block;margin-left:8px;padding:2px 8px;border:1px solid ${C.line};font-size:11px;letter-spacing:0.06em;color:${C.muted};">×${it.quantity}</span>
                </td>
              </tr></table>
            </td>
            <td style="padding:12px 0;border-bottom:${border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.cream};text-align:right;white-space:nowrap;vertical-align:top;">${escapeHtml(formatMoney(it.lineTotal, order.currency, locale))}</td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="2" style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.muted};">${escapeHtml(copy.noItems)}</td></tr>`;

  const ship = formatAddress(order.shippingAddress, copy);
  const bill = order.billingAddress
    ? formatAddress(order.billingAddress, copy)
    : null;

  const itemsBlock = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;background:#241e1a;border:1px solid ${C.line};">
    <tr>
      <td style="padding:16px 18px;">
        ${sectionLabel(copy.orderContents)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
      </td>
    </tr>
  </table>`;

  if (!includePersonal) return itemsBlock;

  const personalBlock = infoCard(
    copy.customer,
    `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${C.soft};white-space:pre-line;">${escapeHtml(
      [order.customerName, order.customerEmail, order.customerPhone]
        .filter(Boolean)
        .join('\n'),
    )}</p>`,
  );

  const shipBlock = infoCard(
    copy.shippingAddress,
    `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${C.soft};white-space:pre-line;">${escapeHtml(ship)}</p>`,
  );

  const billBlock =
    bill && bill !== ship
      ? infoCard(
          copy.billingAddress,
          `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${C.soft};white-space:pre-line;">${escapeHtml(bill)}</p>`,
        )
      : '';

  const notesBlock = order.notes
    ? infoCard(
        copy.note,
        `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${C.soft};">${escapeHtml(order.notes)}</p>`,
      )
    : '';

  return `${itemsBlock}${personalBlock}${shipBlock}${billBlock}${notesBlock}`;
}

export function buildOrderDetailsText(
  order: Order,
  opts?: { includePersonal?: boolean; locale?: string | null },
): string {
  const includePersonal = opts?.includePersonal !== false;
  const locale = opts?.locale || order.locale || 'tr';
  const copy = emailCopy(locale);
  const lines = [
    `${copy.order}: ${order.orderNumber}`,
    `${copy.status}: ${statusLabel(order.status, locale)}`,
    '',
    `${copy.products}:`,
    orderItemsList(order, locale),
    '',
    `${copy.subtotal}: ${formatMoney(order.subtotal, order.currency, locale)}`,
    Number(order.discountAmount) > 0
      ? `${copy.discount}: −${formatMoney(order.discountAmount, order.currency, locale)}${order.couponCode ? ` (${order.couponCode})` : ''}`
      : null,
    `${copy.shipping}: ${formatMoney(order.shippingFee, order.currency, locale)}${order.shippingProvider ? ` · ${order.shippingProvider}` : ''}`,
    `${copy.total}: ${formatMoney(order.total, order.currency, locale)}`,
  ];
  if (includePersonal) {
    lines.push(
      '',
      `${copy.customer}: ${order.customerName}`,
      `E-posta: ${order.customerEmail}`,
      `Telefon: ${order.customerPhone}`,
      `${copy.delivery}: ${formatAddressOneLine(order.shippingAddress, copy)}`,
    );
    if (order.billingAddress) {
      lines.push(
        `${copy.billingAddress}: ${formatAddressOneLine(order.billingAddress, copy)}`,
      );
    }
    if (order.notes) lines.push(`${copy.note}: ${order.notes}`);
  }
  return lines.filter((x) => x !== null).join('\n');
}

function orderTotalMetaRows(
  order: Order,
  locale?: string | null,
): { label: string; value: string }[] {
  const copy = emailCopy(locale || order.locale);
  const rows: { label: string; value: string }[] = [
    { label: copy.order, value: order.orderNumber },
    { label: copy.status, value: statusLabel(order.status, locale) },
    {
      label: copy.subtotal,
      value: formatMoney(order.subtotal, order.currency, locale),
    },
  ];
  if (Number(order.discountAmount) > 0) {
    rows.push({
      label: order.couponCode
        ? `${copy.discount} (${order.couponCode})`
        : copy.discount,
      value: `−${formatMoney(order.discountAmount, order.currency, locale)}`,
    });
  }
  rows.push(
    {
      label: copy.shipping,
      value: `${formatMoney(order.shippingFee, order.currency, locale)}${order.shippingProvider ? ` · ${order.shippingProvider}` : ''}`,
    },
    {
      label: copy.total,
      value: formatMoney(order.total, order.currency, locale),
    },
  );
  return rows;
}

function trackUrlFor(ctx: NotificationTemplateContext): string {
  const locale = ctxLocale(ctx);
  const trackCode = ctx.shipment?.trackingNumber;
  return (
    ctx.trackingUrl ||
    (trackCode
      ? storefrontHref(
          ctx.frontendUrl,
          locale,
          'tracking',
          `/${encodeURIComponent(trackCode)}`,
        )
      : storefrontHref(ctx.frontendUrl, locale, 'account'))
  );
}

/** Ortak markalı HTML e-posta kabuğu */
export function renderBrandedEmail(input: {
  preheader?: string;
  title: string;
  greeting: string;
  paragraphs: string[];
  cta?: { label: string; href: string };
  metaRows?: { label: string; value: string }[];
  /** Önceden escape edilmiş / güvenli HTML (sipariş tablosu vb.) */
  extraHtml?: string;
  /** Logo için vitrin kök URL (https://herbalife.com.tr) */
  siteUrl?: string;
  locale?: string | null;
}): string {
  const preheader = input.preheader || input.title;
  const lang = resolveEmailLocale(input.locale);
  const copy = emailCopy(lang);
  const site = (
    input.siteUrl ||
    process.env.FRONTEND_URL ||
    DEFAULT_SITE_URL
  ).replace(/\/$/, '');
  const logo = brandLogoUrl(site);

  const rows = (input.metaRows || [])
    .map((r, idx, arr) => {
      const isLast = idx === arr.length - 1;
      const border = isLast ? 'none' : `1px solid ${C.line}`;
      const valueColor = isLast ? C.accentSoft : C.cream;
      const valueWeight = isLast ? '700' : '400';
      return `
      <tr>
        <td style="padding:11px 0;border-bottom:${border};font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${escapeHtml(r.label)}</td>
        <td style="padding:11px 0;border-bottom:${border};font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${valueColor};font-weight:${valueWeight};text-align:right;">${escapeHtml(r.value)}</td>
      </tr>`;
    })
    .join('');

  const paras = input.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${C.soft};">${p}</p>`,
    )
    .join('');

  const cta = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
        <tr>
          <td style="background:${C.accent};">
            <a href="${escapeHtml(input.cta.href)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(input.cta.label)}</a>
          </td>
        </tr>
      </table>`
    : '';

  const metaBlock = rows
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 8px;background:#241e1a;border:1px solid ${C.line};">
        <tr><td style="padding:6px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
      </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.card};border:1px solid ${C.line};">
          <tr>
            <td style="padding:28px 28px 22px;background:${C.header};border-bottom:3px solid ${C.accent};text-align:center;">
              <a href="${escapeHtml(site)}" style="text-decoration:none;">
                <img src="${escapeHtml(logo)}" width="220" alt="${escapeHtml(BRAND)}" style="display:block;margin:0 auto;width:220px;max-width:72%;height:auto;border:0;outline:none;" />
              </a>
              <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${C.accent};">${escapeHtml(copy.distributorTag)}</p>
            </td>
          </tr>
          <tr>
            <td style="height:3px;background:${C.accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:30px 28px 8px;">
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${C.accentSoft};">${escapeHtml(input.title)}</p>
              <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:400;color:${C.cream};">${escapeHtml(input.greeting)}</h1>
              ${paras}
              ${metaBlock}
              ${input.extraHtml || ''}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;border-top:1px solid ${C.line};background:${C.footer};">
              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${C.cream};">${BRAND}</p>
              <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${C.muted};">
                <a href="mailto:${BRAND_EMAIL}" style="color:${C.accentSoft};text-decoration:none;">${BRAND_EMAIL}</a>
                &nbsp;·&nbsp;
                <a href="tel:+905553332211" style="color:${C.muted};text-decoration:none;">${BRAND_PHONE}</a>
              </p>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6d5f52;">
                <a href="${escapeHtml(site)}" style="color:#6d5f52;text-decoration:none;">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildEmailContent(
  template: string,
  ctx: NotificationTemplateContext,
): { subject: string; html: string; text: string } {
  const locale = ctxLocale(ctx);
  const copy = emailCopy(locale);
  const orderNo = ctx.order.orderNumber;
  const name = ctx.order.customerName;
  const trackCode = ctx.shipment?.trackingNumber;
  const trackUrl = trackUrlFor(ctx);
  const label =
    ctx.statusLabel || statusLabel(ctx.order.status, locale);
  const ordersUrl = storefrontHref(ctx.frontendUrl, locale, 'account');
  const siteUrl = ctx.frontendUrl;
  const detailsHtml = buildOrderDetailsHtml(ctx.order, {
    includePersonal: true,
    locale,
  });
  const detailsText = buildOrderDetailsText(ctx.order, {
    includePersonal: true,
    locale,
  });
  const totals = orderTotalMetaRows(ctx.order, locale);
  const orderNoHtml = `<strong style="color:${C.cream};">${escapeHtml(orderNo)}</strong>`;
  const labelHtml = `<strong style="color:${C.accentSoft};">${escapeHtml(label)}</strong>`;
  const mail = (
    opts: Omit<Parameters<typeof renderBrandedEmail>[0], 'siteUrl' | 'locale'>,
  ) => renderBrandedEmail({ ...opts, siteUrl, locale });

  switch (template) {
    case 'order_received':
      return {
        subject: copy.orderReceivedSubject(orderNo),
        html: mail({
          title: copy.orderReceivedTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.orderReceivedBody(orderNoHtml)],
          metaRows: totals,
          extraHtml: detailsHtml,
          cta: { label: copy.myOrders, href: ordersUrl },
        }),
        text: `${copy.helloName(name)}\n\n${copy.orderReceivedText(orderNo)}\n\n${detailsText}\n\n${ordersUrl}`,
      };
    case 'order_ops_alert': {
      // Ops / admin — her zaman TR
      const ops = emailCopy('tr');
      const isPaid = ctx.opsEvent === 'paid' || ctx.order.status === 'paid';
      const adminBase = (
        ctx.adminUrl ||
        process.env.ADMIN_URL ||
        'https://admin.herbalife.com.tr'
      ).replace(/\/$/, '');
      const opsDetailsHtml = buildOrderDetailsHtml(ctx.order, {
        includePersonal: true,
        locale: 'tr',
      });
      const opsDetailsText = buildOrderDetailsText(ctx.order, {
        includePersonal: true,
        locale: 'tr',
      });
      const opsTotals = orderTotalMetaRows(ctx.order, 'tr');
      return {
        subject: isPaid
          ? `Yeni ödeme — ${orderNo} · ${formatMoney(ctx.order.total, ctx.order.currency, 'tr')}`
          : `Yeni sipariş — ${orderNo} · ${formatMoney(ctx.order.total, ctx.order.currency, 'tr')}`,
        html: renderBrandedEmail({
          title: isPaid ? 'Yeni ödeme' : 'Yeni sipariş',
          greeting: isPaid ? 'Ödeme alındı' : 'Sipariş oluşturuldu',
          paragraphs: [
            isPaid
              ? `<strong style="color:${C.cream};">${escapeHtml(orderNo)}</strong> ödemesi tamamlandı. Hazırlığa başlayabilirsiniz.`
              : `<strong style="color:${C.cream};">${escapeHtml(orderNo)}</strong> oluşturuldu (ödeme bekleniyor).`,
            `${escapeHtml(ctx.order.customerName)} · ${escapeHtml(ctx.order.customerEmail)} · ${escapeHtml(ctx.order.customerPhone)}`,
          ],
          metaRows: opsTotals,
          extraHtml: opsDetailsHtml,
          cta: {
            label: ops.adminOrders,
            href: `${adminBase}/siparisler`,
          },
          siteUrl,
          locale: 'tr',
        }),
        text: `${isPaid ? 'Yeni ödeme' : 'Yeni sipariş'}: ${orderNo}\n\n${opsDetailsText}`,
      };
    }
    case 'order_paid':
      return {
        subject: copy.orderPaidSubject(orderNo),
        html: mail({
          title: copy.orderPaidTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.orderPaidBody(orderNoHtml)],
          metaRows: totals,
          extraHtml: detailsHtml,
          cta: { label: copy.myOrders, href: ordersUrl },
        }),
        text: `${copy.helloName(name)}\n\n${copy.orderPaidText(orderNo)}\n\n${detailsText}\n\n${ordersUrl}`,
      };
    case 'order_status':
      return {
        subject: copy.orderStatusSubject(label, orderNo),
        html: mail({
          title: copy.orderStatusTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.orderStatusBody(orderNoHtml, labelHtml)],
          metaRows: [
            { label: copy.order, value: orderNo },
            { label: copy.status, value: label },
            {
              label: copy.total,
              value: formatMoney(ctx.order.total, ctx.order.currency, locale),
            },
          ],
          extraHtml: detailsHtml,
          cta: { label: copy.myOrders, href: ordersUrl },
        }),
        text: `${copy.helloName(name)}\n\n${copy.orderStatusText(orderNo, label)}\n\n${detailsText}\n\n${ordersUrl}`,
      };
    case 'return_requested':
      return {
        subject: copy.returnRequestedSubject(orderNo),
        html: mail({
          title: copy.returnRequestedTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.returnRequestedBody(orderNoHtml)],
          metaRows: [
            { label: copy.order, value: orderNo },
            { label: copy.status, value: copy.returnReviewing },
          ],
          extraHtml: detailsHtml,
          cta: { label: copy.myOrders, href: ordersUrl },
        }),
        text: `${copy.helloName(name)} ${copy.returnRequestedText(orderNo)}\n\n${detailsText}\n\n${ordersUrl}`,
      };
    case 'return_approved':
      return {
        subject: copy.returnApprovedSubject(orderNo),
        html: mail({
          title: copy.returnApprovedTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.returnApprovedBody(orderNoHtml)],
          metaRows: [
            { label: copy.order, value: orderNo },
            { label: copy.status, value: label || copy.approved },
          ],
          extraHtml: detailsHtml,
          cta: { label: copy.myOrders, href: ordersUrl },
        }),
        text: `${copy.helloName(name)} ${copy.returnApprovedText(orderNo)}\n\n${detailsText}\n\n${ordersUrl}`,
      };
    case 'return_rejected':
      return {
        subject: copy.returnRejectedSubject(orderNo),
        html: mail({
          title: copy.returnRejectedTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.returnRejectedBody(orderNoHtml)],
          metaRows: [
            { label: copy.order, value: orderNo },
            { label: copy.status, value: copy.rejected },
          ],
          extraHtml: detailsHtml,
          cta: { label: copy.myOrders, href: ordersUrl },
        }),
        text: `${copy.helloName(name)} ${copy.returnRejectedText(orderNo)}\n\n${ordersUrl}`,
      };
    case 'shipment_created':
      return {
        subject: copy.shipmentCreatedSubject(orderNo),
        html: mail({
          title: copy.shipmentCreatedTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.shipmentCreatedBody(orderNoHtml)],
          metaRows: [
            { label: copy.order, value: orderNo },
            ...(trackCode
              ? [{ label: copy.trackingCode, value: trackCode }]
              : []),
            {
              label: copy.delivery,
              value: formatAddressOneLine(ctx.order.shippingAddress, copy),
            },
          ],
          extraHtml: buildOrderDetailsHtml(ctx.order, {
            includePersonal: false,
            locale,
          }),
          cta: { label: copy.trackShipment, href: trackUrl },
        }),
        text: `${copy.helloName(name)} ${copy.shipmentCreatedText(orderNo, trackCode || trackUrl)}\n\n${detailsText}`,
      };
    case 'shipment_status':
      return {
        subject: copy.shipmentStatusSubject(label, orderNo),
        html: mail({
          title: copy.shipmentStatusTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.shipmentStatusBody(labelHtml)],
          metaRows: [
            { label: copy.order, value: orderNo },
            { label: copy.status, value: label },
            ...(trackCode
              ? [{ label: copy.trackingCode, value: trackCode }]
              : []),
          ],
          cta: { label: copy.liveTracking, href: trackUrl },
        }),
        text: `${copy.helloName(name)} ${copy.shipmentStatusText(label, trackUrl)}`,
      };
    default:
      return {
        subject: copy.defaultNotifySubject(BRAND, orderNo),
        html: mail({
          title: copy.defaultNotifyTitle,
          greeting: copy.helloName(name),
          paragraphs: [copy.defaultNotifyBody(labelHtml)],
          metaRows: [
            { label: copy.order, value: orderNo },
            { label: copy.status, value: label },
          ],
          extraHtml: detailsHtml,
          cta: { label: copy.myOrders, href: ordersUrl },
        }),
        text: `${copy.helloName(name)} ${copy.defaultNotifyText(label)}\n\n${detailsText}`,
      };
  }
}

export function buildWhatsAppBody(
  template: string,
  ctx: NotificationTemplateContext,
): string {
  const locale = ctxLocale(ctx);
  const copy = emailCopy(locale);
  const orderNo = ctx.order.orderNumber;
  const name =
    ctx.order.customerName?.split(' ')[0] || copy.hello;
  const trackCode = ctx.shipment?.trackingNumber;
  const label =
    ctx.statusLabel || statusLabel(ctx.order.status, locale);
  const trackUrl = trackUrlFor(ctx);

  switch (template) {
    case 'order_received':
      return copy.waOrderReceived(name, orderNo, BRAND);
    case 'order_paid':
      return copy.waOrderPaid(name, orderNo, BRAND);
    case 'shipment_created':
      return copy.waShipmentCreated(
        name,
        orderNo,
        trackCode || undefined,
        trackUrl,
        BRAND,
      );
    case 'shipment_status':
      return copy.waShipmentStatus(
        name,
        label,
        trackCode || undefined,
        trackUrl,
        BRAND,
      );
    case 'order_status':
      return copy.waOrderStatus(name, orderNo, label, BRAND);
    default:
      return copy.waDefault(name, orderNo, label, BRAND);
  }
}

/** @deprecated SMS kaldırıldı; geriye dönük importlar için alias */
export const buildSmsBody = buildWhatsAppBody;

export function buildPasswordResetEmail(input: {
  name: string;
  resetUrl: string;
  appResetUrl?: string;
  /** Google vb. OAuth hesabında henüz yerel şifre yoksa */
  isSetPassword?: boolean;
  locale?: string | null;
}): { subject: string; html: string; text: string } {
  const copy = emailCopy(input.locale);
  const isSet = !!input.isSetPassword;
  const paragraphs = [
    isSet ? copy.passwordSetBody : copy.passwordResetBody,
  ];
  if (input.appResetUrl) {
    paragraphs.push(copy.passwordAppLink(input.appResetUrl));
  }
  const title = isSet ? copy.passwordSetSubject : copy.passwordResetSubject;
  return {
    subject: title,
    html: renderBrandedEmail({
      title,
      greeting: copy.helloName(input.name),
      paragraphs,
      cta: {
        label: isSet ? copy.passwordSetCta : copy.passwordResetCta,
        href: input.resetUrl,
      },
      locale: input.locale,
    }),
    text: isSet
      ? copy.passwordSetText(input.name, input.resetUrl, input.appResetUrl)
      : copy.passwordResetText(input.name, input.resetUrl, input.appResetUrl),
  };
}

export function buildOpsAccessDecisionEmail(input: {
  name: string;
  approved: boolean;
  accountUrl: string;
  rejectReason?: string;
}): { subject: string; html: string; text: string } {
  const name = input.name.trim() || 'Merhaba';
  if (input.approved) {
    const paragraphs = [
      'Personel erişim talebiniz onaylandı.',
      'Yönetim paneline aynı e-posta ve şifrenizle giriş yapabilirsiniz. Web mağazadaki müşteri hesabınız da açık kalır.',
    ];
    return {
      subject: 'Personel erişiminiz onaylandı',
      html: renderBrandedEmail({
        title: 'Personel erişiminiz onaylandı',
        greeting: `Merhaba ${name},`,
        paragraphs,
        cta: { label: 'Hesabıma git', href: input.accountUrl },
      }),
      text: `Merhaba ${name}, personel erişim talebiniz onaylandı. Yönetim paneline aynı e-posta ve şifrenizle giriş yapabilirsiniz. ${input.accountUrl}`,
    };
  }
  const reason =
    input.rejectReason ||
    'Personel erişim talebiniz, başvuru şartlarının karşılanmaması nedeniyle onaylanmamıştır. Hesabınız müşteri olarak kullanılmaya devam eder; web mağazamızdan alışveriş yapabilirsiniz.';
  return {
    subject: 'Personel erişim talebiniz reddedildi',
    html: renderBrandedEmail({
      title: 'Personel erişim talebiniz reddedildi',
      greeting: `Merhaba ${name},`,
      paragraphs: [
        reason,
        'Sorularınız için bizimle iletişime geçebilirsiniz.',
      ],
      cta: { label: 'Mağazaya git', href: input.accountUrl },
    }),
    text: `Merhaba ${name}, ${reason} ${input.accountUrl}`,
  };
}

export function buildAbandonedCartEmail(input: {
  name: string;
  itemCount: number;
  cartUrl: string;
  reminder?: 1 | 2;
  locale?: string | null;
}): { subject: string; html: string; text: string } {
  const copy = emailCopy(input.locale);
  const isSecond = input.reminder === 2;
  const countHtml = `<strong style="color:${C.cream};">${input.itemCount}</strong>`;
  return {
    subject: isSecond ? copy.abandonedSubject2 : copy.abandonedSubject1,
    html: renderBrandedEmail({
      title: isSecond ? copy.abandonedTitle2 : copy.abandonedTitle1,
      greeting: copy.helloName(input.name),
      paragraphs: [
        isSecond
          ? copy.abandonedBody2(countHtml)
          : copy.abandonedBody1(countHtml),
      ],
      cta: { label: copy.backToCart, href: input.cartUrl },
      locale: input.locale,
    }),
    text: copy.abandonedText(input.name, input.itemCount, input.cartUrl),
  };
}

export function buildInvoiceSentEmail(input: {
  name: string;
  orderNumber: string;
  invoiceNumber: string;
  edocumentType: 'earchive' | 'einvoice';
  ordersUrl: string;
  locale?: string | null;
}): { subject: string; html: string; text: string } {
  const copy = emailCopy(input.locale);
  const docLabel =
    input.edocumentType === 'einvoice'
      ? copy.invoiceEinvoice
      : copy.invoiceEarchive;
  const orderHtml = `<strong style="color:${C.cream};">${escapeHtml(input.orderNumber)}</strong>`;
  const invHtml = `<strong style="color:${C.accentSoft};">${escapeHtml(input.invoiceNumber)}</strong>`;
  return {
    subject: copy.invoiceSubject(docLabel, input.invoiceNumber),
    html: renderBrandedEmail({
      title: docLabel,
      greeting: copy.helloName(input.name),
      paragraphs: [
        copy.invoiceBody(orderHtml, invHtml),
        copy.invoiceContact,
      ],
      metaRows: [
        { label: copy.order, value: input.orderNumber },
        { label: copy.document, value: input.invoiceNumber },
      ],
      cta: { label: copy.myOrders, href: input.ordersUrl },
      locale: input.locale,
    }),
    text: copy.invoiceText(
      input.name,
      input.orderNumber,
      input.invoiceNumber,
      input.ordersUrl,
    ),
  };
}

export function buildLowStockEmail(input: {
  label: string;
  stock: number;
  sku: string | null;
  adminUrl: string;
}): { subject: string; html: string; text: string } {
  const copy = emailCopy('tr');
  return {
    subject: `Düşük stok: ${input.label} (${input.stock})`,
    html: renderBrandedEmail({
      title: 'Admin stok uyarısı',
      greeting: `${copy.hello},`,
      paragraphs: [
        `<strong style="color:${C.cream};">${escapeHtml(input.label)}</strong> stok seviyesi eşik altına düştü.`,
      ],
      metaRows: [
        { label: copy.stock, value: String(input.stock) },
        ...(input.sku ? [{ label: copy.sku, value: input.sku }] : []),
      ],
      cta: {
        label: copy.manageProducts,
        href: `${input.adminUrl}/urunler`,
      },
      locale: 'tr',
    }),
    text: `Düşük stok: ${input.label} — kalan ${input.stock}${input.sku ? ` (SKU: ${input.sku})` : ''}. Yönet: ${input.adminUrl}/urunler`,
  };
}
