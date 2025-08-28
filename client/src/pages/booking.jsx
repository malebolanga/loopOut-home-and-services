/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Booking(props) { // Fixed: Use `props` instead of destructuring directly
  const listing = props.listing || {}; // Fixed: Safely handle `undefined` listing

  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const sendBookingInformation = async (userId, startDate, endDate, name, contact) => {
    try {
      const response = await fetch("/api/send-booking-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          startDate,
          endDate,
          name,
          contact,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send booking email");
      }

      alert("Booking information sent to the property owner.");
    } catch (error) {
      console.error("Error sending booking information:", error);
      alert("An error occurred while sending the booking information.");
    }
  };

  if (!listing.type) {
    return <p>Listing data is not available.</p>;
  }

  return (
    <main>
      <div>
        <div className="flex justify-between items-center mt-4">
          {["book", "over"].includes(listing.type) && (
            <button
              onClick={() => setShowCalendar(true)}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Select Booking Dates
            </button>
          )}
        </div>

        {showCalendar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white p-4 rounded shadow-lg" style={{ zIndex: 10000 }}>
              <h2 className="text-lg font-bold mb-4">Select Dates</h2>

              <div>
                <h3>Start Date</h3>
                <Calendar
                  onChange={(date) => setStartDate(date)} // Fixed: Ensure correct date type is passed
                  value={startDate}
                  minDate={new Date()}
                />
              </div>

              {startDate && (
                <div className="mt-4">
                  <h3>End Date</h3>
                  <Calendar
                    onChange={(date) => setEndDate(date)}
                    value={endDate}
                    minDate={startDate}
                  />
                </div>
              )}

              <form className="mt-4">
                <div className="mb-4">
                  <label htmlFor="name" className="block font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="contact" className="block font-medium">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    id="contact"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter your contact information"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
              </form>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => {
                    if (!name || !contact) {
                      alert("Please enter your name and contact information.");
                      return;
                    }
                    if (startDate && endDate) {
                      sendBookingInformation(
                        listing.userId,
                        startDate.toISOString(),
                        endDate.toISOString(),
                        name,
                        contact
                      );
                      setShowCalendar(false);
                    } else {
                      alert("Please select both start and end dates.");
                    }
                  }}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Confirm Booking
                </button>

                <button
                  onClick={() => setShowCalendar(false)}
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
