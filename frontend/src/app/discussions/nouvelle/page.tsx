import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getCategories } from "@/lib/strapi/queries";
import { NewDiscussionForm } from "@/components/forms/NewDiscussionForm";

export const metadata: Metadata = { title: "Nouvelle discussion" };

export default async function NewDiscussionPage({ searchParams }: PageProps<"/discussions/nouvelle">) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/discussions/nouvelle");

  const [{ category }, categories] = await Promise.all([searchParams, getCategories()]);

  return (
    <main className="mx-auto max-w-2xl">
      <div className="rounded-card bg-surface p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-bold">Lancer une discussion</h1>
        <p className="mt-1 text-ink-3">
          Partage d&apos;expérience bienvenu ; pas de conseil personnalisé ni de sollicitation.
        </p>
        <NewDiscussionForm
          categories={categories.map(({ documentId, name, slug }) => ({ documentId, name, slug }))}
          defaultCategorySlug={typeof category === "string" ? category : undefined}
        />
      </div>
    </main>
  );
}
