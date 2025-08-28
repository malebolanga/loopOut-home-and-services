import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "../styles/ListingDetails.scss";
import { Phone,  } from "@mui/icons-material";
import SwiperCore from "swiper";
import { useSelector } from "react-redux";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

import {
  FaBath,
  FaBed,
  FaShieldAlt,
  
  FaChair,
  FaCookie,
  FaHome,

  FaMapMarkerAlt,
  FaParking,
  FaWhatsapp,
  FaShare,
  FaStar,
  FaSwimmingPool,
  FaWifi,
  FaEnvelope,
  FaPhone,
  FaHeart,
  FaFlag,
  FaStoreAlt,
  FaStackOverflow,
  FaTv,
} from "react-icons/fa";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Calendar from "react-calendar";  // Import the calendar component
import "react-calendar/dist/Calendar.css";  // Import the CSS for styling
import jsPDF from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Optional for table support in jsPDF

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};
import emailjs from "emailjs-com"; // Import EmailJS
export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact] = useState();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [rating] = useState(0); // User's current rating for this listing
  const [averageRating] = useState(0); // Average rating from all users
  const [location, setLocation] = useState({ lat: -34.397, lng: 150.644 }); // Default location
  const [userReview, setUserReview] = useState(''); // For the current review being written
  const [reviews, setReviews] = useState([]); // To store all submitted reviews
 
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [name, setName] = useState("");
const [Contact, setContact] = useState("");
const [emailMessage, setEmailMessage] = useState("");


  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();

        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);

        // Fetch coordinates using Google Geocoding API or a similar method
        const address = encodeURIComponent(data.address);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=YOUR_GOOGLE_MAPS_API_KEY`
        );
        const geocodeData = await response.json();
        if (geocodeData.results.length > 0) {
          const { lat, lng } = geocodeData.results[0].geometry.location;
          setLocation({ lat, lng });
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId, currentUser]);

  const toggleWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          listingId: listing.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsWishlisted(data.isWishlisted);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (userReview.trim()) {
      setReviews((prevReviews) => [
        ...prevReviews,
        { id: Date.now(), content: userReview },
      ]);
      setUserReview(''); // Clear the textarea after submission
    }
  };

  const handleDeleteReview = (id) => {
    setReviews((prevReviews) => prevReviews.filter((review) => review.id !== id));
  };

  const handleReport = () => {
    alert(`Report Submitted! 
    Link: ${window.location.href}
    Email: ${listing.email}
    Listing Ref: ${listing.userRef}`);
    setReporting(false);
  };

  const sendBookingInformation = (userId, startDate, endDate) => {
    // Ensure start and end dates are valid
    const validStartDate = new Date(startDate);
    const validEndDate = new Date(endDate);

    if (validStartDate instanceof Date && !isNaN(validStartDate) &&
        validEndDate instanceof Date && !isNaN(validEndDate)) {
      
      const emailContent = `
        Booking Request:
        Property Name: ${listing.name}
        Price: $${listing.price}
        Reference Number: ${listing.refNumber}
        Dates: From ${startDate.toLocaleDateString()} To ${endDate.toLocaleDateString()}
        Contact: ${listing.userName} (${listing.userEmail})
      `;

      // EmailJS API parameters
      const templateParams = {
        user_id: "your_emailjs_user_id", // Your EmailJS User ID
        service_id: "your_service_id", // Your EmailJS Service ID
        template_id: "your_template_id", // Your EmailJS Template ID
        to_email: listing.userEmail, // Recipient email (Owner's email)
        subject: "Booking Request", // Email subject
        message: emailContent, // Email body
      };

      // Send the email using EmailJS
      emailjs
        .send(templateParams.service_id, templateParams.template_id, templateParams)
        .then((response) => {
          console.log("Email sent successfully:", response);
          alert("Booking information has been sent!");
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          alert("There was an issue sending the email. Please try again.");
        });
    } else {
      alert("Invalid dates selected. Please choose valid start and end dates.");
    }
  };


   // Function to generate and download the voucher
   const generateVoucher = () => {
    if (!name || !contact) {
      alert("Please enter your name and contact information before downloading the voucher.");
      return;
    }

    const doc = new jsPDF();

    // Add content to the PDF
    doc.setFontSize(16);
    doc.text("Booking Voucher", 20, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 20, 40);
    doc.text(`Contact: ${contact}`, 20, 50);
    doc.text(`Property: ${listing.name}`, 20, 60);
    doc.text(`Address: ${listing.address}`, 20, 70);
    doc.text(`Booking Dates: ${startDate?.toLocaleDateString()} to ${endDate?.toLocaleDateString()}`, 20, 80);
    doc.text(`Price: R${listing.offer ? listing.discountPrice : listing.regularPrice}`, 20, 90);

    // Optional: Add a footer or other details
    doc.setFontSize(10);
    doc.text("Thank you for your booking!", 20, 110);

    // Download the PDF
    doc.save("BookingVoucher.pdf");
  };


  const contactOwner = () => {
    if (!name || !contact || !emailMessage) {
      alert("Please fill out your name, contact, and message before sending an email.");
      return;
    }

    // Construct the email body and link
    const mailtoLink = `mailto:${currentUser.email}?subject=Inquiry about ${currentUser.username}&body=Hi,\n\nMy name is ${name}.\nContact: ${contact}.\n\n${emailMessage}\n\nThank you.`;

    // Open the email client
    window.location.href = mailtoLink;
  };
  

 
  return (
    <main className="top-50">
      {listing && (
        <div className="">
          {/* Swiper Component */}
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{ background: `url(${url}) center/cover no-repeat` }}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Share Button */}
          <div
            className="fixed top-[26%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <FaShare className="text-slate-500 " />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}
            <div className="relative">
   

   {/* Type Badge */}
   <p
     className={`absolute top-[25%] left-4 text-sm font-semibold text-white px-3 py-1 rounded-md shadow-lg ${
       listing.type === "office"
         ? "bg-yellow-500"
         : listing.type === "sale"
         ? "bg-green-500"
         : "bg-yellow-500"
     }`}
   >
     {listing.type === "office"
       ? "Per Hour"
       : listing.type === "sale"
       ? "For Sale"
       : "Overnight"}
   </p>
 </div>

          {/* Listing Details */}
          <div className="bg-white flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <h1 className="text-2xl font-semibold">
              {listing.name} - R {listing.offer ? listing.discountPrice : listing.regularPrice}
              {listing.type === "office" && " / Per Hour"}
             
            </h1>

            <p className="flex items-center gap-2 text-slate-600">
              <FaHome className="text-green-700" /> {listing.kind}
            </p>
            <p className="flex items-center gap-2 text-slate-600">
              <FaMapMarkerAlt className="text-green-700" /> {listing.address}
            </p>

            <div className="relative w-full max-w-[600px] mx-auto">
  {/* Image Slider */}


  {/* Offer (Conditional) */}
  {listing.offer && (
    <p className="bg-green-600 w-full text-white text-center p-2 rounded-md font-medium mt-3">
      R{listing.regularPrice - listing.discountPrice} Off
    </p>
  )}
</div>


<p className="text-gray-700 text-base leading-relaxed">
  <strong className="text-gray-900 font-semibold">Description:</strong> {listing.description}
</p>

            <div className="my-2">
              <strong>What this building offers:</strong>
              <ul className="text-green-900 my-4 font-semibold flex flex-wrap gap-4">
                <li><FaBed /> {listing.bedrooms} {listing.bedrooms > 1 ? "Offices" : "Office"}</li>
                <li><FaBath /> {listing.bathrooms} {listing.bathrooms > 1 ? "bathrooms" : "bathroom"}</li>
                {listing.parking && <li><FaParking /> Parking Available</li>}
                {listing.furnished && <li><FaChair /> Fully Furnished</li>}
                {listing.wifi && <li><FaWifi /> Free WiFi</li>}
                {listing.pool && <li><FaSwimmingPool /> Swimming Pool</li>}
                {listing.security  && <li><FaShieldAlt /> Security</li>}
                {listing.stove  && <li><FaStackOverflow /> Stove</li>}
                {listing.tv  && <li><FaTv /> TV</li>}
                {listing.storage  && <li><FaStoreAlt /> Storage</li>}
                {listing.kitchen   && <li><FaCookie /> Kitchen</li>}
              </ul>
            </div>

        


            <hr></hr>
            <div className="my-2 py-0">
            <strong>Things to know:</strong>
              <p className="text-slate-800 my-4">
                <span className="font-semibold text-black">Office Rules - </span>
                {listing.rules}
              </p>
            </div>

            <hr />

            {/* Rating Section */}
            <div className="flex items-center gap-2 bg-white">
              <span className="text-md text-red-700">
                Average Rating: {averageRating.toFixed(1)} ★
              </span>
            </div>

            {/* User Rating */}
            {currentUser && (
              <div className="flex items-center gap-2 my-4">
                <span className="text-sm text-gray-600">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer ${
                      star <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => (star)}
                  />
                ))}
              </div>
            )}
    

    <div className="review-container">
      {/* Review Form */}
      <form onSubmit={handleReviewSubmit} className="my-4">
        <textarea
          value={userReview}
          onChange={(e) => setUserReview(e.target.value)}
          placeholder="Write your review..."
          className="w-full border rounded p-2"
          required
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white rounded p-2"
        >
          Submit Review
        </button>
      </form>

      {/* Display Reviews */}
      <div className="review-list mt-4">
        <h3 className="text-xl font-bold mb-2">User Reviews</h3>
        {reviews.length > 0 ? (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="border-b border-gray-200 pb-2 mb-2 flex justify-between items-center"
              >
                <span>{review.content}</span>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
        )}
      </div>
    </div>

      

            {/* Display user profile picture and name */}
            <div className="">
  <img
    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    alt="profile"
    className="rounded-full gap-4 h-14 w-14 object-cover cursor-pointer mt-1"
  />
  <div className="mt-4 text-green-900">
    <h1 className="text-1xl font-semibold my-2">Hosted By {listing.host}</h1>
    <ul>
      <li className="flex  gap-0 whitespace-nowrap py-2">
        <Phone className="text-lg" />
        +27{listing.contact}
      </li>
    </ul>
  </div>
</div>
<hr />





           
<div>
      {/* Header Section */}
      <div className="flex justify-between mb-4">
        <p className="font-semibold text-lg">Location</p>
      </div>

      {/* Google Map Section */}
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          center={location} 
          zoom={10}
        >
          <Marker position={location} />
        </GoogleMap>
      </LoadScript>
    </div>
          
          
        
        

          <div className="fixed-bottom-icons">
  <a 
    href={`https://wa.me/${listing.contact}`} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="icon whatsapp"
  >
    <FaWhatsapp />
  </a>
  <a 
    href={`mailto:${contact && <Contact listing={listing} />}`} 
    className="icon email"
  >
    <FaEnvelope />
  </a>
  <a 
    href={`tel:+27${listing.contact}`} 
    className="icon call"
  >
    <FaPhone />
  </a>

  <a 
   
    className="icon call"
  >
     <div>
      {/* Heart Icon */}
      <FaHeart
        className={`cursor-pointer text-2xl ${isWishlisted ? "text-red-500" : "text-gray-500"}`}
        onClick={toggleWishlist}
      />

    </div>
  </a>
</div>




<main>



          
           
    {/* Other code remains unchanged */}

    {listing && !loading && !error && (
      <div>
      {/* Report Section */}
      <div className="flex justify-between items-center mt-4">
  {/* Button to show the calendar popup */}
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
    style={{ zIndex: 9999 }} // Ensures the popup is in front of everything
  >
    <div className="bg-white p-4 rounded shadow-lg" style={{ zIndex: 10000 }}>
      <h2 className="text-lg font-bold mb-4">Select Dates</h2>

      <div>
        <h3>Start Date</h3>
        <Calendar
          onChange={setStartDate} // Ensure it always sets a valid Date object
          value={startDate}
          minDate={new Date()}
          selectRange
        />
      </div>

      {/* Calendar for End Date */}
      {startDate && (
        <div className="mt-4">
          <h3>End Date</h3>
          <Calendar
            onChange={setEndDate} // Ensure it always sets a valid Date object
            value={endDate}
            minDate={startDate}
            selectRange
          />
        </div>
      )}

      {/* Form for Name and Contact */}
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

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => {
            if (!name || !contact) {
              alert("Please enter your name and contact information.");
              return;
            }
            if (startDate && endDate) {
              sendBookingInformation(listing.userId, startDate, endDate, name, contact);
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


    {/* Report Section */}
<div className="flex justify-between items-center mt-4">
  <button
    onClick={() => setReporting(true)}
    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-300"
  >
    <FaFlag />
    <span>Report Listing</span>
  </button>
</div>

<main className="mt-6">
  {listing && (
    <div>
      {/* Voucher Download Section */}
      <div className="mt-6">
        <button
          onClick={generateVoucher}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition duration-300"
        >
          Download Voucher
        </button>
      </div>

      {/* ... remaining content ... */}
    </div>
  )}
</main>

{/* User Input Section */}
<div className="mt-6">
<span className="text-lg font-semibold text-center">Contact the Host</span>
  {/* Input for Name */}
  <input
    type="text"
    placeholder="Your Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {/* Input for Contact */}
  <input
    type="text"
    placeholder="Your Contact"
    value={contact}
    onChange={(e) => setContact(e.target.value)}
    className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {/* Email Message Input */}
  <textarea
    placeholder="Write your message to the property owner here..."
    value={emailMessage}
    onChange={(e) => setEmailMessage(e.target.value)}
    className="border border-gray-300 px-4 py-2 rounded-lg w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
    rows="5"
  ></textarea>
</div>

{/* Action Buttons */}
<div className="flex gap-4">
  <button
    onClick={contactOwner}
    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
  >
    Contact Owner
  </button>
</div>

    

       {/* Reporting Modal */}
       {reporting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold">Report Listing</h2>
                <p className="my-4">
                  Are you sure you want to report this listing? Below are the details that will be sent:
                </p>
                <ul className="text-sm text-gray-700">
                  <li><strong>Link:</strong> {window.location.href}</li>
                  <li><strong>Email:</strong> {currentUser.email}</li>
                  <li><strong>Listing Ref:</strong> {listing.userRef}</li>
                </ul>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleReport}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    Confirm Report
                  </button>
                  <button
                    onClick={() => setReporting(false)}
                    className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Remaining JSX code */}
      </div>
    )}
  </main>

  </div>
        </div>
        
        
      )}
    </main>
    
  );
}

