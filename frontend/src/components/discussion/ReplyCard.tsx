import type { Reply } from "@/lib/strapi/types";
import { Avatar } from "@/components/Avatar";
import { DateLabel } from "@/components/DateLabel";
import { BestReplyButton } from "./BestReplyButton";
import { VoteButton } from "./VoteButton";

type Props = {
  reply: Reply;
  discussionId: string;
  slug: string;
  isBest: boolean;
  viewerId: number | null;
  canChooseBest: boolean;
};

export function ReplyCard({ reply, discussionId, slug, isBest, viewerId, canChooseBest }: Props) {
  const isOwnReply = viewerId !== null && reply.author?.id === viewerId;
  const voteDisabledReason =
    viewerId === null ? "Connectez-vous pour voter" : isOwnReply ? "Vous ne pouvez pas voter pour votre réponse" : undefined;

  return (
    <article
      id={`reponse-${reply.documentId}`}
      className={`scroll-mt-24 rounded-card bg-surface p-5 shadow-card ${isBest ? "ring-2 ring-ok" : ""}`}
    >
      {isBest && <p className="mb-2 text-[13px] font-semibold text-ok">✓ Meilleure réponse</p>}
      {reply.author && (
        <div className="flex items-center gap-2.5">
          <Avatar username={reply.author.username} />
          <div className="leading-tight">
            <div className="font-semibold">{reply.author.username}</div>
            <div className="text-[13px] text-ink-3">
              <DateLabel iso={reply.createdAt} />
            </div>
          </div>
        </div>
      )}
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{reply.content}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <VoteButton
          replyId={reply.documentId}
          slug={slug}
          count={reply.helpfulCount}
          voted={reply.viewerHasVoted}
          disabledReason={voteDisabledReason}
        />
        {canChooseBest && (
          <BestReplyButton discussionId={discussionId} replyId={reply.documentId} slug={slug} isBest={isBest} />
        )}
      </div>
    </article>
  );
}
