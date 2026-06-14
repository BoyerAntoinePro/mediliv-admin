import { auth } from '../Config/firebase.config';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function adminFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? `Erreur ${response.status}`;
    throw new Error(message);
  }

  return response;
}
