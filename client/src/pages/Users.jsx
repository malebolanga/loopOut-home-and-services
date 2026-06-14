import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiMail, FiUser, FiUsers, FiMessageSquare, FiX, FiCpu, FiFileText } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState({});
  const chatMessagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        setUsers(data);
        
        // Initialize empty chat messages for each user
        const initialChatMessages = {};
        data.forEach(user => {
          initialChatMessages[user._id] = [];
        });
        setChatMessages(initialChatMessages);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (activeChat) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChat]);

  const handleListingsClick = (userId, e) => {
    e.stopPropagation();
    navigate(`/listings/user/${userId}`);
  };

  const startChat = (userId, e) => {
    e.stopPropagation();
    setActiveChat(userId);
  };

  const closeChat = () => {
    setActiveChat(null);
  };

  const handleSendMessage = (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || message;
    if (!textToSend.trim()) return;

    // Simulate AI Sentiment
    let sentiment = 'neutral';
    let badge = '';
    const lowerText = textToSend.toLowerCase();
    if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('emergency')) {
      sentiment = 'urgent';
      badge = 'URGENT';
    } else if (lowerText.includes('quote') || lowerText.includes('price') || lowerText.includes('cost')) {
      sentiment = 'negotiation';
      badge = 'NEGOTIATION';
    } else if (lowerText.includes('yes') || lowerText.includes('agree') || lowerText.includes('deal')) {
      sentiment = 'positive';
      badge = 'DEAL IMMINENT';
    }

    const newMessage = {
      sender: 'you',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badge,
      sentiment
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));

    if (!customText) setMessage('');

    // Simulate reply after 1-3 seconds
    const replyTime = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const replies = [
        { text: `I can handle that. What's your budget?`, badge: 'ANALYZING', sentiment: 'neutral' },
        { text: `Yes, I'm available. Let's lock it in.`, badge: 'POSITIVE', sentiment: 'positive' },
        { text: `I might need more details before providing a final number.`, badge: 'HESITANT', sentiment: 'negotiation' },
        { text: `Can we do this tomorrow instead?`, badge: 'RESCHEDULE', sentiment: 'urgent' }
      ];

      const reply = replies[Math.floor(Math.random() * replies.length)];

      const replyMessage = {
        sender: activeChat,
        text: reply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badge: reply.badge,
        sentiment: reply.sentiment
      };

      setChatMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), replyMessage]
      }));
    }, replyTime);
  };

  const handleSmartQuote = () => {
    const quote = `SMART QUOTE PROPOSAL:\nService: Standard Request\nEst. Time: 2 Hours\nTotal Rate: R450\nValid for: 24h\n\nDo you accept?`;
    handleSendMessage(null, quote);
  };

  if (loading) {
    return (
      <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mb-4" />
          <p className="text-lg text-gray-700 font-medium">Loading community members. Please wait...</p>
        </div>
      </div>
    );
  }

  // Helper to determine background and border colors based on user type
  const getUserCardColors = (user) => {
    if (user.username?.toLowerCase().includes('agent') || 
        user.username?.toLowerCase().includes('inc') || 
        user.username?.toLowerCase().includes('realty')) {
      return { 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-200', 
        text: 'text-indigo-700', 
        hoverBg: 'hover:bg-indigo-100',
        badge: 'bg-indigo-100 text-indigo-800'
      };
    } else if (user.username?.toLowerCase().includes('family') || 
               user.username?.toLowerCase().includes('&')) {
      return { 
        bg: 'bg-purple-50', 
        border: 'border-purple-200', 
        text: 'text-purple-700', 
        hoverBg: 'hover:bg-purple-100',
        badge: 'bg-purple-100 text-purple-800'
      };
    }
    return { 
      bg: 'bg-green-50', 
      border: 'border-green-200', 
      text: 'text-green-700', 
      hoverBg: 'hover:bg-green-100',
      badge: 'bg-green-100 text-green-800'
    };
  };

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4 md:mb-0">Discover Our Community</h1>
          <Link
            to="/sign-up"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
          >
            <FiUser className="text-xl" /> Join Us
          </Link>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {users.map((user) => {
            const colors = getUserCardColors(user);
            return (
              <div
                key={user._id}
                className={`relative border-2 ${colors.border} ${colors.bg} rounded-2xl p-6 flex flex-col items-center gap-4 
                            transition-all duration-300 hover:shadow-xl ${colors.hoverBg} transform hover:-translate-y-1`}
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className={`w-28 h-28 rounded-full object-cover border-4 ${colors.border} shadow-md`}
                  />
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-white`} title="Online"></div>
                </div>

                <div className="text-center">
                  <h2 className="font-bold text-xl text-gray-800">
                    {user.username}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${colors.badge} font-medium`}>
                    {user.type || 'Member'}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-gray-600 text-sm text-center line-clamp-3">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-center text-sm text-gray-700 bg-gray-50 rounded-lg py-2 px-3">
                    <FiMail className="mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={(e) => handleListingsClick(user._id, e)}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm py-3 px-4 rounded-xl 
                                ${colors.text} ${colors.bg} border ${colors.border} hover:opacity-90 transition-all duration-200 font-medium`}
                  >
                    <FiHome className="flex-shrink-0" />
                    Listings
                  </button>
                  <button
                    onClick={(e) => startChat(user._id, e)}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm py-3 px-4 rounded-xl 
                                bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium`}
                  >
                    <FiMessageSquare className="flex-shrink-0" />
                    Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action at Bottom */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Connect?</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Join our growing community of property enthusiasts, agents, and families. Create your profile today and start exploring real opportunities!
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full text-xl font-semibold 
                       hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-xl transform hover:scale-105"
          >
            <FiUsers className="mr-3 text-2xl" />
            Sign Up Now
          </Link>
        </div>
      </div>

      {/* Chat Modal - Live Negotiation Terminal */}
      {activeChat && (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 sm:p-8 font-mono">
          <div className="w-full max-w-4xl h-[90vh] bg-gray-900 border border-green-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col overflow-hidden relative">
            
            {/* Terminal Grid Background */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-4 bg-gray-950 border-b border-green-500/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={users.find(u => u._id === activeChat)?.avatar}
                    alt="Avatar"
                    className="w-12 h-12 rounded-sm border border-green-500/50 opacity-80"
                    style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(80deg) saturate(300%) contrast(150%)' }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-400 tracking-wider flex items-center gap-2">
                    <FiCpu className="text-green-500" />
                    TARGET: {users.find(u => u._id === activeChat)?.username.toUpperCase()}
                  </h3>
                  <div className="flex gap-3 text-xs text-green-500/70">
                    <span>STATUS: ACTIVE_LINK</span>
                    <span>ENCRYPTION: AES-256</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="text-green-500 hover:text-green-400 hover:bg-green-500/10 p-2 rounded transition-colors border border-transparent hover:border-green-500/50"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {(chatMessages[activeChat] || []).map((msg, index) => {
                let badgeColor = 'text-green-400 border-green-500/30 bg-green-500/10';
                if (msg.sentiment === 'urgent') badgeColor = 'text-red-400 border-red-500/30 bg-red-500/10';
                if (msg.sentiment === 'negotiation') badgeColor = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
                if (msg.sentiment === 'positive') badgeColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10';

                return (
                  <div key={index} className={`flex flex-col ${msg.sender === 'you' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-gray-500 uppercase">[{msg.time}]</span>
                      {msg.badge && (
                        <span className={`text-[9px] px-2 py-0.5 border rounded uppercase font-bold tracking-widest ${badgeColor} animate-pulse`}>
                          AI: {msg.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-4 border rounded-sm backdrop-blur-md ${
                        msg.sender === 'you'
                          ? 'bg-green-900/20 border-green-500/50 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300'
                      }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* AI Tools & Input */}
            <div className="relative z-10 bg-gray-950 border-t border-green-500/30 p-4">
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={handleSmartQuote}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded hover:bg-yellow-500/20 transition-colors"
                >
                  <FiFileText /> Generate Smart Quote
                </button>
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <span className="text-green-500 text-xl font-bold self-center">{">"}</span>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="TRANSMIT MESSAGE..."
                  className="flex-1 bg-transparent border-b border-green-500/50 focus:border-green-400 px-2 py-2 outline-none text-green-100 placeholder:text-green-500/30 font-mono transition-colors"
                />
                <button
                  type="submit"
                  className="bg-green-500/20 text-green-400 border border-green-500/50 px-6 py-2 rounded-sm hover:bg-green-500 hover:text-gray-950 transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] font-bold tracking-widest uppercase"
                >
                  Execute
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
