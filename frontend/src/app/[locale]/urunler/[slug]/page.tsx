import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { Reveal } from "@/components/Reveal";
import { getProductReviews } from "@/lib/api";
import {
  getProductBySlug,
  getProductsPaged,
} from "@/lib/catalog.server";
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

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function ProductDescription({ html }: { html: string }) {
  if (looksLikeHtml(html)) {
    return (
      <div
        className="prose-blog  space-y-5 font-sans text-base leading-8 text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-foreground [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-foreground [&_p]:mb-0 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  const blocks = html
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className=" space-y-4 font-sans text-lg leading-relaxed text-on-surface-variant">
      {blocks.map((block) => (
        <p key={block.slice(0, 48)} className="whitespace-pre-wrap">
          {block}
        </p>
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(locale),
  ]);
  if (!product) {
    const t = await getTranslations("product");
    return { title: t("notFound"), robots: { index: false, follow: false } };
  }
  return buildProductMetadata(product, settings, locale);
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  const [product, settings, reviews] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(locale),
    getProductReviews(slug, 1, 10).catch(() => null),
  ]);

  if (!product) notFound();

  const t = await getTranslations("product");
  const tBlog = await getTranslations("blog");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

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

  const distributorCode = settings.brand.distributorCode?.trim();

  const specs = [
    [t("specCategory"), category?.name || null],
    ...(distributorCode
      ? ([[t("specHerbalifeId"), distributorCode]] as const)
      : []),
    [t("specKind"), kindLabel],
    [t("specForm"), product.process || null],
    [t("specHighlight"), product.varietal || null],
    [t("specOrigin"), product.originCountry || null],
    [t("specRegion"), product.originRegion || null],
    [t("specServing"), product.altitude || null],
    [t("specLot"), product.batchId || null],
    [t("specPackage"), weights || null],
    [
      t("specFlavors"),
      product.flavorNotes?.filter(Boolean).join(", ") || null,
    ],
  ].filter(([, value]) => hasText(value));

  const showDescription = Boolean(product.description);

  const crumbs = [
    { name: tBlog("homeCrumb"), path: "/" },
    { name: tNav("products"), path: "/urunler" },
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

      <section className="grid grid-cols-1 border-b border-outline-variant/25 bg-white lg:grid-cols-12">
        <Reveal
          className="relative border-b border-outline-variant/25 lg:col-span-7 lg:border-b-0 lg:border-r"
          variant="fade"
        >
          <ProductGallery
            images={images}
            alt={product.name}
            badge={
              product.batchId ? `Lot ${product.batchId}` : product.badge
            }
          />
        </Reveal>

        <Reveal
          className="flex flex-col justify-between bg-white p-6 md:p-8 lg:col-span-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:self-start lg:overflow-y-auto lg:p-10 xl:p-12"
          variant="right"
          delay={100}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {category?.name || kindLabel || tCommon("product")}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-on-surface md:text-4xl xl:text-[2.75rem]">
              {product.name}
            </h1>
            {(product.ratingCount ?? 0) > 0 ? (
              <p className="mt-3 text-sm text-on-surface-variant">
                <span className="font-semibold text-primary">
                  {Number(product.ratingAvg || 0).toFixed(1)}
                </span>
                <span className="text-amber-500"> ★</span>
                <span className="mx-1.5 text-outline-variant">·</span>
                {t("reviewsCount", { count: product.ratingCount ?? 0 })}
              </p>
            ) : null}

            {specs.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-3">
                {specs.map(([label, value]) => (
                  <div
                    key={label as string}
                    className="rounded-xl bg-surface-container-low px-4 py-3"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-on-surface">
                      {value as string}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-8 border-t border-outline-variant/25 pt-8">
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
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
                  <h3 className="mb-4 font-display text-2xl">{t("usageGuide")}</h3>
                  <dl className="space-y-3 font-meta text-sm uppercase tracking-wide">
                    {brew.method ? (
                      <div className="flex justify-between gap-4 border-b border-outline-variant/15 pb-2">
                        <dt className="text-on-surface-variant">{t("usage")}</dt>
                        <dd>{brew.method}</dd>
                      </div>
                    ) : null}
                    {brew.ratio ? (
                      <div className="flex justify-between gap-4 border-b border-outline-variant/15 pb-2">
                        <dt className="text-on-surface-variant">{t("ratio")}</dt>
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
                  <h3 className="mb-3 font-display text-2xl">{t("storage")}</h3>
                  <p className="font-sans text-sm leading-6 text-on-surface-variant">
                    {product.storageNotes}
                  </p>
                </div>
              ) : null}
              {category ? (
                <Link
                  href={categoryCatalogPath(category.slug)}
                  className="rounded-full inline-flex border border-primary px-4 py-2 font-meta text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-background"
                >
                  {t("categoryLink", { name: category.name })}
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
              {t("relatedEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              {category
                ? t("relatedWithCategory", { name: category.name })
                : t("relatedDefault")}
            </h2>
          </Reveal>
          <div className="lift-safe grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {settings.legal?.supplementDisclaimer?.trim() ||
      settings.legal?.weightDisclaimer?.trim() ? (
        <section className="page-shell border-t border-outline-variant/20 py-8">
          <div className="mx-auto max-w-3xl space-y-2 text-[11px] leading-relaxed text-on-surface-variant">
            {settings.legal?.supplementDisclaimer?.trim() ? (
              <p>{settings.legal.supplementDisclaimer}</p>
            ) : null}
            {settings.legal?.weightDisclaimer?.trim() ? (
              <p>{settings.legal.weightDisclaimer}</p>
            ) : null}
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
