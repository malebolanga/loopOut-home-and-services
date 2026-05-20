// src/components/PageTransition.jsx
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const getSEOData = (pathname) => {
  // Convert basic paths to titles
  const exactMatches = {
    '/': { title: 'LoopOut | Premium Marketplace for Properties, Services, and Events', desc: 'Discover verified helpers, book top services, and explore exclusive properties and events in your area with LoopOut.' },
    '/sign-in': { title: 'Sign In | LoopOut', desc: 'Sign in to access your LoopOut account.' },
    '/sign-up': { title: 'Sign Up | LoopOut', desc: 'Join LoopOut to start discovering premium services and properties.' },
    '/search': { title: 'Search | LoopOut', desc: 'Search for exactly what you need on LoopOut.' },
    '/messages': { title: 'Inbox | LoopOut', desc: 'Check your messages and notifications.' },
    '/dashboard': { title: 'Dashboard | LoopOut', desc: 'Manage your LoopOut experience.' },
    '/host-dashboard': { title: 'Host Dashboard | LoopOut', desc: 'Manage your listings and performance.' },
    '/explore': { title: 'Explore | LoopOut', desc: 'Explore everything LoopOut has to offer.' },
    '/categories': { title: 'All Categories | LoopOut', desc: 'Browse all categories on LoopOut: Properties, Services, Helpers, Events, and more.' },
    '/for-rent': { title: 'For Rent | LoopOut', desc: 'Discover top properties for rent on LoopOut.' },
    '/for-sale': { title: 'For Sale | LoopOut', desc: 'Find properties for sale on LoopOut.' },
    '/pricing': { title: 'Pricing | LoopOut', desc: 'View our transparent pricing options.' },
    '/about': { title: 'About Us | LoopOut', desc: 'Learn more about the LoopOut story and team.' },
    '/contact': { title: 'Contact | LoopOut', desc: 'Get in touch with the LoopOut team.' },
  };

  if (exactMatches[pathname]) return exactMatches[pathname];

  // Dynamic path matching
  if (pathname.includes('/listing/')) return { title: 'Listing Details | LoopOut', desc: 'View complete details for this premium listing.' };
  if (pathname.includes('/user/')) return { title: 'User Profile | LoopOut', desc: 'View user profile and reviews.' };
  if (pathname.includes('/service/')) return { title: 'Service Details | LoopOut', desc: 'View details and book this service.' };
  if (pathname.includes('/event/')) return { title: 'Event Details | LoopOut', desc: 'Discover and book your spot at this event.' };
  if (pathname.includes('/helper/')) return { title: 'Helper Profile | LoopOut', desc: 'View helper skills, rates, and availability.' };

  // Fallback formatting for unknown routes (e.g. "/for-business" -> "For Business | LoopOut")
  const formattedPath = pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Marketplace';

  return { 
    title: `${formattedPath} | LoopOut`,
    desc: 'The ultimate marketplace for properties, services, helpers, and events.'
  };
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  const seoData = getSEOData(location.pathname);

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.desc} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 1.01 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a premium feel
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;
