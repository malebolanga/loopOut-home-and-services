// src/pages/Message.jsx (Your existing file, modify this)
import { useState, useEffect } from 'react';
import {
  FiSend,
  FiX,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiAlertTriangle,
  FiUser,
  FiHome,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { Link, useParams, useLocation } from "react-router-dom"; // Import useLocation
import emailjs from 'emailjs-com';
import { useSelector } from 'react-redux';
import "../styles/ListingDetails.scss";

export default function Message() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const { currentUser } = useSelector((state) => state.user);
  const { listingId } = useParams();
  const location = useLocation(); // Initialize useLocation hook

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // New useEffect to handle reportType from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const typeFromUrl = queryParams.get('reportType');
    if (typeFromUrl === 'user' || typeFromUrl === 'listing') {
      setReportType(typeFromUrl);
      setShowReportModal(true);
      // Optional: Clear the query param after handling, so it doesn't reopen on refresh
      // This would require history.replaceState, which can be done with `useNavigate`
      // For simplicity, we'll leave it for now.
    }
  }, [location.search]); // Re-run when the URL search parameters change

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    try {
      await emailjs.send(
        "YOUR_EMAILJS_SERVICE_ID",
        "YOUR_EMAILJS_REPORT_TEMPLATE_ID",
        {
          reportType: reportType,
          listingId: listingId || 'N/A',
          listingName: 'N/A', // You might need to fetch this if listingId is present
          reportedUser: currentUser?.name || 'Anonymous',
          reporterEmail: currentUser?.email || 'Not provided',
          reason: reportReason,
          details: reportDetails,
          to_email: "report@loupeouthome.com"
        },
        "YOUR_EMAILJS_PUBLIC_KEY"
      );
      setReportReason('');
      setReportDetails('');
      setShowReportModal(false);
      showNotification('Report submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting report:', error);
      showNotification('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const generateAiResponse = async (userMessage) => {
    setIsAiResponding(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = "";
    if (userMessage.toLowerCase().includes('listing')) {
      if (userMessage.toLowerCase().includes('report')) {
        response = "To report a listing, click on the 'Report' button on the listing page or use the 'Report a Listing' option in this help center. Would you like to report a listing now?";
      } else {
        response = "To create a listing, go to your dashboard and click 'Create Listing'. You'll need to provide property details, photos, pricing, and availability.";
      }
    } else if (userMessage.toLowerCase().includes('cancel')) {
      response = "We offer flexible, moderate, and strict cancellation policies. Flexible allows free cancellation 24h before check-in, moderate 5 days before, and strict no refunds after booking.";
    } else if (userMessage.toLowerCase().includes('payment')) {
      response = "Update payment methods in Account Settings > Payment. You can add multiple credit cards or connect PayPal.";
    } else if (userMessage.toLowerCase().includes('report') && userMessage.toLowerCase().includes('user')) {
      response = "To report a user, visit their profile and click 'Report User' or use the 'Report a User' option in this help center. Would you like to report a user now?";
    } else {
      response = "Thank you for your message. I've forwarded your question to our support team who will respond within 24 hours. In the meantime, would you like me to help with anything else?";
    }

    setChatHistory(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
    ]);
    setIsAiResponding(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      await generateAiResponse(message);
      setIsSubmitted(true);
      setMessage('');
    }
  };

  useEffect(() => {
    if (message.length > 3 && !isSubmitted) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        const suggestions = [
          "How do I cancel a booking?",
          "What's your refund policy?",
          "How to contact host?",
          "How do I report a user?",
          "How do I report a listing?"
        ].filter(q =>
          q.toLowerCase().includes(message.toLowerCase().substring(0, 5))
        );
        setAiSuggestions(suggestions);
        setIsTyping(false);
        setShowAiSuggestions(true); // Ensure suggestions are shown when available
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAiSuggestions([]);
      setShowAiSuggestions(false); // Hide suggestions if message is too short or cleared
    }
  }, [message, isSubmitted]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white my-7">Help & Support</h1>
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-5xl text-blue-500" />
        </div>
        <p className="text-lg text-gray-600 dark:text-white">Loading support options...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 sm:p-8">
        {/* Custom Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center transition-all duration-300 ease-in-out transform ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          } ${notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            {notification.type === 'success' ? (
              <FiCheckCircle className="mr-2 text-green-600" size={20} />
            ) : (
              <FiAlertCircle className="mr-2 text-red-600" size={20} />
            )}
            <span className="flex-1 text-sm">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-4 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl transform scale-95 animate-scaleUp">
              <div className="flex justify-between items-center mb-5 border-b pb-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  <FiAlertTriangle className="inline mr-2 text-red-500" size={24} />
                  Report {reportType === 'user' ? 'User' : 'Listing'}
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-500 dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reportReason" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Reason for Report
                  </label>
                  <select
                    id="reportReason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 dark:text-white appearance-none"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="fraud">Fraud or Scam</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="fake">Fake Profile/Listing</option>
                    <option value="safety">Safety Concern</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reportDetails" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Please provide details
                  </label>
                  <textarea
                    id="reportDetails"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 dark:text-white resize-y"
                    placeholder={`Describe why you're reporting this ${reportType}...`}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSubmittingReport}
                  >
                    {isSubmittingReport ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Help & Support</h1>
          <Link to="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiX className="w-6 h-6 text-gray-500 dark:text-white" />
          </Link>
        </div>

        {/* Report Buttons - NOW LINK TO THE NEW REPORT PAGE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/report?reportType=user" // Link to the new ReportPage
            className="flex items-center justify-center gap-2 p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md"
          >
            <FiUser size={20} />
            Report a User
          </Link>
          <Link
            to="/report?reportType=listing" // Link to the new ReportPage
            className="flex items-center justify-center gap-2 p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md"
          >
            <FiHome size={20} />
            Report a Listing
          </Link>
        </div>

        {/* AI Assistant Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-inner">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <FiHelpCircle className="mr-2 text-blue-500" size={24} />
            How can we help you?
          </h2>
          <p className="text-gray-600 dark:text-white mb-5 leading-relaxed">
            Our **AI assistant** can answer common questions instantly, or connect you with our support team if needed.
          </p>

          {/* AI Chat History */}
          {chatHistory.length > 0 && (
            <div className="mb-6 space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl shadow-sm ${msg.role === 'user'
                    ? 'bg-blue-50 text-blue-900 ml-auto max-w-[85%]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white mr-auto max-w-[85%]'}`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {msg.content}
                </div>
              ))}
              {isAiResponding && (
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl mr-auto max-w-[85%]">
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isSubmitted && chatHistory.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-center shadow-md">
              <p className="font-medium text-lg">Thank you for your message!</p>
              <p className="text-sm">Our team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Your Message
                  {isTyping && (
                    <span className="ml-2 text-xs text-blue-500 animate-pulse">AI is thinking...</span>
                  )}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 dark:text-white resize-y"
                  placeholder="Describe your issue or question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setShowAiSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAiSuggestions(false), 200)} // Delay to allow click on suggestions
                  required
                />

                {/* AI Suggestions */}
                {showAiSuggestions && aiSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    <div className="p-3 text-sm font-semibold text-gray-600 dark:text-white border-b border-gray-100 dark:border-gray-800">AI Suggestions</div>
                    <ul>
                      {aiSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-base text-gray-800 dark:text-white transition-colors"
                          onMouseDown={(e) => { // Use onMouseDown to prevent blur from closing before click
                            e.preventDefault();
                            setMessage(suggestion);
                            setShowAiSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isAiResponding || !message.trim()}
              >
                <FiSend className="mr-2" size={20} />
                {isAiResponding ? 'AI Responding...' : (chatHistory.length > 0 ? 'Send Follow-up' : 'Send Message')}
              </button>
            </form>
          )}
        </div>

        {/* FAQs Section */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center">
            <FiHelpCircle className="mr-2 text-blue-500" size={22} />
            Frequently Asked Questions
          </h3>
          <ul className="space-y-3 text-base text-gray-700 dark:text-white">
            {/* Using buttons for clickable FAQs */}
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <div>
                <button
                  className="text-left font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setMessage("How do I create a listing?")}
                >
                  How do I create a listing?
                </button>
                <p className="text-sm text-gray-500 dark:text-white mt-0.5">Click to auto-fill your question for the AI assistant.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <div>
                <button
                  className="text-left font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setMessage("What are the cancellation policies?")}
                >
                  What are the cancellation policies?
                </button>
                <p className="text-sm text-gray-500 dark:text-white mt-0.5">Click to auto-fill your question for the AI assistant.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <div>
                <button
                  className="text-left font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setMessage("How do I report a user?")}
                >
                  How do I report a user?
                </button>
                <p className="text-sm text-gray-500 dark:text-white mt-0.5">Click to auto-fill your question for the AI assistant.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <div>
                <button
                  className="text-left font-medium hover:text-blue-600 transition-colors"
                  onClick={() => setMessage("How do I report a listing?")}
                >
                  How do I report a listing?
                </button>
                <p className="text-sm text-gray-500 dark:text-white mt-0.5">Click to auto-fill your question for the AI assistant.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Options Section */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center">
            <FiMessageSquare className="mr-2 text-blue-500" size={22} />
            Other Ways to Contact Us
          </h3>
          <ul className="space-y-3 text-base text-gray-700 dark:text-white">
            <li className="flex items-center">
              <FiMail className="mr-3 text-blue-500" size={20} />
              <span>Email: <a href="mailto:support@loupeOuthome.com" className="text-blue-600 hover:underline">support@loupeOuthome.com</a></span>
            </li>
            <li className="flex items-center">
              <FiPhone className="mr-3 text-blue-500" size={20} />
              <span>Phone: <a href="tel:+27838949697" className="text-blue-600 hover:underline">+27 (83) 894-9697</a></span>
            </li>
            <li className="flex items-center">
              <FiMessageSquare className="mr-3 text-blue-500" size={20} />
              <span>Live Chat: Available 9am-9pm EST</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
