import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSend, FiMoreVertical, FiArrowLeft, FiMessageCircle, FiTrash2, FiSearch } from 'react-icons/fi';

export default function Inbox() {
  const { currentUser } = useSelector((state) => state.user);
  const { id: conversationIdParam } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Helper for formatting time
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFromNow = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!conversationIdParam) return;
    // Only run when the URL param changes, not on every conversations update
    fetchMessages(conversationIdParam);
    setShowMobileChat(true);
  }, [conversationIdParam]);

  // Separate effect: auto-select conversation when list loads
  useEffect(() => {
    if (conversationIdParam && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationIdParam);
      if (conv) setSelectedConversation(conv);
    }
  }, [conversationIdParam, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      if (res.ok) {
        setConversations(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      setMessagesLoading(true);
      const res = await fetch(`/api/messages/${id}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
        // Do NOT call fetchConversations() here — it creates an infinite loop
        // via the useEffect that depends on `conversations` state
      }
      setMessagesLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.participants.find(p => p._id !== currentUser._id)?._id;

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          content: newMessage,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages([...messages, message]);
        setNewMessage('');
        // Update conversation list locally or refetch
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    navigate(`/messages/${conv._id}`);
    fetchMessages(conv._id);
    setShowMobileChat(true);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setConversations(conversations.filter(c => c._id !== id));
          if (selectedConversation?._id === id) {
            setSelectedConversation(null);
            setMessages([]);
            navigate('/messages');
          }
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p._id !== currentUser._id);
    return otherUser?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your inbox</h1>
        <button onClick={() => navigate('/sign-in')} className="bg-rose-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-rose-600 transition">Log In</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)] mt-4 mb-4 flex bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
      
      {/* Sidebar: Conversation List */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] flex-col border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-none focus:ring-2 focus:ring-rose-500/20 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto side-panel-scroll pb-20 md:pb-0">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const otherUser = conv.participants.find(p => p._id !== currentUser._id);
              const isSelected = selectedConversation?._id === conv._id;
              const unread = conv.unreadCount?.[currentUser._id] || 0;

              return (
                <div 
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4 ${isSelected ? 'bg-rose-50/50 border-rose-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 border-transparent'}`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={otherUser?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                      alt="" 
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                    />
                    {unread > 0 && (
                      <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
                        {unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{otherUser?.username}</h3>
                      <span className="text-[10px] text-gray-400">{formatFromNow(conv.updatedAt)}</span>
                    </div>
                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white'}`}>
                      {conv.lastMessageSender === currentUser._id && 'You: '}{conv.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-gray-400"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <FiMessageCircle className="w-12 h-12 mb-4 opacity-20" />
              <p>No messages found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-gray-900 relative`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedConversation.participants.find(p => p._id !== currentUser._id)?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                    alt="" 
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">{selectedConversation.participants.find(p => p._id !== currentUser._id)?.username}</h2>
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400">
                <FiMoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-800/30 side-panel-scroll pb-20 md:pb-8">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>
              ) : messages.map((msg, index) => {
                const isOwn = msg.sender === currentUser._id;
                return (
                  <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-[80%] md:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isOwn 
                          ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-800'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 pb-24 md:pb-6 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-2xl border border-transparent focus-within:border-rose-500/20 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-4"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all disabled:opacity-50 disabled:scale-100 scale-100 hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-800/10">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
              <FiMessageCircle className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a conversation</h2>
            <p className="text-gray-500 dark:text-white max-w-xs">Choose a conversation from the list to start chatting with your service providers or helpers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
