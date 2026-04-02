// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaBalanceScale,
  FaFileContract,
  FaUserShield,
  FaExclamationTriangle,
  FaGavel,
  FaGlobe,
  FaInfoCircle,
  FaShieldAlt,
  FaLock,
  FaLink,
  FaCookieBite,
  FaEye,
  FaCopy,
  FaBan,
  FaUserCheck,
  FaHandshake
} from 'react-icons/fa';

export default function Terms() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaBalanceScale className="mr-4" />
            LoopOut Terms and Conditions
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
          <h2 className="text-2xl font-bold mb-6">Key Sections</h2>
          <ul className="list-disc pl-5 space-y-3 columns-1 md:columns-2">
            <li><a href="#introduction" className="text-airbnb-red hover:underline">Introduction</a></li>
            <li><a href="#clients" className="text-airbnb-red hover:underline">Application to Clients</a></li>
            <li><a href="#users" className="text-airbnb-red hover:underline">Application to Users</a></li>
            <li><a href="#obligations" className="text-airbnb-red hover:underline">LOH Obligations</a></li>
            <li><a href="#website-use" className="text-airbnb-red hover:underline">Website Use</a></li>
            <li><a href="#restrictions" className="text-airbnb-red hover:underline">Restrictions</a></li>
            <li><a href="#privacy" className="text-airbnb-red hover:underline">Privacy Policy</a></li>
            <li><a href="#intellectual" className="text-airbnb-red hover:underline">Intellectual Property</a></li>
            <li><a href="#governing" className="text-airbnb-red hover:underline">Governing Law</a></li>
          </ul>
        </div>

        {/* Introduction Section */}
        <section id="introduction" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaFileContract className="mr-3 text-airbnb-red" />
            Introduction
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-4">
              <div className="flex items-start">
                <FaInfoCircle className="text-airbnb-red mt-1 mr-4" />
                <p className="flex-1 text-gray-600">
                  LoopOut Home (Pty) Ltd hosts a website under domain name www.privateproperty.co.za (the Website) for the online marketing of property listings for sale or for rent and the advertising of service providers in the real estate, legal and related industries (collectively Advertisements).
                </p>
              </div>
              <div className="flex items-start">
                <FaExclamationTriangle className="text-airbnb-red mt-1 mr-4" />
                <p className="flex-1 text-gray-600">
                  These Website Standard Terms and Conditions written on this webpage shall manage your use of the website. By using this Website, you agree to accept all terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Application to Clients */}
        <section id="clients" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaUserCheck className="mr-3 text-airbnb-red" />
            Application to Clients
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-4">
              <div className="flex items-start">
                <FaHandshake className="text-airbnb-red mt-1 mr-4" />
                <p className="flex-1 text-gray-600">
                  These STCs are applicable together with the signed agreement (the Contract) concluded between LOH and each client who advertises on the Website (Client).
                </p>
              </div>
              <div className="flex items-start">
                <FaExclamationTriangle className="text-airbnb-red mt-1 mr-4" />
                <p className="flex-1 text-gray-600">
                  If there is any discrepancy or conflict between these STCs and the Contract, the provisions of the Contract will apply.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Application to Users */}
        <section id="users" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaUserShield className="mr-3 text-airbnb-red" />
            Application to Users
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start">
              <FaInfoCircle className="text-airbnb-red mt-1 mr-4" />
              <p className="flex-1 text-gray-600">
                By logging in, registering on, accessing or using the Website, all persons making use of the Website (Users) agree to be bound by these STCs, except those provisions which, explicitly or implicitly, only apply to Clients.
              </p>
            </div>
          </div>
        </section>

        {/* LOH General Obligations */}
        <section id="obligations" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaShieldAlt className="mr-3 text-airbnb-red" />
            LOH General Obligations and Warranties
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start">
                <FaHandshake className="text-airbnb-red mt-1 mr-4" />
                <p className="flex-1 text-gray-600">
                  LOH must provide the following services to the Clients and Users:
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Advertisement Display</h4>
                  <p className="text-gray-600">Display and market Advertisements on the Website</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Support Service</h4>
                  <p className="text-gray-600">Telephonic support Monday-Friday, 08:00-17:00</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Website Availability</h4>
                  <p className="text-gray-600">24/7 accessibility and operation</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Security</h4>
                  <p className="text-gray-600">Virus-free downloads and applications</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use of the Website */}
        <section id="website-use" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaGlobe className="mr-3 text-airbnb-red" />
            Use of the Website
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start">
                <FaEye className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Accuracy Disclaimer</h4>
                  <p className="text-gray-600">LOH does not verify or warrant the accuracy or completeness of Advertisements</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCookieBite className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Cookies</h4>
                  <p className="text-gray-600">We use cookies to personalize visits and track preferences</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaLink className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Linking Policy</h4>
                  <p className="text-gray-600">No linking without prior written consent; third-party links used at your own risk</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restrictions */}
        <section id="restrictions" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaBan className="mr-3 text-airbnb-red" />
            Restrictions
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Content Publishing</h4>
                <p className="text-gray-600">No publishing Website material in other media</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Commercial Use</h4>
                <p className="text-gray-600">No selling or commercializing Website material</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Damaging Use</h4>
                <p className="text-gray-600">No use that damages the Website or impacts access</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Data Mining</h4>
                <p className="text-gray-600">No data mining, harvesting, or extracting</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Unauthorized Marketing</h4>
                <p className="text-gray-600">No unauthorized advertising or marketing</p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section id="privacy" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaLock className="mr-3 text-airbnb-red" />
            Privacy Policy and Personal Information
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start">
                <FaUserShield className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <p className="text-gray-600">We collect name, contact details, property searches, and usage data</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaInfoCircle className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Usage Purpose</h4>
                  <p className="text-gray-600">Personal Info is used to compile the Website and provide services</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaHandshake className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Consent</h4>
                  <p className="text-gray-600">By using the Website, you consent to our use of Personal Info for communication, improvement, and business purposes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section id="intellectual" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaCopy className="mr-3 text-airbnb-red" />
            Intellectual Property and Indemnities
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start">
                <FaShieldAlt className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Ownership</h4>
                  <p className="text-gray-600">All Website content, trademarks, and source code are LOH intellectual property</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaBan className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Prohibited Actions</h4>
                  <p className="text-gray-600">No reverse-engineering, copying, or unauthorized monitoring</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaHandshake className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold mb-2">Limited License</h4>
                  <p className="text-gray-600">Users granted limited license only for viewing Website material</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section id="governing" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaGavel className="mr-3 text-airbnb-red" />
            Governing Law
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start">
              <FaBalanceScale className="text-airbnb-red mt-1 mr-4" />
              <div>
                <p className="text-gray-600">
                  This Agreement shall be governed by and construed in accordance with the internal laws of the Republic of South Africa without giving effect to any choice or conflict of law provision or rule.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Questions About Our Terms?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Contact Legal Team
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              View Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}