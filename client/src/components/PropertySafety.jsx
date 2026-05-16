// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaHandshake,
  FaUserCheck,
  FaMoneyBillWave,
  FaHome,
 
  FaInfoCircle,
  FaBalanceScale,
  FaMapMarkerAlt,
  FaShareAlt,
  FaUserFriends,
  FaMobileAlt,
  FaClipboardCheck,
  FaFirstAid,
  FaIdCard,
  FaKey,
  FaBuilding,

} from 'react-icons/fa';

const SafetyProperties = {
  guestHouse: { icon: "🏠", label: "Guest House" },
  monthRental: { icon: "📅", label: "Monthly Rental" },
  sales: { icon: "💰", label: "Property Sales" },
  hotel: { icon: "🏨", label: "Hotel" },
  hourRental: { icon: "⏰", label: "Hourly Rental" }
};

export default function ComprehensivePropertySafetyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaShieldAlt className="mr-4" />
            PropertySafe Comprehensive Safety Policy
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Ensuring Safe Property Transactions and Stays for All Categories
          </p>
          <p className="text-lg opacity-90">
            Last Updated: September 1, 2024
          </p>
        </div>
      </div>

      {/* Property Categories Overview */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Property Categories Covered</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(SafetyProperties).map(([key, property]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">{property.icon}</div>
                <h3 className="font-semibold">{property.label}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6">Policy Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="#platform-role" className="text-blue-600 hover:underline flex items-center">
              <FaBalanceScale className="mr-2" /> Platform Role
            </a>
            <a href="#verification-process" className="text-blue-600 hover:underline flex items-center">
              <FaUserCheck className="mr-2" /> Verification Process
            </a>
            <a href="#safety-guidelines" className="text-blue-600 hover:underline flex items-center">
              <FaShieldAlt className="mr-2" /> Safety Guidelines
            </a>
            <a href="#location-sharing" className="text-blue-600 hover:underline flex items-center">
              <FaMapMarkerAlt className="mr-2" /> Location Sharing
            </a>
            <a href="#property-specific" className="text-blue-600 hover:underline flex items-center">
              <FaBuilding className="mr-2" /> Property-Specific Rules
            </a>
            <a href="#emergency-protocols" className="text-blue-600 hover:underline flex items-center">
              <FaFirstAid className="mr-2" /> Emergency Protocols
            </a>
            <a href="#payment-terms" className="text-blue-600 hover:underline flex items-center">
              <FaMoneyBillWave className="mr-2" /> Payment Terms
            </a>
            <a href="#liability" className="text-blue-600 hover:underline flex items-center">
              <FaExclamationTriangle className="mr-2" /> Liability
            </a>
            <a href="#dispute-resolution" className="text-blue-600 hover:underline flex items-center">
              <FaHandshake className="mr-2" /> Dispute Resolution
            </a>
          </div>
        </div>

        <div className="space-y-12">
          {/* Platform Role Section */}
          <section id="platform-role">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaBalanceScale className="mr-3 text-blue-600" />
              PropertySafe Role as a Platform
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaInfoCircle className="text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Listing Service Only</h3>
                  <p className="text-gray-600 mb-4">
                    PropertySafe operates solely as a listing platform connecting property owners/agents 
                    with potential guests, tenants, or buyers. We are NOT a real estate agency and do not 
                    own or manage the properties listed on our platform.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-green-200 p-4 rounded-lg bg-green-50">
                  <h4 className="font-semibold mb-2 text-green-700">What We Do</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide listing space for verified property owners/agents</li>
                    <li>Facilitate initial connections between parties</li>
                    <li>Offer platform for reviews and ratings</li>
                    <li>Provide secure communication tools</li>
                    <li>Implement identity verification checks</li>
                    <li>Display property availability and pricing</li>
                  </ul>
                </div>
                <div className="border border-red-200 p-4 rounded-lg bg-red-50">
                  <h4 className="font-semibold mb-2 text-red-700">What We Dont Do</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Own or manage listed properties</li>
                    <li>Guarantee property condition or amenities</li>
                    <li>Handle rental or purchase payments</li>
                    <li>Conduct property inspections</li>
                    <li>Provide legal or real estate advice</li>
                    <li>Assume liability for property transactions</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Verification Process */}
          <section id="verification-process">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaUserCheck className="mr-3 text-blue-600" />
              User Verification Process
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Identity Verification</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>Government-issued photo ID verification</li>
                    <li>Background check for criminal records</li>
                    <li>Phone number and email verification</li>
                    <li>Social media profile validation</li>
                    <li>Regular re-verification every 12 months</li>
                    <li>Payment method verification</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Property-Specific Requirements</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li><strong>Property Owners/Agents:</strong> Ownership documentation</li>
                    <li><strong>Real Estate Agents:</strong> Professional license verification</li>
                    <li><strong>Hotel Operators:</strong> Business registration and permits</li>
                    <li><strong>Guest House Hosts:</strong> Local accommodation licenses</li>
                    <li><strong>All Listings:</strong> Property photos and accurate descriptions</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800 flex items-center">
                  <FaClipboardCheck className="mr-2" />
                  Verification Status Indicators
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <FaIdCard />
                    </div>
                    <p className="text-green-700 text-sm font-semibold">ID Verified</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 text-blue-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <FaUserCheck />
                    </div>
                    <p className="text-blue-700 text-sm font-semibold">Background Checked</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 text-purple-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <FaKey />
                    </div>
                    <p className="text-purple-700 text-sm font-semibold">Property Verified</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 text-orange-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <FaClipboardCheck />
                    </div>
                    <p className="text-orange-700 text-sm font-semibold">Licensed</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Safety Guidelines */}
          <section id="safety-guidelines">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaShieldAlt className="mr-3 text-blue-600" />
              Comprehensive Safety Guidelines
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FaHome className="text-blue-600 mr-3" />
                    For Guests/Tenants/Buyers
                  </h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Always verify property details before committing</li>
                    <li>Conduct property viewings during daylight hours</li>
                    <li>Bring a companion to property viewings</li>
                    <li>Research the neighborhood and location</li>
                    <li>Read reviews from previous guests/tenants</li>
                    <li>Verify all amenities and conditions</li>
                    <li>Use secure payment methods only</li>
                    <li>Trust your instincts - walk away if uncomfortable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FaBuilding className="text-blue-600 mr-3" />
                    For Property Owners/Agents
                  </h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>Verify guest/tenant identity before sharing property details</li>
                    <li>Maintain professional conduct during viewings</li>
                    <li>Provide accurate property descriptions and photos</li>
                    <li>Disclose any property issues or limitations</li>
                    <li>Respect privacy and personal boundaries</li>
                    <li>Follow local rental and real estate regulations</li>
                    <li>Keep emergency contacts and information accessible</li>
                    <li>Report any safety concerns immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Location Sharing Requirement */}
          <section id="location-sharing">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaMapMarkerAlt className="mr-3 text-blue-600" />
              Mandatory Location Sharing Policy
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaShareAlt className="text-blue-600 mt-1 mr-4 text-2xl" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Safety First: Always Share Your Location</h3>
                  <p className="text-gray-600 mb-4">
                    For personal safety during property viewings, tours, or stays, we require all users 
                    to share their real-time location with trusted contacts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <FaUserFriends className="text-blue-600 mr-3" />
                    Who to Share With
                  </h4>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">At least one family member</li>
                    <li className="font-semibold">Trusted friends or colleagues</li>
                    <li>Your emergency contact person</li>
                    <li>Someone who knows your schedule</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <FaMobileAlt className="text-blue-600 mr-3" />
                    What to Share
                  </h4>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Real-time map location</li>
                    <li>Property address and meeting time</li>
                    <li>Host/agent contact information</li>
                    <li>Expected duration of viewing/stay</li>
                    <li>Check-in and check-out times</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-800">Safety Protocol</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold">1</span>
                    </div>
                    <p className="text-green-700 text-sm">Share location before departing</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold">2</span>
                    </div>
                    <p className="text-green-700 text-sm">Check in upon arrival</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold">3</span>
                    </div>
                    <p className="text-green-700 text-sm">Mid-visit check-in</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold">4</span>
                    </div>
                    <p className="text-green-700 text-sm">Check out when leaving</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold mb-2 text-red-800">Zero Tolerance Policy</h4>
                <p className="text-red-700">
                  Failure to share your location with trusted contacts before property viewings or stays 
                  may result in immediate account suspension. Your safety is our priority, and this requirement 
                  is non-negotiable.
                </p>
              </div>
            </div>
          </section>

          {/* Property-Specific Safety Rules */}
          <section id="property-specific">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaBuilding className="mr-3 text-blue-600" />
              Property-Specific Safety Rules
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">🏠 Guest House</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Verified host identification required</li>
                    <li>Clear house rules and expectations</li>
                    <li>Emergency contact information provided</li>
                    <li>Safe key exchange procedures</li>
                    <li>Neighborhood safety information</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">📅 Monthly Rental</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Formal rental agreement recommended</li>
                    <li>Property inspection before move-in</li>
                    <li>Security deposit procedures</li>
                    <li>Maintenance and repair protocols</li>
                    <li>Neighbor consideration guidelines</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">💰 Property Sales</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Licensed real estate agents preferred</li>
                    <li>Property documentation verification</li>
                    <li>Secure payment escrow services</li>
                    <li>Legal counsel recommendation</li>
                    <li>Thorough property inspections</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">🏨 Hotel Services</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Business registration verification</li>
                    <li>Health and safety certifications</li>
                    <li>24/7 front desk availability</li>
                    <li>Emergency evacuation procedures</li>
                    <li>Staff background checks</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">⏰ Hourly Rental</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Clear usage time boundaries</li>
                    <li>Security deposit requirements</li>
                    <li>Property condition documentation</li>
                    <li>Emergency contact availability</li>
                    <li>Neighborhood noise considerations</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">All Property Types</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Accurate property representation</li>
                    <li>Clear communication channels</li>
                    <li>Emergency preparedness</li>
                    <li>Respectful conduct</li>
                    <li>Timely response to issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Emergency Protocols */}
          <section id="emergency-protocols">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaFirstAid className="mr-3 text-blue-600" />
              Emergency Protocols
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Property Emergencies</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Call emergency services immediately (911)</li>
                    <li>Know emergency exits and evacuation routes</li>
                    <li>Locate fire extinguishers and first aid kits</li>
                    <li>Report maintenance emergencies to property contact</li>
                    <li>Keep emergency contact information accessible</li>
                    <li>Report incident to PropertySafe within 24 hours</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Personal Safety Threats</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Remove yourself from dangerous situations</li>
                    <li>Contact authorities if threatened or unsafe</li>
                    <li>Use safety features in the PropertySafe app</li>
                    <li>Notify trusted contacts immediately</li>
                    <li>Document incidents with photos if safe</li>
                    <li>Report safety concerns to PropertySafe promptly</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold mb-2 text-yellow-800">Emergency Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">PropertySafe Safety Team</p>
                    <p>safety@property-safe.com</p>
                    <p>1-800-PROP-SAFE</p>
                  </div>
                  <div>
                    <p className="font-semibold">Emergency Services</p>
                    <p>911 (USA)</p>
                    <p>112 (EU Emergency)</p>
                  </div>
                  <div>
                    <p className="font-semibold">Non-Emergency Police</p>
                    <p>311 (USA)</p>
                    <p>Local precinct</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section id="payment-terms">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaMoneyBillWave className="mr-3 text-blue-600" />
              Payment Terms & Security
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaExclamationTriangle className="text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Secure Payment Practices</h3>
                  <p className="text-gray-600 mb-4">
                    To ensure financial security and prevent disputes, we strongly recommend the following payment practices:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border p-4 rounded-lg text-center">
                  <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Verify Property First</h4>
                  <p className="text-gray-600 text-sm">
                    Always view the property in person and verify all details before making any payments
                  </p>
                </div>
                <div className="border p-4 rounded-lg text-center">
                  <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Use Secure Methods</h4>
                  <p className="text-gray-600 text-sm">
                    Only use traceable payment methods and avoid cash transactions for large amounts
                  </p>
                </div>
                <div className="border p-4 rounded-lg text-center">
                  <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Document Everything</h4>
                  <p className="text-gray-600 text-sm">
                    Keep records of all agreements, receipts, and communication regarding the transaction
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold mb-2 text-yellow-800">Important Notice</h4>
                <p className="text-yellow-700">
                  PropertySafe does not process payments for property transactions. All financial arrangements 
                  occur directly between parties. We recommend using escrow services for large transactions 
                  and obtaining proper receipts for all payments.
                </p>
              </div>
            </div>
          </section>

          {/* Liability Section */}
          <section id="liability">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaExclamationTriangle className="mr-3 text-blue-600" />
              Liability & Property Damages
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaShieldAlt className="text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">No Platform Liability</h3>
                  <p className="text-gray-600 mb-4">
                    PropertySafe explicitly disclaims any liability for damages, injuries, or disputes that may 
                    arise between property owners/agents and guests/tenants/buyers. As a listing platform only, 
                    we are not responsible for:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Guest/Tenant/Buyer Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Property damage during stay or viewing</li>
                    <li>Personal injury on the property</li>
                    <li>Theft or loss of personal property</li>
                    <li>Unsatisfactory property conditions</li>
                    <li>Payment disputes with property owners</li>
                    <li>Failure to follow property rules</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Property Owner/Agent Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Accurate property representation</li>
                    <li>Maintaining safe property conditions</li>
                    <li>Proper insurance coverage</li>
                    <li>Compliance with local regulations</li>
                    <li>Guest/tenant safety and security</li>
                    <li>Timely response to maintenance issues</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold mb-2 text-red-800">Insurance Recommendation</h4>
                <p className="text-red-700">
                  We strongly recommend that property owners carry appropriate liability and property insurance, 
                  and that guests/tenants consider rental insurance for valuable belongings. Verify insurance 
                  coverage before engaging in property transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section id="dispute-resolution">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaHandshake className="mr-3 text-blue-600" />
              Dispute Resolution
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Direct Resolution</h3>
                  <p className="text-gray-600 mb-4">
                    In case of disputes, we encourage parties to first attempt direct resolution through 
                    open communication and mutual agreement.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Document Everything</h4>
                    <p className="text-gray-600 text-sm">
                      Take photos, keep all messages, and maintain records of agreements and property conditions
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Leave Honest Reviews</h4>
                    <p className="text-gray-600 text-sm">
                      Share your experience to help other users make informed decisions
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Report Serious Issues</h4>
                    <p className="text-gray-600 text-sm">
                      Contact us for platform violations, but understand we cannot mediate financial or legal disputes
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800">Legal Recourse</h4>
                  <p className="text-blue-700">
                    For unresolved disputes involving significant damages, fraud, or legal matters, parties should 
                    seek resolution through appropriate legal channels. PropertySafe s role is limited to providing 
                    platform access information to authorized legal authorities when legally required.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final Disclaimer */}
          <section>
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-red-800 flex items-center">
                <FaExclamationTriangle className="mr-3" />
                Important Disclaimer
              </h3>
              <p className="text-red-700 mb-4">
                By using PropertySafe to list, view, or book properties, you acknowledge and agree that PropertySafe acts 
                solely as a listing platform. You assume all risks associated with property transactions, stays, 
                and viewings, and release PropertySafe from any liability for damages, injuries, or disputes that 
                may occur between users.
              </p>
              <p className="text-red-700">
                Your safety and satisfaction are important to us, but ultimately the responsibility for 
                property conditions, transaction agreements, and personal safety rests with the individuals 
                directly involved in the property arrangement.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Safety is Our Priority</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have questions about our safety policies or need to report an incident?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Contact Safety Team
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Download Safety Guide
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              View Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
