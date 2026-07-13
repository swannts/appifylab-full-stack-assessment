export const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiLogout(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout request failed', error);
  }
}

type ApiRequestOptions = RequestInit & {
  skipUnauthorizedRedirect?: boolean;
};

export async function apiRequest(path: string, options: ApiRequestOptions = {}): Promise<any> {
  const { skipUnauthorizedRedirect = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !skipUnauthorizedRedirect) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }

  return await response.json();
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  return apiRequest('/api/upload', {
    method: 'POST',
    body: formData,
  });
}
