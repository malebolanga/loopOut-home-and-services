import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LookingForItem from '../components/LookingForItem';
import Comments from '../components/Comments';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  PlusIcon,
  SparklesIcon,
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'all', label: 'All Requests', icon: SparklesIcon, color: 'bg-purple-50 text-purple-600' },
  { id: 'room', label: 'Rooms', icon: HomeIcon, color: 'bg-blue-50 text-blue-600' },
  { id: 'roommate', label: 'Roommates', icon: UserGroupIcon, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'nanny', label: 'Helpers/Nannies', icon: BriefcaseIcon, color: 'bg-amber-50 text-amber-600' },
  { id: 'dog', label: 'Pets', icon: SparklesIcon, color: 'bg-rose-50 text-rose-600' },
  { id: 'sharing', label: 'Sharing', icon: UserGroupIcon, color: 'bg-indigo-50 text-indigo-600' },
];

const LookingForDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/looking-for/get');
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    if (requestId && requests.length > 0) {
      const found = requests.find(r => r._id === requestId);
      if (found) setSelectedRequest(found);
    } else if (!requestId) {
      setSelectedRequest(null);
    }
  }, [requestId, requests]);

  const closeDetail = () => {
    setSearchParams({});
    setSelectedRequest(null);
  };

  const filteredRequests = useMemo(() => {
    let result = activeTab === 'all' 
      ? requests 
      : requests.filter(r => r.category === activeTab);
    
    if (searchQuery.trim()) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [requests, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Looking For</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Tell the community what you need, find what you're looking for.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-rose-500 transition-all font-medium"
                />
              </div>
              <button 
                onClick={() => navigate('/create-request')}
                className="flex items-center gap-2 bg-gray-950 text-white px-6 py-3 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 group"
              >
                <PlusIcon className="w-5 h-5 stroke-[3px] group-hover:rotate-90 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Post Need</span>
              </button>
            </div>
          </div>

          {/* Categories Tab */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pt-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex flex-col items-center gap-3 min-w-fit pb-4 relative transition-all ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <div className={`p-3 rounded-2xl transition-all ${isActive ? cat.color + ' shadow-inner scale-110' : 'bg-gray-50'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {cat.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeCategory" 
                      className="absolute bottom-0 w-8 h-1 bg-gray-900 rounded-full" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
              <MagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No requests found</h2>
            <p className="text-gray-500 font-medium max-w-sm">Be the first to post a "Looking for" request in this category!</p>
            <button 
              onClick={() => navigate('/create-request')}
              className="mt-8 px-8 py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl active:scale-95"
            >
              Post your need now
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {filteredRequests.map(request => (
                <LookingForItem key={request._id} request={request} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => navigate('/create-request')}
        className="fixed bottom-8 right-6 md:hidden z-50 bg-rose-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90"
      >
        <PlusIcon className="w-7 h-7 stroke-[3px]" />
      </button>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeDetail}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
               <button 
                 onClick={closeDetail}
                 className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white md:text-gray-400 md:hover:bg-gray-100 rounded-full transition-all"
               >
                 <XMarkIcon className="w-6 h-6" />
               </button>

               {/* Left: Content */}
               <div className="w-full md:w-1/2 overflow-y-auto no-scrollbar bg-white">
                  <div className="p-8 pb-4 border-b border-gray-50 bg-gray-50/30">
                      <div className="flex items-center justify-between mb-8">
                         <div className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {selectedRequest.category}
                         </div>
                         <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Community Need</div>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{selectedRequest.title}</h2>
                  </div>

                  <div className="p-8 space-y-8">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden">
                             <img src={selectedRequest.userRef?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-900">{selectedRequest.userRef?.username || "Community Member"}</p>
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Post Author</p>
                          </div>
                      </div>

                      <div className="space-y-4">
                         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</h3>
                         <p className="text-gray-600 leading-relaxed font-medium">{selectedRequest.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                             <MapPinIcon className="w-5 h-5 text-rose-500" />
                             <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Location</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{selectedRequest.location}</p>
                             </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                             <PhoneIcon className="w-5 h-5 text-green-500" />
                             <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Contact</p>
                                <p className="text-sm font-bold text-gray-900">WhatsApp</p>
                             </div>
                          </div>
                      </div>

                      <button 
                        onClick={() => window.open(`https://wa.me/${selectedRequest.contact}`)}
                        className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-green-100 hover:shadow-2xl transition-all active:scale-95"
                      >
                        Connect on WhatsApp
                      </button>
                  </div>
               </div>

               {/* Right: Comments */}
               <div className="w-full md:w-1/2 bg-gray-50 flex flex-col overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-gray-100 bg-white shrink-0">
                      <div className="flex items-center gap-2">
                         <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-rose-500" />
                         <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Community Discussion</h3>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                      <Comments listingId={selectedRequest._id} cardStyle={true} horizontalStyle={true} />
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LookingForDiscovery;
