// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useLocation, Link } from 'react-router-dom';


  export default function LoginRequiredPages() {

    const location = useLocation();
    const intendedPath = location.state?.intendedPath || '/';
  return (
    <div className="max-w-md mx-auto mt-20 text-center p-6">
    <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
    <p className="text-gray-600 mb-6">
      You need to login to view your wishlists, create listings, or manage your properties.
    </p>
    <Link
      to="/sign-in"
      state={{ from: intendedPath }} // Pass intended path to login
      className="bg-airbnb-500 text-white px-6 py-3 rounded-lg hover:bg-airbnb-600 transition-colors"
    >
      Login Now
    </Link>
  </div>
);
}