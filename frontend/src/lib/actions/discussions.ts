"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { strapiFetch } from "@/lib/strapi/client";
import { toActionError } from "./errors";
import { CACHE_TAGS } from "@/lib/strapi/queries";
import type { DiscussionDetail } from "@/lib/strapi/types";
import { getToken } from "@/lib/session";
import { validateDiscussionForm, type DiscussionFormValues, type FieldErrors } from "@/lib/validation";

/*
 * Server Actions : un relais fin entre les formulaires et Strapi. Elles
 * ajoutent le JWT de l'utilisateur et traduisent les erreurs ; les règles
 * métier et les autorisations sont appliquées par Strapi.
 */

export type DiscussionFormState = {
  values?: DiscussionFormValues;
  fieldErrors?: FieldErrors;
  error?: string;
};

export async function createDiscussion(
  _prev: DiscussionFormState,
  formData: FormData,
): Promise<DiscussionFormState> {
  const token = await getToken();
  if (!token) redirect("/connexion?next=/discussions/nouvelle");

  const values: DiscussionFormValues = {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    type: String(formData.get("type") ?? ""),
    category: String(formData.get("category") ?? ""),
  };

  const fieldErrors = validateDiscussionForm(values);
  if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

  let slug: string;
  try {
    const { data } = await strapiFetch<{ data: Pick<DiscussionDetail, "slug"> }>("/discussions", {
      method: "POST",
      token,
      body: { data: values },
      cache: "no-store",
    });
    slug = data.slug;
  } catch (error) {
    return { values, ...toActionError(error) };
  }

  updateTag(CACHE_TAGS.discussions);
  redirect(`/discussions/${slug}`);
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function setBestReply(
  discussionId: string,
  replyId: string | null,
  slug: string,
): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Connectez-vous pour choisir la meilleure réponse." };

  try {
    await strapiFetch(`/discussions/${discussionId}/best-reply`, {
      method: "PUT",
      token,
      body: { data: { reply: replyId } },
      cache: "no-store",
    });
  } catch (error) {
    return { ok: false, error: toActionError(error).error ?? "Action impossible." };
  }

  updateTag(CACHE_TAGS.discussions);
  revalidatePath(`/discussions/${slug}`);
  return { ok: true };
}
