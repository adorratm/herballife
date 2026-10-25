/** CMS / zengin metin alanlarını güvenli şekilde gösterir (düz metin veya HTML). */
export function CmsHtml({
  html,
  className = "",
  as: Tag = "div",
}: {
  html?: string | null;
  className?: string;
  as?: "div" | "p" | "span";
}) {
  const value = (html || "").trim();
  if (!value) return null;
  const looksHtml = /<[a-z][\s\S]*>/i.test(value);
  // HTML içinde <p>/<div> olabilir; <p> içine blok öğe koymak hidrasyon bozar
  if (looksHtml) {
    const SafeTag = Tag === "span" ? "span" : "div";
    return (
      <SafeTag
        className={className}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }
  return <Tag className={className}>{value}</Tag>;
}
