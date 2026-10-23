"use client";

import { useState, useTransition } from "react";
import { setBestReply } from "@/lib/actions/discussions";

type Props = { discussionId: string; replyId: string; slug: string; isBest: boolean };

/** Visible uniquement par l'auteur de la discussion ; Strapi vérifie de toute façon le droit. */
export function BestReplyButton({ discussionId, replyId, slug, isBest }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const onClick = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await setBestReply(discussionId, isBest ? null : replyId, slug);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="rounded-control px-3 py-1 text-sm font-medium text-ok hover:bg-ok-soft disabled:opacity-60"
      >
        {isBest ? "Retirer la meilleure réponse" : "✓ Choisir comme meilleure réponse"}
      </button>
      {error && (
        <span role="alert" className="text-[13px] text-brand-text">
          {error}
        </span>
      )}
    </span>
  );
}
