import { beforeAll, describe, expect, it } from 'vitest';
import { api, firstCategory, login, uniqueTitle } from './helpers';

let thomas: Awaited<ReturnType<typeof login>>;
let vincent: Awaited<ReturnType<typeof login>>;
let discussion: { documentId: string; slug: string };

const createDiscussion = async (token: string) => {
  const category = await firstCategory();
  const { body } = await api('/discussions', {
    method: 'POST',
    token,
    body: {
      data: { title: uniqueTitle('Fonds euros ou ETF'), content: 'Vos avis ?', type: 'discussion', category: category.documentId },
    },
  });
  return body.data as { documentId: string; slug: string };
};

const reply = (token: string, discussionId: string, content = 'Ma réponse détaillée.') =>
  api('/replies', { method: 'POST', token, body: { data: { content, discussion: discussionId } } });

beforeAll(async () => {
  thomas = await login('Thomas_PEA');
  vincent = await login('Vincent_ETF');
  discussion = await createDiscussion(thomas.jwt);
});

describe('POST /replies', () => {
  it('publie une réponse rattachée à la discussion et à son auteur', async () => {
    const { status, body } = await reply(vincent.jwt, discussion.documentId);
    expect(status).toBe(201);
    expect(body.data.author.username).toBe('Vincent_ETF');

    const detail = await api(`/discussions/slug/${discussion.slug}`);
    expect(detail.body.data.replies.map((r: any) => r.documentId)).toContain(body.data.documentId);

    const list = await api(`/discussions?q=${encodeURIComponent(discussion.slug.split('-').slice(-1)[0])}`);
    expect(list.body.data[0].repliesCount).toBe(1);
  });

  it('refuse une réponse vide, anonyme ou au nom d’un autre membre', async () => {
    expect((await reply(vincent.jwt, discussion.documentId, '   ')).status).toBe(400);
    expect((await api('/replies', { method: 'POST', body: { data: { content: 'Bonjour', discussion: discussion.documentId } } })).status).toBe(403);

    const spoof = await api('/replies', {
      method: 'POST',
      token: vincent.jwt,
      body: { data: { content: 'Bonjour', discussion: discussion.documentId, author: thomas.user.id } },
    });
    expect(spoof.status).toBe(403);
  });

  it('renvoie 404 pour une discussion inconnue', async () => {
    expect((await reply(vincent.jwt, 'discussion-inconnue')).status).toBe(404);
  });
});

describe('Votes « Utile » et meilleure réponse', () => {
  it('ajoute puis retire le vote, une seule fois par membre', async () => {
    const { body: created } = await reply(vincent.jwt, discussion.documentId);
    const replyId = created.data.documentId;

    const voted = await api(`/replies/${replyId}/vote`, { method: 'POST', token: thomas.jwt });
    expect(voted.body.data).toEqual({ voted: true, helpfulCount: 1 });

    const detail = await api(`/discussions/slug/${discussion.slug}`, { token: thomas.jwt });
    expect(detail.body.data.replies.find((r: any) => r.documentId === replyId)).toMatchObject({
      helpfulCount: 1,
      viewerHasVoted: true,
    });

    const unvoted = await api(`/replies/${replyId}/vote`, { method: 'POST', token: thomas.jwt });
    expect(unvoted.body.data).toEqual({ voted: false, helpfulCount: 0 });
  });

  it('interdit de voter pour sa propre réponse', async () => {
    const { body: created } = await reply(vincent.jwt, discussion.documentId);
    const { status } = await api(`/replies/${created.data.documentId}/vote`, { method: 'POST', token: vincent.jwt });
    expect(status).toBe(403);
  });

  it('réserve le choix de la meilleure réponse à l’auteur de la discussion', async () => {
    const { body: created } = await reply(vincent.jwt, discussion.documentId);
    const path = `/discussions/${discussion.documentId}/best-reply`;
    const data = { reply: created.data.documentId };

    expect((await api(path, { method: 'PUT', token: vincent.jwt, body: { data } })).status).toBe(403);
    expect((await api(path, { method: 'PUT', body: { data } })).status).toBe(403);

    const ok = await api(path, { method: 'PUT', token: thomas.jwt, body: { data } });
    expect(ok.status).toBe(200);
    const detail = await api(`/discussions/slug/${discussion.slug}`);
    expect(detail.body.data.bestReplyId).toBe(created.data.documentId);
  });

  it('refuse une réponse qui appartient à une autre discussion', async () => {
    const other = await createDiscussion(vincent.jwt);
    const { body: foreign } = await reply(thomas.jwt, other.documentId);

    const { status } = await api(`/discussions/${discussion.documentId}/best-reply`, {
      method: 'PUT',
      token: thomas.jwt,
      body: { data: { reply: foreign.data.documentId } },
    });
    expect(status).toBe(400);
  });
});
