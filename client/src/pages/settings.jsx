// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Shield, Lock, Bell, Moon, Sun, CreditCard, 
  Globe, Eye, HelpCircle, ArrowLeft, Check, Camera, 
  RefreshCw, Smartphone, Mail, Phone, Settings, Sparkles, Key,
  Trash2, Plus, AlertTriangle
} from 'lucide-react';
import { updateUserStart, updateUserSuccess, updateUserFailure } from '../redux/user/userSlice';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Tab State
  const [activeTab, setActiveTab] = useState(() => {
    const requestedTab = searchParams.get('tab');
    return ['account', 'guardian', 'security', 'customize', 'privacy', 'billing'].includes(requestedTab) ? requestedTab : 'hub';
  });

  // Custom States
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('preferredCurrency') || localStorage.getItem('currency') || 'ZAR');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Guardian State
  const [guardianContacts, setGuardianContacts] = useState(currentUser?.contacts || []);
  const [accessContacts, setAccessContacts] = useState(currentUser?.accessContacts || false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    if (!currentUser?._id) return;
    setGuardianContacts((Array.isArray(currentUser.contacts) ? currentUser.contacts : []).map((contact) => (
      typeof contact === 'string' ? { name: 'Trusted contact', phone: contact } : contact
    )));
    setAccessContacts(Boolean(currentUser.accessContacts));
  }, [currentUser?._id]);

  // Form Fields
  const languageOptions = [
    { code: 'en', name: 'English' }, { code: 'af', name: 'Afrikaans' },
    { code: 'zu', name: 'Zulu' }, { code: 'xh', name: 'Xhosa' },
    { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }, { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
  ];
  const storedLanguage = localStorage.getItem('preferredLanguage') || 'en';
  const initialLanguage = languageOptions.some((item) => item.code === storedLanguage) ? storedLanguage : 'en';
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [language, setLanguage] = useState(currentUser?.preferredLanguage || initialLanguage);

  useEffect(() => {
    setUsername(currentUser?.username || '');
    setEmail(currentUser?.email || '');
    setPhone(currentUser?.phone || '');
    const preferred = currentUser?.preferredLanguage || localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(languageOptions.some((item) => item.code === preferred) ? preferred : 'en');
  }, [currentUser?._id]);

  // Custom Settings Toggles
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    contactVisibility: 'private',
    bookingHistory: false,
    reviews: true,
    socialConnections: false,
    marketing: false,
    research: false
  });

  useEffect(() => {
    if (!currentUser) return;
    setPrivacy({
      profilePublic: currentUser.profileVisibility ?? true,
      contactVisibility: currentUser.contactVisibility || 'private',
      reviews: currentUser.sharedInfo?.reviews ?? true,
      socialConnections: currentUser.sharedInfo?.socialConnections ?? false,
      marketing: currentUser.dataSharing?.marketing ?? false,
      research: currentUser.dataSharing?.research ?? false,
    });
  }, [currentUser]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(currentUser?.twoFactorEnabled));
  const [twoFactorSetupPending, setTwoFactorSetupPending] = useState(false);
  const [twoFactorAction, setTwoFactorAction] = useState('enable');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorDevCode, setTwoFactorDevCode] = useState('');

  useEffect(() => {
    setTwoFactorEnabled(Boolean(currentUser?.twoFactorEnabled));
  }, [currentUser?._id, currentUser?.twoFactorEnabled]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#030712' : '#ffffff'
    );
  }, [theme]);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) {
      setErrorMessage('Sign in to save your profile details and preferred language.');
      return;
    }
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 40) {
      setErrorMessage('Name must be between 3 and 40 characters.');
      return;
    }
    try {
      setErrorMessage('');
      setSuccessMessage('');
      setIsUpdating(true);
      dispatch(updateUserStart());
      const res = await authenticatedFetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, phone: phone.trim(), preferredLanguage: language }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false || !data?._id) {
        if (res.status === 409) throw new Error('That name is already in use. Please choose another name.');
        throw new Error(data.message || 'Could not save your profile details.');
      }
      dispatch(updateUserSuccess(data));
      setUsername(data.username || cleanUsername);
      localStorage.setItem('preferredLanguage', language);
      window.dispatchEvent(new CustomEvent('loopout:language-change', { detail: { language } }));
      setIsUpdating(false);
      setSuccessMessage('Profile details and preferred language saved.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorMessage(error.message || 'Could not save your profile details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveGuardian = async (e) => {
    e?.preventDefault();
    if (!currentUser?._id) {
      setErrorMessage('Sign in to save Guardian Safety settings.');
      return;
    }
    try {
      setErrorMessage('');
      setSuccessMessage('');
      dispatch(updateUserStart());
      setIsUpdating(true);
      const res = await authenticatedFetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: guardianContacts,
          accessContacts,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Could not save trusted contacts.');
      dispatch(updateUserSuccess(data));
      setSuccessMessage('Guardian safety settings saved.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorMessage(error.message || 'Could not save Guardian Safety settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAccessContacts = async () => {
    if (!currentUser?._id || isUpdating) return;
    const updatedAccess = !accessContacts;
    try {
      setErrorMessage('');
      setSuccessMessage('');
      dispatch(updateUserStart());
      setIsUpdating(true);
      const res = await authenticatedFetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: guardianContacts, accessContacts: updatedAccess }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Could not update mutual contact matching.');
      setAccessContacts(updatedAccess);
      dispatch(updateUserSuccess(data));
      setSuccessMessage('Mutual contact preference updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorMessage(error.message || 'Could not update mutual contact matching. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const addContact = () => {
    const name = newContactName.trim();
    const phoneValue = newContactPhone.trim();
    const digitCount = phoneValue.replace(/\D/g, '').length;
    if (!name || !phoneValue) return setErrorMessage('Enter both a contact name and phone number.');
    if (digitCount < 7 || digitCount > 15) return setErrorMessage('Enter a valid phone number with 7 to 15 digits.');
    if (guardianContacts.length >= 10) return setErrorMessage('You can add up to 10 trusted contacts.');
    if (guardianContacts.some((contact) => contact.phone?.replace(/\D/g, '') === phoneValue.replace(/\D/g, ''))) {
      return setErrorMessage('That phone number is already in your trusted contacts.');
    }
    setErrorMessage('');
    setGuardianContacts((contacts) => [...contacts, { name, phone: phoneValue }]);
    setNewContactName('');
    setNewContactPhone('');
  };

  const removeContact = (index) => {
    setGuardianContacts((contacts) => {
      const updated = contacts.filter((_, contactIndex) => contactIndex !== index);
      if (!updated.length) setAccessContacts(false);
      return updated;
    });
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('The new passwords do not match.');
      return;
    }
    if (newPassword.length < 12) {
      setErrorMessage('Your new password must contain at least 12 characters.');
      return;
    }
    if (!currentUser?._id) {
      setErrorMessage('Sign in to update your password.');
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');
      dispatch(updateUserStart());
      setIsUpdating(true);
      const response = await authenticatedFetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not update your password.');
      }
      dispatch(updateUserSuccess(data));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorMessage(error.message || 'Could not update your password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBeginTwoFactorSetup = async (event) => {
    event.preventDefault();
    if (!currentUser?._id) return setErrorMessage('Sign in to enable two-factor sign-in.');
    try {
      setErrorMessage('');
      setSuccessMessage('');
      setIsUpdating(true);
      const response = await authenticatedFetch('/api/auth/two-factor/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.message || 'Could not start two-factor setup.');
      setTwoFactorSetupPending(true);
      setTwoFactorAction('enable');
      setTwoFactorCode(data.devCode || '');
      setTwoFactorDevCode(data.devCode || '');
      setSuccessMessage(data.devCode ? `Development setup code: ${data.devCode}` : `A setup code was sent to ${data.email || 'your email'}.`);
    } catch (error) {
      setErrorMessage(error.message || 'Could not start two-factor setup. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmTwoFactorSetup = async (event) => {
    event.preventDefault();
    try {
      setErrorMessage('');
      setSuccessMessage('');
      setIsUpdating(true);
      const confirmEndpoint = twoFactorAction === 'disable' ? '/api/auth/two-factor/disable/confirm' : '/api/auth/two-factor/confirm';
      const response = await authenticatedFetch(confirmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.message || 'Could not enable two-factor sign-in.');
      setTwoFactorEnabled(Boolean(data.user?.twoFactorEnabled));
      setTwoFactorSetupPending(false);
      setTwoFactorCode('');
      setTwoFactorDevCode('');
      dispatch(updateUserSuccess(data.user));
      setSuccessMessage(data.message || 'Two-factor sign-in is now enabled.');
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorMessage(error.message || 'Could not enable two-factor sign-in. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      setIsUpdating(true);
      const response = await authenticatedFetch('/api/auth/two-factor/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.message || 'Could not disable two-factor sign-in.');
      setTwoFactorAction('disable');
      setTwoFactorSetupPending(true);
      setTwoFactorCode(data.devCode || '');
      setTwoFactorDevCode(data.devCode || '');
      setSuccessMessage(data.devCode ? `Development confirmation code: ${data.devCode}` : `A confirmation code was sent to ${data.email || 'your email'}.`);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorMessage(error.message || 'Could not disable two-factor sign-in. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePrivacy = async () => {
    if (!currentUser?._id) {
      setErrorMessage('Sign in to save your privacy settings.');
      return;
    }
    try {
      setErrorMessage('');
      setSuccessMessage('');
      dispatch(updateUserStart());
      setIsUpdating(true);
      const response = await authenticatedFetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileVisibility: privacy.profilePublic,
          contactVisibility: privacy.contactVisibility,
          sharedInfo: {
            reviews: privacy.reviews,
            socialConnections: privacy.socialConnections,
          },
          dataSharing: { marketing: privacy.marketing, research: privacy.research },
        }),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.message || 'Could not save privacy settings.');
      dispatch(updateUserSuccess(data));
      setSuccessMessage('Privacy and sharing settings saved.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setErrorMessage(error.message || 'Could not save privacy settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'My Profile', icon: User },
    { id: 'guardian', label: 'Guardian Safety', icon: Shield },
    { id: 'security', label: 'Login & Security', icon: Lock },
    { id: 'customize', label: 'Interface Design', icon: Settings },
    { id: 'privacy', label: 'Privacy & Sharing', icon: Eye },
    { id: 'billing', label: 'Payments & Billing', icon: CreditCard }
  ];

  const accountSections = [
    { id: 'account', label: 'Personal info', description: 'Manage your name, contact details and profile photo.', icon: User },
    { id: 'security', label: 'Login & security', description: 'Update your password and keep your account secure.', icon: Lock },
    { id: 'privacy', label: 'Privacy & sharing', description: 'Choose what information you share on LoopOut.', icon: Eye },
    { id: 'customize', label: 'Global preferences', description: 'Set your language, currency, appearance and alerts.', icon: Globe },
    { id: 'guardian', label: 'Safety contacts', description: 'Manage emergency contacts and safety preferences.', icon: Shield },
    { id: 'billing', label: 'Payments & billing', description: 'Review your payment and billing options.', icon: CreditCard },
  ];

  if (activeTab === 'hub') {
    return (
      <div className="app-safe-top min-h-screen bg-white text-gray-900 app-safe-content-bottom pb-36 dark:bg-gray-950 dark:text-white">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-rose-600 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" /> Profile
          </button>
          <div className="mb-8 border-b border-gray-200 pb-7 dark:border-gray-800">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Account settings</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage your personal information, account security and preferences.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {accountSections.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="group flex min-h-32 items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
              >
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-gray-800 dark:text-gray-200" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-gray-900 dark:text-white">{label}</span>
                  <span className="mt-1 block text-sm leading-5 text-gray-500 dark:text-gray-400">{description}</span>
                </span>
                <span aria-hidden="true" className="text-xl leading-5 text-gray-400 transition group-hover:translate-x-0.5">›</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-safe-top min-h-screen bg-gray-50/50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white app-safe-content-bottom pb-36 md:pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('hub')}
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
          {errorMessage && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              {errorMessage}
            </motion.div>
          )}
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
                    <div className="relative ">
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
                      <button type="button" onClick={() => navigate('/profile')} className="mt-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all">Manage photo on profile</button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAccount} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={40}
                            required
                            minLength={3}
                            autoComplete="nickname"
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">This is the name shown on your LoopOut profile. It must be at least 3 characters.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="email" 
                            value={email} 
                            readOnly
                            aria-describedby="profile-email-note"
                            className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                        <p id="profile-email-note" className="text-xs text-gray-500 dark:text-gray-400">Email is used for sign-in and can’t be changed from this page.</p>
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
                            {languageOptions.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
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

              {/* Guardian Safety Tab */}
              {activeTab === 'guardian' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-rose-500" />
                      Guardian Safety
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Save trusted contact numbers and choose whether LoopOut can use them to identify mutual connections in supported parts of the app.</p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold">About trusted contacts</h3>
                        <p className="mt-1 text-sm leading-6">
                          LoopOut stores these contact details for mutual-contact matching when enabled. This setting does not send SOS alerts, SMS messages, or live location to your contacts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-850 rounded-2xl gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Show mutual connections</h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">When enabled, LoopOut compares saved contact numbers with member phone numbers to find mutual connections in supported profile, listing, and booking views. Your contact list is not shown to other members.</p>
                      </div>
                      <button 
                        type="button"
                        role="switch"
                        aria-checked={accessContacts}
                        aria-label="Show mutual contacts on booking cards"
                        disabled={isUpdating || (guardianContacts.length === 0 && !accessContacts)}
                        onClick={handleToggleAccessContacts}
                        className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-50 ${accessContacts ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${accessContacts ? 'right-1' : 'left-1'}`} />
                      </button>
                      {guardianContacts.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">Add a trusted contact before enabling matching.</p>}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Trusted contacts</h4>
                      
                      {guardianContacts.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                          <Shield className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No trusted contacts added yet.</p>
                          <p className="text-xs text-gray-400 mt-1">Add someone you trust below. LoopOut will not automatically contact them.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {guardianContacts.map((contact, index) => {
                            const contactName = typeof contact === 'string' ? 'Trusted contact' : contact?.name?.trim() || 'Trusted contact';
                            const contactPhone = typeof contact === 'string' ? contact : contact?.phone || '';
                            return (
                            <div key={`${contactPhone}-${index}`} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-sm">
                              <div>
                                <h5 className="font-semibold text-sm text-slate-900 dark:text-gray-100">{contactName}</h5>
                                <p className="mt-1 text-sm text-slate-700 dark:text-gray-300">{contactPhone}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => removeContact(index)}
                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text"
                            maxLength={80}
                            aria-label="Trusted contact name"
                            placeholder="Contact Name"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            className="w-full pl-11 pr-5 py-3.5 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="relative flex gap-3">
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="tel" 
                              maxLength={24}
                              aria-label="Trusted contact phone number"
                              placeholder="Phone Number"
                              value={newContactPhone}
                              onChange={(e) => setNewContactPhone(e.target.value)}
                              className="w-full pl-11 pr-5 py-3.5 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={addContact}
                            aria-label="Add trusted contact"
                            disabled={guardianContacts.length >= 10}
                            className="w-12 h-[50px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={handleSaveGuardian}
                        disabled={isUpdating}
                        className="w-full md:w-auto px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
                      >
                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                        <span>Save Guardian Preferences</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Login & Security</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Change your password by confirming your current password.</p>
                  </div>

                  <form onSubmit={handleSaveSecurity} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Current Password</label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="password"
                            autoComplete="current-password"
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
                            autoComplete="new-password"
                            minLength={12}
                            required
                            placeholder="At least 12 characters"
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
                            autoComplete="new-password"
                            minLength={12}
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

                  <section className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-start gap-4">
                      <Smartphone className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Two-factor sign-in</h4>
                        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Require a one-time code sent to your LoopOut email after signing in with email and password or Google.</p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Keep access to {currentUser?.email || 'your account email'} to receive sign-in codes.</p>
                      </div>
                    </div>

                    {!twoFactorEnabled && !twoFactorSetupPending && (
                      <form onSubmit={handleBeginTwoFactorSetup} className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                        <button type="submit" disabled={isUpdating} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-gray-900">
                          {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : null} Enable two-factor sign-in
                        </button>
                      </form>
                    )}

                    {twoFactorSetupPending && (
                      <form onSubmit={handleConfirmTwoFactorSetup} className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                        <label htmlFor="two-factor-setup-code" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Enter the six-digit {twoFactorAction === 'disable' ? 'confirmation' : 'setup'} code sent to {currentUser?.email}</label>
                        {twoFactorDevCode && <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">Development code: {twoFactorDevCode}</p>}
                        <input id="two-factor-setup-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm tracking-[0.3em] text-gray-900 focus:border-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
                        <div className="flex flex-wrap gap-3">
                          <button type="submit" disabled={isUpdating || twoFactorCode.length !== 6} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-gray-900">{isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : null} Confirm and {twoFactorAction === 'disable' ? 'turn off' : 'enable'}</button>
                          <button type="button" disabled={isUpdating} onClick={() => { setTwoFactorSetupPending(false); setTwoFactorCode(''); setTwoFactorDevCode(''); }} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200">Cancel</button>
                        </div>
                      </form>
                    )}

                    {twoFactorEnabled && (
                      <div className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Two-factor sign-in is enabled.</p>
                        <button type="button" onClick={handleDisableTwoFactor} disabled={isUpdating} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200">{isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : null} Turn off with an email code</button>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* Customize Tab */}
              {activeTab === 'customize' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Interface Design</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Choose the app theme and your preferred currency display.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Customizer */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Application Theme Mode</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          aria-pressed={theme === 'light'}
                          onClick={() => setTheme('light')}
                          className={`flex items-center justify-center gap-3 p-5 rounded-2xl border font-black uppercase tracking-wider text-xs transition-all ${
                            theme === 'light'
                              ? 'bg-white border-rose-500 text-rose-600 shadow-md'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>Light mode</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={theme === 'dark'}
                          onClick={() => setTheme('dark')}
                          className={`flex items-center justify-center gap-3 p-5 rounded-2xl border font-black uppercase tracking-wider text-xs transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-900 border-rose-500 text-rose-400 shadow-md'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <Moon className="w-4 h-4 text-purple-400" />
                          <span>Dark mode</span>
                        </button>
                      </div>
                    </div>

                    {/* Currency Customizer */}
                    <div className="space-y-2">
                      <label htmlFor="interface-currency" className="text-xs font-black uppercase tracking-widest text-gray-400">Preferred currency</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          id="interface-currency"
                          value={currency} 
                          onChange={(e) => {
                            const nextCurrency = e.target.value;
                            setCurrency(nextCurrency);
                            localStorage.setItem('preferredCurrency', nextCurrency);
                            localStorage.setItem('currency', nextCurrency);
                            window.dispatchEvent(new CustomEvent('loopout:currency-change', { detail: { currency: nextCurrency } }));
                          }}
                          className="w-full pl-11 pr-5 py-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-gray-900 dark:text-white appearance-none"
                        >
                          <option value="ZAR">South African Rand (ZAR) - R</option>
                          <option value="USD">United States Dollar (USD) - $</option>
                          <option value="EUR">Euro (EUR) - €</option>
                          <option value="GBP">British Pound (GBP) - £</option>
                          <option value="AUD">Australian Dollar (AUD) - A$</option>
                          <option value="CAD">Canadian Dollar (CAD) - C$</option>
                          <option value="JPY">Japanese Yen (JPY) - ¥</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This saves your preference and updates the currency selector. Listings and booking totals remain in the currency shown by their provider.</p>
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/40 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notification preferences</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage booking, payment, promotion, and security notification preferences in your profile.</p>
                      </div>
                      <button type="button" onClick={() => navigate('/profile', { state: { activeSection: 'notifications' } })} className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-600 dark:border-gray-700 dark:text-gray-100 dark:hover:border-gray-500">
                        Manage notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="mx-auto max-w-3xl space-y-8 animate-fadeIn">
                  <div className="border-b border-gray-200 pb-6 dark:border-gray-800">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Privacy & sharing</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">Choose which profile details, contact details, reviews, and connections other members can see.</p>
                  </div>

                  <section>
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Profile and contact details</h3>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">You can change these choices at any time.</p>
                    <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                      <div className="flex items-center justify-between gap-5 py-5">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Show my profile details</h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hide your about details, reviews, and connections from other members. Your public listings can still appear in LoopOut search.</p>
                        </div>
                        <button type="button" role="switch" aria-checked={privacy.profilePublic} aria-label="Show my profile to other members" onClick={() => togglePrivacy('profilePublic')} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${privacy.profilePublic ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all dark:bg-gray-900 ${privacy.profilePublic ? 'left-[26px] dark:bg-gray-900' : 'left-1 dark:bg-white'}`} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Contact details</h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose whether your phone and email appear on your public profile.</p>
                        </div>
                        <select value={privacy.contactVisibility} onChange={(event) => setPrivacy((prev) => ({ ...prev, contactVisibility: event.target.value }))} className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                          <option value="private">Private</option>
                          <option value="public">Visible on my profile</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Information shared on LoopOut</h3>
                    <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                      {[
                        { key: 'reviews', title: 'Reviews', detail: 'Show reviews and ratings associated with your profile.' },
                        { key: 'socialConnections', title: 'Social connections', detail: 'Show your connections and following activity.' },
                      ].map(({ key, title, detail }) => (
                        <div key={key} className="flex items-center justify-between gap-5 py-5">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
                          </div>
                          <button type="button" role="switch" aria-checked={privacy[key]} aria-label={title} onClick={() => togglePrivacy(key)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${privacy[key] ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all dark:bg-gray-900 ${privacy[key] ? 'left-[26px] dark:bg-gray-900' : 'left-1 dark:bg-white'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Booking details are private to the people involved in each booking. They are not shown on your public profile.</p>
                  </section>

                  <section>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Data preferences</h3>
                    <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                      {[
                        { key: 'marketing', title: 'Personalized offers', detail: 'Allow LoopOut to use your activity to tailor offers and updates.' },
                        { key: 'research', title: 'Product research', detail: 'Allow your information to be used in product research.' },
                      ].map(({ key, title, detail }) => (
                        <div key={key} className="flex items-center justify-between gap-5 py-5">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
                          </div>
                          <button type="button" role="switch" aria-checked={privacy[key]} aria-label={title} onClick={() => togglePrivacy(key)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${privacy[key] ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all dark:bg-gray-900 ${privacy[key] ? 'left-[26px] dark:bg-gray-900' : 'left-1 dark:bg-white'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="flex justify-end border-t border-gray-200 pt-5 dark:border-gray-800">
                    <button type="button" onClick={handleSavePrivacy} disabled={isUpdating} className="inline-flex min-w-36 items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                      {isUpdating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save changes
                    </button>
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
