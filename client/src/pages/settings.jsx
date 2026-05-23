// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Shield, Lock, Bell, Moon, Sun, CreditCard, 
  Globe, Eye, HelpCircle, ArrowLeft, Check, Camera, 
  RefreshCw, Smartphone, Mail, Phone, Settings, Sparkles, Key
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Tab State
  const [activeTab, setActiveTab] = useState('account');

  // Custom States
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'ZAR');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [username, setUsername] = useState(currentUser?.username || 'Guest User');
  const [email, setEmail] = useState(currentUser?.email || 'guest@loopout.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+27 72 123 4567');
  const [language, setLanguage] = useState('English');

  // Custom Settings Toggles
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    marketingEmails: true
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    shareContacts: true,
    locationTracking: true
  });

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccessMessage('Account details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Security password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'account', label: 'My Profile', icon: User },
    { id: 'security', label: 'Login & Security', icon: Lock },
    { id: 'customize', label: 'Interface Design', icon: Settings },
    { id: 'privacy', label: 'Privacy Control', icon: Eye },
    { id: 'billing', label: 'Payments & Billing', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white pt-10 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">System Panel</span>
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>

        {/* Global Toast Success banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald-500 text-white rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-5 h-5" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Settings Sidebar Nav */}
          <div className="lg:col-span-1 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 border text-left ${
                    isActive 
                      ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel Container */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-8 md:p-10">
              
              {/* Account / Profile Settings Tab */}
              {activeTab === 'account' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">My Profile</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Update your public details and contact information linked to your loopOut profile.</p>
                  </div>

                  {/* Avatar Upload Preview */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100/50 dark:border-gray-800">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-rose-500 p-1 bg-white dark:bg-gray-950">
                        <img 
                          src={currentUser?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt="avatar" 
                          className="w-full h-full object-cover rounded-[1.6rem]"
                        />
                      </div>
                      <button className="absolute inset-0 bg-black/50 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <h4 className="font-black text-gray-900 dark:text-white">Profile Photo</h4>
                      <p className="text-xs text-gray-400">Accepted formats: JPG, PNG, WEBP. Max size: 2MB.</p>
                      <div className="flex gap-2.5 mt-2">
                        <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all">Upload New</button>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">Remove</button>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAccount} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Username</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Preferred Language</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white appearance-none"
                          >
                            <option>English</option>
                            <option>Afrikaans</option>
                            <option>isiZulu</option>
                            <option>isiXhosa</option>
                            <option>Sepedi</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isUpdating}
                        className="w-full md:w-auto px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
                      >
                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                        <span>Save Account Details</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Login & Security</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your password, login procedures and secondary verification layers.</p>
                  </div>

                  <form onSubmit={handleSaveSecurity} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Current Password</label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="password" 
                            required
                            placeholder="••••••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="password" 
                            required
                            placeholder="Min 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="password" 
                            required
                            placeholder="Match new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isUpdating}
                        className="w-full md:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-gray-950/10 dark:shadow-white/10 active:scale-95 transition-all"
                      >
                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>

                  <hr className="border-gray-100 dark:border-gray-800" />

                  {/* Two-Factor Authentication Info */}
                  <div className="flex items-start gap-4 p-6 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-100/50 dark:border-rose-900/30">
                    <Smartphone className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Add an extra layer of security by requiring a confirmation SMS code alongside your password when you log into your loopOut account.
                      </p>
                      <button className="mt-3 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1.5">
                        Setup Authenticator
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Interface Design</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Fine-tune the appearance, color tones, theme states, and standard currency settings of the system.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Customizer */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Application Theme Mode</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex items-center justify-center gap-3 p-5 rounded-2xl border font-black uppercase tracking-wider text-xs transition-all ${
                            theme === 'light'
                              ? 'bg-white border-rose-500 text-rose-600 shadow-md'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>Solar Mode (Light)</span>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex items-center justify-center gap-3 p-5 rounded-2xl border font-black uppercase tracking-wider text-xs transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-900 border-rose-500 text-rose-400 shadow-md'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <Moon className="w-4 h-4 text-purple-400" />
                          <span>Nebula Mode (Dark)</span>
                        </button>
                      </div>
                    </div>

                    {/* Currency Customizer */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Global Currency Display</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select 
                          value={currency} 
                          onChange={(e) => {
                            setCurrency(e.target.value);
                            localStorage.setItem('currency', e.target.value);
                          }}
                          className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white appearance-none"
                        >
                          <option value="ZAR">South African Rand (ZAR) - R</option>
                          <option value="USD">United States Dollar (USD) - $</option>
                          <option value="EUR">Euro (EUR) - €</option>
                          <option value="GBP">British Pound (GBP) - £</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">This updates pricing metrics across Stays, Stalls, and Service reservations automatically.</p>
                    </div>

                    {/* Notification Toggles */}
                    <div className="space-y-3 pt-4">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Notification Alerts</label>
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800 rounded-2xl">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">Email Alerts</h4>
                            <p className="text-xs text-gray-400">Receive receipt emails and booking proposals.</p>
                          </div>
                          <button 
                            onClick={() => toggleNotification('emailAlerts')}
                            className={`w-12 h-6 rounded-full transition-all relative ${notifications.emailAlerts ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications.emailAlerts ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800 rounded-2xl">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">WhatsApp & SMS Alerts</h4>
                            <p className="text-xs text-gray-400">Get direct alerts on booking en-route/ongoing events.</p>
                          </div>
                          <button 
                            onClick={() => toggleNotification('smsAlerts')}
                            className={`w-12 h-6 rounded-full transition-all relative ${notifications.smsAlerts ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications.smsAlerts ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Privacy Control</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Control what data is visible to other members of the LoopOut community.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-850 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white">Public Profile Visibility</h4>
                        <p className="text-xs text-gray-400">Allow other users to view your registered reviews and rating details.</p>
                      </div>
                      <button 
                        onClick={() => togglePrivacy('profilePublic')}
                        className={`w-12 h-6 rounded-full transition-all relative ${privacy.profilePublic ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${privacy.profilePublic ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-850 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white">Mutual Contact Syncing</h4>
                        <p className="text-xs text-gray-400">Share your contacts to see which friends share mutual bookings on properties.</p>
                      </div>
                      <button 
                        onClick={() => togglePrivacy('shareContacts')}
                        className={`w-12 h-6 rounded-full transition-all relative ${privacy.shareContacts ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${privacy.shareContacts ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-850 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white">Real-Time Geolocation Tracking</h4>
                        <p className="text-xs text-gray-400">Use browser coordinates to calculate distance to service locations accurately.</p>
                      </div>
                      <button 
                        onClick={() => togglePrivacy('locationTracking')}
                        className={`w-12 h-6 rounded-full transition-all relative ${privacy.locationTracking ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${privacy.locationTracking ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing & Payments Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Payments & Billing</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Securely manage payment credentials, PayFast integrations, and view transaction details.</p>
                  </div>

                  {/* PayFast Status Card */}
                  <div className="p-6 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-gray-800 dark:to-gray-850 rounded-[2rem] border border-rose-100/50 dark:border-gray-800 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Active Partner</span>
                        <h4 className="font-black text-lg text-gray-900 dark:text-white">PayFast Integration Secured</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payments are safely handled using PayFast escrow systems to protect client and host funds.</p>
                    </div>
                    <button className="px-5 py-3.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-rose-500/20 flex-shrink-0">Configure PayFast</button>
                  </div>

                  {/* Transaction List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Active Escrow Accounts</h4>
                    <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 text-center text-gray-400">
                      <p className="text-sm font-semibold mb-1">No pending payouts found.</p>
                      <p className="text-xs text-gray-400">Payout funds are held securely until the booking starts.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
