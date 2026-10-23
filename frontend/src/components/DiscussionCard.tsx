import Link from "next/link";
import type { DiscussionSummary } from "@/lib/strapi/types";
import { Avatar } from "./Avatar";
import { CategoryBadge, TypePill } from "./CategoryBadge";
import { DateLabel } from "./DateLabel";

/** Carte d'une discussion dans la liste. Toute la carte est cliquable (lien étiré sur le titre). */
export function DiscussionCard({ discussion }: { discussion: DiscussionSummary }) {
  const { repliesCount, hasBestReply } = discussion;
  const counterStyle = hasBestReply
    ? "border-ok/40 bg-ok-soft text-ok"
    : repliesCount === 0
      ? "border-dashed border-brand/50 text-brand-text"
      : "border-line text-ink";

  return (
    <article className="relative flex gap-4 px-4 py-4 transition-colors hover:bg-surface-2/60 sm:px-5">
      <div
        className={`flex w-16 shrink-0 flex-col items-center justify-center self-start rounded-control border py-2 ${counterStyle}`}
        aria-label={`${repliesCount} réponse${repliesCount > 1 ? "s" : ""}${hasBestReply ? ", résolue" : ""}`}
      >
        <span className="text-lg font-semibold leading-none">{repliesCount}</span>
        <span className="mt-1 text-[11px]">{hasBestReply ? "résolue" : repliesCount > 1 ? "réponses" : "réponse"}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {discussion.category && <CategoryBadge category={discussion.category} />}
          <TypePill type={discussion.type} />
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-ink">
          <Link href={`/discussions/${discussion.slug}`} className="after:absolute after:inset-0">
            {discussion.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[15px] text-ink-2">{discussion.excerpt}</p>
        <div className="mt-2 flex items-center gap-2 text-[13px] text-ink-3">
          {discussion.author && (
            <>
              <Avatar username={discussion.author.username} size="sm" />
              <span className="font-semibold text-ink">{discussion.author.username}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <DateLabel iso={discussion.createdAt} />
        </div>
      </div>
    </article>
  );
}
