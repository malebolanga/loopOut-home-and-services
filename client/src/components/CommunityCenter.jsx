import React from 'react';
import {
  FaUsers,
  FaCalendarAlt,
  FaComments,
  FaHandsHelping,
  FaMapMarkerAlt,
  FaBookOpen,
  FaSeedling,
  FaStar,
  FaHandshake,
  FaChalkboardTeacher
} from 'react-icons/fa';

export default function  CommunityCenter() {

  const upcomingEvents = [
    {
      date: "2024-08-20",
      title: "Sustainable Hosting Workshop",
      location: "Virtual",
      type: "Education"
    },
    {
      date: "2024-09-05",
      title: "Local Host Meetup: Paris",
      location: "Le Marais, Paris",
      type: "Networking"
    }
  ];

  const forumCategories = [
    {
      name: "New Hosts",
      threads: 245,
      icon: <FaStar />
    },
    {
      name: "Local Regulations",
      threads: 891,
      icon: <FaMapMarkerAlt />
    }
  ];

  const learningResources = [
    {
      title: "Host Success Guide",
      format: "PDF",
      icon: <FaBookOpen />
    },
    {
      title: "Safety Webinar Series",
      format: "Video",
      icon: <FaChalkboardTeacher />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            LoupeOut Community Center
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Connect, learn, and grow with hosts and travelers worldwide
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-airbnb-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Join Discussion
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Find Local Events
            </button>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-airbnb-red">2.3M+</div>
            <p className="text-gray-600">Community Members</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-airbnb-red">45K+</div>
            <p className="text-gray-600">Local Meetups</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-airbnb-red">650+</div>
            <p className="text-gray-600">Community Guides</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-airbnb-red">98%</div>
            <p className="text-gray-600">Positive Interactions</p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events Column */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaCalendarAlt className="mr-3 text-airbnb-red" />
              Upcoming Events
            </h2>
            <div className="space-y-6">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border-b pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <p className="text-gray-600">
                        <FaMapMarkerAlt className="inline mr-2" />
                        {event.location}
                      </p>
                    </div>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {event.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-airbnb-red">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <button className="bg-airbnb-red text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      RSVP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forum Column */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaComments className="mr-3 text-airbnb-red" />
              Discussion Forums
            </h2>
            <div className="space-y-6">
              {forumCategories.map((category, index) => (
                <div key={index} className="hover:bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-airbnb-red mr-3">
                      {category.icon}
                    </span>
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {category.threads.toLocaleString()} active discussions
                  </p>
                </div>
              ))}
              <button className="w-full text-center text-airbnb-red font-semibold mt-4">
                View All Categories →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Hub */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 flex items-center">
            <FaBookOpen className="mr-3 text-airbnb-red" />
            Learning Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {learningResources.map((resource, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-airbnb-red text-3xl mb-4">
                  {resource.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.format}</p>
                <button className="text-airbnb-red font-semibold">
                  Access Resource →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Connections */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaHandsHelping className="mr-3 text-airbnb-red" />
              Neighborhood Partnerships
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <FaSeedling className="text-green-600 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold">Community Impact Program</h3>
                  <p className="text-gray-600">
                    5% of local fees fund neighborhood projects
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaHandshake className="text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="font-semibold">Local Business Network</h3>
                  <p className="text-gray-600">
                    Discounts and partnerships with nearby businesses
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FaUsers className="mr-3 text-airbnb-red" />
              Host Mentorship Program
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>New Host Matching</span>
                <button className="bg-airbnb-red text-white px-4 py-2 rounded-lg hover:bg-red-700">
                  Apply Now
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>Become a Mentor</span>
                <button className="bg-airbnb-red text-white px-4 py-2 rounded-lg hover:bg-red-700">
                  Join Program
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Global Community</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
              Create Account
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Explore Benefits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
