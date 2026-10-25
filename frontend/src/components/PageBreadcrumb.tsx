import { Link, toLinkHref } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export type BreadcrumbItem = { name: string; path: string };

export async function PageBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const t = await getTranslations("aria");
  if (!items.length) return null;

  return (
    <nav
      aria-label={t("breadcrumb")}
      className="border-b border-outline-variant bg-white"
    >
      <ol className="page-shell flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm text-on-surface-variant">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span className="text-outline-variant" aria-hidden>
                  /
                </span>
              ) : null}
              {last ? (
                <span className="text-on-surface">{item.name}</span>
              ) : (
                <Link
                  href={toLinkHref(item.path)}
                  className="transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
