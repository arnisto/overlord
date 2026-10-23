import Link from "next/link";
import type { Pagination as PaginationMeta } from "@/lib/strapi/types";

type Props = { pagination: PaginationMeta; hrefForPage: (page: number) => string };

export function Pagination({ pagination, hrefForPage }: Props) {
  const { page, pageCount } = pagination;
  if (pageCount <= 1) return null;

  const linkClass = "rounded-control border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-2";
  const disabledClass = "rounded-control border border-line px-3 py-1.5 text-sm text-ink-3 opacity-50";

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} className={linkClass} rel="prev">
          ← Précédente
        </Link>
      ) : (
        <span className={disabledClass}>← Précédente</span>
      )}
      <span className="text-sm text-ink-3">
        Page {page} sur {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefForPage(page + 1)} className={linkClass} rel="next">
          Suivante →
        </Link>
      ) : (
        <span className={disabledClass}>Suivante →</span>
      )}
    </nav>
  );
}
