import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { MediaGallerySection } from "@/components/MediaGallerySection";
import { MediaStoriesStrip } from "@/components/MediaStoriesStrip";
import { Reveal } from "@/components/Reveal";
import {
  getContentSections,
  getSiteSettings,
  sectionContent,
} from "@/lib/cms";
import { getPublicGallery } from "@/lib/gallery";
import { breadcrumbJsonLd, buildPageMetadata, JsonLd } from "@/lib/seo";

type MediaHeader = {
  eyebrow: string;
  title: string;
  subtitle: string;
  instagramLabel: string;
  storiesLabel: string;
  uploadsLabel: string;
};

function fallbackMediaHeader(t: Awaited<ReturnType<typeof getTranslations>>): MediaHeader {
  return {
    eyebrow: t("metaTitle"),
    title: t("metaTitle"),
    subtitle: t("fallbackSubtitle"),
    instagramLabel: "Instagram",
    storiesLabel: t("storiesTitle"),
    uploadsLabel: t("galleryTitle"),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations("mediaPage"),
  ]);
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription", { brand: settings.brand.name }),
    path: "/medya",
    settings,
    locale,
    keywords: ["Herbalife medya", "Instagram", "beslenme", "sağlıklı yaşam"],
  });
}

export default async function MediaPage() {
  const locale = await getLocale();
  const [settings, sections, gallery, t, tCommon, tNav] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("media", locale),
    getPublicGallery(),
    getTranslations("mediaPage"),
    getTranslations("common"),
    getTranslations("nav"),
  ]);

  const header = sectionContent(sections, "header", fallbackMediaHeader(t));
  const instagramUrl =
    settings.social.instagram?.trim() || gallery.instagramProfile;

  const empty =
    !gallery.stories.length &&
    !gallery.instagram.length &&
    !gallery.uploads.length;

  return (
    <div className="bg-white pb-16">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: tCommon("home"), path: "/" },
            { name: tNav("media"), path: "/medya" },
          ],
          locale,
        )}
      />

      <section className="border-b border-outline-variant bg-[#f7f8f6]">
        <div className="page-shell page-hero border-0 bg-transparent">
          <p className="page-kicker">{header.eyebrow || "Medya"}</p>
          <h1 className="page-title">{header.title || "Medya"}</h1>
          <p className="page-lead">{header.subtitle}</p>
          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta mt-6 inline-flex cursor-pointer px-5 py-2.5"
            >
              {t("followInstagram")}
            </a>
          ) : null}
        </div>
      </section>

      <div className="page-shell space-y-14 py-10 md:space-y-16 md:py-12">
        {empty ? (
          <Reveal>
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center md:p-12">
              <div className="mx-auto grid  grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-xl bg-surface-container"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
              <p className="mt-6 text-sm text-on-surface-variant">
                {t("emptySoon")}
              </p>
            </div>
          </Reveal>
        ) : null}

        <section>
          <Reveal className="mb-6">
            <p className="page-kicker">
              {header.storiesLabel || t("storiesTitle")}
            </p>
            <h2 className="section-title mt-1">{t("storiesTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              {t("storiesLead")}
            </p>
          </Reveal>
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 md:p-5">
            <MediaStoriesStrip
              stories={gallery.stories}
              profileUrl={instagramUrl}
              emptyMessage={
                gallery.instagramConfigured
                  ? t("noActiveStories")
                  : t("storiesSoon")
              }
            />
          </div>
        </section>

        <section>
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="page-kicker">{header.instagramLabel}</p>
              <h2 className="section-title mt-1">{t("postsTitle")}</h2>
            </div>
            {gallery.instagramSyncedAt ? (
              <p className="text-xs font-medium text-on-surface-variant">
                {t("lastSync")}{" "}
                {new Date(gallery.instagramSyncedAt).toLocaleDateString(locale)}
              </p>
            ) : null}
          </Reveal>
          <MediaGallerySection
            items={gallery.instagram}
            profileUrl={instagramUrl}
            mode="lightbox"
            emptyMessage={
              gallery.instagramConfigured
                ? t("postsNotSynced")
                : t("feedSoon")
            }
          />
        </section>

        <section>
          <Reveal className="mb-6">
            <p className="page-kicker">{header.uploadsLabel}</p>
            <h2 className="section-title mt-1">{t("galleryTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              {t("galleryLead")}
            </p>
          </Reveal>
          <MediaGallerySection
            items={gallery.uploads}
            mode="lightbox"
            emptyMessage={t("galleryEmpty")}
          />
        </section>
      </div>
    </div>
  );
}
