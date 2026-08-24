import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  Maximize2,
  Minimize2,
  RotateCcw,
  Star,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

const QUICK_STARTERS = [
  { label: '🏡 Find Rooms in Polokwane', prompt: 'Find available student rooms and rentals in Polokwane under R3,000' },
  { label: '💇 Book a Barber', prompt: 'I want to book a top-rated barber near me' },
  { label: '🧹 Hire a Cleaner', prompt: 'Find verified domestic cleaners in my area' },
  { label: '🚗 Car Wash Services', prompt: 'What car wash and detailing services are available?' },
  { label: '🛡️ How Escrow Works', prompt: 'How does the loopOut escrow payment protection work?' },
  { label: '🚀 Host Earnings', prompt: 'How do I become a host or helper and earn on loopOut?' }
];

export default function AIAssistantWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `👋 **Hi ${currentUser?.username || 'there'}! I'm LoopBot**, your loopOut Marketplace Copilot.`,
      actionItems: [],
      suggestedFollowUps: [
        'Find rooms in Polokwane',
        'Book a barber session',
        'How does Escrow work?',
        'Hire a cleaner'
      ],
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen, isTyping]);

  // Global listener for opening LoopBot from any button/banner
  useEffect(() => {
    const handleOpenLoopBot = (event) => {
      setIsOpen(true);
      const prompt = event?.detail?.initialPrompt;
      if (prompt) {
        handleSendMessage(prompt);
      }
    };

    window.addEventListener('open-loopbot', handleOpenLoopBot);
    return () => window.removeEventListener('open-loopbot', handleOpenLoopBot);
  }, [currentUser]);

  // Hide widget on full-screen AI page to avoid duplication
  if (location.pathname === '/ai-help-center' || location.pathname === '/loopbot') {
    return null;
  }

  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText.trim() : inputVal.trim();
    if (!textToSend || isTyping) return;

    if (typeof customText !== 'string') {
      setInputVal('');
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/loopbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      const data = await res.json();

      if (data && data.success) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.answer || "Here's what I found for you:",
          actionItems: data.actionItems || [],
          suggestedFollowUps: data.suggestedFollowUps || [],
          timestamp: data.timestamp || new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data?.message || 'Failed to fetch LoopBot response');
      }
    } catch (err) {
      console.error('LoopBot Chat Error:', err);
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I'm temporarily having trouble connecting to live marketplace data. You can explore categories directly or try asking again in a moment.",
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Fresh start! How can LoopBot assist you today?`,
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

  const handleActionClick = (link) => {
    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  return (
    <>
      {/* ── Floating Launcher Trigger Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3"
          >
            {/* Pulsing Hint Pill */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              onClick={() => setIsOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/90 text-white text-xs font-bold shadow-xl border border-white/10 backdrop-blur-md cursor-pointer hover:bg-slate-900 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ask LoopBot AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 font-extrabold uppercase">Live</span>
            </motion.div>

            {/* Glowing Bot Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsOpen(true)}
              aria-label="Open LoopBot AI Assistant"
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 p-[2px] shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex items-center justify-center group focus:outline-none"
            >
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-95">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/30 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2.2] group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
              </div>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slide-Up / Expandable Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed z-[999] shadow-2xl bg-white flex flex-col overflow-hidden border border-slate-200/80 font-sans transition-all duration-300 ${
              isExpanded
                ? 'inset-2 sm:inset-6 rounded-3xl'
                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[85vh] rounded-[2rem]'
            }`}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-[2px] shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-tight text-white">LoopBot AI</h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/30 uppercase tracking-wider">
                      Market Copilot
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Marketplace Intelligence • Ready
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Minimize size' : 'Expand size'}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all hidden sm:block"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60 scrollbar-hide">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs">
                        {isBot ? (
                          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            {currentUser?.avatar ? (
                              <img src={currentUser.avatar} alt="Me" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              <UserIcon className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm font-medium ${
                          isBot
                            ? msg.isError
                              ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                            : 'bg-slate-950 text-white rounded-tr-xs shadow-md'
                        }`}
                      >
                        <div className="whitespace-pre-line prose prose-sm max-w-none">
                          {msg.text}
                        </div>

                        {/* Interactive Item Cards returned by LoopBot */}
                        {msg.actionItems && msg.actionItems.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-rose-500" />
                              Matching Live Listings:
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {msg.actionItems.map((item) => (
                                <div
                                  key={item.id || item.link}
                                  onClick={() => handleActionClick(item.link)}
                                  className="group flex items-center justify-between p-2.5 bg-slate-50 hover:bg-rose-50/60 rounded-xl border border-slate-200 hover:border-rose-300 transition-all cursor-pointer shadow-2xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0 border border-slate-200"
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop';
                                      }}
                                    />
                                    <div className="truncate">
                                      <p className="font-bold text-xs text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                                        {item.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                        <span className="font-extrabold text-rose-600">{item.price}</span>
                                        <span>•</span>
                                        <span className="truncate">{item.location}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="shrink-0 ml-2 px-2.5 py-1.5 rounded-lg bg-slate-900 group-hover:bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                                  >
                                    <span>View</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Suggested Follow-ups */}
                    {isBot && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                        {msg.suggestedFollowUps.map((followUp, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(followUp)}
                            className="text-[10px] font-bold px-3 py-1 rounded-full bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95 flex items-center gap-1"
                          >
                            <Zap className="w-2.5 h-2.5 text-amber-500" />
                            {followUp}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-slate-400 text-xs font-semibold ml-9"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>LoopBot is consulting marketplace data…</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starters Drawer if chat is new */}
            {messages.length <= 2 && !isTyping && (
              <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(starter.prompt)}
                    className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-700 transition-all shadow-2xs whitespace-nowrap active:scale-95"
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-slate-100/80 rounded-2xl p-1.5 border border-slate-200 focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500/20 transition-all"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask LoopBot (e.g., room in Polokwane, hire barber)..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-slate-950 text-white transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-2 px-1 text-[9px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Escrow Protected Bookings
                </span>
                <span>Powered by loopOut Neural AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
