import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { uniqueDiscussionSlug } from '../../../utils/slug';
import type { CreateDiscussionInput } from '../validation';
import type { ListQuery } from '../list-query';

const UID = 'api::discussion.discussion';

/*
 * Projections publiques. Les relations vers l'utilisateur ne renvoient que
 * l'identifiant et le pseudo : jamais l'e-mail ni les champs privés.
 */
const AUTHOR: { fields: ['username'] } = { fields: ['username'] };
const CATEGORY: { fields: ['name', 'slug', 'color'] } = { fields: ['name', 'slug', 'color'] };

type Viewer = { id: number } | null | undefined;

type PublicAuthor = { id: number; documentId: string; username: string } | null;

const toAuthor = (author?: { id: number; documentId: string; username: string } | null): PublicAuthor =>
  author ? { id: author.id, documentId: author.documentId, username: author.username } : null;

const voteKey = (userId: number, replyDocumentId: string) => `${userId}:${replyDocumentId}`;

export default factories.createCoreService(UID, ({ strapi }) => ({
  /**
   * Liste paginée pour l'accueil. Une seule requête pour les discussions et
   * leurs relations (auteur, catégorie, nombre de réponses via `count`), plus
   * une requête de comptage pour la pagination.
   */
  async findPublicList(query: ListQuery) {
    const filters: Record<string, unknown> = {};
    if (query.category) filters.category = { slug: { $eq: query.category } };
    if (query.q) {
      filters.$or = [{ title: { $containsi: query.q } }, { content: { $containsi: query.q } }];
    }

    const [discussions, total] = await Promise.all([
      strapi.documents(UID).findMany({
        filters,
        sort: query.sort,
        start: (query.page - 1) * query.pageSize,
        limit: query.pageSize,
        fields: ['title', 'slug', 'type', 'content', 'createdAt'],
        populate: {
          author: AUTHOR,
          category: CATEGORY,
          bestReply: { fields: ['documentId'] },
          replies: { count: true },
        },
      }),
      strapi.documents(UID).count({ filters }),
    ]);

    return {
      results: discussions.map((d: any) => ({
        documentId: d.documentId,
        title: d.title,
        slug: d.slug,
        type: d.type,
        excerpt: d.content.length > 220 ? `${d.content.slice(0, 220).trimEnd()}…` : d.content,
        createdAt: d.createdAt,
        author: toAuthor(d.author),
        category: d.category,
        repliesCount: d.replies?.count ?? 0,
        hasBestReply: Boolean(d.bestReply),
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        pageCount: Math.ceil(total / query.pageSize),
        total,
      },
    };
  },

  /** Détail d'une discussion avec ses réponses, triées de la plus ancienne à la plus récente. */
  async findPublicBySlug(slug: string, viewer: Viewer) {
    const discussion: any = await strapi.documents(UID).findFirst({
      filters: { slug: { $eq: slug } },
      fields: ['title', 'slug', 'type', 'content', 'createdAt'],
      populate: {
        author: AUTHOR,
        category: CATEGORY,
        bestReply: { fields: ['documentId'] },
        replies: {
          fields: ['content', 'createdAt'],
          sort: ['createdAt:asc'],
          populate: { author: AUTHOR, votes: { count: true } },
        },
      },
    });

    if (!discussion) {
      throw new errors.NotFoundError('Discussion introuvable.');
    }

    const replies: any[] = discussion.replies ?? [];
    const votedReplyIds = new Set<string>();

    if (viewer && replies.length > 0) {
      const keys = replies.map((r) => voteKey(viewer.id, r.documentId));
      const votes = await strapi.documents('api::vote.vote').findMany({
        filters: { key: { $in: keys } },
        fields: ['key'],
      });
      votes.forEach((v: any) => votedReplyIds.add(v.key.split(':')[1]));
    }

    return {
      documentId: discussion.documentId,
      title: discussion.title,
      slug: discussion.slug,
      type: discussion.type,
      content: discussion.content,
      createdAt: discussion.createdAt,
      author: toAuthor(discussion.author),
      category: discussion.category,
      bestReplyId: discussion.bestReply?.documentId ?? null,
      replies: replies.map((r) => ({
        documentId: r.documentId,
        content: r.content,
        createdAt: r.createdAt,
        author: toAuthor(r.author),
        helpfulCount: r.votes?.count ?? 0,
        viewerHasVoted: votedReplyIds.has(r.documentId),
      })),
    };
  },

  /** Création : l'auteur est toujours l'utilisateur authentifié, jamais une valeur du corps. */
  async createForUser(user: { documentId: string }, input: CreateDiscussionInput) {
    const category = await strapi.documents('api::category.category').findOne({
      documentId: input.category,
      fields: ['documentId'],
    });

    if (!category) {
      throw new errors.ValidationError('Discussion invalide.', {
        errors: [{ path: ['category'], message: 'Cette catégorie n’existe pas.', name: 'ValidationError' }],
      });
    }

    const created = await strapi.documents(UID).create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        slug: await uniqueDiscussionSlug(strapi, input.title),
        category: category.documentId,
        author: user.documentId,
      },
      fields: ['title', 'slug', 'type', 'content', 'createdAt'],
      populate: { author: AUTHOR, category: CATEGORY },
    });

    return { ...created, author: toAuthor((created as any).author) };
  },

  /** Définit (ou retire avec `null`) la meilleure réponse. L'autorisation est vérifiée par policy. */
  async setBestReply(discussionDocumentId: string, replyDocumentId: string | null) {
    if (replyDocumentId) {
      const reply = await strapi.documents('api::reply.reply').findFirst({
        filters: {
          documentId: { $eq: replyDocumentId },
          discussion: { documentId: { $eq: discussionDocumentId } },
        },
        fields: ['documentId'],
      });
      if (!reply) {
        throw new errors.ValidationError('Cette réponse n’appartient pas à la discussion.', {
          errors: [{ path: ['reply'], message: 'Cette réponse n’appartient pas à la discussion.', name: 'ValidationError' }],
        });
      }
    }

    await strapi.documents(UID).update({
      documentId: discussionDocumentId,
      data: { bestReply: replyDocumentId },
    });

    return { bestReplyId: replyDocumentId };
  },
}));
