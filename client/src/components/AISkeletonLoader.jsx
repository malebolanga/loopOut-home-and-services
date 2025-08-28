import React from 'react';

const AISkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="p-4">
          <div className="h-4 bg-gray-200 mb-2 w-3/4 rounded" />
          <div className="h-3 bg-gray-200 mb-3 w-1/2 rounded" />
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 w-1/4 rounded" />
            <div className="h-3 bg-gray-200 w-1/4 rounded" />
          </div>
          <div className="mt-4 flex justify-between">
            <div className="h-8 bg-gray-200 w-20 rounded-lg" />
            <div className="h-8 bg-gray-200 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default AISkeletonLoader;
