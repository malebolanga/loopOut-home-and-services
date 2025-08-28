// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Link } from 'react-router-dom';

export default function Become() {
  return (
    <div className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center text-slate-800">
        Get Started on LoupeOut Home
      </h2>
      <h1 className="text-xl font-bold text-center mb-4 text-slate-700">
        Learn how to start hosting, from creating your listing to prepping your space.
      </h1>

      <div className="h-200 w-90 flex-col gap-4 mx-auto p-10 px-3 max-w-6xl">
        <img
          className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]"
          src="https://images.unsplash.com/photo-1460317442991-0ec209397118?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXBhcnRtZW50fGVufDB8fDB8fHww"
          alt="example"
        />
      </div>

      <h1 className="uppercase text-xl font-bold mb-4 text-slate-700">
        Create Your Listing
      </h1>

      <p className="text-xs sm:text-sm text-gray-400">
        Think of your listing as an advertisement for your space. Make it compelling and honest about any quirks.
      </p>

      <p className="text-xs sm:text-sm text-gray-400">
        Start by entering basic details such as the location, property type, and number of bedrooms and bathrooms your guests will have access to.
      </p>

      <p className="text-xs sm:text-sm text-gray-400">
        Take high-quality photos of the space. Guests love browsing images when making a decision on where to stay. Clean and tidy up your space beforehand, and capture each area using natural light and landscape orientation when possible.
      </p>

      <p className="text-xs sm:text-sm text-gray-400">
        Highlight unique features. When writing your listings title and description, emphasize what makes your place stand out, like a view or a pool. Be transparent about any important details such as stairs or parking.
      </p>

      <div className="h-100 w-90 flex-col gap-4 p-10 px-3 mx-auto max-w-6xl">
        <img
          className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]"
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdXNlfGVufDB8fDB8fHww"
          alt="example"
        />
      </div>

      <div className="flex-col gap-4 p-10 px-3 max-w-6xl">
        <Link
          className="bg-red-400 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </div>

      <h1 className="uppercase text-xl font-bold mb-4 text-slate-700">
        To Become a Host in Just 30 Seconds, Follow These Simple Steps:
      </h1>
      <p className="text-xs sm:text-sm text-gray-400">
        <ol>
          <li>1. Create a sign-up account.</li>
          <li>2. Go to your profile and click on  Create a Listing.</li>
          <li>3. Fill out the required information to create your hosting listing.</li>
        </ol>
      </p>

      <p className="text-xs sm:text-sm text-gray-400">
        Thats it! Youll be on your way to becoming a host in no time.
      </p>
      <br />

      <h1 className="uppercase text-xl font-bold mb-4 text-slate-700">
        Prepare Your Space
      </h1>

      <p className="text-xs sm:text-sm text-gray-400">
        Whether youre expecting your first guest or your 100th, follow these steps to ensure your space is ready to welcome guests.
      </p>
      <br />

      <div className="flex gap-6 mx-auto">
        <img
          className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[400px]"
          src="https://images.unsplash.com/photo-1554995207-c18c203602cb?&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NHx8fGVufDB8fHx8fA%3D%3D"
          alt="example"
        />

        <img
          className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[400px]"
          src="https://images.unsplash.com/photo-1564540574859-0dfb63985953?&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D"
          alt="example"
        />
      </div>

      <div className="flex-col gap-4 p-10 px-3 max-w-6xl">
        <h1 className="uppercase text-xl font-bold mb-4 text-slate-700">
          Its Easy to Get Started on LoupeOut Home
        </h1>
      </div>

      <h3 className="text-lg font-semibold text-slate-600">1. First, Create a Sign-Up Account</h3>
      <p className="text-xs sm:text-sm text-gray-400">
        Share some basic info, like your location and the number of guests your space can accommodate.
      </p>

      <h3 className="text-lg font-semibold text-slate-600">2. Make It Stand Out</h3>
      <p className="text-xs sm:text-sm text-gray-400">
        Add three or more photos, plus a title and description—well assist you with the process.
      </p>

      <h3 className="text-lg font-semibold text-slate-600">3. Finish Up and Publish</h3>
      <p className="text-xs sm:text-sm text-gray-400">
        Choose whether to start with an experienced guest, set your starting price, and publish your listing.
      </p>
      <br />

      <h3 className="uppercase text-xl font-bold mb-4 text-slate-700">
        Try Your First Listing Here
      </h3>
      <br />
      <Link
        className="bg-red-400 text-white p-3 px-6 rounded-lg uppercase text-center hover:opacity-95"
        to={'/create-listing'}
      >
        Create Listing
      </Link>
      <br />
      <br />
      <br />
      <div className="p-0 mx-auto">
        <img
          className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[400px]"
          src="https://images.unsplash.com/photo-1590986201364-ce95ab280ca2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9yJTIwcmVudHxlbnwwfHwwfHx8MA%3D%3D"
          alt="example"
        />
      </div>
    </div>
  );
}
