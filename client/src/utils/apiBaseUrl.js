import { Capacitor } from '@capacitor/core';

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Only the installed Capacitor app uses the Wi-Fi API address. Browsers keep
// relative /api paths, regardless of whether they are served over HTTP or HTTPS.
const isCapacitorApp = () => Capacitor.isNativePlatform();

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
