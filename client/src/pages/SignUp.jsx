import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import OAuth from '../components/OAuth';
import AuthBrandLogo from '../components/AuthBrandLogo';
import { FaSpinner, FaArrowLeft, FaWifi } from 'react-icons/fa';
import AuthSideIllustration from '../components/AuthSideIllustration';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess, signInFailure } from '../redux/user/userSlice';
import { persistSessionToken, fetchWithRetry } from '../utils/authenticatedFetch';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', phone: '', location: '', offeringType: '', acceptedTerms: false, otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(''); // 'waking' | ''
  const [devCode, setDevCode] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { error: reduxAuthError } = useSelector((state) => state.user);

  useEffect(() => {
    if (location.state?.verify && location.state?.email) {
      setFormData((current) => ({ ...current, email: location.state.email }));
      setStep(3);
    }
  }, [location.state]);

  const change = ({ target }) => setFormData((current) => ({ ...current, [target.id]: target.type === 'checkbox' ? target.checked : target.value }));
  const checkCredentials = (event) => {
    event.preventDefault(); setError('');
    if (!formData.username.trim()) return setError('Please enter a username.');
    if (formData.password.length < 8) return setError('Use a password of at least 8 characters.');
    if (formData.password !== formData.confirmPassword) return setError('Your passwords do not match.');
    setStep(2);
  };
  const signup = async (event) => {
    event.preventDefault(); setError(''); setServerStatus('');
    if (!formData.acceptedTerms) return setError('Please accept the Terms of Service and Privacy Policy.');
    try {
      setLoading(true);
      const { confirmPassword, otp, ...payload } = formData;
      // Show 'waking up' hint after 4 s so user knows what's happening on Render cold-start
      const wakeTimer = setTimeout(() => setServerStatus('waking'), 4000);
      let response;
      try {
        response = await fetchWithRetry(
          '/api/auth/signup',
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) },
          // Render can take up to a minute to wake, and Gmail may retry a
          // transient connection. Keep this request alive instead of aborting a
          // valid sign-up midway through email delivery.
          { maxRetries: 2, timeoutMs: 180000 }
        );
      } finally {
        clearTimeout(wakeTimer);
      }
      setServerStatus('');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create your account.');
      setFormData((current) => ({ ...current, email: current.email.trim().toLowerCase(), otp: '' }));
      if (data.devCode) setDevCode(data.devCode);
      setStep(3);
    } catch (requestError) {
      setServerStatus('');
      const msg = requestError?.message || '';
      if (msg.toLowerCase().includes('abort') || msg.toLowerCase().includes('timeout')) {
        setError('The verification service took too long to respond. Please wait a moment, then try again.');
      } else if (msg.toLowerCase().includes('quic') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
        setError('Connection error — please check your internet and try again.');
      } else if (msg.toLowerCase().includes('verification email') || msg.toLowerCase().includes('email delivery')) {
        setError('We could not send the verification email. Please use “Resend code” in a moment, or contact LoopOut support if it continues.');
      } else {
        setError(msg || 'Unable to create your account.');
      }
    } finally { setLoading(false); }
  };
  const verify = async (event) => {
    event.preventDefault(); setError(''); setServerStatus('');
    try {
      setLoading(true);
      const wakeTimer = setTimeout(() => setServerStatus('waking'), 4000);
      let response;
      try {
        response = await fetchWithRetry(
          '/api/auth/verify-otp',
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: formData.email.trim().toLowerCase(), otp: formData.otp.trim() }) },
          { maxRetries: 3, timeoutMs: 35000 }
        );
      } finally {
        clearTimeout(wakeTimer);
      }
      setServerStatus('');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to verify that code.');
      persistSessionToken(data);
      const signedInUser = data.user || data;
      dispatch(signInSuccess(signedInUser));
      navigate(signedInUser.offeringType === 'services' ? '/verification' : '/');
    } catch (requestError) {
      setServerStatus('');
      setError(requestError?.message || 'Verification failed. Please try again.');
    } finally { setLoading(false); }
  };
  const resend = async () => {
    try {
      setResending(true); setError(''); setServerStatus('');
      const response = await fetchWithRetry(
        '/api/auth/resend-otp',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: formData.email.trim().toLowerCase() }) },
        { maxRetries: 3, timeoutMs: 35000 }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to send a new code.');
      if (data.devCode) setDevCode(data.devCode);
    } catch (requestError) { setError(requestError?.message || 'Could not resend code.'); } finally { setResending(false); }
  };
  return <div className="relative flex min-h-[100dvh] w-full max-w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 px-4 py-8 sm:p-8">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-amber-300/50 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/40 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(49,46,129,0.22)_100%)]" />
    </div>
    <AuthSideIllustration />
    <div className="relative z-10 w-full max-w-[450px] rounded-3xl border border-white/80 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl sm:p-9">
      <Link to="/" aria-label="Back to home" className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
        <FaArrowLeft className="h-3 w-3" /> Home
      </Link>
      <div className="mb-5 flex justify-center"><AuthBrandLogo /></div>
      <div className="mb-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Your local marketplace</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">Find and offer local places, services, food, and goods.</p>
        <Link to="/how-it-works" className="mt-2 inline-flex text-xs font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-900">See how LoopOut works</Link>
      </div>
      {step === 1 && <><h1 className="text-2xl font-semibold text-center mb-2">Create your account</h1><p className="text-center text-slate-500 mb-6">Step 1 of 3 · Set up your sign-in details</p>
        <form onSubmit={checkCredentials} className="space-y-4">
          <label className="block text-sm">Username<input id="username" autoComplete="username" className={`${inputClass} mt-1`} value={formData.username} onChange={change} required /></label>
          <label className="block text-sm">Email address<input id="email" type="email" autoComplete="email" className={`${inputClass} mt-1`} value={formData.email} onChange={change} required /></label>
          <label className="block text-sm">Password<input id="password" type="password" autoComplete="new-password" className={`${inputClass} mt-1`} value={formData.password} onChange={change} required /></label>
          <label className="block text-sm">Confirm password<input id="confirmPassword" type="password" autoComplete="new-password" className={`${inputClass} mt-1`} value={formData.confirmPassword} onChange={change} required /></label>
          <button className="w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] py-3 rounded-xl font-semibold">Continue</button>
        </form></>}
      {step === 2 && <><button onClick={() => setStep(1)} className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-rose-700"><FaArrowLeft /> Back</button><h1 className="text-2xl font-semibold text-center mb-2">Complete your profile</h1><p className="text-center text-slate-500 mb-6">Step 2 of 3 · Choose how you’ll use LoopOut</p>
        <form onSubmit={signup} className="space-y-4"><fieldset><legend className="block text-sm font-medium mb-2">How will you use LoopOut?</legend><div className="grid grid-cols-2 gap-2">{[{ value: 'viewer', label: 'Browse, book & request' }, { value: 'services', label: 'Provide services' }, { value: 'property', label: 'List property' }, { value: 'food', label: 'Open a food shop' }, { value: 'goods', label: 'Sell goods' }].map((option) => <label key={option.value} className={`flex items-center gap-2 rounded-xl border p-3 text-sm cursor-pointer ${formData.offeringType === option.value ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}><input type="radio" name="offeringType" value={option.value} checked={formData.offeringType === option.value} onChange={() => setFormData((current) => ({ ...current, offeringType: option.value }))} required /><span>{option.label}</span></label>)}</div>{formData.offeringType === 'services' && <p className="mt-2 text-xs text-slate-600">After signup, service providers complete an identity review using a government ID or passport and a live selfie.</p>}{formData.offeringType === 'viewer' && <p className="mt-2 text-xs text-slate-600">Choose this to browse, book, and request. You can explore provider options later from Become.</p>}</fieldset><label className="block text-sm">Mobile number<input id="phone" type="tel" autoComplete="tel" className={`${inputClass} mt-1`} value={formData.phone} onChange={change} required /></label><label className="block text-sm">City or area<input id="location" autoComplete="address-level2" className={`${inputClass} mt-1`} value={formData.location} onChange={change} required /></label>
          <label className="flex items-start gap-3 text-sm text-slate-700"><input id="acceptedTerms" type="checkbox" className="mt-1" checked={formData.acceptedTerms} onChange={change} required /><span>I agree to the <Link className="text-rose-700 underline" to="/terms" target="_blank">Terms of Service</Link> and <Link className="text-rose-700 underline" to="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
          <p className="text-xs text-slate-500">LoopOut does not access your contacts during sign-up.</p><button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-[#E61E4D] to-[#D70466] py-3 font-semibold text-white disabled:opacity-60">{loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Send verification code'}</button><div className="relative py-2 text-center before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-slate-200"><span className="relative bg-white px-3 text-sm text-slate-500">or</span></div><OAuth offeringType={formData.offeringType} phone={formData.phone} location={formData.location} acceptedTerms={formData.acceptedTerms} /></form></>}
      {step === 3 && <><button onClick={() => setStep(2)} className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-rose-700"><FaArrowLeft /> Back</button><h1 className="text-2xl font-semibold text-center mb-2">Verify your email</h1><p className="text-center text-slate-500 mb-6">Step 3 of 3 · Enter the six-digit code sent to {formData.email}.</p>
        {devCode && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-center text-xs text-amber-800">
            <span>Dev Mode Code: <strong className="font-mono text-sm tracking-widest text-amber-950">{devCode}</strong></span>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, otp: devCode }))}
              className="ml-2 font-semibold text-amber-800 underline hover:text-amber-950"
            >
              (Auto-fill)
            </button>
          </div>
        )}
        <form onSubmit={verify} className="space-y-4"><label className="block text-sm">Verification code<input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" className={`${inputClass} mt-1 tracking-[0.4em] text-center`} value={formData.otp} onChange={({ target }) => setFormData((current) => ({ ...current, otp: target.value.replace(/\D/g, '') }))} required /></label><button disabled={loading} className="w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] py-3 rounded-xl font-semibold disabled:opacity-60">{loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Verify and continue'}</button></form><button type="button" disabled={resending} onClick={resend} className="w-full mt-4 text-sm underline disabled:opacity-60">{resending ? 'Sending…' : 'Resend code'}</button></>}
      {serverStatus === 'waking' && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          <FaWifi className="animate-pulse text-amber-600" />
          <span>Server is waking up — this may take up to 30 seconds on first use…</span>
        </div>
      )}
      {(error || reduxAuthError) && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">{error || reduxAuthError}</p>}
      <p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link to="/sign-in" className="font-semibold text-rose-700 underline">Sign in</Link></p>
    </div></div>;
}

