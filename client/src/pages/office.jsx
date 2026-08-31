import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import { useSelector } from "react-redux";
import {
  FaBath,
  FaBed,
  FaShieldAlt,
  FaChair,
  FaCookie,
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
  FaTv,
  FaCalendar,
  FaDownload,
  FaCheckCircle,
  FaBuilding
} from "react-icons/fa";
import {
  MdPhone as Phone,
  MdArrowBack as ArrowBack,
  MdLocationOn as LocationOn,
  MdFavorite as Favorite,
  MdFavoriteBorder as FavoriteBorder,
  MdShare as Share,
  MdReport as Report
} from "react-icons/md";
import {
  BuildingOfficeIcon,
  ClockIcon,
  HomeIcon,
  MapPinIcon,
  WifiIcon,
  ShieldCheckIcon,
  TvIcon,
  KitchenIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import jsPDF from "jspdf";
import emailjs from "emailjs-com";
import { useBookedSlots } from "../hooks/useBookedSlots";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

Swiper.use([Navigation]);

export default function OfficeListing() {
  const [listing, setListing] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [location, setLocation] = useState({ lat: -26.2041, lng: 28.0473 });
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [rating] = useState(4.8);
  const [averageRating] = useState(4.5);

  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const { bookedDates, isDateBooked, isDateRangeBooked } = useBookedSlots(listing?._id || params.listingId);

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

        // Fetch coordinates
        if (data.address) {
          const address = encodeURIComponent(data.address);
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=YOUR_GOOGLE_MAPS_API_KEY`
          );
          const geocodeData = await response.json();
          if (geocodeData.results?.length > 0) {
            const { lat, lng } = geocodeData.results[0].geometry.location;
            setLocation({ lat, lng });
          }
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const toggleWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          listingId: listing?._id,
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
    e.preventDefault();
    if (userReview.trim()) {
      setReviews((prev) => [
        ...prev,
        { id: Date.now(), content: userReview, user: currentUser?.name || "Guest", date: new Date().toLocaleDateString() },
      ]);
      setUserReview('');
    }
  };

  const handleDeleteReview = (id) => {
    setReviews((prev) => prev.filter((review) => review.id !== id));
  };

  const handleReport = () => {
    alert(`Report Submitted!\nLink: ${window.location.href}\nEmail: ${listing?.email}\nListing Ref: ${listing?.userRef}`);
    setReporting(false);
  };

  const sendBookingInformation = () => {
    if (!name || !contact || !startDate || !endDate) {
      alert("Please fill in all required fields and select dates.");
      return;
    }

    const checkIn = new Date(startDate);
    const checkOut = new Date(endDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    const hasOverlap = bookedDates.some(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return checkIn < end && checkOut > start;
    });

    if (hasOverlap) {
      alert("The selected dates are already booked or occupied. Please select available dates.");
      return;
    }

    const emailContent = `
      Booking Request:
      Property Name: ${listing?.name}
      Price: R${listing?.offer ? listing.discountPrice : listing.regularPrice}
      Reference Number: ${listing?.refNumber}
      Dates: From ${startDate.toLocaleDateString()} To ${endDate.toLocaleDateString()}
      Contact: ${name} (${contact})
    `;

    const templateParams = {
      to_email: listing?.userEmail,
      subject: "Resort Booking Request",
      message: emailContent,
    };

    emailjs.send('service_id', 'template_id', templateParams)
      .then(() => {
        alert("Booking request sent successfully!");
        setShowCalendar(false);
      })
      .catch(() => alert("Failed to send booking request. Please try again."));
  };

  const generateVoucher = () => {
    if (!name || !contact) {
      alert("Please enter your name and contact information.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resort Booking Voucher", 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 20, 40);
    doc.text(`Contact: ${contact}`, 20, 50);
    doc.text(`Resort: ${listing?.name}`, 20, 60);
    doc.text(`Address: ${listing?.address}`, 20, 70);
    doc.text(`Booking Dates: ${startDate?.toLocaleDateString()} to ${endDate?.toLocaleDateString()}`, 20, 80);
    doc.text(`Price: R${listing?.offer ? listing.discountPrice : listing.regularPrice} per hour`, 20, 90);
    doc.text("Thank you for your booking!", 20, 110);
    doc.save("ResortBookingVoucher.pdf");
  };

  const contactOwner = () => {
    if (!name || !contact || !emailMessage) {
      alert("Please fill out all fields before contacting.");
      return;
    }

    const mailtoLink = `mailto:${listing?.userEmail}?subject=Inquiry about ${listing?.name}&body=Hi,\n\nMy name is ${name}.\nContact: ${contact}.\n\n${emailMessage}\n\nThank you.`;
    window.location.href = mailtoLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <FaBuilding className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Resort Not Found</h2>
          <p className="text-gray-600 dark:text-white mb-6">The resort you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[#FF385C] text-white font-medium rounded-lg hover:bg-[#E31C5F] transition-colors"
          >
            <ArrowBack className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowBack className="mr-2" /> Back
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <Share />
              {copied && <span className="absolute -top-2 -right-2 text-xs bg-[#FF385C] text-white px-2 py-1 rounded-full">Copied!</span>}
            </button>
            <button
              onClick={toggleWishlist}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              {isWishlisted ? <Favorite className="text-[#FF385C]" /> : <FavoriteBorder />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <Swiper navigation className="rounded-2xl overflow-hidden">
            {listing.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <div className="aspect-[16/9] bg-gray-200">
                  <img
                    src={url}
                    alt={`Office view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Main Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Title and Price */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{listing.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-white mb-4">
                    <span className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" /> {listing.address}
                    </span>
                    <span className="flex items-center">
                      <BuildingOfficeIcon className="w-4 h-4 mr-1" /> {listing.kind}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R{listing.offer ? listing.discountPrice : listing.regularPrice}
                    <span className="text-base font-normal text-gray-600 dark:text-white"> / hour</span>
                  </p>
                  {listing.offer && (
                    <p className="text-sm text-green-600">
                      Save R{listing.regularPrice - listing.discountPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Type Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                <ClockIcon className="w-4 h-4 mr-1" />
                Per Hour Booking
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About this resort</h2>
              <p className="text-gray-700 dark:text-white leading-relaxed">{listing.description}</p>
            </div>

            {/* Features Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What this resort offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FaBed className="text-gray-700 dark:text-white" />
                  <span>{listing.bedrooms} {listing.bedrooms > 1 ? "Units" : "Unit"}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FaBath className="text-gray-700 dark:text-white" />
                  <span>{listing.bathrooms} {listing.bathrooms > 1 ? "bathrooms" : "bathroom"}</span>
                </div>
                {listing.parking && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FaParking className="text-gray-700 dark:text-white" />
                    <span>Parking</span>
                  </div>
                )}
                {listing.wifi && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <WifiIcon className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>WiFi</span>
                  </div>
                )}
                {listing.security && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>Security</span>
                  </div>
                )}
                {listing.kitchen && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <KitchenIcon className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>Kitchen</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rules */}
            {listing.rules && (
              <div className="mb-8 p-6 bg-amber-50 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Resort rules</h2>
                <p className="text-gray-700 dark:text-white">{listing.rules}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews</h2>
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 dark:text-white">({reviews.length})</span>
                </div>
              </div>

              {/* Review Form */}
              {currentUser && (
                <div className="mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your experience with this resort..."
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    rows="3"
                  />
                  <button
                    onClick={handleReviewSubmit}
                    className="mt-3 px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{review.user}</span>
                        <span className="text-sm text-gray-500 dark:text-white ml-2">{review.date}</span>
                      </div>
                      {review.user === currentUser?.name && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-sm text-rose-600 hover:text-rose-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-white">{review.content}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-white py-8">No reviews yet. Be the first to write one!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <div className="sticky top-24 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Book this resort</h3>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Select dates
                    </label>
                    <button
                      onClick={() => setShowCalendar(true)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400"
                    >
                      <span className="text-gray-700 dark:text-white">
                        {startDate && endDate 
                          ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                          : "Choose dates"
                        }
                      </span>
                      <FaCalendar className="text-gray-400" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Your details
                    </label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg mb-3 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Contact number"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={sendBookingInformation}
                    disabled={!startDate || !endDate || !name || !contact}
                    className="w-full py-3 bg-[#FF385C] text-white font-medium rounded-lg hover:bg-[#E31C5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request to Book
                  </button>

                  <button
                    onClick={generateVoucher}
                    disabled={!startDate || !endDate || !name || !contact}
                    className="w-full py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download Voucher
                  </button>
                </div>
              </div>

              {/* Host Info */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    alt="Host"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Hosted by {listing.host}</h4>
                    <p className="text-sm text-gray-600 dark:text-white">Resort provider</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700 dark:text-white">
                    <Phone className="text-gray-500 dark:text-white mr-2" />
                    <span>+27 {listing.contact}</span>
                  </div>
                  <button
                    onClick={contactOwner}
                    className="w-full py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Contact Host
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
          <div className="bg-gray-200 rounded-xl overflow-hidden aspect-[16/6]">
            {/* Google Map would go here */}
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-white">{listing.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="flex items-center justify-center space-x-4 py-6">
          <a
            href={`https://wa.me/27${listing.contact}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaWhatsapp className="mr-2" /> WhatsApp
          </a>
          <a
            href={`tel:+27${listing.contact}`}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaPhone className="mr-2" /> Call
          </a>
          <a
            href={`mailto:${listing.userEmail}`}
            className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <FaEnvelope className="mr-2" /> Email
          </a>
        </div>

        {/* Report Button */}
        <div className="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setReporting(true)}
            className="flex items-center text-gray-500 dark:text-white hover:text-rose-600 transition-colors"
          >
            <Report className="mr-2" /> Report this listing
          </button>
        </div>
      </main>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Dates</h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <Calendar
                onChange={([start, end]) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                value={[startDate, endDate]}
                selectRange
                minDate={new Date()}
                tileDisabled={({ date, view }) => {
                  if (view === 'month') {
                    return bookedDates.some(range => {
                      const start = new Date(range.start);
                      const end = new Date(range.end);
                      const current = new Date(date);
                      current.setHours(0, 0, 0, 0);
                      start.setHours(0, 0, 0, 0);
                      end.setHours(0, 0, 0, 0);
                      return current >= start && current <= end;
                    });
                  }
                  return false;
                }}
                className="border-0"
              />

              {startDate && endDate && bookedDates.some(range => {
                const checkIn = new Date(startDate);
                const checkOut = new Date(endDate);
                const start = new Date(range.start);
                const end = new Date(range.end);
                checkIn.setHours(0, 0, 0, 0);
                checkOut.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                return checkIn < end && checkOut > start;
              }) && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️ Selected dates include already booked / occupied days.</span>
                </div>
              )}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="flex-1 py-3 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F]"
                >
                  Confirm Dates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Report this listing</h3>
                <button
                  onClick={() => setReporting(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-white mb-6">
                Please tell us why you're reporting this listing. This information will help us keep our community safe.
              </p>
              <div className="space-y-4">
                <textarea
                  placeholder="Describe the issue..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  rows="4"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => setReporting(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    className="flex-1 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
