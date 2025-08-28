/* eslint-disable no-unused-vars */
import React from 'react';
import {
  FaHome,
  FaUsers,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaBookOpen,
  FaInfoCircle,
  FaBriefcase,

  FaQuestionCircle,
  FaFileContract
} from 'react-icons/fa';

export default function SiteMap() {

  const siteSections = [
    {
      title: "Hosting",
      icon: <FaHome />,
      links: [
        { name: "Become a Host", url: "/host" },
        { name: "Host Resources", url: "/hosting-resources" },
        { name: "Create Listing", url: "/create-listing" },
        { name: "Host Dashboard", url: "/dashboard" },
        { name: "Host Protection", url: "/host-protection" }
      ]
    },
    {
      title: "Experiences",
      icon: <FaMapMarkerAlt />,
      links: [
        { name: "Adventure", url: "/experiences/adventure" },
        { name: "Cultural", url: "/experiences/cultural" },
        { name: "Creative", url: "/experiences/creative" },
        { name: "Host an Experience", url: "/host-experience" },
        { name: "Experience Resources", url: "/experience-resources" }
      ]
    },
    {
      title: "Community",
      icon: <FaUsers />,
      links: [
        { name: "Community Center", url: "/community" },
        { name: "Host Forums", url: "/forums" },
        { name: "Local Events", url: "/events" },
        { name: "Mentorship Program", url: "/mentorship" },
        { name: "Neighborhood Groups", url: "/neighborhoods" }
      ]
    },
    {
      title: "Company",
      icon: <FaInfoCircle />,
      links: [
        { name: "About Us", url: "/about" },
        { name: "Newsroom", url: "/newsroom" },
        { name: "Careers", url: "/careers" },
        { name: "Investors", url: "/investors" },
        { name: "Sustainability", url: "/sustainability" }
      ]
    },
    {
      title: "Support",
      icon: <FaQuestionCircle />,
      links: [
        { name: "Help Center", url: "/help" },
        { name: "Safety Center", url: "/safety" },
        { name: "Contact Us", url: "/contact" },
        { name: "COVID-19 Resources", url: "/covid" },
        { name: "Accessibility", url: "/accessibility" }
      ]
    },
    {
      title: "Legal",
      icon: <FaFileContract />,
      links: [
        { name: "Terms of Service", url: "/terms" },
        { name: "Privacy Policy", url: "/privacy" },
        { name: "Cookie Policy", url: "/cookies" },
        { name: "Non-Discrimination", url: "/non-discrimination" },
        { name: "Legal Requests", url: "/legal" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            LoupeOut Home Site Map
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Navigate our platform with ease - explore all features and resources
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaShieldAlt className="mr-3 text-airbnb-red" />
              Trust & Safety
            </h3>
            <ul className="space-y-2">
              <li><a href="/trust" className="text-airbnb-red hover:underline">Trust Center</a></li>
              <li><a href="/verification" className="text-airbnb-red hover:underline">Verification Process</a></li>
              <li><a href="/reviews" className="text-airbnb-red hover:underline">Review System</a></li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaBookOpen className="mr-3 text-airbnb-red" />
              Resources
            </h3>
            <ul className="space-y-2">
              <li><a href="/blog" className="text-airbnb-red hover:underline">Travel Blog</a></li>
              <li><a href="/guides" className="text-airbnb-red hover:underline">City Guides</a></li>
              <li><a href="/host-academy" className="text-airbnb-red hover:underline">Host Academy</a></li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaBriefcase className="mr-3 text-airbnb-red" />
              Business
            </h3>
            <ul className="space-y-2">
              <li><a href="/work" className="text-airbnb-red hover:underline">Work Travel</a></li>
              <li><a href="/teams" className="text-airbnb-red hover:underline">Team Bookings</a></li>
              <li><a href="/partners" className="text-airbnb-red hover:underline">Partnerships</a></li>
            </ul>
          </div>
        </div>

        {/* Full Site Map */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {siteSections.map((section, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="text-airbnb-red mr-3">{section.icon}</span>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.url} className="text-gray-700 hover:text-airbnb-red hover:underline">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Links */}
        <div className="mt-12 bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-6">Account & Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/signin" className="text-airbnb-red hover:underline">Sign In</a>
            <a href="/signup" className="text-airbnb-red hover:underline">Create Account</a>
            <a href="/profile" className="text-airbnb-red hover:underline">Profile Settings</a>
            <a href="/security" className="text-airbnb-red hover:underline">Security</a>
            <a href="/payments" className="text-airbnb-red hover:underline">Payment Methods</a>
            <a href="/notifications" className="text-airbnb-red hover:underline">Notifications</a>
            <a href="/language" className="text-airbnb-red hover:underline">Language</a>
            <a href="/currency" className="text-airbnb-red hover:underline">Currency</a>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Can t Find What You Need?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Contact Support
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Search Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
