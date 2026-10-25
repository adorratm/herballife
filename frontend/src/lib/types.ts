export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  weightLabel: string;
  price: string;
  /** Kampanya varsa orijinal fiyat (API decorate) */
  compareAtPrice?: string | null;
  categoryKey?: string | null;
  translations?: Partial<
    Record<
      "tr" | "en" | "de" | "fr" | "es",
      { name?: string; categoryLabel?: string }
    >
  > | null;
  barcode?: string | null;
  stock: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  originCountry: string | null;
  originRegion: string | null;
  altitude: string | null;
  process: string | null;
  varietal: string | null;
  batchId: string | null;
  flavorNotes: string[];
  imageUrl: string | null;
  gallery: string[];
  badge: string | null;
  basePrice: string;
  /** Kampanya sonrası fiyat (varsa) */
  salePrice?: string | null;
  compareAtPrice?: string | null;
  campaignName?: string | null;
  campaignBadge?: string | null;
  campaignTheme?: string | null;
  campaignHeadline?: string | null;
  currency: string;
  /** Mağaza fiyatı KDV dahil mi (varsayılan true) */
  priceTaxIncluded?: boolean;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  ratingAvg?: string;
  ratingCount?: number;
  categoryId: string | null;
  category?: {
    id: string;
    slug: string;
    name: string;
    localeSlugs?: Record<string, string>;
  } | null;
  /** Dil kodu → o dildeki ürün slug’ı (dil değiştirici için) */
  localeSlugs?: Record<string, string>;
  kind?: string;
  barcode?: string | null;
  brewGuide?: {
    method?: string;
    ratio?: string;
    notes?: string;
  } | null;
  storageNotes?: string | null;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt?: string;
};

export type ProductReviewsResponse = Paginated<ProductReview> & {
  productId: string;
  ratingAvg: string;
  ratingCount: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductQuery = {
  locale?: string;
  currency?: string;
  q?: string;
  categorySlug?: string;
  originCountry?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "name" | "price" | "createdAt" | "stock";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type SearchHit = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

export type SearchResponse = {
  q: string;
  groups: { type: string; label: string; items: SearchHit[] }[];
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  localeSlugs?: Record<string, string>;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: string;
  product?: Product;
  variant?: ProductVariant | null;
};

export type Cart = {
  id: string;
  userId: string | null;
  sessionId: string | null;
  guestEmail?: string | null;
  items: CartItem[];
  subtotal?: string;
  currency?: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  provider?: string;
  hasPassword?: boolean;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type ShippingProvider = {
  id: string;
  code: string;
  name: string;
  fee: string;
  estimatedDays?: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  imageUrl?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string> | null;
  subtotal: string;
  shippingFee: string;
  discountAmount?: string;
  couponCode?: string | null;
  taxAmount: string;
  total: string;
  currency: string;
  shippingProvider: string | null;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
  shipments?: Shipment[];
};

export type ReturnRequestType = "cancel" | "return";
export type ReturnRequestStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "completed";

export type ReturnRequest = {
  id: string;
  orderId: string;
  type: ReturnRequestType;
  status: ReturnRequestStatus;
  reason: string;
  adminNote?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  order?: Pick<Order, "id" | "orderNumber" | "status" | "customerName" | "total">;
};

export type Address = {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string | null;
  addressLine: string;
  postalCode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  companyTitle?: string | null;
  taxNumber?: string | null;
  taxOffice?: string | null;
};

export type AddressPayload = {
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood?: string;
  addressLine: string;
  postalCode: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  companyTitle?: string;
  taxNumber?: string;
  taxOffice?: string;
};

export type Shipment = {
  id: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  provider: string;
  status: string;
};

export type TrackingResult = {
  code: string;
  status: string;
  provider?: string;
  trackingUrl?: string | null;
  events?: Array<{ at: string; description: string; location?: string }>;
  order?: Pick<Order, "id" | "orderNumber" | "status" | "customerName">;
};

export type LegalDocument = {
  slug: string;
  title: string;
  content: string;
  version: string;
  locale: string;
  publishedAt?: string | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  authorName: string | null;
  tags: string[];
  relatedProductSlugs?: string[];
  relatedCategorySlugs?: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  locale: string;
  localeSlugs?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogQuery = {
  locale?: string;
  q?: string;
  tag?: string;
  categorySlug?: string;
  sort?: "publishedAt" | "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type CheckoutPayload = {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    neighborhood?: string;
    addressLine: string;
    postalCode: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    neighborhood?: string;
    addressLine: string;
    postalCode: string;
    companyTitle?: string;
    taxNumber?: string;
    taxOffice?: string;
  };
  shippingProvider: string;
  couponCode?: string;
  legalAcceptances: {
    mesafeliSatis: boolean;
    onBilgilendirme: boolean;
    kvkk: boolean;
  };
  notes?: string;
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt?: string;
};

export type CouponPreview = {
  valid: boolean;
  code: string;
  title: string | null;
  type: "percent" | "fixed";
  value: string;
  discountAmount: string;
  message?: string;
};

export type GuestOrderLookupResult = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt?: string;
  customerName: string;
  shippingCity: string | null;
  shippingDistrict: string | null;
  subtotal: string;
  shippingFee: string;
  discountAmount?: string;
  taxAmount: string;
  total: string;
  currency: string;
  shippingProvider: string | null;
  items: Array<{
    id: string;
    productName: string;
    variantLabel: string | null;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
  shipments: Array<{
    id: string;
    provider: string;
    status: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
  }>;
};

export type PaymentInitResponse = {
  orderId: string;
  orderNumber: string;
  provider?: string;
  paymentPageUrl?: string;
  iframeUrl?: string | null;
  token?: string;
  checkoutFormContent?: string;
  mock?: boolean;
};
