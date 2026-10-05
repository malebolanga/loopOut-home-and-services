import { useRef } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { isNativeApp } from '../utils/nativeApp';
import { persistSessionToken, fetchWithRetry } from '../utils/authenticatedFetch';

export default function OAuth() {
  const { loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSigningIn = useRef(false);

  const handleGoogleClick = async () => {
    if (isSigningIn.current || loading) return;

    if (isNativeApp()) {
      dispatch(signInFailure('Google Sign-In is not supported inside the native app wrapper. Please use email and password sign-in.'));
      return;
    }

    isSigningIn.current = true;
    let timeoutId;
    try {
      dispatch(signInStart());
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const auth = getAuth(app);

      // Protect against popup indefinitely hanging (e.g. unauthorized domain in Firebase or blocked popup)
      const popupPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutErr = new Error('Google Sign-In timed out. If the window was stuck on a loading screen, please ensure this live domain is added under Firebase Console > Authentication > Settings > Authorized domains.');
          timeoutErr.code = 'auth/timeout';
          reject(timeoutErr);
        }, 45000);
      });

      const result = await Promise.race([popupPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      const idToken = await result.user.getIdToken();

      const res = await fetchWithRetry('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      }, { maxRetries: 3, timeoutMs: 30000 });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Server error during Google sign-in');

      persistSessionToken(data);
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Google Auth Error:', error);
      let errorMessage = 'Could not sign in with Google';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many sign-in attempts. Please wait a few minutes and try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled in the Firebase Console. Please enable Google under Authentication > Sign-in method.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed before completion.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google Sign-in. Please add it to Firebase Console > Authentication > Settings > Authorized domains.';
      } else if (error.code === 'auth/timeout') {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      dispatch(signInFailure(errorMessage));
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      isSigningIn.current = false;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleGoogleClick}
      disabled={loading}
      type='button'
      className='flex items-center justify-center gap-3 w-full bg-white border border-[#DDDDDD] text-[#222222] font-semibold p-3 rounded-lg hover:bg-[#F7F7F7] hover:border-[#000000] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm'
    >
      {loading ? (
        <FaSpinner className="animate-spin text-[#E61E4D]" />
      ) : (
        <FcGoogle className="text-xl" />
      )}
      <span>{loading ? 'Processing...' : 'Continue with Google'}</span>
    </motion.button>
  );
}
