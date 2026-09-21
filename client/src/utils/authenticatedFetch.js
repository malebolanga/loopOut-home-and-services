// ─── Token helpers ────────────────────────────────────────────────────────────

export const getStoredToken = () => {
  if (typeof window === 'undefined') return '';

  let token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
  if (token && token !== 'null' && token !== 'undefined') return token;

  try {
    const persistedRoot = localStorage.getItem('persist:root');
    if (persistedRoot) {
      const rootObj = JSON.parse(persistedRoot);
      if (rootObj.user) {
        const userObj = JSON.parse(rootObj.user);
        const userToken = userObj?.currentUser?.token || userObj?.currentUser?.access_token;
        if (userToken && userToken !== 'null' && userToken !== 'undefined') {
          try {
            localStorage.setItem('access_token', userToken);
            localStorage.setItem('token', userToken);
          } catch (e) {}
          return userToken;
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  return '';
};

export const persistSessionToken = (session) => {
  if (typeof window === 'undefined') return;
  const token = session?.access_token || session?.token;
  if (token) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
  }
};

export const clearPersistedSessionToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
};

// ─── Basic fetch helpers ───────────────────────────────────────────────────────

export const authenticatedFetch = (input, options = {}) => {
  const token = getStoredToken();
  const { headers, ...requestOptions } = options;
  return fetch(input, {
    credentials: 'include',
    ...requestOptions,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// ─── fetchWithRetry ────────────────────────────────────────────────────────────
/**
 * Wraps fetch with:
 *  - A per-attempt AbortController timeout (default 30 s)
 *  - Up to `maxRetries` retries (default 3) on network-level errors
 *    (ERR_QUIC_PROTOCOL_ERROR, ERR_NETWORK_CHANGED, ERR_CONNECTION_RESET, etc.)
 *  - Exponential back-off: 1 s → 2 s → 4 s → 8 s max
 *  - Does NOT retry on 4xx / 5xx HTTP responses (those are real server errors)
 */
const RETRYABLE_MESSAGES = [
  'quic',
  'network',
  'fetch',
  'failed to fetch',
  'networkerror',
  'timeout',
  'connection reset',
  'connection refused',
  'aborted',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const fetchWithRetry = async (
  input,
  options = {},
  { maxRetries = 3, timeoutMs = 35000 } = {}
) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(input, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return response; // Caller handles 4xx/5xx
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      const isAbort = err?.name === 'AbortError';
      const isRetryable =
        isAbort ||
        RETRYABLE_MESSAGES.some((kw) => err?.message?.toLowerCase().includes(kw));

      if (!isRetryable || attempt === maxRetries) throw err;

      const delay = Math.min(1000 * 2 ** attempt, 8000);
      console.warn(
        `[fetchWithRetry] Attempt ${attempt + 1} failed (${err.message}). Retrying in ${delay}ms…`
      );
      await sleep(delay);
    }
  }
  throw lastError;
};

/**
 * Authenticated version of fetchWithRetry — adds Bearer token automatically.
 */
export const authenticatedFetchWithRetry = (input, options = {}, retryConfig = {}) => {
  const token = getStoredToken();
  const { headers, ...requestOptions } = options;
  return fetchWithRetry(
    input,
    {
      credentials: 'include',
      ...requestOptions,
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    retryConfig
  );
};
