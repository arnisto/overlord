const relative = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
const absolute = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** « il y a 3 heures », « hier »… ; « à l'instant » sous la minute. */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "à l'instant";
}

export function formatAbsoluteDate(iso: string): string {
  return absolute.format(new Date(iso));
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString("fr-FR")} ${count > 1 ? plural : singular}`;
}

const AVATAR_COLORS = ["#5856d6", "#0a7f99", "#6e6e73", "#c93400", "#d30f45"];

/** Couleur d'avatar stable pour un pseudo donné (palette de la maquette). */
export function avatarColor(username: string): string {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(username: string): string {
  const parts = username.split(/[._\-\s]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : username.slice(0, 2)).toUpperCase();
}
