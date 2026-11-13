import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import {
  signInStart,
  signInSuccess,
  signInFailure
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import AuthBrandLogo from '../components/AuthBrandLogo';
import AuthSideIllustration from '../components/AuthSideIllustration';
import { persistSessionToken } from '../utils/authenticatedFetch';

export default function SignIn() {
  const location = useLocation();
  const initialTwoFactorEmail = location.state?.twoFactorEmail || '';
  const [formData, setFormData] = useState({ email: initialTwoFactorEmail, password: '' });
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(Boolean(initialTwoFactorEmail));
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorDevCode, setTwoFactorDevCode] = useState('');
  const { loading, error, currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // If already signed in, redirect to home
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
    // Clear any previous sign in errors when mounting
    dispatch(signInFailure(null));
  }, [currentUser?._id, navigate, dispatch]);

  const handleChange = (e) => {
    if (error) dispatch(signInFailure(null));
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.requiresTwoFactor) {
        setTwoFactorChallenge(true);
        setTwoFactorCode('');
        setTwoFactorDevCode(data.devCode || '');
        dispatch(signInFailure(null));
        return;
      }

      if (!res.ok) {
        if (data.requiresVerification) {
          navigate('/sign-up', { state: { email: formData.email, verify: true } });
          return;
        }
        throw new Error(data.message || 'Failed to sign in. Please check your email and password.');
      }

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }

      if (data.token || data.access_token) {
        persistSessionToken(data);
      }

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message || 'Unable to sign in. Please try again.'));
    }
  };

  const handleVerifyTwoFactor = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/verify-two-factor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, otp: twoFactorCode }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'That sign-in code could not be verified.');
      persistSessionToken(data);
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message || 'Unable to verify your sign-in code.'));
    }
  };

  const handleResendTwoFactor = async () => {
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.requiresTwoFactor) throw new Error(data.message || 'Could not request a new sign-in code.');
      setTwoFactorDevCode(data.devCode || '');
      dispatch(signInFailure(null));
    } catch (err) {
      dispatch(signInFailure(err.message || 'Could not request a new sign-in code.'));
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full max-w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 p-4 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-amber-300/50 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(49,46,129,0.22)_100%)]" />
      </div>
      <AuthSideIllustration />

      <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-white/80 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl animate-fade-in sm:p-9">
        <Link to="/" aria-label="Back to home" className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
          <FaArrowLeft className="h-3 w-3" /> Home
        </Link>
        {/* Brand Logo */}
        <div className="mb-6 flex flex-col items-center">
          <AuthBrandLogo />
        </div>

        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Welcome back</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600">Find and offer local places, services, food, and goods.</p>
          <Link to="/how-it-works" className="mt-2 inline-flex text-xs font-semibold text-rose-600 underline decoration-rose-300 underline-offset-4 hover:text-rose-800">See how LoopOut works</Link>
        </div>

        {twoFactorChallenge ? (
        <form onSubmit={handleVerifyTwoFactor} className="flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-950">Verify it’s you</h2>
            <p className="mt-1 text-sm text-slate-600">Enter the six-digit sign-in code sent to {formData.email}.</p>
          </div>
          {twoFactorDevCode && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-sm font-semibold text-amber-900">Development code: {twoFactorDevCode}</p>}
          <label htmlFor="two-factor-code" className="sr-only">Six-digit sign-in code</label>
          <input id="two-factor-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center text-lg tracking-[0.35em] text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15" />
          <button type="submit" disabled={loading || twoFactorCode.length !== 6} className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] px-6 py-3.5 text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Verifying…' : 'Verify and sign in'}</button>
          <button type="button" disabled={loading} onClick={handleResendTwoFactor} className="text-sm font-semibold text-rose-700 underline underline-offset-2 disabled:opacity-50">Send code again</button>
          <button type="button" disabled={loading} onClick={() => { setTwoFactorChallenge(false); setTwoFactorCode(''); setTwoFactorDevCode(''); dispatch(signInFailure(null)); }} className="text-sm text-slate-600 underline underline-offset-2">Back to sign in</button>
        </form>
        ) : <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[16px] text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/15"
              id="email"
              onChange={handleChange}
              value={formData.email}
              autoComplete="email"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[16px] text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/15"
              id="password"
              onChange={handleChange}
              value={formData.password}
              autoComplete="current-password"
              required
            />
          </div>
          <p className="text-right text-sm"><Link to="/forgot-password" className="text-rose-700 underline underline-offset-2 hover:text-rose-900">Forgot password?</Link></p>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white py-3.5 px-6 rounded-xl font-semibold text-[16px] hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Signing In...
              </span>
            ) : (
              <span>Sign in</span>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="rounded-xl bg-white px-4 text-slate-500">or</span>
            </div>
          </div>

          <div className="[&>button]:rounded-xl [&>button]:py-3.5">
              <OAuth />
          </div>
        </form>}

        {/* Sign Up Link */}
        <div className="mt-8 text-center drop-shadow-sm">
          <p className="text-slate-600 text-[15px]">
            Don't have an account?{' '}
            <Link to="/sign-up" className="font-semibold text-rose-700 underline hover:text-rose-900 decoration-2 underline-offset-2 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Error Message */}
        <div className="mt-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in shadow-sm">
              <p className="text-red-700 text-[14px] text-center font-medium">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

