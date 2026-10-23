import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { StrapiError, strapiFetch } from "@/lib/strapi/client";
import type { SessionUser } from "@/lib/strapi/types";

/*
 * Session de démonstration : le JWT émis par Strapi (Users & Permissions) est
 * conservé dans un cookie httpOnly, illisible depuis le JavaScript du
 * navigateur. Strapi reste seul juge des droits : le frontend se contente de
 * transmettre le jeton.
 */
export const SESSION_COOKIE = "lr_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // aligné sur JWT_EXPIRES_IN (7 jours)

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Utilisateur courant, vérifié auprès de Strapi (une seule requête par rendu). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getToken();
  if (!token) return null;

  try {
    const user = await strapiFetch<SessionUser>("/users/me", { token, cache: "no-store" });
    return { id: user.id, documentId: user.documentId, username: user.username };
  } catch (error) {
    // Jeton expiré ou invalide : on se comporte comme un visiteur.
    if (error instanceof StrapiError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
});

export async function setSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
