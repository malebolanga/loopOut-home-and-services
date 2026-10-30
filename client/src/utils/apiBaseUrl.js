import { Capacitor } from '@capacitor/core';
import { getStoredToken } from './authenticatedFetch.js';

const isLocalBrowser = typeof window !== 'undefined'
  && !Capacitor.isNativePlatform()
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);
// Local web development should use Vite's /api and /uploads proxies so the
// frontend reads the same local backend code being edited. Native builds keep
// using the configured remote API URL.
const configuredApiBaseUrl = isLocalBrowser
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Native app check or explicit configured base URL
const isCapacitorApp = () => Capacitor.isNativePlatform() || window.location.origin.includes('localhost') || window.location.protocol === 'file:';

/**
 * Resolves API and uploaded-file paths against the configured backend.
 */
export const resolveApiUrl = (input) => {
  if (!configuredApiBaseUrl) return input;

  if (typeof input === 'string') {
    if (input.startsWith('/api/') || input.startsWith('/uploads/')) return `${configuredApiBaseUrl}${input}`;
    if (input.startsWith('api/') || input.startsWith('uploads/')) return `${configuredApiBaseUrl}/${input}`;
    return input;
  }

  if (input && typeof input === 'object' && typeof input.url === 'string') {
    if (input.url.startsWith('/api/') || input.url.startsWith('/uploads/')) return `${configuredApiBaseUrl}${input.url}`;
    if (input.url.startsWith('api/') || input.url.startsWith('uploads/')) return `${configuredApiBaseUrl}/${input.url}`;
  }

  return input;
};

export const installApiBaseUrl = () => {
  if (!configuredApiBaseUrl) return;

  const browserFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const isApiRequest =
      (typeof input === 'string' && (input.startsWith('/api/') || input.startsWith('api/'))) ||
      (input instanceof Request && input.url && new URL(input.url, window.location.origin).pathname.startsWith('/api/'));

    if (isApiRequest) {
      const token = getStoredToken();
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : {}));
      const auth = headers.get('Authorization');
      if (auth && (auth.includes('undefined') || auth.includes('null') || auth.trim() === 'Bearer')) {
        headers.delete('Authorization');
      }
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const mergedInit = {
        credentials: init?.credentials || 'include',
        ...init,
        headers,
      };

      if (typeof input === 'string') {
        if (input.startsWith('/api/')) {
          return browserFetch(`${configuredApiBaseUrl}${input}`, mergedInit);
        }
        if (input.startsWith('api/')) {
          return browserFetch(`${configuredApiBaseUrl}/${input}`, mergedInit);
        }
      } else if (input instanceof Request && input.url) {
        try {
          const urlObj = new URL(input.url, window.location.origin);
          if (urlObj.pathname.startsWith('/api/')) {
            const newUrl = `${configuredApiBaseUrl}${urlObj.pathname}${urlObj.search}`;
            return browserFetch(new Request(newUrl, { ...input, ...mergedInit }), mergedInit);
          }
        } catch (e) {
          // Fallback
        }
      }
      return browserFetch(input, mergedInit);
    }

    return browserFetch(input, init);
  };
};

export const apiBaseUrlIsConfigured = Boolean(configuredApiBaseUrl);

