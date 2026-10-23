import { factories } from '@strapi/strapi';

/* Les catégories sont en lecture seule côté API publique : endpoints natifs. */
export default factories.createCoreRouter('api::category.category', {
  only: ['find', 'findOne'],
});
