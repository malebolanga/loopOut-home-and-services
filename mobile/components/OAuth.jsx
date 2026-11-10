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

  const newGoogleSignup = pendingGoogleToken && offeringType === undefined;
  const googleButtonDisabled = loading || (pendingGoogleToken
    ? (!roleForm.offeringType || !roleForm.phone.trim() || !roleForm.location.trim() || !roleForm.acceptedTerms)
    : (offeringType !== undefined && (!offeringType || !acceptedTerms || !phone?.trim() || !location?.trim())));

  return (
    <>
      {newGoogleSignup ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 sm:p-5">
          <section aria-labelledby="google-signup-title" className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center gap-2 font-semibold text-emerald-800">
              <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-700 text-white">L</span>
              <span>LoopOut</span>
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Create your account · Final step</p>
            <h1 id="google-signup-title" className="text-2xl font-semibold tracking-tight">What would you like to do?</h1>
            <p className="mb-5 mt-2 text-sm text-slate-600">Choose the option that fits you best. You can add more later.</p>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">Choose one to get started</legend>
              <div className="space-y-2">{[{value:"services",label:"Offer a service",description:"Get bookings for work you do, such as cleaning, repairs or tutoring.",icon:"🛠️"},{value:"property",label:"List a property",description:"Advertise a home, room or holiday stay to rent or sell.",icon:"🏡"},{value:"goods",label:"Sell an item",description:"Post individual items like furniture, clothing or electronics.",icon:"📦"},{value:"food",label:"Open a shop",description:"Set up a food shop and show customers what you have available.",icon:"🏪"},{value:"viewer",label:"Browse and make a request",description:"Find a place, service or item. Ask a question, make a request or book.",icon:"🔎"}].map((option) => (
                <label key={option.value} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${roleForm.offeringType === option.value ? 'border-emerald-700 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg">{option.icon}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-semibold text-slate-900">{option.label}</strong>
                    <span className="mt-0.5 block text-sm leading-snug text-slate-600">{option.description}</span>
                  </span>
                  <input className="mt-1 h-4 w-4 shrink-0 accent-emerald-700" type="radio" name="googleOfferingType" value={option.value} checked={roleForm.offeringType === option.value} onChange={() => setRoleForm((current) => ({ ...current, offeringType: option.value }))} required />
                </label>
              ))}</div>
            </fieldset>
            <p className="mb-4 mt-3 text-xs text-slate-500">Not sure? Choose “Browse and make a request” to get started.</p>
            {roleForm.offeringType === 'services' && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Service providers complete an identity review using a government ID or passport and a live selfie.</p>}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Mobile number<input aria-label="Mobile number" type="tel" autoComplete="tel" value={roleForm.phone} onChange={(event) => setRoleForm((current) => ({ ...current, phone: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15" /></label>
              <label className="block text-sm font-medium text-slate-700">City or area<input aria-label="City or area" autoComplete="address-level2" value={roleForm.location} onChange={(event) => setRoleForm((current) => ({ ...current, location: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15" /></label>
              <label className="flex items-start gap-2 text-sm text-slate-700"><input className="mt-1" type="checkbox" checked={roleForm.acceptedTerms} onChange={(event) => setRoleForm((current) => ({ ...current, acceptedTerms: event.target.checked }))} /><span>I accept the <a className="underline" href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a className="underline" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>
              <button type="button" onClick={handleGoogleClick} disabled={googleButtonDisabled} className="w-full rounded-xl bg-gradient-to-r from-[#E61E4D] to-[#D70466] py-3 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <FaSpinner className="mx-auto animate-spin" /> : 'Continue'}
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="w-full space-y-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleClick}
            disabled={googleButtonDisabled}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#DDDDDD] bg-white p-3 font-semibold text-[#222222] shadow-sm transition-all duration-200 hover:border-[#000000] hover:bg-[#F7F7F7] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <FaSpinner className="animate-spin text-[#E61E4D]" /> : <FcGoogle className="text-xl" />}
            <span>{loading ? 'Processing...' : 'Continue with Google'}</span>
          </motion.button>
        </div>
      )}
    </>
  );
}
