import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/lib/actions/auth";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const { next } = await searchParams;
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-md">
      <div className="rounded-card bg-surface p-6 shadow-card sm:p-8">
        {user ? (
          <>
            <h1 className="font-display text-2xl font-bold">Vous êtes connecté</h1>
            <p className="mt-2 text-ink-2">
              Connecté en tant que <strong>{user.username}</strong>.
            </p>
            <div className="mt-5 flex gap-3">
              <Link href="/" className="rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
                Aller à la communauté
              </Link>
              <form action={logout}>
                <button type="submit" className="rounded-control border border-line px-4 py-2 text-sm font-medium hover:bg-surface-2">
                  Se déconnecter
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">Se connecter</h1>
            <p className="mt-1 text-ink-3">La lecture est libre ; la connexion est demandée pour publier.</p>
            <LoginForm next={typeof next === "string" ? next : "/"} />
          </>
        )}
      </div>
    </main>
  );
}
