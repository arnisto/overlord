/** Squelette affiché pendant le chargement de la liste (streaming du Server Component). */
export default function Loading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]" aria-busy="true" aria-label="Chargement">
      <div className="hidden space-y-2 lg:block">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-7 animate-pulse rounded-control bg-fill" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-44 animate-pulse rounded-card bg-fill" />
        <div className="divide-y divide-line rounded-card bg-surface shadow-card">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-4 p-5">
              <div className="h-14 w-16 animate-pulse rounded-control bg-fill" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-fill" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-fill" />
                <div className="h-3 w-full animate-pulse rounded bg-fill" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
