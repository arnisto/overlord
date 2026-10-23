import Link from "next/link";
import type { DiscussionSummary } from "@/lib/strapi/types";

type Props = { category: NonNullable<DiscussionSummary["category"]> };

export function CategoryBadge({ category }: Props) {
  return (
    <Link
      href={`/?category=${category.slug}`}
      className="relative z-10 text-[13px] font-semibold hover:underline"
      style={{ color: category.color }}
    >
      {category.name}
    </Link>
  );
}

export function TypePill({ type }: { type: "question" | "discussion" }) {
  return (
    <span className="rounded-full bg-fill px-2 py-0.5 text-[11px] font-medium text-ink-2">
      {type === "question" ? "Question" : "Discussion"}
    </span>
  );
}
