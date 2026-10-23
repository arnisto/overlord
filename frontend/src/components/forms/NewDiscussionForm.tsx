"use client";

import { useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { createDiscussion, type DiscussionFormState } from "@/lib/actions/discussions";
import { TITLE_MAX_LENGTH, TITLE_MIN_LENGTH, validateDiscussionForm, type FieldErrors } from "@/lib/validation";
import type { Category } from "@/lib/strapi/types";

type Props = {
  categories: Pick<Category, "documentId" | "name" | "slug">[];
  defaultCategorySlug?: string;
};

const fieldClass =
  "mt-1 w-full rounded-control border bg-surface px-3 py-2 text-[15px] focus:outline-none aria-[invalid=true]:border-brand";

export function NewDiscussionForm({ categories, defaultCategorySlug }: Props) {
  const [state, formAction, isPending] = useActionState<DiscussionFormState, FormData>(createDiscussion, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [titleLength, setTitleLength] = useState(state.values?.title.trim().length ?? 0);

  // Erreurs du navigateur d'abord (retour immédiat), sinon celles renvoyées par Strapi.
  const errors = { ...state.fieldErrors, ...clientErrors };
  const defaultCategory =
    state.values?.category ?? categories.find((c) => c.slug === defaultCategorySlug)?.documentId ?? "";

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const found = validateDiscussionForm({
      title: String(data.get("title") ?? ""),
      content: String(data.get("content") ?? ""),
      type: String(data.get("type") ?? ""),
      category: String(data.get("category") ?? ""),
    });
    setClientErrors(found);
    if (Object.keys(found).length > 0) event.preventDefault();
  };

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
      <fieldset>
        <legend className="text-sm font-medium">Type de publication</legend>
        <div className="mt-2 inline-flex rounded-control bg-fill p-0.5">
          {[
            { value: "question", label: "Question" },
            { value: "discussion", label: "Discussion" },
          ].map((option) => (
            <label
              key={option.value}
              className="cursor-pointer rounded-[7px] px-3 py-1.5 text-sm font-medium text-ink-2 has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-card"
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                defaultChecked={(state.values?.type ?? "question") === option.value}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError id="type-error" message={errors.type} />
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="title" className="text-sm font-medium">
            Titre
          </label>
          <span className={`text-xs ${titleLength < TITLE_MIN_LENGTH ? "text-ink-3" : "text-ok"}`}>
            {titleLength} / {TITLE_MIN_LENGTH} caractères minimum
          </span>
        </div>
        <input
          id="title"
          name="title"
          defaultValue={state.values?.title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(e) => setTitleLength(e.target.value.trim().length)}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          placeholder="Ex. : Ouvrir un PEA avec 5 000 € : par où commencer ?"
          className={`${fieldClass} border-line`}
        />
        <FieldError id="title-error" message={errors.title} />
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium">
          Catégorie
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultCategory}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-error" : undefined}
          className={`${fieldClass} border-line`}
        >
          <option value="" disabled>
            Choisir un espace…
          </option>
          {categories.map((c) => (
            <option key={c.documentId} value={c.documentId}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError id="category-error" message={errors.category} />
      </div>

      <div>
        <label htmlFor="content" className="text-sm font-medium">
          Contenu
        </label>
        <textarea
          id="content"
          name="content"
          rows={8}
          defaultValue={state.values?.content}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "content-error" : undefined}
          placeholder="Donnez le contexte utile : votre situation, ce que vous avez déjà envisagé…"
          className={`${fieldClass} border-line`}
        />
        <FieldError id="content-error" message={errors.content} />
      </div>

      {state.error && (
        <p role="alert" className="rounded-control bg-brand-soft px-3 py-2 text-sm text-brand-text">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link href="/" className="rounded-control px-4 py-2 text-sm font-medium text-ink-2 hover:bg-fill">
          Annuler
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {isPending ? "Publication…" : "Publier"}
        </button>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-brand-text">
      {message}
    </p>
  );
}
