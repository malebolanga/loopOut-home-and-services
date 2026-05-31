// src/pages/Output.jsx
import React from 'react';

// Simple Output page component - can be extended to show any output data
const Output = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Output Page</h1>
      <p className="text-lg text-gray-600 mb-8">
        This is a placeholder Output page. Replace this content with the desired output display.
      </p>
      {/* Example placeholder card */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <pre className="whitespace-pre-wrap text-sm text-gray-800">
          {/* Sample output */}
          {`{
  "status": "success",
  "message": "Your output will appear here."
}`}
        </pre>
      </div>
    </div>
  );
};

export default Output;
