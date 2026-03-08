import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { FaSpinner } from 'react-icons/fa';
import BrandLogo from '../components/BrandLogo';

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
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12 sm:px-8 lg:px-12">
      <div className="w-full max-w-[400px]">
        {/* Brand Logo V2 - Integrated Icon and Text */}
        <div className="mb-10 flex flex-col items-center">
          <BrandLogo className="h-20 w-auto" showText={true} />
        </div>

        <h2 className="text-[22px] font-semibold text-[#222222] mb-2 text-center border-t border-gray-100 pt-8">
          Create your account
        </h2>
        <p className="text-center text-[#717171] mb-8 text-[14px]">
          Join our community and find your perfect place
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 border border-[#B0B0B0] rounded-lg text-[16px] text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] transition-colors duration-200"
              id="username"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-[#B0B0B0] rounded-lg text-[16px] text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222] transition-colors duration-200"
              id="email"
              onChange={handleChange}
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
              required
            />
          </div>

          {/* Sign Up Button */}
          <button
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white py-3 px-6 rounded-lg font-semibold text-[16px] hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Creating account...
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

        {/* Sign In Link */}
        <div className="mt-6 py-16 text-center">
          <p className="text-[#222222] text-[14px]">
            Already have an account?{' '}
            <Link to={"/sign-in"} className="font-semibold underline hover:text-[#000000]">
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-[#FFF8F6] border border-[#FFB3A7] rounded-lg">
            <p className="text-[#C13515] text-[14px] text-center">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}