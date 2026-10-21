import { AppImage as Image } from "@/components/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { Reveal } from "@/components/Reveal";
import { getProductBySlug, getProductReviews, getProductsPaged } from "@/lib/api";
import { categoryCatalogPath } from "@/lib/catalog-paths";
import {
  asBrewGuide,
  looksLikeHtml,
  productKindLabel,
} from "@/lib/catalog-seo";
import { getSiteSettings } from "@/lib/cms";
import { productImage } from "@/lib/format";
import {
  JsonLd,
  breadcrumbJsonLd,
  buildProductMetadata,
  productJsonLd,
} from "@/lib/seo";
import { resolveWhatsAppPhone } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function ProductDescription({ html }: { html: string }) {
  if (looksLikeHtml(html)) {
    return (
      <div
        className="prose-blog max-w-2xl space-y-5 font-sans text-base leading-8 text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-foreground [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-foreground [&_p]:mb-0 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  const blocks = html
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="max-w-2xl space-y-4 font-sans text-lg leading-relaxed text-on-surface-variant">
      {blocks.map((block) => (
        <p key={block.slice(0, 48)} className="whitespace-pre-wrap">
          {block}
        </p>
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);
  if (!product) {
    return { title: "Ürün bulunamadı", robots: { index: false, follow: false } };
  }
  return buildProductMetadata(product, settings);
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings, reviews] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
    getProductReviews(slug, 1, 10).catch(() => null),
  ]);

  if (!product) notFound();

  const category = product.category;
  const relatedPage = category?.slug
    ? await getProductsPaged({
        categorySlug: category.slug,
        limit: 8,
        sort: "name",
        order: "asc",
      }).catch(() => null)
    : null;
  const related = (relatedPage?.items || [])
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4);

  const images =
    product.gallery?.length > 0
      ? product.gallery
      : [productImage(product.imageUrl, product.slug)];

  const kindLabel = productKindLabel(product.kind);
  const brew = asBrewGuide(product.brewGuide);
  const weights = (product.variants || [])
    .filter((v) => v.isActive !== false)
    .map((v) => v.weightLabel)
    .filter(Boolean)
    .join(" · ");

  const specs = [
    ["Kategori", category?.name || null],
    ["Tür", kindLabel],
    ["Paket", weights || null],
    ["Notlar", product.flavorNotes?.filter(Boolean).join(", ")],
  ].filter(([, value]) => hasText(value));

  const showDescription = Boolean(product.description);

  const crumbs = [
    { name: "Ana sayfa", path: "/" },
    { name: "Ürünler", path: "/urunler" },
    ...(category
      ? [
          {
            name: category.name,
            path: categoryCatalogPath(category.slug),
          },
        ]
      : []),
    { name: product.name, path: `/urunler/${product.slug}` },
  ];

  return (
    <div>
      <ProductViewTracker
        id={product.id}
        name={product.name}
        price={Number(product.salePrice ?? product.basePrice ?? 0)}
        currency={product.currency || "TRY"}
      />
      <JsonLd data={productJsonLd(product, settings, reviews?.items ?? [])} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageBreadcrumb items={crumbs} />

      <section className="grid grid-cols-1 border-b border-outline-variant/20 lg:grid-cols-12">
        <Reveal
          className="relative min-h-130 overflow-hidden border-r border-outline-variant/20 bg-surface lg:col-span-7 lg:min-h-217.5"
          variant="fade"
        >
          {product.batchId ? (
            <div className="absolute left-8 top-8 z-10">
              <span className="border border-primary bg-surface/80 px-3 py-1 font-meta text-xs text-primary">
                LOT: {product.batchId}
              </span>
            </div>
          ) : null}
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 58vw"
            priority
          />
          <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black/80 to-transparent p-8">
            <h1 className="font-display text-5xl leading-none tracking-tighter md:text-7xl">
              {product.name}
            </h1>
          </div>
        </Reveal>

        <Reveal
          className="flex flex-col justify-between bg-surface p-8 lg:col-span-5 lg:p-12"
          variant="right"
          delay={100}
        >
          <div>
            <div className="mb-10 flex items-start justify-between gap-6">
              <div>
                <div className="mb-2 text-sm font-semibold tracking-wide text-primary">
                  {category?.name || kindLabel || "Ürün"}
                </div>
                <p className="text-xs text-on-surface-variant">Paket · stok</p>
                {(product.ratingCount ?? 0) > 0 ? (
                  <p className="mt-2 font-meta text-xs uppercase tracking-widest text-primary">
                    {Number(product.ratingAvg || 0).toFixed(1)} / 5 ·{" "}
                    {product.ratingCount} yorum
                  </p>
                ) : null}
              </div>
            </div>

            {specs.length > 0 ? (
              <div className="mb-10 industrial-border relative p-6">
                <div className="absolute -top-3 left-4 bg-surface px-2 text-[10px] font-semibold uppercase text-on-surface-variant">
                  Ürün özeti
                </div>
                <div className="grid grid-cols-2 gap-y-6">
                  {specs.map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-[10px] font-semibold uppercase text-on-surface-variant">
                        {label}
                      </p>
                      <p className="text-lg font-semibold text-on-surface">
                        {value as string}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <ProductBuyBox
              product={product}
              whatsappEnabled={settings.whatsapp.enabled}
              whatsappPhone={resolveWhatsAppPhone({
                whatsappPhone: settings.whatsapp.phone,
                contactPhone: settings.contact.phone,
              })}
            />
          </div>
        </Reveal>
      </section>

      {showDescription || brew || product.storageNotes ? (
        <section className="cv-auto page-shell border-b border-outline-variant/20 py-section">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-8">
              {showDescription ? (
                <>
                  {looksLikeHtml(product.description) ? null : (
                    <h2 className="mb-6 font-display text-4xl">
                      {product.name}
                    </h2>
                  )}
                  <ProductDescription html={product.description} />
                </>
              ) : null}
            </Reveal>
            <Reveal className="space-y-8 lg:col-span-4" delay={80}>
              {brew ? (
                <div className="industrial-border p-6">
                  <h3 className="mb-4 font-display text-2xl">Kullanım önerisi</h3>
                  <dl className="space-y-3 font-meta text-sm uppercase tracking-wide">
                    {brew.method ? (
                      <div className="flex justify-between gap-4 border-b border-outline-variant/15 pb-2">
                        <dt className="text-on-surface-variant">Yöntem</dt>
                        <dd>{brew.method}</dd>
                      </div>
                    ) : null}
                    {brew.ratio ? (
                      <div className="flex justify-between gap-4 border-b border-outline-variant/15 pb-2">
                        <dt className="text-on-surface-variant">Oran</dt>
                        <dd>{brew.ratio}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {brew.notes ? (
                    <p className="mt-4 font-sans text-sm leading-6 text-on-surface-variant">
                      {brew.notes}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {product.storageNotes ? (
                <div className="industrial-border p-6">
                  <h3 className="mb-3 font-display text-2xl">Saklama</h3>
                  <p className="font-sans text-sm leading-6 text-on-surface-variant">
                    {product.storageNotes}
                  </p>
                </div>
              ) : null}
              {category ? (
                <Link
                  href={categoryCatalogPath(category.slug)}
                  className="inline-flex border border-primary px-4 py-2 font-meta text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-background"
                >
                  {category.name} kategorisi →
                </Link>
              ) : null}
            </Reveal>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="cv-auto page-shell border-b border-outline-variant/20 py-section">
          <Reveal className="mb-10">
            <p className="font-meta text-[10px] uppercase tracking-widest text-primary">
              Aynı kategori
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              {category ? `${category.name} içinde` : "İlgili ürünler"}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <ProductReviews
        productId={product.id}
        slug={product.slug}
        ratingAvg={product.ratingAvg}
        ratingCount={product.ratingCount}
      />
    </div>
  );
}
