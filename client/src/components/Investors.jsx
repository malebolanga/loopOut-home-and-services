// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaChartLine,
  FaDollarSign,
  FaFileAlt,
  FaUsers,
  FaCalendarAlt,
  FaBuilding,
  FaGlobe,
 
  FaEnvelope
} from 'react-icons/fa';



export default function Investors() {
  const financialHighlights = [
    { metric: "Market Cap", value: "$12.4B", change: "+2.4%", icon: <FaChartLine /> },
    { metric: "Revenue (TTM)", value: "$3.8B", change: "+18% YoY", icon: <FaDollarSign /> },
    { metric: "Active Users", value: "45M+", change: "34% YoY", icon: <FaUsers /> },
    { metric: "Listings", value: "6.2M+", change: "22% YoY", icon: <FaBuilding /> }
  ];

  const leadershipTeam = [
    { name: "Malebo Langa", title: "CEO", experience: "10+ years in tech", img: "ceo.jpg" },
    { name: "Michael Chen", title: "CFO", experience: "Ex-Fortune 500 Finance Lead", img: "cfo.jpg" },
    { name: "Emma Wilson", title: "COO", experience: "Scaled 3 unicorns", img: "coo.jpg" }
  ];

  const events = [
    { date: "2024-08-15", title: "Q2 Earnings Release", type: "Earnings" },
    { date: "2024-09-05", title: "Investor Day Conference", type: "Event" },
    { date: "2024-11-12", title: "Q3 Earnings Call", type: "Earnings" }
  ];

  const documents = [
    { title: "2023 Annual Report", type: "PDF", icon: <FaFileAlt /> },
    { title: "Q1 2024 Financials", type: "SEC Filing", icon: <FaFileAlt /> },
    { title: "Investor Presentation", type: "Deck", icon: <FaFileAlt /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Investor Relations
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Building the future of experiential living through innovative hospitality solutions
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Latest Financials
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Contact IR Team
            </button>
          </div>
        </div>
      </div>

      {/* Stock Ticker */}
      <div className="bg-gray-800 text-white py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-mono">NASDAQ: LOUT</span>
            <span className="ml-4 text-green-400">$142.56 ▲ 1.2%</span>
          </div>
          <span className="text-sm">Real-time price as of 4:00PM EDT</span>
        </div>
      </div>

      {/* Financial Highlights */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Financial Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {financialHighlights.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-airbnb-red text-2xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.metric}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-green-500">{item.change}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadershipTeam.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={member.img} 
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-airbnb-red mb-2">{member.title}</p>
                  <p className="text-gray-600 text-sm">{member.experience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Documents */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <FaCalendarAlt className="mr-3 text-airbnb-red" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <FaFileAlt className="mr-3 text-airbnb-red" />
              Documents & Resources
            </h3>
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-airbnb-red mr-4">{doc.icon}</span>
                      <div>
                        <p className="font-semibold">{doc.title}</p>
                        <p className="text-gray-600 text-sm">{doc.type}</p>
                      </div>
                    </div>
                    <button className="text-airbnb-red hover:text-red-700">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ESG Commitment */}
      <section className="bg-airbnb-red text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">ESG Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <FaGlobe className="text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Environmental</h3>
              <p>Carbon-neutral operations by 2025</p>
            </div>
            <div className="p-6">
              <FaUsers className="text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Social</h3>
              <p>$50M community investment fund</p>
            </div>
            <div className="p-6">
              <FaBuilding className="text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Governance</h3>
              <p>Diverse board with 50% women</p>
            </div>
          </div>
        </div>
      </section>

      {/* Investor Contact */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <FaEnvelope className="text-airbnb-red text-4xl mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Investor Relations Contact</h2>
          <p className="mb-4">Malebo Langa, Head of Investor Relations</p>
          <div className="space-y-2">
            <p>📧 investors@loupeout.com</p>
            <p>📞 +27 (80) 555-0199</p>
            <p>📍 123 Investor Street, Suite 500, Polokwane, SA</p>
          </div>
        </div>
      </section>
    </div>
  );
}

