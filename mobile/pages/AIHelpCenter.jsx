import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Sparkles, User as UserIcon, 
  Bot, Loader2, Info, RotateCcw, ShieldCheck, Zap,
  ChevronRight, MapPin, Search, Star
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const MARKET_PROMPTS = [
  { icon: '🏡', title: 'Find Rooms & Stays', prompt: 'Find available student rooms and rentals in Polokwane under R3,000' },
  { icon: '💇', title: 'Book a Barber', prompt: 'Find top-rated barbers and hair stylists near me' },
  { icon: '🧹', title: 'Hire a Helper', prompt: 'Find verified domestic cleaners and maids with high ratings' },
  { icon: '🚗', title: 'Car Wash & Detailing', prompt: 'What mobile car wash services can come to my location?' },
  { icon: '🛡️', title: 'Escrow Protection', prompt: 'How does the loopOut escrow payment guarantee protect my money?' },
  { icon: '💰', title: 'Host & Helper Earnings', prompt: 'How do I list my room or register as a helper to earn money?' }
];

export default function AIHelpCenter() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `👋 **Hello ${currentUser ? currentUser.username : 'there'}! I'm LoopBot**, your loopOut Marketplace Copilot.\n\nI can help you search properties, book verified helpers, find local services, calculate stay budgets, or answer questions about our **Escrow Buyer Protection**.\n\nWhat would you like to explore today?`,
      suggestedFollowUps: [
        'Find rooms in Polokwane',
        'Book a barber session',
        'How does Escrow work?',
        'Hire a cleaner'
      ],
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();

    const textToSend = textOverride || inputValue.trim();
    if (!textToSend || isTyping) return;

    if (!textOverride) setInputValue('');

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/loopbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: textToSend })
      });

      const data = await response.json();

      if (data && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: data.answer || "Here's what I found for you:",
            actionItems: data.actionItems || [],
            suggestedFollowUps: data.suggestedFollowUps || [],
            timestamp: data.timestamp || new Date().toISOString()
          }
        ]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('LoopBot Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I'm having trouble connecting to live marketplace data right now. Please try again in a few moments or explore our listings through Search.",
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Fresh conversation started! How can LoopBot assist you today?`,
        suggestedFollowUps: [
          'Find rooms in Polokwane',
          'Book a barber session',
          'How does Escrow work?',
          'Hire a cleaner'
        ],
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Helmet>
        <title>LoopBot AI | loopOut Market Concierge &amp; Assistant</title>
        <meta name="description" content="Chat with LoopBot to find verified rooms, book top-rated helpers, and explore local services across South Africa." />
      </Helmet>

      {/* Premium Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950 text-white border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 p-[2px] shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-white text-sm">LoopBot AI</h1>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black border border-rose-500/30 uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-white/50 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Official loopOut Marketplace Copilot
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/help-center')}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Help FAQ"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-24 pb-48 flex flex-col gap-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.sender === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden shadow-md">
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-md text-white">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-2">
                  <div 
                    className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm font-medium ${
                      msg.sender === 'user' 
                        ? 'bg-slate-950 text-white rounded-tr-xs shadow-md' 
                        : msg.isError 
                          ? 'bg-red-50 text-red-700 rounded-tl-xs border border-red-200'
                          : 'bg-white dark:bg-gray-900 text-slate-800 dark:text-white rounded-tl-xs border border-slate-200 dark:border-gray-800/90'
                    }`}
                  >
                    <div className="whitespace-pre-line prose prose-sm max-w-none">
                      {msg.text}
                    </div>

                    {/* Interactive Item Cards returned by LoopBot */}
                    {msg.actionItems && msg.actionItems.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 space-y-2.5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                          Matching Live Listings on loopOut:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.actionItems.map((item) => (
                            <div
                              key={item.id || item.link}
                              onClick={() => handleActionClick(item.link)}
                              className="group flex flex-col p-3 bg-slate-50 dark:bg-gray-950 hover:bg-rose-50/60 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-rose-300 transition-all cursor-pointer shadow-xs"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0 border border-slate-200 dark:border-gray-800"
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:text-white font-black uppercase">
                                    {item.category}
                                  </span>
                                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors truncate mt-1">
                                    {item.title}
                                  </p>
                                  <p className="text-xs font-black text-rose-600 mt-0.5">
                                    {item.price}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-gray-800/60 text-[10px] text-slate-500 dark:text-white">
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.location}</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 flex items-center gap-0.5 shrink-0">
                                  Book <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Suggestion Chips */}
                  {msg.sender === 'ai' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {msg.suggestedFollowUps.map((followUp, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(null, followUp)}
                          className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-900 hover:bg-slate-900 hover:text-white text-slate-700 dark:text-white border border-slate-200 dark:border-gray-800 shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          {followUp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full justify-start"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-slate-600 dark:text-white" />
              </div>
              <div className="bg-white dark:bg-gray-900 px-5 py-4 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-gray-800 shadow-xs flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-white">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>LoopBot is consulting marketplace data…</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-6 z-40">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Quick starter prompts grid */}
          {messages.length < 3 && !isTyping && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {MARKET_PROMPTS.map((promptObj, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(null, promptObj.prompt)}
                  className="p-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl text-left hover:border-slate-900 hover:shadow-md transition-all flex items-center gap-2 group shadow-2xs"
                >
                  <span className="text-xl shrink-0">{promptObj.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 truncate">{promptObj.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">Ask LoopBot</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-end gap-2 bg-white dark:bg-gray-900 rounded-[1.6rem] p-2 shadow-xl shadow-slate-200/60 border border-slate-200 dark:border-gray-800 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all"
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask LoopBot (e.g. find room in Polokwane, hire a barber, how escrow works)..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent outline-none resize-none px-4 py-3 text-[14px] text-slate-900 dark:text-white placeholder:text-slate-400 scrollbar-hide"
              rows={1}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-3 bg-slate-950 hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all flex-shrink-0 self-end mb-0.5 mr-0.5 shadow-md active:scale-95"
              aria-label="Send prompt"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          
          <div className="flex items-center justify-between mt-2.5 px-2 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Escrow Protected Market
            </span>
            <span>LoopBot AI • Powered by loopOut Neural Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
