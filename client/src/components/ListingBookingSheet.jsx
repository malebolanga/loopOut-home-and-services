import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  FaWhatsapp,
  FaShieldAlt,
  FaSpinner,
  FaCut,
  FaUtensils,
  FaCar,
  FaChalkboardTeacher,
  FaBroom,
  FaHammer,
  FaCamera,
  FaPaw,
  FaTruck,
  FaBoxOpen,
  FaStar,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { MdChildCare, MdDirectionsBus } from 'react-icons/md';
import { pushPhoneNotification } from './PhoneNotificationManager';


// ─── Service Config Map ───────────────────────────────────────────────────────
const SERVICE_CONFIGS = {
  // Helper types
  chef: {
    icon: FaUtensils,
    emoji: '👨‍🍳',
    label: 'Chef',
    color: 'from-orange-500 to-amber-500',
    accent: 'orange',
    sessionLabel: 'Cooking Session',
    clientLabel: 'Client',
    dateLabel: 'Service Date',
    unitLabel: 'Menu / Package',
    specialLabel: 'Dietary needs, occasions, guest count, special menu requests…',
    extras: ['numberOfGuests', 'location'],
    waMsgPrefix: '👨‍🍳 *CHEF BOOKING*',
  },
  barber: {
    icon: FaCut,
    emoji: '✂️',
    label: 'Barber',
    color: 'from-slate-700 to-slate-900',
    accent: 'slate',
    sessionLabel: 'Haircut Appointment',
    clientLabel: 'Client',
    dateLabel: 'Appointment Date',
    unitLabel: 'Service / Style',
    specialLabel: 'Style preference, cut type, beard trim details…',
    extras: ['serviceSelection'],
    waMsgPrefix: '✂️ *BARBER APPOINTMENT*',
  },
  beauty: {
    icon: FaStar,
    emoji: '💄',
    label: 'Beauty',
    color: 'from-pink-500 to-rose-500',
    accent: 'pink',
    sessionLabel: 'Beauty Appointment',
    clientLabel: 'Client',
    dateLabel: 'Appointment Date',
    unitLabel: 'Service / Treatment',
    specialLabel: 'Skin type, allergies, preferred look, special occasion…',
    extras: ['serviceSelection'],
    waMsgPrefix: '💄 *BEAUTY APPOINTMENT*',
  },
  tattoo: {
    icon: FaStar,
    emoji: '🖋️',
    label: 'Tattoo Artist',
    color: 'from-gray-800 to-black',
    accent: 'gray',
    sessionLabel: 'Tattoo Session',
    clientLabel: 'Client',
    dateLabel: 'Session Date',
    unitLabel: 'Design / Placement',
    specialLabel: 'Tattoo design description, size, placement, reference images…',
    extras: ['serviceSelection'],
    waMsgPrefix: '🖋️ *TATTOO SESSION BOOKING*',
  },
  photography: {
    icon: FaCamera,
    emoji: '📸',
    label: 'Photographer',
    color: 'from-violet-600 to-purple-700',
    accent: 'violet',
    sessionLabel: 'Photo Session',
    clientLabel: 'Client',
    dateLabel: 'Session Date',
    unitLabel: 'Photography Package',
    specialLabel: 'Type of shoot, location preferences, number of people, styling notes…',
    extras: ['serviceSelection', 'location'],
    waMsgPrefix: '📸 *PHOTOGRAPHY SESSION BOOKING*',
  },
  tutor: {
    icon: FaChalkboardTeacher,
    emoji: '📚',
    label: 'Private Tutor',
    color: 'from-blue-500 to-indigo-600',
    accent: 'blue',
    sessionLabel: 'Tutoring Session',
    clientLabel: 'Student / Parent',
    dateLabel: 'Session Date',
    unitLabel: 'Subject / Grade',
    specialLabel: 'Grade level, subject topics, exam prep, learning goals…',
    extras: ['serviceSelection', 'sessionFrequency'],
    waMsgPrefix: '📚 *TUTORING SESSION BOOKING*',
  },
  domestic: {
    icon: FaBroom,
    emoji: '🏠',
    label: 'Domestic Helper',
    color: 'from-teal-500 to-emerald-600',
    accent: 'teal',
    sessionLabel: 'Cleaning Session',
    clientLabel: 'Client',
    dateLabel: 'Service Date',
    unitLabel: 'Service Type',
    specialLabel: 'Rooms, specific cleaning needs, access instructions…',
    extras: ['serviceSelection', 'location'],
    waMsgPrefix: '🏠 *DOMESTIC HELPER BOOKING*',
  },
  handyman: {
    icon: FaHammer,
    emoji: '🔧',
    label: 'Handyman',
    color: 'from-yellow-500 to-orange-600',
    accent: 'yellow',
    sessionLabel: 'Repair / Job',
    clientLabel: 'Client',
    dateLabel: 'Job Date',
    unitLabel: 'Type of Work',
    specialLabel: 'Problem description, what needs fixing, materials needed…',
    extras: ['location'],
    waMsgPrefix: '🔧 *HANDYMAN JOB BOOKING*',
  },
  baker: {
    icon: FaUtensils,
    emoji: '🎂',
    label: 'Baker',
    color: 'from-amber-400 to-yellow-500',
    accent: 'amber',
    sessionLabel: 'Baking Order',
    clientLabel: 'Customer',
    dateLabel: 'Collection / Delivery Date',
    unitLabel: 'Product / Order',
    specialLabel: 'Flavour, size, dietary requirements, occasion, custom message…',
    extras: ['serviceSelection'],
    waMsgPrefix: '🎂 *BAKERY ORDER*',
  },
  sneaker: {
    icon: FaStar,
    emoji: '👟',
    label: 'Sneaker Cleaner',
    color: 'from-blue-400 to-cyan-500',
    accent: 'cyan',
    sessionLabel: 'Cleaning Order',
    clientLabel: 'Customer',
    dateLabel: 'Drop-off / Collection Date',
    unitLabel: 'Cleaning Package',
    specialLabel: 'Shoe brand, type of stain, number of pairs…',
    extras: ['serviceSelection'],
    waMsgPrefix: '👟 *SNEAKER CLEANING ORDER*',
  },
  washingmat: {
    icon: FaBroom,
    emoji: '🧺',
    label: 'Laundry / Washing',
    color: 'from-cyan-500 to-blue-500',
    accent: 'cyan',
    sessionLabel: 'Laundry Order',
    clientLabel: 'Customer',
    dateLabel: 'Collection / Drop-off Date',
    unitLabel: 'Service Package',
    specialLabel: 'Number of loads, fabric type, special care instructions…',
    extras: ['serviceSelection'],
    waMsgPrefix: '🧺 *LAUNDRY ORDER*',
  },
  animals: {
    icon: FaPaw,
    emoji: '🐾',
    label: 'Animal Care',
    color: 'from-green-500 to-emerald-500',
    accent: 'green',
    sessionLabel: 'Care Session',
    clientLabel: 'Pet Owner',
    dateLabel: 'Service Date',
    unitLabel: 'Service Type',
    specialLabel: 'Animal type, breed, any medical conditions, special instructions…',
    extras: ['serviceSelection'],
    waMsgPrefix: '🐾 *PET CARE BOOKING*',
  },
  errand: {
    icon: FaMapMarkerAlt,
    emoji: '🏃',
    label: 'Errand Runner',
    color: 'from-rose-500 to-pink-600',
    accent: 'rose',
    sessionLabel: 'Errand Task',
    clientLabel: 'Client',
    dateLabel: 'Task Date',
    unitLabel: 'Task Type',
    specialLabel: 'What needs to be done, location, any deadlines…',
    extras: ['location'],
    waMsgPrefix: '🏃 *ERRAND BOOKING*',
  },
  // Service model types
  cleaning: {
    icon: FaBroom,
    emoji: '🧹',
    label: 'Cleaning Service',
    color: 'from-teal-500 to-cyan-600',
    accent: 'teal',
    sessionLabel: 'Cleaning Session',
    clientLabel: 'Client',
    dateLabel: 'Service Date',
    unitLabel: 'Cleaning Package',
    specialLabel: 'Property type, number of rooms, specific cleaning tasks…',
    extras: ['serviceSelection', 'location'],
    waMsgPrefix: '🧹 *CLEANING SERVICE BOOKING*',
  },
  carwash: {
    icon: FaCar,
    emoji: '🚗',
    label: 'Car Wash',
    color: 'from-sky-500 to-blue-600',
    accent: 'sky',
    sessionLabel: 'Car Wash Appointment',
    clientLabel: 'Customer',
    dateLabel: 'Wash Date',
    unitLabel: 'Wash Package',
    specialLabel: 'Vehicle type, colour, special requests (interior, engine bay, ceramic…)',
    extras: ['vehicleDetails', 'serviceSelection'],
    waMsgPrefix: '🚗 *CAR WASH BOOKING*',
  },
  moving: {
    icon: FaTruck,
    emoji: '🚛',
    label: 'Moving Service',
    color: 'from-orange-500 to-red-500',
    accent: 'orange',
    sessionLabel: 'Moving Job',
    clientLabel: 'Client',
    dateLabel: 'Moving Date',
    unitLabel: 'Vehicle / Package',
    specialLabel: 'Number of rooms, fragile items, from/to locations, floors…',
    extras: ['location'],
    waMsgPrefix: '🚛 *MOVING SERVICE BOOKING*',
  },
  storage: {
    icon: FaBoxOpen,
    emoji: '📦',
    label: 'Storage',
    color: 'from-amber-500 to-yellow-600',
    accent: 'amber',
    sessionLabel: 'Storage Booking',
    clientLabel: 'Client',
    dateLabel: 'Start Date',
    unitLabel: 'Storage Unit Size',
    specialLabel: 'Items to store, estimated quantity, special requirements…',
    extras: ['serviceSelection'],
    waMsgPrefix: '📦 *STORAGE BOOKING*',
  },
  daycare: {
    icon: MdChildCare,
    emoji: '👶',
    label: 'Daycare',
    color: 'from-pink-400 to-rose-500',
    accent: 'pink',
    sessionLabel: 'Daycare Session',
    clientLabel: 'Parent / Guardian',
    dateLabel: 'Start Date',
    unitLabel: 'Age Group',
    specialLabel: "Child's age, allergies, medical info, emergency contact…",
    extras: ['serviceSelection'],
    waMsgPrefix: '👶 *DAYCARE BOOKING*',
  },
  schoolTransport: {
    icon: MdDirectionsBus,
    emoji: '🚌',
    label: 'School Transport',
    color: 'from-yellow-500 to-amber-600',
    accent: 'yellow',
    sessionLabel: 'Transport Route',
    clientLabel: 'Parent / Guardian',
    dateLabel: 'Start Date',
    unitLabel: 'Route / Area',
    specialLabel: "Child's school name, pick-up address, any special instructions…",
    extras: ['location'],
    waMsgPrefix: '🚌 *SCHOOL TRANSPORT BOOKING*',
  },
  maintenance: {
    icon: FaHammer,
    emoji: '🛠️',
    label: 'Maintenance',
    color: 'from-gray-600 to-slate-700',
    accent: 'gray',
    sessionLabel: 'Maintenance Job',
    clientLabel: 'Client',
    dateLabel: 'Job Date',
    unitLabel: 'Type of Work',
    specialLabel: 'Issue description, urgency, access info…',
    extras: ['location'],
    waMsgPrefix: '🛠️ *MAINTENANCE JOB BOOKING*',
  },
  landscaping: {
    icon: FaBroom,
    emoji: '🌿',
    label: 'Landscaping',
    color: 'from-green-600 to-emerald-700',
    accent: 'green',
    sessionLabel: 'Garden Job',
    clientLabel: 'Client',
    dateLabel: 'Job Date',
    unitLabel: 'Service Type',
    specialLabel: 'Garden size, tasks needed, frequency, access instructions…',
    extras: ['location'],
    waMsgPrefix: '🌿 *LANDSCAPING / GARDEN SERVICE BOOKING*',
  },
  catering: {
    icon: FaUtensils,
    emoji: '🍽️',
    label: 'Catering',
    color: 'from-red-500 to-orange-500',
    accent: 'red',
    sessionLabel: 'Catering Event',
    clientLabel: 'Client',
    dateLabel: 'Event Date',
    unitLabel: 'Menu Package',
    specialLabel: 'Number of guests, dietary requirements, event type, venue details…',
    extras: ['numberOfGuests', 'location'],
    waMsgPrefix: '🍽️ *CATERING BOOKING*',
  },
};

const DEFAULT_CONFIG = {
  icon: FaStar,
  emoji: '📅',
  label: 'Service',
  color: 'from-rose-500 to-amber-500',
  accent: 'rose',
  sessionLabel: 'Appointment',
  clientLabel: 'Client',
  dateLabel: 'Service Date',
  unitLabel: 'Package / Option',
  specialLabel: 'Any special requests or notes for the provider…',
  extras: [],
  waMsgPrefix: '📅 *SERVICE BOOKING*',
};

const ACCENT_CLASSES = {
  orange: { ring: 'focus:ring-orange-500', tag: 'bg-orange-500', pill: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300', border: 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20' },
  slate:  { ring: 'focus:ring-slate-500',  tag: 'bg-slate-700',  pill: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',      border: 'border-slate-600 bg-slate-50/60 dark:bg-slate-900/40' },
  pink:   { ring: 'focus:ring-pink-500',   tag: 'bg-pink-500',   pill: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',       border: 'border-pink-500 bg-pink-50/60 dark:bg-pink-950/20' },
  gray:   { ring: 'focus:ring-gray-500',   tag: 'bg-gray-700',   pill: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',         border: 'border-gray-600 bg-gray-50/60 dark:bg-gray-800/40' },
  violet: { ring: 'focus:ring-violet-500', tag: 'bg-violet-600', pill: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300', border: 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/20' },
  blue:   { ring: 'focus:ring-blue-500',   tag: 'bg-blue-600',   pill: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',       border: 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/20' },
  teal:   { ring: 'focus:ring-teal-500',   tag: 'bg-teal-600',   pill: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',       border: 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20' },
  yellow: { ring: 'focus:ring-yellow-500', tag: 'bg-yellow-500', pill: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300', border: 'border-yellow-500 bg-yellow-50/60 dark:bg-yellow-950/20' },
  amber:  { ring: 'focus:ring-amber-500',  tag: 'bg-amber-500',  pill: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',   border: 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20' },
  green:  { ring: 'focus:ring-green-500',  tag: 'bg-green-600',  pill: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',   border: 'border-green-500 bg-green-50/60 dark:bg-green-950/20' },
  rose:   { ring: 'focus:ring-rose-500',   tag: 'bg-rose-500',   pill: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',       border: 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/20' },
  sky:    { ring: 'focus:ring-sky-500',    tag: 'bg-sky-500',    pill: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',           border: 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/20' },
  cyan:   { ring: 'focus:ring-cyan-500',   tag: 'bg-cyan-500',   pill: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',       border: 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/20' },
  red:    { ring: 'focus:ring-red-500',    tag: 'bg-red-500',    pill: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',           border: 'border-red-500 bg-red-50/60 dark:bg-red-950/20' },
};

const DAILY_STAY_TYPES = ['over', 'hotel', 'land', 'resort', 'guesthouse', 'self_catering', 'holiday_park', 'sale'];
const HOURLY_ROOM_TYPES = ['office', 'hourly_room', 'room_hourly'];
const RENT_TYPES = ['rent', 'apartment'];

const TYPE_ALIASES = {
  chef: 'chef',
  culinary: 'chef',
  cook: 'chef',
  barber: 'barber',
  grooming: 'barber',
  haircut: 'barber',
  barbershop: 'barber',
  beauty: 'beauty',
  makeup: 'beauty',
  nail: 'beauty',
  nails: 'beauty',
  hair: 'beauty',
  hairdresser: 'beauty',
  salon: 'beauty',
  carwash: 'carwash',
  car_wash: 'carwash',
  'car-wash': 'carwash',
  'car wash': 'carwash',
  autowash: 'carwash',
  tutor: 'tutor',
  private_tutor: 'tutor',
  'private tutor': 'tutor',
  privatetutor: 'tutor',
  tutoring: 'tutor',
  teacher: 'tutor',
  photography: 'photography',
  photographer: 'photography',
  photo: 'photography',
  video: 'photography',
  videography: 'photography',
  tattoo: 'tattoo',
  tattoo_artist: 'tattoo',
  'tattoo artist': 'tattoo',
  tattooartist: 'tattoo',
  piercing: 'tattoo',
  domestic: 'domestic',
  maid: 'domestic',
  nanny: 'domestic',
  cleaning: 'cleaning',
  housekeeper: 'domestic',
  housekeeping: 'domestic',
  handyman: 'handyman',
  maintenance: 'maintenance',
  repair: 'handyman',
  plumber: 'handyman',
  electrician: 'handyman',
  gardening: 'landscaping',
  landscaping: 'landscaping',
  garden: 'landscaping',
  baker: 'baker',
  bakery: 'baker',
  cakes: 'baker',
  sneaker: 'sneaker',
  sneaker_cleaner: 'sneaker',
  'sneaker cleaner': 'sneaker',
  washingmat: 'washingmat',
  laundry: 'washingmat',
  laundromat: 'washingmat',
  animals: 'animals',
  pet: 'animals',
  pets: 'animals',
  dog: 'animals',
  'dog walker': 'animals',
  dog_walker: 'animals',
  errand: 'errand',
  errands: 'errand',
  runner: 'errand',
  moving: 'moving',
  movers: 'moving',
  storage: 'storage',
  daycare: 'daycare',
  childcare: 'daycare',
  schooltransport: 'schoolTransport',
  school_transport: 'schoolTransport',
  'school transport': 'schoolTransport',
  transport: 'schoolTransport',
  catering: 'catering',
  caterer: 'catering'
};

function getServiceConfig(listing) {
  if (!listing) return null;
  const candidates = [
    listing.type,
    listing.kind,
    listing.category,
    listing.helperType,
    listing.serviceType,
    listing.subType
  ];
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const clean = raw.toLowerCase().trim().replace(/[-_]/g, ' ');
    const rawKey = raw.toLowerCase().trim();
    if (SERVICE_CONFIGS[raw]) return SERVICE_CONFIGS[raw];
    if (SERVICE_CONFIGS[rawKey]) return SERVICE_CONFIGS[rawKey];
    if (TYPE_ALIASES[rawKey] && SERVICE_CONFIGS[TYPE_ALIASES[rawKey]]) {
      return SERVICE_CONFIGS[TYPE_ALIASES[rawKey]];
    }
    if (TYPE_ALIASES[clean] && SERVICE_CONFIGS[TYPE_ALIASES[clean]]) {
      return SERVICE_CONFIGS[TYPE_ALIASES[clean]];
    }
  }
  if (listing.isHelper || listing.isService || listing.category === 'services' || listing.category === 'helper') {
    return DEFAULT_CONFIG;
  }
  return null;
}

export default function ListingBookingSheet({
  isOpen,
  onClose,
  listing,
  bookedDates = [],
  initialDates = {}
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [step, setStep] = useState(1);

  const [bookingDetails, setBookingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    breakfast: false,
    pets: false,
    selectedDate: '',
    startTime: '09:00',
    endTime: '11:00',
    selectedUnit: '',
    numberOfGuests: 1,
    vehicleDetails: '',
    serviceLocation: '',
    sessionFrequency: 'once',
    specialRequests: '',
    viewingDate: '',
    viewingTime: '10:00',
    leaseDuration: '12 Months',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEscrowLoading, setIsEscrowLoading] = useState(false);

  const propertyType = listing?.type || '';
  const isDailyStay = DAILY_STAY_TYPES.includes(propertyType);
  const isHourlyRoom = HOURLY_ROOM_TYPES.includes(propertyType);
  const isRent = RENT_TYPES.includes(propertyType);
  const serviceConfig = getServiceConfig(listing);
  const isServiceMode = !!serviceConfig && !isDailyStay && !isHourlyRoom && !isRent;

  const config = isServiceMode ? serviceConfig : DEFAULT_CONFIG;
  const accentCls = ACCENT_CLASSES[config.accent] || ACCENT_CLASSES.rose;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setBookingDetails(prev => ({
        ...prev,
        fullName: currentUser?.name || currentUser?.username || prev.fullName,
        email: currentUser?.email || prev.email,
        phone: currentUser?.phone || prev.phone,
        checkIn: initialDates?.checkIn || prev.checkIn,
        checkOut: initialDates?.checkOut || prev.checkOut,
        selectedDate: initialDates?.selectedDate || prev.selectedDate,
        startTime: initialDates?.startTime || prev.startTime,
        endTime: initialDates?.endTime || prev.endTime,
        selectedUnit: initialDates?.selectedUnit || prev.selectedUnit || '',
      }));
    }
  }, [isOpen, initialDates, currentUser]);

  if (!isOpen || !listing) return null;

  const calculateDays = () => {
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) return 0;
    return Math.max(1, Math.ceil((new Date(bookingDetails.checkOut) - new Date(bookingDetails.checkIn)) / (1000 * 60 * 60 * 24)));
  };

  const calculateHours = () => {
    const [sH, sM] = bookingDetails.startTime.split(':').map(Number);
    const [eH, eM] = bookingDetails.endTime.split(':').map(Number);
    const diff = (eH * 60 + eM) - (sH * 60 + sM);
    return diff > 0 ? diff / 60 : 0;
  };

  const days = calculateDays();
  const hours = calculateHours();

  const calculateTotalPrice = () => {
    const svc = listing?.serviceList?.find(s => s.name === bookingDetails.selectedUnit);
    const room = listing?.roomTypes?.find(r => r.name === bookingDetails.selectedUnit);
    const unitPrice = svc?.price ? Number(svc.price) : room?.price ? Number(room.price) : (listing?.regularPrice || 0);
    if (isDailyStay) {
      if (days === 0) return 0;
      const extra = bookingDetails.breakfast ? 150 * days * Number(bookingDetails.guests) : 0;
      const guestFee = Number(bookingDetails.guests) > 2 ? (Number(bookingDetails.guests) - 2) * 200 * days : 0;
      return unitPrice * days * (Number(bookingDetails.rooms) || 1) + extra + guestFee;
    }
    if (isHourlyRoom) return hours > 0 ? unitPrice * hours : 0;
    return unitPrice;
  };

  const totalPrice = calculateTotalPrice();

  const formatPhoneNumberForWhatsApp = (phone) => {
    if (!phone) return '';
    const d = String(phone).replace(/\D/g, '');
    if (d.startsWith('0') && d.length === 10) return '27' + d.substring(1);
    return d;
  };

  const getHostPhone = () =>
    listing?.contact || listing?.phone || listing?.userRef?.contact || listing?.userRef?.phone || '';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return times;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleNext = () => {
    const newErrors = {};
    if (step === 1) {
      if (!bookingDetails.fullName?.trim()) newErrors.fullName = 'Full name is required';
      if (!bookingDetails.phone?.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[0-9+\-\s()]{10,}$/.test(String(bookingDetails.phone).replace(/\D/g, ''))) newErrors.phone = 'Please enter a valid phone number';
      if (!bookingDetails.email?.trim()) newErrors.email = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) newErrors.email = 'Invalid email address';

      if (isDailyStay) {
        if (!bookingDetails.checkIn) newErrors.checkIn = 'Check-in date is required';
        if (!bookingDetails.checkOut) newErrors.checkOut = 'Check-out date is required';
        else if (bookingDetails.checkIn && new Date(bookingDetails.checkOut) <= new Date(bookingDetails.checkIn)) {
          newErrors.checkOut = 'Check-out must be after check-in';
        }
      }
      if (isHourlyRoom || isServiceMode) {
        if (!bookingDetails.selectedDate) newErrors.selectedDate = 'Date is required';
      }
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setStep(prev => Math.min(3, prev + 1));
  };

  const buildWhatsAppMessage = () => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const clientPhone = formatPhoneNumberForWhatsApp(bookingDetails.phone);
    const unitTag = bookingDetails.selectedUnit ? ` (${bookingDetails.selectedUnit})` : '';
    const dateStr = isDailyStay ? formatDate(bookingDetails.checkIn) : formatDate(bookingDetails.selectedDate);

    const acceptMsg = `Accept the booking for ${bookingDetails.fullName}, I accept your request for ${listing.name}${unitTag} on ${dateStr}. See you then!`;
    const declineMsg = `Decline the booking for ${bookingDetails.fullName}, I'm unable to accept request for ${listing.name}${unitTag} on ${dateStr}. Can we try another time?`;
    const acceptLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(acceptMsg)}` : null;
    const declineLink = clientPhone ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(declineMsg)}` : null;

    let msg = '';
    if (isDailyStay) {
      const typeTitle = propertyType === 'resort' ? '🏖️ RESORT & HOLIDAY PARK BOOKING'
        : propertyType === 'hotel' ? '🏨 HOTEL & LODGE BOOKING'
        : propertyType === 'land' ? '🏡 SELF-CATERING BOOKING'
        : '🛌 GUEST HOUSE & B&B BOOKING';
      msg += `*${typeTitle}*\n\n`;
      msg += `🏨 *Property:* ${listing?.name}\n`;
      if (bookingDetails.selectedUnit) msg += `🚪 *Room / Unit:* ${bookingDetails.selectedUnit}\n`;
      msg += `📍 *Location:* ${listing?.address}\n`;
      msg += `👤 *Guest:* ${bookingDetails.fullName} (${bookingDetails.phone})\n`;
      msg += `👥 *Occupancy:* ${bookingDetails.guests} Guest(s), ${bookingDetails.rooms} Room(s)\n`;
      msg += `➡️ *Check-in:* ${formatDate(bookingDetails.checkIn)}\n`;
      msg += `⬅️ *Check-out:* ${formatDate(bookingDetails.checkOut)}\n`;
      msg += `⏳ *Duration:* ${days} Day(s)\n`;
      if (bookingDetails.breakfast) msg += `☕ *Breakfast:* Included\n`;
      if (bookingDetails.pets) msg += `🐾 *Pets:* Yes\n`;
    } else if (isHourlyRoom) {
      msg += `*🚪 ROOM PER HOUR BOOKING ⏰*\n\n`;
      msg += `🚪 *Space:* ${listing?.name}\n`;
      if (bookingDetails.selectedUnit) msg += `🚪 *Room:* ${bookingDetails.selectedUnit}\n`;
      msg += `📍 *Location:* ${listing?.address}\n`;
      msg += `👤 *Client:* ${bookingDetails.fullName} (${bookingDetails.phone})\n`;
      msg += `📅 *Date:* ${formatDate(bookingDetails.selectedDate)}\n`;
      msg += `⏰ *Time:* ${bookingDetails.startTime} - ${bookingDetails.endTime} (${hours.toFixed(1)} hrs)\n`;
    } else if (isRent) {
      msg += `*🏠 PROPERTY RENTAL INQUIRY 🏠*\n\n`;
      msg += `🏠 *Property:* ${listing?.name}\n`;
      if (bookingDetails.selectedUnit) msg += `🚪 *Unit:* ${bookingDetails.selectedUnit}\n`;
      msg += `📍 *Location:* ${listing?.address}\n`;
      msg += `👤 *Prospect:* ${bookingDetails.fullName} (${bookingDetails.phone})\n`;
      if (bookingDetails.viewingDate) msg += `📅 *Viewing:* ${formatDate(bookingDetails.viewingDate)} at ${bookingDetails.viewingTime}\n`;
      if (bookingDetails.leaseDuration) msg += `⏳ *Lease Term:* ${bookingDetails.leaseDuration}\n`;
      msg += `💰 *Monthly Rent:* R${listing?.regularPrice?.toLocaleString()}/month\n`;
    } else {
      msg += `*${config.waMsgPrefix}*\n\n`;
      msg += `${config.emoji} *Service:* ${listing?.name}\n`;
      if (bookingDetails.selectedUnit) msg += `📋 *${config.unitLabel}:* ${bookingDetails.selectedUnit}\n`;
      msg += `📍 *Address:* ${listing?.address}\n`;
      msg += `👤 *${config.clientLabel}:* ${bookingDetails.fullName} (${bookingDetails.phone})\n`;
      msg += `📅 *Date:* ${formatDate(bookingDetails.selectedDate)}\n`;
      msg += `⏰ *Time:* ${bookingDetails.startTime} – ${bookingDetails.endTime}\n`;
      if (config.extras?.includes('numberOfGuests') && Number(bookingDetails.numberOfGuests) > 1) {
        msg += `👥 *Guests / Pax:* ${bookingDetails.numberOfGuests}\n`;
      }
      if (config.extras?.includes('vehicleDetails') && bookingDetails.vehicleDetails) {
        msg += `🚗 *Vehicle:* ${bookingDetails.vehicleDetails}\n`;
      }
      if (config.extras?.includes('location') && bookingDetails.serviceLocation) {
        msg += `📍 *Service Location:* ${bookingDetails.serviceLocation}\n`;
      }
      if (config.extras?.includes('sessionFrequency')) {
        msg += `🔄 *Frequency:* ${bookingDetails.sessionFrequency === 'once' ? 'Once-off' : bookingDetails.sessionFrequency}\n`;
      }
    }
    msg += `💵 *TOTAL: R${totalPrice.toLocaleString()}*\n\n`;
    if (acceptLink) msg += `✅ *ACCEPT:*\n${acceptLink}\n\n`;
    if (declineLink) msg += `❌ *REJECT:*\n${declineLink}\n\n`;
    msg += `🔐 *Verification Code:* \`${verificationCode}\`\n_Sent via loopOut_`;
    return msg;
  };

  const handleWhatsAppBooking = async () => {
    setIsSubmitting(true);
    const hostPhone = getHostPhone();
    if (!hostPhone) { alert('Host contact information is not currently available'); setIsSubmitting(false); return; }
    if (!currentUser) { alert('Please sign in to make a reservation.'); setIsSubmitting(false); return; }

    let savedBookingId = null;
    try {
      let startDateStr = bookingDetails.selectedDate
        ? bookingDetails.selectedDate + 'T' + bookingDetails.startTime
        : new Date().toISOString().split('T')[0];
      let endDateStr = bookingDetails.selectedDate
        ? bookingDetails.selectedDate + 'T' + bookingDetails.endTime
        : new Date(Date.now() + 86400000).toISOString().split('T')[0];

      if (isDailyStay) { startDateStr = bookingDetails.checkIn; endDateStr = bookingDetails.checkOut; }

      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || currentUser?.token || currentUser?.access_token;
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({
          listingId: listing._id,
          startDate: startDateStr,
          endDate: endDateStr,
          phone: bookingDetails.phone,
          message: `${bookingDetails.selectedUnit ? `[${config.unitLabel}: ${bookingDetails.selectedUnit}] ` : ''}${bookingDetails.specialRequests || ''}`.trim(),
          subtype: bookingDetails.selectedUnit || undefined,
          numberOfGuests: Number(bookingDetails.numberOfGuests || bookingDetails.guests) || 1,
        })
      });

      if (!bookingRes.ok) {
        const errData = await bookingRes.json().catch(() => ({}));
        alert(errData.error || 'Could not process the booking. Please check details or try another date.');
        setIsSubmitting(false);
        return;
      }

      pushPhoneNotification({
        title: '🎉 Booking Request Sent',
        message: `Your booking for ${listing?.name || 'service'} has been submitted! Check notifications for updates.`,
        type: 'success',
        link: '/notifications'
      });

      const bookingResult = await bookingRes.json();
      savedBookingId = bookingResult.booking?._id;
    } catch (err) {
      console.error('Failed to save booking:', err);
    }

    let message = buildWhatsAppMessage();
    if (savedBookingId) message += `\n\n[Booking Ref: ${savedBookingId}]`;
    const waNumber = formatPhoneNumberForWhatsApp(hostPhone);
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setTimeout(() => { setIsSubmitting(false); onClose(); }, 800);
  };

  const handleEscrow = async () => {
    if (!currentUser) { alert('Please sign in to proceed with Escrow checkout.'); return; }
    try {
      setIsEscrowLoading(true);
      const res = await fetch('/api/payment/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser._id,
          amount: totalPrice || listing.regularPrice,
          name: currentUser.username || currentUser.name,
          email: currentUser.email,
          serviceId: listing._id,
          providerName: listing.name
        })
      });
      const data = await res.json();
      if (data.success && data.payfast) {
        window.location.href = data.payfast.url;
      } else {
        alert(data.message || 'Escrow initialization failed. Please try again or use WhatsApp booking.');
      }
    } catch (err) {
      console.error('Escrow checkout error:', err);
      alert('Could not start Escrow checkout. Please try again.');
    } finally {
      setIsEscrowLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const inputCls = (err) =>
    `w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl text-sm font-semibold text-gray-900 dark:text-white ${accentCls.ring} focus:outline-none ${err ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`;
  const labelCls = 'block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1';

  const serviceList = listing?.serviceList || [];
  const roomTypes = listing?.roomTypes || [];
  const hasOptions = serviceList.length > 0 || roomTypes.length > 0;
  const optionItems = serviceList.length > 0 ? serviceList : roomTypes;

  const stepLabels = isServiceMode
    ? ['Contact & Schedule', 'Package & Extras', 'Summary & Book']
    : isDailyStay
    ? ['Contact & Dates', 'Room & Preferences', 'Breakdown & Reserve']
    : isRent
    ? ['Contact & Viewing', 'Details', 'Confirm']
    : ['Contact & Schedule', 'Preferences', 'Confirm & Book'];

  const ServiceIcon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        key="listing-sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          key="listing-sheet-content"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 200, mass: 0.95 }}
          drag="y"
          dragDirectionLock={true}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.08, bottom: 0.7 }}
          dragSnapToOrigin={true}
          onDragEnd={(_e, info) => { if (info.offset.y > 90 || info.velocity.y > 350) onClose(); }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-xl bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col touch-pan-y will-change-transform"
        >
          {/* Drag handle */}
          <div className="flex flex-col items-center justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing touch-none select-none group">
            <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-400 transition-colors" />
          </div>

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={step > 1 ? () => setStep(p => p - 1) : onClose}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {step > 1 ? (
                  <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                ) : (
                  <XMarkIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>

              <div className="flex items-center gap-2 min-w-0">
                {isServiceMode && (
                  <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.color} text-white shadow-sm`}>
                    <ServiceIcon className="w-4 h-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-gray-900 dark:text-white leading-tight truncate max-w-[200px] sm:max-w-xs">
                    {isServiceMode ? `${config.label} Booking` : `Reserve`} · {listing.name}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-semibold">
                    Step {step} of 3 · {stepLabels[step - 1]}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-2 rounded-full transition-all ${step === n ? `w-6 ${accentCls.tag}` : step > n ? 'w-2 bg-emerald-500' : 'w-2 bg-gray-200 dark:bg-gray-800'}`} />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Service banner */}
                {isServiceMode && (
                  <div className={`rounded-2xl p-4 bg-gradient-to-r ${config.color} text-white flex items-center gap-3 shadow-md`}>
                    <span className="text-3xl">{config.emoji}</span>
                    <div>
                      <div className="font-black text-sm">{config.label} Booking</div>
                      <div className="text-xs opacity-80">{listing.name} · R{listing?.regularPrice?.toLocaleString()} base rate</div>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                    1. {config.clientLabel} Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input type="text" name="fullName" value={bookingDetails.fullName} onChange={handleChange}
                        placeholder="e.g. Sarah Jenkins" className={inputCls(errors.fullName)} />
                      {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.fullName}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Phone Number *</label>
                        <input type="tel" name="phone" value={bookingDetails.phone} onChange={handleChange}
                          placeholder="082 123 4567" className={inputCls(errors.phone)} />
                        {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Email Address *</label>
                        <input type="email" name="email" value={bookingDetails.email} onChange={handleChange}
                          placeholder="sarah@example.com" className={inputCls(errors.email)} />
                        {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service / Helper — date & time */}
                {isServiceMode && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      2. {config.sessionLabel} Schedule
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>{config.dateLabel} *</label>
                        <input type="date" name="selectedDate" value={bookingDetails.selectedDate} onChange={handleChange}
                          min={today} className={inputCls(errors.selectedDate)} />
                        {errors.selectedDate && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.selectedDate}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Start Time</label>
                          <select name="startTime" value={bookingDetails.startTime} onChange={handleChange} className={inputCls(false)}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>End Time</label>
                          <select name="endTime" value={bookingDetails.endTime} onChange={handleChange} className={inputCls(false)}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      {hours > 0 && (
                        <div className={`p-3 rounded-2xl border-2 ${accentCls.border} flex items-center justify-between`}>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <ClockIcon className="w-4 h-4" /> Session Duration
                          </div>
                          <span className={`font-black text-xs px-2.5 py-1 rounded-xl ${accentCls.pill}`}>
                            {hours.toFixed(1)} Hour(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Daily Stay */}
                {isDailyStay && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">2. Reservation Dates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Check-in Date *</label>
                        <input type="date" name="checkIn" value={bookingDetails.checkIn} onChange={handleChange}
                          min={today} className={inputCls(errors.checkIn)} />
                        {errors.checkIn && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.checkIn}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Check-out Date *</label>
                        <input type="date" name="checkOut" value={bookingDetails.checkOut} onChange={handleChange}
                          min={bookingDetails.checkIn || today} className={inputCls(errors.checkOut)} />
                        {errors.checkOut && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.checkOut}</p>}
                      </div>
                    </div>
                    {days > 0 && (
                      <div className="mt-3 p-3 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                          <CalendarIcon className="w-4 h-4" /> Total Stay
                        </div>
                        <span className="font-black text-xs text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-2.5 py-1 rounded-xl">
                          {days} Day{days > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Hourly Room */}
                {isHourlyRoom && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">2. Hourly Session</h3>
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Session Date *</label>
                        <input type="date" name="selectedDate" value={bookingDetails.selectedDate} onChange={handleChange}
                          min={today} className={inputCls(errors.selectedDate)} />
                        {errors.selectedDate && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.selectedDate}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Start Time</label>
                          <select name="startTime" value={bookingDetails.startTime} onChange={handleChange} className={inputCls(false)}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>End Time</label>
                          <select name="endTime" value={bookingDetails.endTime} onChange={handleChange} className={inputCls(false)}>
                            {generateTimeOptions().map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      {hours > 0 && (
                        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold">
                            <ClockIcon className="w-4 h-4" /> Session Length
                          </div>
                          <span className="font-black text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-xl">
                            {hours.toFixed(1)} hr(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rent */}
                {isRent && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">2. Viewing Appointment</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Preferred Viewing Date</label>
                        <input type="date" name="viewingDate" value={bookingDetails.viewingDate} onChange={handleChange}
                          min={today} className={inputCls(false)} />
                      </div>
                      <div>
                        <label className={labelCls}>Preferred Time</label>
                        <select name="viewingTime" value={bookingDetails.viewingTime} onChange={handleChange} className={inputCls(false)}>
                          {['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Package / Unit selection */}
                {hasOptions ? (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      {config.unitLabel} Selection
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingDetails(p => ({ ...p, selectedUnit: '' }))}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${!bookingDetails.selectedUnit ? `${accentCls.border}` : 'border-gray-200 dark:border-gray-800'}`}
                      >
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Any Available Option</div>
                          <p className="text-[10px] text-gray-400">Fastest host confirmation</p>
                        </div>
                        <span className="text-xs font-black text-gray-500">R{listing?.regularPrice?.toLocaleString()}</span>
                      </button>

                      {optionItems.map((item, idx) => {
                        const isSelected = bookingDetails.selectedUnit === item.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBookingDetails(p => ({ ...p, selectedUnit: item.name }))}
                            className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${isSelected ? `${accentCls.border}` : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                                <span>{config.emoji}</span>
                                <span className="truncate">{item.name}</span>
                              </div>
                              {item.description && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.description}</p>}
                              {item.capacity && <p className="text-[10px] text-gray-400 mt-0.5">Max {item.capacity} pax</p>}
                            </div>
                            <span className="text-xs font-black shrink-0 ml-2 text-gray-600 dark:text-gray-300">
                              R{item.price ? Number(item.price).toLocaleString() : listing?.regularPrice?.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={labelCls}>{config.unitLabel} (Optional)</label>
                    <input type="text" name="selectedUnit" value={bookingDetails.selectedUnit} onChange={handleChange}
                      placeholder={`e.g. ${config.unitLabel}`} className={inputCls(false)} />
                  </div>
                )}

                {/* Service-specific extra fields */}
                {isServiceMode && (
                  <div className="space-y-4">
                    {config.extras?.includes('numberOfGuests') && (
                      <div>
                        <label className={labelCls}>Number of Guests / Pax</label>
                        <select name="numberOfGuests" value={bookingDetails.numberOfGuests} onChange={handleChange} className={inputCls(false)}>
                          {[1,2,3,4,5,6,8,10,15,20,30,50].map(n => (
                            <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {config.extras?.includes('vehicleDetails') && (
                      <div>
                        <label className={labelCls}>Vehicle Details</label>
                        <input type="text" name="vehicleDetails" value={bookingDetails.vehicleDetails} onChange={handleChange}
                          placeholder="e.g. Toyota Fortuner, White, SUV" className={inputCls(false)} />
                      </div>
                    )}

                    {config.extras?.includes('location') && (
                      <div>
                        <label className={labelCls}>Service Location / Address</label>
                        <input type="text" name="serviceLocation" value={bookingDetails.serviceLocation} onChange={handleChange}
                          placeholder="e.g. 12 Main St, Johannesburg" className={inputCls(false)} />
                      </div>
                    )}

                    {config.extras?.includes('sessionFrequency') && (
                      <div>
                        <label className={labelCls}>Session Frequency</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[{ value: 'once', label: 'Once-off' }, { value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Bi-weekly' }].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setBookingDetails(p => ({ ...p, sessionFrequency: opt.value }))}
                              className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all ${bookingDetails.sessionFrequency === opt.value ? `${accentCls.border}` : 'border-gray-200 dark:border-gray-800'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Accommodation extras */}
                {isDailyStay && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Occupancy</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Guests</label>
                        <select name="guests" value={bookingDetails.guests} onChange={handleChange} className={inputCls(false)}>
                          {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Rooms</label>
                        <select name="rooms" value={bookingDetails.rooms} onChange={handleChange} className={inputCls(false)}>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 pt-1">Add-ons</h3>
                    <button type="button" onClick={() => setBookingDetails(p => ({ ...p, breakfast: !p.breakfast }))}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${bookingDetails.breakfast ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/20' : 'border-gray-200 dark:border-gray-800'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">☕</span>
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Include Daily Breakfast</div>
                          <p className="text-[10px] text-gray-400">Chef-prepared gourmet breakfast daily</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-600">+R150/guest/day</span>
                    </button>
                    <button type="button" onClick={() => setBookingDetails(p => ({ ...p, pets: !p.pets }))}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${bookingDetails.pets ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20' : 'border-gray-200 dark:border-gray-800'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🐾</span>
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">Bringing Pets</div>
                          <p className="text-[10px] text-gray-400">Subject to host house rules</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-400">Request Approval</span>
                    </button>
                  </div>
                )}

                {isRent && (
                  <div>
                    <label className={labelCls}>Lease Duration</label>
                    <select name="leaseDuration" value={bookingDetails.leaseDuration} onChange={handleChange} className={inputCls(false)}>
                      <option value="6 Months">6 Months</option>
                      <option value="12 Months">12 Months (Standard)</option>
                      <option value="24 Months">24 Months</option>
                      <option value="Month-to-month">Month-to-month</option>
                    </select>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className={labelCls}>Special Requests / Notes</label>
                  <textarea name="specialRequests" value={bookingDetails.specialRequests} onChange={handleChange}
                    rows={3} placeholder={config.specialLabel}
                    className={`${inputCls(false)} resize-none`} />
                </div>
              </div>
            )}

            {/* ─── STEP 3 ─── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-slate-900 rounded-3xl p-5 text-white space-y-3 shadow-xl">
                  {isServiceMode && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${config.color} text-white text-xs font-black mb-1`}>
                      <ServiceIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                    <span>Service / Property</span>
                    <span className="text-white font-black truncate max-w-[180px]">{listing?.name}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                    <span>{isServiceMode ? 'Client' : 'Guest'}</span>
                    <span className="text-white font-black">{bookingDetails.fullName}</span>
                  </div>

                  {(isServiceMode || isHourlyRoom) && bookingDetails.selectedDate && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Date & Time</span>
                      <span className="text-white font-black">{bookingDetails.selectedDate} · {bookingDetails.startTime}–{bookingDetails.endTime}</span>
                    </div>
                  )}

                  {isDailyStay && bookingDetails.checkIn && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Stay</span>
                      <span className="text-white font-black">{bookingDetails.checkIn} → {bookingDetails.checkOut} ({days}D)</span>
                    </div>
                  )}

                  {bookingDetails.selectedUnit && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>{config.unitLabel}</span>
                      <span className="text-rose-400 font-black">{bookingDetails.selectedUnit}</span>
                    </div>
                  )}

                  {isServiceMode && config.extras?.includes('numberOfGuests') && Number(bookingDetails.numberOfGuests) > 1 && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Guests / Pax</span>
                      <span className="text-white font-black">{bookingDetails.numberOfGuests}</span>
                    </div>
                  )}

                  {isServiceMode && config.extras?.includes('vehicleDetails') && bookingDetails.vehicleDetails && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 pb-2 border-b border-white/10">
                      <span>Vehicle</span>
                      <span className="text-white font-black">{bookingDetails.vehicleDetails}</span>
                    </div>
                  )}

                  {isDailyStay && days > 0 && (
                    <div className="space-y-1.5 py-1 text-xs text-slate-300">
                      <div className="flex justify-between items-center">
                        <span>Base ({days}D × {bookingDetails.rooms || 1} room)</span>
                        <span>R{((listing?.regularPrice || 0) * days * (Number(bookingDetails.rooms) || 1)).toLocaleString()}</span>
                      </div>
                      {bookingDetails.breakfast && (
                        <div className="flex justify-between items-center text-amber-300">
                          <span>Breakfast Plan</span>
                          <span>+R{(150 * Number(bookingDetails.guests) * days).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">Estimated Total</span>
                    <span className="text-2xl font-black text-emerald-400">R{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button type="button" onClick={handleWhatsAppBooking} disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50">
                    {isSubmitting ? (
                      <><FaSpinner className="animate-spin text-lg" /> Connecting via WhatsApp…</>
                    ) : (
                      <><FaWhatsapp className="text-xl" /> Reserve via WhatsApp</>
                    )}
                  </button>
                  <button type="button" onClick={handleEscrow} disabled={isEscrowLoading}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95">
                    {isEscrowLoading ? (
                      <><FaSpinner className="animate-spin text-sm" /> Starting Escrow…</>
                    ) : (
                      <><FaShieldAlt className="text-sm text-indigo-500" /> Secure Escrow Checkout</>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 font-bold text-center italic bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl py-2 px-3">
                  ⚠️ Never pay cash before confirmation. Avoid scams with loopOut Escrow!
                </p>
              </div>
            )}
          </div>

          {/* Footer Nav */}
          <div
            className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
            style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))' }}
          >
            {step > 1 ? (
              <button type="button" onClick={() => setStep(p => p - 1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button type="button" onClick={handleNext}
                className={`px-7 py-3 bg-gradient-to-r ${config.color} text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all`}>
                Next Step →
              </button>
            ) : (
              <button type="button" onClick={handleWhatsAppBooking} disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                {isSubmitting ? <FaSpinner className="animate-spin text-sm" /> : <FaWhatsapp className="text-base" />}
                Book Now
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
