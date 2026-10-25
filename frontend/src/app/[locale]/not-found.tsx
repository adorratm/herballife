import type { Metadata } from "next";
import { AppImage as Image } from "@/components/AppImage";
import { ArrowRight, Home, MessageCircle, Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, toLinkHref } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/cms";
import { buildWhatsAppUrl, resolveWhatsAppPhone } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFoundPage");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const locale = await getLocale();
  const [t, settings] = await Promise.all([
    getTranslations("notFoundPage"),
    getSiteSettings(locale).catch(() => null),
  ]);

  const brand = settings?.brand.name?.trim() || "Herbal Kapıda";
  const waUrl =
    settings?.whatsapp.enabled !== false
      ? buildWhatsAppUrl(
          resolveWhatsAppPhone({
            whatsappPhone: settings?.whatsapp.phone,
            contactPhone: settings?.contact.phone,
          }),
          t("waMessage"),
        )
      : null;

  const shortcuts = [
    {
      href: "/urunler/kategori/avantajli-setler",
      label: t("linkGiftSets"),
    },
    { href: "/blog", label: t("linkBlog") },
    { href: "/iletisim", label: t("linkContact") },
    { href: "/sss", label: t("linkFaq") },
  ];

  return (
    <>
      {/* Tek kompozisyon: marka + 404 + cümle + CTA + baskın ürün */}
      <section className="hero-forest relative isolate min-h-[min(42rem,calc(100svh-4.5rem))] overflow-hidden">
        <div className="page-shell relative grid items-center gap-10 py-16 sm:py-20 lg:min-h-[min(42rem,calc(100svh-4.5rem))] lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="hero-enter relative z-10 lg:col-span-6">
            <p className="eyebrow text-[#8fe0b6]">{brand}</p>
            <p
              className="mt-5 font-display text-[clamp(5.5rem,18vw,9.5rem)] font-extrabold leading-none tracking-[-0.06em] text-white/15"
              aria-hidden
            >
              404
            </p>
            <h1 className="display-md -mt-6 text-white md:-mt-10">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
              {t("description")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/urunler" className="btn-brand-light">
                <Search className="h-4 w-4" aria-hidden />
                {t("goProducts")}
              </Link>
              <Link href="/" className="btn-outline-light">
                <Home className="h-4 w-4" aria-hidden />
                {t("goHome")}
              </Link>
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-light"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {t("waWrite")}
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="hero-media relative mx-auto aspect-square max-w-md lg:max-w-none">
              <div
                className="absolute inset-[12%] rounded-full bg-[#17694a]/opacity-90"
                aria-hidden
              />
              <Image
                src="/images/cutouts/formul-1-shake.png"
                alt=""
                fill
                priority
                className="float-soft object-contain drop-shadow-[0_28px_48px_rgba(0,0,0,0.35)]"
                sizes="(max-width: 1024px) 80vw, 40vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* İkinci bölüm: hızlı yönlendirmeler — kartsız, tek iş */}
      <section className="mint-wash border-b border-outline-variant/30">
        <div className="page-shell py-12 md:py-16">
          <p className="eyebrow text-primary">{t("shortcutsEyebrow")}</p>
          <h2 className="display-md mt-3 text-on-surface">
            {t("shortcutsTitle")}
          </h2>
          <ul className="mt-8 flex flex-col divide-y divide-outline-variant/40 border-y border-outline-variant/40 sm:mt-10">
            {shortcuts.map((item) => (
              <li key={item.href}>
                <Link
                  href={toLinkHref(item.href)}
                  className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-primary sm:py-5"
                >
                  <span className="font-display text-lg font-bold tracking-tight text-on-surface group-hover:text-primary sm:text-xl">
                    {item.label}
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
