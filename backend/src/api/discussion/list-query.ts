import { validateYupSchema, yup } from '@strapi/utils';

export const SORTS = ['createdAt:desc', 'createdAt:asc'] as const;
export const MAX_PAGE_SIZE = 50;

/**
 * Paramètres acceptés par la liste des discussions. Tout est borné côté
 * serveur : tri sur liste blanche, taille de page plafonnée.
 */
const listQuerySchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  sort: yup.string().oneOf([...SORTS]).default('createdAt:desc'),
  category: yup.string().trim().max(100),
  q: yup.string().trim().max(100),
});

export type ListQuery = {
  page: number;
  pageSize: number;
  sort: (typeof SORTS)[number];
  category?: string;
  q?: string;
};

export const validateListQuery = (query: unknown) =>
  validateYupSchema(listQuerySchema, { strict: false, stripUnknown: true })(
    query ?? {},
    'Paramètres de liste invalides.'
  ) as Promise<ListQuery>;
