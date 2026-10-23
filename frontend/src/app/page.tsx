import Form from "next/form";
import Link from "next/link";
import { getCategories, getDiscussions } from "@/lib/strapi/queries";
import { SORT_OPTIONS, homeHref, parseDiscussionListParams } from "@/lib/search-params";
import { pluralize } from "@/lib/format";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { DiscussionCard } from "@/components/DiscussionCard";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";

/*
 * Server Component : les filtres vivent dans l'URL (?category, ?q, ?sort,
 * ?page). Chaque lien ou recherche produit une URL partageable et la page est
 * rendue côté serveur avec les données de Strapi ; aucun JavaScript client
 * n'est nécessaire pour filtrer, trier ou paginer.
 */
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = parseDiscussionListParams(await searchParams);
  const [categories, { data: discussions, meta }] = await Promise.all([getCategories(), getDiscussions(params)]);
  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="min-w-0">
        <CategoryNav categories={categories} active={params.category} />
      </aside>

      <main className="min-w-0">
        <section className="mb-5 overflow-hidden rounded-card bg-gradient-to-br from-hero-top via-hero to-[#4a0d0d] p-6 text-white shadow-card sm:p-7">
          <h1 className="font-display text-3xl font-black leading-tight sm:text-4xl">
            {activeCategory ? activeCategory.name : "La communauté des lecteurs du Revenu"}
          </h1>
          <p className="mt-2 max-w-xl text-white/75">
            {activeCategory?.description ??
              "Posez vos questions d'argent, partagez vos expériences et échangez avec la rédaction. Bourse, épargne, impôts, retraite, transmission."}
          </p>
          <Link
            href="/discussions/nouvelle"
            className="mt-5 inline-block rounded-control bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Lancer une discussion
          </Link>
        </section>

        <div id="discussions" className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Trier par date de publication" className="inline-flex rounded-control bg-fill p-0.5">
            {SORT_OPTIONS.map((option) => {
              const active = params.sort === option.value;
              return (
                <Link
                  key={option.value}
                  href={homeHref(params, { sort: option.value, page: 1 })}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-[7px] px-3 py-1.5 text-sm font-medium ${
                    active ? "bg-surface text-ink shadow-card" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>

          <Form action="/" className="flex w-full gap-2 sm:w-auto" role="search">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <label htmlFor="list-search" className="sr-only">
              Rechercher dans les discussions
            </label>
            <input
              id="list-search"
              name="q"
              type="search"
              defaultValue={params.q}
              placeholder="Rechercher…"
              className="min-w-0 flex-1 rounded-control border border-line bg-surface px-3 py-1.5 text-sm focus:border-line-strong focus:outline-none sm:w-56"
            />
            <button type="submit" className="rounded-control border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-2">
              Rechercher
            </button>
          </Form>
        </div>

        <p className="mb-2 text-sm text-ink-3" aria-live="polite">
          {pluralize(meta.pagination.total, "discussion")}
          {params.q && (
            <>
              {" "}pour « {params.q} » ·{" "}
              <Link href={homeHref(params, { q: undefined, page: 1 })} className="text-brand-text hover:underline">
                effacer la recherche
              </Link>
            </>
          )}
        </p>

        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          {discussions.length > 0 ? (
            <div className="divide-y divide-line">
              {discussions.map((discussion) => (
                <DiscussionCard key={discussion.documentId} discussion={discussion} />
              ))}
            </div>
          ) : (
            <EmptyState title="Aucune discussion trouvée">
              {params.q || params.category ? (
                <Link href="/" className="text-brand-text hover:underline">
                  Voir toutes les discussions
                </Link>
              ) : (
                "Soyez le premier à lancer la conversation."
              )}
            </EmptyState>
          )}
        </div>

        <Pagination pagination={meta.pagination} hrefForPage={(page) => homeHref(params, { page })} />
      </main>
    </div>
  );
}
