import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

// Core Pages
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Message from "./pages/Message";


// Dashboard Page
import DashBoard from "./pages/DashBoard";

// Listing Related Pages
import CreateListing from "./pages/CreateListing";
import UpdateListing from "./pages/UpdateListing";
import Listing from "./pages/Listing";
import List from "./pages/List";
import MyListing from "./pages/MyListing";
import ListingsPage from "./pages/ListingsPage";
import ForSale from "./pages/ForSale";
import ForRent from "./pages/ForRent";
import OverNight from "./pages/OverNight";
import Commercial from "./pages/Commercial";
import HelperList from "./pages/HelperList";
import HelpersHomePage from './pages/HelpersHomePage';
import EventsHomePage from './pages/EventsHomePage';
import ListingsHomePage from './pages/ListingsHomePage';
import ServicesHomePage from './pages/ServicesHomePage';

// Service Pages
import Services from './pages/Services';
import HelperPage from './pages/HelperPage';
import EventPage from './pages/EventPage';
import PrivateTutor from './pages/PrivateTutor';
import UpdateHelper from './pages/UpdateHelper';

// Car Wash Page
import CarWashPage from './pages/CarWashPage';

// AI & Content Pages
import Ai from "./pages/Ai";
import Content from "./pages/Content";
import ArticlePages from './pages/ArticlePages';
import AIHelpCenter from './pages/AIHelpCenter';

// Informational Pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import Become from "./pages/Become";
import Adiver from "./pages/Adiver";
import LifestyleDecor from "./pages/LifestyleDecor";
import Users from './pages/Users';
import UserListings from './pages/UserListings';

// Payment & Promotion
import PromotionSelection from './pages/PromotionSelection';
import PaymentMethod from './pages/PaymentMethod';
import Sale from "./pages/Sale";
import RecentlyViewedPage from "./pages/RecentlyViewedPage";

// Help & Resources
import PropertySafety from "./components/PropertySafety";
import SafetyHelper from "./components/SafetyHelper";
import SafetyServices from "./components/SafetyServices";
import Newsroom from "./components/Newsroom";
import HowItWorks from './components/HowItWorks';
import Investors from './components/Investors';
import DiversityPage from './components/DiversityPage';
import HostingResources from './components/HostingResources';
import HostYourHome from './components/HostYourHome';
import HostExperience from './components/HostExperience';
import ResponsibleHosting from './components/ResponsibleHosting';
import CommunityCenter from './components/CommunityCenter';
import TrustAndSafety from './components/TrustAndSafety';
import SiteMap from './components/SiteMap';
import CookiePolicy from './components/CookiePolicy';
import PrivacyPolicy from './components/PrivacyPolicy';
import AboutLoop from './components/AboutLoop';
import TermsOfService from './components/TermsOfService';
import LoginRequiredPage from './components/LoginRequiredPage';

// User Features
import Wishlist from './pages/WishList';
import Events from './pages/Events';
import Private from "./pages/Private";
import Notifications from './pages/Notifications';

// User Profile
import UserProfile from './pages/UserProfile';

// Photography Helper Page
import PhotographyHelperPage from './pages/PhotographyHelperPage';

// Trip Components
import TripSearch from './pages/TripSearch';
import TripDetail from './pages/TripDetail';
import Trips from './pages/Trips';

import SmartSearchPage from './pages/SmartSearchPage';
import ExplorePage from "./pages/ExplorePage";
import Inbox from './pages/Inbox';

// Categories page
import Categories from './pages/Categories';

import 'leaflet/dist/leaflet.css';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Core Routes - Specific paths first */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/messages" element={<Inbox />} />
        <Route path="/smart-search" element={<SmartSearchPage />} />

        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/categories" element={<Categories />} />

        {/* User Profile - Specific before dynamic */}
        <Route path="/user/:id" element={<UserProfile />} />

        {/* Specific Listing Routes */}
        <Route path="/list" element={<List />} />
        <Route path="/listings/:type" element={<ListingsPage />} />
        <Route path="/for-rent" element={<ForRent />} />
        <Route path="/for-sale" element={<ForSale />} />
        <Route path="/helper-list" element={<HelperList />} />
        <Route path="/commercial" element={<Commercial />} />
        <Route path="/overnight" element={<OverNight />} />
        <Route path="/listing/:listingId" element={<Listing />} />
        <Route path="/helper-home-page" element={<HelpersHomePage />} />
        <Route path="/event-home-page" element={<EventsHomePage />} />
        <Route path="/listing-home-page" element={<ListingsHomePage />} />
        <Route path="/service-home-page" element={<ServicesHomePage />} />

        {/* Trip Routes */}
        <Route path="/trips" element={<Trips />} />
        <Route path="/trip/:id" element={<TripDetail />} />
        <Route path="/plan-trip" element={<TripSearch />} />

        {/* Service Routes - IMPORTANT: Order matters! More specific routes first */}
        <Route path="/carwash/:id" element={<CarWashPage />} />
        <Route path="/photography/:id" element={<PhotographyHelperPage />} />
        <Route path="/helper/:id" element={<HelperPage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/privatetutor/:privatetutorId" element={<PrivateTutor />} />
        <Route path="/service/:serviceId" element={<Services />} />
        <Route path="/update-helper/:helperId" element={<UpdateHelper />} />

        {/* User Routes - Keep these after more specific routes */}
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/users" element={<Users />} />
        <Route path="/events/:id" element={<Events />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Inbox />} />
        <Route path="/messages/:id" element={<Inbox />} />

        {/* Dynamic User Routes - These come last to avoid conflict */}
        <Route path="/:userId/list" element={<MyListing />} />
        <Route path="/:userId/listings" element={<UserListings />} />
        <Route path="/listings/user/:id" element={<UserListings />} />

        {/* Content & AI Routes */}
        <Route path="/ai" element={<Ai />} />
        <Route path="/content" element={<Content />} />
        <Route path="/first-time-buyers" element={<ArticlePages />} />
        <Route path="/help-center" element={<AIHelpCenter />} />

        {/* Informational Routes */}
        <Route path="/propertysafety" element={<PropertySafety />} />
        <Route path="/safetyservices" element={<SafetyServices />} />
        <Route path="/safetyhelper" element={<SafetyHelper />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/become" element={<Become />} />
        <Route path="/adiver" element={<Adiver />} />
        <Route path="/lifestyle-decor" element={<LifestyleDecor />} />

        {/* Payment & Promotion */}
        <Route path="/promote" element={<PromotionSelection />} />
        <Route path="/payment" element={<PaymentMethod />} />

        {/* Help & Resources */}
        <Route path="/sitemap" element={<SiteMap />} />
        <Route path="/login-required" element={<LoginRequiredPage />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/aboutloop" element={<AboutLoop />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/investors" element={<Investors />} />
        <Route path="/trust" element={<TrustAndSafety />} />
        <Route path="/community" element={<CommunityCenter />} />
        <Route path="/responsible" element={<ResponsibleHosting />} />
        <Route path="/host-experience" element={<HostExperience />} />
        <Route path="/host" element={<HostYourHome />} />
        <Route path="/hosting-resources" element={<HostingResources />} />
        <Route path="/diversity-belonging" element={<DiversityPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/newsroom" element={<Newsroom />} />
        <Route path="/recently-viewed" element={<RecentlyViewedPage />} />

        {/* Private Routes - Protected by authentication */}
        <Route element={<PrivateRoute />}>
          <Route path="/sale" element={<Sale />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/:userId/create-listing" element={<CreateListing />} />
          <Route path="/update-listing/:listingId" element={<UpdateListing />} />
        </Route>

        {/* Additional Routes */}
        <Route path="/private" element={<Private />} />

        {/* Fallback/404 Route - Uncomment if you have a NotFound component */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}