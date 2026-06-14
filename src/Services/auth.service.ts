const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const TOKEN_KEY = 'mediliv_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw { code: mapErrorCode(res.status, body.message) };
  }

  const { token } = await res.json() as { token: string };
  storeToken(token);
}

export async function signOut(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearToken();
}

function mapErrorCode(status: number, message?: string): string {
  if (message === 'Email not verified') return 'auth/email-not-verified';
  if (status === 401) return 'auth/invalid-credential';
  if (status === 429) return 'auth/too-many-requests';
  if (status === 0 || status >= 500) return 'auth/network-request-failed';
  return 'auth/unknown';
}

export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    case 'auth/network-request-failed':
      return 'Erreur réseau. Vérifiez votre connexion.';
    case 'auth/email-not-verified':
      return "Votre email n'est pas vérifié.";
    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
  }
}
