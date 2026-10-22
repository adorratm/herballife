import Link from "next/link";
import type { Metadata } from "next";
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

const FALLBACK_HEADER: MediaHeader = {
  eyebrow: "Medya",
  title: "Yaşam ve Instagram",
  subtitle:
    "Ürünler, paketler ve sağlıklı yaşam anlarından kareler. Instagram paylaşımlarımız ve seçilmiş görseller.",
  instagramLabel: "Instagram",
  storiesLabel: "Hikayeler",
  uploadsLabel: "Galeriden",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata({
    title: "Medya",
    description:
      "Herbal Ürünleri Instagram paylaşımları, hikayeler ve seçilmiş görseller.",
    path: "/medya",
    settings,
    keywords: ["Herbalife medya", "Instagram", "beslenme", "sağlıklı yaşam"],
  });
}

export default async function MediaPage() {
  const [settings, sections, gallery] = await Promise.all([
    getSiteSettings(),
    getContentSections("media"),
    getPublicGallery(),
  ]);

  const header = sectionContent(sections, "header", FALLBACK_HEADER);
  const instagramUrl =
    settings.social.instagram?.trim() || gallery.instagramProfile;

  const empty =
    !gallery.stories.length &&
    !gallery.instagram.length &&
    !gallery.uploads.length;

  return (
    <div className="bg-white pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: "Medya", path: "/medya" },
        ])}
      />

      <section className="border-b border-outline-variant bg-[#f7f8f6]">
        <div className="page-shell page-hero border-0 bg-transparent">
          <p className="page-kicker">{header.eyebrow || "Medya"}</p>
          <h1 className="page-title">{header.title || "Medya"}</h1>
          <p className="page-lead">{header.subtitle}</p>
          {instagramUrl ? (
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta mt-6 inline-flex cursor-pointer px-5 py-2.5"
            >
              Instagram’da takip et
            </Link>
          ) : null}
        </div>
      </section>

      <div className="page-shell space-y-14 py-10 md:space-y-16 md:py-12">
        {empty ? (
          <Reveal>
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center md:p-12">
              <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-xl bg-surface-container"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
              <p className="mt-6 text-sm text-on-surface-variant">
                Medya içeriği yakında burada. Instagram veya galeri
                yüklemeleri admin panelinden eklenebilir.
              </p>
            </div>
          </Reveal>
        ) : null}

        <section>
          <Reveal className="mb-6">
            <p className="page-kicker">
              {header.storiesLabel || FALLBACK_HEADER.storiesLabel}
            </p>
            <h2 className="section-title mt-1">Instagram hikayeleri</h2>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              Son 24 saatteki aktif hikayeler — tıklayınca büyük görünüm.
            </p>
          </Reveal>
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 md:p-5">
            <MediaStoriesStrip
              stories={gallery.stories}
              profileUrl={instagramUrl}
              emptyMessage={
                gallery.instagramConfigured
                  ? "Şu an aktif Instagram hikayesi yok."
                  : "Instagram hikayeleri yakında burada olacak."
              }
            />
          </div>
        </section>

        <section>
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="page-kicker">{header.instagramLabel}</p>
              <h2 className="section-title mt-1">Instagram paylaşımları</h2>
            </div>
            {gallery.instagramSyncedAt ? (
              <p className="text-xs font-medium text-on-surface-variant">
                Son senkron:{" "}
                {new Date(gallery.instagramSyncedAt).toLocaleDateString("tr-TR")}
              </p>
            ) : null}
          </Reveal>
          <MediaGallerySection
            items={gallery.instagram}
            profileUrl={instagramUrl}
            mode="lightbox"
            emptyMessage={
              gallery.instagramConfigured
                ? "Instagram gönderileri henüz senkronize edilmedi."
                : "Instagram akışı yakında burada olacak."
            }
          />
        </section>

        <section>
          <Reveal className="mb-6">
            <p className="page-kicker">{header.uploadsLabel}</p>
            <h2 className="section-title mt-1">Galeriden seçkiler</h2>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              Ürün, paket ve yaşam anları — tıklayınca büyük görünüm.
            </p>
          </Reveal>
          <MediaGallerySection
            items={gallery.uploads}
            mode="lightbox"
            emptyMessage="Henüz galeri görseli eklenmedi."
          />
        </section>
      </div>
    </div>
  );
}
