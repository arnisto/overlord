"use server";

import { revalidatePath, updateTag } from "next/cache";
import { strapiFetch } from "@/lib/strapi/client";
import { toActionError } from "./errors";
import { CACHE_TAGS } from "@/lib/strapi/queries";
import { getToken } from "@/lib/session";
import { validateReply } from "@/lib/validation";

export type ReplyFormState = { error?: string; content?: string; success?: boolean };

export async function createReply(
  discussionId: string,
  slug: string,
  _prev: ReplyFormState,
  formData: FormData,
): Promise<ReplyFormState> {
  const token = await getToken();
  if (!token) return { error: "Connectez-vous pour répondre." };

  const content = String(formData.get("content") ?? "");
  const invalid = validateReply(content);
  if (invalid) return { error: invalid, content };

  try {
    await strapiFetch("/replies", {
      method: "POST",
      token,
      body: { data: { content, discussion: discussionId } },
      cache: "no-store",
    });
  } catch (error) {
    return { error: messageOf(error), content };
  }

  // Le nombre de réponses affiché dans la liste change : on invalide aussi le cache de l'accueil.
  updateTag(CACHE_TAGS.discussions);
  revalidatePath(`/discussions/${slug}`);
  return { success: true };
}

export type VoteResult =
  | { ok: true; voted: boolean; helpfulCount: number }
  | { ok: false; error: string };

export async function toggleVote(replyId: string, slug: string): Promise<VoteResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Connectez-vous pour voter." };

  try {
    const { data } = await strapiFetch<{ data: { voted: boolean; helpfulCount: number } }>(
      `/replies/${replyId}/vote`,
      { method: "POST", token, cache: "no-store" },
    );
    revalidatePath(`/discussions/${slug}`);
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: messageOf(error) };
  }
}

const messageOf = (error: unknown) => {
  const { error: message, fieldErrors } = toActionError(error);
  return message ?? Object.values(fieldErrors ?? {})[0] ?? "Action impossible.";
};
