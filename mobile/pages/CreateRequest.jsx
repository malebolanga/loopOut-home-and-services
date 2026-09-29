import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  MapPinIcon, 
  PhoneIcon, 
  TagIcon, 
  InformationCircleIcon,
  ChevronLeftIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { hasProfanity } from "../utils/profanityFilter";

export default function CreateRequest() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'roommate',
    budget: '',
    contact: '',
    userRef: currentUser?._id || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
        setError("You must be logged in to post a request");
        return;
    }

    if (hasProfanity(formData.title) || hasProfanity(formData.description)) {
        setError("Please remove inappropriate language from your request.");
        return;
    }

    // Determine device type
    const deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    
    try {
      setLoading(true);
      setError(null);
      const res = await authenticatedFetch('/api/looking-for/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            userRef: currentUser._id,
            deviceType,
            requestLocation: formData.location // the location where user is requesting it
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      } else {
        navigate('/micro-gigs');
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-20 px-6 pb-32">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-white hover:text-gray-900 dark:hover:text-white transition-colors mb-12 group"
        >
          <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Go Back</span>
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 md:p-16 shadow-2xl shadow-rose-100/20">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Post your Need</h1>
            <p className="text-gray-500 dark:text-white font-medium mt-2">Tell the loopOut community exactly what you're looking for.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Category selection */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-6">Select Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'roommate', label: 'Looking for Roommate', icon: '👤' },
                  { id: 'nanny', label: 'Looking for Full-time Nanny', icon: '🍼' },
                  { id: 'pampering', label: 'Pampering / Beauty', icon: '💄' },
                  { id: 'household', label: 'Household Help', icon: '🧹' },
                  { id: 'others', label: 'Something else', icon: '✨' },
                ].map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-6 rounded-3xl border-4 transition-all cursor-pointer flex flex-col items-center gap-3 ${formData.category === cat.id ? 'border-gray-900 bg-gray-950 text-white shadow-xl scale-105' : 'border-gray-50 bg-gray-50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-800'}`}
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-2">Request Title</label>
                <div className="relative">
                  <TagIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    id="title"
                    required
                    placeholder="e.g. Looking for a roommate in Turfloop"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full pl-16 pr-8 py-6 bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-2">Detailed Description</label>
                <textarea
                  id="description"
                  required
                  rows="5"
                  placeholder="Describe what you need in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-8 py-6 bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-2">Location</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      id="location"
                      required
                      placeholder="e.g. Polokwane"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-16 pr-8 py-6 bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-2">Budget (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-rose-500">R</span>
                    <input
                      type="number"
                      id="budget"
                      placeholder="e.g. 2500"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full pl-16 pr-8 py-6 bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-2">Contact Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    id="contact"
                    required
                    placeholder="e.g. 071 234 5678"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full pl-16 pr-8 py-6 bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-sm font-bold bg-rose-50 p-4 rounded-2xl flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Deploy Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
