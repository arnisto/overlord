import type { Core } from '@strapi/strapi';

/**
 * Le type `Core.PolicyContext` fourni par Strapi n'expose pas `state`,
 * `params` ni `request.body` alors qu'ils sont bien présents à l'exécution.
 */
export type PolicyContext = Core.PolicyContext & {
  state: { user?: { id: number; documentId: string } };
  params: Record<string, string>;
  request: { body?: unknown };
};
