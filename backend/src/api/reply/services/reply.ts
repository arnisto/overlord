import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import type { CreateReplyInput } from '../validation';

const UID = 'api::reply.reply';

export default factories.createCoreService(UID, ({ strapi }) => ({
  /** Crée une réponse au nom de l'utilisateur authentifié. */
  async createForUser(user: { documentId: string }, input: CreateReplyInput) {
    const discussion = await strapi.documents('api::discussion.discussion').findOne({
      documentId: input.discussion,
      fields: ['documentId'],
    });
    if (!discussion) {
      throw new errors.NotFoundError('Discussion introuvable.');
    }

    const reply: any = await strapi.documents(UID).create({
      data: { content: input.content, discussion: discussion.documentId, author: user.documentId },
      fields: ['content', 'createdAt'],
      populate: { author: { fields: ['username'] } },
    });

    return {
      documentId: reply.documentId,
      content: reply.content,
      createdAt: reply.createdAt,
      author: { id: reply.author.id, documentId: reply.author.documentId, username: reply.author.username },
      helpfulCount: 0,
      viewerHasVoted: false,
    };
  },

  /**
   * Ajoute ou retire le vote « Utile » de l'utilisateur. Un seul vote par
   * membre et par réponse (clé unique en base), pas de vote sur ses propres
   * messages.
   */
  async toggleVote(user: { id: number; documentId: string }, replyDocumentId: string) {
    const reply: any = await strapi.documents(UID).findOne({
      documentId: replyDocumentId,
      fields: ['documentId'],
      populate: { author: { fields: ['id'] } },
    });
    if (!reply) {
      throw new errors.NotFoundError('Réponse introuvable.');
    }
    if (reply.author?.id === user.id) {
      throw new errors.PolicyError('Vous ne pouvez pas marquer votre propre réponse comme utile.');
    }

    const key = `${user.id}:${replyDocumentId}`;
    const existing = await strapi.documents('api::vote.vote').findFirst({
      filters: { key: { $eq: key } },
      fields: ['documentId'],
    });

    if (existing) {
      await strapi.documents('api::vote.vote').delete({ documentId: existing.documentId });
    } else {
      await strapi.documents('api::vote.vote').create({
        data: { key, user: user.documentId, reply: replyDocumentId },
      });
    }

    const helpfulCount = await strapi.documents('api::vote.vote').count({
      filters: { reply: { documentId: { $eq: replyDocumentId } } },
    });

    return { voted: !existing, helpfulCount };
  },
}));
