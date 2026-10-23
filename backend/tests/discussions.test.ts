import { beforeAll, describe, expect, it } from 'vitest';
import { api, firstCategory, login, uniqueTitle } from './helpers';

let category: { documentId: string; slug: string };
let thomas: Awaited<ReturnType<typeof login>>;
let vincent: Awaited<ReturnType<typeof login>>;

const validDiscussion = () => ({
  title: uniqueTitle('Quelle stratégie pour un PEA'),
  content: 'Je débute et je cherche des retours d’expérience.',
  type: 'question',
  category: category.documentId,
});

beforeAll(async () => {
  category = await firstCategory();
  thomas = await login('Thomas_PEA');
  vincent = await login('Vincent_ETF');
});

describe('GET /discussions (affichage)', () => {
  it('renvoie les discussions avec auteur, catégorie, nombre de réponses et pagination', async () => {
    const { status, body } = await api('/discussions?pageSize=5');

    expect(status).toBe(200);
    expect(body.data).toHaveLength(5);
    expect(body.meta.pagination).toMatchObject({ page: 1, pageSize: 5 });
    expect(body.meta.pagination.total).toBeGreaterThanOrEqual(20);

    const [first] = body.data;
    expect(first).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        slug: expect.any(String),
        createdAt: expect.any(String),
        repliesCount: expect.any(Number),
        category: expect.objectContaining({ name: expect.any(String), slug: expect.any(String) }),
      })
    );
    // Seuls les champs publics de l'auteur sont exposés.
    expect(Object.keys(first.author).sort()).toEqual(['documentId', 'id', 'username']);
  });

  it('trie par date de publication, du plus récent au plus ancien par défaut', async () => {
    const desc = (await api('/discussions?pageSize=50')).body.data.map((d: any) => d.createdAt);
    const asc = (await api('/discussions?pageSize=50&sort=createdAt:asc')).body.data.map((d: any) => d.createdAt);

    expect(desc).toEqual([...desc].sort().reverse());
    expect(asc).toEqual([...asc].sort());
  });

  it('filtre par catégorie et par recherche', async () => {
    const byCategory = await api('/discussions?category=immobilier&pageSize=50');
    expect(byCategory.body.data.length).toBeGreaterThan(0);
    expect(byCategory.body.data.every((d: any) => d.category.slug === 'immobilier')).toBe(true);

    const bySearch = await api(`/discussions?q=${encodeURIComponent('PEA')}&pageSize=50`);
    expect(bySearch.body.data.length).toBeGreaterThan(0);
  });

  it('refuse un tri hors liste blanche et une page trop grande', async () => {
    expect((await api('/discussions?sort=title:asc')).status).toBe(400);
    expect((await api('/discussions?pageSize=500')).status).toBe(400);
  });

  it('renvoie 404 pour un slug inconnu', async () => {
    expect((await api('/discussions/slug/discussion-inexistante')).status).toBe(404);
  });
});

describe('POST /discussions (validation)', () => {
  it('refuse un titre de moins de 10 caractères', async () => {
    const { status, body } = await api('/discussions', {
      method: 'POST',
      token: thomas.jwt,
      body: { data: { ...validDiscussion(), title: 'Trop cour' } },
    });

    expect(status).toBe(400);
    expect(body.error.details.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ['title'] })])
    );
  });

  it('ne compte pas les espaces autour du titre', async () => {
    const { status } = await api('/discussions', {
      method: 'POST',
      token: thomas.jwt,
      body: { data: { ...validDiscussion(), title: '   PEA ?          ' } },
    });
    expect(status).toBe(400);
  });

  it('exige le contenu, un type valide et une catégorie existante', async () => {
    const { status, body } = await api('/discussions', {
      method: 'POST',
      token: thomas.jwt,
      body: { data: { ...validDiscussion(), content: '  ', type: 'sondage' } },
    });
    expect(status).toBe(400);
    const paths = body.error.details.errors.map((e: any) => e.path[0]);
    expect(paths).toEqual(expect.arrayContaining(['content', 'type']));

    const unknownCategory = await api('/discussions', {
      method: 'POST',
      token: thomas.jwt,
      body: { data: { ...validDiscussion(), category: 'categorie-inconnue' } },
    });
    expect(unknownCategory.status).toBe(400);
  });

  it('crée la discussion, génère un slug unique et la rend consultable', async () => {
    const input = validDiscussion();
    const first = await api('/discussions', { method: 'POST', token: thomas.jwt, body: { data: input } });
    const second = await api('/discussions', { method: 'POST', token: thomas.jwt, body: { data: input } });

    expect(first.status).toBe(201);
    expect(first.body.data.author.username).toBe('Thomas_PEA');
    expect(second.body.data.slug).toBe(`${first.body.data.slug}-2`);

    const detail = await api(`/discussions/slug/${first.body.data.slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data).toMatchObject({ title: input.title, type: 'question', replies: [] });
  });
});

describe('POST /discussions (autorisations)', () => {
  it('refuse la publication à un visiteur non authentifié', async () => {
    const { status } = await api('/discussions', { method: 'POST', body: { data: validDiscussion() } });
    expect(status).toBe(403);
  });

  it('refuse un jeton invalide', async () => {
    const { status } = await api('/discussions', {
      method: 'POST',
      token: 'jeton-invalide',
      body: { data: validDiscussion() },
    });
    expect(status).toBe(401);
  });

  it('empêche de publier au nom d’un autre membre (id ou documentId)', async () => {
    for (const author of [vincent.user.id, vincent.user.documentId, { id: vincent.user.id }]) {
      const { status, body } = await api('/discussions', {
        method: 'POST',
        token: thomas.jwt,
        body: { data: { ...validDiscussion(), author } },
      });
      expect(status).toBe(403);
      expect(body.error.name).toBe('PolicyError');
    }
  });

  it('enregistre toujours l’utilisateur authentifié comme auteur', async () => {
    const { status, body } = await api('/discussions', {
      method: 'POST',
      token: thomas.jwt,
      body: { data: { ...validDiscussion(), author: thomas.user.id } },
    });
    expect(status).toBe(201);
    expect(body.data.author.id).toBe(thomas.user.id);
  });
});
