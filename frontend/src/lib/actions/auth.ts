"use server";

import { redirect } from "next/navigation";
import { StrapiError, strapiFetch } from "@/lib/strapi/client";
import { clearSession, setSession } from "@/lib/session";

export type LoginState = { error?: string; identifier?: string };

/** N'autorise que les redirections internes, pour éviter les redirections ouvertes. */
const safeRedirect = (target: FormDataEntryValue | null) =>
  typeof target === "string" && target.startsWith("/") && !target.startsWith("//") ? target : "/";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { error: "Renseignez votre identifiant et votre mot de passe.", identifier };
  }

  try {
    const { jwt } = await strapiFetch<{ jwt: string }>("/auth/local", {
      method: "POST",
      body: { identifier, password },
      cache: "no-store",
    });
    await setSession(jwt);
  } catch (error) {
    if (error instanceof StrapiError && error.status === 400) {
      return { error: "Identifiant ou mot de passe incorrect.", identifier };
    }
    if (error instanceof StrapiError && error.status === 429) {
      return { error: "Trop de tentatives, réessayez dans une minute.", identifier };
    }
    throw error;
  }

  redirect(safeRedirect(formData.get("next")));
}

export async function logout() {
  await clearSession();
  redirect("/");
}
