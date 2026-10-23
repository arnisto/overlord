import Link from "next/link";

/** Barre de navigation basse sur mobile, avec le bouton central de publication (maquette). */
export function MobileNav() {
  const item = "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-ink-2";
  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/90 backdrop-blur-md lg:hidden"
    >
      <Link href="/" className={item}>
        <span aria-hidden className="text-lg leading-none">⌂</span>
        Accueil
      </Link>
      <Link href="/discussions/nouvelle" className={item}>
        <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-brand text-lg leading-none text-white">
          +
        </span>
        Publier
      </Link>
      <Link href="/connexion" className={item}>
        <span aria-hidden className="text-lg leading-none">◉</span>
        Compte
      </Link>
    </nav>
  );
}
