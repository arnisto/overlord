import { validateYupSchema, yup } from '@strapi/utils';

export const DISCUSSION_TYPES = ['question', 'discussion'] as const;
export const TITLE_MIN_LENGTH = 10;

/**
 * Règles métier de création d'une discussion, appliquées par Strapi quel que
 * soit le client (le frontend fait les mêmes contrôles pour l'ergonomie
 * seulement). Les champs inconnus — dont `author` — sont ignorés.
 */
const createDiscussionSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Le titre est obligatoire.')
    .min(TITLE_MIN_LENGTH, `Le titre doit contenir au moins ${TITLE_MIN_LENGTH} caractères.`)
    .max(200, 'Le titre ne peut pas dépasser 200 caractères.'),
  content: yup
    .string()
    .trim()
    .required('Le contenu est obligatoire.')
    .max(10000, 'Le contenu ne peut pas dépasser 10 000 caractères.'),
  type: yup
    .string()
    .required('Le type est obligatoire.')
    .oneOf([...DISCUSSION_TYPES], 'Le type doit être « question » ou « discussion ».'),
  category: yup.string().trim().required('La catégorie est obligatoire.'),
});

export type CreateDiscussionInput = {
  title: string;
  content: string;
  type: (typeof DISCUSSION_TYPES)[number];
  category: string;
};

export const validateCreateDiscussion = (body: unknown) =>
  validateYupSchema(createDiscussionSchema, { strict: false, stripUnknown: true })(
    body ?? {},
    'Discussion invalide.'
  ) as Promise<CreateDiscussionInput>;

const bestReplySchema = yup.object({
  reply: yup.string().nullable().defined('La réponse est obligatoire (ou null pour retirer).'),
});

export const validateBestReply = (body: unknown) =>
  validateYupSchema(bestReplySchema, { strict: false, stripUnknown: true })(
    body ?? {},
    'Meilleure réponse invalide.'
  ) as Promise<{ reply: string | null }>;
