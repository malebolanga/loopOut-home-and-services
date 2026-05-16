// src/pages/ArticlePages.jsx

import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import "../styles/variables.scss";
export default function ArticlePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="space-y-8">
        {/* Back Button */}
        <a 
          href="/guides" 
          className="flex items-center text-airbnb-dark hover:text-airbnb-darkest mb-6"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Guides
        </a>

        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-airbnb-darkest">
            First-Time Rent and Buyer Guide
          </h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span>Essential property guide</span>
            <span className="mx-2">·</span>
            <span>Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Hero Image */}
        <img 
          src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800" 
          alt="Property keys" 
          className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-sm"
        />

        {/* Content Sections */}
        <div className="space-y-8 text-airbnb-darkest">
          {/* Buying Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Buying Your First Property</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong className="text-airbnb-darkest">Budget Planning</strong><br/>
                Start by evaluating your finances. Most experts recommend spending no more than 28% of your gross monthly income on housing expenses.
              </p>
              <p>
                <strong className="text-airbnb-darkest">Mortgage Basics</strong><br/>
                Get pre-approved before house hunting. Compare fixed vs adjustable rates, and understand closing costs (typically 2-5% of home price).
              </p>
            </div>
          </section>

          {/* Renting Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Renting Smart</h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-airbnb-lightest p-4 rounded-lg">
                <h3 className="font-medium text-airbnb-darkest mb-2">Rental Checklist</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Verify landlord/property manager credentials</li>
                  <li>Document existing property condition</li>
                  <li>Understand maintenance responsibilities</li>
                  <li>Check for rent control regulations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Common Questions</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">What s better: Renting or Buying?</h3>
                <p className="text-gray-700 mt-2">
                  Depends on your timeline and market conditions. Generally consider buying if you ll stay 5+ years. Use our rent vs buy calculator for personalized advice.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">Essential documents for rentals?</h3>
                <p className="text-gray-700 mt-2">
                  Prepare: ID proof, income verification (3x monthly rent), rental history, and references. International renters may need a guarantor.
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
