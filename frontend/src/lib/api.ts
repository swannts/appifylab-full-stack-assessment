export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

import {User} from '@/types';

export const getAccessToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
export const getRefreshToken = () => typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthData = (accessToken: string, refreshToken: string, user: User) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Logout failed');
  }
}

export async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const accessToken = getAccessToken();
  
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/register') {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access_token);
          
          headers.set('Authorization', `Bearer ${data.access_token}`);
          const retryResponse = await fetch(`${API_URL}${path}`, {
            ...options,
            headers,
          });

          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
      }
    }

    // Refresh failed or no refresh token -> logout
    clearAuthData();
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
