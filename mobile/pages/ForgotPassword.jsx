import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import BrandLogo from '../components/BrandLogo';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputClass = 'w-full mt-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white';
  const requestCode = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { const response = await fetch('/api/auth/request-password-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to request a reset.'); setMessage(data.message); setStep(2); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  const reset = async (event) => {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) return setError('Your passwords do not match.');
    setLoading(true);
    try { const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to reset your password.'); navigate('/sign-in'); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950"><div className="w-full max-w-md p-8 rounded-3xl text-white bg-white/10 backdrop-blur-md border border-white/20"><div className="flex justify-center mb-6"><BrandLogo className="h-12 w-auto" showText textColor="text-white" /></div><h1 className="text-2xl font-semibold text-center">Reset your password</h1><p className="text-center text-sm text-gray-200 mt-2 mb-6">{step === 1 ? 'We’ll email a six-digit reset code.' : 'Enter your reset code and a new strong password.'}</p>{step === 1 ? <form onSubmit={requestCode} className="space-y-4"><label className="block text-sm">Email address<input type="email" autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required /></label><button disabled={loading} className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#E61E4D] to-[#D70466]">{loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Send reset code'}</button></form> : <form onSubmit={reset} className="space-y-4"><label className="block text-sm">Reset code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" className={inputClass} value={otp} onChange={(e) => setOtp(e.target.value)} required /></label><label className="block text-sm">New password<input type="password" autoComplete="new-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required /></label><label className="block text-sm">Confirm new password<input type="password" autoComplete="new-password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label><button disabled={loading} className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[#E61E4D] to-[#D70466]">{loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Reset password'}</button></form>}{message && <p className="mt-4 text-sm text-center text-gray-200">{message}</p>}{error && <p role="alert" className="mt-4 p-3 rounded-xl bg-red-500/25 text-center text-sm">{error}</p>}<p className="mt-6 text-center text-sm"><Link className="underline" to="/sign-in">Back to sign in</Link></p></div></div>;
}
