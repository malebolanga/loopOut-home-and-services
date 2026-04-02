// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaCookieBite,
  FaShieldAlt,
  FaChartLine,
  FaUsers,
  FaCog,
  FaExclamationTriangle,
  FaInfoCircle,
  FaRegClock,
  FaHome,
  FaCalendarAlt,
  FaTools
} from 'react-icons/fa';

export default function CookiePolicy() {

  const cookieCategories = [
    {
      type: "Essential",
      icon: <FaShieldAlt />,
      purpose: "Necessary for website functionality",
      examples: ["Authentication", "Security", "Load balancing", "Booking sessions"]
    },
    {
      type: "Performance",
      icon: <FaChartLine />,
      purpose: "Analyze website usage and service performance",
      examples: ["Visitor counts", "Page load speed", "Service analytics", "Event tracking"]
    },
    {
      type: "Functional",
      icon: <FaCog />,
      purpose: "Remember preferences and service settings",
      examples: ["Language settings", "Currency selection", "Listing preferences", "Event reminders"]
    },
    {
      type: "Targeting",
      icon: <FaUsers />,
      purpose: "Personalized content and service recommendations",
      examples: ["Property recommendations", "Event suggestions", "Location-based results", "Service personalization"]
    }
  ];

  const serviceCookies = [
    {
      service: "Property Listings",
      cookies: [
        { name: "listing_preferences", purpose: "Saves your property search filters and preferences", duration: "30 days" },
        { name: "recent_views", purpose: "Tracks recently viewed properties for quick access", duration: "7 days" },
        { name: "map_settings", purpose: "Stores map view and location preferences", duration: "90 days" }
      ]
    },
    {
      service: "Helper Events",
      cookies: [
        { name: "event_registration", purpose: "Manages event sign-up and attendance tracking", duration: "Session" },
        { name: "event_preferences", purpose: "Remembers your event type interests", duration: "60 days" },
        { name: "webinar_attendance", purpose: "Tracks participation in online events and workshops", duration: "30 days" }
      ]
    },
    {
      service: "User Services",
      cookies: [
        { name: "service_preferences", purpose: "Stores your service customization settings", duration: "1 year" },
        { name: "communication_settings", purpose: "Manages notification and contact preferences", duration: "1 year" },
        { name: "support_sessions", purpose: "Maintains support chat continuity", duration: "Session" }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaCookieBite className="mr-4" />
            LoopOut Cookie Policy
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Last Updated: September 1, 2024
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Navigation</h2>
          <ul className="list-disc pl-5 space-y-3">
            <li><a href="#what-are-cookies" className="text-airbnb-red hover:underline">What are cookies?</a></li>
            <li><a href="#types" className="text-airbnb-red hover:underline">Types of cookies we use</a></li>
            <li><a href="#services" className="text-airbnb-red hover:underline">Service-specific cookies</a></li>
            <li><a href="#manage" className="text-airbnb-red hover:underline">Managing preferences</a></li>
            <li><a href="#third-party" className="text-airbnb-red hover:underline">Third-party cookies</a></li>
          </ul>
        </div>

        <div className="space-y-12">
          {/* What Are Cookies Section */}
          <section id="what-are-cookies">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaInfoCircle className="mr-3 text-airbnb-red" />
              Understanding Cookies
            </h2>
            <p className="text-gray-600 mb-6">
              Cookies are small text files stored on your device when you visit websites. 
              LoopOut uses cookies to enhance your experience across our services:
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li>Enable core website functionality and service operations</li>
              <li>Remember your preferences for listings and events</li>
              <li>Analyze service usage and improve performance</li>
              <li>Deliver personalized property and event recommendations</li>
              <li>Maintain secure booking and registration sessions</li>
            </ul>
          </section>

          {/* Cookie Categories */}
          <section id="types">
            <h2 className="text-3xl font-bold mb-8">Cookie Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cookieCategories.map((category, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="text-airbnb-red text-3xl mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{category.type}</h3>
                  <p className="text-gray-600 mb-4">{category.purpose}</p>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Examples include:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {category.examples.map((ex, i) => (
                        <li key={i} className="text-gray-600">{ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Service-Specific Cookies */}
          <section id="services">
            <h2 className="text-3xl font-bold mb-8">Service-Specific Cookies</h2>
            <div className="space-y-8">
              {serviceCookies.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-6">
                    {service.service === "Property Listings" && <FaHome className="text-airbnb-red mr-3 text-2xl" />}
                    {service.service === "Helper Events" && <FaCalendarAlt className="text-airbnb-red mr-3 text-2xl" />}
                    {service.service === "User Services" && <FaTools className="text-airbnb-red mr-3 text-2xl" />}
                    <h3 className="text-2xl font-semibold">{service.service}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 text-left">Cookie Name</th>
                          <th className="p-4 text-left">Purpose</th>
                          <th className="p-4 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.cookies.map((cookie, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4 font-mono text-sm">{cookie.name}</td>
                            <td className="p-4">{cookie.purpose}</td>
                            <td className="p-4">{cookie.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cookie Details Table */}
          <section>
            <h3 className="text-2xl font-bold mb-6">Core Platform Cookies</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left">Cookie Name</th>
                    <th className="p-4 text-left">Purpose</th>
                    <th className="p-4 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-mono text-sm">loop_session</td>
                    <td className="p-4">Authentication and service access</td>
                    <td className="p-4">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-mono text-sm">pref_lang</td>
                    <td className="p-4">Language and regional preferences</td>
                    <td className="p-4">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-mono text-sm">analytics_consent</td>
                    <td className="p-4">Tracking and analytics preferences</td>
                    <td className="p-4">6 months</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-mono text-sm">booking_cart</td>
                    <td className="p-4">Temporary storage of booking selections</td>
                    <td className="p-4">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Management Section */}
          <section id="manage">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaCog className="mr-3 text-airbnb-red" />
              Managing Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Browser Settings</h3>
                <p className="text-gray-600 mb-4">
                  Adjust cookie preferences through your browser:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><a href="#" className="text-airbnb-red hover:underline">Chrome instructions</a></li>
                  <li><a href="#" className="text-airbnb-red hover:underline">Safari instructions</a></li>
                  <li><a href="#" className="text-airbnb-red hover:underline">Firefox instructions</a></li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Our Cookie Tool</h3>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Update preferences for all LoopOut services through our consent manager:
                  </p>
                  <button className="bg-airbnb-red text-white px-6 py-3 rounded-lg hover:bg-red-700 w-full">
                    Update Cookie Settings
                  </button>
                  <p className="text-sm text-gray-500">
                    Control cookies for listings, events, and all platform services
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Section */}
          <section id="third-party">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaExclamationTriangle className="mr-3 text-airbnb-red" />
              Third-Party Cookies
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-gray-600 mb-4">
                We partner with trusted services that may set cookies to enhance our platform:
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <strong>Google Analytics:</strong> Website usage statistics and service analytics
                  <br />
                  <a href="#" className="text-airbnb-red hover:underline">Opt-out tool</a>
                </li>
                <li>
                  <strong>Stripe:</strong> Payment processing for bookings and event registrations
                  <br />
                  <a href="#" className="text-airbnb-red hover:underline">Privacy policy</a>
                </li>
                <li>
                  <strong>Event Management Platforms:</strong> Helper event registration and management
                  <br />
                  <a href="#" className="text-airbnb-red hover:underline">Learn more</a>
                </li>
                <li>
                  <strong>Map Services:</strong> Property location and mapping features
                  <br />
                  <a href="#" className="text-airbnb-red hover:underline">Location services info</a>
                </li>
              </ul>
            </div>
          </section>

          {/* Legal Compliance */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Regulatory Information</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-start mb-4">
                <FaRegClock className="text-airbnb-red mt-1 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold">Data Retention</h3>
                  <p className="text-gray-600">
                    Cookie duration ranges from session-only to 2 years maximum, with service-specific cookies 
                    optimized for your listing and event experience.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaShieldAlt className="text-airbnb-red mt-1 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold">GDPR & CCPA</h3>
                  <p className="text-gray-600">
                    Users in EU and California have additional rights under
                    <a href="/privacy" className="text-airbnb-red hover:underline ml-2">
                      our Privacy Policy
                    </a>. This includes specific controls for property listing and event registration data.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Need More Information?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Contact Privacy Team
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Full Privacy Policy
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Service Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}