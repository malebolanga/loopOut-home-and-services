import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Sparkles, User as UserIcon, 
  Bot, Loader2, Info 
} from 'lucide-react';

export default function AIHelpCenter() {
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${currentUser ? currentUser.username : 'there'}! I'm the Masterpiece Support AI. How can I assist you today?`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const suggestions = [
    "How do I book a service?",
    "What is the verification process?",
    "How does payment work?",
    "Can I cancel a booking?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend) return;

    if (!textOverride) setInputValue('');
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.answer,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later or visit our FAQ page.",
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-inter">
      {/* Premium Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 p-[2px]">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-sm">Masterpiece AI</h1>
                <p className="text-xs text-green-500 font-medium tracking-wide">Online</p>
              </div>
            </div>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-24 pb-32 flex flex-col gap-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.sender === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div 
                  className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gray-900 text-white rounded-tr-sm' 
                      : msg.isError 
                        ? 'bg-red-50 text-red-600 rounded-tl-sm border border-red-100'
                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                  }`}
                >
                  {msg.text}
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-gray-500" />
              </div>
              <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 z-40">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Suggestions - only show if the user hasn't sent many messages */}
          {messages.length < 3 && !isTyping && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide whitespace-nowrap mask-edges">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(null, suggestion)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-end gap-2 bg-white rounded-[1.5rem] p-2 shadow-xl shadow-gray-200/50 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all"
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
              placeholder="Ask anything about Masterpiece..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent outline-none resize-none px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 scrollbar-hide"
              rows={1}
              style={{
                height: 'auto',
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-colors flex-shrink-0 self-end mb-0.5 mr-0.5"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          
          <div className="text-center mt-3">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              AI Support is in Beta • May make mistakes
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}