import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import { getStoredToken } from './authenticatedFetch.js';

const DEFAULT_PRODUCTION_API_URL = 'https://loupeout-home-7rlt.onrender.com';

const cleanUrl = (url) => {
  if (!url) return '';
  return String(url).trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
};

// Determines if code is running inside native mobile shell (Capacitor Android/iOS)
export const isNativePlatform = () => {
  if (typeof window === 'undefined') return false;
  try {
    if (Capacitor.isNativePlatform()) return true;
    if (typeof Capacitor.getPlatform === 'function' && Capacitor.getPlatform() !== 'web') return true;
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return true;
  } catch (e) {}

  // Capacitor Android WebView serves from https://localhost (or capacitor://localhost)
  // while running on an Android/iOS device
  if (typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
  }

  return false;
};

// Computes the active backend API base URL
export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';

  // 1. Native mobile app (Android / iOS): ALWAYS use the remote deployed backend
  if (isNativePlatform()) {
    const envUrl = cleanUrl(import.meta.env.VITE_API_BASE_URL);
    return envUrl || DEFAULT_PRODUCTION_API_URL;
  }

  // 2. Static hosted web (Firebase Hosting / *.web.app / *.firebaseapp.com)
  if (/\.(web\.app|firebaseapp\.com)$/i.test(window.location.hostname)) {
    const envUrl = cleanUrl(import.meta.env.VITE_API_BASE_URL);
    return envUrl || DEFAULT_PRODUCTION_API_URL;
  }

  // 3. Local desktop browser development (running Vite dev server on PC localhost)
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return '';
  }

  // 4. Default for production web / custom environments
  return cleanUrl(import.meta.env.VITE_API_BASE_URL) || '';
};

const configuredApiBaseUrl = getApiBaseUrl();

/**
 * Resolves API and uploaded-file paths against the configured backend.
 */
export const resolveApiUrl = (input) => {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return input;

  if (typeof input === 'string') {
    // If it's already an absolute URL, leave it alone
    if (/^https?:\/\//i.test(input)) return input;
    if (input.startsWith('/api/') || input.startsWith('/uploads/')) return `${baseUrl}${input}`;
    if (input.startsWith('api/') || input.startsWith('uploads/')) return `${baseUrl}/${input}`;
    return input;
  }

  if (input && typeof input === 'object' && typeof input.url === 'string') {
    if (/^https?:\/\//i.test(input.url)) return input.url;
    if (input.url.startsWith('/api/') || input.url.startsWith('/uploads/')) return `${baseUrl}${input.url}`;
    if (input.url.startsWith('api/') || input.url.startsWith('uploads/')) return `${baseUrl}/${input.url}`;
  }

  return input;
};

/**
 * Installs base URL rewriting for BOTH axios and window.fetch
 */
export const installApiBaseUrl = () => {
  const baseUrl = getApiBaseUrl();

  // ── Configure Axios ──────────────────────────────────────────
  if (baseUrl) {
    axios.defaults.baseURL = baseUrl;
  }

  // Global Axios interceptor to ensure all relative /api/ requests
  // get rewritten to the backend URL and carry authentication headers
  axios.interceptors.request.use(
    (config) => {
      const activeBase = getApiBaseUrl();
      if (activeBase && config.url) {
        if (!/^https?:\/\//i.test(config.url)) {
          if (config.url.startsWith('/api/') || config.url.startsWith('/uploads/')) {
            config.url = `${activeBase}${config.url}`;
          } else if (config.url.startsWith('api/') || config.url.startsWith('uploads/')) {
            config.url = `${activeBase}/${config.url}`;
          }
        }
      }

      // Attach token automatically
      const token =
        getStoredToken() ||
        (typeof localStorage !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('access_token')
          : '');

      if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization && !config.headers.authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Configure window.fetch ───────────────────────────────────
  if (baseUrl) {
    const browserFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      const isApiRequest =
        (typeof input === 'string' && (input.startsWith('/api/') || input.startsWith('api/'))) ||
        (input instanceof Request &&
          input.url &&
          new URL(input.url, window.location.origin).pathname.startsWith('/api/'));

      if (isApiRequest) {
        const token =
          getStoredToken() ||
          (typeof localStorage !== 'undefined'
            ? localStorage.getItem('token') || localStorage.getItem('access_token')
            : '');

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
            return browserFetch(`${baseUrl}${input}`, mergedInit);
          }
          if (input.startsWith('api/')) {
            return browserFetch(`${baseUrl}/${input}`, mergedInit);
          }
        } else if (input instanceof Request && input.url) {
          try {
            const urlObj = new URL(input.url, window.location.origin);
            if (urlObj.pathname.startsWith('/api/')) {
              const newUrl = `${baseUrl}${urlObj.pathname}${urlObj.search}`;
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
  }
};

export const apiBaseUrlIsConfigured = Boolean(configuredApiBaseUrl);
