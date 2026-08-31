// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const PropertyVideoShowcase = () => {
  const [activeProperty, setActiveProperty] = useState(0);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Sample property data with video URLs (using actual working video URLs)
  const properties = [
    {
      id: 1,
      title: "Oceanview Luxury Villa",
      price: "$1,500/night",
      location: "Malibu, California",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-house-on-a-hill-15836-large.mp4",
      description: "Stunning 5-bedroom villa with private beach access and infinity pool",
      amenities: ["Pool", "Beachfront", "5 bedrooms", "Smart Home"],
      aiTips: [
        "This property has 30% fewer bookings in winter - great time to negotiate!",
        "The sunset views from the master bedroom are spectacular",
        "Previous guests loved the smart home features"
      ]
    },
    {
      id: 2,
      title: "Modern Downtown Loft",
      price: "$350/night",
      location: "New York, NY",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-living-room-358-large.mp4",
      description: "Chic industrial-style loft in the heart of Manhattan",
      amenities: ["Great location", "2 bedrooms", "Workspace", "City views"],
      aiTips: [
        "The building has a 4.9/5 rating for cleanliness",
        "Walking distance to 3 subway lines",
        "Perfect for remote workers with dedicated workspace"
      ]
    },
    {
      id: 3,
      title: "Mountain Retreat Cabin",
      price: "$275/night",
      location: "Aspen, Colorado",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cabin-in-the-forest-2826-large.mp4",
      description: "Cozy log cabin with panoramic mountain views",
      amenities: ["Fireplace", "Hot tub", "Hiking trails", "Pet friendly"],
      aiTips: [
        "Most popular during winter months (Nov-Feb)",
        "Early booking discount available for stays longer than 5 nights",
        "Perfect for romantic getaways"
      ]
    }
  ];

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePropertySelect = (index) => {
    setActiveProperty(index);
    setIsPlaying(false); // Reset play state when changing videos
  };

  // Reset video play state when changing properties
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [activeProperty]);

  // Simulate AI response
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const userMsg = { text: userMessage, sender: 'user' };
    setChatMessages([...chatMessages, userMsg]);
    setUserMessage('');
    setLoadingResponse(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const propertyTips = properties[activeProperty].aiTips;
      const randomTip = propertyTips[Math.floor(Math.random() * propertyTips.length)];
      
      const aiResponses = [
        `For this property: ${randomTip}`,
        "I can see this property is 15% more affordable than similar listings in the area.",
        "Would you like me to compare this with other properties in your budget range?",
        "The average booking duration here is 4 nights according to my data."
      ];
      const aiMsg = { 
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai' 
      };
      setChatMessages(prev => [...prev, aiMsg]);
      setLoadingResponse(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Property Videos</h1>
        <p className="text-gray-600 dark:text-white mb-8">Experience properties through immersive video tours</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Video Player */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-auto max-h-[500px] object-cover"
                  src={properties[activeProperty].videoUrl}
                  loop
                  muted={isMuted}
                  onClick={togglePlayPause}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {!isPlaying && (
                    <button 
                      onClick={togglePlayPause}
                      className="bg-black bg-opacity-50 rounded-full p-4 text-white hover:bg-opacity-70 transition"
                    >
                      <FaPlay size={24} />
                    </button>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 flex space-x-3">
                  <button 
                    onClick={togglePlayPause}
                    className="bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition"
                  >
                    {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                  </button>
                  <button 
                    onClick={toggleMute}
                    className="bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition"
                  >
                    {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{properties[activeProperty].title}</h2>
                    <p className="text-gray-600 dark:text-white">{properties[activeProperty].location}</p>
                  </div>
                  <span className="text-xl font-semibold text-blue-600">{properties[activeProperty].price}</span>
                </div>
                <p className="mt-4 text-gray-700 dark:text-white">{properties[activeProperty].description}</p>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Amenities:</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {properties[activeProperty].amenities.map((amenity, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setAiAssistantOpen(true)}
                  className="mt-6 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <FaRobot /> Ask Property AI
                </button>
              </div>
            </div>
          </div>

          {/* Property Thumbnail List */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">More Properties</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-[800px] overflow-y-auto">
                {properties.map((property, index) => (
                  <div 
                    key={property.id} 
                    className={`p-4 cursor-pointer transition ${activeProperty === index ? 'bg-blue-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    onClick={() => handlePropertySelect(index)}
                  >
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <video
                            className="w-full h-full object-cover"
                            src={property.videoUrl}
                            muted
                            loop
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <FaPlay className="text-white text-xs" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{property.title}</p>
                        <p className="text-sm text-gray-500 dark:text-white truncate">{property.location}</p>
                        <p className="text-sm font-semibold text-blue-600">{property.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {aiAssistantOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FaRobot className="text-green-500 mr-2" /> Property AI Assistant
              </h3>
              <button 
                onClick={() => setAiAssistantOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <FaRobot className="mx-auto text-4xl text-green-500 mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">How can I help you with this property?</h4>
                  <p className="text-gray-500 dark:text-white mt-1">Ask about pricing, availability, or neighborhood info</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setUserMessage("What's special about this property?");
                        setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                      }}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-white text-sm px-3 py-2 rounded-lg transition"
                    >
                      What s special?
                    </button>
                    <button 
                      onClick={() => {
                        setUserMessage("Is this property good for families?");
                        setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                      }}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-white text-sm px-3 py-2 rounded-lg transition"
                    >
                      Good for families?
                    </button>
                    <button 
                      onClick={() => {
                        setUserMessage("What's the best time to book?");
                        setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                      }}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-white text-sm px-3 py-2 rounded-lg transition"
                    >
                      Best booking time?
                    </button>
                    <button 
                      onClick={() => {
                        setUserMessage("Are there any discounts available?");
                        setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                      }}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-white text-sm px-3 py-2 rounded-lg transition"
                    >
                      Any discounts?
                    </button>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {loadingResponse && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask about this property..."
                  className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button 
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyVideoShowcase;
