import "server-only";
import type { StrapiErrorBody, StrapiFieldError } from "./types";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

/** Erreur HTTP renvoyée par Strapi, avec le message et les erreurs par champ. */
export class StrapiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, errors: StrapiFieldError[] = []) {
    super(message);
    this.name = "StrapiError";
    this.status = status;
    this.fieldErrors = Object.fromEntries(
      errors.filter((e) => e.path.length > 0).map((e) => [e.path[0], e.message]),
    );
  }
}

type StrapiRequest = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Options de cache Next.js (`next: { revalidate, tags }` ou `cache: "no-store"`). */
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

/**
 * Point d'entrée unique vers l'API Strapi. Exécuté uniquement côté serveur :
 * l'URL interne de Strapi et le JWT de l'utilisateur ne sont jamais exposés
 * au navigateur.
 */
export async function strapiFetch<T>(path: string, options: StrapiRequest = {}): Promise<T> {
  const { method = "GET", token, body, query, cache, next } = options;

  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as StrapiErrorBody | null)?.error;
    throw new StrapiError(
      response.status,
      error?.message ?? `Erreur ${response.status} de l'API`,
      error?.details?.errors,
    );
  }

  return payload as T;
}
