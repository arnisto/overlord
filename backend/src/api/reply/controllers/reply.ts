import { factories } from '@strapi/strapi';
import { validateCreateReply } from '../validation';

const UID = 'api::reply.reply';

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const input = await validateCreateReply(ctx.request.body?.data);
    const reply = await strapi.service(UID).createForUser(ctx.state.user, input);
    ctx.status = 201;
    ctx.body = { data: reply };
  },

  async vote(ctx) {
    const result = await strapi.service(UID).toggleVote(ctx.state.user, ctx.params.id);
    ctx.body = { data: result };
  },
}));
