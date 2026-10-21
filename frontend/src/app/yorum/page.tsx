import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

const DEFAULT_REVIEW_URL =
  "https://g.page/r/CdfE3W3I-W53EAI/review";

const HIGHLIGHTS = [
  {
    title: "30 saniye",
    body: "Google’da kısa bir yıldız + cümle yeter; yerel görünürlüğümüze büyük katkı.",
  },
  {
    title: "Gerçek deneyim",
    body: "Ürün kalitesi, kargo ve koç desteği hakkında dürüst geri bildiriminiz değerli.",
  },
  {
    title: "Topluluk",
    body: "Yorumlar yeni misafirlerin güvenle başlamasına yardımcı olur.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata({
    title: "Google’da Değerlendir",
    description:
      "Herbal Ürünleri deneyiminizi Google İşletme Profili’nde paylaşın.",
    path: "/yorum",
    settings,
    keywords: ["Google yorum", "Herbalife", "Emine Özberk"],
  });
}

export default async function ReviewPage() {
  const settings = await getSiteSettings();
  const reviewUrl = settings.social.googleReviewUrl?.trim();
  const mapsUrl = settings.social.googleMaps?.trim();
  const target = reviewUrl || mapsUrl || DEFAULT_REVIEW_URL;
  const wa = settings.whatsapp.enabled
    ? buildWhatsAppUrl(
        resolveWhatsAppPhone({
          whatsappPhone: settings.whatsapp.phone,
          contactPhone: settings.contact.phone,
        }),
        "Merhaba, Google yorum linki için yazıyorum.",
      )
    : null;

  return (
    <div className="pb-16">
      <header className="page-shell page-hero">
        <div className="max-w-2xl">
          <p className="page-kicker">Geri bildirim</p>
          <h1 className="page-title">Deneyiminizi paylaşın</h1>
          <p className="page-lead">
            Google’da kısa bir değerlendirme yerel görünürlüğümüze yardımcı olur.
            QR kodu tarayın veya aşağıdaki bağlantıya tıklayın.
          </p>
          <div className="mt-4 flex gap-0.5 text-xl text-amber-500" aria-hidden>
            {"★★★★★".split("").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>
      </header>

      <section className="page-shell py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal key={h.title} delay={i * 70} variant="up">
              <div className="card-motion h-full rounded-xl border border-[#ebece8] bg-surface-container-lowest p-5 shadow-sm">
                <h2 className="font-display text-lg text-primary">{h.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {h.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell pb-8">
        <Reveal variant="scale">
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-8 shadow-sm md:p-10">
            <div className="shimmer-accent absolute inset-x-0 top-0 h-px" />
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">
              {settings.brand.distributorName} · Google İşletme
            </p>

            <a
              href={target}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable mt-8 flex flex-col items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Google’da değerlendir — QR kodu tarayın"
            >
              <span className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-outline-variant/30 transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/images/google-review-qr.png"
                  alt="Google yorum QR kodu"
                  width={220}
                  height={220}
                  className="h-55 w-55"
                  priority
                />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                QR kodu tarayın
              </span>
            </a>

            <a
              href={target}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta pressable mt-8 flex w-full items-center justify-center py-4 text-sm"
            >
              Google’da değerlendir
            </a>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold uppercase tracking-wide">
              <Link
                href="/urunler"
                className="text-secondary underline hover:text-primary"
              >
                Ürünler
              </Link>
              <Link
                href="/iletisim"
                className="text-secondary underline hover:text-primary"
              >
                İletişim
              </Link>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary underline hover:text-primary"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
