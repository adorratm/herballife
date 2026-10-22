const ITEMS = [
  "%100 Orijinal Ürün",
  "Ücretsiz Kargo",
  "Birebir Koç Takibi",
  "Güvenli Ödeme",
  "Hızlı Teslimat",
  "WhatsApp Destek",
  "Avantajlı Setler",
  "Karıştırıcı hediyesi",
];

export function TrustMarquee() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden rounded-full border border-[#ebece8] bg-surface-container-lowest/90 py-2.5 shadow-sm backdrop-blur-sm">
      <div className="marquee-track gap-8 px-4" aria-hidden>
        {loop.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {label}
          </span>
        ))}
      </div>
      <span className="sr-only">
        Orijinal ürün, ücretsiz kargo, koç takibi ve güvenli ödeme güvenceleri.
      </span>
    </div>
  );
}
