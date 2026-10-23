export const API_URL = `http://localhost:${process.env.TEST_PORT ?? '1338'}/api`;
export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Demo1234!';

type RequestOptions = { method?: string; token?: string; body?: unknown };

export const api = async (path: string, { method = 'GET', token, body }: RequestOptions = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await response.json().catch(() => null);
  return { status: response.status, body: json };
};

export const login = async (username: string) => {
  const { status, body } = await api('/auth/local', {
    method: 'POST',
    body: { identifier: username, password: DEMO_PASSWORD },
  });
  if (status !== 200) throw new Error(`Connexion impossible pour ${username} (${status})`);
  return body as { jwt: string; user: { id: number; documentId: string; username: string } };
};

export const firstCategory = async () => {
  const { body } = await api('/categories?sort=position:asc');
  return body.data[0] as { documentId: string; slug: string };
};

/** Titre unique pour que les tests restent indépendants d'une exécution à l'autre. */
export const uniqueTitle = (label: string) => `${label} ${Date.now()}-${Math.round(Math.random() * 1e6)}`;
