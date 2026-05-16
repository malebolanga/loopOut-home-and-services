// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {  } from 'react-icons/fi';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaTicketAlt, 
  FaParking, 
  FaUtensils, 
  FaChild 
} from 'react-icons/fa';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-red mx-auto"></div>
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
          <Link
            to="/events"
            className="mt-4 inline-block px-4 py-2 bg-airbnb-red text-white rounded-lg hover:bg-red-700"
          >
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          {event.imageUrls.length > 0 && (
            <img
              src={event.imageUrls[0]}
              alt={event.name}
              className="w-full h-96 object-cover"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 text-white rounded-full">
                <FaCalendarAlt className="mr-2" />
                {event.date}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 text-white rounded-full">
                <FaClock className="mr-2" />
                {event.time}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Event Details</h2>
              <p className="text-gray-600 whitespace-pre-line mb-6">{event.description}</p>
              

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Event Features</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {event.parking && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    <FaParking className="mr-2" />
                    Parking Available
                  </span>
                )}
                {event.foodAvailable && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    <FaUtensils className="mr-2" />
                    Food & Drinks
                  </span>
                )}
                {event.familyFriendly && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    <FaChild className="mr-2" />
                    Family Friendly
                  </span>
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

              {event.imageUrls.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">More Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.imageUrls.slice(1).map((url, index) => (
                      <div key={index} className="aspect-square">
                        <img
                          src={url}
                          alt={`${event.name} ${index + 2}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Event Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-airbnb-red mt-1">
                      <FaMapMarkerAlt className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Venue</h3>
                      <p className="text-gray-600">{event.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-airbnb-red mt-1">
                      <FaCalendarAlt className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Date</h3>
                      <p className="text-gray-600">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-airbnb-red mt-1">
                      <FaClock className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Time</h3>
                      <p className="text-gray-600">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-airbnb-red mt-1">
                      <FaTicketAlt className="text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Ticket Price</h3>
                      <p className="text-gray-600">
                        {event.regularPrice === 0
                          ? 'Free Entry'
                          : `R${event.regularPrice}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-airbnb-red mt-1">
                      <div className="w-5 h-5 rounded-full bg-airbnb-red flex items-center justify-center">
                        <span className="text-white text-xs">i</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Hosted By</h3>
                      <p className="text-gray-600">{event.host}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-airbnb-red mt-1">
                      <div className="w-5 h-5 rounded-full bg-airbnb-red flex items-center justify-center">
                        <span className="text-white text-xs">i</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Contact</h3>
                      <p className="text-gray-600">{event.contact}</p>
                    </div>
                  </div>
                </div>
                
                <button className="mt-6 w-full bg-airbnb-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Get Tickets
                </button>
                
                <div className="mt-4 text-center">
                  <Link
                    to="/events"
                    className="text-airbnb-red hover:underline"
                  >
                    ← Back to all events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
