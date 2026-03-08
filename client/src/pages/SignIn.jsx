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
        const data = await res.json();
        if (data.valid) {
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
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12 sm:px-8 lg:px-12">
      <div className="w-full max-w-[400px]">
        {/* Brand Logo V2 - Integrated Icon and Text */}
        <div className="mb-10 flex flex-col items-center">
          <BrandLogo className="h-20 w-auto" showText={true} />
        </div>

        <h2 className="text-[22px] font-semibold text-[#222222] mb-8 text-center border-t border-gray-100 pt-8">
          Welcome back
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-[#B0B0B0] rounded-lg text-[16px] text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] transition-colors duration-200"
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
              className="w-full px-4 py-3 border border-[#B0B0B0] rounded-lg text-[16px] text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] transition-colors duration-200"
              id="password"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white py-3 px-6 rounded-lg font-semibold text-[16px] hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Signing In...
              </span>
            ) : (
              <span>Continue</span>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DDDDDD]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#717171]">or</span>
            </div>
          </div>

          <OAuth />
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-[#222222] text-[14px]">
            Don't have an account?{' '}
            <Link to={"/sign-up"} className="font-semibold underline hover:text-[#000000]">
              Sign up
            </Link>
          </p>
        </div>

        {/* Error Message */}
        <div className='py-12'>
          {error && (
            <div className="mt-4 p-3 bg-[#FFF8F6] border border-[#FFB3A7] rounded-lg">
              <p className="text-[#C13515] text-[14px] text-center">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}