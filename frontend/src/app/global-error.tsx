"use client";

/** Dernier filet : erreur dans le layout racine (en-tête compris). */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1rem", textAlign: "center" }}>
        <h1>Impossible de charger la communauté</h1>
        <p>Le service est momentanément indisponible.</p>
        <button type="button" onClick={() => retry()}>
          Réessayer
        </button>
      </body>
    </html>
  );
}
