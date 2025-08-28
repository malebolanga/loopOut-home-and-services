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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 hover:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Welcome Home
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="email"
              placeholder="Your Email"
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              id="email"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="password"
              placeholder="Password"
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              id="password"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 font-bold rounded-lg uppercase tracking-wide
                       hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-md flex items-center justify-center
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-3 text-xl" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FiLogIn className="mr-3 text-xl" />
                Sign In
              </span>
            )}
          </button>

          <OAuth />
        </form>

        {/* Sign Up Link */}
        <div className="flex justify-center gap-2 mt-7 text-gray-700 text-lg">
          <p>Don t have an account?</p>
          <Link to={"/sign-up"}>
            <span className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors">
              Sign up
            </span>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-center mt-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}