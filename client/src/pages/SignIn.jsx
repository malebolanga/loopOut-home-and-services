import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import {
  signInStart,
  signInSuccess,
  signInFailure
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import BrandLogo from '../components/BrandLogo';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
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


      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign in. Please try again.');
      }

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  // Token validation on mount
  useEffect(() => {
    const validateSession = async () => {
      if (formData.email || formData.password) return;
      dispatch(signInStart());
      try {
        const res = await fetch('/api/auth/validate-token', {
          method: 'POST',
          credentials: 'include'
        });

        if (!res.ok) {
           console.warn('Initial session validation check failed on server:', res.status);
           dispatch(signInFailure(null));
           return;
        }

        const data = await res.json();
        if (data && data.valid) {
          dispatch(signInSuccess(data.user));
          navigate('/');
        } else {
          dispatch(signInFailure(null));
        }
      } catch (error) {
        dispatch(signInFailure(null));
      }
    };
    validateSession();
  }, [dispatch, navigate]);

  // Full-page loading spinner for initial session validation
  if (loading && !formData.email && !formData.password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#FF5A5F] mx-auto mb-4" />
          <p className="text-base text-[#717171] font-normal">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8">
      {/* Absolute Full-screen Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        >
          <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20 text-white animate-fade-in">
        {/* Brand Logo */}
        <div className="mb-8 flex flex-col items-center">
          <BrandLogo className="h-16 w-auto" showText={true} textColor="text-white" />
        </div>

        <h2 className="text-[22px] font-semibold text-white mb-8 text-center border-t border-white/10 pt-8 drop-shadow-sm">
          Welcome back
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-[16px] text-white placeholder-gray-300 focus:outline-none focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white transition-all duration-200"
              id="email"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-[16px] text-white placeholder-gray-300 focus:outline-none focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white transition-all duration-200"
              id="password"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white py-3.5 px-6 rounded-xl font-semibold text-[16px] hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Signing In...
              </span>
            ) : (
              <span>Continue</span>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-200" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>or</span>
            </div>
          </div>

          <div className="[&>button]:rounded-xl [&>button]:py-3.5">
              <OAuth />
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center drop-shadow-sm">
          <p className="text-gray-200 text-[15px]">
            Don't have an account?{' '}
            <Link to="/sign-up" className="font-semibold text-white underline hover:text-gray-200 decoration-2 underline-offset-2 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Error Message */}
        <div className="mt-6">
          {error && (
            <div className="p-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl animate-fade-in shadow-lg">
              <p className="text-red-100 text-[14px] text-center font-medium drop-shadow-md">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
