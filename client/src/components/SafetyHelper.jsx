// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaHandshake,
  FaUserCheck,
  FaMoneyBillWave,
  FaHome,
  FaTools,
  FaInfoCircle,
  FaBalanceScale,
  FaMapMarkerAlt,
  FaShareAlt,
  FaUserFriends,
  FaMobileAlt,
  FaClipboardCheck,
  FaFirstAid,
  FaIdCard,
 
} from 'react-icons/fa';

export default function ComprehensiveSafetyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaShieldAlt className="mr-4" />
            loopOut Comprehensive Safety Policy
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Ensuring Safe Experiences for All Service Categories
          </p>
          <p className="text-lg opacity-90">
            Last Updated: September 1, 2024
          </p>
        </div>
      </div>

      {/* Service Categories Overview */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Service Categories Covered</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Barber Services', icon: '✂️' },
              { name: 'Domestic Maids', icon: '🏠' },
              { name: 'Beauty Services', icon: '💄' },
              { name: 'Tutors', icon: '📚' },
              { name: 'Chefs', icon: '👨‍🍳' },
              { name: 'Tattoo Artists', icon: '🎨' }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">{service.icon}</div>
                <h3 className="font-semibold">{service.name}</h3>
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
            <a href="#service-specific" className="text-blue-600 hover:underline flex items-center">
              <FaTools className="mr-2" /> Service-Specific Rules
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
              loopOut s Role as a Platform
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaInfoCircle className="text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Advertising Service Only</h3>
                  <p className="text-gray-600 mb-4">
                    loopOut operates solely as an advertising platform connecting service providers 
                    with customers. We are NOT a service provider and do not employ the individuals 
                    offering services through our platform.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-green-200 p-4 rounded-lg bg-green-50">
                  <h4 className="font-semibold mb-2 text-green-700">What We Do</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide advertising space for verified service providers</li>
                    <li>Facilitate initial connections between parties</li>
                    <li>Offer platform for reviews and ratings</li>
                    <li>Provide communication tools</li>
                    <li>Implement basic background checks</li>
                  </ul>
                </div>
                <div className="border border-red-200 p-4 rounded-lg bg-red-50">
                  <h4 className="font-semibold mb-2 text-red-700">What We Dont Do</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Employ service providers directly</li>
                    <li>Guarantee service quality or outcomes</li>
                    <li>Handle payments for services</li>
                    <li>Assume liability for services rendered</li>
                    <li>Provide insurance coverage</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Verification Process */}
          <section id="verification-process">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaUserCheck className="mr-3 text-blue-600" />
              Service Provider Verification Process
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Identity Verification</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>Government-issued photo ID verification</li>
                    <li>Background check for criminal records</li>
                    <li>Phone number and email verification</li>
                    <li>Professional certification validation (where applicable)</li>
                    <li>Regular re-verification every 12 months</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Service-Specific Requirements</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li><strong>Chefs:</strong> Food safety certification</li>
                    <li><strong>Tattoo Artists:</strong> Health department permits</li>
                    <li><strong>Beauty Services:</strong> Cosmetology licenses</li>
                    <li><strong>Tutors:</strong> Educational credentials verification</li>
                    <li><strong>Domestic Helpers:</strong> Reference checks</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800 flex items-center">
                  <FaClipboardCheck className="mr-2" />
                  Verification Status Indicators
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                      <FaClipboardCheck />
                    </div>
                    <p className="text-purple-700 text-sm font-semibold">Certified</p>
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
                    For Customers
                  </h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Always verify service provider identity upon arrival</li>
                    <li>Be present during the entire service duration</li>
                    <li>Discuss scope of work and expectations clearly beforehand</li>
                    <li>Ensure a safe working environment for the service provider</li>
                    <li>Keep valuable items secured during service visits</li>
                    <li>Have emergency contacts readily available</li>
                    <li>Check providers ratings and reviews before booking</li>
                    <li>Trust your instincts - cancel if uncomfortable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FaTools className="text-blue-600 mr-3" />
                    For Service Providers
                  </h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>Carry proper identification at all times</li>
                    <li>Bring your own tools and equipment when required</li>
                    <li>Maintain professional conduct and hygiene</li>
                    <li>Obtain clear consent before beginning work</li>
                    <li>Respect the customers property and privacy</li>
                    <li>Carry appropriate insurance for your services</li>
                    <li>Follow all health and safety protocols</li>
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
                    For your personal safety and security, we require all service providers to share their 
                    real-time location with trusted contacts before visiting any service location.
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
                    <li>Service address and expected arrival time</li>
                    <li>Customer contact information</li>
                    <li>Expected duration of service</li>
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
                    <p className="text-green-700 text-sm">Mid-service check-in</p>
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
                  Failure to share your location with trusted contacts before providing services may result 
                  in immediate account suspension. Your safety is our priority, and this requirement is 
                  non-negotiable.
                </p>
              </div>
            </div>
          </section>

          {/* Service-Specific Safety Rules */}
          <section id="service-specific">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaTools className="mr-3 text-blue-600" />
              Service-Specific Safety Rules
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">Tattoo & Beauty Services</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Sterilization equipment must be visible</li>
                    <li>Single-use needles and tools only</li>
                    <li>Allergy testing required before service</li>
                    <li>Proper disposal of biological waste</li>
                    <li>Informed consent forms mandatory</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">Domestic Helpers</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>No unsupervised access to sensitive areas</li>
                    <li>Clear boundaries regarding duties</li>
                    <li>Respect for privacy on both sides</li>
                    <li>Secure storage of valuables</li>
                    <li>Emergency contact exchange required</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">Chefs & Food Services</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Food safety certification must be visible</li>
                    <li>Allergy disclosure before service</li>
                    <li>Proper food handling and storage</li>
                    <li>Clean and sanitized equipment</li>
                    <li>Ingredient sourcing transparency</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">Tutoring Services</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Public meeting option available</li>
                    <li>Parent/guardian presence for minors</li>
                    <li>Clear session boundaries</li>
                    <li>Professional conduct at all times</li>
                    <li>No unsupervised sessions with minors</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">Barber Services</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Sanitized tools between clients</li>
                    <li>Clean work area maintenance</li>
                    <li>Proper disposal of hair waste</li>
                    <li>Chemical safety protocols</li>
                    <li>Skin sensitivity testing</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-700">All Services</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Professional boundaries</li>
                    <li>Respectful communication</li>
                    <li>Clear service agreements</li>
                    <li>Emergency preparedness</li>
                    <li>Timely cancellation notices</li>
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
                  <h3 className="text-xl font-semibold mb-4">Medical Emergencies</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Call emergency services immediately (911)</li>
                    <li>Provide clear location information</li>
                    <li>Administer basic first aid if trained</li>
                    <li>Do not move injured persons unnecessarily</li>
                    <li>Keep emergency contact information accessible</li>
                    <li>Report incident to loopOut within 24 hours</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Safety Threats</h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Remove yourself from dangerous situations</li>
                    <li>Contact authorities if threatened</li>
                    <li>Use safety features in the loopOut app</li>
                    <li>Notify trusted contacts immediately</li>
                    <li>Document incidents with photos if safe</li>
                    <li>Report safety concerns to loopOut promptly</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold mb-2 text-yellow-800">Emergency Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">loopOut Safety Team</p>
                    <p>safety@loopout.com</p>
                    <p>1-800-LOOPOUT</p>
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
              Payment Terms & Verification
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaExclamationTriangle className="text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Payment Verification Policy</h3>
                  <p className="text-gray-600 mb-4">
                    To ensure satisfaction and prevent disputes, we strongly recommend the following payment practices:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border p-4 rounded-lg text-center">
                  <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Inspect Work First</h4>
                  <p className="text-gray-600 text-sm">
                    Thoroughly check and verify that the service meets your expectations and agreed standards
                  </p>
                </div>
                <div className="border p-4 rounded-lg text-center">
                  <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Confirm Satisfaction</h4>
                  <p className="text-gray-600 text-sm">
                    Only proceed with payment when you are completely satisfied with the work performed
                  </p>
                </div>
                <div className="border p-4 rounded-lg text-center">
                  <div className="bg-green-100 text-green-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Document Agreement</h4>
                  <p className="text-gray-600 text-sm">
                    Keep records of agreed prices, scope of work, and any special arrangements
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold mb-2 text-yellow-800">Important Notice</h4>
                <p className="text-yellow-700">
                  loopOut does not process payments for services. All financial transactions 
                  occur directly between customers and service providers. We recommend using traceable payment 
                  methods and obtaining receipts for all transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Liability Section */}
          <section id="liability">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaExclamationTriangle className="mr-3 text-blue-600" />
              Liability & Damages
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaShieldAlt className="text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">No Platform Liability</h3>
                  <p className="text-gray-600 mb-4">
                    loopOut explicitly disclaims any liability for damages, injuries, or disputes that may 
                    arise between customers and service providers. As an advertising platform only, we are 
                    not responsible for:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Customer Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Property damage during service provision</li>
                    <li>Personal injury to service providers on your property</li>
                    <li>Theft or loss of personal property</li>
                    <li>Unsatisfactory service quality</li>
                    <li>Payment disputes with service providers</li>
                    <li>Failure to provide safe working conditions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Service Provider Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Carrying appropriate liability insurance</li>
                    <li>Damage to customer property during work</li>
                    <li>Professional negligence or errors</li>
                    <li>Personal injury while working</li>
                    <li>Tax obligations for income earned</li>
                    <li>Compliance with local regulations</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold mb-2 text-red-800">Insurance Recommendation</h4>
                <p className="text-red-700">
                  We strongly recommend that service providers carry appropriate liability insurance and 
                  that customers verify this coverage before engaging services, particularly for higher-risk 
                  activities or valuable properties.
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
                      Take photos, keep messages, and maintain records of agreements and outcomes
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
                      Contact us for platform violations, but understand we cannot mediate financial disputes
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800">Legal Recourse</h4>
                  <p className="text-blue-700">
                    For unresolved disputes involving significant damages or legal matters, parties should 
                    seek resolution through appropriate legal channels. loopOut s role is limited to providing 
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
                By using loopOut to book or provide services, you acknowledge and agree that loopOut acts 
                solely as an advertising platform. You assume all risks associated with arranging and 
                receiving services, and release loopOut from any liability for damages, injuries, or 
                disputes that may occur between users.
              </p>
              <p className="text-red-700">
                Your safety and satisfaction are important to us, but ultimately the responsibility for 
                service quality, payment agreements, and personal safety rests with the individuals directly 
                involved in the service transaction.
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
