import React, { useState } from 'react';
import {
  FaHome,
  FaCoins,
  FaShieldAlt,
  FaChartLine,
  FaCamera,
  FaStar,
  FaUsers,
  FaFileAlt,
  FaQuestionCircle,
  FaPhone
} from 'react-icons/fa';


  export default function HostYourHome() {
  const [price, setPrice] = useState(150);
  const [nights, setNights] = useState(15);
  
  const earningsCalculator = price * nights * 0.97; // 3% service fee

  const hostingSteps = [
    {
      icon: <FaHome />,
      title: "List Your Space",
      content: "Create a free listing with photos and details"
    },
    {
      icon: <FaUsers />,
      title: "Welcome Guests",
      content: "Set house rules and availability"
    },
    {
      icon: <FaCoins />,
      title: "Get Paid",
      content: "Receive secure payments after each stay"
    }
  ];

  const benefits = [
    {
      icon: <FaShieldAlt />,
      title: "Host Protection",
      content: "$1M property damage protection"
    },
    {
      icon: <FaStar />,
      title: "5-Star Support",
      content: "24/7 customer service"
    },
    {
      icon: <FaChartLine />,
      title: "Pricing Tools",
      content: "Smart pricing recommendations"
    }
  ];

  const faqs = [
    {
      question: "How much can I earn?",
      answer: "Hosts typically earn $3,000+/year. Use our calculator above"
    },
    {
      question: "What are the requirements?",
      answer: "You need a safe, clean space and basic amenities"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Earn Money Hosting Your Space
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of hosts earning extra income by sharing their homes
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Get Started
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Calculate Earnings
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Calculator */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Estimate Your Earnings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block mb-4">
                <span className="block mb-2">Nightly Rate ($)</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </label>
              <label className="block mb-4">
                <span className="block mb-2">Monthly Bookings</span>
                <input
                  type="number"
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </label>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Projected Earnings</h3>
              <div className="text-4xl font-bold text-airbnb-red mb-4">
                ${earningsCalculator.toLocaleString()}/mo
              </div>
              <p className="text-gray-600">
                After 3% service fee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hosting Process */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          How Hosting Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hostingSteps.map((step, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-airbnb-red text-4xl mb-4 mx-auto">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why Host with Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-airbnb-red text-3xl mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listing Tips */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              <FaCamera className="inline mr-3 text-airbnb-red" />
              Create a Great Listing
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaStar className="text-airbnb-red mt-1 mr-3" />
                High-quality photos increase bookings by 40%
              </li>
              <li className="flex items-start">
                <FaStar className="text-airbnb-red mt-1 mr-3" />
                Detailed descriptions help guests feel confident
              </li>
              <li className="flex items-start">
                <FaStar className="text-airbnb-red mt-1 mr-3" />
                Set clear house rules and amenities
              </li>
            </ul>
          </div>
          <div className="bg-gray-200 rounded-xl h-64">
            {/* Image placeholder */}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Hosting Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
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

      {/* Final CTA */}
      <div className="bg-airbnb-red text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Become a Host?
          </h2>
          <p className="text-xl mb-8">
            Join our community of successful hosts today
          </p>
          <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Start Your Listing
          </button>
        </div>
      </div>
    </div>
  );
}
