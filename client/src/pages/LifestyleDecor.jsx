// eslint-disable-next-line no-unused-vars
import React from "react";
import {
  FaHome,
  FaKey,
  FaPaintBrush,
  FaCouch,
  FaLightbulb,
  FaTree,
} from "react-icons/fa";

export default function LifestyleDecor() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-2">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            <FaPaintBrush className="inline-block mr-2 text-purple-600" />
            Lifestyle & Decor
          </h1>
          <p className="text-lg text-slate-600">
            Discover tips and advice for creating a beautiful and functional
            living space, whether you re buying or renting.
          </p>
        </div>

        {/* Buying Advice Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center justify-center gap-2">
            <FaHome className="text-blue-600" /> Buying Advice
          </h2>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tip 1 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <FaCouch className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Choose the Right Furniture
              </h3>
              <p className="text-sm text-gray-600">
                Invest in quality furniture that fits your space and style.
              </p>
            </div>

            {/* Tip 2 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <FaLightbulb className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Lighting Matters
              </h3>
              <p className="text-sm text-gray-600">
                Use a mix of ambient, task, and accent lighting to create a warm
                and inviting atmosphere.
              </p>
            </div>

            {/* Tip 3 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <FaTree className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Bring Nature Indoors
              </h3>
              <p className="text-sm text-gray-600">
                Add plants and natural elements to improve air quality and
                enhance your decor.
              </p>
            </div>
          </div>
        </div>

        {/* Renting Advice Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center justify-center gap-2">
            <FaKey className="text-green-600" /> Renting Advice
          </h2>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tip 1 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <FaCouch className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Temporary Decor Solutions
              </h3>
              <p className="text-sm text-gray-600">
                Use removable wallpaper, decals, and temporary fixtures to
                personalize your rental space.
              </p>
            </div>

            {/* Tip 2 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <FaLightbulb className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Maximize Small Spaces
              </h3>
              <p className="text-sm text-gray-600">
                Use multi-functional furniture and smart storage solutions to
                make the most of your space.
              </p>
            </div>

            {/* Tip 3 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <FaTree className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Add Personal Touches
              </h3>
              <p className="text-sm text-gray-600">
                Use rugs, cushions, and artwork to make your rental feel like
                home.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
