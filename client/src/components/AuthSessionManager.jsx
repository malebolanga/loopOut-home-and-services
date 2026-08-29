import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { signOutUserSuccess } from '../redux/user/userSlice';
import { clearPersistedSessionToken, persistSessionToken, authenticatedFetch } from '../utils/authenticatedFetch';

/**
 * Periodically validates the session in the background
 * to keep the slide-window cookie alive for 1 year.
 */
export default function AuthSessionManager() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentUser) return;

    // Validate every 4 hours
    const interval = setInterval(async () => {
      try {
        const res = await authenticatedFetch('/api/auth/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (!data.valid) {
            // Only sign out if the server explicitly says it's invalid
            // (e.g. user deleted from DB)
            clearPersistedSessionToken();
            dispatch(signOutUserSuccess());
          } else {
            persistSessionToken(data);
          }
        }
      } catch (error) {
        console.error('Background session refresh failed:', error);
      }
    }, 1000 * 60 * 60 * 4); // 4 hours

    return () => clearInterval(interval);
  }, [currentUser?._id, dispatch]);

  return null;
}
