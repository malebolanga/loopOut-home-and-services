const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Capacitor serves an installed Android app from https://localhost. A normal
// browser must keep relative /api paths so the API and UI can share the same
// local development origin.
const isCapacitorApp = () =>
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  window.location.hostname === 'localhost';

/**
 * Resolves app API paths against a public backend when the web app runs in a
 * Capacitor shell. In a browser, an empty base keeps Vite's /api proxy and
 * same-origin production deployments working exactly as before.
 */
export const resolveApiUrl = (input) => {
  if (typeof input !== 'string' || !input.startsWith('/api/')) return input;
  return configuredApiBaseUrl && isCapacitorApp() ? `${configuredApiBaseUrl}${input}` : input;
};

export const installApiBaseUrl = () => {
  if (!configuredApiBaseUrl || !isCapacitorApp()) return;

  const browserFetch = window.fetch.bind(window);
  window.fetch = (input, init) => browserFetch(resolveApiUrl(input), init);
};

export const apiBaseUrlIsConfigured = Boolean(configuredApiBaseUrl);
