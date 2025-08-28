import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { FaSpinner } from 'react-icons/fa';
import { FiUser, FiMail, FiLock, FiPlusCircle } from 'react-icons/fi';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up. Please try again.');
      }

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }

      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 hover:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Create Your Home
        </h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Join our community and find your perfect place.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username Input */}
          <div className="relative">
            <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Username"
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              id="username"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="email"
              placeholder="Email Address"
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              id="email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="password"
              placeholder="Password"
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              id="password"
              onChange={handleChange}
              required
            />
          </div>

          {/* Sign Up Button */}
          <button
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-purple-600 to-pink-700 text-white p-4 font-bold rounded-lg uppercase tracking-wide
                       hover:from-purple-700 hover:to-pink-800 transition-all duration-300 shadow-md flex items-center justify-center
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-3 text-xl" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FiPlusCircle className="mr-3 text-xl" />
                Sign Up
              </span>
            )}
          </button>

          <OAuth />
        </form>

        {/* Sign In Link */}
        <div className="flex justify-center gap-2 mt-7 text-gray-700 text-lg">
          <p>Already have an account?</p>
          <Link to={"/sign-in"}>
            <span className="text-purple-600 font-semibold hover:underline hover:text-purple-800 transition-colors">
              Sign In
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