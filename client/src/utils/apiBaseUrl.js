import { Capacitor } from '@capacitor/core';
import { getStoredToken } from './authenticatedFetch.js';

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Native app check or explicit configured base URL
const isCapacitorApp = () => Capacitor.isNativePlatform() || window.location.origin.includes('localhost') || window.location.protocol === 'file:';

/**
 * Resolves app API paths against a public backend when configured.
 */
export const resolveApiUrl = (input) => {
  if (!configuredApiBaseUrl) return input;

  if (typeof input === 'string') {
    if (input.startsWith('/api/')) return `${configuredApiBaseUrl}${input}`;
    if (input.startsWith('api/')) return `${configuredApiBaseUrl}/${input}`;
    return input;
  }

  if (input && typeof input === 'object' && typeof input.url === 'string') {
    if (input.url.startsWith('/api/')) return `${configuredApiBaseUrl}${input.url}`;
    if (input.url.startsWith('api/')) return `${configuredApiBaseUrl}/${input.url}`;
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

