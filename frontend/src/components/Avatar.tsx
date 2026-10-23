import { avatarColor, initials } from "@/lib/format";

export function Avatar({ username, size = "md" }: { username: string; size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "size-6 text-[10px]" : "size-9 text-xs";
  return (
    <span
      aria-hidden
      className={`${dimensions} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: avatarColor(username) }}
    >
      {initials(username)}
    </span>
  );
}
