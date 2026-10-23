import Link from "next/link";
import type { Metadata } from "next";
import { BenefitsBar } from "@/components/BenefitsBar";
import { HomeStickyCta } from "@/components/HomeStickyCta";
import { FaqAccordion } from "@/components/FaqAccordion";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FlashDealsBanner } from "@/components/FlashDealsBanner";
import { HomeHeroSlider } from "@/components/HomeHeroSlider";
import { HomeVideoSection } from "@/components/HomeVideoSection";
import { ProductCarousel } from "@/components/ProductCarousel";
import { PromoCountdown } from "@/components/PromoCountdown";
import { Reveal } from "@/components/Reveal";
import { TrustMarquee } from "@/components/TrustMarquee";
import { CountUp } from "@/components/CountUp";
import { getActiveCampaigns, getCategories, getProductsPaged } from "@/lib/api";
import { categoryCatalogPath } from "@/lib/catalog-paths";
import {
  getContentSections,
  getSiteSettings,
  sectionContent,
} from "@/lib/cms";
import { buildHomeMetadata, faqJsonLd, JsonLd } from "@/lib/seo";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";
import type { Category } from "@/lib/types";

const HOME_CATEGORY_HUB: {
  slug: string;
  fallbackName: string;
  blurb: string;
  icon: string;
  hover: string;
}[] = [
  {
    slug: "kilo-kontrolu",
    fallbackName: "Kilo Kontrolü",
    blurb: "Formül ve program ürünleri",
    icon: "⚖️",
    hover: "hover:bg-primary-fixed/40",
  },
  {
    slug: "icecekler",
    fallbackName: "İçecekler",
    blurb: "Aloe, çay ve lifli içecekler",
    icon: "🍵",
    hover: "hover:bg-flash-soft/80",
  },
  {
    slug: "avantajli-setler",
    fallbackName: "Hediyeli Setler",
    blurb: "Karıştırıcı hediyeli paketler",
    icon: "🎁",
    hover: "hover:bg-tertiary-fixed/70",
  },
  {
    slug: "takviye-edici",
    fallbackName: "Takviye Edici",
    blurb: "Vitamin ve mineral",
    icon: "💊",
    hover: "hover:bg-surface-container",
  },
  {
    slug: "sporcu-urunleri",
    fallbackName: "Sporcu Ürünleri",
    blurb: "Protein ve performans",
    icon: "💪",
    hover: "hover:bg-primary-fixed/25",
  },
  {
    slug: "atistirmalik",
    fallbackName: "Atıştırmalık",
    blurb: "Protein bar ve pratik atıştırmalık",
    icon: "🥜",
    hover: "hover:bg-tertiary-fixed/45",
  },
];

const JOURNEY = [
  {
    step: "01",
    title: "Hedefini paylaş",
    body: "Kilo, enerji veya spor — WhatsApp’tan kısa bir görüşmeyle başlangıç noktanı netleştiriyoruz.",
  },
  {
    step: "02",
    title: "Doğru seti seç",
    body: "Hediyeli paketler ve Formül ürünleriyle ihtiyacına uygun programı birlikte belirliyoruz.",
  },
  {
    step: "03",
    title: "Takiple ilerle",
    body: "Su, öğün ve ölçüm kayıtların hesabında; koçun onaylayıp seni motive eder.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ayşe K.",
    text: "Set önerisi netti, karıştırıcı hediyeli paketle başladım. Takip mesajları motivasyonumu yüksek tuttu.",
    meta: "Kilo yönetimi · 6 hafta",
  },
  {
    name: "Mert Y.",
    text: "Ürünlerin orijinal olması ve hızlı kargo güven verdi. Formül 1 rutinim artık sabah alışkanlığım.",
    meta: "Günlük rutin · 3 ay",
  },
  {
    name: "Elif S.",
    text: "Öğün fotoğraflarını yükleyince koç geri bildirimi çok hızlı geliyor. Yalnız hissetmiyorsun.",
    meta: "Beslenme takibi · aktif",
  },
];

const FALLBACK_FAQ = [
  {
    question: "Ürünler orijinal mi?",
    answer:
      "Evet. Satılan ürünler orijinal Herbalife Nutrition ürünleridir. Bu site bağımsız bir distribütöre aittir; resmi Herbalife sitesi değildir.",
  },
  {
    question: "Kargo ne kadar sürer?",
    answer:
      "Ödeme onayından sonra siparişler genellikle 1–3 iş günü içinde kargoya verilir. Takip kodunu bildirimle paylaşıyoruz.",
  },
  {
    question: "Nasıl ödeme yaparım?",
    answer:
      "Kart ile PayTR güvenli ödeme altyapısı kullanılır. Kapıda ödeme yoktur. Kupon kodunuz varsa ödeme adımında uygulayabilirsiniz.",
  },
  {
    question: "İade / cayma hakkım var mı?",
    answer:
      "Mesafeli satışta 14 gün cayma hakkı geçerlidir. Koşullar İptal ve İade sayfasında özetlenir; sipariş numaranızla başvurabilirsiniz.",
  },
  {
    question: "Beslenme takibi nedir?",
    answer:
      "Hesabınızdan su, öğün ve ölçüm kaydı tutabilir; koçunuz onaylayıp size destek olabilir.",
  },
  {
    question: "Hangi paketi seçmeliyim?",
    answer:
      "Hedefinize göre avantajlı setler sunuyoruz. WhatsApp’tan ürün danışmanlığı alabilirsiniz — ortalama yanıt süremiz bir saatten kısadır.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildHomeMetadata(settings);
}

export default async function HomePage() {
  const [
    settings,
    sections,
    categories,
    featured,
    gifted,
    bestsellers,
    flashPool,
    activeCampaigns,
  ] = await Promise.all([
    getSiteSettings(),
    getContentSections("home"),
    getCategories().catch(() => [] as Category[]),
    getProductsPaged({ page: 1, limit: 12, featured: true }).catch(() => ({
      items: [],
    })),
    getProductsPaged({
      page: 1,
      limit: 12,
      categorySlug: "avantajli-setler",
    }).catch(() => ({ items: [] })),
    getProductsPaged({ page: 1, limit: 12, sort: "name", order: "asc" }).catch(
      () => ({ items: [] }),
    ),
    getProductsPaged({ page: 1, limit: 30, sort: "price", order: "asc" }).catch(
      () => ({ items: [] }),
    ),
    getActiveCampaigns(),
  ]);

  const topCampaign = activeCampaigns[0] ?? null;

  const flashDeals = (flashPool.items ?? [])
    .filter((p) => {
      const price = Number(p.salePrice ?? p.basePrice ?? 0);
      const compare = Number(p.compareAtPrice ?? p.basePrice ?? 0);
      return compare > price && price > 0;
    })
    .slice(0, 12);
  const flashProducts =
    flashDeals.length >= 3
      ? flashDeals
      : (gifted.items.length ? gifted.items : featured.items).slice(0, 12);

  const hero = sectionContent(sections, "hero", {
    eyebrow: "Resmi Bağımsız Distribütör Güvencesi",
    headline: "Daha Sağlıklı, Daha Mutlu Bir Yaşama Adım Atın",
    body: settings.brand.tagline,
    ctaLabel: "Popüler Paketleri Keşfet",
    ctaHref: "/urunler/kategori/avantajli-setler",
    secondaryCtaLabel: "Ücretsiz Danışmanlık Al",
  });

  const promoCms = sectionContent(sections, "promo", {
    title: "Özel Avantaj Kampanyası",
    badge: "FIRSAT",
    body: "Seçili setlerde hediye avantajı ve kargo fırsatları.",
    couponCode: "SAGLIK2026",
    endsAt: "",
  });
  const promo = topCampaign
    ? {
        title: topCampaign.name,
        badge: topCampaign.badge || "KAMPANYA",
        body:
          topCampaign.headline ||
          `%${Number(topCampaign.discountPercent)} indirim — sınırlı süre.`,
        couponCode: String(promoCms.couponCode || ""),
        endsAt: topCampaign.endsAt || String(promoCms.endsAt || ""),
        theme: topCampaign.theme || "default",
      }
    : {
        title: String(promoCms.title),
        badge: String(promoCms.badge || "FIRSAT"),
        body: String(promoCms.body),
        couponCode: String(promoCms.couponCode || ""),
        endsAt: typeof promoCms.endsAt === "string" ? promoCms.endsAt : "",
        theme: "default",
      };

  const faqCms = sectionContent(sections, "faq", {
    title: "Sık Sorulanlar",
    items: FALLBACK_FAQ,
  });
  const faqItems = (
    Array.isArray(faqCms.items) && faqCms.items.length
      ? faqCms.items
      : FALLBACK_FAQ
  ).filter(
    (item: { question?: string; answer?: string }) =>
      item?.question?.trim() && item?.answer?.trim(),
  ) as { question: string; answer: string }[];

  const waPhone = resolveWhatsAppPhone({
    whatsappPhone: settings.whatsapp.phone,
    contactPhone: settings.contact.phone,
  });
  const waUrl = buildWhatsAppUrl(
    waPhone,
    `Merhaba ${settings.brand.distributorName}, ürün danışmanlığı almak istiyorum.`,
  );

  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const faqLd = faqJsonLd(faqItems);

  const heroSlides = [
    {
      image: "/images/products/2026-paket-1-shaker-hediyeli.png",
      title: "Hediyeli başlangıç seti",
      subtitle: "Avantajlı paket",
      href: "/urunler/kategori/avantajli-setler",
    },
    {
      image: "/images/products/formul-1-shake.png",
      title: "Formül 1",
      subtitle: "Günlük beslenme",
      href: "/urunler/kategori/kilo-kontrolu",
    },
    {
      image: "/images/products/herbal-aloe-konsantre-icecek-473-ml.png",
      title: "Herbal Aloe içecek",
      subtitle: "İçecekler",
      href: "/urunler/kategori/icecekler",
    },
    {
      image: "/images/products/2026-paket-3-shaker-hediyeli.png",
      title: "Karıştırıcı hediyeli paket",
      subtitle: "Kampanya",
      href: "/urunler/kategori/avantajli-setler",
    },
    {
      image:
        "/images/products/formul-2-vitamin-ve-mineral-kompleks-kadinlar-icin-60-tablet.png",
      title: "Formül 2 vitamin",
      subtitle: "Takviye",
      href: "/urunler/kategori/takviye-edici",
    },
  ];

  const video = sectionContent(sections, "video", {
    title: "Sağlıklı yaşam yolculuğuna bakış",
    subtitle:
      "Ürün kullanımı, paket önerileri ve günlük ritim hakkında kısa bir bakış. Oynat’a basarak izleyebilirsin.",
    // CMS home → video.youtubeId ile değiştirilebilir
    youtubeId: "aqz-KE-bpKQ",
    poster: "/images/products/2026-paket-2-shaker-hediyeli.png",
    ctaLabel: "WhatsApp’tan sor",
    ctaHref: waUrl,
  });

  return (
    <div className="pb-16">
      <HomeStickyCta />
      {faqLd ? <JsonLd data={faqLd} /> : null}

      <section className="border-b border-outline-variant bg-white">
        <div className="page-shell grid grid-cols-1 items-center gap-6 py-7 md:gap-8 md:py-9 lg:grid-cols-12 lg:gap-10 lg:py-10">
          <div className="hero-enter lg:col-span-6">
            <p className="page-kicker">{String(hero.eyebrow)}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl lg:text-6xl">
              {settings.brand.name}
            </h1>
            <p className="mt-4 max-w-xl font-display text-xl font-bold leading-snug text-primary md:text-2xl">
              {String(hero.headline)}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              <strong className="font-semibold text-on-surface">
                {settings.brand.distributorName}
              </strong>{" "}
              rehberliğinde {String(hero.body)}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={String(hero.ctaHref)}
                className="btn-cta pressable inline-flex items-center gap-2 px-7 py-3.5 text-base shadow-md"
              >
                {String(hero.ctaLabel)}
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost pressable inline-flex items-center gap-2 px-7 py-3.5 text-base"
              >
                {String(hero.secondaryCtaLabel)}
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <HomeHeroSlider slides={heroSlides} />
          </div>
        </div>
      </section>

      <section className="page-shell pb-8 pt-8">
        <TrustMarquee />
      </section>

      <section className="page-shell pb-8">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface md:text-2xl">
                Hedefine göre başla
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Tek tıkla doğru kategoriye git — kararsızsan WhatsApp’tan danış.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  href: "/urunler/kategori/kilo-kontrolu",
                  label: "Kilo yönetimi",
                },
                {
                  href: "/urunler/kategori/sporcu-urunleri",
                  label: "Enerji & spor",
                },
                {
                  href: "/urunler/kategori/avantajli-setler",
                  label: "Yeni başlayan seti",
                },
              ].map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-full border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:bg-primary-fixed hover:text-primary"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="page-shell pb-6">
        <Reveal>
          <PromoCountdown
            title={promo.title}
            badge={promo.badge}
            body={promo.body}
            couponCode={promo.couponCode}
            endsAt={promo.endsAt || undefined}
            theme={promo.theme}
          />
        </Reveal>
      </section>

      <FlashDealsBanner
        products={flashProducts}
        endsLabel={
          topCampaign?.endsAt
            ? `Bitiş: ${new Date(topCampaign.endsAt).toLocaleDateString("tr-TR")}`
            : "Sınırlı süre"
        }
        badge={topCampaign?.badge || "Anlık indirim"}
        title={
          topCampaign
            ? topCampaign.headline ||
              `${topCampaign.name} · %${Number(topCampaign.discountPercent)}`
            : "Seçili ürünlerde anlık fırsatlar"
        }
        theme={topCampaign?.theme}
      />

      <HomeVideoSection
        title={String(video.title)}
        subtitle={String(video.subtitle)}
        youtubeId={String(video.youtubeId)}
        poster={String(video.poster)}
        ctaLabel={String(video.ctaLabel || "")}
        ctaHref={String(video.ctaHref || waUrl)}
      />

      <section className="page-shell pb-10 pt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title md:text-3xl">
              Öne Çıkan Kategoriler
            </h2>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">
              İhtiyacınıza uygun çözümleri inceleyin
            </p>
          </div>
          <Link
            href="/urunler"
            className="pressable text-sm font-bold text-primary hover:underline"
          >
            Tümünü Gör →
          </Link>
        </div>
        <div className="lift-safe grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {HOME_CATEGORY_HUB.map((hub, i) => {
            const cat = catBySlug.get(hub.slug);
            const href = categoryCatalogPath(hub.slug);
            return (
              <Reveal key={hub.slug} delay={i * 55} variant="scale">
                <Link
                  href={href}
                  className={`group card-motion flex h-full flex-col items-center rounded-xl border border-outline-variant bg-white p-3 text-center sm:p-4 ${hub.hover}`}
                >
                  <span className="icon-bob mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-2xl text-primary">
                    {hub.icon}
                  </span>
                  <span className="line-clamp-2 min-h-[2.75em] text-sm font-bold leading-snug text-on-surface">
                    {cat?.name || hub.fallbackName}
                  </span>
                  <span className="mt-auto line-clamp-2 pt-1 text-xs font-medium leading-snug text-on-surface-variant">
                    {hub.blurb}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="hediyeli-setler" className="page-shell pb-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-flash px-3 py-1 text-xs font-bold text-white">
              Özel kampanyalı paketler
            </span>
            <h2 className="section-title md:text-3xl">
              En çok tercih edilen hediyeli paketler
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Tüm setlerde orijinal karıştırıcı hediyesi dahildir
            </p>
          </div>
          <Link
            href="/urunler/kategori/avantajli-setler"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Tüm setler →
          </Link>
        </div>
        <ProductCarousel
          products={(gifted.items.length ? gifted.items : featured.items).slice(
            0,
            12,
          )}
        />
      </section>

      <section className="page-shell pb-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary">
              Günlük takviyeler
            </span>
            <h2 className="section-title md:text-3xl">
              En çok satan ürünler
            </h2>
          </div>
          <Link
            href="/urunler"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Katalog →
          </Link>
        </div>
        <ProductCarousel
          products={(
            bestsellers.items.length ? bestsellers.items : featured.items
          ).slice(0, 12)}
        />
        {!featured.items.length && !gifted.items.length ? (
          <p className="mt-4 rounded-xl bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
            Ürünler yakında eklenecek. Yönetim panelinden ürün ekleyebilirsiniz.
          </p>
        ) : null}
      </section>

      <section className="page-shell pb-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-fixed text-3xl font-bold text-primary shadow-sm">
                    {settings.brand.distributorName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl text-on-surface md:text-2xl">
                      {settings.brand.distributorName}
                    </h2>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {settings.brand.distributorTitle ||
                        "Bağımsız Distribütör"}
                    </span>
                  </div>
                  <p className=" text-sm leading-relaxed text-on-surface-variant md:text-base">
                    “Kişisel distribütörünüzle birebir ilişki, beslenme ve ideal
                    kilo hedeflerinize ulaşmanın anahtarıdır. Size özel takip
                    programı ile yanınızdayız.”
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant">
                    {settings.brand.location ? (
                      <span>📍 {settings.brand.location}</span>
                    ) : null}
                    {settings.contact.phone ? (
                      <span>📞 {settings.contact.phone}</span>
                    ) : null}
                    <span>⏱ 7/24 aktif destek</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta pressable inline-flex flex-1 items-center justify-center gap-2 px-6 py-3 lg:flex-none"
                >
                  WhatsApp ile yaz
                </a>
                {settings.contact.phone ? (
                  <a
                    href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                    className="btn-ghost pressable inline-flex flex-1 items-center justify-center gap-2 bg-surface-container-lowest px-5 py-3 lg:flex-none"
                  >
                    Hemen ara
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="page-shell pb-12">
        <BenefitsBar phone={settings.contact.phone || waPhone} />
      </section>

      <section className="page-shell pb-12">
        <div className="mb-8 text-center">
          <Reveal>
            <h2 className="section-title md:text-3xl">
              3 adımda sağlıklı rutine
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-on-surface-variant">
              Alışverişten takibe — süreç sade, destek sürekli.
            </p>
          </Reveal>
        </div>
        <div className="lift-safe grid gap-3 sm:gap-4 md:grid-cols-3">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.step} delay={i * 80} variant="up">
              <div className="card-motion relative flex h-full flex-col rounded-xl border border-[#ebece8] bg-surface-container-lowest p-5 shadow-sm sm:p-6">
                <span className="font-display text-4xl text-primary-fixed">
                  {j.step}
                </span>
                <h3 className="mt-3 font-display text-xl text-on-surface">
                  {j.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                  {j.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell pb-12">
        <Reveal>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-6 py-8 md:grid-cols-4 md:gap-6 md:px-10">
            {[
              { value: 1200, suffix: "+", label: "Mutlu müşteri" },
              { value: 48, suffix: " sa", label: "Ortalama kargo" },
              { value: 100, suffix: "%", label: "Orijinal ürün" },
              { value: 7, suffix: "/24", label: "Koç desteği" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl text-on-surface md:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="page-shell pb-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title md:text-3xl">
              Misafirlerimiz ne diyor?
            </h2>
            <p className="text-sm text-on-surface-variant">
              Örnek deneyimler — Google ve ürün yorumlarında daha fazlası
            </p>
          </div>
          <Link
            href="/yorum"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Google’da değerlendir →
          </Link>
        </div>
        <div className="lift-safe grid gap-3 sm:gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 70} variant="scale">
              <blockquote className="card-motion flex h-full flex-col rounded-xl border border-[#ebece8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex gap-0.5 text-amber-500" aria-hidden>
                  {"★★★★★".split("").map((s, si) => (
                    <span key={si} className="star-glow text-sm">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-on-surface-variant">
                  “{t.text}”
                </p>
                <footer className="mt-4 border-t border-outline-variant/30 pt-3">
                  <cite className="not-italic text-sm font-semibold text-on-surface">
                    {t.name}
                  </cite>
                  <p className="text-xs text-on-surface-variant">{t.meta}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell pb-12">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="section-title md:text-3xl">
                  {String(faqCms.title || "Sık Sorulanlar")}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Merak ettikleriniz — tek tıkla açın
                </p>
              </div>
              <Link
                href="/sss"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Tüm SSS →
              </Link>
            </div>
            <FaqAccordion items={faqItems.slice(0, 4)} />
          </div>
        </Reveal>
      </section>

      <section className="page-shell pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 md:p-10">
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="section-title md:text-3xl">
                  Kampanya bülteni
                </h2>
                <p className="mt-2 max-w-md text-sm text-on-surface-variant">
                  Set fırsatları, hediyeli paketler ve wellness ipuçları —
                  spam’sız, yalnızca değerli haberler.
                </p>
              </div>
              <div className="max-w-md md:justify-self-end">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
