import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BuildingOfficeIcon, 
  HomeIcon, 
  MapIcon,
  BanknotesIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  TicketIcon
} from "@heroicons/react/24/outline";

export default function Planner() {
  const [intent, setIntent] = useState("rent");
  const [budget, setBudget] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hello! I'm your AI Planner. Tell me your budget and what you're looking for, or ask me any questions about renting, buying, or vacationing!" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Mortgage Calculator State
  const [calcTotal, setCalcTotal] = useState("");
  const [calcInterest, setCalcInterest] = useState("10.5");
  const [calcMonths, setCalcMonths] = useState("240");

  const intents = [
    { id: "rent", label: "Rent a Property", icon: BuildingOfficeIcon, color: "text-blue-500", bg: "bg-blue-50", activeBg: "bg-blue-500" },
    { id: "buy", label: "Buy Property", icon: HomeIcon, color: "text-rose-500", bg: "bg-rose-50", activeBg: "bg-rose-500" },
    { id: "vacation", label: "Plan Vacation", icon: MapIcon, color: "text-emerald-500", bg: "bg-emerald-50", activeBg: "bg-emerald-500" },
    { id: "services", label: "Hire a Service", icon: BriefcaseIcon, color: "text-purple-500", bg: "bg-purple-50", activeBg: "bg-purple-500" },
    { id: "events", label: "Book an Event", icon: TicketIcon, color: "text-orange-500", bg: "bg-orange-50", activeBg: "bg-orange-500" }
  ];

  const suggestedQuestions = [
    "What should I do if I want to buy a property?",
    "What should I check before signing a lease?",
    "Where can I go on vacation with my budget?",
    "How do I book a reliable service professional?",
    "What kind of events can I find on this platform?",
    "Show me affordability for this budget."
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (textOveride = null) => {
    const textToSend = textOveride || inputValue;
    if (!textToSend.trim() && !budget) return;

    let finalPrompt = textToSend;
    if (budget && textToSend === `Plan my ${intent} with budget R${budget}`) {
        finalPrompt = `I have a budget of R${budget} for ${intent}. Please advise me on affordability and what I should consider.`;
    }

    setChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble thinking right now. Please try again." }]);
      }
    } catch (error) {
       setChatHistory(prev => [...prev, { role: 'ai', text: "Network error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentIntentDef = intents.find(i => i.id === intent);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-rose-100/50 flex items-center justify-center mx-auto"
          >
            <SparklesIcon className="w-8 h-8 text-rose-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            AI Property Planner
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Plan your next move, get affordability insights, and step-by-step advice for buying, renting, or vacationing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Set Budget & Intent */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">1. What are your plans?</h2>
              <div className="space-y-3">
                {intents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setIntent(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      intent === item.id 
                        ? `${item.activeBg} text-white shadow-lg shadow-${item.id === 'rent' ? 'blue' : item.id === 'buy' ? 'rose' : 'emerald'}-200` 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">2. Set Your Budget</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-lg">R</span>
                </div>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 rounded-2xl transition-all font-semibold text-lg text-slate-900"
                />
              </div>
              <button 
                onClick={() => handleSendMessage(`Plan my ${intent} with budget R${budget}`)}
                disabled={!budget}
                className="w-full mt-4 bg-slate-900 text-white rounded-2xl py-4 font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Analyze Budget
              </button>
            </div>

            {/* Mortgage Calculator */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Mortgage Calculator</h2>
              <div className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Property Value</label>
                   <div className="relative mt-1">
                     <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold">R</span>
                     <input type="number" value={calcTotal} onChange={(e) => setCalcTotal(e.target.value)} placeholder="e.g. 500000" className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 rounded-xl transition-all font-semibold text-slate-900 outline-none" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Interest (%)</label>
                     <input type="number" step="0.1" value={calcInterest} onChange={(e) => setCalcInterest(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 rounded-xl transition-all mt-1 font-semibold text-slate-900 outline-none" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Months</label>
                     <input type="number" value={calcMonths} onChange={(e) => setCalcMonths(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 rounded-xl transition-all mt-1 font-semibold text-slate-900 outline-none" />
                   </div>
                 </div>
                 
                 {calcTotal && calcInterest && calcMonths && (
                    <div className="p-4 bg-slate-900 rounded-2xl text-white mt-4 flex justify-between items-center shadow-lg shadow-slate-900/20">
                       <span className="text-sm text-slate-400 font-medium">Monthly Pay</span>
                       <span className="text-xl font-black text-rose-400">R{(((Number(calcTotal) * (1 + (Number(calcInterest)/100)))) / Number(calcMonths)).toFixed(2)}</span>
                    </div>
                 )}
              </div>
            </div>

          </div>

          {/* Right Column: AI Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col h-[600px]">
            
            <div className={`p-6 ${currentIntentDef.activeBg} text-white flex items-center gap-4`}>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">AI Advisor</h2>
                <p className="text-white/80 text-sm">Always here to guide you</p>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              <AnimatePresence>
                {chatHistory.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="p-4 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="inline-block px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-sm font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-200"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for advice..."
                  className="flex-1 bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 rounded-xl px-4 py-3 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-rose-500 text-white p-3 rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </form>
            </div>
            
          </div>

        </div>

        {/* Explore Suggestions Section */}
        <div className="pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Explore the Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link to="/smart-search" className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MapIcon className="w-24 h-24 text-rose-500" />
              </div>
              <div>
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                  <MapIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Incredible Places</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Discover top-rated destinations, luxury stays, and hidden gems around the country.</p>
              </div>
            </Link>

            <Link to="/helper-home-page" className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BriefcaseIcon className="w-24 h-24 text-blue-500" />
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                  <BriefcaseIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Verified Helpers</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Hire trusted professionals for tasks, repairs, and daily lifestyle assistance.</p>
              </div>
            </Link>

            <Link to="/service-home-page" className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <SparklesIcon className="w-24 h-24 text-emerald-500" />
              </div>
              <div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Premium Services</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">From private chefs to personal trainers, easily find and book top-tier luxury services.</p>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
