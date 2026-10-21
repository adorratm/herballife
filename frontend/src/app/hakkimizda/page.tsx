import { AppImage as Image } from "@/components/AppImage";
import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import {
  cmsImageUrl,
  getContentSections,
  getSiteSettings,
  sectionContent,
} from "@/lib/cms";
import {
  aboutPageJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  JsonLd,
} from "@/lib/seo";
type AboutHero = {
  imageUrl: string;
  title: string;
  seoDescription: string;
};

type AboutBody = {
  titleLine1: string;
  titleLine2: string;
  paragraphs: string[];
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  showContactAside: boolean;
};

type AboutEthos = {
  imageUrl: string;
  eyebrow: string;
  quote: string;
  linkLabel: string;
  linkHref: string;
};

const FALLBACK_HERO: AboutHero = {
  imageUrl: "/images/products/2026-paket-1-shaker-hediyeli.png",
  title: "Hakkımızda",
  seoDescription:
    "Bağımsız Herbalife distribütörü Emine Özberk ile orijinal ürünler, avantajlı setler ve kişiselleştirilmiş beslenme desteği.",
};

const FALLBACK_BODY: AboutBody = {
  titleLine1: "Sağlıklı yaşam",
  titleLine2: "yanınızda",
  paragraphs: [
    "Bağımsız distribütör Emine Özberk olarak orijinal Herbalife ürünlerini, avantajlı paketleri ve birebir beslenme danışmanlığını bir arada sunuyoruz.",
    "Amacımız raflara rastgele ürün koymak değil; hedefinize uygun program, sürdürülebilir alışkanlıklar ve güvenilir ürün erişimi sağlamaktır.",
    "Ürün seçimi, set önerisi veya wellness takibi için WhatsApp ve iletişim kanallarımızdan bize ulaşabilirsiniz.",
  ],
  ctaPrimary: { label: "Ürünleri İncele", href: "/urunler" },
  ctaSecondary: { label: "İletişim", href: "/iletisim" },
  showContactAside: true,
};

const FALLBACK_ETHOS: AboutEthos = {
  imageUrl: "/images/products/formul-1-shake.png",
  eyebrow: "Beslenme yaklaşımımız",
  quote:
    "Sürdürülebilir sonuçlar; doğru ürün, düzenli takip ve kişisel rehberlikle gelir.",
  linkLabel: "Blog notlarını oku →",
  linkHref: "/blog",
};

export async function generateMetadata(): Promise<Metadata> {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getContentSections("about"),
  ]);
  const hero = sectionContent(sections, "hero", FALLBACK_HERO);
  return buildPageMetadata({
    title: hero.title || "Hakkımızda",
    description:
      hero.seoDescription ||
      `${settings.brand.name} — bağımsız Herbalife distribütörü Emine Özberk.`,
    path: "/hakkimizda",
    settings,
    keywords: [
      "hakkımızda",
      "Herbalife",
      "bağımsız distribütör",
      "Emine Özberk",
      "beslenme",
    ],
    image: "/images/products/2026-paket-1-shaker-hediyeli.png",
  });
}

export default async function AboutPage() {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getContentSections("about"),
  ]);
  const { brand, contact } = settings;
  const hero = sectionContent(sections, "hero", FALLBACK_HERO);
  const body = sectionContent(sections, "body", FALLBACK_BODY);
  const ethos = sectionContent(sections, "ethos", FALLBACK_ETHOS);
  const ethosImage = cmsImageUrl(
    ethos.imageUrl,
    "/images/products/formul-1-shake.png",
  );
  const paragraphs = Array.isArray(body.paragraphs)
    ? body.paragraphs.filter((p) => typeof p === "string" && p.trim())
    : FALLBACK_BODY.paragraphs;

  const crumbs = [
    { name: "Ana sayfa", path: "/" },
    { name: hero.title || "Hakkımızda", path: "/hakkimizda" },
  ];

  return (
    <>
      <JsonLd data={aboutPageJsonLd(settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="page-shell page-hero md:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="page-kicker">
              {[brand.established, brand.location].filter(Boolean).join(" · ") ||
                "Hakkımızda"}
            </p>
            <h1 className="page-title md:text-5xl">
              {hero.title || "Hakkımızda"}
            </h1>
            {brand.tagline || brand.slogan ? (
              <p className="page-lead text-base">
                {brand.tagline || brand.slogan}
              </p>
            ) : null}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-container-low">
            <Image
              src="/images/products/2026-paket-1-shaker-hediyeli.png"
              alt={brand.name}
              fill
              priority
              className="object-contain p-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-10 py-10 md:grid-cols-12 md:gap-10 md:py-14">
        <Reveal className="md:col-span-7">
          <h2 className="font-display text-2xl tracking-tight text-on-surface md:text-3xl">
            {body.titleLine1}
            {body.titleLine2 ? (
              <span className="mt-1 block text-on-surface-variant">
                {body.titleLine2}
              </span>
            ) : null}
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
            {paragraphs.map((p, i) => (
              <p key={`p-${i}`}>{p}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {body.ctaPrimary?.label ? (
              <Link
                href={body.ctaPrimary.href || "/urunler"}
                className="btn-cta px-8 py-3 text-sm"
              >
                {body.ctaPrimary.label}
              </Link>
            ) : null}
            {body.ctaSecondary?.label ? (
              <Link
                href={body.ctaSecondary.href || "/iletisim"}
                className="btn-ghost px-8 py-3 text-sm"
              >
                {body.ctaSecondary.label}
              </Link>
            ) : null}
          </div>
        </Reveal>

        {body.showContactAside !== false ? (
          <Reveal className="md:col-span-5" delay={100} variant="left">
            <div className="border-t border-outline-variant/30 pt-6 font-meta text-xs uppercase tracking-widest text-secondary">
              <p className="text-primary/60">Adres</p>
              <p className="mt-3 leading-relaxed text-on-background">
                {contact.address}
              </p>
              {contact.hours ? (
                <>
                  <p className="mt-8 text-primary/60">Çalışma</p>
                  <p className="mt-3 text-on-background">{contact.hours}</p>
                </>
              ) : null}
              {contact.phone ? (
                <>
                  <p className="mt-8 text-primary/60">Telefon</p>
                  <p className="mt-3">
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="text-on-background underline hover:text-primary"
                    >
                      {contact.phone}
                    </a>
                  </p>
                </>
              ) : null}
              {contact.email ? (
                <>
                  <p className="mt-8 text-primary/60">E-posta</p>
                  <p className="mt-3">
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-on-background underline hover:text-primary"
                    >
                      {contact.email}
                    </a>
                  </p>
                </>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </section>

      <section className="page-shell py-16 md:py-20">
        <Reveal>
          <h2 className="text-center font-display text-2xl md:text-3xl">
            Neden bizimle?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-on-surface-variant">
            Ürün + rehberlik + takip — üçü bir arada.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Orijinal ürün",
              body: "Bağımsız distribütör güvencesiyle %100 orijinal Herbalife ürünleri.",
              icon: "✓",
            },
            {
              title: "Kişisel program",
              body: "Hedefinize göre set önerisi ve WhatsApp üzerinden birebir danışmanlık.",
              icon: "♡",
            },
            {
              title: "Wellness takip",
              body: "Su, öğün ve ölçüm kayıtlarınız hesabınızda; koç onayıyla ilerlersiniz.",
              icon: "◎",
            },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 80} variant="scale">
              <div className="card-motion h-full rounded-xl border border-[#ebece8] bg-surface-container-lowest p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-fixed text-lg text-primary">
                  {card.icon}
                </span>
                <h3 className="mt-4 font-display text-xl text-on-surface">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {card.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative min-h-[40vh] overflow-hidden border-y border-outline-variant/20">
        <Image
          src={ethosImage}
          alt="Sağlıklı yaşam"
          fill
          className="object-cover opacity-70 brightness-75 grayscale"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/50" />
        <div className="page-shell relative flex min-h-[40vh] items-center py-16">
          <Reveal>
            <p className="font-meta text-xs uppercase tracking-[0.25em] text-primary">
              {ethos.eyebrow}
            </p>
            <p className="mt-4 max-w-2xl font-display text-3xl leading-tight md:text-4xl">
              {ethos.quote}
            </p>
            {ethos.linkLabel ? (
              <Link
                href={ethos.linkHref || "/blog"}
                className="mt-8 inline-block font-meta text-xs uppercase tracking-widest text-secondary underline hover:text-primary"
              >
                {ethos.linkLabel}
              </Link>
            ) : null}
          </Reveal>
        </div>
      </section>

      <section className="page-shell py-16">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-primary px-6 py-10 text-center text-on-primary md:px-12">
            <h2 className="font-display text-2xl md:text-3xl">
              Birlikte başlayalım
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-on-primary/85">
              Ücretsiz ürün danışmanlığı veya kataloğu keşfetmek için bir adım
              atın.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/urunler/kategori/avantajli-setler"
                className="pressable inline-flex rounded-full bg-surface-container-lowest px-6 py-3 text-sm font-semibold text-primary"
              >
                Setleri incele
              </Link>
              <Link
                href="/iletisim"
                className="pressable inline-flex rounded-full border border-on-primary/40 px-6 py-3 text-sm font-semibold text-on-primary"
              >
                İletişime geç
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
