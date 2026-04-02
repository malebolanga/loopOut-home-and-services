// src/pages/AIHelpCenter.jsx
import { useState } from 'react';
import { FaBrain, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const questions = [
  "How can LoupeOut help me find a place to stay?",
  "What should I look for to verify if a listing is real?",
  "How do I know if a service provider is legitimate?",
  "What verification methods does LoupeOut use for listings?",
  "How can I check reviews of a property or service?",
  "What payment methods are secure on LoupeOut?",
  "How does LoupeOut protect against scams?",
  "Can I see previous guest experiences with a host?",
  "What information should I look for in a property description?",
  "How do I verify contact information of a host?",
  "What are red flags to watch for in listings?",
  "How can I confirm the location of a property?",
  "Does LoupeOut verify host identities?",
  "What should I check in property photos?",
  "How do I know if a price is too good to be true?",
  "Can I request additional verification from hosts?",
  "What social proof should I look for?",
  "How does LoupeOut handle fake listings?",
  "What are the signs of a legitimate service provider?",
  "How can I verify service provider credentials?",
  "What should I look for in service provider reviews?",
  "How do I check if a helper has background verification?",
  "What questions should I ask before booking a service?",
  "How can I confirm service provider availability?",
  "What payment protections does LoupeOut offer?",
  "How do I report suspicious activity?",
  "Can I see response rates of hosts/service providers?",
  "What information is required for hosts to list properties?",
  "How does LoupeOut verify property ownership?",
  "What should I do if something doesn't feel right about a listing?",
  "Is my personal data safe with LoupeOut?",
  "How do I communicate with a host or service provider securely?",
  "What is LoupeOut's cancellation policy for bookings?",
  "Can I modify a booking after it's confirmed?",
  "What if the property or service isn't as described?",
  "How does LoupeOut handle disputes?",
  "Are there any booking fees?",
  "How do I leave a review after my stay or service?",
  "What are the terms of service for hosts?",
  "What are the terms of service for guests/clients?",
  "How do I contact LoupeOut customer support?",
  "Is LoupeOut available in other countries?",
  "Can I book long-term stays or recurring services?",
  "What is the process for receiving payments as a host?",
  "How does LoupeOut handle taxes for hosts?",
  "Can I set my own rules for my property or service?",
  "What kind of support can I expect during my stay?",
  "How do I update my profile information?",
  "What if I lose access to my account?",
  "Does LoupeOut offer insurance for bookings?",
  "How do I search for specific amenities or services?"
];

export default function AIHelpCenter() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionClick = async (question) => {
    setActiveQuestion(question);
    setIsLoading(true);

    try {
      // In a real implementation, you'd call your backend API
      // For this example, we're using a simulated response based on the question index.
      // const response = await fetch('/api/ai/answer', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ question })
      // });
      // const data = await response.json();

      // Simulated responses (ensure this array has 50 responses corresponding to the 50 questions)
      const responses = [
        "LoupeOut helps you find verified accommodations by connecting you with trusted hosts. Use our search filters to find places that match your needs, and always check host reviews and verification badges.",
        "Look for verified badges, multiple high-quality photos, detailed descriptions, and consistent reviews. Avoid listings with vague information, limited photos, or prices significantly below market rates.",
        "Check their verification status, read reviews from previous clients, look for completed background checks, and confirm their response rate. Legitimate providers will have detailed profiles with clear service descriptions.",
        "LoupeOut uses document verification, AI-powered image analysis, cross-referencing with public databases, and manual review for high-risk listings to ensure authenticity.",
        "Navigate to the listing/service page and scroll to the reviews section. Look for detailed reviews with photos from previous guests/clients.",
        "LoupeOut supports secure payment methods including credit cards, PayPal, and bank transfers. All payments are processed through our secure platform with fraud protection.",
        "We use AI monitoring for suspicious patterns, manual review of high-risk listings, user reporting systems, and secure payment processing with dispute resolution.",
        "Yes, each listing has a reviews section where previous guests share their experiences. Look for detailed reviews with photos for the most authentic insights.",
        "Look for clear information about amenities, house rules, cancellation policies, exact location details, and clear photos of all spaces. Vague descriptions are a red flag.",
        "LoupeOut verifies host contact information during registration. You can also message hosts through our secure messaging system without sharing personal contact details.",
        "Beware of listings with only stock photos, prices significantly below market rates, requests for payment outside the platform, vague location information, and hosts who avoid video calls.",
        "Use our interactive map view, check street view images, and look for location-specific details in the description. Verified listings have precise location data.",
        "Yes, all hosts must verify their identity through government-issued ID and facial recognition before listing properties on LoupeOut.",
        "Look for photos of all rooms (not just highlights), consistent decor/style, current timestamps (check for seasonal items), and verify against street view images when possible.",
        "Compare prices with similar listings in the area. If a price is 30%+ lower than comparable options without a clear reason, it may be a scam.",
        "Yes, you can request a video tour, additional photos, or proof of ownership/credentials through our secure messaging system before booking.",
        "Look for verified badges, response rates above 90%, detailed reviews with photos, and social media links connected to the profile.",
        "Our AI system scans new listings for suspicious patterns, and our moderation team investigates reports within 24 hours. Fake listings are removed immediately.",
        "Legitimate providers have detailed service descriptions, verifiable credentials, response rates above 85%, and multiple positive reviews with specific details.",
        "Check for certifications in their profile, ask for license numbers you can verify, and look for third-party verification badges on their profile.",
        "Look for detailed reviews describing specific services provided, photos of completed work, and responses from the provider addressing any concerns.",
        "Background-verified helpers have a special badge on their profile. You can view verification dates and the type of check performed in their profile details.",
        "Ask about their experience with similar projects, request references, clarify materials/equipment they'll bring, and confirm insurance coverage.",
        "Check their calendar on their profile, note their typical response time, and confirm availability before making payment. Legitimate providers maintain updated calendars.",
        "We offer payment protection where funds are held until service completion, fraud monitoring, and dispute resolution support if services don't match the description.",
        "Use the 'Report' button on any listing or profile, or contact our safety team directly at safety@loupeout.com with details of your concern.",
        "Response rates are displayed on host/provider profiles. Look for rates above 90% for the most reliable partners.",
        "Hosts must provide proof of ownership/authorization, valid ID, property documentation, and agree to our verification process before listing.",
        "We verify through property deeds, utility bills, and cross-referencing with municipal databases. For rental properties, we require authorization letters from owners.",
        "Trust your instincts. If something feels off, don't proceed. Report your concerns to our safety team and consider alternative options.",
        "Your personal data is encrypted and protected by industry-standard security protocols. We adhere to strict privacy policies and never share your information without consent.",
        "Always use LoupeOut's built-in messaging system. This keeps your conversations secure and provides a record in case of any disputes.",
        "LoupeOut offers flexible cancellation policies set by hosts/providers. Review the specific cancellation terms on each listing before booking.",
        "Modifying a booking depends on the host's/provider's policy and availability. Contact them directly through the platform, and if needed, reach out to customer support.",
        "If a property or service isn't as described, document the discrepancies immediately with photos/videos and contact the host/provider. Then, report it to LoupeOut support for resolution.",
        "LoupeOut has a dedicated dispute resolution team. We mediate between parties, review evidence, and work towards a fair outcome based on our terms of service.",
        "LoupeOut charges a small service fee to cover operational costs and ensure a secure platform. These fees are clearly displayed before you confirm your booking.",
        "After your stay or service is complete, you'll receive an invitation to leave a review. Your feedback helps other users and improves our community.",
        "Hosts agree to our comprehensive Terms of Service, which cover listing accuracy, guest safety, payment procedures, and dispute resolution. These are available in your host dashboard.",
        "Guests and clients agree to terms covering respectful conduct, payment obligations, cancellation rules, and the dispute process. These are available in our user policy section.",
        "You can contact LoupeOut customer support via our in-app chat, email at support@loupeout.com, or by calling our helpline during business hours.",
        "Currently, LoupeOut is focused on expanding within South Africa, specifically Polokwane. We plan to expand to other regions in the future.",
        "Yes, many hosts and providers offer options for long-term stays or recurring services. Use the booking duration filters in your search.",
        "As a host, payments are securely processed and transferred to your linked bank account after the booking is completed, typically within 1-3 business days.",
        "Hosts are responsible for understanding and fulfilling their tax obligations. LoupeOut provides transaction summaries to assist with your tax reporting.",
        "Absolutely. As a host, you can set your own house rules, pricing, availability, and detailed service descriptions within the guidelines of our platform policies.",
        "During your stay, you can directly message your host for any immediate needs. For platform-related issues, LoupeOut customer support is available to assist.",
        "You can update your profile information, including contact details, payment methods, and personal preferences, in the 'Account Settings' section of your profile.",
        "If you lose access to your account, use the 'Forgot Password' link on the login page. If you continue to have issues, contact our technical support team for assistance.",
        "LoupeOut facilitates secure transactions but does not directly provide insurance for bookings. We recommend guests and hosts consider personal travel or liability insurance.",
        "Use the search bar and filters on our homepage. You can input keywords for amenities (e.g., 'Wi-Fi', 'pool') or specific service types (e.g., 'plumbing', 'cleaning')."
      ];

      const randomDelay = Math.floor(Math.random() * 1000) + 500; // Simulate network latency
      setTimeout(() => {
        const questionIndex = questions.indexOf(question);
        if (questionIndex !== -1 && responses[questionIndex]) {
          setAiResponse(responses[questionIndex]);
        } else {
          setAiResponse("Sorry, I couldn't find an answer for that specific question.");
        }
        setIsLoading(false);
      }, randomDelay);
    } catch (error) {
      console.error("AI response fetch error:", error);
      setAiResponse("Sorry, I couldn't fetch an answer. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/" aria-label="Go back to Home" className="flex items-center text-rose-600 hover:text-rose-700 mr-4 transition-colors">
            <FaArrowLeft className="mr-2" aria-hidden="true" /> Back
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <FaBrain className="text-rose-600 mr-3" aria-label="AI Help Brain Icon" />
            LoupeOut Help Center
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Common Questions About Listings & Services
          </h2>
          <p className="text-gray-600 mb-6">
            Get answers to common questions about finding legitimate listings, verifying services,
            and ensuring your safety on LoupeOut.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Browse Questions Section */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Browse Questions</h3>
            {/* Added scrollbar for long list of questions, especially on smaller screens */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    activeQuestion === question
                      ? 'bg-rose-50 border border-rose-200 font-medium text-rose-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Section */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {activeQuestion ? activeQuestion : "Select a Question"}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center flex-col text-gray-700">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500 mb-3"></div>
                  <p>Thinking about your question...</p>
                </div>
              ) : aiResponse ? (
                <div className="flex items-start text-left w-full">
                  <div className="mr-3 flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                      <FaBrain className="text-white text-sm" aria-label="AI Response Icon" />
                    </div>
                  </div>
                  <div className="prose max-w-none"> {/* Ensures text flows nicely */}
                    <p className="text-gray-800 leading-relaxed">{aiResponse}</p>
                    <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-100 text-sm">
                      <p className="font-semibold text-rose-800 mb-1">Safety Tip:</p>
                      <p className="text-rose-700">
                        Always communicate through LoupeOut s messaging system and avoid sharing personal contact information until after booking. This protects your privacy and provides a record of your conversations.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <FaBrain className="text-4xl text-rose-500 mb-3" aria-label="AI Assistant Placeholder Icon" />
                  <p className="text-lg">Select a question to see AI-powered insights</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Your LoupeOut Verification Checklist</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Always check for **verified badges** on profiles and listings.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Read at least **5 recent reviews** for genuine insights.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Look for **response rates above 90%** for quick communication.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Verify location accurately through our **interactive map view**.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>**Compare prices** with similar listings in the area to spot anomalies.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Don t hesitate to **request additional photos or video tours** before booking.</span>
            </li>
             <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Ensure communication is always done **through LoupeOut s platform**.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Confirm **cancellation policies** before finalizing any booking.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>For services, check if the provider has **background verification badges**.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl font-bold">✓</span>
              <span>Always use **secure payment methods** offered on LoupeOut.</span>
            </li>
          </ul>
        </div>
      </div>
       {/* Custom Scrollbar Styling (can be placed in your global CSS file or a style block) */}
       <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e11d48; /* Corresponds to rose-600 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #be123c; /* A darker rose for hover */
        }
      `}</style>
    </div>
  );
}