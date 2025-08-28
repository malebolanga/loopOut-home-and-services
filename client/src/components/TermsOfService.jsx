// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaBalanceScale,
  FaFileContract,
  FaUserShield,
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaGavel,
  FaGlobe,
  FaExchangeAlt,
  FaCommentDots,
  FaInfoCircle
} from 'react-icons/fa';


export default function TermsOfService() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaBalanceScale className="mr-4" />
            LoupeOut Terms of Service
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
            <li><a href="#acceptance" className="text-airbnb-red hover:underline">Acceptance of Terms</a></li>
            <li><a href="#accounts" className="text-airbnb-red hover:underline">Account Management</a></li>
            <li><a href="#responsibilities" className="text-airbnb-red hover:underline">User Responsibilities</a></li>
            <li><a href="#payments" className="text-airbnb-red hover:underline">Payment Terms</a></li>
            <li><a href="#content" className="text-airbnb-red hover:underline">Content Policy</a></li>
            <li><a href="#termination" className="text-airbnb-red hover:underline">Termination</a></li>
            <li><a href="#disputes" className="text-airbnb-red hover:underline">Dispute Resolution</a></li>
            <li><a href="#liability" className="text-airbnb-red hover:underline">Liability Limits</a></li>
          </ul>
        </div>

        {/* Acceptance Section */}
        <section id="acceptance" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaFileContract className="mr-3 text-airbnb-red" />
            Acceptance of Terms
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-4">
              By accessing or using LoupeOut services, you agree to be bound by these Terms and our Policies.
            </p>
            <div className="flex items-start mb-4">
              <FaExclamationTriangle className="text-airbnb-red mt-1 mr-4" />
              <p className="flex-1">
                Continued use after changes constitutes acceptance of revised terms
              </p>
            </div>
          </div>
        </section>

        {/* Account Management */}
        <section id="accounts" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaUserShield className="mr-3 text-airbnb-red" />
            Account Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Registration</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Must be 18+ years old</li>
                <li>Valid government ID verification</li>
                <li>Accurate information required</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Security</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>You re responsible for account security</li>
                <li>Immediately report unauthorized access</li>
                <li>We may suspend suspicious accounts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* User Responsibilities */}
        <section id="responsibilities" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaGavel className="mr-3 text-airbnb-red" />
            User Responsibilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Hosts</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Accurate listing descriptions</li>
                <li>Compliance with local laws</li>
                <li>Maintain proper insurance</li>
                <li>Honor booking commitments</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Guests</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Respect property rules</li>
                <li>No unauthorized parties</li>
                <li>Report damages promptly</li>
                <li>Follow checkout procedures</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Payment Terms */}
        <section id="payments" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaMoneyCheckAlt className="mr-3 text-airbnb-red" />
            Payment Terms
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Fees</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>3% service fee for guests</li>
                  <li>15% host commission</li>
                  <li>Taxes additional</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Disbursements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>24-hour payment hold</li>
                  <li>Weekly host payouts</li>
                  <li>Chargeback policies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Content Policy */}
        <section id="content" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaCommentDots className="mr-3 text-airbnb-red" />
            Content Policy
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start mb-4">
              <FaExclamationTriangle className="text-airbnb-red mt-1 mr-4" />
              <p>Prohibited content includes:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Illegal Content</h4>
                <p className="text-gray-600">Violates local laws</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Discriminatory</h4>
                <p className="text-gray-600">Hate speech or bias</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Commercial</h4>
                <p className="text-gray-600">Unauthorized ads</p>
              </div>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section id="termination" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaExchangeAlt className="mr-3 text-airbnb-red" />
            Termination Rights
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">User Termination</h3>
                <p className="text-gray-600">
                  May deactivate account at any time through settings
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Company Rights</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Suspend for policy violations</li>
                  <li>Terminate inactive accounts</li>
                  <li>Remove illegal content</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section id="disputes" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaGlobe className="mr-3 text-airbnb-red" />
            Dispute Resolution
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              <div className="flex items-start">
                <FaInfoCircle className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Mandatory Arbitration</h3>
                  <p className="text-gray-600">
                    Claims resolved through binding arbitration (AAA rules)
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaExclamationTriangle className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Class Action Waiver</h3>
                  <p className="text-gray-600">
                    Claims must be brought individually, not as class actions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liability Limits */}
        <section id="liability" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaUserShield className="mr-3 text-airbnb-red" />
            Liability Limitations
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <ul className="list-disc pl-5 space-y-4">
              <li>Not liable for third-party services</li>
              <li>No guarantee of uninterrupted service</li>
              <li>Maximum liability limited to fees paid</li>
              <li>Excludes indirect/consequential damages</li>
            </ul>
          </div>
        </section>

        {/* Governing Law */}
        <section className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Governing Law</h2>
          <div className="flex items-start">
            <FaBalanceScale className="text-airbnb-red mt-1 mr-4" />
            <div>
              <p className="text-gray-600">
                These Terms are governed by California law without regard to conflict of law principles
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Clarification?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Contact Legal Team
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              View Related Policies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
