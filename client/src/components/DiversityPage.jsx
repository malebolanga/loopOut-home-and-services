// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaHandsHelping,
  FaGlobeAmericas,
  FaUserFriends,
  FaChartPie,
  FaBalanceScale,
  FaLightbulb,
 
  FaUserPlus,
  FaBookOpen
} from 'react-icons/fa';

import "../styles/breakpoints.scss";
export default function DiversityPage() {

  const pillars = [
    {
      icon: <FaUserFriends className="w-8 h-8" />,
      title: "Inclusive Hiring",
      desc: "Blind resume screening and structured interviews to reduce bias"
    },
    {
      icon: <FaBalanceScale className="w-8 h-8" />,
      title: "Equitable Growth",
      desc: "Mentorship programs and sponsorship initiatives for underrepresented groups"
    },
    {
      icon: <FaLightbulb className="w-8 h-8" />,
      title: "Inclusive Innovation",
      desc: "Employee resource groups shaping product development"
    }
  ];

  const erGs = [
    { name: "Women+", members: "1,200+", color: "bg-pink-100" },
    { name: "Pride Alliance", members: "850+", color: "bg-rainbow" },
    { name: "BIPOC Collective", members: "2,300+", color: "bg-amber-100" },
    { name: "Veterans Network", members: "450+", color: "bg-blue-100" }
  ];

  const milestones = [
    { year: "2020", event: "Founded DEI Council" },
    { year: "2021", event: "Achieved gender parity in leadership" },
    { year: "2022", event: "Launched global pay equity initiative" },
    { year: "2023", event: "50% underrepresented groups in tech roles" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Diversity Fuels Innovation
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Building a workplace where everyone belongs and diverse perspectives thrive
          </p>
        </div>
      </div>

      {/* Our Commitments */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Our DEI Pillars
          <span className="block text-lg font-normal mt-2 text-gray-600">
            Foundational elements of our diversity strategy
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pillars.map((pillar, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-airbnb-red mb-4 text-4xl">{pillar.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
              <p className="text-gray-600">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workforce Diversity */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Global Workforce Representation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <FaChartPie className="text-airbnb-red mr-3 text-2xl" />
                <h3 className="text-xl font-semibold">Gender Identity</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Women+</span>
                  <span className="font-semibold">47%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-airbnb-red rounded-full w-2/5"></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <FaGlobeAmericas className="text-airbnb-red mr-3 text-2xl" />
                <h3 className="text-xl font-semibold">Ethnic Diversity</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Underrepresented Groups</span>
                  <span className="font-semibold">38%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-airbnb-red rounded-full w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Resource Groups */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Employee Resource Groups
          <span className="block text-lg font-normal mt-2 text-gray-600">
            80% participation across our global team
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {erGs.map((erg, index) => (
            <div key={index} className={`${erg.color} p-6 rounded-xl text-center`}>
              <h3 className="text-xl font-semibold mb-2">{erg.name}</h3>
              <p className="text-gray-600">{erg.members} members</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inclusion Initiatives */}
      <section className="bg-airbnb-red text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Global Inclusion Programs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <FaUserPlus className="text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Apprenticeship Program</h3>
              <p>Non-traditional pathways into tech careers</p>
            </div>
            
            <div className="text-center p-6">
              <FaBookOpen className="text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Inclusive Leadership Training</h3>
              <p>100% completion rate across people managers</p>
            </div>
            
            <div className="text-center p-6">
              <FaHandsHelping className="text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community Partnerships</h3>
              <p>$2M annual investment in diversity-focused nonprofits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Timeline */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Our Diversity Journey
        </h2>
        
        <div className="flex justify-between items-center">
          {milestones.map((milestone, index) => (
            <div key={index} className="text-center">
              <div className="h-8 w-8 bg-airbnb-red rounded-full mx-auto mb-2"></div>
              <p className="font-semibold">{milestone.year}</p>
              <p className="text-gray-600 max-w-[200px]">{milestone.event}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <div className="bg-gray-800 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Shape the Future With Us</h2>
        <div className="flex justify-center gap-4">
          <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
            Explore Careers
          </button>
          <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
            Read Our DEI Report
          </button>
        </div>
      </div>
    </div>
  );
}
