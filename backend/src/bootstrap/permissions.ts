import type { Core } from '@strapi/strapi';

/*
 * Permissions Users & Permissions déclarées dans le code : une base neuve est
 * correctement configurée sans passer par l'admin, et la configuration est
 * versionnée et revue comme le reste du code.
 */
const READ_ACTIONS = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::discussion.discussion.find',
  'api::discussion.discussion.findBySlug',
];

const WRITE_ACTIONS = [
  'api::discussion.discussion.create',
  'api::discussion.discussion.setBestReply',
  'api::reply.reply.create',
  'api::reply.reply.vote',
];

const ROLE_ACTIONS: Record<string, string[]> = {
  public: READ_ACTIONS,
  authenticated: [...READ_ACTIONS, ...WRITE_ACTIONS],
};

export const syncPermissions = async (strapi: Core.Strapi) => {
  const allManaged = [...READ_ACTIONS, ...WRITE_ACTIONS];

  for (const [type, actions] of Object.entries(ROLE_ACTIONS)) {
    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type }, populate: ['permissions'] });
    if (!role) continue;

    const current: { id: number; action: string }[] = role.permissions ?? [];

    // Retire les actions gérées ici qui ne doivent pas appartenir à ce rôle
    // (ex. une écriture accordée par erreur au rôle Public depuis l'admin).
    const toRevoke = current.filter((p) => allManaged.includes(p.action) && !actions.includes(p.action));
    for (const permission of toRevoke) {
      await strapi.db.query('plugin::users-permissions.permission').delete({ where: { id: permission.id } });
    }

    const toGrant = actions.filter((action) => !current.some((p) => p.action === action));
    for (const action of toGrant) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: role.id } });
    }
  }
};
