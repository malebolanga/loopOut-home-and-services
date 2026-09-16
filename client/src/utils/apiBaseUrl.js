import { Capacitor } from '@capacitor/core';

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
  window.fetch = (input, init) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api/')) {
        return browserFetch(`${configuredApiBaseUrl}${input}`, init);
      }
      if (input.startsWith('api/')) {
        return browserFetch(`${configuredApiBaseUrl}/${input}`, init);
      }
    } else if (input instanceof Request && input.url) {
      try {
        const urlObj = new URL(input.url);
        if (urlObj.pathname.startsWith('/api/')) {
          const newUrl = `${configuredApiBaseUrl}${urlObj.pathname}${urlObj.search}`;
          return browserFetch(new Request(newUrl, input), init);
        }
      } catch (e) {
        // Fallback
      }
    }
    return browserFetch(input, init);
  };
};

export const apiBaseUrlIsConfigured = Boolean(configuredApiBaseUrl);

