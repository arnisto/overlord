import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-card bg-surface p-8 text-center shadow-card">
      <h1 className="font-display text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-ink-3">Cette discussion n’existe pas ou a été supprimée.</p>
      <Link href="/" className="mt-5 inline-block rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
        Retour à la communauté
      </Link>
    </div>
  );
}
