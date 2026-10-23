import { createRequire } from 'node:module';
import type { Core } from '@strapi/strapi';

// Strapi est publié en CommonJS : on le charge via require plutôt qu'en ESM.
const { compileStrapi, createStrapi } = createRequire(import.meta.url)('@strapi/strapi');

/**
 * Démarre une vraie instance Strapi sur une base PostgreSQL dédiée
 * (`lerevenu_test`, créée par docker compose) puis l'arrête après les tests.
 * Les tests passent par HTTP, comme le ferait le frontend.
 */
let strapi: Core.Strapi;

export async function setup() {
  process.env.DATABASE_NAME = process.env.TEST_DATABASE_NAME ?? 'lerevenu_test';
  process.env.PORT = process.env.TEST_PORT ?? '1338';
  process.env.SEED_DEMO = 'true';
  process.env.AUTH_RATELIMIT_MAX = '1000';

  const appContext = await compileStrapi();
  strapi = await createStrapi(appContext).load();
  strapi.log.level = 'error';
  await strapi.listen();
}

export async function teardown() {
  await strapi?.destroy();
}
