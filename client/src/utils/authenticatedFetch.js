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
