import Link from "next/link";

type Step = 1 | 2 | 3;

const STEPS: { n: Step; label: string; href?: string }[] = [
  { n: 1, label: "Sepetim", href: "/sepet" },
  { n: 2, label: "Teslimat", href: "/odeme" },
  { n: 3, label: "Güvenli Ödeme" },
];

export function CheckoutSteps({ active }: { active: Step }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2.5 text-xs font-semibold shadow-sm sm:gap-3">
      {STEPS.map((step, i) => {
        const done = step.n < active;
        const current = step.n === active;
        const circle = (
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
              current || done
                ? "bg-primary-fixed text-primary"
                : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {step.n}
          </span>
        );
        const label = (
          <span
            className={
              current
                ? "text-primary"
                : done
                  ? "text-on-surface"
                  : "text-on-surface-variant/60"
            }
          >
            {step.label}
          </span>
        );
        return (
          <div key={step.n} className="flex items-center gap-2">
            {i > 0 ? (
              <span
                className={`mx-0.5 h-0.5 w-5 sm:w-6 ${
                  done || current ? "bg-primary-fixed" : "bg-surface-container"
                }`}
              />
            ) : null}
            {step.href && !current ? (
              <Link
                href={step.href}
                className="flex items-center gap-2 hover:opacity-80"
              >
                {circle}
                {label}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                {circle}
                {label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
