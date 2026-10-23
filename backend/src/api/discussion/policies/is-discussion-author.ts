import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import type { PolicyContext } from '../../../types/policy';

/** Seul l'auteur de la discussion peut choisir la meilleure réponse. */
const isDiscussionAuthor = async (
  policyContext: PolicyContext,
  _config: unknown,
  { strapi }: { strapi: Core.Strapi }
) => {
  const discussion = await strapi.documents('api::discussion.discussion').findOne({
    documentId: policyContext.params.id,
    fields: ['documentId'],
    populate: { author: { fields: ['id'] } },
  });

  if (!discussion) {
    throw new errors.NotFoundError('Discussion introuvable.');
  }
  if (discussion.author?.id !== policyContext.state.user?.id) {
    throw new errors.PolicyError('Seul l’auteur de la discussion peut choisir la meilleure réponse.');
  }
  return true;
};

export default isDiscussionAuthor;
