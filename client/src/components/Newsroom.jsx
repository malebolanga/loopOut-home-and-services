// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  FaNewspaper,
  FaArrowRight,
  FaFilePdf,
  FaDownload,
  FaImages,
  FaExternalLinkAlt,
  FaEnvelope,
  FaQuoteLeft,
  FaGlobe,
  FaCalendarAlt,
  FaTag
} from 'react-icons/fa';

export default function Newsroom() {
  const pressReleases = [
    {
      id: 1,
      type: 'Press Release',
      date: '2024-05-15',
      title: 'Loupeout Home Reaches 1 Million Active Users Worldwide',
      excerpt: 'Company celebrates milestone with new sustainability initiatives and community programs...',
      category: 'Company News'
    },
    {
      id: 2,
      type: 'Announcement',
      date: '2024-05-10',
      title: 'New Safety Features Rolled Out Across All Listings',
      excerpt: 'Enhanced verification process and smart home integration now available for all hosts...',
      category: 'Product Update'
    }
  ];

  const mediaCoverage = [
    {
      source: 'TechCrunch',
      date: '2024-05-12',
      excerpt: '"Loupeout Home is redefining the vacation rental experience with their innovative approach..."',
      url: '#'
    },
    {
      source: 'Forbes',
      date: '2024-05-08',
      excerpt: '"In a crowded market, Loupeout Home stands out with its commitment to sustainable tourism..."',
      url: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-airbnb-red text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center">
            <FaNewspaper className="mr-4" />
            Loupeout Newsroom
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Stay updated with the latest news, announcements, and media resources from Loupeout Home
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Press Releases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaTag className="mr-3 text-airbnb-red" />
            Latest Updates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pressReleases.map((release) => (
              <div key={release.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
                    <FaCalendarAlt className="mr-2" />
                    {new Date(release.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-600">{release.category}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{release.title}</h3>
                <p className="text-gray-600 mb-4">{release.excerpt}</p>
                <button className="text-airbnb-red hover:text-red-700 flex items-center font-medium">
                  Read Full Release
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Media Resources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaGlobe className="mr-3 text-airbnb-red" />
            Media Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
              <FaFilePdf className="text-airbnb-red text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Press Kit</h3>
              <p className="text-gray-600 mb-4">Download our brand assets, executive bios, and company facts</p>
              <button className="bg-airbnb-red text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center mx-auto">
                <FaDownload className="mr-2" />
                Download PDF
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
              <FaImages className="text-airbnb-red text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Media Gallery</h3>
              <p className="text-gray-600 mb-4">High-resolution images, logos, and product screenshots</p>
              <button className="bg-airbnb-red text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center mx-auto">
                <FaExternalLinkAlt className="mr-2" />
                View Gallery
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
              <FaEnvelope className="text-airbnb-red text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Press Contact</h3>
              <p className="text-gray-600 mb-4">Get in touch with our media relations team</p>
              <a
                href="mailto:press@loupeout.com"
                className="bg-airbnb-red text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center mx-auto"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>

        {/* Media Coverage */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FaQuoteLeft className="mr-3 text-airbnb-red" />
            In The News
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mediaCoverage.map((article, index) => (
              <a
                key={index}
                href={article.url}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-shadow group"
              >
                <div className="flex items-center mb-3 text-gray-500">
                  <span className="font-medium">{article.source}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
                <blockquote className="text-xl italic text-gray-800 border-l-4 border-airbnb-red pl-4">
                  {article.excerpt}
                </blockquote>
                <div className="mt-4 text-airbnb-red flex items-center group-hover:underline">
                  Read Article
                  <FaArrowRight className="ml-2" />
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="bg-airbnb-red text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-6">Subscribe to our press mailing list</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-white text-airbnb-red px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

