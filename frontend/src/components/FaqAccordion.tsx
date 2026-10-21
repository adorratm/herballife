"use client";

type FaqItem = { question: string; answer: string };

type Props = {
  items: FaqItem[];
  className?: string;
};

export function FaqAccordion({ items, className = "" }: Props) {
  return (
    <div className={`space-y-3${className ? ` ${className}` : ""}`}>
      {items.map((item, i) => (
        <details
          key={`${item.question}-${i}`}
          className="faq-item group card-motion overflow-hidden rounded-xl border border-[#ebece8] bg-surface-container-lowest shadow-sm open:border-primary/25 open:shadow-[0_8px_24px_-4px_rgba(45,52,54,0.07)]"
          open={i === 0}
        >
          <summary className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="font-display text-base text-on-surface md:text-lg">
              {item.question}
            </span>
            <span
              className="faq-chevron flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container/50 text-primary"
              aria-hidden
            >
              ▾
            </span>
          </summary>
          <div className="faq-body">
            <div>
              <p className="px-5 pb-5 text-sm leading-relaxed text-on-surface-variant md:text-base">
                {item.answer}
              </p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
