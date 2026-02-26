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
      dispatch(signInStart());
      try {
        const res = await fetch('/api/auth/validate-token', {
          method: 'POST',
          credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.valid) {
          dispatch(signInSuccess(data.user));
        } else {
          dispatch(signInFailure('Session expired. Please sign in again.'));
        }
      } catch (error) {
        dispatch(signInFailure('Failed to validate session.'));
      }
    };

    validateSession();
  }, [dispatch]);

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
        {/* Airbnb Logo Placeholder - Optional */}
        <div className="mb-8 flex justify-center">
          <svg className="h-8 w-auto text-[#FF5A5F]" viewBox="0 0 102 32" fill="currentColor">
            <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.4 5.4 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1.03-.76 1.5l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.83 6.83 0 007.2 9.23 8.38 8.38 0 003.18-.76c1.27-.57 2.4-1.37 3.34-2.37 1.02-1.07 1.93-2.3 2.86-3.55l.06-.06c1.16-1.56 2.3-3.2 3.43-4.82l.06-.06c1.1-1.53 2.18-3.05 3.28-4.56l.06-.06c.03-.03.06-.06.06-.06.03-.03.06-.06.06-.06 1.1 1.5 2.18 3.03 3.28 4.56l.06.06c1.13 1.62 2.27 3.26 3.43 4.82l.06.06c.93 1.25 1.84 2.48 2.86 3.55.94.99 2.07 1.8 3.34 2.37 1.02.47 2.1.73 3.18.76a6.83 6.83 0 007.2-9.23zM7.96 21.17c-.48.75-1.03 1.5-1.63 2.18-1.04 1.17-2.4 1.97-3.8 2.2-1.03.17-2.07-.03-2.93-.58a3.8 3.8 0 01-1.5-1.9c-.2-.52-.2-1.1-.03-1.63.16-.52.46-.99.85-1.37.73-.73 1.63-1.27 2.56-1.63.99-.39 2.03-.61 3.07-.73h.06c.16 0 .32.03.48.06-.03.32-.06.64-.06.99 0 1.14.14 2.27.42 3.37.06.23.13.45.2.67.03.06.06.13.09.2-.13.03-.26.06-.42.06zM50.96 9.51c-.26-1.23-.99-2.27-1.93-2.93-.99-.67-2.2-.99-3.46-.85-1.2.14-2.27.67-3.07 1.5-.76.82-1.23 1.9-1.37 3.07-.14 1.14.06 2.27.52 3.2.52.99 1.3 1.76 2.3 2.27.99.52 2.14.73 3.28.58 1.14-.14 2.2-.64 3.01-1.4.82-.79 1.37-1.84 1.5-3.01.06-.52.03-1.07-.06-1.6zm-1.63 1.4c-.1.64-.39 1.23-.82 1.7-.46.49-1.07.82-1.76.91-.67.1-1.37-.03-1.93-.36-.58-.32-1.04-.82-1.3-1.43-.26-.61-.32-1.3-.2-1.96.13-.64.46-1.2.91-1.63.49-.46 1.1-.76 1.76-.85.67-.1 1.34.03 1.9.36.58.32 1.04.79 1.3 1.4.29.58.35 1.24.24 1.9zM62.87 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07a4.1 4.1 0 00-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03-.03-.03 0-.03 0-.03zM73.73 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07-.1-.16-.2-.35-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03zM84.6 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07-.1-.16-.2-.35-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03zM95.46 8.09c-.76-.82-1.76-1.3-2.84-1.37-1.07-.06-2.11.29-2.93.99-.82.7-1.37 1.7-1.53 2.8-.17 1.1.1 2.2.73 3.07.67.93 1.67 1.53 2.8 1.7 1.1.17 2.23-.1 3.14-.79.91-.67 1.5-1.67 1.7-2.8.16-1.1-.1-2.2-.76-3.07-.1-.16-.2-.35-.31-.53zm-1.27 3.07c-.1.52-.39.99-.76 1.34-.39.36-.88.58-1.43.61-.52.03-1.04-.13-1.46-.42-.42-.29-.73-.7-.91-1.17-.17-.49-.2-1.01-.06-1.5.13-.49.42-.91.79-1.24.39-.32.88-.52 1.4-.55.52-.03 1.04.13 1.46.42.42.29.73.67.91 1.14.2.49.23 1.01.06 1.5-.03.03-.03.03-.06.03z"/>
          </svg>
        </div>

        <h1 className="text-[22px] font-semibold text-[#222222] mb-8 text-center">
          Welcome back
        </h1>

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