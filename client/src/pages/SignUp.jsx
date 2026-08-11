import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';
import BrandLogo from '../components/BrandLogo';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';

const inputClass = 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-white';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', phone: '', location: '', acceptedTerms: false, otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.state?.verify && location.state?.email) {
      setFormData((current) => ({ ...current, email: location.state.email }));
      setStep(3);
    }
  }, [location.state]);

  const change = ({ target }) => setFormData((current) => ({ ...current, [target.id]: target.type === 'checkbox' ? target.checked : target.value }));
  const checkCredentials = (event) => {
    event.preventDefault(); setError('');
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) return setError('Use 3–30 letters, numbers, or underscores for your username.');
    if (formData.password.length < 12 || !/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/\d/.test(formData.password)) return setError('Use at least 12 characters, including uppercase, lowercase, and a number.');
    if (formData.password !== formData.confirmPassword) return setError('Your passwords do not match.');
    setStep(2);
  };
  const signup = async (event) => {
    event.preventDefault(); setError('');
    if (!formData.acceptedTerms) return setError('Please accept the Terms of Service and Privacy Policy.');
    try {
      setLoading(true);
      const { confirmPassword, otp, ...payload } = formData;
      const response = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create your account.');
      setStep(3);
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  const verify = async (event) => {
    event.preventDefault(); setError('');
    try {
      setLoading(true);
      const response = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: formData.email, otp: formData.otp }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to verify that code.');
      dispatch(signInSuccess(data.user || data)); navigate('/');
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  const resend = async () => {
    try {
      setResending(true); setError('');
      const response = await fetch('/api/auth/resend-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to send a new code.');
    } catch (requestError) { setError(requestError.message); } finally { setResending(false); }
  };
  return <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950">
    <div className="w-full max-w-[450px] bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20 text-white">
      <div className="mb-6 flex justify-center"><BrandLogo className="h-12 w-auto" showText textColor="text-white" /></div>
      {step === 1 && <><h1 className="text-2xl font-semibold text-center mb-2">Create your account</h1><p className="text-center text-gray-200 mb-6">Step 1 of 3 · Your sign-in details</p>
        <form onSubmit={checkCredentials} className="space-y-4">
          <label className="block text-sm">Username<input id="username" autoComplete="username" className={`${inputClass} mt-1`} value={formData.username} onChange={change} required /></label>
          <label className="block text-sm">Email address<input id="email" type="email" autoComplete="email" className={`${inputClass} mt-1`} value={formData.email} onChange={change} required /></label>
          <label className="block text-sm">Password<input id="password" type="password" autoComplete="new-password" className={`${inputClass} mt-1`} value={formData.password} onChange={change} required /></label>
          <label className="block text-sm">Confirm password<input id="confirmPassword" type="password" autoComplete="new-password" className={`${inputClass} mt-1`} value={formData.confirmPassword} onChange={change} required /></label>
          <button className="w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] py-3 rounded-xl font-semibold">Continue</button>
          <div className="relative py-2 text-center before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-white/20"><span className="relative px-3 bg-slate-900 text-sm text-gray-200">or</span></div><OAuth />
        </form></>}
      {step === 2 && <><button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-200 mb-4"><FaArrowLeft /> Back</button><h1 className="text-2xl font-semibold text-center mb-2">Complete your profile</h1><p className="text-center text-gray-200 mb-6">Step 2 of 3 · We’ll verify your email next</p>
        <form onSubmit={signup} className="space-y-4"><label className="block text-sm">Mobile number<input id="phone" type="tel" autoComplete="tel" className={`${inputClass} mt-1`} value={formData.phone} onChange={change} required /></label><label className="block text-sm">City or area<input id="location" autoComplete="address-level2" className={`${inputClass} mt-1`} value={formData.location} onChange={change} required /></label>
          <label className="flex items-start gap-3 text-sm text-gray-100"><input id="acceptedTerms" type="checkbox" className="mt-1" checked={formData.acceptedTerms} onChange={change} required /><span>I agree to the <Link className="underline" to="/terms" target="_blank">Terms of Service</Link> and <Link className="underline" to="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
          <p className="text-xs text-gray-300">LoopOut does not access your contacts during sign-up.</p><button disabled={loading} className="w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] py-3 rounded-xl font-semibold disabled:opacity-60">{loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Send verification code'}</button></form></>}
      {step === 3 && <><button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-gray-200 mb-4"><FaArrowLeft /> Back</button><h1 className="text-2xl font-semibold text-center mb-2">Verify your email</h1><p className="text-center text-gray-200 mb-6">Step 3 of 3 · Enter the six-digit code sent to {formData.email}.</p>
        <form onSubmit={verify} className="space-y-4"><label className="block text-sm">Verification code<input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" className={`${inputClass} mt-1 tracking-[0.4em] text-center`} value={formData.otp} onChange={change} required /></label><button disabled={loading} className="w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] py-3 rounded-xl font-semibold disabled:opacity-60">{loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Verify and continue'}</button></form><button disabled={resending} onClick={resend} className="w-full mt-4 text-sm underline disabled:opacity-60">{resending ? 'Sending…' : 'Resend code'}</button></>}
      {error && <p role="alert" className="mt-5 p-3 text-center text-sm bg-red-500/25 border border-red-300/40 rounded-xl">{error}</p>}
      <p className="mt-7 text-center text-sm text-gray-200">Already have an account? <Link to="/sign-in" className="font-semibold underline">Sign in</Link></p>
    </div></div>;
}
