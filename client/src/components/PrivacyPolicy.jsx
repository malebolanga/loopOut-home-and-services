import React from 'react';
import {
  FaShieldAlt,
  FaUserLock,
  FaDatabase,
  FaGlobe,
  FaExchangeAlt,
  FaEnvelope,
  FaFileContract,
  FaKey,
  FaRegClock,
  FaInfoCircle
} from 'react-icons/fa';


  export default function PrivacyPolicy() {
  const dataTypes = [
    {
      category: "Account Data",
      examples: ["Name", "Email", "Payment info", "Government ID"]
    },
    {
      category: "Usage Data",
      examples: ["IP Address", "Device info", "Search history", "Cookies"]
    },
    {
      category: "Transactional Data",
      examples: ["Booking dates", "Payment amounts", "Communication records"]
    }
  ];

  const thirdParties = [
    { name: "Payment Processors", purpose: "Secure transactions" },
    { name: "Analytics Services", purpose: "Usage optimization" },
    { name: "Cloud Providers", purpose: "Data storage" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaShieldAlt className="mr-4" />
            LoupeOut Privacy Policy
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Effective Date: September 1, 2024 | Last Updated: September 1, 2024
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Quick Navigation */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6">Policy Overview</h2>
          <ul className="list-disc pl-5 space-y-3 columns-1 md:columns-2">
            <li><a href="#data-collection" className="text-airbnb-red hover:underline">What We Collect</a></li>
            <li><a href="#data-use" className="text-airbnb-red hover:underline">How We Use Data</a></li>
            <li><a href="#data-sharing" className="text-airbnb-red hover:underline">Sharing Practices</a></li>
            <li><a href="#security" className="text-airbnb-red hover:underline">Security Measures</a></li>
            <li><a href="#rights" className="text-airbnb-red hover:underline">Your Rights</a></li>
            <li><a href="#international" className="text-airbnb-red hover:underline">Global Operations</a></li>
          </ul>
        </div>

        {/* Data Collection Section */}
        <section id="data-collection" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaDatabase className="mr-3 text-airbnb-red" />
            Data We Collect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">{type.category}</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {type.examples.map((ex, i) => (
                    <li key={i} className="text-gray-600">{ex}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Data Usage Section */}
        <section id="data-use" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaExchangeAlt className="mr-3 text-airbnb-red" />
            How We Use Information
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Service Operations</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Facilitate bookings and payments</li>
                  <li>Verify user identities</li>
                  <li>Provide customer support</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Improvements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Enhance platform features</li>
                  <li>Personalize user experience</li>
                  <li>Develop new services</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sharing Section */}
        <section id="data-sharing" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaGlobe className="mr-3 text-airbnb-red" />
            Data Sharing Practices
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Third-Party Partners</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {thirdParties.map((party, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{party.name}</h4>
                  <p className="text-gray-600">{party.purpose}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-gray-600">
              Full list available in our <a href="/third-parties" className="text-airbnb-red hover:underline">Partner Directory</a>
            </p>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaKey className="mr-3 text-airbnb-red" />
            Security Measures
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Technical Safeguards</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>End-to-end encryption</li>
                  <li>Regular security audits</li>
                  <li>Multi-factor authentication</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Organizational Measures</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Employee training programs</li>
                  <li>Data access controls</li>
                  <li>Incident response team</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* User Rights Section */}
        <section id="rights" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaUserLock className="mr-3 text-airbnb-red" />
            Your Rights
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Access & Control</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Request data access</li>
                  <li>Update inaccuracies</li>
                  <li>Delete account data</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Preferences</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Opt-out of marketing</li>
                  <li>Manage cookie settings</li>
                  <li>Limit data sharing</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-airbnb-red/10 rounded-lg">
              <p className="text-airbnb-red">
                Exercise rights through our <a href="/privacy-portal" className="font-semibold hover:underline">Privacy Dashboard</a>
              </p>
            </div>
          </div>
        </section>

        {/* International Transfers */}
        <section id="international" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaGlobe className="mr-3 text-airbnb-red" />
            Global Operations
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start mb-6">
              <FaRegClock className="text-airbnb-red mt-1 mr-4" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Data Transfers</h3>
                <p className="text-gray-600">
                  We utilize GDPR-compliant transfer mechanisms including Standard Contractual Clauses
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FaInfoCircle className="text-airbnb-red mt-1 mr-4" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Regional Addendums</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><a href="/gdpr" className="text-airbnb-red hover:underline">EU/EEA Supplement</a></li>
                  <li><a href="/ccpa" className="text-airbnb-red hover:underline">California Addendum</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Policy Updates */}
        <section className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Policy Changes</h2>
          <div className="flex items-start">
            <FaFileContract className="text-airbnb-red mt-1 mr-4" />
            <div>
              <p className="text-gray-600">
                We'll notify users of material changes via email or platform notice at least 30 days 
                before changes take effect
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Privacy Questions?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Contact DPO
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Request Data Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
