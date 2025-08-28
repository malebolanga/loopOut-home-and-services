/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaHome,
  FaCoins,
  FaBookOpen,
  FaUsers,
  FaToolbox,
  FaChartLine,
  FaVideo,
  FaFileContract,
 
  FaComments,
 
  FaQuestionCircle
} from 'react-icons/fa';

export default function HostingResources() {

  const gettingStarted = [
    {
      step: 1,
      title: "Create Your Listing",
      content: "Learn how to showcase your space with great photos and descriptions"
    },
    {
      step: 2,
      title: "Set Your Price",
      content: "Use our pricing tool to find the optimal rate for your market"
    },
    {
      step: 3,
      title: "Welcome Guests",
      content: "Master check-in procedures and communication best practices"
    }
  ];

  const resources = [
    {
      icon: <FaToolbox />,
      title: "Hosting Toolkit",
      content: "Downloadable checklists and templates"
    },
    {
      icon: <FaChartLine />,
      title: "Performance Dashboard",
      content: "Track your bookings and earnings"
    },
    {
      icon: <FaFileContract />,
      title: "Legal Guides",
      content: "Local regulations and rental agreements"
    }
  ];

  const faqs = [
    {
      question: "How do I handle difficult guests?",
      answer: "Access our de-escalation guide and 24/7 support line"
    },
    {
      question: "What insurance do I need?",
      answer: "Learn about our Host Protection Insurance program"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Hosting Resources Center
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Everything you need to succeed as a LoupeOut host
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Start Hosting
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Existing Host Tools
            </button>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center">
          <FaHome className="mr-3 text-airbnb-red" />
          New Host Journey
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gettingStarted.map((step) => (
            <div key={step.step} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-airbnb-red text-white w-8 h-8 rounded-full flex items-center justify-center">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold ml-4">{step.title}</h3>
              </div>
              <p className="text-gray-600">{step.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Resources */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <FaVideo className="mr-3 text-airbnb-red" />
                Video Guides
              </h2>
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-xl overflow-hidden">
                <iframe 
                  src="https://www.youtube.com/embed/example" 
                  className="w-full h-full"
                  title="Hosting Tutorial"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <FaBookOpen className="mr-3 text-airbnb-red" />
                Knowledge Base
              </h2>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">Optimizing Your Listing</h3>
                  <p className="text-gray-600 text-sm">SEO tips and photography guides</p>
                </div>
                <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">Seasonal Pricing Strategies</h3>
                  <p className="text-gray-600 text-sm">Maximize your earnings year-round</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Tools */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center">
          <FaCoins className="mr-3 text-airbnb-red" />
          Financial Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Earnings Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Nightly Rate</label>
                <input type="number" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm mb-2">Occupancy Rate</label>
                <input type="number" className="w-full p-2 border rounded" />
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-semibold">Estimated Monthly Earnings: <span className="text-airbnb-red">$2,800</span></p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Tax Resources</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaFileContract className="mr-2 text-airbnb-red" />
                Deduction Checklist
              </li>
              <li className="flex items-center">
                <FaFileContract className="mr-2 text-airbnb-red" />
                Local Tax Guides
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Community Support */}
      <section className="bg-airbnb-red text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Host Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaUsers className="mr-2" />
                Local Meetups
              </h3>
              <p>Connect with hosts in your area</p>
              <button className="mt-4 border-2 border-white px-4 py-2 rounded-lg hover:bg-white/10">
                Find Events
              </button>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaComments className="mr-2" />
                Discussion Forum
              </h3>
              <p>Get advice from experienced hosts</p>
              <button className="mt-4 border-2 border-white px-4 py-2 rounded-lg hover:bg-white/10">
                Join Conversations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Hosting Support
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
    </div>
  );
}
