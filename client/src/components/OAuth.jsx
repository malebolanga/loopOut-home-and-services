import { useRef, useState } from 'react';
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

export default function OAuth({ offeringType, phone, location, acceptedTerms }) {
  const { loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSigningIn = useRef(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState('');
  const [roleForm, setRoleForm] = useState({ offeringType: '', phone: '', location: '', acceptedTerms: false });

  const effectiveOfferingType = offeringType ?? roleForm.offeringType;
  const effectivePhone = offeringType !== undefined ? phone : roleForm.phone;
  const effectiveLocation = offeringType !== undefined ? location : roleForm.location;
  const effectiveAcceptedTerms = offeringType !== undefined ? acceptedTerms : roleForm.acceptedTerms;

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
      let idToken = pendingGoogleToken;
      if (!idToken) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const auth = getAuth(app);
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
        idToken = await result.user.getIdToken();
      }

      const res = await fetchWithRetry('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken, ...(effectiveOfferingType ? { offeringType: effectiveOfferingType, phone: effectivePhone, location: effectiveLocation, acceptedTerms: effectiveAcceptedTerms } : {}) }),
      }, { maxRetries: 3, timeoutMs: 30000 });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Server error during Google sign-in');
      if (data.requiresOfferingType) {
        setPendingGoogleToken(idToken);
        dispatch(signInSuccess(null));
        return;
      }

      setPendingGoogleToken('');
      persistSessionToken(data);
      dispatch(signInSuccess(data));
      navigate(data.offeringType === 'services' ? '/verification' : '/');
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
    <div className="w-full space-y-3">
      {pendingGoogleToken && offeringType === undefined && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm">
          <p className="text-sm font-semibold text-gray-900">How will you use LoopOut?</p>
          <div className="grid grid-cols-2 gap-2">{[
            { value: 'viewer', label: 'Browse, book & request' },
            { value: 'services', label: 'Provide services' },
            { value: 'property', label: 'List property' },
            { value: 'food', label: 'Open a food shop' },
            { value: 'goods', label: 'Sell goods' },
          ].map((option) => (
            <label key={option.value} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs text-gray-800 ${roleForm.offeringType === option.value ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}>
              <input type="radio" name="googleOfferingType" value={option.value} checked={roleForm.offeringType === option.value} onChange={() => setRoleForm((current) => ({ ...current, offeringType: option.value }))} />
              <span>{option.label}</span>
            </label>
          ))}</div>
          <input aria-label="Mobile number" type="tel" autoComplete="tel" placeholder="Mobile number" value={roleForm.phone} onChange={(event) => setRoleForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900" />
          <input aria-label="City or area" autoComplete="address-level2" placeholder="City or area" value={roleForm.location} onChange={(event) => setRoleForm((current) => ({ ...current, location: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900" />
          <label className="flex items-start gap-2 text-xs text-gray-700"><input type="checkbox" checked={roleForm.acceptedTerms} onChange={(event) => setRoleForm((current) => ({ ...current, acceptedTerms: event.target.checked }))} /><span>I accept the <a className="underline" href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a className="underline" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleGoogleClick}
        disabled={loading || (pendingGoogleToken ? (!roleForm.offeringType || !roleForm.phone.trim() || !roleForm.location.trim() || !roleForm.acceptedTerms) : (offeringType !== undefined && (!offeringType || !acceptedTerms || !phone?.trim() || !location?.trim())))}
        type='button'
        className='flex items-center justify-center gap-3 w-full bg-white border border-[#DDDDDD] text-[#222222] font-semibold p-3 rounded-lg hover:bg-[#F7F7F7] hover:border-[#000000] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm'
      >
        {loading ? <FaSpinner className="animate-spin text-[#E61E4D]" /> : <FcGoogle className="text-xl" />}
        <span>{loading ? 'Processing...' : pendingGoogleToken ? 'Complete Google sign-up' : 'Continue with Google'}</span>
      </motion.button>
    </div>
  );
}
