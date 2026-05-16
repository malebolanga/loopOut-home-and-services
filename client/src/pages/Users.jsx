import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiMail, FiUser, FiUsers, FiMessageSquare, FiX } from 'react-icons/fi';
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      sender: 'you',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));

    setMessage('');

    // Simulate reply after 1-3 seconds
    const replyTime = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const replies = [
        `Thanks for your message!`,
        `I'll get back to you soon.`,
        `Can we schedule a call to discuss this?`,
        `Let me check my calendar and get back to you.`,
        `Great question! Let me find out for you.`
      ];

      const replyMessage = {
        sender: activeChat,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), replyMessage]
      }));
    }, replyTime);
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

      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed bottom-6 right-6 w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 ease-in-out scale-100 opacity-100">
          <div className={`flex items-center justify-between p-4 rounded-t-xl bg-blue-50 border-b border-blue-200`}>
            <div className="flex items-center gap-3">
              <img
                src={users.find(u => u._id === activeChat)?.avatar}
                alt="User Avatar"
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {users.find(u => u._id === activeChat)?.username}
                </h3>
                <p className={`text-xs text-green-600`}>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {(chatMessages[activeChat] || []).map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                    msg.sender === 'you'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-blue-50 text-blue-700 rounded-bl-none border border-blue-200'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'you' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatMessagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-700"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
