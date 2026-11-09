import {
  catalogActiveVariants,
  catalogItemId,
  catalogProductUrl,
  catalogAvailability,
  catalogListAndSalePrice,
  catalogProductDescription,
  escapeXml,
  fetchAllCatalogProducts,
  formatCatalogMoney,
} from "@/lib/catalog-feed";
import {
  googleProductCategory,
  merchantProductType,
  productGtin,
} from "@/lib/catalog-seo";
import { getSiteSettings } from "@/lib/cms";
import { productImage } from "@/lib/format";
import { PRODUCT_BRAND, SITE_URL, withProductBrand } from "@/lib/seo";
import type { Product, ProductVariant } from "@/lib/types";

export const revalidate = 3600;

function feedTitle(product: Product, variant?: ProductVariant) {
  const base = withProductBrand(product.seoTitle || product.name);
  const weight = variant?.weightLabel?.trim();
  if (weight && !base.toLocaleLowerCase("tr-TR").includes(weight.toLocaleLowerCase("tr-TR"))) {
    return `${base} ${weight}`.slice(0, 150);
  }
  if (product.seoTitle) return base.slice(0, 150);
  return `${base} – Orijinal Ürün`.slice(0, 150);
}

function itemXml(opts: {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string;
  additional: string;
  inStock: boolean;
  price: string;
  salePrice?: string;
  currency: string;
  brand: string;
  itemGroupId?: string;
  size?: string;
  gtin?: string | null;
  googleCategory: string;
  productType: string;
}) {
  const money = formatCatalogMoney(opts.price, opts.currency);
  const sale =
    opts.salePrice != null
      ? `\n      <g:sale_price>${escapeXml(formatCatalogMoney(opts.salePrice, opts.currency))}</g:sale_price>`
      : "";
  const group = opts.itemGroupId
    ? `\n      <g:item_group_id>${escapeXml(opts.itemGroupId)}</g:item_group_id>`
    : "";
  const size = opts.size
    ? `\n      <g:size>${escapeXml(opts.size)}</g:size>`
    : "";
  const gtin = opts.gtin?.trim();
  const identifier = gtin
    ? `\n      <g:gtin>${escapeXml(gtin)}</g:gtin>\n      <g:identifier_exists>yes</g:identifier_exists>`
    : `\n      <g:identifier_exists>no</g:identifier_exists>`;

  return `    <item>
      <g:id>${escapeXml(opts.id)}</g:id>
      <g:title>${escapeXml(opts.title)}</g:title>
      <g:description>${escapeXml(opts.description)}</g:description>
      <g:link>${escapeXml(opts.link)}</g:link>
      <g:image_link>${escapeXml(opts.image)}</g:image_link>
${opts.additional}
      <g:availability>${catalogAvailability(opts.inStock, "google")}</g:availability>
      <g:price>${escapeXml(money)}</g:price>${sale}
      <g:brand>${opts.brand}</g:brand>
      <g:condition>new</g:condition>${identifier}
      <g:google_product_category>${escapeXml(opts.googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(opts.productType)}</g:product_type>${group}${size}
    </item>`;
}

export async function GET() {
  const [settings, products] = await Promise.all([
    getSiteSettings("tr"),
    fetchAllCatalogProducts(),
  ]);
  const brand = escapeXml(PRODUCT_BRAND);
  const storeName = escapeXml(settings.brand.name);

  const items = products
    .filter((p) => p.isActive !== false)
    .flatMap((product) => {
      const link = catalogProductUrl(SITE_URL, product.slug);
      const image = productImage(product.imageUrl, product.slug);
      const description = catalogProductDescription(product);
      const additional = (product.gallery || [])
        .filter((url) => url && url !== product.imageUrl)
        .slice(0, 9)
        .map(
          (url) =>
            `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`,
        )
        .join("\n");
      const currency = product.currency || "TRY";
      const variants = catalogActiveVariants(product);
      const googleCategory = googleProductCategory(product.kind);
      const productType = merchantProductType(product);
      const productGtinValue = productGtin(product);

      if (variants.length) {
        return variants.map((v) => {
          const { price, salePrice } = catalogListAndSalePrice(
            v.price,
            v.compareAtPrice,
          );
          return itemXml({
            id: catalogItemId(product, v),
            title: feedTitle(product, v),
            description,
            link,
            image,
            additional,
            inStock: Number(v.stock) > 0,
            price,
            salePrice,
            currency,
            brand,
            itemGroupId: product.slug,
            size: v.weightLabel || undefined,
            gtin: v.barcode?.trim() || productGtinValue,
            googleCategory,
            productType,
          });
        });
      }

      const { price, salePrice } = catalogListAndSalePrice(
        product.salePrice ?? product.basePrice,
        product.compareAtPrice,
      );
      return [
        itemXml({
          id: catalogItemId(product),
          title: feedTitle(product),
          description,
          link,
          image,
          additional,
          inStock: Number(product.stock) > 0,
          price,
          salePrice,
          currency,
          brand,
          gtin: productGtinValue,
          googleCategory,
          productType,
        }),
      ];
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${storeName}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(settings.seo.description || settings.brand.name)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
