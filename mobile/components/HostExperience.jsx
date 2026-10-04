import React, { useState } from 'react';
import {
  FaMapMarkerAlt,
  FaCalendarCheck,
  FaUsers,
  FaCoins,
  FaShieldAlt,
  FaLightbulb,
  FaStar,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaHandsHelping
} from 'react-icons/fa';

export default function HostExperience() {

  const [experienceType, setExperienceType] = useState('cultural');
  const [price, setPrice] = useState(75);
  const [groupSize, setGroupSize] = useState(8);

  const earningsCalculator = price * groupSize * 0.80; // 20% service fee

  const experienceTypes = [
    {
      id: 'cultural',
      title: 'Cultural Immersion',
      examples: ['Traditional cooking classes', 'Local craft workshops', 'Historical tours']
    },
    {
      id: 'adventure',
      title: 'Adventure & Nature',
      examples: ['Guided hiking tours', 'Wildlife safaris', 'Water sports excursions']
    },
    {
      id: 'creative',
      title: 'Creative Arts',
      examples: ['Photography walks', 'Street art tours', 'Pottery workshops']
    }
  ];

  const hostingSteps = [
    {
      icon: <FaLightbulb />,
      title: "Design Your Experience",
      content: "Create a unique offering that showcases your expertise"
    },
    {
      icon: <FaCalendarCheck />,
      title: "Set Availability",
      content: "Choose dates and frequency that work for you"
    },
    {
      icon: <FaUsers />,
      title: "Host Guests",
      content: "Share your passion with small groups"
    }
  ];

  const benefits = [
    {
      icon: <FaShieldAlt />,
      title: "$1M Liability Insurance",
      content: "Protection included for all experiences"
    },
    {
      icon: <FaStar />,
      title: "Marketing Support",
      content: "Featured in our global marketplace"
    },
    {
      icon: <FaCoins />,
      title: "Flexible Pricing",
      content: "Set your own rates and group sizes"
    }
  ];

  const faqs = [
    {
      question: "What qualifications do I need?",
      answer: "Passion and expertise in your subject matter - no formal credentials required"
    },
    {
      question: "How are payments handled?",
      answer: "Secure payments processed through our platform with weekly payouts"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Share Your Passion, Earn Money
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create memorable experiences for travelers and earn income doing what you love
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Get Started
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Experience Builder */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Build Your Experience
          </h2>
          
          {/* Experience Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {experienceTypes.map((type) => (
              <div 
                key={type.id}
                onClick={() => setExperienceType(type.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  experienceType === type.id 
                    ? 'border-2 border-airbnb-red bg-red-50' 
                    : 'border hover:border-gray-300'
                }`}
              >
                <h3 className="text-xl font-semibold mb-4">{type.title}</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  {type.examples.map((ex, i) => (
                    <li key={i} className="mb-2">{ex}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Earnings Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <label className="block mb-3">
                  <span className="block mb-2">Price per person ($)</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </label>
              </div>
              <div className="mb-6">
                <label className="block mb-3">
                  <span className="block mb-2">Average group size</span>
                  <input
                    type="number"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </label>
              </div>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Potential Earnings</h3>
              <div className="text-4xl font-bold text-airbnb-red mb-4">
                ${earningsCalculator.toLocaleString()}/session
              </div>
              <p className="text-gray-600">
                After 20% service fee
              </p>
              <div className="mt-4 text-sm text-gray-600">
                <FaStar className="inline mr-2 text-yellow-400" />
                Top hosts earn $5,000+/month
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hosting Process */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          How Experience Hosting Works
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
            Why Host Experiences With Us
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

      {/* Success Stories */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Host Success Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <h3 className="font-semibold">Maria, Lisbon</h3>
                <p className="text-gray-600">Food & Culture Host</p>
              </div>
            </div>
            <p className="text-gray-600">
              "Hosting cooking classes has allowed me to share my family recipes while earning 
              enough to start my own culinary school!"
            </p>
            <div className="mt-4 text-airbnb-red font-semibold">
              $8,200+ earned
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <h3 className="font-semibold">Takashi, Tokyo</h3>
                <p className="text-gray-600">Urban Exploration Host</p>
              </div>
            </div>
            <p className="text-gray-600">
              "Showing visitors hidden gems of Tokyo has become my full-time passion 
              and provides a stable income."
            </p>
            <div className="mt-4 text-airbnb-red font-semibold">
              $12,500+ earned
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Experience Hosting FAQs
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
            Ready to Share Your Expertise?
          </h2>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Start Creating
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Contact Host Advisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

