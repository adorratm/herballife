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
  /** Son kaydedilen satır — odak halkası */
  highlightRowKey?: string | null;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Kayıt yok',
  onRowClick,
  selectedRowKey = null,
  highlightRowKey = null,
}: DataTableProps<T>) {
  if (!rows.length) {
    return (
      <div className="admin-table-wrap animate-fade-up rounded-2xl border border-border bg-surface px-4 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap animate-fade-up overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="admin-table w-full min-w-180 text-left text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 ${col.className || ''}`}
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
              const highlighted = Boolean(
                highlightRowKey && highlightRowKey === key,
              );
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
                    'row-motion',
                    selected
                      ? 'bg-accent/10 ring-1 ring-inset ring-accent/40'
                      : highlighted
                        ? 'bg-accent/8 ring-2 ring-inset ring-accent/55'
                        : '',
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
