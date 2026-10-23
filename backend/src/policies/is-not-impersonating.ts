import { errors } from '@strapi/utils';
import type { PolicyContext } from '../types/policy';

/**
 * Refuse explicitement toute tentative de publier au nom d'un autre membre :
 * l'auteur est toujours l'utilisateur authentifié (fixé par le controller),
 * un champ `author` désignant quelqu'un d'autre est donc une usurpation.
 *
 * PolicyError (sous-classe de ForbiddenError) est la seule erreur 403 dont
 * Strapi conserve le message dans la réponse HTTP.
 */
const isNotImpersonating = (policyContext: PolicyContext) => {
  const user = policyContext.state.user;
  const body = policyContext.request.body as { data?: Record<string, unknown> } | undefined;
  const author = body?.data?.author;

  if (author === undefined || author === null) return true;

  const authorRef = typeof author === 'object' ? (author as Record<string, unknown>) : { id: author };
  const isSelf =
    String(authorRef.id) === String(user?.id) || authorRef.documentId === user?.documentId;

  if (!isSelf) {
    throw new errors.PolicyError('Vous ne pouvez pas publier au nom d’un autre membre.');
  }
  return true;
};

export default isNotImpersonating;
