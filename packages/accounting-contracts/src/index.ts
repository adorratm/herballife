export const PRODUCT_KINDS = [
  'supplement',
  'beverage',
  'herbal_tea',
  'tea',
  'other',
] as const;

export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  supplement: 'Takviye / Formül',
  beverage: 'İçecek',
  herbal_tea: 'Bitki Çayı',
  tea: 'Çay',
  other: 'Diğer',
};

export const PRODUCT_UNITS = ['g', 'kg', 'adet', 'paket', 'lt'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const DEFAULT_CATEGORIES: {
  slug: string;
  name: string;
  kind: ProductKind;
  sortOrder: number;
}[] = [
  {
    slug: 'kilo-kontrolu',
    name: 'Aşağı - Yukarı Kilo Kontrolü',
    kind: 'supplement',
    sortOrder: 1,
  },
  {
    slug: 'icecekler',
    name: 'İçecekler',
    kind: 'beverage',
    sortOrder: 2,
  },
  {
    slug: 'avantajli-setler',
    name: 'Setler',
    kind: 'supplement',
    sortOrder: 3,
  },
  {
    slug: 'takviye-edici',
    name: 'Takviye Edici',
    kind: 'supplement',
    sortOrder: 4,
  },
  {
    slug: 'sporcu-urunleri',
    name: 'Sporcu Ürünleri',
    kind: 'supplement',
    sortOrder: 5,
  },
  {
    slug: 'atistirmalik',
    name: 'Atıştırmalık',
    kind: 'other',
    sortOrder: 6,
  },
  {
    slug: 'kisisel-bakim',
    name: 'Kişisel Bakım',
    kind: 'other',
    sortOrder: 7,
  },
  {
    slug: 'tanitim-urunleri',
    name: 'Tanıtım Ürünleri',
    kind: 'other',
    sortOrder: 8,
  },
];

export const PARTY_TYPES = ['customer', 'supplier'] as const;
export type PartyType = (typeof PARTY_TYPES)[number];

export const INVOICE_DIRECTIONS = ['sales', 'purchase'] as const;
export type InvoiceDirection = (typeof INVOICE_DIRECTIONS)[number];

export const INVOICE_STATUSES = [
  'draft',
  'queued',
  'sent',
  'accepted',
  'rejected',
  'cancelled',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const EDOCUMENT_TYPES = ['earchive', 'einvoice', 'none'] as const;
export type EDocumentType = (typeof EDOCUMENT_TYPES)[number];

export const EDOCUMENT_TYPE_LABELS: Record<EDocumentType, string> = {
  none: 'Fiş',
  earchive: 'e-Arşiv',
  einvoice: 'e-Fatura',
};

export const CASH_ACCOUNT_KINDS = [
  'cash',
  'bank',
  'paytr',
  'pos',
  'other',
] as const;
export type CashAccountKind = (typeof CASH_ACCOUNT_KINDS)[number];

export const LEDGER_ENTRY_TYPES = [
  'sale',
  'purchase',
  'payment',
  'refund',
  'adjustment',
  'transfer',
] as const;
export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];
