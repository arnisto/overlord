import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscussionBySlug } from "@/lib/strapi/queries";
import { getCurrentUser, getToken } from "@/lib/session";
import { pluralize } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge, TypePill } from "@/components/CategoryBadge";
import { DateLabel } from "@/components/DateLabel";
import { ReplyCard } from "@/components/discussion/ReplyCard";
import { ReplyForm } from "@/components/discussion/ReplyForm";

export async function generateMetadata({ params }: PageProps<"/discussions/[slug]">): Promise<Metadata> {
  const discussion = await getDiscussionBySlug((await params).slug, await getToken());
  return discussion ? { title: discussion.title, description: discussion.content.slice(0, 160) } : {};
}

/*
 * Rendu serveur à chaque requête : les réponses doivent être à jour et la
 * page dépend de l'utilisateur (ses votes, ses droits sur la discussion).
 */
export default async function DiscussionPage({ params }: PageProps<"/discussions/[slug]">) {
  const { slug } = await params;
  const [discussion, user] = await Promise.all([getDiscussionBySlug(slug, await getToken()), getCurrentUser()]);
  if (!discussion) notFound();

  const isAuthor = user !== null && discussion.author?.id === user.id;
  const bestReply = discussion.replies.find((r) => r.documentId === discussion.bestReplyId);
  const helpfulTotal = discussion.replies.reduce((sum, r) => sum + r.helpfulCount, 0);
  const participants = new Set(discussion.replies.map((r) => r.author?.username).filter(Boolean)).size;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <main className="min-w-0 space-y-4">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-3">
          <Link href="/" className="hover:text-ink">
            Accueil
          </Link>
          {discussion.category && (
            <>
              <span aria-hidden> › </span>
              <Link href={`/?category=${discussion.category.slug}`} className="hover:text-ink">
                {discussion.category.name}
              </Link>
            </>
          )}
        </nav>

        <article className="rounded-card bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {discussion.category && <CategoryBadge category={discussion.category} />}
            <TypePill type={discussion.type} />
            {bestReply && (
              <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-semibold text-ok">✓ Résolu</span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{discussion.title}</h1>
          {discussion.author && (
            <div className="mt-3 flex items-center gap-2.5">
              <Avatar username={discussion.author.username} />
              <div className="leading-tight">
                <div className="font-semibold">{discussion.author.username}</div>
                <div className="text-[13px] text-ink-3">
                  <DateLabel iso={discussion.createdAt} prefix="Publiée" />
                </div>
              </div>
            </div>
          )}
          <div className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink">{discussion.content}</div>
        </article>

        {bestReply && (
          <a
            href={`#reponse-${bestReply.documentId}`}
            className="block rounded-card border border-ok/30 bg-ok-soft/60 px-5 py-3 text-sm"
          >
            <span className="font-semibold text-ok">✓ Meilleure réponse</span>
            {bestReply.author && <span className="text-ink-2"> · {bestReply.author.username}</span>}
            <p className="mt-1 line-clamp-2 text-ink-2">{bestReply.content}</p>
          </a>
        )}

        <section aria-labelledby="replies-title" className="space-y-3">
          <h2 id="replies-title" className="font-display text-xl font-bold">
            {discussion.replies.length > 0 ? pluralize(discussion.replies.length, "réponse") : "Aucune réponse pour l'instant"}
          </h2>

          {discussion.replies.map((reply) => (
            <ReplyCard
              key={reply.documentId}
              reply={reply}
              discussionId={discussion.documentId}
              slug={discussion.slug}
              isBest={reply.documentId === discussion.bestReplyId}
              viewerId={user?.id ?? null}
              canChooseBest={isAuthor}
            />
          ))}
        </section>

        {user ? (
          <ReplyForm discussionId={discussion.documentId} slug={discussion.slug} username={user.username} />
        ) : (
          <div className="rounded-card bg-surface p-6 text-center shadow-card">
            <h2 className="font-display text-lg font-bold">Vous avez un avis ou une expérience à partager ?</h2>
            <p className="mt-1 text-ink-3">Connectez-vous pour répondre à cette discussion.</p>
            <Link
              href={`/connexion?next=/discussions/${discussion.slug}`}
              className="mt-4 inline-block rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Se connecter pour répondre
            </Link>
          </div>
        )}
      </main>

      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-card bg-surface p-5 shadow-card">
          <h2 className="text-sm font-semibold">Cette discussion</h2>
          <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-ink-3">Réponses</dt>
              <dd className="text-lg font-semibold">{discussion.replies.length}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Utile</dt>
              <dd className="text-lg font-semibold">{helpfulTotal}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Participants</dt>
              <dd className="text-lg font-semibold">{participants}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
