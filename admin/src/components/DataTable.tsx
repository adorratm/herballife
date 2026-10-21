type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  /** Düzenlenen / seçili satır — tabloda vurgulanır */
  selectedRowKey?: string | null;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Kayıt yok',
  onRowClick,
  selectedRowKey = null,
}: DataTableProps<T>) {
  if (!rows.length) {
    return (
      <div className="animate-fade-up rounded-xl border border-border-muted bg-surface px-4 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up overflow-hidden rounded-xl border border-border-muted bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-muted bg-surface-high/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-muted ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = rowKey(row);
              const selected = Boolean(selectedRowKey && selectedRowKey === key);
              const clickable = Boolean(onRowClick);
              return (
                <tr
                  key={key}
                  onClick={
                    onRowClick
                      ? (e) => {
                          const target = e.target as HTMLElement | null;
                          if (
                            target?.closest(
                              'button, a, input, select, textarea, label',
                            )
                          ) {
                            return;
                          }
                          onRowClick(row);
                        }
                      : undefined
                  }
                  aria-selected={selected || undefined}
                  className={[
                    'row-motion border-b border-border-muted last:border-b-0',
                    selected
                      ? 'bg-accent/10 ring-1 ring-inset ring-accent/40'
                      : 'bg-surface hover:bg-surface-high/70',
                    clickable ? 'cursor-pointer' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 ${col.className || ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
