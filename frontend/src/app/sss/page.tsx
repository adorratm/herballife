import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getContentSections, getSiteSettings, sectionContent } from "@/lib/cms";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  faqJsonLd,
  JsonLd,
} from "@/lib/seo";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

type FaqItem = { question: string; answer: string };
type FaqContent = { title: string; items: FaqItem[] };

const FALLBACK_FAQ: FaqContent = {
  title: "Sıkça Sorulan Sorular",
  items: [
    {
      question: "Ürünler orijinal mi?",
      answer:
        "Evet. Satılan ürünler orijinal Herbalife ürünleridir. Bu site bağımsız bir Herbalife Nutrition distribütörüne aittir.",
    },
    {
      question: "Hangi paketi seçmeliyim?",
      answer:
        "Hedefinize (kilo yönetimi, spor, genel wellness) göre avantajlı setler sunuyoruz. WhatsApp’tan ücretsiz ürün danışmanlığı alabilirsiniz.",
    },
    {
      question: "Kargo süresi ne kadar?",
      answer:
        "Ödeme onayı sonrası siparişler genellikle 1–3 iş günü içinde kargoya verilir. Takip kodunu sipariş bildirimiyle paylaşıyoruz.",
    },
    {
      question: "Beslenme takibi nasıl çalışır?",
      answer:
        "Hesabım → Beslenme Takibi üzerinden su, öğün ve ölçüm kaydı ekleyebilirsiniz. Koçunuz onay kuyruğundan ilerlemeyi takip eder.",
    },
    {
      question: "Kapıda ödeme var mı?",
      answer:
        "Evet, nakit veya kart ile kapıda ödeme seçenekleri sunulur. Ödeme adımında uygun yöntemi seçebilirsiniz.",
    },
    {
      question: "İade koşulları neler?",
      answer:
        "Açılmamış ürünlerde yasal süre içinde iade mümkündür. Detaylar için İptal & İade sayfasını inceleyin veya bize yazın.",
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getContentSections("home"),
  ]);
  const faq = sectionContent(sections, "faq", FALLBACK_FAQ);
  return buildPageMetadata({
    title: faq.title || "Sıkça Sorulan Sorular",
    description: `${settings.brand.name} hakkında sıkça sorulan sorular: ürünler, paketler, kargo ve beslenme takibi.`,
    path: "/sss",
    settings,
    keywords: ["sss", "sıkça sorulan sorular", "kargo", "Herbalife", "paket"],
  });
}

export default async function FaqPage() {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getContentSections("home"),
  ]);
  const faq = sectionContent(sections, "faq", FALLBACK_FAQ);
  const faqItems = (faq.items?.length ? faq.items : FALLBACK_FAQ.items).filter(
    (item) => item?.question?.trim() && item?.answer?.trim(),
  );
  const faqSchema = faqJsonLd(faqItems);
  const crumbs = [
    { name: "Ana sayfa", path: "/" },
    { name: "SSS", path: "/sss" },
  ];
  const wa = buildWhatsAppUrl(
    resolveWhatsAppPhone({
      whatsappPhone: settings.whatsapp.phone,
      contactPhone: settings.contact.phone,
    }),
    "Merhaba, SSS dışında bir sorum var.",
  );

  return (
    <>
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="page-shell page-hero">
        <p className="page-kicker">Destek</p>
        <h1 className="page-title">
          {faq.title || "Sıkça Sorulan Sorular"}
        </h1>
        <p className="page-lead">
          Ürünler, sipariş, kargo ve beslenme takibi hakkında merak edilenler.
        </p>
      </section>

      <section className="page-shell py-8 md:py-10">
        {faqItems.length ? (
          <FaqAccordion items={faqItems} className="mx-auto max-w-3xl" />
        ) : (
          <p className="text-sm text-on-surface-variant">Henüz soru eklenmemiş.</p>
        )}

        <div className="surface-panel mx-auto mt-10 max-w-3xl p-6 md:p-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-on-surface">
            Hâlâ sorunuz mu var?
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Distribütör {settings.brand.distributorName} size özel yanıtlar.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
            >
              WhatsApp’tan sor
            </a>
            <Link
              href="/iletisim"
              className="rounded-full border border-outline-variant/40 px-5 py-2.5 text-sm font-medium"
            >
              İletişim formu
            </Link>
            <Link
              href="/urunler"
              className="rounded-full border border-outline-variant/40 px-5 py-2.5 text-sm font-medium"
            >
              Ürünleri incele
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
