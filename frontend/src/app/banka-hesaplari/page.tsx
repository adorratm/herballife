import Link from "next/link";
import type { Metadata } from "next";
import { CopyIbanButton } from "@/components/CopyIbanButton";
import { Reveal } from "@/components/Reveal";
import { getSiteSettings } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildWhatsAppUrl,
  resolveWhatsAppPhone,
} from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata({
    title: "Banka Hesapları",
    description:
      "Havale / EFT için banka hesap bilgileri. Havale sonrası ödeme bildirimi gönderin.",
    path: "/banka-hesaplari",
    settings,
    keywords: ["banka", "IBAN", "havale", "EFT", "ödeme"],
  });
}

const ACCOUNTS = [
  {
    bank: "Ziraat Bankası",
    holder: "Emine Özberk",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    branch: "Merkez",
    note: "TL vadesiz",
  },
  {
    bank: "Garanti BBVA",
    holder: "Emine Özberk",
    iban: "TR11 1111 1111 1111 1111 1111 11",
    branch: "İnternet şubesi",
    note: "TL vadesiz",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Hesabı seçin",
    body: "Aşağıdaki IBAN’lardan birine sipariş tutarını gönderin.",
  },
  {
    n: "2",
    title: "Açıklama yazın",
    body: "Havale açıklamasına sipariş numaranızı ekleyin.",
  },
  {
    n: "3",
    title: "Bildirim gönderin",
    body: "Ödeme bildirimi formuyla WhatsApp’tan teyit iletin.",
  },
];

export default async function BankAccountsPage() {
  const settings = await getSiteSettings();
  const phone = settings.contact.phone || settings.whatsapp.phone;
  const wa = buildWhatsAppUrl(
    resolveWhatsAppPhone({
      whatsappPhone: settings.whatsapp.phone,
      contactPhone: settings.contact.phone,
    }),
    "Merhaba, havale için güncel IBAN teyidi istiyorum.",
  );

  return (
    <div className="pb-16">
      <section className="page-shell border-b border-outline-variant/20 pt-12 pb-10 md:pt-16">
        <div className="page-enter max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Havale · EFT
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-on-surface md:text-5xl">
            Banka hesapları
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface-variant">
            Havale yaptıktan sonra{" "}
            <Link
              href="/odeme-bildirimi"
              className="font-semibold text-primary underline"
            >
              ödeme bildirimi
            </Link>{" "}
            formunu doldurun. Açıklama kısmına sipariş numaranızı yazmayı
            unutmayın.
          </p>
        </div>
      </section>

      <section className="page-shell py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 70} variant="up">
              <div className="card-motion rounded-xl border border-[#ebece8] bg-surface-container-lowest p-5 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                  {s.n}
                </span>
                <h2 className="mt-3 font-display text-lg text-on-surface">
                  {s.title}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell pb-10">
        <div className="grid gap-4 md:grid-cols-2">
          {ACCOUNTS.map((a, i) => (
            <Reveal key={a.iban} delay={i * 80} variant="scale">
              <div className="card-motion relative rounded-2xl border border-[#ebece8] bg-surface-container-lowest p-6 shadow-sm">
                <div className="shimmer-accent absolute inset-x-0 top-0 h-px" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {a.bank}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {a.note} · {a.branch}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary-container/50 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">
                    TL
                  </span>
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs text-on-surface-variant">
                      Hesap sahibi
                    </dt>
                    <dd className="mt-1 font-semibold text-on-surface">
                      {a.holder}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-on-surface-variant">IBAN</dt>
                    <dd className="mt-1 break-all font-mono text-base font-semibold tracking-wide text-on-surface">
                      {a.iban}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5">
                  <CopyIbanButton iban={a.iban} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 rounded-xl bg-tertiary-fixed/30 p-5 text-sm text-on-surface-variant">
          <p>
            Hesap bilgileri örnek / yer tutucudur. Güncel IBAN için{" "}
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="font-semibold text-primary underline"
              >
                {phone}
              </a>
            ) : (
              "destek hattımız"
            )}{" "}
            veya{" "}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline"
            >
              WhatsApp
            </a>{" "}
            üzerinden teyit alın.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/odeme-bildirimi" className="btn-cta pressable px-6 py-3 text-sm">
            Ödeme bildirimi gönder
          </Link>
          <Link
            href="/siparis-sorgula"
            className="btn-ghost pressable px-6 py-3 text-sm"
          >
            Sipariş sorgula
          </Link>
        </div>
      </section>
    </div>
  );
}
