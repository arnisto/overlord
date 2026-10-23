"use client";

import { useEffect } from "react";

/** Erreur inattendue (API indisponible, réponse invalide…) : message et nouvel essai. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-lg rounded-card bg-surface p-8 text-center shadow-card">
      <h1 className="font-display text-2xl font-bold">Impossible de charger la communauté</h1>
      <p className="mt-2 text-ink-3">Le service est momentanément indisponible. Réessayez dans un instant.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-5 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
      >
        Réessayer
      </button>
    </div>
  );
}
