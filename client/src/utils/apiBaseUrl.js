const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/**
 * Resolves app API paths against a public backend when the web app runs in a
 * Capacitor shell. In a browser, an empty base keeps Vite's /api proxy and
 * same-origin production deployments working exactly as before.
 */
export const resolveApiUrl = (input) => {
  if (typeof input !== 'string' || !input.startsWith('/api/')) return input;
  return configuredApiBaseUrl ? `${configuredApiBaseUrl}${input}` : input;
};

export const installApiBaseUrl = () => {
  if (!configuredApiBaseUrl || typeof window === 'undefined') return;

  const browserFetch = window.fetch.bind(window);
  window.fetch = (input, init) => browserFetch(resolveApiUrl(input), init);
};

export const apiBaseUrlIsConfigured = Boolean(configuredApiBaseUrl);
