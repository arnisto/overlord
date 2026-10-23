import { errors } from '@strapi/utils';
import type { PolicyContext } from '../types/policy';

/**
 * Défense en profondeur : les permissions Users & Permissions refusent déjà
 * l'écriture au rôle Public. Cette policy garantit qu'une route d'écriture ne
 * s'exécute jamais sans utilisateur, même si un rôle était mal configuré.
 */
const isAuthenticated = (policyContext: PolicyContext) => {
  if (!policyContext.state.user) {
    throw new errors.UnauthorizedError('Vous devez être connecté pour publier.');
  }
  return true;
};

export default isAuthenticated;
