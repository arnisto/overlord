import "server-only";
import { cache } from "react";
import { StrapiError, strapiFetch } from "./client";
import type { Category, DiscussionDetail, DiscussionSummary, Pagination } from "./types";
import type { DiscussionListParams } from "@/lib/search-params";

/*
 * Lectures. Les données publiques (catégories, liste) sont mises en cache par
 * Next.js et étiquetées : les Server Actions invalident l'étiquette après une
 * écriture. Le détail dépend de l'utilisateur (votes) : il est toujours frais.
 */
export const CACHE_TAGS = {
  categories: "categories",
  discussions: "discussions",
} as const;

export async function getCategories(): Promise<Category[]> {
  const { data } = await strapiFetch<{ data: Category[] }>("/categories", {
    query: { sort: "position:asc", "pagination[pageSize]": 100 },
    next: { revalidate: 3600, tags: [CACHE_TAGS.categories] },
  });
  return data;
}

export async function getDiscussions(params: DiscussionListParams) {
  return strapiFetch<{ data: DiscussionSummary[]; meta: { pagination: Pagination } }>("/discussions", {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      category: params.category,
      q: params.q,
    },
    next: { revalidate: 60, tags: [CACHE_TAGS.discussions] },
  });
}

/**
 * Renvoie `null` si la discussion n'existe pas (la page affiche alors un 404).
 * `cache` (React) évite un second appel quand la page et ses métadonnées la lisent.
 */
export const getDiscussionBySlug = cache(async (slug: string, token?: string): Promise<DiscussionDetail | null> => {
  try {
    const { data } = await strapiFetch<{ data: DiscussionDetail }>(
      `/discussions/slug/${encodeURIComponent(slug)}`,
      { token, cache: "no-store" },
    );
    return data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error;
  }
});
