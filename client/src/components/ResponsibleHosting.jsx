import React from 'react';
import {
  FaLeaf,
  FaHandshake,
  FaShieldAlt,
  FaBalanceScale,
  FaUsers,
  FaBook,
  FaCheckCircle,
  FaBuilding,
  FaRecycle,
  FaFirstAid,
  FaChartLine,
  FaFilePdf,
  FaMapMarkerAlt,
  FaTools
} from 'react-icons/fa';


export default function ResponsibleHosting() {

  const sustainabilityChecklist = [
    { requirement: "Energy-efficient lighting", points: 20 },
    { requirement: "Low-flow water fixtures", points: 15 },
    { requirement: "Recycling system", points: 25 },
    { requirement: "Solar power option", points: 30 }
  ];

  const legalRequirements = [
    {
      region: "North America",
      items: ["STR permit", "Safety inspection", "Tax registration"]
    },
    {
      region: "European Union",
      items: ["GDPR compliance", "Fire certification", "VAT registration"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            LoupeOut Home Responsible Hosting
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Committed to elevating community standards through ethical, sustainable hospitality practices
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Get Certified
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Host Requirements
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Overview */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaLeaf className="text-green-600 mr-2" />
              Sustainability Score
            </h3>
            <div className="text-4xl font-bold text-airbnb-red mb-2">84/100</div>
            <p className="text-gray-600">Current platform average</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaShieldAlt className="text-blue-600 mr-2" />
              Safety Compliance
            </h3>
            <div className="text-4xl font-bold text-airbnb-red mb-2">98%</div>
            <p className="text-gray-600">Of hosts meet basic requirements</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaHandshake className="text-purple-600 mr-2" />
              Community Impact
            </h3>
            <div className="text-4xl font-bold text-airbnb-red mb-2">$4.2M</div>
            <p className="text-gray-600">Invested in local initiatives</p>
          </div>
        </div>
      </section>

      {/* Sustainability Deep Dive */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 flex items-center">
            <FaLeaf className="mr-3 text-green-600" />
            Green Hosting Program
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-6">Certification Levels</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-green-200 pl-4">
                  <h4 className="font-semibold text-green-600">Green Certified</h4>
                  <p className="text-gray-600">75+ points: Basic sustainability requirements</p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-600">Eco Leader</h4>
                  <p className="text-gray-600">150+ points: Advanced environmental practices</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <h4 className="font-semibold text-green-600">Climate Positive</h4>
                  <p className="text-gray-600">200+ points: Carbon-negative operations</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-6">Checklist for Certification</h3>
              <div className="space-y-4">
                {sustainabilityChecklist.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded">
                    <span>{item.requirement}</span>
                    <span className="text-airbnb-red font-semibold">+{item.points}</span>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full bg-airbnb-red text-white py-2 rounded-lg hover:bg-red-700">
                Download Full Checklist (PDF)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Requirements Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 flex items-center">
          <FaBalanceScale className="mr-3 text-airbnb-red" />
          Global Compliance Standards
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {legalRequirements.map((region, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">{region.region}</h3>
              <ul className="list-disc pl-5 space-y-3">
                {region.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-4 text-airbnb-red font-semibold flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                View Local Requirements
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Accessibility */}
      <section className="bg-airbnb-red text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">Mandatory Safety Standards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Emergency Preparedness</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Fire extinguishers (1 per floor)</li>
                <li>First aid kits</li>
                <li>Emergency exit maps</li>
              </ul>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Accessibility</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>ADA compliance in 15+ markets</li>
                <li>Step-free access options</li>
                <li>Visual fire alarms</li>
              </ul>
            </div>
            
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Smart Technology</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Noise monitoring devices</li>
                <li>Smart locks required</li>
                <li>CO detectors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Host Resources */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12">Host Support Center</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-airbnb-red text-3xl mb-4">
              <FaFilePdf />
            </div>
            <h3 className="text-xl font-semibold mb-2">Documentation Hub</h3>
            <p className="text-gray-600 mb-4">Download legal templates and guides</p>
            <button className="text-airbnb-red font-semibold">
              Access Resources →
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-airbnb-red text-3xl mb-4">
              <FaTools />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compliance Toolkit</h3>
            <p className="text-gray-600 mb-4">Automated permit tracking</p>
            <button className="text-airbnb-red font-semibold">
              Launch Tool →
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Personalized Help?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Contact Support
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Host Community Forum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
