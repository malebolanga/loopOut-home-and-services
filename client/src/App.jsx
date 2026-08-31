// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import AuthSessionManager from "./components/AuthSessionManager";
import NeuralSplash from "./components/NeuralSplash";
import { useEffect, lazy, Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";
import { useSelector, useDispatch } from "react-redux";
import { signOutUserSuccess } from "./redux/user/userSlice";
import { authenticatedFetch, clearPersistedSessionToken, persistSessionToken } from "./utils/authenticatedFetch";
import { setWishlistCount } from "./redux/frontendSlice";
import { getWishlistBackend } from "./services/wishlist.service";
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import NeuralLoader from "./components/NeuralLoader";
import CompareWidget from "./components/CompareWidget";
import AIAssistantWidget from "./components/AIAssistantWidget";
import BottomNav from "./components/BottomNav";
import PhoneNotificationManager from "./components/PhoneNotificationManager";

// Core Pages (Statically imported to guarantee instant initial rendering)
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

// Dynamic / Code-Splitted Pages (Lazy-loaded on-demand)
const Profile = lazy(() => import("./pages/Profile"));
const Search = lazy(() => import("./pages/Search"));
const Message = lazy(() => import("./pages/Message"));

// Dashboard Page
const DashBoard = lazy(() => import("./pages/DashBoard"));
const ProDashboard = lazy(() => import("./pages/ProDashboard"));

const HostDashboard = lazy(() => import("./pages/HostDashboard"));
const HostEarnings = lazy(() => import("./pages/HostEarnings"));
const HostTools = lazy(() => import("./pages/HostTools"));

// Listing Related Pages
const CreateListing = lazy(() => import("./pages/CreateListing"));
const UpdateListing = lazy(() => import("./pages/UpdateListing"));
const Listing = lazy(() => import("./pages/Listing"));
const RentPage = lazy(() => import("./pages/RentPage"));
const List = lazy(() => import("./pages/List"));
const MyListing = lazy(() => import("./pages/MyListing"));
const ListingsPage = lazy(() => import("./pages/ListingsPage"));
const ForSale = lazy(() => import("./pages/ForSale"));
const Sell = lazy(() => import("./pages/Sell"));
const Output = lazy(() => import("./pages/Output"));
const ListingSuccess = lazy(() => import("./pages/ListingSuccess"));
const SellListing = lazy(() => import("./pages/SellListing"));
const ForRent = lazy(() => import("./pages/ForRent"));
const OverNight = lazy(() => import("./pages/OverNight"));
const Commercial = lazy(() => import("./pages/Commercial"));
const HelperList = lazy(() => import("./pages/HelperList"));
const HelpersHomePage = lazy(() => import('./pages/HelpersHomePage'));
const EventsHomePage = lazy(() => import('./pages/EventsHomePage'));
const ListingsHomePage = lazy(() => import('./pages/ListingsHomePage'));
const ServicesHomePage = lazy(() => import('./pages/ServicesHomePage'));

// Service Pages
const Services = lazy(() => import('./pages/Services'));
const HelperPage = lazy(() => import('./pages/HelperPage'));
const EventPage = lazy(() => import('./pages/EventPage'));
const PrivateTutor = lazy(() => import('./pages/PrivateTutor'));
const UpdateHelper = lazy(() => import('./pages/UpdateHelper'));
const UpdateService = lazy(() => import('./pages/UpdateService'));

// Car Wash Page
const CarWashPage = lazy(() => import('./pages/CarWashPage'));

// Storage Page
const StoragePage = lazy(() => import('./pages/StoragePage'));

// AI & Content Pages
const Ai = lazy(() => import("./pages/Ai"));
const Content = lazy(() => import("./pages/Content"));
const ArticlePages = lazy(() => import('./pages/ArticlePages'));
const AIHelpCenter = lazy(() => import('./pages/AIHelpCenter'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
import Planner from './pages/Planner';
const ForBusiness = lazy(() => import('./pages/ForBusiness'));

// Informational Pages
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Become = lazy(() => import("./pages/Become"));
const Adiver = lazy(() => import("./pages/Adiver"));
const LifestyleDecor = lazy(() => import("./pages/LifestyleDecor"));
const Users = lazy(() => import('./pages/Users'));
const UserListings = lazy(() => import('./pages/UserListings'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Verification = lazy(() => import('./pages/Verification'));

// Payment & Promotion
const PromotionSelection = lazy(() => import('./pages/PromotionSelection'));
const PaymentMethod = lazy(() => import('./pages/PaymentMethod'));
const Sale = lazy(() => import("./pages/Sale"));
const RecentlyViewedPage = lazy(() => import("./pages/RecentlyViewedPage"));

// Help & Resources
const PropertySafety = lazy(() => import("./components/PropertySafety"));
const SafetyHelper = lazy(() => import("./components/SafetyHelper"));
const SafetyServices = lazy(() => import("./components/SafetyServices"));
const Newsroom = lazy(() => import("./components/Newsroom"));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Investors = lazy(() => import('./components/Investors'));
const DiversityPage = lazy(() => import('./components/DiversityPage'));
const HostingResources = lazy(() => import('./components/HostingResources'));
const HostYourHome = lazy(() => import('./components/HostYourHome'));
const HostExperience = lazy(() => import('./components/HostExperience'));
const ResponsibleHosting = lazy(() => import('./components/ResponsibleHosting'));
const CommunityCenter = lazy(() => import('./components/CommunityCenter'));
const TrustAndSafety = lazy(() => import('./components/TrustAndSafety'));
const SiteMap = lazy(() => import('./components/SiteMap'));
const CookiePolicy = lazy(() => import('./components/CookiePolicy'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const AboutLoop = lazy(() => import('./components/AboutLoop'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const LoginRequiredPage = lazy(() => import('./components/LoginRequiredPage'));

// User Features
const Wishlist = lazy(() => import('./pages/WishList'));
const Events = lazy(() => import('./pages/Events'));
const Private = lazy(() => import("./pages/Private"));
const Notifications = lazy(() => import('./pages/Notifications'));

// User Profile
const UserProfile = lazy(() => import('./pages/UserProfile'));
const SettingsPage = lazy(() => import('./pages/settings'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Matchmaker = lazy(() => import('./pages/Matchmaker'));
const Radar = lazy(() => import('./pages/Radar'));
const QuickBook = lazy(() => import('./pages/QuickBook'));
const LunchComingSoon = lazy(() => import('./pages/LunchComingSoon'));
const Splitter = lazy(() => import('./pages/Splitter'));

// Photography Helper Page
const PhotographyHelperPage = lazy(() => import('./pages/PhotographyHelperPage'));
const BeautyPage = lazy(() => import('./pages/BeautyPage'));
const BarberPage = lazy(() => import('./pages/BarberPage'));
const TattooPage = lazy(() => import('./pages/TattooPage'));
const ChefPage = lazy(() => import('./pages/ChefPage'));

// Trip Components
const TripSearch = lazy(() => import('./pages/TripSearch'));
const TripDetail = lazy(() => import('./pages/TripDetail'));
const Trips = lazy(() => import('./pages/Trips'));
const Trip = lazy(() => import('./pages/Trip'));

const SmartSearchPage = lazy(() => import('./pages/SmartSearchPage'));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const Inbox = lazy(() => import('./pages/Inbox'));
const LookingForDiscovery = lazy(() => import('./pages/LookingForDiscovery'));
const CreateRequest = lazy(() => import('./pages/CreateRequest'));

// Categories page
const Categories = lazy(() => import('./pages/Categories'));
const UpcomingBookings = lazy(() => import('./pages/UpcomingBookings'));

import 'leaflet/dist/leaflet.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Core Routes - Specific paths first */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/sign-in" element={<PageTransition><SignIn /></PageTransition>} />
        <Route path="/sign-up" element={<PageTransition><SignUp /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/messages" element={<PageTransition><Inbox /></PageTransition>} />
        <Route path="/smart-search" element={<PageTransition><SmartSearchPage /></PageTransition>} />

        <Route path="/dashboard" element={<PageTransition><DashBoard /></PageTransition>} />
        <Route path="/pro" element={<PageTransition><ProDashboard /></PageTransition>} />
        <Route path="/host-dashboard" element={<PageTransition><HostDashboard /></PageTransition>} />
        <Route path="/host-earnings" element={<PageTransition><HostEarnings /></PageTransition>} />
        <Route path="/host-tools" element={<PageTransition><HostTools /></PageTransition>} />
        <Route path="/explore" element={<PageTransition><ExplorePage /></PageTransition>} />
        <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
        <Route path="/for-business" element={<PageTransition><ForBusiness /></PageTransition>} />

        {/* User Profile - Specific before dynamic */}
        <Route path="/user/:id" element={<PageTransition><UserProfile /></PageTransition>} />
        <Route path="/user-profile/:id" element={<PageTransition><UserProfile /></PageTransition>} />

        {/* Specific Listing Routes */}
        <Route path="/list" element={<PageTransition><List /></PageTransition>} />
        <Route path="/listings/:type" element={<PageTransition><ListingsPage /></PageTransition>} />
        <Route path="/for-rent" element={<PageTransition><ForRent /></PageTransition>} />
        <Route path="/for-sale" element={<PageTransition><ForSale /></PageTransition>} />
        <Route path="/sell" element={<PageTransition><Sell /></PageTransition>} />
        <Route path="/output" element={<PageTransition><Output /></PageTransition>} />
        <Route path="/listing-success" element={<PageTransition><ListingSuccess /></PageTransition>} />
        <Route path="/sell-item/:id" element={<PageTransition><SellListing /></PageTransition>} />
        <Route path="/helper-list" element={<PageTransition><HelperList /></PageTransition>} />
        <Route path="/commercial" element={<PageTransition><Commercial /></PageTransition>} />
        <Route path="/overnight" element={<PageTransition><OverNight /></PageTransition>} />
        <Route path="/listing/:listingId" element={<PageTransition><Listing /></PageTransition>} />
        <Route path="/property/:listingId" element={<PageTransition><Listing /></PageTransition>} />
        <Route path="/rent/:listingId" element={<PageTransition><Listing /></PageTransition>} />
        <Route path="/helper-home-page" element={<PageTransition><HelpersHomePage /></PageTransition>} />
        <Route path="/event-home-page" element={<PageTransition><EventsHomePage /></PageTransition>} />
        <Route path="/listing-home-page" element={<PageTransition><ListingsHomePage /></PageTransition>} />
        <Route path="/service-home-page" element={<PageTransition><ServicesHomePage /></PageTransition>} />
        <Route path="/looking-for" element={<PageTransition><LookingForDiscovery /></PageTransition>} />
        <Route path="/create-request" element={<PageTransition><CreateRequest /></PageTransition>} />

        {/* Trip Routes */}
        <Route path="/trips" element={<PageTransition><Trips /></PageTransition>} />
        <Route path="/trip" element={<PageTransition><Trip /></PageTransition>} />
        <Route path="/trip/:id" element={<PageTransition><TripDetail /></PageTransition>} />
        <Route path="/plan-trip" element={<PageTransition><TripSearch /></PageTransition>} />

        {/* Service Routes */}
        <Route path="/carwash/:id" element={<PageTransition><CarWashPage /></PageTransition>} />
        <Route path="/storage/:id" element={<PageTransition><StoragePage /></PageTransition>} />
        <Route path="/photography/:id" element={<PageTransition><HelperPage /></PageTransition>} />
        <Route path="/beauty/:id" element={<PageTransition><HelperPage /></PageTransition>} />
        <Route path="/barber/:id" element={<PageTransition><HelperPage /></PageTransition>} />
        <Route path="/tattoo/:id" element={<PageTransition><HelperPage /></PageTransition>} />
        <Route path="/chef/:id" element={<PageTransition><ChefPage /></PageTransition>} />
        <Route path="/helper/:id" element={<PageTransition><HelperPage /></PageTransition>} />
        <Route path="/event/:id" element={<PageTransition><EventPage /></PageTransition>} />
        <Route path="/privatetutor/:id" element={<PageTransition><PrivateTutor /></PageTransition>} />
        <Route path="/service/:serviceId" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/update-helper/:helperId" element={<PageTransition><UpdateHelper /></PageTransition>} />
        <Route path="/update-service/:serviceId" element={<PageTransition><UpdateService /></PageTransition>} />

        {/* User Routes */}
        <Route path="/upcoming-bookings" element={<PageTransition><UpcomingBookings /></PageTransition>} />
        <Route path="/my-bookings" element={<PageTransition><UpcomingBookings /></PageTransition>} />
        <Route path="/upcoming" element={<PageTransition><UpcomingBookings /></PageTransition>} />
        <Route path="/users" element={<PageTransition><Users /></PageTransition>} />
        <Route path="/events/:id" element={<PageTransition><Events /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
        <Route path="/messages/:id" element={<PageTransition><Inbox /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />

        {/* Dynamic User Routes */}
        <Route path="/:userId/list" element={<PageTransition><MyListing /></PageTransition>} />
        <Route path="/:userId/listings" element={<PageTransition><UserListings /></PageTransition>} />
        <Route path="/listings/user/:id" element={<PageTransition><UserListings /></PageTransition>} />

        {/* Content & AI Routes */}
        <Route path="/ai" element={<PageTransition><Ai /></PageTransition>} />
        <Route path="/content" element={<PageTransition><Content /></PageTransition>} />
        <Route path="/first-time-buyers" element={<PageTransition><ArticlePages /></PageTransition>} />
        <Route path="/ai-help-center" element={<PageTransition><AIHelpCenter /></PageTransition>} />
        <Route path="/loopbot" element={<PageTransition><AIHelpCenter /></PageTransition>} />
        <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/planner" element={<PageTransition><Planner /></PageTransition>} />

        {/* Informational Routes */}
        <Route path="/propertysafety" element={<PageTransition><PropertySafety /></PageTransition>} />
        <Route path="/safetyservices" element={<PageTransition><SafetyServices /></PageTransition>} />
        <Route path="/safetyhelper" element={<PageTransition><SafetyHelper /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/become" element={<PageTransition><Become /></PageTransition>} />
        <Route path="/adiver" element={<PageTransition><Adiver /></PageTransition>} />
        <Route path="/lifestyle-decor" element={<PageTransition><LifestyleDecor /></PageTransition>} />

        {/* Payment & Promotion */}
        <Route path="/promote" element={<PageTransition><PromotionSelection /></PageTransition>} />
        <Route path="/payment" element={<PageTransition><PaymentMethod /></PageTransition>} />

        {/* Help & Resources */}
        <Route path="/sitemap" element={<PageTransition><SiteMap /></PageTransition>} />
        <Route path="/login-required" element={<PageTransition><LoginRequiredPage /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/aboutloop" element={<PageTransition><AboutLoop /></PageTransition>} />
        <Route path="/cookies" element={<PageTransition><CookiePolicy /></PageTransition>} />
        <Route path="/investors" element={<PageTransition><Investors /></PageTransition>} />
        <Route path="/trust" element={<PageTransition><TrustAndSafety /></PageTransition>} />
        <Route path="/community" element={<PageTransition><CommunityCenter /></PageTransition>} />
        <Route path="/responsible" element={<PageTransition><ResponsibleHosting /></PageTransition>} />
        <Route path="/host-experience" element={<PageTransition><HostExperience /></PageTransition>} />
        <Route path="/host" element={<PageTransition><HostYourHome /></PageTransition>} />
        <Route path="/hosting-resources" element={<PageTransition><HostingResources /></PageTransition>} />
        <Route path="/diversity-belonging" element={<PageTransition><DiversityPage /></PageTransition>} />
        <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
        <Route path="/newsroom" element={<PageTransition><Newsroom /></PageTransition>} />
        <Route path="/recently-viewed" element={<PageTransition><RecentlyViewedPage /></PageTransition>} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/sale" element={<PageTransition><Sale /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
          <Route path="/rewards" element={<PageTransition><Rewards /></PageTransition>} />
          <Route path="/matchmaker" element={<PageTransition><Matchmaker /></PageTransition>} />
          <Route path="/radar" element={<PageTransition><Radar /></PageTransition>} />
          <Route path="/quick-book" element={<PageTransition><QuickBook /></PageTransition>} />
          <Route path="/lunch" element={<PageTransition><LunchComingSoon /></PageTransition>} />
          <Route path="/verification" element={<PageTransition><Verification /></PageTransition>} />
          <Route path="/:userId/create-listing" element={<PageTransition><CreateListing /></PageTransition>} />
          <Route path="/update-listing/:listingId" element={<PageTransition><UpdateListing /></PageTransition>} />
          <Route path="/splitter" element={<PageTransition><Splitter /></PageTransition>} />
        </Route>

        <Route path="/private" element={<PageTransition><Private /></PageTransition>} />

        {/* Short-form Listing Redirect (domain/ID) */}
        <Route path="/:id" element={<ListingRedirect />} />
      </Routes>
    </AnimatePresence>
  );
};

// Helper component to handle direct ID redirects
const ListingRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    // If it's a 24-character hex string (standard MongoDB ID format)
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      navigate(`/listing/${id}`, { replace: true });
    } else {
      // If not an ID, redirect to home or 404
      navigate('/', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

import OnboardingGuide from './components/OnboardingGuide';


function AppContent() {
  const location = useLocation();

  // Safety net: some pages lock body scroll for galleries/overlays via a
  // plain function call (not tied to a cleanup effect). If the user
  // navigates away without explicitly closing that overlay, the lock never
  // gets released and the whole app becomes stuck unscrollable. Resetting
  // it on every route change guarantees it can never persist across pages.
  useEffect(() => {
    document.body.style.overflow = '';
  }, [location.pathname]);

  const hideFooterPaths = [
    '/host-dashboard',
    '/pro',
    '/host-earnings',
    '/host-tools',
    '/for-business',
    '/become',
    '/help-center',
    '/ai-help-center',
    '/loopbot',
    '/cookies',
    '/privacy',
    '/trust',
    '/terms',
    '/host'
  ];
    const hideHeaderPaths = [
    '/host-dashboard',
    '/pro',
    '/host-earnings',
    '/host-tools',
    '/for-business',
    '/become',
    '/cookies',
    '/privacy',
    '/trust',
    '/terms',
    '/host',
    '/search',
    '/listing-home-page',
    '/helper-home-page',
    '/event-home-page',
    '/service-home-page',
    '/upcoming-bookings',
    '/my-bookings',
    '/upcoming',
    '/notifications',
    '/settings'
  ];

  const specializedHelperPaths = [
    '/helper', '/photography', '/beauty', '/barber', '/tattoo', '/chef', '/carwash', '/privatetutor', '/listing', '/property', '/rent', '/listings', '/sneaker', '/washingmat', '/animals', '/sell-item'
  ];

  const isSpecializedPage = specializedHelperPaths.some(path => location.pathname.startsWith(path));
  const isStoragePage = location.pathname.startsWith('/storage/');
  const isCreateListingPage = location.pathname.endsWith('/create-listing');
  // Hide header on /:userId/listings and /:userId/list (dynamic user listing pages)
  const isUserListingsPage = /^\/[a-f0-9]{24}\/(listings|list)(\/.*)?$/.test(location.pathname);
  const hideHeader = hideHeaderPaths.includes(location.pathname) || isSpecializedPage || isStoragePage || isCreateListingPage || isUserListingsPage;
  // Footer carries required legal links (Privacy, Terms) — keep it reachable
  // even on specialized detail pages, which only suppress the top Header.
  const hideFooter = hideFooterPaths.includes(location.pathname) || isStoragePage;
  
  return (
    <>
      <OnboardingGuide />
      <AIAssistantWidget />
      <NeuralSplash />
      <CompareWidget />

      <ScrollToTop />
      <PhoneNotificationManager />
      <AuthSessionManager />
      {!hideHeader && <Header />}
      <Suspense fallback={<NeuralLoader fullScreen={true} />}>
        <AnimatedRoutes />
      </Suspense>
      {!isStoragePage && <BottomNav />}
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const validateTokenOnMount = async () => {
      if (!currentUser) return;
      try {
        const res = await authenticatedFetch('/api/auth/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!res.ok) return;

        const data = await res.json();
        if (data && data.valid === false) {
          clearPersistedSessionToken();
          dispatch(signOutUserSuccess());
          return;
        }

        if (data && data.valid && (data.token || data.access_token)) {
          persistSessionToken(data);
        }

        // Hydrate database wishlist for logged in user
        const items = await getWishlistBackend();
        if (Array.isArray(items)) {
          dispatch(setWishlistCount(items.length));
        }
      } catch (error) {
        console.error('Initial session check failed:', error);
      }
    };
    validateTokenOnMount();
  }, [dispatch, currentUser?._id]);

  return (
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}
