import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaCheckCircle, FaMapMarkerAlt, FaPhone, FaWhatsapp, 
  FaEnvelope, FaArrowLeft, FaCalendarAlt, FaClock, FaExclamationTriangle,
  FaShieldAlt, FaGraduationCap, FaBook, FaChalkboardTeacher,
  FaLanguage, FaCertificate, FaRegClock
} from 'react-icons/fa';
import { MdWork, MdSchedule, MdPeople } from 'react-icons/md';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Zoom, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import 'swiper/css/thumbs';

const PrivateTutorDetailsPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [activeThumb, setActiveThumb] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    subject: '',
    grade: '',
    message: ''
  });

  // Mock tutor data - replace with your actual API call
  const mockTutor = {
    _id: tutorId,
    name: 'Dr. James Wilson',
    title: 'Mathematics & Science Tutor',
    description: 'PhD in Mathematics with 10+ years of tutoring experience. Specializing in high school and university-level mathematics, physics, and chemistry. My teaching approach focuses on building strong foundational knowledge while developing problem-solving skills.\n\nI offer both in-person and online tutoring sessions. My students consistently show significant grade improvements and many have gone on to study STEM fields at top universities.',
    price: 350,
    rateType: 'hourly',
    rating: 4.9,
    reviewCount: 132,
    location: 'Cape Town, South Africa',
    contact: '0821234567',
    email: 'james.wilson@example.com',
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b',
      'https://images.unsplash.com/photo-1588072432836-e10032774350',
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1'
    ],
    features: {
      backgroundCheck: true,
      certified: true,
      qualifications: 'PhD in Mathematics, BSc in Physics',
      languages: ['English', 'Afrikaans'],
      experience: 10,
      availability: 'Weekdays 3pm-8pm, Weekends 9am-4pm',
      teachingMethods: ['One-on-one', 'Group sessions', 'Online'],
      minSession: 1.5
    },
    subjects: [
      { name: 'Mathematics', levels: ['Grade 8-12', 'University'] },
      { name: 'Physics', levels: ['Grade 10-12', 'University'] },
      { name: 'Chemistry', levels: ['Grade 10-12'] },
      { name: 'Calculus', levels: ['University'] },
      { name: 'Statistics', levels: ['University'] }
    ],
    provider: {
      name: 'James Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      age: 42,
      bio: 'Passionate educator with a track record of helping students achieve academic excellence. I believe every student can excel in STEM with the right guidance.'
    },
    process: [
      {
        title: 'Assessment Session',
        description: 'We evaluate the student\'s current level and identify areas for improvement'
      },
      {
        title: 'Custom Learning Plan',
        description: 'I develop a personalized tutoring plan based on the assessment'
      },
      {
        title: 'Regular Sessions',
        description: 'Weekly tutoring sessions with progress tracking'
      },
      {
        title: 'Exam Preparation',
        description: 'Focused preparation for tests and final exams'
      }
    ],
    education: [
      {
        institution: 'University of Cape Town',
        degree: 'PhD in Mathematics',
        year: '2015'
      },
      {
        institution: 'Stellenbosch University',
        degree: 'BSc in Physics',
        year: '2008'
      }
    ]
  };

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Using mock data for this example
        setTutor(mockTutor);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch tutor details');
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [tutorId]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    alert(`Booking request sent for ${tutor.name} on ${bookingData.date} at ${bookingData.time} for ${bookingData.subject}`);
    // Here you would typically send the booking data to your API
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading tutor</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/tutors')}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft /> Back to Tutors
        </button>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800">Tutor not found</h2>
          <p className="mt-2 text-gray-600">The tutor you re looking for doesn t exist or may have been removed.</p>
          <button
            onClick={() => navigate('/tutors')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Tutors
          </button>
        </div>
      </div>
    );
  }

  const TUTOR_FEATURES = [
    { icon: FaShieldAlt, label: "Background Check", key: "backgroundCheck" },
    { icon: FaCertificate, label: "Certified Tutor", key: "certified" },
    { icon: FaGraduationCap, label: tutor.features.qualifications, key: "qualifications" },
    { icon: FaLanguage, label: `Languages: ${tutor.features.languages.join(', ')}`, key: "languages" },
    { icon: MdWork, label: `${tutor.features.experience} years experience`, key: "experience" },
    { icon: FaRegClock, label: `Availability: ${tutor.features.availability}`, key: "availability" },
    { icon: FaChalkboardTeacher, label: `Teaching Methods: ${tutor.features.teachingMethods.join(', ')}`, key: "teachingMethods" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
        <a
          href={`tel:${tutor.contact}`}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        >
          <FaPhone className="text-xl" />
        </a>
        <a
          href={`https://wa.me/27${tutor.contact.substring(1)}?text=Hi, I'm interested in your tutoring services`}
          target="_blank"
          rel="noreferrer"
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        >
          <FaWhatsapp className="text-xl" />
        </a>
      </div>

      {/* Tutor Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Image Gallery */}
        <div className="md:w-2/3">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
              <FaGraduationCap className="text-sm" />
              Private Tutor
            </span>
            {tutor.verified && (
              <span className="text-blue-500 text-sm flex items-center">
                <FaCheckCircle className="inline mr-1" /> Verified
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {tutor.name}
          </h1>
          <h2 className="text-xl text-gray-600 mb-2">{tutor.title}</h2>
          
          <div className="flex items-center gap-4 text-gray-600 mb-6">
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              <span>{tutor.rating} ({tutor.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-1" />
              <span>{tutor.location}</span>
            </div>
          </div>
          
          {/* Image Gallery */}
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
            <Swiper
              modules={[Navigation, Thumbs, Zoom]}
              navigation
              thumbs={{ swiper: activeThumb }}
              zoom
              className="h-full"
            >
              {tutor.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <div 
                    className="relative h-full bg-cover bg-center cursor-zoom-in"
                    style={{ backgroundImage: `url(${img})` }}
                  >
                    <div className="swiper-zoom-container" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        
        {/* Booking Card */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden sticky top-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book This Tutor</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">R{tutor.price}</span>
                <span className="text-gray-600">per {tutor.rateType}</span>
                {tutor.features.minSession && (
                  <span className="text-gray-600">{tutor.features.minSession} hour minimum</span>
                )}
              </div>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={bookingData.subject}
                  onChange={handleBookingChange}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Select a subject</option>
                  {tutor.subjects.map((subject, index) => (
                    <option key={index} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>

              {bookingData.subject && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Level</label>
                  <select
                    name="grade"
                    value={bookingData.grade}
                    onChange={handleBookingChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  >
                    <option value="">Select level</option>
                    {tutor.subjects
                      .find(s => s.name === bookingData.subject)
                      ?.levels.map((level, index) => (
                        <option key={index} value={level}>{level}</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleBookingChange}
                    className="w-full p-3 border rounded-lg pl-10"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="relative">
                  <input
                    type="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleBookingChange}
                    className="w-full p-3 border rounded-lg pl-10"
                    required
                  />
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Goals</label>
                <textarea
                  name="message"
                  value={bookingData.message}
                  onChange={handleBookingChange}
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                  placeholder="What would you like to focus on?"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Book Session
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tutor Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">About {tutor.name}</h2>
            <div className="prose max-w-none text-gray-600">
              <p className="whitespace-pre-line">{tutor.description}</p>
            </div>
          </section>

          {/* Subjects Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Subjects Offered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutor.subjects.map((subject, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-lg flex items-center gap-2 mb-2">
                    <FaBook className="text-blue-600" />
                    {subject.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {subject.levels.map((level, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          {tutor.education && (
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Education & Qualifications</h2>
              <div className="space-y-4">
                {tutor.education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <FaGraduationCap />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution} ({edu.year})</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Features Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Tutor Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TUTOR_FEATURES.map(({ icon: Icon, label, key }) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Icon className="text-blue-600 text-lg" />
                  <span className="text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Process Section */}
          {tutor.process && (
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Teaching Approach</h2>
              <div className="space-y-4">
                {tutor.process.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">
              <FaStar className="inline mr-2 text-yellow-400" />
              {tutor.rating} · {tutor.reviewCount} reviews
            </h2>
            
            {/* Rating Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <MdWork className="text-blue-600" />
                  <span className="text-gray-700">Knowledge</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-1">5.0</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <MdSchedule className="text-blue-600" />
                  <span className="text-gray-700">Punctuality</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-1">4.9</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <MdPeople className="text-blue-600" />
                  <span className="text-gray-700">Teaching Ability</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-1">4.8</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`${i < 5 ? 'text-yellow-400' : 'text-gray-300'} text-sm`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Dr. Wilson helped my daughter improve her math grade from 60% to 85% in just 3 months. His explanations are clear and he s incredibly patient.</p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <h4 className="font-medium">Michael Brown</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`${i < 4 ? 'text-yellow-400' : 'text-gray-300'} text-sm`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Best calculus tutor I ve ever had. He breaks down complex concepts into understandable parts. My university grades improved significantly.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Tutor Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">About {tutor.provider.name}</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src={tutor.provider.avatar} 
                  alt={tutor.provider.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{tutor.provider.name}</h3>
                <p className="text-gray-600 text-sm">{tutor.provider.age} years old</p>
                <p className="text-gray-600 text-sm">{tutor.features.experience} years experience</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">{tutor.provider.bio}</p>
            
            <div className="space-y-3">
              <a 
                href={`tel:${tutor.contact}`}
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaPhone />
                <span>Call {tutor.name.split(' ')[0]}</span>
              </a>
              
              <a 
                href={`mailto:${tutor.email}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-100 text-blue-800 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FaEnvelope />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateTutorDetailsPage;