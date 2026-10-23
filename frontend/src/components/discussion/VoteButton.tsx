"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleVote } from "@/lib/actions/replies";

type Props = {
  replyId: string;
  slug: string;
  count: number;
  voted: boolean;
  /** Raison affichée quand le vote n'est pas possible (visiteur, propre réponse). */
  disabledReason?: string;
};

/**
 * Bouton « Utile » : mise à jour optimiste immédiate, puis confirmation par
 * Strapi. En cas de refus, React revient automatiquement à l'état serveur.
 */
export function VoteButton({ replyId, slug, count, voted, disabledReason }: Props) {
  const [optimistic, setOptimistic] = useOptimistic({ count, voted });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const onClick = () => {
    setError(undefined);
    startTransition(async () => {
      setOptimistic((s) => ({ voted: !s.voted, count: s.count + (s.voted ? -1 : 1) }));
      const result = await toggleVote(replyId, slug);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={Boolean(disabledReason) || isPending}
        aria-pressed={optimistic.voted}
        title={disabledReason}
        className={`inline-flex items-center gap-1.5 rounded-control border px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
          optimistic.voted
            ? "border-brand/40 bg-brand-soft text-brand-text"
            : "border-line bg-surface text-ink-2 enabled:hover:bg-surface-2"
        }`}
      >
        <span aria-hidden>👍</span> Utile <span className="tabular-nums">{optimistic.count}</span>
      </button>
      {error && (
        <span role="alert" className="text-[13px] text-brand-text">
          {error}
        </span>
      )}
    </span>
  );
}
