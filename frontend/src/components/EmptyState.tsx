import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      {children && <div className="mx-auto mt-2 max-w-md text-ink-3">{children}</div>}
    </div>
  );
}
