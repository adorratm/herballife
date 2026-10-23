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
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

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
  linkLabel: "Yazıları oku →",
  linkHref: "/blog",
};

const PILLARS = [
  {
    title: "Orijinal ürün",
    body: "Bağımsız distribütör güvencesiyle %100 orijinal Herbalife ürünleri.",
    icon: "✓",
    accent: "from-primary-fixed to-white",
  },
  {
    title: "Kişisel program",
    body: "Hedefinize göre set önerisi ve WhatsApp üzerinden birebir danışmanlık.",
    icon: "♡",
    accent: "from-flash-soft to-white",
  },
  {
    title: "Sağlık takibi",
    body: "Su, öğün ve ölçüm kayıtlarınız hesabınızda; koç onayıyla ilerlersiniz.",
    icon: "◎",
    accent: "from-tertiary-fixed to-white",
  },
] as const;

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
  const { brand, contact, whatsapp } = settings;
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

  const waPhone = resolveWhatsAppPhone({
    whatsappPhone: whatsapp.phone,
    contactPhone: contact.phone,
  });
  const waUrl = buildWhatsAppUrl(
    waPhone,
    `Merhaba ${brand.name}, hakkınızda bilgi almak istiyorum.`,
  );

  const crumbs = [
    { name: "Ana sayfa", path: "/" },
    { name: hero.title || "Hakkımızda", path: "/hakkimizda" },
  ];

  return (
    <>
      <JsonLd data={aboutPageJsonLd(settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      {/* Hero — marka + atmosfer */}
      <section className="relative overflow-hidden border-b border-outline-variant/25">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 15% 20%, color-mix(in srgb, var(--primary-fixed) 85%, white), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, color-mix(in srgb, var(--flash-soft) 70%, white), transparent 50%), linear-gradient(180deg, #fff 0%, var(--surface-container-low) 100%)",
          }}
        />
        <div className="ambient-blob pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="ambient-blob pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-flash/10 blur-3xl" />

        <div className="page-shell relative grid items-center gap-8 py-12 md:gap-12 md:py-16 lg:grid-cols-12 lg:py-20">
          <Reveal className="lg:col-span-6" variant="up">
            <p className="page-kicker">
              {[brand.established, brand.location].filter(Boolean).join(" · ") ||
                "Bağımsız distribütör"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl lg:text-6xl">
              {brand.name}
            </h1>
            <p className="mt-3 font-display text-xl font-bold leading-snug text-primary md:text-2xl">
              {hero.title || "Hakkımızda"}
            </p>
            {brand.tagline || brand.slogan ? (
              <p className="mt-4 max-w-lg text-base leading-relaxed text-on-surface-variant md:text-lg">
                {brand.tagline || brand.slogan}
              </p>
            ) : (
              <p className="mt-4 max-w-lg text-base leading-relaxed text-on-surface-variant md:text-lg">
                {hero.seoDescription}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={body.ctaPrimary?.href || "/urunler"}
                className="btn-cta px-7 py-3 text-sm"
              >
                {body.ctaPrimary?.label || "Ürünleri incele"}
              </Link>
              {whatsapp.enabled ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost px-7 py-3 text-sm"
                >
                  WhatsApp’tan yaz
                </a>
              ) : (
                <Link
                  href={body.ctaSecondary?.href || "/iletisim"}
                  className="btn-ghost px-7 py-3 text-sm"
                >
                  {body.ctaSecondary?.label || "İletişim"}
                </Link>
              )}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={100} variant="scale">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-outline-variant/30 shadow-[0_24px_60px_-24px_rgba(18,40,28,0.28)]"
              style={{
                background:
                  "radial-gradient(ellipse 65% 55% at 50% 40%, color-mix(in srgb, var(--primary-fixed) 95%, white), var(--surface-container))",
              }}
            >
              <Image
                src="/images/products/2026-paket-1-shaker-hediyeli.png"
                alt={brand.name}
                fill
                priority
                className="object-contain p-6 drop-shadow-[0_28px_48px_rgba(18,40,28,0.18)] md:p-10"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Kısa güvence şeridi */}
      <section className="border-b border-outline-variant/20 bg-white">
        <div className="page-shell grid grid-cols-2 gap-4 py-6 md:grid-cols-4 md:gap-6 md:py-8">
          {[
            { label: "Orijinal Herbalife", value: "100%" },
            { label: "Kargo", value: "1–3 gün" },
            { label: "İade", value: "14 gün" },
            { label: "Koç desteği", value: "WhatsApp" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 50} variant="fade">
              <div className="text-center md:text-left">
                <p className="font-display text-2xl font-bold text-primary md:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell grid gap-10 py-12 md:grid-cols-12 md:gap-12 md:py-16">
        <Reveal className="md:col-span-7">
          <h2 className="font-display text-3xl tracking-tight text-on-surface md:text-4xl">
            {body.titleLine1}
            {body.titleLine2 ? (
              <span className="mt-1 block text-primary">{body.titleLine2}</span>
            ) : null}
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
            {paragraphs.map((p, i) => (
              <p key={`p-${i}`}>{p}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
            <div className="card-motion relative h-full overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary-fixed via-white to-flash-soft p-6 shadow-sm md:p-7">
              <p className="font-meta text-[10px] font-bold uppercase tracking-widest text-primary">
                Bize ulaşın
              </p>
              <div className="mt-5 space-y-5 text-sm">
                {contact.address ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                      Adres
                    </p>
                    <p className="mt-1.5 leading-relaxed text-on-surface">
                      {contact.address}
                    </p>
                  </div>
                ) : null}
                {contact.hours ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                      Çalışma
                    </p>
                    <p className="mt-1.5 text-on-surface">{contact.hours}</p>
                  </div>
                ) : null}
                {contact.phone ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                      Telefon
                    </p>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="mt-1.5 inline-block font-semibold text-primary hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                ) : null}
                {contact.email ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                      E-posta
                    </p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-1.5 inline-block font-semibold text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                ) : null}
              </div>
              {whatsapp.enabled ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#1ebe57]"
                >
                  WhatsApp ile yaz
                </a>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </section>

      <section className="relative overflow-hidden border-y border-outline-variant/20 bg-surface-container-low py-16 md:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="page-shell">
          <Reveal>
            <h2 className="text-center font-display text-3xl text-on-surface md:text-4xl">
              Neden bizimle?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-on-surface-variant">
              Ürün + rehberlik + takip — üçü bir arada.
            </p>
          </Reveal>
          <div className="lift-safe mt-10 grid gap-4 md:grid-cols-3">
            {PILLARS.map((card, i) => (
              <Reveal key={card.title} delay={i * 80} variant="scale">
                <div
                  className={`card-motion flex h-full flex-col rounded-2xl border border-outline-variant/30 bg-gradient-to-b p-6 shadow-sm ${card.accent}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-primary shadow-sm ring-1 ring-primary/10">
                    {card.icon}
                  </span>
                  <h3 className="mt-5 font-display text-xl text-on-surface">
                    {card.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                    {card.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[44vh] overflow-hidden">
        <Image
          src={ethosImage}
          alt="Sağlıklı yaşam"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-carbon/85 via-deep-carbon/55 to-deep-carbon/25" />
        <div className="page-shell relative flex min-h-[44vh] items-center py-16">
          <Reveal>
            <p className="font-meta text-xs uppercase tracking-[0.25em] text-primary-fixed">
              {ethos.eyebrow}
            </p>
            <p className="mt-4  font-display text-3xl leading-tight text-white md:text-4xl lg:text-5xl">
              {ethos.quote}
            </p>
            {ethos.linkLabel ? (
              <Link
                href={ethos.linkHref || "/blog"}
                className="mt-8 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary transition hover:bg-primary-container"
              >
                {ethos.linkLabel}
              </Link>
            ) : null}
          </Reveal>
        </div>
      </section>

      <section className="page-shell py-14 md:py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-on-primary shadow-[0_24px_60px_-20px_rgba(21,122,76,0.55)] md:px-12">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-flash/30 blur-2xl" />
            <h2 className="relative font-display text-3xl md:text-4xl">
              Birlikte başlayalım
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-on-primary/90 md:text-base">
              Ücretsiz ürün danışmanlığı veya kataloğu keşfetmek için bir adım
              atın.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/urunler/kategori/avantajli-setler"
                className="pressable inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-md"
              >
                Setleri incele
              </Link>
              <Link
                href="/iletisim"
                className="pressable inline-flex rounded-full border-2 border-white/50 px-7 py-3.5 text-sm font-bold text-on-primary hover:bg-white/10"
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
