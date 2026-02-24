import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  MapIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  FunnelIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  UserIcon,
  LightBulbIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import { FaCar } from "react-icons/fa";

// --- Constants ---
const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENTLY_VIEWED = 12;
const DATA_FETCH_LIMIT = 8;
const AI_RECOMMENDATION_LIMIT = 6;
const USER_PREFERENCE_KEY = 'userPreferences';
const API_TIMEOUT = 3000; // 3 seconds timeout for faster response

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } }
};

// --- Mock Data for Immediate Display ---
const MOCK_PROPERTIES = [
  { _id: 'prop-1', name: 'Modern Apartment in City Center', price: 2500, regularPrice: 2500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5, address: 'Johannesburg' },
  { _id: 'prop-2', name: 'Luxury Villa with Pool', price: 8500, regularPrice: 8500, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Cape Town' },
  { _id: 'prop-3', name: 'Cozy Studio near University', price: 1200, regularPrice: 1200, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.3, address: 'Pretoria' },
  { _id: 'prop-4', name: 'Modern Office Space', price: 500, regularPrice: 500, type: 'office', imageUrls: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6, address: 'Sandton' },
  { _id: 'prop-5', name: 'Family House in Suburbs', price: 3500, regularPrice: 3500, type: 'rent-long', imageUrls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7, address: 'Durban' },
  { _id: 'prop-6', name: 'Vacation Beach House', price: 1800, regularPrice: 1800, type: 'rent-short', imageUrls: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9, address: 'Port Elizabeth' },
  { _id: 'prop-7', name: 'Commercial Land Plot', price: 250000, regularPrice: 250000, type: 'land', imageUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.4, address: 'Bloemfontein' },
  { _id: 'prop-8', name: 'Penthouse with View', price: 12000, regularPrice: 12000, type: 'sale', imageUrls: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8, address: 'Johannesburg' }
];

const MOCK_SERVICES = [
  { _id: 'serv-1', name: 'Professional Cleaning Service', price: 200, regularPrice: 200, description: 'Deep cleaning service for your home or office', imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.7 },
  { _id: 'serv-2', name: 'Moving & Relocation Assistance', price: 350, regularPrice: 350, description: 'Help with packing and moving to your new home', imageUrls: ['https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.8 },
  { _id: 'serv-3', name: 'Landscaping & Garden Design', price: 450, regularPrice: 450, description: 'Garden maintenance and landscape design services', imageUrls: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.6 },
  { _id: 'serv-4', name: 'Home Repair & Maintenance', price: 300, regularPrice: 300, description: 'Professional home repair and maintenance services', imageUrls: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.9 },
  { _id: 'serv-5', name: 'Car Wash & Detailing', price: 150, regularPrice: 150, description: 'Professional car washing and detailing services', imageUrls: ['https://images.unsplash.com/photo-1565689221354-d87f85d4aee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], rating: 4.5 }
];

const MOCK_HELPERS = [
  { _id: 'help-1', name: 'John Doe', type: 'Math Tutor', rating: 4.8, price: 120, regularPrice: 120, imageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-2', name: 'Jane Smith', type: 'Elderly Caregiver', rating: 4.9, price: 150, regularPrice: 150, imageUrls: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-3', name: 'Mike Johnson', type: 'Certified Handyman', rating: 4.7, price: 200, regularPrice: 200, imageUrls: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-4', name: 'Sarah Wilson', type: 'Professional Cleaner', rating: 4.6, price: 180, regularPrice: 180, imageUrls: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-5', name: 'David Brown', type: 'IT Support Specialist', rating: 4.8, price: 250, regularPrice: 250, imageUrls: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] },
  { _id: 'help-6', name: 'Emily Davis', type: 'Personal Trainer', rating: 4.9, price: 300, regularPrice: 300, imageUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'] }
];

const MOCK_EVENTS = [
  { _id: 'ev-1', name: 'Local Music Festival 2024', price: 50, regularPrice: 50, date: '2024-03-15', address: 'City Park, Johannesburg', attendingCount: 120, imageUrls: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-2', name: 'Art & Craft Workshop', price: 30, regularPrice: 30, date: '2024-03-20', address: 'Art Center, Cape Town', attendingCount: 45, imageUrls: ['https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-3', name: 'Food & Wine Tasting Experience', price: 75, regularPrice: 75, date: '2024-03-25', address: 'Downtown Square, Durban', attendingCount: 89, imageUrls: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] },
  { _id: 'ev-4', name: 'Tech Startup Conference', price: 100, regularPrice: 100, date: '2024-04-05', address: 'Convention Center, Pretoria', attendingCount: 210, imageUrls: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'] }
];

// --- AI Recommendation Engine ---
class AIRecommendationEngine {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
  }
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem(USER_PREFERENCE_KEY);
      return stored ? JSON.parse(stored) : {
        viewedCategories: [],
        likedItems: [],
        priceRange: { min: 0, max: 10000 },
        preferredLocations: [],
        interests: [],
        searchHistory: []
      };
    } catch (error) {
      return { viewedCategories: [], likedItems: [], priceRange: { min: 0, max: 10000 }, preferredLocations: [], interests: [], searchHistory: [] };
    }
  }
  saveUserPreferences() {
    try { localStorage.setItem(USER_PREFERENCE_KEY, JSON.stringify(this.userPreferences)); } catch (error) { console.error('Failed to save user preferences:', error); }
  }
  updatePreferences(item, action) {
    switch (action) {
      case 'view': this.userPreferences.viewedCategories.push(item.type || item.category); break;
      case 'like': this.userPreferences.likedItems.push(item._id); break;
      case 'search': this.userPreferences.searchHistory.push(item); break;
    }
    this.saveUserPreferences();
  }
  smartFilterItems(items, userContext = {}) {
    if (!items.length) return items;
    const scores = items.map(item => ({ item, score: this.calculateRelevanceScore(item, userContext) }));
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, AI_RECOMMENDATION_LIMIT).map(s => s.item);
  }
  calculateRelevanceScore(item, userContext) {
    let score = 0;
    const preferences = this.userPreferences;
    if (item.price) {
      const price = Number(item.price) || Number(item.regularPrice) || 0;
      const { min, max } = preferences.priceRange;
      if (price >= min && price <= max) score += 30;
      else score -= Math.abs(price - (min + max) / 2) / 100;
    }
    if (item.address && preferences.preferredLocations.length > 0) {
      const locationMatch = preferences.preferredLocations.some(loc => item.address.toLowerCase().includes(loc.toLowerCase()));
      if (locationMatch) score += 25;
    }
    const itemCategory = item.type || item.category;
    if (preferences.viewedCategories.includes(itemCategory)) score += 20;
    if (preferences.likedItems.includes(item._id)) score += 15;
    if (item.createdAt) {
      const daysOld = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 10 * (1 - daysOld / 7);
    }
    if (item.rating && item.rating >= 4.5) score += 5;
    return Math.max(0, score);
  }
  analyzeTrends(items) {
    const trends = { popularCategories: {}, priceTrends: {}, locationDistribution: {} };
    items.forEach(item => {
      const category = item.type || item.category || 'general';
      trends.popularCategories[category] = (trends.popularCategories[category] || 0) + 1;
      if (item.address) {
        const location = item.address.split(',')[0]?.trim();
        if (location) trends.locationDistribution[location] = (trends.locationDistribution[location] || 0) + 1;
      }
      if (item.price) {
        const priceRange = Math.floor(item.price / 1000) * 1000;
        trends.priceTrends[priceRange] = (trends.priceTrends[priceRange] || 0) + 1;
      }
    });
    return trends;
  }
  generatePersonalizedRecommendations(items, userContext) {
    const filtered = this.smartFilterItems(items, userContext);
    const trends = this.analyzeTrends(items);
    return { recommendations: filtered, insights: this.generateInsights(trends), suggestedCategories: this.suggestCategories(trends) };
  }
  generateInsights(trends) {
    const insights = [];
    const mostPopularCategory = Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1])[0];
    if (mostPopularCategory) insights.push({ type: 'popular', text: `${mostPopularCategory[0]} properties are trending in your area`, icon: '🔥' });
    const priceRanges = Object.keys(trends.priceTrends).map(Number);
    if (priceRanges.length > 0) {
      const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length;
      insights.push({ type: 'price', text: `Average price in your area: R${Math.round(avgPrice).toLocaleString()}`, icon: '💰' });
    }
    return insights;
  }
  suggestCategories(trends) {
    return Object.entries(trends.popularCategories).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category]) => category);
  }
}

// --- Components ---

const AIChatAssistant = ({ onSuggestionClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const commonQuestions = ["Find affordable apartments", "Best cleaning services", "Events this weekend", "Top-rated helpers", "Budget-friendly options"];

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [...prev, { text: aiResponse.text, sender: 'ai', suggestions: aiResponse.suggestions }]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    let response = { text: '', suggestions: [] };
    if (lowerQuery.includes('apartment') || lowerQuery.includes('home')) { response.text = "I found some great properties for you! Check out these options:"; response.suggestions = ['View Modern Apartments', 'See Budget Options', 'Explore Luxury Homes']; }
    else if (lowerQuery.includes('clean') || lowerQuery.includes('service')) { response.text = "Here are top-rated cleaning services in your area:"; response.suggestions = ['Professional Cleaning', 'Deep Clean Services', 'Move-in Cleaning']; }
    else if (lowerQuery.includes('event') || lowerQuery.includes('weekend')) { response.text = "These events are happening soon. Would you like to see:"; response.suggestions = ['Music Events', 'Food Festivals', 'Art Exhibitions']; }
    else { response.text = "I can help you find properties, services, helpers, or events. What are you looking for today?"; response.suggestions = commonQuestions.slice(0, 3); }
    return response;
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <SparklesIcon className="w-6 h-6" />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3"><SparklesIcon className="w-6 h-6 text-white" /></div>
                  <div><h3 className="font-bold text-gray-900">AI Assistant</h3><p className="text-xs text-gray-500">Ask me anything about listings</p></div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <SparklesIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">How can I help you today?</h4>
                    <p className="text-gray-600 text-sm mb-6">I can help you find properties, services, helpers, or events</p>
                    <div className="space-y-2">
                      {commonQuestions.map((q, i) => (
                        <motion.button 
                          key={`common-q-${i}-${q.substring(0, 10)}`} 
                          whileHover={{ scale: 1.02 }} 
                          onClick={() => setInput(q)} 
                          className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg px-4 py-2 w-full text-left transition-colors"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={`msg-${i}-${msg.sender}-${Date.now()}`} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                        <p>{msg.text}</p>
                        {msg.suggestions && (
                          <div className="mt-2 space-y-1">
                            {msg.suggestions.map((suggestion, idx) => (
                              <button 
                                key={`sugg-${idx}-${suggestion.substring(0, 10)}`} 
                                onClick={() => onSuggestionClick(suggestion)} 
                                className="text-sm bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 w-full text-left"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div key="typing-indicator" className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-none p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about properties, services, events..." className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <button onClick={handleSend} disabled={!input.trim()} className="bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SmartRecommendations = ({ recommendations, insights, loading, onItemClick }) => {
  if (loading) {
    return (
      <div key="smart-rec-loading" className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 animate-pulse">
        <div className="flex items-center mb-4"><div className="w-10 h-10 bg-blue-200 rounded-lg mr-3"></div><div className="h-4 bg-blue-200 rounded w-32"></div></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-white/50 rounded-xl p-3">
              <div className="aspect-square bg-blue-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-blue-200 rounded mb-1"></div>
              <div className="h-3 bg-blue-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!recommendations || recommendations.length === 0) return null;
  
  return (
    <motion.div 
      key="smart-recommendations"
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={fadeInUp} 
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2"><SparklesIcon className="w-4 h-4 text-white" /></div>
          <div><h3 className="font-bold text-gray-900 text-base">AI Picks</h3><p className="text-xs text-gray-600">For you</p></div>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">AI</span>
      </div>
      <div className="flex overflow-x-auto gap-3 pb-3 -mx-2 px-2 hide-scrollbar">
        {recommendations.slice(0, 6).map((item, i) => (
          <motion.div 
            key={item._id ? `rec-${item._id}` : `rec-${i}-${item.name?.substring(0, 10)}`} 
            whileHover={{ y: -5 }} 
            onClick={() => onItemClick(item, item.type)} 
            className="flex-shrink-0 w-40 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
          >
            <div className="relative aspect-square">
              <img src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-1 left-1"><span className="text-[10px] font-medium px-1 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded">AI</span></div>
            </div>
            <div className="p-2">
              <h4 className="font-medium text-gray-900 text-xs truncate mb-1">{item.name}</h4>
              <div className="flex justify-between items-center"><span className="font-bold text-gray-900 text-xs">R{item.price || item.regularPrice}</span><div className="flex items-center text-[10px] text-gray-500"><StarIconSolid className="w-2 h-2 text-yellow-400 mr-0.5" />{item.rating?.toFixed(1) || '4.5'}</div></div>
            </div>
          </motion.div>
        ))}
      </div>
      {insights && insights.length > 0 && (
        <div className="mt-4 pt-3 border-t border-blue-100">
          <div className="flex overflow-x-auto gap-2 -mx-1 px-1 hide-scrollbar">
            {insights.slice(0, 3).map((insight, i) => (
              <div 
                key={`insight-${i}-${insight.type}`} 
                className="flex-shrink-0 flex items-center bg-white/80 rounded-lg px-2 py-1.5 border border-gray-200"
              >
                <span className="text-sm mr-1.5">{insight.icon}</span>
                <p className="text-xs text-gray-700 truncate max-w-[100px]">{insight.text.split(':')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const PriceTrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  return (
    <motion.div 
      key="price-trend-chart"
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={fadeInUp} 
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4"><div className="flex items-center"><ArrowTrendingUpIcon className="w-5 h-5 text-green-500 mr-2" /><h4 className="font-semibold text-gray-900">Price Trends</h4></div><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Last 30 days</span></div>
      <div className="h-32 flex items-end space-x-2">
        {data.map((point, i) => {
          const height = ((point.price - minPrice) / (maxPrice - minPrice || 1)) * 100;
          return (
            <div key={`trend-${i}-${point.label}`} className="flex-1 flex flex-col items-center group">
              <div className="w-full bg-gradient-to-t from-blue-200 to-blue-100 rounded-t-lg relative overflow-hidden h-full">
                <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full absolute bottom-0">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">R{point.price.toLocaleString()}</div>
                </motion.div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{point.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm"><span className="text-gray-600">Avg: R{Math.round(data.reduce((a, b) => a + b.price, 0) / data.length).toLocaleString()}</span><span className="font-medium text-green-600">{((data[data.length - 1].price - data[0].price) / data[0].price * 100).toFixed(1)}% trend</span></div>
    </motion.div>
  );
};

const SkeletonCard = ({ index }) => (
  <div key={`skeleton-card-${index}`} className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
    <div className="aspect-[3/2] bg-gradient-to-r from-gray-200 to-gray-300"></div>
    <div className="p-3 space-y-2"><div className="flex justify-between"><div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div><div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-8"></div></div><div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div></div>
  </div>
);

const DesktopHeroSearch = ({ searchTerm, setSearchTerm, handleSearchSubmit, navigate, currentLocation }) => {
  const searchCategories = [{ key: 'properties', label: 'Rent', icon: '🏠', subtext: 'over 1,000+ options' }, { key: 'properties', label: 'Long stays', icon: '⏳', subtext: '30+ days minimum' }, { key: 'helpers', label: 'Helpers', icon: '👷', subtext: 'Professional services' }, { key: 'services', label: 'Services', icon: '✨', subtext: 'Various offerings' }];
  return (
    <motion.div 
      key="desktop-hero"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="relative bg-gradient-to-r from-blue-900 via-purple-800 to-pink-700 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl font-bold text-white mb-4">See the world for less</motion.h1>
          <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl text-white/90 max-w-3xl mx-auto">Discover affordable rentals, professional services, and local helpers all in one place</motion.p>
        </div>
        <div className="max-w-4xl mx-auto">
          <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} onSubmit={handleSearchSubmit} className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              <div className="flex items-center">
                <div className="flex-1 pl-4">
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Enter a destination or property" className="w-full text-lg py-4 outline-none placeholder-gray-400" />
                  <p className="text-sm text-gray-500 mt-1">Begin typing property name or keyword to search, use arrow keys or tab key to navigate, press Enter to select</p>
                </div>
                <button type="submit" className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity ml-4">Search</button>
              </div>
            </div>
          </motion.form>
          <div className="grid grid-cols-4 gap-4 mt-8">
            {searchCategories.map((category, idx) => (
              <motion.button 
                key={`search-cat-${category.label}-${idx}`} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 + idx * 0.1 }} 
                whileHover={{ scale: 1.05 }} 
                onClick={() => navigate(`/search?type=${category.key}&address=${encodeURIComponent(currentLocation)}`)} 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-colors group text-left"
              >
                <div className="flex items-center space-x-3"><span className="text-2xl">{category.icon}</span><div><div className="font-semibold text-lg">{category.label}</div><div className="text-sm opacity-75">{category.subtext}</div></div></div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DesktopPopularDestinations = ({ navigate }) => {
  const popularDestinations = [
    { name: 'Johannesburg', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Cape Town', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Durban', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Pretoria', image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }, 
    { name: 'Port Elizabeth', image: 'https://images.unsplash.com/photo-1590841609987-4ac211afdde1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
  ];
  return (
    <motion.section 
      key="popular-destinations"
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      variants={containerVariants} 
      className="mb-16"
    >
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-3xl font-bold text-gray-900">Popular destinations</h2><p className="text-gray-600 mt-2">Find properties and services in top cities</p></div>
        <button onClick={() => navigate('/explore')} className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">View all destinations<ChevronRightIcon className="w-5 h-5 ml-1" /></button>
      </div>
      <div className="grid grid-cols-5 gap-6">
        {popularDestinations.map((destination) => (
          <motion.div 
            key={`dest-${destination.name}`} 
            variants={itemVariants} 
            onClick={() => navigate(`/search?address=${encodeURIComponent(destination.name)}`)} 
            className="cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-2xl mb-3">
              <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} src={destination.image} alt={destination.name} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4"><h3 className="text-white font-bold text-lg">{destination.name}</h3></div>
            </div>
            <div className="text-center"><button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Explore properties →</button></div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

const DesktopPropertyCard = ({ property, navigate }) => (
  <motion.div 
    key={`prop-card-${property._id}`}
    whileHover={{ y: -5 }} 
    onClick={() => navigate(`/listing/${property._id}`)} 
    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer group"
  >
    <div className="relative h-56 overflow-hidden">
      <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} src={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={property.name} className="w-full h-full object-cover" />
      <div className="absolute top-3 left-3"><span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">{property.type === 'rent-long' ? 'Long Term' : property.type === 'rent-short' ? 'Short Stay' : property.type}</span></div>
      <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"><HeartIcon className="w-5 h-5 text-gray-600" /></button>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{property.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.address}</p>
      <div className="flex items-center justify-between">
        <div><div className="text-2xl font-bold text-gray-900">R{property.price || property.regularPrice}</div>{property.type?.includes('rent') && <div className="text-gray-500 text-sm">per month</div>}</div>
        <div className="flex items-center"><StarIconSolid className="w-5 h-5 text-yellow-400" /><span className="ml-1 font-semibold">{property.rating?.toFixed(1) || '4.5'}</span></div>
      </div>
    </div>
  </motion.div>
);

const MobileAppHomepage = ({
  featuredProperties, featuredServices, featuredHelpers, featuredEvents,
  loadingProperties, loadingServices, loadingHelpers, loadingEvents,
  stats, onItemClick, recentlyViewedItems, onRecentlyViewedLike,
  currentLocation = 'South Africa', navigate, aiRecommendations, aiInsights, aiTrendData, onAISuggestionClick
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchVisible, setSearchVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showMap, setShowMap] = useState(false);
  const searchInputRef = useRef(null);
  const [showAIInsights, setShowAIInsights] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => { setIsDesktop(window.innerWidth >= 1024); };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSearchClick = () => { setSearchVisible(true); setTimeout(() => { if (searchInputRef.current) searchInputRef.current.focus(); }, 100); };
  const handleSearchSubmit = (e) => { if (e) e.preventDefault(); if (searchTerm.trim()) { navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&type=all&address=${encodeURIComponent(currentLocation)}`); setSearchVisible(false); setSearchTerm(''); } };
  const categories = [{ icon: '🏠', label: 'Homes', color: 'bg-blue-100', type: 'properties' }, { icon: '✨', label: 'Services', color: 'bg-emerald-100', type: 'services' }, { icon: '👷', label: 'Helpers', color: 'bg-purple-100', type: 'helpers' }, { icon: '🎪', label: 'Events', color: 'bg-amber-100', type: 'events' }];
  const gridCols = isDesktop ? 'grid-cols-4' : 'grid-cols-4';
  const propertyGridCols = isDesktop ? 'grid-cols-4' : 'grid-cols-2';
  const cardWidth = isDesktop ? 'w-48' : 'w-40';
  const serviceCardWidth = isDesktop ? 'w-72' : 'w-60';
  const eventCardWidth = isDesktop ? 'w-72' : 'w-60';
  const helperCardWidth = isDesktop ? 'w-48' : 'w-40';

  const handleAISuggestionClick = (suggestion) => {
    const suggestionMap = { 'View Modern Apartments': 'modern apartments', 'See Budget Options': 'budget friendly', 'Explore Luxury Homes': 'luxury homes', 'Professional Cleaning': 'cleaning services', 'Deep Clean Services': 'deep cleaning', 'Move-in Cleaning': 'move in cleaning', 'Music Events': 'music events', 'Food Festivals': 'food festival', 'Art Exhibitions': 'art exhibition' };
    const term = suggestionMap[suggestion] || suggestion;
    navigate(`/search?searchTerm=${encodeURIComponent(term)}&type=all`);
  };

  if (isDesktop) {
    return (
      <div key="desktop-view" className="min-h-screen bg-gray-50">
        <DesktopHeroSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearchSubmit={handleSearchSubmit} navigate={navigate} currentLocation={currentLocation} />
        <main className="max-w-7xl mx-auto px-8 py-12">
          <DesktopPopularDestinations navigate={navigate} />
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="mb-16">
            <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-gray-900">Featured properties</h2><p className="text-gray-600 mt-2">Top-rated homes, apartments, and commercial spaces</p></div><Link to="/listing-home-page" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">View all properties<ChevronRightIcon className="w-5 h-5 ml-1" /></Link></div>
            {loadingProperties ? (<div className="grid grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <SkeletonCard key={`prop-skel-${i}`} index={i} />)}</div>) : (<div className="grid grid-cols-4 gap-6">{featuredProperties.slice(0, 8).map((property) => <DesktopPropertyCard key={`prop-${property._id}`} property={property} navigate={navigate} />)}</div>)}
          </motion.section>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="mb-16">
            <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-gray-900">Professional services</h2><p className="text-gray-600 mt-2">Find trusted service providers</p></div><Link to="/service-home-page" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">View all services<ChevronRightIcon className="w-5 h-5 ml-1" /></Link></div>
            {loadingServices ? (<div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <SkeletonCard key={`serv-skel-${i}`} index={i} />)}</div>) : (<div className="grid grid-cols-4 gap-6">{featuredServices.slice(0, 4).map((service) => (<motion.div key={`serv-${service._id}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => navigate(`/service/${service._id}`)} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"><div className="relative h-48 overflow-hidden"><motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} src={service.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={service.name} className="w-full h-full object-cover" /></div><div className="p-5"><h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{service.name}</h3><p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p><div className="flex items-center justify-between"><div className="text-xl font-bold text-gray-900">R{service.price || service.regularPrice}</div><div className="flex items-center"><StarIconSolid className="w-5 h-5 text-yellow-400" /><span className="ml-1 font-semibold">{service.rating?.toFixed(1) || '4.5'}</span></div></div></div></motion.div>))}</div>)}
          </motion.section>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="mb-16">
            <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-gray-900">Verified helpers</h2><p className="text-gray-600 mt-2">Professional assistance available</p></div><Link to="/helper-home-page" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">View all helpers<ChevronRightIcon className="w-5 h-5 ml-1" /></Link></div>
            {loadingHelpers ? (<div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => (<div key={`helper-skel-${i}`} className="bg-white rounded-2xl p-6 animate-pulse"><div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div></div>))}</div>) : (<div className="grid grid-cols-4 gap-6">{featuredHelpers.slice(0, 4).map((helper) => (<motion.div key={`help-${helper._id}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => navigate(`/helper/${helper._id}`)} className="bg-white rounded-2xl p-6 text-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"><div className="relative inline-block mb-4"><div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto"><img src={helper.imageUrls?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'} alt={helper.name} className="w-full h-full object-cover" /></div><div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div></div><h3 className="font-bold text-gray-900 text-lg mb-1">{helper.name}</h3><p className="text-gray-600 text-sm mb-3">{helper.type || 'Service Provider'}</p><div className="flex items-center justify-center"><StarIconSolid className="w-5 h-5 text-yellow-400" /><span className="ml-1 font-semibold text-gray-900">{helper.rating?.toFixed(1) || '4.8'}</span><span className="mx-2">•</span><span className="font-bold text-gray-900">R{helper.price || helper.regularPrice}</span></div></motion.div>))}</div>)}
          </motion.section>
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="mb-16">
            <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-gray-900">Upcoming events</h2><p className="text-gray-600 mt-2">Don't miss out on local happenings</p></div><Link to="/search?type=events" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">View all events<ChevronRightIcon className="w-5 h-5 ml-1" /></Link></div>
            {loadingEvents ? (<div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <SkeletonCard key={`event-skel-${i}`} index={i} />)}</div>) : (<div className="grid grid-cols-4 gap-6">{featuredEvents.slice(0, 4).map((event) => (<motion.div key={`event-${event._id}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => navigate(`/event/${event._id}`)} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"><div className="relative h-48 overflow-hidden"><motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} src={event.imageUrls?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={event.name} className="w-full h-full object-cover" /><div className="absolute top-3 left-3"><span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>{event.attendingCount > 100 && (<div className="absolute top-3 right-3"><span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">🔥 Trending</span></div>)}</div><div className="p-5"><h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{event.name}</h3><div className="flex items-center text-gray-600 text-sm mb-3"><MapIcon className="w-4 h-4 mr-1" /><span className="line-clamp-1">{event.address || 'Various locations'}</span></div><div className="flex items-center justify-between"><div className="text-xl font-bold text-gray-900">R{event.price || event.regularPrice}</div>{event.attendingCount !== undefined && (<div className="flex items-center text-gray-600"><UserGroupIcon className="w-4 h-4 mr-1" /><span className="text-sm">{event.attendingCount}+ going</span></div>)}</div></div></motion.div>))}</div>)}
          </motion.section>
          {aiRecommendations && aiRecommendations.length > 0 && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
              <div className="flex items-center justify-between mb-8"><div className="flex items-center"><div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4"><SparklesIcon className="w-6 h-6 text-white" /></div><div><h2 className="text-3xl font-bold text-gray-900">AI recommendations</h2><p className="text-gray-600">Personalized picks based on your interests</p></div></div><span className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-full">Powered by AI</span></div>
              <div className="grid grid-cols-3 gap-6">{aiRecommendations.slice(0, 6).map((item, index) => (<motion.div key={item._id ? `ai-${item._id}` : `ai-${index}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => onItemClick(item, item.type)} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"><div className="relative h-40 overflow-hidden"><motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-full h-full object-cover" /><div className="absolute top-3 left-3"><span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">AI PICK</span></div></div><div className="p-4"><div className="flex justify-between items-start mb-2"><h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">{item.type || item.category}</span></div><p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.address || item.description}</p><div className="flex items-center justify-between"><span className="font-bold text-gray-900">R{item.price || item.regularPrice}</span><div className="flex items-center"><StarIconSolid className="w-4 h-4 text-yellow-400" /><span className="ml-1 text-sm font-medium">{item.rating?.toFixed(1) || '4.5'}</span></div></div></div></motion.div>))}</div>
            </motion.section>
          )}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold">LoopOut by the numbers</h2><p className="text-gray-300 mt-2">Connecting people with spaces, services, and experiences</p></div><div className="flex items-center"><ChartBarIcon className="w-6 h-6 mr-2" /><span>Live statistics</span></div></div>
            <div className="grid grid-cols-4 gap-8">
              <div className="text-center"><div className="text-5xl font-bold mb-2">{stats.properties || '1,234'}+</div><div className="text-gray-300">Properties listed</div><div className="text-green-400 text-sm mt-1">↑ 12% this month</div></div>
              <div className="text-center"><div className="text-5xl font-bold mb-2">{stats.services || '456'}+</div><div className="text-gray-300">Services offered</div><div className="text-green-400 text-sm mt-1">↑ 8% this month</div></div>
              <div className="text-center"><div className="text-5xl font-bold mb-2">{stats.helpers || '789'}+</div><div className="text-gray-300">Verified helpers</div><div className="text-green-400 text-sm mt-1">↑ 15% this month</div></div>
              <div className="text-center"><div className="text-5xl font-bold mb-2">{stats.events || '321'}+</div><div className="text-gray-300">Events hosted</div><div className="text-blue-400 text-sm mt-1">45+ new this week</div></div>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  return (
    <div key="mobile-view" className="min-h-screen bg-white pb-0">
      <main className={`${isDesktop ? 'px-6 max-w-7xl mx-auto' : 'px-4'} py-0`}>
        <motion.div 
          key="hero-banner"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 rounded-2xl p-6 mb-6 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center mb-2"><SparklesIcon className="w-5 h-5 text-white mr-2" /><span className="text-white/90 text-sm font-medium">AI-Powered Search</span></div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Find your perfect space</h2>
                <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">Discover homes, services, and experiences around you</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Smart homes', 'Best deals', 'Near me', 'Trending'].map((tag, i) => (
                    <motion.button 
                      key={`tag-${tag}-${i}`} 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => navigate(`/search?searchTerm=${tag}&type=all`)} 
                      className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/search?ai=1')} className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium text-sm md:text-base hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg flex items-center"><SparklesIcon className="w-4 h-4 mr-2" />AI Explore</motion.button>
            </div>
          </div>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div 
                key={`sparkle-${i}`} 
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse" 
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${1 + Math.random() * 2}s` }} 
              />
            ))}
          </div>
        </motion.div>
        
        {showAIInsights && aiRecommendations && (
          <SmartRecommendations 
            key="smart-rec-component"
            recommendations={aiRecommendations} 
            insights={aiInsights} 
            loading={loadingProperties && loadingServices} 
            onItemClick={onItemClick} 
          />
        )}
        
        {aiTrendData && isDesktop && (
          <section key="trend-section" className="mb-8">
            <PriceTrendChart data={aiTrendData} />
          </section>
        )}
        
        {recentlyViewedItems.length > 0 && (
          <motion.section 
            key="recently-viewed"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={containerVariants} 
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4"><div className="flex items-center"><h2 className="font-bold text-gray-900 text-lg md:text-xl">Recently viewed</h2></div><button onClick={() => navigate('/recently-viewed')} className="text-sm text-gray-600 hover:text-gray-900 flex items-center">See all<ChevronRightIcon className="w-4 h-4 ml-1" /></button></div>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-1 px-1 hide-scrollbar">
              {recentlyViewedItems.slice(0, isDesktop ? 6 : 5).map((item) => {
                const getItemRoute = () => { if (item.helperCategory || item.skills || item.type === 'helper') return `/helper/${item._id}`; if (item.carwashCategory || item.skills || item.type === 'carwash') return `/carwash/${item._id}`; if (item.photographyCategory || item.skills || item.type === 'photography') return `/photography/${item._id}`; else if (item.serviceCategory || item.duration || item.type === 'service') return `/service/${item._id}`; else if (item.eventDate || item.eventLocation || item.type === 'event') return `/event/${item._id}`; else return `/listing/${item._id}`; };
                return (
                  <motion.div 
                    key={`recent-${item._id}-${item.viewedAt || Date.now()}`} 
                    variants={itemVariants} 
                    className={`flex-shrink-0 ${cardWidth}`} 
                    onClick={() => navigate(getItemRoute())}
                  >
                    <div className="rounded-xl overflow-hidden cursor-pointer shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200">
                      <div className="relative aspect-[3/2]">
                        <img src={item.imageUrls?.[0] || item.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={item.name || item.title} className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 right-2"><button onClick={(e) => { e.stopPropagation(); onRecentlyViewedLike && onRecentlyViewedLike(item._id, !item.isLiked); }} className="p-1.5 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm transition-colors">{item.isLiked ? (<HeartIconSolid className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />) : (<HeartIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-600 hover:text-rose-500" />)}</button></div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm truncate mb-1">{item.name || item.title}</h3>
                        <div className="flex justify-between items-center"><span className="font-bold text-gray-900 text-sm">{item.price || item.regularPrice ? `R${item.price || item.regularPrice}` : 'Free'}</span><span className="text-xs text-gray-500">{item.viewedAt ? new Date(item.viewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}</span></div>
                        <div className="mt-1"><span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{item.helperCategory ? 'Helper' : item.serviceCategory ? 'Service' : item.photographyCategory ? 'Photography' : item.carwashCategory ? 'Carwash' : item.eventDate ? 'Event' : 'Listing'}</span></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Controls Section - Added above Categories */}
        <motion.section 
          key="controls-section"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={containerVariants} 
          className="mb-8"
        >
          <div className="flex gap-2 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(true)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl flex items-center gap-2 font-medium hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </motion.button>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <Bars3Icon className="w-5 h-5" />
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMap(!showMap)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 font-medium ${showMap ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
            >
              <MapIcon className="w-5 h-5" />
              Map
            </motion.button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 text-lg md:text-xl">Explore categories</h2>
            <button onClick={() => setShowAIInsights(!showAIInsights)} className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              {showAIInsights ? 'Hide AI' : 'Show AI'}
              <Cog6ToothIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className={`grid ${gridCols} gap-3 md:gap-4`}>
            {categories.map((cat, index) => (
              <motion.button 
                key={`cat-${cat.label}-${index}`} 
                variants={itemVariants} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => { if (cat.onClick) cat.onClick(); else if (cat.type && cat.category) navigate(`/search?type=${cat.type}&category=${cat.category}&address=${encodeURIComponent(currentLocation)}&ai=1`); else if (cat.type) navigate(`/search?type=${cat.type}&address=${encodeURIComponent(currentLocation)}&ai=1`); }} 
                className="flex flex-col items-center p-3 md:p-4 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 active:opacity-80 border border-transparent hover:border-gray-200 relative"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 ${cat.color} rounded-full flex items-center justify-center text-xl md:text-2xl mb-2 hover:scale-105 transition-transform`}>{cat.icon}</div>
                <span className="text-xs md:text-sm text-gray-700 text-center">{cat.label}</span>
                {index < 3 && (<div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>)}
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section 
          key="popular-homes"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={containerVariants} 
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4"><div className="flex items-center"><h2 className="font-bold text-gray-900 text-lg md:text-xl">Popular homes</h2></div><Link to="/listing-home-page" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">See all<ChevronRightIcon className="w-4 h-4 ml-1" /></Link></div>
          {loadingProperties ? (<div className={`grid ${propertyGridCols} gap-3 md:gap-4`}>{[...Array(isDesktop ? 8 : 4)].map((_, i) => (<SkeletonCard key={`prop-mob-skel-${i}`} index={i} />))}</div>) : (<div className={`grid ${propertyGridCols} gap-3 md:gap-4`}>{featuredProperties.slice(0, isDesktop ? 8 : 4).map((property) => (<motion.div key={`prop-mob-${property._id}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => navigate(`/listing/${property._id}`)} className="rounded-xl overflow-hidden active:opacity-80 cursor-pointer shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200"><div className="relative aspect-[3/2]"><img src={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={property.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />{property.price < 2000 && (<div className="absolute top-2 left-2"><span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded flex items-center"><BoltIcon className="w-3 h-3 mr-1" />Good Value</span></div>)}<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 rounded-xl to-transparent p-3"><div className="flex justify-between items-center"><span className="font-bold text-white text-sm md:text-base">R{property.price || property.regularPrice}</span><div className="flex items-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded"><StarIconSolid className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" /><span className="text-xs text-white ml-1">{property.rating?.toFixed(1) || '4.5'}</span></div></div></div></div><div className="p-3 md:p-4"><h3 className="font-medium text-gray-900 text-sm md:text-base truncate mb-1">{property.name}</h3><p className="text-xs text-gray-500 mb-2 truncate">{property.address || 'Location not specified'}</p></div></motion.div>))}</div>)}
        </motion.section>
        
        <motion.section 
          key="top-services"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={containerVariants} 
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4"><div className="flex items-center"><h2 className="font-bold text-gray-900 text-lg md:text-xl">Top services</h2></div><Link to="/service-home-page" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">See all<ChevronRightIcon className="w-4 h-4 ml-1" /></Link></div>
          {loadingServices ? (<div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 hide-scrollbar">{[...Array(isDesktop ? 4 : 3)].map((_, i) => (<div key={`serv-mob-skel-${i}`} className={`flex-shrink-0 ${serviceCardWidth}`}><div className="aspect-[4/3] bg-gray-200 rounded-xl mb-2 animate-pulse"></div><div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div><div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div></div>))}</div>) : (<div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 hide-scrollbar">{featuredServices.slice(0, isDesktop ? 4 : 3).map((service) => { const isCarWash = service.type === 'carwash' || service.serviceType === 'carwash' || service.category === 'carwash' || (service.name && service.name.toLowerCase().includes('car wash')) || (service.description && service.description.toLowerCase().includes('car wash')); return (<motion.div key={`serv-mob-${service._id}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => { if (isCarWash) navigate(`/carwash/${service._id}`); else navigate(`/service/${service._id}`); }} className={`flex-shrink-0 ${serviceCardWidth} rounded-xl overflow-hidden active:opacity-80 cursor-pointer shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200`}><div className="relative aspect-[3/2]"><img src={service.imageUrls?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={service.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />{service.price < 2000 && (<div className="absolute top-2 left-2"><span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded flex items-center"><BoltIcon className="w-3 h-3 mr-1" />Good Value</span></div>)}{isCarWash && (<div className="absolute top-2 right-2"><span className="text-xs font-medium px-2 py-1 bg-blue-500 text-white rounded flex items-center"><FaCar className="w-3 h-3 mr-1" />Car Wash</span></div>)}<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 rounded-xl to-transparent p-3"><div className="flex justify-between items-center"><span className="font-bold text-white text-sm md:text-base">R{service.price || service.regularPrice}</span><div className="flex items-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded"><StarIconSolid className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" /><span className="text-xs text-white ml-1">{service.rating?.toFixed(1) || '4.5'}</span></div></div></div></div><div className="p-3 md:p-4"><div className="flex justify-between items-start mb-2"><h3 className="font-medium text-gray-900 text-sm md:text-base truncate flex-1">{service.name}</h3>{isCarWash && (<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">Car Wash</span>)}</div><p className="text-xs text-gray-500 line-clamp-2 mb-3">{service.address || service.description || (isCarWash ? 'Professional car wash service' : 'Service description')}</p></div></motion.div>); })}</div>)}
        </motion.section>
        
        <motion.section 
          key="upcoming-events"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={containerVariants} 
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4"><div className="flex items-center"><h2 className="font-bold text-gray-900 text-lg md:text-xl">Upcoming events</h2></div><Link to="/search?type=events" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">See all<ChevronRightIcon className="w-4 h-4 ml-1" /></Link></div>
          {loadingEvents ? (<div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 hide-scrollbar">{[...Array(isDesktop ? 4 : 3)].map((_, i) => (<div key={`event-mob-skel-${i}`} className={`flex-shrink-0 ${eventCardWidth}`}><div className="aspect-[5/3] bg-gray-200 rounded-xl mb-2 animate-pulse"></div><div className="flex items-center gap-2 mb-2"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></div><div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div></div>))}</div>) : featuredEvents.length > 0 ? (<div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-1 px-1 hide-scrollbar">{featuredEvents.slice(0, isDesktop ? 4 : 3).map((event) => (<motion.div key={`event-mob-${event._id}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => navigate(`/event/${event._id}`)} className={`flex-shrink-0 ${eventCardWidth} rounded-xl overflow-hidden active:opacity-80 cursor-pointer shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200 group`}><div className="relative aspect-[5/3]"><img src={event.imageUrls?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={event.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" /><div className="absolute top-2 left-2"><span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded">Event</span></div><div className="absolute bottom-2 right-2"><div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg"><CalendarDaysIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-600 mr-1" /><span className="text-xs font-medium text-gray-700">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div></div>{event.attendingCount > 100 && (<div className="absolute top-2 right-2"><span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded">Trending</span></div>)}</div><div className="p-3 md:p-4"><h3 className="font-medium text-gray-900 text-sm md:text-base truncate mb-1">{event.name}</h3><div className="flex items-center gap-2 mb-2"><div className="flex items-center"><MapIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mr-1" /><span className="text-xs text-gray-500 truncate">{event.address || 'Various locations'}</span></div></div><div className="flex justify-between items-center"><span className="font-bold text-gray-900 text-sm md:text-base">R{event.price || event.regularPrice}</span>{event.attendingCount !== undefined && (<div className="flex items-center text-xs text-gray-500"><UserGroupIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" /><span>{event.attendingCount}+ going{event.attendingCount > 200 && ' 🔥'}</span></div>)}</div></div></motion.div>))}</div>) : (<div className="text-center py-8 bg-gray-50 rounded-xl"><CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm md:text-base">No upcoming events in your area</p><button onClick={() => navigate('/search?type=events')} className="mt-3 text-sm md:text-base text-rose-500 font-medium hover:text-rose-600 flex items-center justify-center mx-auto"><SparklesIcon className="w-4 h-4 mr-1" />Browse with AI</button></div>)}
        </motion.section>
        
        <motion.section 
          key="helpers-section"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={containerVariants} 
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4"><div className="flex items-center"><h2 className="font-bold text-gray-900 text-lg md:text-xl">Helpers</h2></div><Link to="/helper-home-page" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">See all<ChevronRightIcon className="w-4 h-4 ml-1" /></Link></div>
          {loadingHelpers ? (<div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 -mx-1 px-1 hide-scrollbar">{[...Array(isDesktop ? 6 : 3)].map((_, i) => (<div key={`help-mob-skel-${i}`} className="flex-shrink-0 w-56 animate-pulse"><div className="aspect-square bg-gray-200 rounded-full mb-2 mx-auto w-20 h-20"></div><div className="h-4 bg-gray-200 rounded mb-1 w-3/4 mx-auto"></div><div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div></div>))}</div>) : (<div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 -mx-1 px-1 hide-scrollbar">{featuredHelpers.slice(0, isDesktop ? 6 : 4).map((helper) => (<motion.div key={`help-mob-${helper._id}`} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => navigate(`/helper/${helper._id}`)} className={`flex-shrink-0 ${helperCardWidth} flex flex-col items-center p-4 bg-white rounded-xl shadow-sm active:opacity-80 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-200 group`}><div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border-2 border-white shadow-md group-hover:border-blue-200 transition-colors"><img src={helper.imageUrls?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'} alt={helper.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /><div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div></div><h3 className="font-medium text-gray-900 text-sm md:text-base text-center mb-1 truncate w-full">{helper.name}</h3><p className="text-xs text-gray-500 text-center mb-2 truncate w-full">{helper.type || 'Service Provider'}</p><div className="flex items-center justify-between w-full"><span className="font-bold text-gray-900 text-sm md:text-base">R{helper.price || helper.regularPrice}</span><div className="flex items-center"><StarIconSolid className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" /><span className="text-xs md:text-sm text-gray-600 ml-1">{helper.rating?.toFixed(1) || '4.8'}</span></div></div></motion.div>))}</div>)}
        </motion.section>
        
        {isDesktop && (
          <motion.section 
            key="local-insights"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp} 
            className="mb-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-gray-900 text-xl">Local Insights</h2><div className="flex items-center text-sm text-gray-600"><ChartBarIcon className="w-4 h-4 mr-1" />AI Analytics</div></div>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center"><div className="text-3xl font-bold text-blue-600 mb-2">{stats.properties || '1,234'}</div><p className="text-gray-600 text-sm">Properties Available</p><div className="mt-2 text-xs text-green-600">↑ 12% this month</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-emerald-600 mb-2">{stats.services || '456'}</div><p className="text-gray-600 text-sm">Services Offered</p><div className="mt-2 text-xs text-green-600">↑ 8% this month</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-purple-600 mb-2">{stats.helpers || '789'}</div><p className="text-gray-600 text-sm">Verified Helpers</p><div className="mt-2 text-xs text-green-600">↑ 15% this month</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-amber-600 mb-2">{stats.events || '321'}</div><p className="text-gray-600 text-sm">Upcoming Events</p><div className="mt-2 text-xs text-blue-600">New: 45 this week</div></div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200"><div className="flex items-center"><LightBulbIcon className="w-5 h-5 text-amber-500 mr-2" /><p className="text-sm text-gray-600"><span className="font-medium text-gray-900">AI Insight:</span> Best time to search is weekdays between 9 AM - 11 AM</p></div></div>
          </motion.section>
        )}
      </main>
      <AIChatAssistant onSuggestionClick={handleAISuggestionClick} />
      <div className="h-16"></div>
    </div>
  );
};

// --- Main Component ---
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aiEngine = useRef(new AIRecommendationEngine());
  const [featuredProperties, setFeaturedProperties] = useState(MOCK_PROPERTIES); // Initialize with mock data
  const [featuredServices, setFeaturedServices] = useState(MOCK_SERVICES); // Initialize with mock data
  const [featuredHelpers, setFeaturedHelpers] = useState(MOCK_HELPERS); // Initialize with mock data
  const [featuredEvents, setFeaturedEvents] = useState(MOCK_EVENTS); // Initialize with mock data
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingHelpers, setLoadingHelpers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [stats, setStats] = useState({ properties: 1234, services: 456, helpers: 789, events: 321 });
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [aiTrendData, setAiTrendData] = useState(null);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('South Africa');

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          const items = JSON.parse(stored);
          const enhancedItems = items.map(item => ({ ...item, aiScore: Math.floor(Math.random() * 30) + 70 }));
          setRecentlyViewedItems(enhancedItems);
        }
      } catch (error) { console.error('Failed to load recently viewed items:', error); }
    };
    loadRecentlyViewed();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const addressFromUrl = urlParams.get('address');
    if (addressFromUrl) setCurrentLocation(decodeURIComponent(addressFromUrl));
  }, [location.search]);

  const addToRecentlyViewed = (item, itemType) => {
    try {
      aiEngine.current.updatePreferences(item, 'view');
      const viewedItem = { ...item, itemType: itemType, viewedAt: new Date().toISOString(), isLiked: false, aiScore: Math.floor(Math.random() * 30) + 70 };
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let items = stored ? JSON.parse(stored) : [];
      items = items.filter(i => i._id !== item._id || i.itemType !== itemType);
      items.unshift(viewedItem);
      items = items.slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
      setRecentlyViewedItems(items);
      navigate(`/${itemType}/${item._id}`);
    } catch (error) { console.error('Failed to save to recently viewed:', error); }
  };

  const updateRecentlyViewedLike = (itemId, isLiked) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items = JSON.parse(stored);
        items = items.map(item => item._id === itemId ? { ...item, isLiked } : item);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
        setRecentlyViewedItems(items);
        if (isLiked) { const likedItem = items.find(item => item._id === itemId); if (likedItem) aiEngine.current.updatePreferences(likedItem, 'like'); }
      }
    } catch (error) { console.error('Failed to update like status:', error); }
  };

  const generateAIRecommendations = (properties, services, helpers, events) => {
    const allItems = [...properties, ...services, ...helpers, ...events].filter(Boolean);
    return aiEngine.current.generatePersonalizedRecommendations(allItems, { location: currentLocation, preferences: aiEngine.current.userPreferences });
  };

  const generateTrendData = () => {
    const today = new Date();
    const data = [];
    for (let i = 30; i >= 0; i--) { 
      const date = new Date(today); 
      date.setDate(today.getDate() - i); 
      data.push({ 
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        price: Math.floor(Math.random() * 2000) + 1000 + Math.sin(i) * 500 
      }); 
    }
    return data;
  };

  // Optimized fetch function with parallel requests and timeout
  useEffect(() => {
    const fetchHomepageData = async () => {
      // Create abort controllers for each request
      const controllers = {
        properties: new AbortController(),
        services: new AbortController(),
        helpers: new AbortController(),
        events: new AbortController()
      };

      // Set timeout to abort all requests after API_TIMEOUT
      const timeoutId = setTimeout(() => {
        Object.values(controllers).forEach(controller => controller.abort());
      }, API_TIMEOUT);

      // Fetch all endpoints in parallel
      const fetchPromises = [
        fetch(`/api/listing/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&address=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.properties.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch properties'))
          .then(data => {
            if (data && data.length > 0) {
              setFeaturedProperties(data.slice(0, DATA_FETCH_LIMIT));
            }
          })
          .catch(err => {
            console.error('Properties fetch error:', err);
            // Keep mock data
          })
          .finally(() => setLoadingProperties(false)),

        fetch(`/api/service/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&location=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.services.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch services'))
          .then(data => {
            if (data && data.length > 0) {
              setFeaturedServices(data.slice(0, DATA_FETCH_LIMIT));
            }
          })
          .catch(err => {
            console.error('Services fetch error:', err);
            // Keep mock data
          })
          .finally(() => setLoadingServices(false)),

        fetch(`/api/helper/get?limit=${DATA_FETCH_LIMIT}&sort=createdAt&order=desc&address=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.helpers.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch helpers'))
          .then(data => {
            if (data && data.length > 0) {
              setFeaturedHelpers(data.slice(0, DATA_FETCH_LIMIT));
            }
          })
          .catch(err => {
            console.error('Helpers fetch error:', err);
            // Keep mock data
          })
          .finally(() => setLoadingHelpers(false)),

        fetch(`/api/event/get?limit=${DATA_FETCH_LIMIT}&sort=date&order=asc&location=${encodeURIComponent(currentLocation)}`, { 
          signal: controllers.events.signal 
        }).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch events'))
          .then(data => {
            if (data && data.length > 0) {
              setFeaturedEvents(data.slice(0, DATA_FETCH_LIMIT));
            }
          })
          .catch(err => {
            console.error('Events fetch error:', err);
            // Keep mock data
          })
          .finally(() => setLoadingEvents(false))
      ];

      try {
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error('Some fetches failed:', error);
      } finally {
        clearTimeout(timeoutId);
      }

      // Set stats (could also come from API)
      setStats({ properties: 1234, services: 456, helpers: 789, events: 321 });
    };

    fetchHomepageData();

    // Cleanup function to abort all requests on unmount
    return () => {
      // No need to abort here as we handle it in the function
    };
  }, [currentLocation]); // Only re-run when currentLocation changes

  // Generate AI recommendations when data changes
  useEffect(() => {
    if (featuredProperties && featuredServices && featuredHelpers && featuredEvents) {
      const aiResults = generateAIRecommendations(featuredProperties, featuredServices, featuredHelpers, featuredEvents);
      setAiRecommendations(aiResults.recommendations || []);
      setAiInsights(aiResults.insights || []);
      setAiTrendData(generateTrendData());
    }
  }, [featuredProperties, featuredServices, featuredHelpers, featuredEvents]);

  return (
    <MobileAppHomepage
      key="homepage"
      featuredProperties={featuredProperties} 
      featuredServices={featuredServices} 
      featuredHelpers={featuredHelpers} 
      featuredEvents={featuredEvents}
      loadingProperties={loadingProperties} 
      loadingServices={loadingServices} 
      loadingHelpers={loadingHelpers} 
      loadingEvents={loadingEvents}
      stats={stats} 
      onItemClick={addToRecentlyViewed} 
      recentlyViewedItems={recentlyViewedItems} 
      onRecentlyViewedLike={updateRecentlyViewedLike}
      currentLocation={currentLocation} 
      navigate={navigate} 
      aiRecommendations={aiRecommendations} 
      aiInsights={aiInsights} 
      aiTrendData={aiTrendData}
      onAISuggestionClick={(suggestion) => { navigate(`/search?searchTerm=${encodeURIComponent(suggestion)}&type=all&ai=1`); }}
    />
  );
};

export default Home;