// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaParking, FaUtensils, FaChild } from 'react-icons/fa';
import InfoBadge from '../components/InfoBadge';

export default function EventPage() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/event/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Event not found');
          return;
        }
        setEvent(data);
      } catch (err) {
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-red mx-auto" />
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <p className="text-gray-700 text-lg">{error}</p>
          <Link to="/events" className="mt-4 inline-block px-4 py-2 bg-airbnb-red text-white rounded-lg hover:bg-red-700">Browse All Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Sticky back navigation */}
      <button onClick={() => navigate('/events')} className="mb-4 text-airbnb-red hover:underline flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to events
      </button>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          {event.imageUrls && event.imageUrls.length > 0 && (
            <img src={event.imageUrls[0]} alt={event.name} className="w-full h-96 object-cover" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <InfoBadge icon={<FaCalendarAlt className="h-4 w-4" />}>{event.date}</InfoBadge>
              <InfoBadge icon={<FaClock className="h-4 w-4" />}>{event.time}</InfoBadge>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Details */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Event Details</h2>
              <p className="text-gray-600 whitespace-pre-line mb-6">{event.description}</p>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Event Features</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {event.parking && (
                  <InfoBadge icon={<FaParking className="h-4 w-4" />}>Parking Available</InfoBadge>
                )}
                {event.foodAvailable && (
                  <InfoBadge icon={<FaUtensils className="h-4 w-4" />}>Food & Drinks</InfoBadge>
                )}
                {event.familyFriendly && (
                  <InfoBadge icon={<FaChild className="h-4 w-4" />}>Family Friendly</InfoBadge>
                )}
              </div>
              {event.videoUrl && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Event Video</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <video controls className="rounded-lg w-full">
                      <source src={event.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
              {event.imageUrls && event.imageUrls.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">More Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.imageUrls.slice(1).map((url, index) => (
                      <div key={index} className="aspect-square">
                        <img src={url} alt={`${event.name} ${index + 2}`} className="w-full h-full object-cover rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Right: Information */}
            <div className="bg-gray-50 rounded-xl p-6 sticky top-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Event Information</h2>
              <div className="space-y-4">
                <InfoBadge icon={<FaMapMarkerAlt className="h-4 w-4" />}>{event.address}</InfoBadge>
                <InfoBadge icon={<FaCalendarAlt className="h-4 w-4" />}>{event.date}</InfoBadge>
                <InfoBadge icon={<FaClock className="h-4 w-4" />}>{event.time}</InfoBadge>
                <InfoBadge icon={<FaTicketAlt className="h-4 w-4" />}>{event.regularPrice === 0 ? 'Free Entry' : `R${event.regularPrice}`}</InfoBadge>
                <InfoBadge icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>{event.host}</InfoBadge>
                <InfoBadge icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 01-12 0" /></svg>}>{event.contact}</InfoBadge>
              </div>
              <button className="mt-6 w-full bg-airbnb-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Get Tickets
              </button>
              <div className="mt-4 text-center">
                <Link to="/events" className="text-airbnb-red hover:underline">
                  ← Back to all events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
