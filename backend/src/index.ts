import type { Core } from '@strapi/strapi';
import { syncPermissions } from './bootstrap/permissions';
import { seedDemoData } from './seed';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncPermissions(strapi);

    if (process.env.SEED_DEMO !== 'false') {
      await seedDemoData(strapi);
    }
  },
};
