const getStoredToken = () => {
  if (typeof window === 'undefined') return '';

  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
  return token && token !== 'null' && token !== 'undefined' ? token : '';
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
