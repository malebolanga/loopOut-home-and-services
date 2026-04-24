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
  FaMobileAlt
} from 'react-icons/fa';

export default function HelperServicesPolicy() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <FaShieldAlt className="mr-4" />
            loopOut Helper, Listing &  Services Policy
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Last Updated: September 1, 2024
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Quick Navigation */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold mb-6">Policy Overview</h2>
          <ul className="list-disc pl-5 space-y-3">
            <li><a href="#platform-role" className="text-airbnb-red hover:underline">loopOut s Role as Platform</a></li>
            <li><a href="#safety-guidelines" className="text-airbnb-red hover:underline">Safety Guidelines</a></li>
            <li><a href="#location-sharing" className="text-airbnb-red hover:underline">Location Sharing Requirement</a></li>
            <li><a href="#payment-terms" className="text-airbnb-red hover:underline">Payment Terms</a></li>
            <li><a href="#liability" className="text-airbnb-red hover:underline">Liability & Damages</a></li>
            <li><a href="#dispute-resolution" className="text-airbnb-red hover:underline">Dispute Resolution</a></li>
          </ul>
        </div>

        <div className="space-y-12">
          {/* Platform Role Section */}
          <section id="platform-role">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaBalanceScale className="mr-3 text-airbnb-red" />
              loopOut s Role as a Platform
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaInfoCircle className="text-airbnb-red mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Advertising Service Only</h3>
                  <p className="text-gray-600 mb-4">
                    loopOut operates solely as an advertising platform connecting service providers 
                    (beauty professionals, domestic helpers, technicians) with customers. We are NOT 
                    a service provider and do not employ the individuals offering services through our platform.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-airbnb-red">What We Do</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide advertising space for service providers</li>
                    <li>Facilitate initial connections between parties</li>
                    <li>Offer platform for reviews and ratings</li>
                    <li>Provide communication tools</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-airbnb-red">What We Don t Do</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Employ service providers</li>
                    <li>Guarantee service quality</li>
                    <li>Handle payments directly</li>
                    <li>Assume liability for services rendered</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Safety Guidelines */}
          <section id="safety-guidelines">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaUserCheck className="mr-3 text-airbnb-red" />
              Safety Guidelines & Best Practices
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FaHome className="text-airbnb-red mr-3" />
                    For Customers
                  </h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li className="font-semibold">Always be present at home during the service</li>
                    <li>Verify the service provider s identity upon arrival</li>
                    <li>Discuss scope of work and expectations clearly beforehand</li>
                    <li>Ensure a safe working environment for the service provider</li>
                    <li>Keep valuable items secured during service visits</li>
                    <li>Have emergency contacts readily available</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FaTools className="text-airbnb-red mr-3" />
                    For Service Providers
                  </h3>
                  <ul className="list-disc pl-5 space-y-3">
                    <li>Carry proper identification at all times</li>
                    <li>Bring your own tools and equipment when required</li>
                    <li>Maintain professional conduct and hygiene</li>
                    <li>Obtain clear consent before beginning work</li>
                    <li>Respect the customer s property and privacy</li>
                    <li>Carry appropriate insurance for your services</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Location Sharing Requirement */}
          <section id="location-sharing">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaMapMarkerAlt className="mr-3 text-airbnb-red" />
              Mandatory Location Sharing Policy
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaShareAlt className="text-airbnb-red mt-1 mr-4 text-2xl" />
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
                    <FaUserFriends className="text-airbnb-red mr-3" />
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
                    <FaMobileAlt className="text-airbnb-red mr-3" />
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

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-800">Safety Protocol</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <p className="text-green-700 text-sm">Check out when leaving</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-red-800">Zero Tolerance Policy</h4>
                <p className="text-red-700">
                  Failure to share your location with trusted contacts before providing services may result 
                  in immediate account suspension. Your safety is our priority, and this requirement is 
                  non-negotiable.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section id="payment-terms">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaMoneyBillWave className="mr-3 text-airbnb-red" />
              Payment Terms & Verification
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaExclamationTriangle className="text-airbnb-red mt-1 mr-4" />
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

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-yellow-800">Important Notice</h4>
                <p className="text-yellow-700">
                  loopOut does not process payments for helper or beauty services. All financial transactions 
                  occur directly between customers and service providers. We recommend using traceable payment 
                  methods and obtaining receipts for all transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Liability Section */}
          <section id="liability">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <FaExclamationTriangle className="mr-3 text-airbnb-red" />
              Liability & Damages
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-start mb-6">
                <FaShieldAlt className="text-airbnb-red mt-1 mr-4" />
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
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg">
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
              <FaHandshake className="mr-3 text-airbnb-red" />
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

                <div className="p-4 bg-blue-50 rounded-lg">
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
                By using loopOut to book or provide helper, beauty, or domestic services, you acknowledge 
                and agree that loopOut acts solely as an advertising platform. You assume all risks associated 
                with arranging and receiving services, and release loopOut from any liability for damages, 
                injuries, or disputes that may occur between users.
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
          <h2 className="text-3xl font-bold mb-6">Need Clarification?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Contact Support
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              View Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}