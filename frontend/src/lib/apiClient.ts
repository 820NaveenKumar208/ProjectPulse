import { ApiError } from './api';
import { readStoredSession } from './authStorage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

/**
 * A wrapper around fetch that automatically retrieves the access token
 * from the stored session in localStorage and returns the full JSON response.
 */
export async function fetchWithAuth<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const session = readStoredSession();
  const accessToken = session?.accessToken;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { code?: string; message?: string };
    };
    throw new ApiError(
      response.status,
      body.error?.code ?? 'REQUEST_FAILED',
      body.error?.message ?? 'Request failed.',
    );
  }

  if (response.status === 204) {
    return undefined as any;
  }

  return response.json() as Promise<T>;
}
