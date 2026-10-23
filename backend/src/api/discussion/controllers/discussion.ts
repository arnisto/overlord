import { factories } from '@strapi/strapi';
import { validateBestReply, validateCreateDiscussion } from '../validation';
import { validateListQuery } from '../list-query';

const UID = 'api::discussion.discussion';

/*
 * Les controllers restent fins : ils valident l'entrée HTTP, lisent
 * l'utilisateur authentifié et délèguent au service (Document Service API).
 */
export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    const query = await validateListQuery(ctx.query);
    const { results, pagination } = await strapi.service(UID).findPublicList(query);
    ctx.body = { data: results, meta: { pagination } };
  },

  async findBySlug(ctx) {
    const discussion = await strapi
      .service(UID)
      .findPublicBySlug(ctx.params.slug, ctx.state.user);
    ctx.body = { data: discussion };
  },

  async create(ctx) {
    const input = await validateCreateDiscussion(ctx.request.body?.data);
    const discussion = await strapi.service(UID).createForUser(ctx.state.user, input);
    ctx.status = 201;
    ctx.body = { data: discussion };
  },

  async setBestReply(ctx) {
    const { reply } = await validateBestReply(ctx.request.body?.data);
    const result = await strapi.service(UID).setBestReply(ctx.params.id, reply);
    ctx.body = { data: result };
  },
}));
