import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import { getLegalDocument } from "@/lib/api";
import { getSiteSettings } from "@/lib/cms";
import {
  applyLiveSellerContact,
  buildLegalFallback,
  sellerFromSettings,
} from "@/lib/legal-content";

type Props = {
  slug: string;
};

/** Admin RichTextEditor HTML kaydedebilir; düz metin seed de gelebilir. */
function looksLikeHtml(value: string): boolean {
  return /<\/?(?:p|div|br|ul|ol|li|h[1-6]|strong|em|a|span)\b/i.test(value);
}

export async function LegalPage({ slug }: Props) {
  const locale = await getLocale();
  const [doc, settings, t] = await Promise.all([
    getLegalDocument(slug, { locale }),
    getSiteSettings(locale),
    getTranslations("legalPage"),
  ]);

  const seller = sellerFromSettings(settings);
  const fallbackMap = buildLegalFallback(seller, locale);
  const fallback = fallbackMap[slug] ?? {
    title: slug,
    content: t("comingSoon"),
  };

  const title = doc?.title || fallback.title;
  const apiContent = doc?.content?.trim() || "";
  const isPlaceholder =
    !apiContent ||
    apiContent.includes("örnek içerik") ||
    /sample content/i.test(apiContent) ||
    /güncellenecek/i.test(apiContent) ||
    apiContent.includes("500 000 00 00");
  const rawContent = isPlaceholder ? fallback.content : apiContent;
  const content = applyLiveSellerContact(rawContent, seller);
  const asHtml = looksLikeHtml(content);

  return (
    <article className="page-shell mx-auto max-w-3xl py-16 md:pt-24 md:pb-24">
      <div className="page-enter">
        <div className="mb-3 font-meta text-xs uppercase tracking-widest text-primary">
          {t("kicker")}
        </div>
        <h1 className="font-display text-4xl leading-none md:text-5xl">{title}</h1>
        {doc?.version ? (
          <p className="mt-4 font-meta text-[11px] uppercase text-secondary">
            {t("version", { version: doc.version })}
          </p>
        ) : null}
      </div>
      <Reveal className="mt-10" variant="scale" delay={120}>
        {asHtml ? (
          <div
            className="prose-legal border border-outline-variant/20 bg-surface-container-low p-6 font-sans text-base leading-7 text-secondary md:p-10 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose-legal whitespace-pre-wrap border border-outline-variant/20 bg-surface-container-low p-6 font-sans text-base leading-7 text-secondary md:p-10">
            {content}
          </div>
        )}
      </Reveal>
    </article>
  );
}
