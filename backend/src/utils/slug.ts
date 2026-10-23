import type { Core } from '@strapi/strapi';

/** "Assurance-vie après 70 ans ?" -> "assurance-vie-apres-70-ans" */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');

/**
 * Slug unique pour une discussion : en cas de collision on suffixe -2, -3…
 * La contrainte d'unicité du champ uid reste le garde-fou final.
 */
export const uniqueDiscussionSlug = async (strapi: Core.Strapi, title: string): Promise<string> => {
  const base = slugify(title) || 'discussion';
  let candidate = base;

  for (let suffix = 2; ; suffix += 1) {
    const existing = await strapi.documents('api::discussion.discussion').findFirst({
      filters: { slug: candidate },
      fields: ['slug'],
    });
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
  }
};
