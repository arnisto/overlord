import Link from "next/link";
import type { Category } from "@/lib/strapi/types";

type Props = { categories: Category[]; active?: string };

/** Liste des espaces : colonne latérale sur grand écran, défilement horizontal sur mobile. */
export function CategoryNav({ categories, active }: Props) {
  return (
    <>
      <nav aria-label="Espaces" className="hidden lg:block">
        <p className="mb-2 px-2.5 text-xs font-semibold text-ink-3">Espaces</p>
        <ul className="space-y-0.5">
          <li>
            <CategoryLink href="/" active={!active} color="#1d1d1f" label="Toutes les discussions" />
          </li>
          {categories.map((c) => (
            <li key={c.documentId}>
              <CategoryLink href={`/?category=${c.slug}`} active={active === c.slug} color={c.color} label={c.name} />
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Espaces" className="-mx-4 mb-4 overflow-x-auto px-4 lg:hidden">
        <ul className="flex w-max gap-2">
          <li>
            <Chip href="/" active={!active} label="Tout" />
          </li>
          {categories.map((c) => (
            <li key={c.documentId}>
              <Chip href={`/?category=${c.slug}`} active={active === c.slug} label={c.name} />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function CategoryLink({ href, active, color, label }: { href: string; active: boolean; color: string; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-control px-2.5 py-1.5 text-[15px] ${
        active ? "bg-fill font-semibold text-ink" : "text-ink-2 hover:bg-fill"
      }`}
    >
      <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </Link>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`block whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
        active ? "border-ink bg-ink text-surface" : "border-line bg-surface text-ink-2"
      }`}
    >
      {label}
    </Link>
  );
}
