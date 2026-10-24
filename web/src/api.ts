export type User = {
  user_id: number;
  username: string;
  email: string;
  role: string | null;
};

const base = (import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : 'https://mathoff-api.onrender.com/api'
)).replace(/\/$/, '');

const storageKey = 'mathoff-web-session';

export type Session = { user: User; access: string; refresh: string };

export function readSession(): Session | null {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as Session : null;
  } catch { return null; }
}

export function saveSession(session: Session | null) {
  if (session) localStorage.setItem(storageKey, JSON.stringify(session));
  else localStorage.removeItem(storageKey);
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const detail = data?.detail || data?.error || (data && JSON.stringify(data)) || `Error ${response.status}`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return data;
}

export async function login(username: string, password: string): Promise<Session> {
  const response = await fetch(`${base}/token/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseResponse(response);
  const session = {
    access: data.access, refresh: data.refresh,
    user: { user_id: data.user_id, username: data.username, email: data.email, role: data.role },
  };
  saveSession(session);
  return session;
}

export async function register(username: string, email: string, password: string) {
  return parseResponse(await fetch(`${base}/register/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  }));
}

export async function api(path: string, options: RequestInit = {}) {
  const send = (token: string | undefined) => fetch(`${base}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let session = readSession();
  let response = await send(session?.access);
  if (response.status === 401 && session?.refresh) {
    const refreshResponse = await fetch(`${base}/token/refresh/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refresh }),
    });
    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      session = { ...session, access: data.access };
      saveSession(session);
      response = await send(session.access);
    } else {
      saveSession(null);
      window.dispatchEvent(new Event('mathoff-session-expired'));
    }
  }
  return parseResponse(response);
}
