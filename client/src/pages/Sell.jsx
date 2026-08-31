// src/pages/Sell.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import PageTransition from '../components/PageTransition'; // Assuming exists for animation
import { motion } from 'framer-motion';

const Sell = () => {
  const [sellListings, setSellListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const limit = 12;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSellListings = async (reset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    const currentPage = reset ? 1 : page;
    const url = `/api/sell?limit=${limit}&page=${currentPage}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load sell listings: ${response.status}`);
      const data = await response.json();
      const newItems = Array.isArray(data) ? data : data.listings || [];
      setSellListings(prev => {
        const combined = reset ? newItems : [...prev, ...newItems];
        // dedupe by _id
        const unique = combined.filter((item, idx, self) => idx === self.findIndex(i => i._id === item._id));
        return unique;
      });
      if (reset) setPage(2);
      else setPage(prev => prev + 1);
      setHasMore(newItems.length >= limit);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchSellListings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300 && !loading && hasMore && !isFetchingRef.current) {
        fetchSellListings();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page]);

  if (loading && sellListings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="text-gray-600 dark:text-white">Loading sell listings...</span>
      </div>
    );
  }

  if (error && sellListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h3 className="text-xl font-semibold mb-2">{error}</h3>
        <button onClick={() => fetchSellListings(true)} className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition">
          Retry
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Sell Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sellListings.map(listing => (
            <ListingItem key={listing._id} listing={listing} isSale={true} />
          ))}
        </div>
        {loading && (
          <div className="flex justify-center mt-6">
            <span className="text-gray-500 dark:text-white">Loading more...</span>
          </div>
        )}
        {!hasMore && sellListings.length > 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-white">All sell listings loaded.</div>
        )}
      </section>
    </PageTransition>
  );
};

export default Sell;
