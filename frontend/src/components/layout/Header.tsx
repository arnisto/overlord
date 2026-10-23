import Form from "next/form";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/lib/actions/auth";
import { Avatar } from "@/components/Avatar";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1260px] items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Communauté Le Revenu, accueil">
          <span className="bg-brand px-1.5 py-0.5 text-lg font-black uppercase tracking-tight text-white ring-2 ring-black">
            Le&nbsp;Revenu
          </span>
          <span className="hidden border-l border-line pl-3 font-semibold text-ink-2 sm:inline">Communauté</span>
        </Link>

        {/* Recherche : simple formulaire GET, fonctionne même sans JavaScript. */}
        <Form action="/" className="hidden flex-1 md:block" role="search">
          <label htmlFor="header-search" className="sr-only">
            Rechercher une discussion
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Rechercher une discussion, un sujet…"
            className="w-full max-w-md rounded-control border border-transparent bg-fill px-3 py-2 text-[15px] placeholder:text-ink-3 focus:border-line-strong focus:bg-surface focus:outline-none"
          />
        </Form>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/discussions/nouvelle"
                className="hidden rounded-control bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-hover sm:inline-block"
              >
                Nouvelle discussion
              </Link>
              <span className="flex items-center gap-2 pl-1 text-sm font-medium" title="Connecté">
                <Avatar username={user.username} size="sm" />
                <span className="hidden lg:inline">{user.username}</span>
              </span>
              <form action={logout}>
                <button type="submit" className="rounded-control px-2.5 py-2 text-sm text-ink-3 hover:bg-fill hover:text-ink">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/connexion"
              className="rounded-control bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
