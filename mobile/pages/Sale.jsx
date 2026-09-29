/* eslint-disable no-unused-vars */
// src/pages/MyListing.js

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "swiper/css/bundle";
import "react-slideshow-image/dist/styles.css";

import ListingItem from "../components/ListingItems";

const DAYS_THRESHOLD = 100; // Number of days to keep listings visible

// Function to calculate how many days since the listing was created
const getDaysRemaining = (listingDate) => {
  const currentDate = new Date();
  const listingDateObj = new Date(listingDate);
  const differenceInTime = currentDate - listingDateObj;
  const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days
  return Math.max(DAYS_THRESHOLD - Math.floor(differenceInDays), 0); // Show remaining days or 0 if expired
};

// Function to determine if the listing is still within the threshold (100 days)
const isListingActive = (listingDate) => {
  const currentDate = new Date();
  const listingDateObj = new Date(listingDate);
  const differenceInTime = currentDate - listingDateObj;
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  return differenceInDays <= DAYS_THRESHOLD; // Return true if the listing is within 100 days
};

export default function MyListing() {
  const { currentUser } = useSelector((state) => state.user); // Extract currentUser from Redux state

  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [overListings, setOverListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const types = ["offer", "rent", "sale", "over"];
        const requests = types.map((type) =>
          fetch(`/api/user/listings/${currentUser._id}?type=${type}`).then((res) => res.json())
        );

        const [offerData, rentData, saleData, overData] = await Promise.all(requests);
        setOfferListings(offerData);
        setRentListings(rentData);
        setSaleListings(saleData);
        setOverListings(overData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [currentUser._id]);

  // Filter out expired listings for each type
  const activeListings = {
   
    rent: rentListings.filter((listing) => isListingActive(listing.createdAt)),
    
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 max-w-6xl mx-auto">
        <h1 className="text-gray-800 dark:text-white font-extrabold text-3xl md:text-5xl">
          Find Your <span className="text-indigo-600">Listings</span>
        </h1>
        <p className="text-gray-600 dark:text-white text-sm md:text-base">
          Thank you for choosing LoupeOut Home as your trusted platform! Whether you’re listing properties, exploring new homes, or managing rentals, we’re here to make the process seamless and rewarding. Happy exploring!
        </p>
        <p className="text-gray-600 dark:text-white text-sm md:text-base">
          Welcome, <span className="text-indigo-600 font-semibold">{currentUser.username}</span>! Manage your listings or create new ones below.
        </p>
      </div>

      {/* Listings Section */}
      <div className="max-w-6xl mx-auto p-6">
        {Object.keys(activeListings).map((type) => (
          activeListings[type].length > 0 && (
            <div key={type} className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold capitalize text-gray-800 dark:text-white">
                  {type} Listings
                </h2>
                <Link
                  to={`/List?type=${type}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View All {type} Listings
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {activeListings[type].map((listing) => (
                  <ListingItem
                    key={listing._id}
                    listing={listing}
                    remainingDays={getDaysRemaining(listing.createdAt)}
                  />
                ))}
              </div>
            </div>
          )
        ))}

        {/* No Listings Found */}
        {Object.values(activeListings).every((list) => list.length === 0) && (
          <p className="text-center text-gray-500 dark:text-white text-lg">
            No listings found. Add a new listing to get started!
          </p>
        )}
      </div>
    </div>
  );
}
