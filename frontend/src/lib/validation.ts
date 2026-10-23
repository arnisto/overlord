/*
 * Contrôles de formulaire côté navigateur, pour un retour immédiat. Ce n'est
 * qu'un confort : Strapi applique les mêmes règles et reste la référence.
 */
export const TITLE_MIN_LENGTH = 10;
export const TITLE_MAX_LENGTH = 200;
export const CONTENT_MAX_LENGTH = 10000;
export const REPLY_MAX_LENGTH = 5000;

export type FieldErrors = Partial<Record<string, string>>;

export type DiscussionFormValues = {
  title: string;
  content: string;
  type: string;
  category: string;
};

export function validateDiscussionForm(values: DiscussionFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const title = values.title.trim();

  if (!title) errors.title = "Le titre est obligatoire.";
  else if (title.length < TITLE_MIN_LENGTH)
    errors.title = `Le titre doit contenir au moins ${TITLE_MIN_LENGTH} caractères.`;
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Le titre ne peut pas dépasser ${TITLE_MAX_LENGTH} caractères.`;

  if (!values.content.trim()) errors.content = "Le contenu est obligatoire.";
  else if (values.content.length > CONTENT_MAX_LENGTH)
    errors.content = "Le contenu ne peut pas dépasser 10 000 caractères.";

  if (values.type !== "question" && values.type !== "discussion")
    errors.type = "Choisissez « question » ou « discussion ».";

  if (!values.category) errors.category = "La catégorie est obligatoire.";

  return errors;
}

export function validateReply(content: string): string | undefined {
  if (!content.trim()) return "La réponse ne peut pas être vide.";
  if (content.length > REPLY_MAX_LENGTH) return "La réponse ne peut pas dépasser 5 000 caractères.";
  return undefined;
}
