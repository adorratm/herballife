import type { Metadata } from "next";
import { categoryCatalogPath } from "@/lib/catalog-paths";
import { productGtin, productKindLabel } from "@/lib/catalog-seo";
import type { SiteSettings } from "@/lib/cms";
import type { BlogPost, Product, ProductReview } from "@/lib/types";
import {
  getPathname,
  locales,
  type AppLocale,
  type AppPathname,
} from "@/i18n/routing";

export { categoryCatalogPath };

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const OPEN_GRAPH_LOCALE: Record<string, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
};

type PathnameHref =
  | AppPathname
  | {
      pathname: AppPathname;
      params?: Record<string, string | string[]>;
    };

function asLocale(locale: string): AppLocale {
  return (locales as readonly string[]).includes(locale)
    ? (locale as AppLocale)
    : "tr";
}

/**
 * Locale-prefixed public URL path (localized segments for non-TR).
 * Accepts internal pathnames (`/urunler/...`) or dynamic href objects.
 */
export function localizedPath(
  locale: string,
  path: string | PathnameHref,
): string {
  const loc = asLocale(locale);
  if (typeof path !== "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getPathname({ locale: loc, href: path as any });
  }
  const [pathOnly, qs] = (path.startsWith("/") ? path : `/${path}`).split("?", 2);
  const normalized = pathOnly;
  const suffix = qs ? `?${qs}` : "";
  if (normalized === "/" || normalized === "") {
    return `${getPathname({ locale: loc, href: "/" })}${suffix}`;
  }

  const product = normalized.match(/^\/urunler\/([^/]+)\/?$/);
  if (product && product[1] !== "kategori") {
    return `${getPathname({
      locale: loc,
      href: {
        pathname: "/urunler/[slug]",
        params: { slug: product[1] },
      },
    })}${suffix}`;
  }
  const category = normalized.match(/^\/urunler\/kategori\/([^/]+)\/?$/);
  if (category) {
    return `${getPathname({
      locale: loc,
      href: {
        pathname: "/urunler/kategori/[slug]",
        params: { slug: category[1] },
      },
    })}${suffix}`;
  }
  const blog = normalized.match(/^\/blog\/([^/]+)\/?$/);
  if (blog) {
    return `${getPathname({
      locale: loc,
      href: {
        pathname: "/blog/[slug]",
        params: { slug: blog[1] },
      },
    })}${suffix}`;
  }
  const order = normalized.match(/^\/hesabim\/siparisler\/([^/]+)\/?$/);
  if (order) {
    return `${getPathname({
      locale: loc,
      href: {
        pathname: "/hesabim/siparisler/[id]",
        params: { id: order[1] },
      },
    })}${suffix}`;
  }
  const tracking = normalized.match(/^\/takip\/([^/]+)\/?$/);
  if (tracking) {
    return `${getPathname({
      locale: loc,
      href: {
        pathname: "/takip/[kod]",
        params: { kod: tracking[1] },
      },
    })}${suffix}`;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return `${getPathname({ locale: loc, href: normalized as any })}${suffix}`;
  } catch {
    return `/${loc}${normalized}${suffix}`;
  }
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  settings: SiteSettings;
  locale?: string;
  keywords?: string[];
  image?: string | null;
  noIndex?: boolean;
  ogType?: "website" | "article";
};

function ogImages(
  image: string | undefined | null,
  alt: string,
): NonNullable<Metadata["openGraph"]>["images"] {
  if (!image) return undefined;
  return [{ url: image, width: 1200, height: 630, alt }];
}

export function buildPageMetadata({
  title,
  description,
  path,
  settings,
  locale = "tr",
  keywords,
  image,
  noIndex,
  ogType = "website",
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${localizedPath(locale, path)}`;
  const ogImage = image || settings.seo.ogImage;
  const fullTitle = `${title} | ${settings.brand.name}`;
  const ogLocale = OPEN_GRAPH_LOCALE[locale] || OPEN_GRAPH_LOCALE.tr;
  return {
    title,
    description,
    keywords: keywords?.length
      ? [...(settings.seo.keywords || []), ...keywords]
      : undefined,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}${localizedPath(l, path)}`]),
      ),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: ogType,
      locale: ogLocale,
      url,
      siteName: settings.brand.name,
      title: fullTitle,
      description,
      images: ogImages(ogImage, settings.brand.name),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export type SeoLabels = {
  products: string;
  productsDescription: string;
  blog: string;
  blogDescription: string;
  searchTitle: string;
  searchDescription: string;
  categoryDescription: string;
  blogTagTitle: string;
  blogTagDescription: string;
  pageSuffix: string;
  aboutJsonLdDescription?: string;
  keywordsCatalogDefault?: string[];
  keywordsCategoryExtra?: string[];
  keywordsBlog?: string[];
};

/** English defaults when callers omit translated labels (API/CMS metadata helpers). */
export const DEFAULT_SEO_LABELS: SeoLabels = {
  products: "Products",
  productsDescription:
    "Nutrition bundles, sets, and Formula products. Independent distributor assurance.",
  blog: "Articles",
  blogDescription:
    "Nutrition tips, bundle guides, and wellness articles.",
  searchTitle: "Search: {query}",
  searchDescription: "Product results for “{query}” — {brand}.",
  categoryDescription: "Products in {categoryName} — {brand}.",
  blogTagTitle: "Articles · {tag}",
  blogTagDescription: "Posts tagged “{tag}” — {brand}.",
  pageSuffix: " · Page {page}",
  aboutJsonLdDescription: "{brand} — independent Herbalife distributor.",
  keywordsCatalogDefault: ["catalog", "products", "bundles", "sets"],
  keywordsCategoryExtra: ["product", "bundle"],
  keywordsBlog: ["articles", "nutrition", "Herbalife"],
};

function fillSeoTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}

export function buildCatalogMetadata(
  settings: SiteSettings,
  opts: {
    locale?: string;
    categorySlug?: string;
    categoryName?: string;
    categoryDescription?: string | null;
    categorySeoTitle?: string | null;
    categorySeoDescription?: string | null;
    q?: string;
    page?: string | number;
    origin?: string;
    sort?: string;
    order?: string;
    labels?: Partial<SeoLabels>;
  } = {},
): Metadata {
  const locale = opts.locale || "tr";
  const labels = { ...DEFAULT_SEO_LABELS, ...opts.labels };
  const { categorySlug, categoryName, categoryDescription, q } = opts;
  const query = q?.trim();
  const pageNum = Number(opts.page || 1);
  const filtered = Boolean(
    (pageNum > 1 && Number.isFinite(pageNum)) ||
      opts.origin?.trim() ||
      opts.sort?.trim() ||
      opts.order?.trim(),
  );

  let title = labels.products;
  let description = labels.productsDescription;
  let path = "/urunler";

  if (categorySlug && categoryName) {
    title = opts.categorySeoTitle?.trim() || categoryName;
    description =
      opts.categorySeoDescription?.trim() ||
      categoryDescription?.trim() ||
      fillSeoTemplate(labels.categoryDescription, {
        categoryName,
        brand: settings.brand.name,
      });
    path = categoryCatalogPath(categorySlug);
  } else if (query) {
    title = fillSeoTemplate(labels.searchTitle, { query });
    description = fillSeoTemplate(labels.searchDescription, {
      query,
      brand: settings.brand.name,
    });
    path = `/urunler?q=${encodeURIComponent(query)}`;
  }

  return buildPageMetadata({
    title,
    description,
    path,
    settings,
    locale,
    keywords: categoryName
      ? [
          categoryName,
          categorySlug || "",
          ...(labels.keywordsCategoryExtra?.length
            ? labels.keywordsCategoryExtra
            : DEFAULT_SEO_LABELS.keywordsCategoryExtra!),
        ]
      : [
          ...(labels.keywordsCatalogDefault?.length
            ? labels.keywordsCatalogDefault
            : DEFAULT_SEO_LABELS.keywordsCatalogDefault!),
        ],
    noIndex: Boolean(query) || filtered,
  });
}

export function buildSiteMetadata(
  settings: SiteSettings,
  locale = "tr",
): Metadata {
  const { seo, brand } = settings;
  const verification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.title || brand.name,
      template: `%s | ${brand.name}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      type: "website",
      locale: OPEN_GRAPH_LOCALE[locale] || OPEN_GRAPH_LOCALE.tr,
      url: `${SITE_URL}${localizedPath(locale, "/")}`,
      siteName: brand.name,
      title: seo.title,
      description: seo.description,
      images: ogImages(seo.ogImage, brand.name),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}${localizedPath(locale, "/")}`,
      types: {
        "application/rss+xml": `${SITE_URL}/feed.xml`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
    ...(verification
      ? { verification: { google: verification } }
      : {}),
  };
}

/** Ana sayfa için açık metadata (layout default’unu sayfa düzeyinde sabitler). */
export function buildHomeMetadata(
  settings: SiteSettings,
  locale = "tr",
): Metadata {
  const { seo, brand } = settings;
  const homeUrl = `${SITE_URL}${localizedPath(locale, "/")}`;
  return {
    title: { absolute: seo.title || brand.name },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: homeUrl },
    openGraph: {
      type: "website",
      locale: OPEN_GRAPH_LOCALE[locale] || OPEN_GRAPH_LOCALE.tr,
      url: homeUrl,
      siteName: brand.name,
      title: seo.title || brand.name,
      description: seo.description,
      images: ogImages(seo.ogImage, brand.name),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title || brand.name,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export function buildProductMetadata(
  product: Product,
  settings: SiteSettings,
  locale = "tr",
): Metadata {
  const title = product.seoTitle || product.name;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    settings.seo.description;
  const image = product.imageUrl || settings.seo.ogImage;
  const url = `${SITE_URL}${localizedPath(locale, `/urunler/${product.slug}`)}`;
  const ogLocale = OPEN_GRAPH_LOCALE[locale] || OPEN_GRAPH_LOCALE.tr;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      // Next Metadata yalnızca website|article|... kabul eder; "product" RSC'yi düşürür.
      // Ürün sinyali Product JSON-LD ile verilir.
      type: "website",
      locale: ogLocale,
      url,
      siteName: settings.brand.name,
      title,
      description,
      images: ogImages(image, product.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function buildBlogIndexMetadata(
  settings: SiteSettings,
  opts: {
    locale?: string;
    page?: number;
    tag?: string;
    labels?: Partial<SeoLabels>;
  } = {},
): Metadata {
  const locale = opts.locale || "tr";
  const labels = { ...DEFAULT_SEO_LABELS, ...opts.labels };
  const page = opts.page && opts.page > 1 ? opts.page : undefined;
  const tag = opts.tag?.trim();
  let title = labels.blog;
  let description = labels.blogDescription;
  let path = "/blog";
  const qs = new URLSearchParams();
  if (tag) {
    title = fillSeoTemplate(labels.blogTagTitle, { tag });
    description = fillSeoTemplate(labels.blogTagDescription, {
      tag,
      brand: settings.brand.name,
    });
    qs.set("tag", tag);
  }
  if (page) {
    title = `${title}${fillSeoTemplate(labels.pageSuffix, { page })}`;
    qs.set("page", String(page));
  }
  const query = qs.toString();
  if (query) path = `/blog?${query}`;

  const meta = buildPageMetadata({
    title,
    description,
    path,
    settings,
    locale,
    keywords: [
      ...(labels.keywordsBlog?.length
        ? labels.keywordsBlog
        : DEFAULT_SEO_LABELS.keywordsBlog!),
      tag || "",
    ].filter(Boolean),
    noIndex: Boolean(page || tag),
  });

  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      types: {
        "application/rss+xml": `${SITE_URL}/feed.xml`,
      },
    },
  };
}

export function buildBlogPostMetadata(
  post: BlogPost,
  settings: SiteSettings,
  locale = "tr",
): Metadata {
  const title = post.seoTitle || post.title;
  const description =
    post.seoDescription ||
    post.excerpt ||
    post.content.replace(/<[^>]+>/g, "").slice(0, 160) ||
    settings.seo.description;
  const image = post.coverImageUrl || settings.seo.ogImage;
  const url = `${SITE_URL}${localizedPath(locale, `/blog/${post.slug}`)}`;
  const ogLocale = OPEN_GRAPH_LOCALE[locale] || OPEN_GRAPH_LOCALE.tr;

  return {
    title,
    description,
    keywords: [...(settings.seo.keywords || []), ...(post.tags || [])],
    authors: post.authorName ? [{ name: post.authorName }] : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: ogLocale,
      url,
      siteName: settings.brand.name,
      title,
      description,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags,
      images: ogImages(image, post.title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function websiteJsonLd(settings: SiteSettings, locale = "tr") {
  const catalog = localizedPath(locale, "/urunler");
  const langMap: Record<string, string> = {
    tr: "tr-TR",
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
  };
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.brand.name,
    url: `${SITE_URL}${localizedPath(locale, "/")}`,
    description: settings.seo.description,
    inLanguage: langMap[locale] || "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}${catalog}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function parseOpeningHours(hours: string | undefined | null) {
  if (!hours?.trim()) return undefined;
  const match = hours.match(
    /(\d{1,2})[:.](\d{2})\s*[—–\-]\s*(\d{1,2})[:.](\d{2})/,
  );
  if (!match) return undefined;
  const opens = `${match[1].padStart(2, "0")}:${match[2]}`;
  const closes = `${match[3].padStart(2, "0")}:${match[4]}`;
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens,
    closes,
  };
}

function parsePostalCode(address: string | undefined | null) {
  const match = address?.match(/\b(\d{5})\b/);
  return match?.[1];
}

export function organizationJsonLd(settings: SiteSettings) {
  const { brand, contact, social, seo } = settings;
  const sameAs = [
    social.instagram,
    social.facebook,
    social.googleMaps,
    social.googleReviewUrl,
  ]
    .map((u) => u?.trim())
    .filter(Boolean) as string[];
  const openingHoursSpecification = parseOpeningHours(contact.hours);
  const postalCode = parsePostalCode(contact.address);
  const mapsUrl = social.googleMaps?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#organization`,
    name: brand.name,
    description: brand.tagline || seo.description,
    url: SITE_URL,
    priceRange: "₺₺",
    logo: seo.ogImage
      ? { "@type": "ImageObject", url: seo.ogImage }
      : undefined,
    image: seo.ogImage || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: "Torbalı",
      addressRegion: "İzmir",
      postalCode: postalCode || undefined,
      addressCountry: "TR",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "İzmir",
    },
    email: contact.email || undefined,
    telephone: contact.phone || undefined,
    openingHours: contact.hours || undefined,
    ...(mapsUrl ? { hasMap: mapsUrl } : {}),
    ...(openingHoursSpecification ? { openingHoursSpecification } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...geoCoordinates(contact.latitude, contact.longitude),
  };
}

function geoCoordinates(latRaw?: string, lngRaw?: string) {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return {};
  return {
    geo: {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  locale = "tr",
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${localizedPath(locale, item.path || "/")}`,
    })),
  };
}

const DEFAULT_SHIPPING_FEE = "89.90";

function productAvailability(inStock: boolean) {
  return inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

function merchantReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "TR",
    returnPolicyCategory:
      "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
    merchantReturnLink: `${SITE_URL}/iptal-iade`,
  };
}

function offerShippingDetails() {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: DEFAULT_SHIPPING_FEE,
      currency: "TRY",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "TR",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 5,
        unitCode: "DAY",
      },
    },
  };
}

export function productJsonLd(
  product: Product,
  settings: SiteSettings,
  reviews: ProductReview[] = [],
  locale = "tr",
) {
  const activeVariants = (product.variants || []).filter((v) => v.isActive);
  const inStock =
    activeVariants.some((v) => Number(v.stock) > 0) || product.stock > 0;
  const ratingCount = product.ratingCount ?? reviews.length;
  const ratingAvg = Number(product.ratingAvg || 0);
  const images = [
    product.imageUrl,
    ...(product.gallery || []),
  ].filter(Boolean) as string[];
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description;
  const url = `${SITE_URL}${localizedPath(locale, `/urunler/${product.slug}`)}`;
  const currency = product.currency || "TRY";
  const seller = {
    "@type": "Organization",
    name: settings.brand.name,
  };
  const shipping = {
    shippingDetails: offerShippingDetails(),
    hasMerchantReturnPolicy: merchantReturnPolicy(),
    seller,
    url,
    itemCondition: "https://schema.org/NewCondition",
  };

  const prices = (
    activeVariants.length
      ? activeVariants.map((v) => Number(v.price))
      : [Number(product.salePrice ?? product.basePrice)]
  ).filter((n) => Number.isFinite(n));
  const low = prices.length ? Math.min(...prices) : Number(product.basePrice);
  const high = prices.length ? Math.max(...prices) : low;

  const offers =
    activeVariants.length > 1
      ? {
          "@type": "AggregateOffer",
          priceCurrency: currency,
          lowPrice: low.toFixed(2),
          highPrice: high.toFixed(2),
          offerCount: activeVariants.length,
          availability: productAvailability(inStock),
          ...shipping,
          offers: activeVariants.map((variant) => ({
            "@type": "Offer",
            sku: variant.sku,
            name: variant.weightLabel,
            price: variant.price,
            priceCurrency: currency,
            availability: productAvailability(Number(variant.stock) > 0),
            url,
            seller,
          })),
        }
      : {
          "@type": "Offer",
          priceCurrency: currency,
          price: String(activeVariants[0]?.price ?? product.basePrice),
          sku: activeVariants[0]?.sku || product.batchId || product.slug,
          availability: productAvailability(inStock),
          ...shipping,
        };

  const approvedReviews = reviews.filter((r) => r.isApproved && r.body);
  const gtin = productGtin(product);
  const kindLabel = productKindLabel(product.kind);
  const additionalProperty = [
    product.originCountry
      ? {
          "@type": "PropertyValue",
          name: "Üretim / menşei ülke",
          value: [product.originRegion, product.originCountry]
            .filter(Boolean)
            .join(", "),
        }
      : null,
    kindLabel
      ? {
          "@type": "PropertyValue",
          name: "Ürün türü",
          value: kindLabel,
        }
      : null,
    ...(activeVariants
      .map((v) => v.weightLabel?.trim())
      .filter((weight, i, arr): weight is string =>
        Boolean(weight && arr.indexOf(weight) === i),
      )
      .map((weight) => ({
        "@type": "PropertyValue",
        name: "Gramaj",
        value: weight,
      }))),
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.seoTitle || product.name,
    description,
    image: images.length ? images : settings.seo.ogImage || undefined,
    sku: product.batchId || product.slug,
    ...(gtin
      ? gtin.length === 13
        ? { gtin, gtin13: gtin }
        : { gtin }
      : {}),
    ...(product.category?.name
      ? { category: product.category.name }
      : kindLabel
        ? { category: kindLabel }
        : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
    brand: {
      "@type": "Brand",
      name: settings.brand.name,
    },
    offers,
    ...(ratingCount > 0 && ratingAvg > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingAvg.toFixed(1),
            reviewCount: ratingCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    ...(approvedReviews.length
      ? {
          review: approvedReviews.slice(0, 10).map((review) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: "5",
              worstRating: "1",
            },
            author: { "@type": "Person", name: review.authorName },
            reviewBody: review.body,
            datePublished: review.createdAt || undefined,
          })),
        }
      : {}),
  };
}

export function blogPostJsonLd(
  post: BlogPost,
  settings: SiteSettings,
  locale = "tr",
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.seoDescription || undefined,
    image: post.coverImageUrl || settings.seo.ogImage || undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    author: {
      "@type": "Person",
      name: post.authorName || settings.brand.name,
    },
    publisher: {
      "@type": "Organization",
      name: settings.brand.name,
      logo: settings.seo.ogImage
        ? { "@type": "ImageObject", url: settings.seo.ogImage }
        : undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${localizedPath(locale, `/blog/${post.slug}`)}`,
    },
    keywords: post.tags?.join(", ") || undefined,
    inLanguage: locale || post.locale || "tr",
  };
}

export function faqJsonLd(
  items: { question: string; answer: string }[],
) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function itemListJsonLd(
  products: Pick<Product, "name" | "slug" | "imageUrl" | "shortDescription">[],
  opts: { name: string; path: string; locale?: string },
) {
  const locale = opts.locale || "tr";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    url: `${SITE_URL}${localizedPath(locale, opts.path)}`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${localizedPath(locale, `/urunler/${product.slug}`)}`,
      name: product.name,
      ...(product.imageUrl ? { image: product.imageUrl } : {}),
      ...(product.shortDescription
        ? { description: product.shortDescription }
        : {}),
    })),
  };
}

export function aboutPageJsonLd(
  settings: SiteSettings,
  aboutTitle = "About us",
  aboutDescriptionTemplate?: string,
  locale = "tr",
) {
  const { brand, contact, seo } = settings;
  const fallbackAbout =
    aboutDescriptionTemplate?.replace(/\{brand\}/g, brand.name) ||
    DEFAULT_SEO_LABELS.aboutJsonLdDescription!.replace(
      /\{brand\}/g,
      brand.name,
    );
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `${aboutTitle} | ${brand.name}`,
    url: `${SITE_URL}${localizedPath(locale, "/hakkimizda")}`,
    description: seo.description || fallbackAbout,
    mainEntity: {
      "@type": "Store",
      "@id": `${SITE_URL}/#organization`,
      name: brand.name,
      url: SITE_URL,
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.address,
        addressLocality: contact.locationLabel || "Türkiye",
        addressCountry: "TR",
      },
      telephone: contact.phone || undefined,
      email: contact.email || undefined,
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
