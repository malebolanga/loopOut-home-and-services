import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { FaSpinner, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import BrandLogo from '../components/BrandLogo';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    accessContacts: false,
    otp: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value,
    });
  };

  const nextStep = () => {
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    nextStep();
  };

  const handleFinalSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // We'll pass some mock contacts if they agreed
      const mockContacts = formData.accessContacts 
        ? ['+27821234567', '+27712345678', '+27612345679'] 
        : [];

      const payload = {
          ...formData,
          contacts: mockContacts
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up. Please try again.');
      }

      if (data.requiresVerification) {
        setStep(3); // OTP Step
        if (data.devHint) {
            console.log('💡 DEV TIP:', data.devHint);
            setFormData(prev => ({ ...prev, devHint: data.devHint }));
        }
      } else {
        navigate('/sign-in');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            email: formData.email,
            otp: formData.otp
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed.');
      }

      // Success! The verify-otp endpoint returns the user and sets the cookie
      navigate('/');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const resendOtp = async () => {
    try {
        setResending(true);
        setError(null);
        const res = await fetch('/api/auth/resend-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: formData.email }),
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.message);
        alert('Verification code resent!');
    } catch (err) {
        setError(err.message);
    } finally {
        setResending(false);
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

      <div className="w-full max-w-[450px] relative z-10 bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20 text-white animate-fade-in overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
            <div 
                className="h-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
            ></div>
        </div>

        {/* Brand Logo */}
        <div className="mb-6 flex flex-col items-center">
          <BrandLogo className="h-12 w-auto" showText={true} textColor="text-white" />
        </div>

        {step === 1 && (
            <div className="animate-slide-in-right">
                <h2 className="text-[22px] font-semibold text-white mb-2 text-center border-t border-white/10 pt-6 drop-shadow-sm">
                  Create your account
                </h2>
                <p className="text-center text-gray-200 mb-6 text-[14px]">
                  Step 1: Account credentials
                </p>

                <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-1 focus:ring-white transition-all"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-1 focus:ring-white transition-all"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-1 focus:ring-white transition-all"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button className="mt-2 w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                    Next Step
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 text-gray-200" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>or</span>
                    </div>
                  </div>
                  <OAuth />
                </form>
            </div>
        )}

        {step === 2 && (
            <div className="animate-slide-in-right">
                <button onClick={prevStep} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-4 transition-colors">
                    <FaArrowLeft /> Back
                </button>
                <h2 className="text-[22px] font-semibold text-white mb-2 text-center drop-shadow-sm">
                  Complete your profile
                </h2>
                <p className="text-center text-gray-200 mb-6 text-[14px]">
                  Step 2: Verification details
                </p>

                <form onSubmit={handleFinalSignup} className="flex flex-col gap-5">
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Cell Phone Number"
                      className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-1 focus:ring-white transition-all"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your Location (City/Area)"
                      className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-1 focus:ring-white transition-all"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="mt-1">
                            <input 
                                type="checkbox" 
                                id="accessContacts"
                                checked={formData.accessContacts}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#E61E4D] focus:ring-[#E61E4D]" 
                            />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-white group-hover:text-gray-100 transition-colors">
                                Mutual Friends Access
                            </span>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                Allow LoopOut to access your contacts to find mutual friends. 
                                This helps verify helpers and increases trust in bookings.
                            </p>
                        </div>
                    </label>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Create Account'}
                  </button>
                </form>
            </div>
        )}

        {step === 3 && (
            <div className="animate-slide-in-right py-4">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                        <FaShieldAlt className="text-2xl text-[#E61E4D]" />
                    </div>
                </div>
                <h2 className="text-[22px] font-semibold text-white mb-2 text-center drop-shadow-sm">
                  Verify your email
                </h2>
                <p className="text-center text-gray-200 mb-8 text-[14px]">
                  We've sent a 6-digit code to <br />
                  <span className="font-semibold text-white">{formData.email}</span>
                  {formData.phone && (
                      <span className="block mt-1 text-gray-300">
                          and your phone <span className="text-white font-semibold">{formData.phone}</span>
                      </span>
                  )}
                </p>

                {formData.devHint && (
                    <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/50 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xl">💡</span>
                        </div>
                        <p className="text-xs text-blue-100 leading-tight">
                            <span className="font-bold block mb-1">Testing Mode:</span>
                            {formData.devHint}
                        </p>
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter code"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-center text-3xl font-bold tracking-[0.5em] placeholder-gray-500 focus:ring-1 focus:ring-white transition-all shadow-inner"
                    id="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                  
                  <button 
                    disabled={loading}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <><FaCheck /> Verify & Finish</>}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Didn't receive the code?{' '}
                        <button 
                            type="button"
                            onClick={resendOtp}
                            disabled={resending}
                            className="text-[#E61E4D] font-bold hover:underline disabled:opacity-30"
                        >
                            {resending ? 'Sending...' : 'Resend'}
                        </button>
                    </p>
                  </div>
                </form>
            </div>
        )}

        {/* Footer Link */}
        {step < 3 && (
            <div className="mt-8 text-center drop-shadow-sm border-t border-white/10 pt-6">
              <p className="text-gray-300 text-[14px]">
                Already have an account?{' '}
                <Link to="/sign-in" className="font-semibold text-white underline decoration-2 underline-offset-2 hover:text-gray-200 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
        )}

        {/* Error Messages */}
        {error && (
            <div className="mt-4 p-3 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl animate-shake">
                <p className="text-red-100 text-[13px] text-center font-medium">
                    {error}
                </p>
            </div>
        )}
      </div>
    </div>
  );
}