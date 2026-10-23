export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4" aria-busy="true" aria-label="Chargement de la discussion">
      <div className="h-4 w-40 animate-pulse rounded bg-fill" />
      <div className="space-y-3 rounded-card bg-surface p-6 shadow-card">
        <div className="h-3 w-28 animate-pulse rounded bg-fill" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-fill" />
        <div className="h-4 w-full animate-pulse rounded bg-fill" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-fill" />
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-card bg-surface shadow-card" />
      ))}
    </div>
  );
}
