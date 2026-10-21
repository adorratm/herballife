type StatsCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'accent' | 'warning' | 'danger';
};

const TONE = {
  default: {
    border: 'border-border-muted',
    bar: 'bg-muted/40',
  },
  accent: {
    border: 'border-accent/30',
    bar: 'bg-accent',
  },
  warning: {
    border: 'border-warning/35',
    bar: 'bg-warning',
  },
  danger: {
    border: 'border-danger/35',
    bar: 'bg-danger',
  },
};

export function StatsCard({
  label,
  value,
  hint,
  tone = 'default',
}: StatsCardProps) {
  const t = TONE[tone];
  return (
    <div
      className={`panel-motion relative overflow-hidden rounded-xl border bg-surface p-5 shadow-sm ${t.border}`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-1 ${t.bar}`}
        aria-hidden
      />
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
