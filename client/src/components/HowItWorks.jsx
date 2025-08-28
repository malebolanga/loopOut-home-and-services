import React from 'react';
import { 
  FaSearch, 
  FaCalendarCheck, 
  FaHome, 
  FaWallet, 
  FaShieldAlt,
  FaStar,
  FaQuestionCircle,
  FaHandshake,
  FaComments
} from 'react-icons/fa';

export default function HowItWorks() {

  const guestSteps = [
    {
      icon: <FaSearch className="w-8 h-8" />,
      title: "Discover Unique Spaces",
      text: "Search our global collection of homes, experiences, and unique properties using intuitive filters"
    },
    {
      icon: <FaCalendarCheck className="w-8 h-8" />,
      title: "Book with Confidence",
      text: "Check real-time availability, read verified reviews, and secure your stay with our protected booking system"
    },
    {
      icon: <FaHome className="w-8 h-8" />,
      title: "Enjoy Your Stay",
      text: "Access detailed arrival instructions, host contact info, and 24/7 support during your experience"
    }
  ];

  const hostSteps = [
    {
      icon: <FaHome className="w-8 h-8" />,
      title: "List Your Space",
      text: "Create your free listing with photos, descriptions, and availability using our step-by-step guide"
    },
    {
      icon: <FaWallet className="w-8 h-8" />,
      title: "Manage Bookings",
      text: "Use our host dashboard to handle reservations, communicate with guests, and set house rules"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Earn Securely",
      text: "Receive payments through our protected system with automatic deposits and insurance options"
    }
  ];

  const faqs = [
    {
      question: "How does cancellation work?",
      answer: "Cancellation policies vary by listing. Guests can view policy details before booking, and hosts choose from standardized policy options."
    },
    {
      question: "How do I become a host?",
      answer: "Anyone can list their space by creating a free host account. Our team verifies new listings to ensure quality standards."
    },
    {
      question: "Is my payment secure?",
      answer: "We use bank-level encryption and never share your financial information. Payments are only released to hosts after successful stays."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How LoupeOut Works
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover the simple way to experience unique spaces or earn money hosting travelers
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Start Exploring
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Become a Host
            </button>
          </div>
        </div>
      </div>

      {/* Guest Process */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          For Guests
          <span className="block text-lg font-normal mt-2 text-gray-600">
            Experience unique stays in 3 simple steps
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

        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center mb-4">
            <FaStar className="text-airbnb-red mr-3 text-2xl" />
            <h3 className="text-xl font-semibold">Key Guest Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <FaShieldAlt className="text-green-500 mt-1 mr-4" />
              <div>
                <h4 className="font-semibold">Booking Protection</h4>
                <p className="text-gray-600">24-hour reservation review and fraud detection</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaComments className="text-blue-500 mt-1 mr-4" />
              <div>
                <h4 className="font-semibold">Instant Messaging</h4>
                <p className="text-gray-600">Direct communication with hosts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Host Process */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            For Hosts
            <span className="block text-lg font-normal mt-2 text-gray-600">
              Turn your space into income in 3 easy steps
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

          <div className="bg-airbnb-red text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <FaHandshake className="text-white mr-3 text-2xl" />
              <h3 className="text-xl font-semibold">Host Benefits</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold">$3,000+</h4>
                <p className="opacity-90">Average annual earnings per host</p>
              </div>
              <div>
                <h4 className="font-semibold">1M+</h4>
                <p className="opacity-90">Active travelers worldwide</p>
              </div>
              <div>
                <h4 className="font-semibold">24/7</h4>
                <p className="opacity-90">Host support team available</p>
              </div>
            </div>
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
      <div className="bg-airbnb-red text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Browse Listings
          </button>
          <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
            Host Your Space
          </button>
        </div>
      </div>
    </div>
  );
}

