import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaCalendarCheck, 
  FaHome, 
  FaWallet, 
  FaShieldAlt,
  FaStar,
  FaQuestionCircle,
  FaComments
} from 'react-icons/fa';

export default function HowItWorks() {

  const guestSteps = [
    {
      icon: <FaSearch className="w-8 h-8" />,
      title: "Find something nearby",
      text: "Search or browse categories for places to stay, services, helpers, food, events, and items for sale. Add a location to narrow your results."
    },
    {
      icon: <FaCalendarCheck className="w-8 h-8" />,
      title: "Check the listing details",
      text: "Review photos, price, location, what's included, availability, and reviews. Message the provider if you need to ask a question."
    },
    {
      icon: <FaHome className="w-8 h-8" />,
      title: "Send a request or order",
      text: "Follow the booking or order steps shown on that listing. Review the details before confirming, then follow updates in My LoopOut or My Orders."
    }
  ];

  const hostSteps = [
    {
      icon: <FaHome className="w-8 h-8" />,
      title: "Choose what to offer",
      text: "Sign in, choose Become, and select whether you want to offer a place, service, food, event, or item for sale."
    },
    {
      icon: <FaWallet className="w-8 h-8" />,
      title: "Create a clear listing",
      text: "Add a useful title, accurate description, photos, location, price, and any availability or details customers need."
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Manage requests",
      text: "Keep track of bookings or orders, reply to messages, and update request status from your account tools."
    }
  ];

  const faqs = [
    {
      question: "Do I need an account?",
      answer: "You can browse listings without signing in. You may be asked to sign in to message, book, order, or create a listing."
    },
    {
      question: "How do I offer something on LoopOut?",
      answer: "Sign in, open Become from the menu, choose what you want to offer, and follow the steps to create your listing."
    },
    {
      question: "Where can I check my request?",
      answer: "Check My LoopOut for bookings and activity, or My Orders for food and marketplace orders. The available actions depend on the type and status of the request."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-slate-950 text-white py-16 px-6 dark:bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How LoopOut works
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find local places, services, food, events, and goods—or share what you offer with your community.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/search" className="bg-white text-slate-950 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Explore LoopOut</Link>
            <Link to="/become" className="border-2 border-white/70 px-8 py-3 rounded-lg font-semibold hover:bg-white/10">Offer something</Link>
          </div>
        </div>
      </div>

      {/* Guest Process */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Find and book
          <span className="block text-lg font-normal mt-2 text-gray-600">
            Browse, review the details, and send a booking request or order.
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {guestSteps.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-airbnb-red mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center mb-4">
            <FaStar className="text-rose-500 mr-3 text-2xl" />
            <h3 className="text-xl font-semibold dark:text-white">Helpful tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <FaSearch className="text-rose-500 mt-1 mr-4" />
              <div>
                <h4 className="font-semibold dark:text-white">Compare before confirming</h4>
                <p className="text-gray-600 dark:text-gray-300">Check the listing price, location, inclusions, and cancellation details where shown.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaComments className="text-blue-500 mt-1 mr-4" />
              <div>
                <h4 className="font-semibold dark:text-white">Keep track of updates</h4>
                <p className="text-gray-600 dark:text-gray-300">Use your account pages to follow booking and order status.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Host Process */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Offer on LoopOut
            <span className="block text-lg font-normal mt-2 text-gray-600">
              Create a listing and manage requests from your account.
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {hostSteps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-airbnb-red mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-slate-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-gray-200">
            <h3 className="text-lg font-bold">A good listing answers the basics</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Show clear photos, describe the offer honestly, set a price, and explain location, availability, and any important conditions.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer">
                  <span>{faq.question}</span>
                  <FaQuestionCircle className="text-airbnb-red ml-2 transform transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-gray-600">{faq.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-slate-950 text-white py-16 text-center dark:bg-black">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <div className="flex justify-center gap-4">
          <Link to="/search" className="bg-white text-slate-950 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Browse listings</Link>
          <Link to="/become" className="border-2 border-white/70 px-8 py-3 rounded-lg font-semibold hover:bg-white/10">Become a provider</Link>
        </div>
      </div>
    </div>
  );
}

