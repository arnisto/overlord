import type { Core } from '@strapi/strapi';
import demoData from './demo-data.json';
import { slugify } from '../utils/slug';

type DemoDiscussion = (typeof demoData.discussions)[number];

const HOUR = 60 * 60 * 1000;

/**
 * Jeu de données de démonstration repris de la maquette : 11 catégories,
 * 18 membres, 20 discussions avec réponses, votes « Utile » et meilleures
 * réponses. Ne s'exécute que sur une base vide (idempotent).
 */
export const seedDemoData = async (strapi: Core.Strapi) => {
  const alreadySeeded = await strapi.documents('api::category.category').count({});
  if (alreadySeeded > 0) return;

  strapi.log.info('[seed] Base vide : création des données de démonstration…');
  const password = process.env.DEMO_USER_PASSWORD || 'Demo1234!';
  const now = Date.now();

  const categories = new Map<string, string>();
  for (const [position, c] of demoData.categories.entries()) {
    const created = await strapi.documents('api::category.category').create({
      data: { name: c.name, slug: c.slug, description: c.description, color: c.color, position },
    });
    categories.set(c.slug, created.documentId);
  }

  const authenticated = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });

  const users = new Map<string, { id: number; documentId: string }>();
  for (const { username } of demoData.users) {
    const user = await strapi.plugin('users-permissions').service('user').add({
      username,
      email: `${slugify(username)}@example.com`,
      password,
      provider: 'local',
      confirmed: true,
      blocked: false,
      role: authenticated.id,
    });
    users.set(username, { id: user.id, documentId: user.documentId });
  }

  for (const d of demoData.discussions) {
    await seedDiscussion(strapi, d, { categories, users, now });
  }

  strapi.log.info(
    `[seed] ${categories.size} catégories, ${users.size} membres, ${demoData.discussions.length} discussions créés (mot de passe : DEMO_USER_PASSWORD).`
  );
};

const seedDiscussion = async (
  strapi: Core.Strapi,
  d: DemoDiscussion,
  ctx: {
    categories: Map<string, string>;
    users: Map<string, { id: number; documentId: string }>;
    now: number;
  }
) => {
  const discussion = await strapi.documents('api::discussion.discussion').create({
    data: {
      title: d.title,
      slug: slugify(d.title),
      content: d.content,
      type: d.type as 'question' | 'discussion',
      category: ctx.categories.get(d.category),
      author: ctx.users.get(d.author)!.documentId,
    },
  });
  const startedAt = ctx.now - d.hoursAgo * HOUR;
  await backdate(strapi, 'api::discussion.discussion', discussion.id, startedAt);

  const voters = [...ctx.users.entries()];
  const replyIds: string[] = [];

  for (const [index, r] of d.replies.entries()) {
    const author = ctx.users.get(r.author)!;
    const reply = await strapi.documents('api::reply.reply').create({
      data: { content: r.content, discussion: discussion.documentId, author: author.documentId },
    });
    replyIds.push(reply.documentId);
    // Réponses réparties entre l'ouverture de la discussion et maintenant.
    const repliedAt = startedAt + ((ctx.now - startedAt) * (index + 1)) / (d.replies.length + 1);
    await backdate(strapi, 'api::reply.reply', reply.id, repliedAt);

    // Quelques votes « Utile », proportionnels aux « likes » de la maquette.
    const voteCount = Math.min(Math.ceil(r.likes / 5), voters.length - 1);
    const others = voters.filter(([username]) => username !== r.author).slice(0, voteCount);
    for (const [, voter] of others) {
      await strapi.documents('api::vote.vote').create({
        data: { key: `${voter.id}:${reply.documentId}`, user: voter.documentId, reply: reply.documentId },
      });
    }
  }

  if (d.bestReply !== null && replyIds[d.bestReply]) {
    await strapi.documents('api::discussion.discussion').update({
      documentId: discussion.documentId,
      data: { bestReply: replyIds[d.bestReply] },
    });
  }
};

/** Le Document Service fixe createdAt à « maintenant » : on antidate via la couche base. */
const backdate = async (
  strapi: Core.Strapi,
  uid: 'api::discussion.discussion' | 'api::reply.reply',
  id: number | string,
  timestamp: number
) => {
  const date = new Date(timestamp);
  await strapi.db.query(uid).update({ where: { id }, data: { createdAt: date, updatedAt: date } });
};
