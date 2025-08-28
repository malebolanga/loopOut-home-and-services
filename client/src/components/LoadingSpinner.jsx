// src/components/LoadingSpinner.jsx
import { FaSpinner } from 'react-icons/fa';

// eslint-disable-next-line react/prop-types
export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto p-4 text-center">
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}