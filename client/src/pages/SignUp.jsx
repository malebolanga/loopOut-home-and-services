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

        <h2 className="text-[22px] font-semibold text-white mb-2 text-center border-t border-white/10 pt-8 drop-shadow-sm">
          Create your account
        </h2>
        <p className="text-center text-gray-200 mb-8 text-[15px] drop-shadow-sm">
          Join our community and find your perfect place
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-[16px] text-white placeholder-gray-300 focus:outline-none focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white transition-all duration-200"
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
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-[16px] text-white placeholder-gray-300 focus:outline-none focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white transition-all duration-200"
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
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-[16px] text-white placeholder-gray-300 focus:outline-none focus:border-white focus:bg-white/20 focus:ring-1 focus:ring-white transition-all duration-200"
              id="password"
              onChange={handleChange}
              required
            />
          </div>

          {/* Sign Up Button */}
          <button
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white py-3.5 px-6 rounded-xl font-semibold text-[16px] hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Creating account...
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

        {/* Sign In Link */}
        <div className="mt-8 pb-4 text-center drop-shadow-sm">
          <p className="text-gray-200 text-[15px]">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-semibold text-white underline hover:text-gray-200 decoration-2 underline-offset-2 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Message */}
        <div className="mt-2">
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl animate-fade-in shadow-lg">
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