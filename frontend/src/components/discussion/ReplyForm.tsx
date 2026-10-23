"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReply, type ReplyFormState } from "@/lib/actions/replies";
import { REPLY_MAX_LENGTH } from "@/lib/validation";

type Props = { discussionId: string; slug: string; username: string };

export function ReplyForm({ discussionId, slug, username }: Props) {
  const [state, formAction, isPending] = useActionState<ReplyFormState, FormData>(
    createReply.bind(null, discussionId, slug),
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // La réponse est publiée : on vide le champ (la liste est rafraîchie par le serveur).
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-card bg-surface p-5 shadow-card" noValidate>
      <label htmlFor="reply-content" className="font-display text-lg font-bold">
        Votre réponse
      </label>
      <p className="text-[13px] text-ink-3">Vous répondez en tant que {username}.</p>
      <textarea
        id="reply-content"
        name="content"
        rows={4}
        required
        maxLength={REPLY_MAX_LENGTH}
        defaultValue={state.content}
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? "reply-error" : undefined}
        placeholder="Partagez votre expérience, en restant factuel et bienveillant."
        className="mt-3 w-full rounded-control border border-line bg-surface p-3 text-[15px] focus:border-line-strong focus:outline-none"
      />
      {state.error && (
        <p id="reply-error" role="alert" className="mt-1 text-sm text-brand-text">
          {state.error}
        </p>
      )}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {isPending ? "Publication…" : "Publier ma réponse"}
        </button>
      </div>
    </form>
  );
}
