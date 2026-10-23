import { formatAbsoluteDate, formatRelativeDate } from "@/lib/format";

/** Date relative lisible, avec la date exacte au survol et pour les lecteurs d'écran. */
export function DateLabel({ iso, prefix }: { iso: string; prefix?: string }) {
  return (
    <time dateTime={iso} title={formatAbsoluteDate(iso)}>
      {prefix ? `${prefix} ` : ""}
      {formatRelativeDate(iso)}
    </time>
  );
}
