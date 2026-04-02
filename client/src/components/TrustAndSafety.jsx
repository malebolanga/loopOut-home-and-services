// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaShieldAlt,
  FaUserCheck,
  FaCamera,
  FaLock,
  
  FaFileContract,
  FaUsers,
  FaPhoneAlt,
  FaSearch,
  FaBalanceScale,
  FaMedal
} from 'react-icons/fa';


export default function TrustAndSafety() {

  const verificationSteps = [
    {
      icon: <FaUserCheck />,
      title: "Identity Verification",
      content: "Government ID scan + live selfie check"
    },
    {
      icon: <FaFileContract />,
      title: "Background Checks",
      content: "Global criminal record screening"
    },
    {
      icon: <FaMedal />,
      title: "Reputation Review",
      content: "Platform activity and review analysis"
    }
  ];

  const safetyFeatures = [
    {
      icon: <FaShieldAlt />,
      title: "Host Protection Insurance",
      content: "$2M property damage coverage"
    },
    {
      icon: <FaLock />,
      title: "Secure Payments",
      content: "Bank-level encryption for all transactions"
    },
    {
      icon: <FaCamera />,
      title: "Smart Home Monitoring",
      content: "Noise & occupancy sensors (optional)"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            LoupeOut Trust & Safety
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Our commitment to secure, transparent, and responsible hospitality
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Safety Resources
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Report Concern
            </button>
          </div>
        </div>
      </div>

      {/* Trust Metrics */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-airbnb-red">99.97%</div>
            <p className="text-gray-600">Verified Users</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-airbnb-red">24/7</div>
            <p className="text-gray-600">Safety Support</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-airbnb-red">1M+</div>
            <p className="text-gray-600">Annual Safety Checks</p>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 flex items-center">
            <FaShieldAlt className="mr-3 text-airbnb-red" />
            3-Layer Verification System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {verificationSteps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-airbnb-red text-3xl mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12">Core Safety Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safetyFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-airbnb-red text-3xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Support */}
      <section className="bg-airbnb-red text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">24/7 Safety Line</h2>
              <div className="flex items-center mb-4">
                <FaPhoneAlt className="text-3xl mr-4" />
                <div>
                  <div className="text-2xl font-bold">1-800-LOUPE-SAFE</div>
                  <p>Global emergency assistance</p>
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-3">
                <li>Immediate crisis response</li>
                <li>Local law enforcement coordination</li>
                <li>Medical emergency support</li>
              </ul>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
              <div className="space-y-4">
                <button className="w-full bg-white text-airbnb-red py-3 rounded-lg font-semibold hover:bg-gray-100">
                  Live Chat Support
                </button>
                <button className="w-full border-2 border-white py-3 rounded-lg font-semibold hover:bg-white/10">
                  Safety Checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 flex items-center">
          <FaUsers className="mr-3 text-airbnb-red" />
          Community Standards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Content Moderation</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li>AI-powered message screening</li>
              <li>Manual profile reviews</li>
              <li>Real-time booking monitoring</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Policy Enforcement</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <FaSearch className="text-airbnb-red mt-1 mr-3" />
                <div>
                  <h4 className="font-semibold">Proactive Monitoring</h4>
                  <p className="text-gray-600">200+ risk detection parameters</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaBalanceScale className="text-airbnb-red mt-1 mr-3" />
                <div>
                  <h4 className="font-semibold">Fair Review System</h4>
                  <p className="text-gray-600">Verified stays only policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">Safety Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Host Safety Kit</h3>
              <ul className="list-disc pl-5 space-y-3">
                <li>Emergency contact templates</li>
                <li>Property safety checklist</li>
                <li>Insurance claim guide</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Guest Preparedness</h3>
              <ul className="list-disc pl-5 space-y-3">
                <li>Travel safety courses</li>
                <li>Neighborhood safety ratings</li>
                <li>Emergency phrasebook</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting System */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Incident Reporting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">24/7 Response Team</h3>
              <ul className="list-disc pl-5 space-y-3">
                <li>Average 8-minute response time</li>
                <li>Multilingual support</li>
                <li>Local authority coordination</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Anonymous Reporting</h3>
              <div className="space-y-4">
                <button className="w-full bg-airbnb-red text-white py-3 rounded-lg font-semibold hover:bg-red-700">
                  File Report
                </button>
                <button className="w-full border-2 border-airbnb-red text-airbnb-red py-3 rounded-lg font-semibold hover:bg-red-50">
                  Check Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Your Safety Matters</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Emergency Help
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Safety Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
