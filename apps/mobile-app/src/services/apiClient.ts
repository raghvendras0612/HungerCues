const defaultHost = '192.168.1.22';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${defaultHost}:8000/api/v1`;

const headers = {
  Authorization: 'Bearer mock-token',
  'Content-Type': 'application/json',
};

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
