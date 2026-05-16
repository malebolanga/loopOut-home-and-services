// eslint-disable-next-line no-unused-vars
import React from "react";
import {
  FaHome,
  FaKey,
  FaShieldAlt,
  FaFileContract,
  FaMoneyBillAlt,
  FaTools,
  FaUserCheck,
  FaBell,
  FaExclamationTriangle,
  FaSearch,
  FaHandshake,
  FaInfoCircle,
} from "react-icons/fa";

export default function Adiver() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-2">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Tips for a Smooth Renting Experience
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether you re a tenant or a landlord, these tips will help ensure a
            successful and stress-free renting experience.
          </p>
        </div>

        {/* For Tenants Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8 flex items-center justify-center gap-2">
            <FaHome className="text-blue-600" /> For Tenants
          </h2>

          {/* Image Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-2">
            <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://th.bing.com/th/id/R.b80a1eee64880b4b1e43cdf34201542f?rik=E%2f%2ftq%2baDsdKDmA&pid=ImgRaw&r=0"
                alt="Tenant Tips"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Understand the Lease Agreement
              </h3>
              <p className="text-sm text-gray-600">
                Read the lease thoroughly before signing and clarify any vague clauses.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://www.globalpropertysystems.com/wp-content/uploads/2022/05/home-appraisals.jpg"
                alt="Tenant Tips"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Document the Property Condition
              </h3>
              <p className="text-sm text-gray-600">
                Conduct a walk-through inspection and take pictures of any damages.
              </p>
            </div>
          </div>

          {/* Tips List */}
          <div className="space-y-6">
            {[
              {
                icon: <FaFileContract className="text-blue-600" />,
                title: "Understand the Lease Agreement",
                points: [
                  "Read the lease thoroughly before signing.",
                  "Clarify any vague or confusing clauses.",
                ],
              },
              {
                icon: <FaShieldAlt className="text-blue-600" />,
                title: "Document the Condition of the Property",
                points: [
                  "Conduct a walk-through inspection before moving in and take pictures of any damages.",
                  "Notify the landlord of any existing problems.",
                ],
              },
              {
                icon: <FaBell className="text-blue-600" />,
                title: "Communicate Clearly and Timely",
                points: [
                  "Establish a clear line of communication with your landlord.",
                  "Keep all communication in writing for records.",
                ],
              },
              {
                icon: <FaMoneyBillAlt className="text-blue-600" />,
                title: "Pay Rent on Time",
                points: [
                  "Always pay rent on time to avoid late fees.",
                  "Inform your landlord in advance if you anticipate difficulty paying.",
                ],
              },
              {
                icon: <FaTools className="text-blue-600" />,
                title: "Maintain the Property",
                points: [
                  "Treat the property with care and report issues early.",
                  "Be aware of your responsibilities for minor repairs.",
                ],
              },
              {
                icon: <FaUserCheck className="text-blue-600" />,
                title: "Know Your Rights",
                points: [
                  "Research tenant rights in your area.",
                  "Address problems legally and appropriately.",
                ],
              },
              {
                icon: <FaHandshake className="text-blue-600" />,
                title: "Be a Good Neighbor",
                points: [
                  "Be considerate of your neighbors in shared buildings.",
                  "Respect noise limits, parking spaces, and common areas.",
                ],
              },
              {
                icon: <FaInfoCircle className="text-blue-600" />,
                title: "Provide Proper Notice Before Moving Out",
                points: [
                  "Give the required notice period before moving out.",
                  "Failing to do so can result in losing your security deposit.",
                ],
              },
            ].map((item, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  {item.icon} {item.title}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-5">
                  {item.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* For Landlords Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8 flex items-center justify-center gap-2">
            <FaKey className="text-green-600" /> For Landlords
          </h2>

          {/* Image Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://4.bp.blogspot.com/-OdZ7Z5GAV1Y/WNEmwwDJf4I/AAAAAAAAAPc/eidpflvXxR8h42vxGMSWR0CtpjHEt0ZIACPcBGAYYCw/w1200-h630-p-k-no-nu/buyer-agents-in-Melbourne-1000x600.jpg"
                alt="Landlord Tips"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Screen Tenants Thoroughly
              </h3>
              <p className="text-sm text-gray-600">
                Conduct credit checks, reference checks, and verify employment.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://th.bing.com/th/id/R.28443305db7c42d0fe153bae50f5b878?rik=rbNrIqgss0KsbQ&riu=http%3a%2f%2f2.bp.blogspot.com%2f-zoegNGhD7oM%2fTuvxyycg97I%2fAAAAAAAABic%2fnCcxB5YjaiE%2fs1600%2fTenant%2bCheck.jpg&ehk=ZVesGLOxriOOxpvWtjb%2bCKYGsNjIYe07izKQm%2bcMNFg%3d&risl=&pid=ImgRaw&r=0"
                alt="Landlord Tips"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Create a Clear Lease Agreement
              </h3>
              <p className="text-sm text-gray-600">
                Draft a comprehensive lease agreement covering all important details.
              </p>
            </div>
          </div>

          {/* Tips List */}
          <div className="space-y-6">
            {[
              {
                icon: <FaUserCheck className="text-green-600" />,
                title: "Screen Tenants Thoroughly",
                points: [
                  "Conduct credit checks, reference checks, and verify employment.",
                  "Ensure tenants can afford the rent.",
                ],
              },
              {
                icon: <FaFileContract className="text-green-600" />,
                title: "Create a Clear and Detailed Lease Agreement",
                points: [
                  "Draft a comprehensive lease agreement covering all important details.",
                  "Ensure the lease is legally compliant.",
                ],
              },
              {
                icon: <FaBell className="text-green-600" />,
                title: "Set Clear Expectations",
                points: [
                  "Discuss property rules and expectations upfront.",
                  "Outline procedures for maintenance requests.",
                ],
              },
              {
                icon: <FaTools className="text-green-600" />,
                title: "Prompt Maintenance and Repairs",
                points: [
                  "Respond to maintenance requests quickly.",
                  "Regularly inspect the property to catch issues early.",
                ],
              },
              {
                icon: <FaShieldAlt className="text-green-600" />,
                title: "Keep Good Records",
                points: [
                  "Maintain accurate records of all transactions and agreements.",
                  "Use digital systems for rent collection and communication.",
                ],
              },
              {
                icon: <FaInfoCircle className="text-green-600" />,
                title: "Respect Tenant Privacy",
                points: [
                  "Provide proper notice before entering the property.",
                  "Abide by local laws regarding tenant privacy.",
                ],
              },
              {
                icon: <FaMoneyBillAlt className="text-green-600" />,
                title: "Set Competitive Rent",
                points: [
                  "Research market rent prices in the area.",
                  "Ensure your rent is fair and competitive.",
                ],
              },
              {
                icon: <FaHandshake className="text-green-600" />,
                title: "Handle Security Deposits Fairly",
                points: [
                  "Clearly outline terms for returning the security deposit.",
                  "Be transparent about deductions for damages.",
                ],
              },
              {
                icon: <FaExclamationTriangle className="text-green-600" />,
                title: "Stay Informed of Laws",
                points: [
                  "Keep up to date with local landlord-tenant laws.",
                  "Ensure your practices are legal.",
                ],
              },
              {
                icon: <FaUserCheck className="text-green-600" />,
                title: "Maintain a Professional Relationship",
                points: [
                  "Keep your relationship with the tenant professional.",
                  "Adhere to the lease even with friends or family.",
                ],
              },
            ].map((item, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  {item.icon} {item.title}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-5">
                  {item.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Common Rental Scams Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8 flex items-center justify-center gap-2">
            <FaExclamationTriangle className="text-red-600" /> Common Rental
            Scams to Watch For
          </h2>

          {/* Image Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://cdn.propertyupdate.com.au/wp-content/uploads/2022/10/scam.jpg"
                alt="Rental Scams"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Fake Listings
              </h3>
              <p className="text-sm text-gray-600">
                Scammers copy legitimate listings and repost them with lower prices.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://www.hostmerchantservices.com/wp-content/uploads/2023/02/alert-new-phishing-scam-1024x684.jpg"
                alt="Rental Scams"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Phantom Rentals
              </h3>
              <p className="text-sm text-gray-600">
                Properties that don’t exist or aren’t available for rent.
              </p>
            </div>
          </div>

          {/* Tips List */}
          <div className="space-y-6">
            {[
              {
                icon: <FaSearch className="text-red-600" />,
                title: "Fake Listings",
                points: [
                  "Scammers copy legitimate listings and repost them with lower prices.",
                  "The listing may look too good to be true.",
                ],
              },
              {
                icon: <FaHome className="text-red-600" />,
                title: "Phantom Rentals",
                points: [
                  "Properties that don’t exist or aren’t available for rent.",
                  "Scammers ask for money upfront but the rental is never available.",
                ],
              },
              {
                icon: <FaMoneyBillAlt className="text-red-600" />,
                title: "Requests for Upfront Payments",
                points: [
                  "Scammers ask for deposits or rent before showing the property.",
                  "They often claim high demand or that the landlord is out of town.",
                ],
              },
              {
                icon: <FaUserCheck className="text-red-600" />,
                title: "No In-Person Meeting",
                points: [
                  "The landlord refuses to meet in person or show the property.",
                  "They may claim to be out of the country or busy.",
                ],
              },
              {
                icon: <FaExclamationTriangle className="text-red-600" />,
                title: "Unusually Low Rent Prices",
                points: [
                  "Rent significantly below market value is often a red flag.",
                  "Scammers use low prices to attract desperate tenants.",
                ],
              },
              {
                icon: <FaBell className="text-red-600" />,
                title: "Pressure to Act Quickly",
                points: [
                  "Scammers rush you into making a decision or payment.",
                  "They claim there are many interested applicants.",
                ],
              },
              {
                icon: <FaShieldAlt className="text-red-600" />,
                title: "Suspicious Payment Methods",
                points: [
                  "Be cautious of untraceable payment methods like wire transfers or gift cards.",
                  "Legitimate landlords use secure payment methods.",
                ],
              },
              {
                icon: <FaInfoCircle className="text-red-600" />,
                title: "Landlord Doesn’t Own the Property",
                points: [
                  "Scammers pose as landlords of properties they don’t own.",
                  "Verify ownership through public records.",
                ],
              },
            ].map((item, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  {item.icon} {item.title}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-5">
                  {item.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* How to Avoid Scams Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8 flex items-center justify-center gap-2">
            <FaShieldAlt className="text-purple-600" /> How to Avoid Rental Scams
          </h2>

          {/* Image Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhrCUvwz_QRhvtlwBrIHcVaayaDQikqtHFGlYE5TZWInjQFJkrFZ3etL6dgjdwmPTo2veElm4_D8eF9B0ykBx3QXBXbqGmkc7Ev_ePzz6pkpZvZGwTTrulA2k8cMZ9w8cwHKPHFpxBUbMDgamXqX1BrddfpTrwrIto062935uemAdkW2HQPw1cXgukmLXH2/w1600/Keys%20to%20Safety%20Identifying%20and%20Avoiding%20Real%20Estate%20Scams.jpg"
                alt="Avoid Scams"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Research the Property and Landlord
              </h3>
              <p className="text-sm text-gray-600">
                Verify the listing by doing an online search and checking public records.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src="https://www.saturdayeveningpost.com/wp-content/uploads/satevepost/2022-01-12-home-scam-shutterstock-860x573.jpg"
                alt="Avoid Scams"
                className="rounded-lg w-full h-48 object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Never Pay Before Seeing the Property
              </h3>
              <p className="text-sm text-gray-600">
                Avoid sending money before viewing the property.
              </p>
            </div>
          </div>

          {/* Tips List */}
          <div className="space-y-6">
            {[
              {
                icon: <FaSearch className="text-purple-600" />,
                title: "Research the Property and Landlord",
                points: [
                  "Verify the listing by doing an online search.",
                  "Check public records for property ownership.",
                ],
              },
              {
                icon: <FaMoneyBillAlt className="text-purple-600" />,
                title: "Never Pay Before Seeing the Property",
                points: [
                  "Avoid sending money before viewing the property.",
                  "Legitimate landlords will arrange a viewing.",
                ],
              },
              {
                icon: <FaUserCheck className="text-purple-600" />,
                title: "Meet the Landlord in Person",
                points: [
                  "Always meet the landlord or property manager in person.",
                  "Gauge their legitimacy during the meeting.",
                ],
              },
              {
                icon: <FaExclamationTriangle className="text-purple-600" />,
                title: "Avoid Suspicious Payment Requests",
                points: [
                  "Be cautious of unconventional payment methods.",
                  "Use secure payment methods and keep records.",
                ],
              },
              {
                icon: <FaInfoCircle className="text-purple-600" />,
                title: "Be Cautious of International Landlords",
                points: [
                  "Be skeptical if the landlord claims to be overseas.",
                  "This is a common excuse scammers use.",
                ],
              },
              {
                icon: <FaShieldAlt className="text-purple-600" />,
                title: "Trust Your Instincts",
                points: [
                  "If something feels off, it likely is.",
                  "Proceed with caution if the deal seems too good to be true.",
                ],
              },
              {
                icon: <FaBell className="text-purple-600" />,
                title: "Report Scams",
                points: [
                  "Email: info@loupeout.com",
                  "Phone: 083 894 9697",
                ],
              },
            ].map((item, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  {item.icon} {item.title}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 pl-5">
                  {item.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
