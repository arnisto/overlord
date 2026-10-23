/*
 * Paramètres d'URL de l'accueil (?category=…&q=…&sort=…&page=…). Ils sont
 * normalisés ici puis renvoyés tels quels à Strapi, qui les revalide.
 */
export const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Plus récentes" },
  { value: "createdAt:asc", label: "Plus anciennes" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type DiscussionListParams = {
  category?: string;
  q?: string;
  sort: SortValue;
  page: number;
  pageSize: number;
};

export const PAGE_SIZE = 10;

type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseDiscussionListParams(raw: RawSearchParams): DiscussionListParams {
  const sort = first(raw.sort);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);
  const q = first(raw.q)?.trim().slice(0, 100);
  const category = first(raw.category)?.trim();

  return {
    category: category || undefined,
    q: q || undefined,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortValue) : "createdAt:desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZE,
  };
}

/** Construit l'URL de l'accueil en conservant les filtres courants. */
export function homeHref(current: DiscussionListParams, patch: Partial<DiscussionListParams> = {}) {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.q) params.set("q", next.q);
  if (next.sort !== "createdAt:desc") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
