import "server-only";
import { StrapiError } from "@/lib/strapi/client";
import type { FieldErrors } from "@/lib/validation";

/** Traduit une erreur d'appel à Strapi en message affichable dans un formulaire. */
export function toActionError(error: unknown): { error?: string; fieldErrors?: FieldErrors } {
  if (!(error instanceof StrapiError)) {
    return { error: "Le service est momentanément indisponible. Réessayez dans un instant." };
  }
  if (error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
    return { fieldErrors: error.fieldErrors };
  }
  // 401, ou 403 générique des permissions : jeton absent, expiré ou révoqué.
  // Les 403 métier (PolicyError) portent un message explicite qu'on affiche tel quel.
  if (error.status === 401 || (error.status === 403 && error.message === "Forbidden")) {
    return { error: "Votre session a expiré, reconnectez-vous." };
  }
  return { error: error.message };
}
