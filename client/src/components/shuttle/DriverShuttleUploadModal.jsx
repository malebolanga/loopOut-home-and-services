import React, { useState } from 'react';
import { 
  X, 
  Bus, 
  Car, 
  Upload, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  FileText, 
  Camera, 
  CheckCircle2, 
  Lock,
  Phone,
  User,
  Home as HomeIcon,
  Zap,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';
import { uploadFiles } from '../../services/upload.service';
import ShuttleDestinationPicker from './ShuttleDestinationPicker';

const SA_PROVINCES = [
  'Gauteng',
  'Limpopo',
  'Mpumalanga',
  'KwaZulu-Natal',
  'Western Cape',
  'North West',
  'Free State',
  'Eastern Cape',
  'Northern Cape'
];

const COMMON_VEHICLES = [
  'Toyota Quantum 15-Seater',
  'Toyota Quantum 16-Seater Sesfikile',
  'Mercedes-Benz Sprinter 22-Seater VIP',
  'Toyota Rumion 7-Seater',
  'Toyota Avanza 7-Seater',
  'Volkswagen Crafter 22-Seater',
  'Mercedes-Benz Vito 8-Seater',
  'Luxury Coach / Bus 60-Seater',
  'Sedan / Hatchback 4-Seater'
];

const COMMON_COLORS = [
  'White',
  'Silver',
  'Metallic Grey',
  'Black',
  'Blue',
  'Gold / Champagne',
  'Red'
];

const DriverShuttleUploadModal = ({ isOpen, onClose, onSuccess, currentUser }) => {
  if (!isOpen) return null;

  // Wizard Step: 1 = Car Info, 2 = Driver Info, 3 = Pricing & Route, 4 = Documents & Photos
  const [step, setStep] = useState(1);

  // ── Step 1: Car Information ──────────────────────────────────
  const [serviceType, setServiceType] = useState('interprovincial');
  const [carType, setCarType] = useState('');
  const [customCarType, setCustomCarType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [carColor, setCarColor] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [features, setFeatures] = useState([]);

  // ── Step 2: Driver Information ───────────────────────────────
  const [driverName, setDriverName] = useState(currentUser?.name || currentUser?.username || '');
  const [driverPhone, setDriverPhone] = useState(currentUser?.phone || '');
  const [driverAltPhone, setDriverAltPhone] = useState('');
  const [driverHomeTown, setDriverHomeTown] = useState('');
  const [driverHomeProvince, setDriverHomeProvince] = useState('');
  const [driverLicenceNumber, setDriverLicenceNumber] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');

  // ── Banking Details (for passenger EFT payments) ─────────────
  const [bankName, setBankName] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState(currentUser?.name || currentUser?.username || '');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankBranchCode, setBankBranchCode] = useState('');
  const [bankAccountType, setBankAccountType] = useState('Savings');
  const [bankReference, setBankReference] = useState('');

  // ── Step 3: Pricing, Route & House-to-House Collection ───────
  const [departureProvince, setDepartureProvince] = useState('');
  const [destinationProvince, setDestinationProvince] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [originCoordinates, setOriginCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [pickupStation, setPickupStation] = useState('');
  const [dropoffStation, setDropoffStation] = useState('');
  const [isHouseToHouse, setIsHouseToHouse] = useState(true);
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [leavesWhenFull, setLeavesWhenFull] = useState(true);
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [extraBagPrice, setExtraBagPrice] = useState(0);
  const [luggageNotes, setLuggageNotes] = useState('');

  // ── Step 4: Documents, Car Photo & Driver Photo ──────────────
  const [driverFaceScan, setDriverFaceScan] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [driverLicenceScan, setDriverLicenceScan] = useState('');
  const [driverIdScan, setDriverIdScan] = useState(currentUser?.idDocumentUrl || '');

  // Uploading states
  const [uploadingFace, setUploadingFace] = useState(false);
  const [uploadingCar, setUploadingCar] = useState(false);
  const [uploadingLicence, setUploadingLicence] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);

  // Submission & Validation States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFeature = (item) => {
    if (features.includes(item)) {
      setFeatures(features.filter((f) => f !== item));
    } else {
      setFeatures([...features, item]);
    }
  };

  // Upload Handlers
  const handleUploadFacePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFace(true);
    setError(null);
    try {
      const [url] = await uploadFiles([file]);
      if (url) setDriverFaceScan(url);
    } catch (err) {
      setError('Could not upload driver photo. Please try again.');
    } finally {
      setUploadingFace(false);
    }
  };

  const handleUploadCarPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCar(true);
    setError(null);
    try {
      const [url] = await uploadFiles([file]);
      if (url) setImageUrl(url);
    } catch (err) {
      setError('Could not upload vehicle photo. Please try again.');
    } finally {
      setUploadingCar(false);
    }
  };

  const handleUploadLicence = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLicence(true);
    setError(null);
    try {
      const [url] = await uploadFiles([file]);
      if (url) setDriverLicenceScan(url);
    } catch (err) {
      setError('Could not upload driver licence document. Please try again.');
    } finally {
      setUploadingLicence(false);
    }
  };

  const handleUploadId = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(true);
    setError(null);
    try {
      const [url] = await uploadFiles([file]);
      if (url) setDriverIdScan(url);
    } catch (err) {
      setError('Could not upload National ID document. Please try again.');
    } finally {
      setUploadingId(false);
    }
  };

  // Step Validation & Navigation
  const handleNext = () => {
    setError(null);

    // Validate Page 1: Car Information
    if (step === 1) {
      const vehicleTypeFinal = (customCarType.trim() || carType).trim();
      if (!vehicleTypeFinal) {
        setError('Please select or specify your vehicle model.');
        return;
      }
      if (!plateNumber.trim()) {
        setError('Please enter your vehicle number plate registration (e.g. DZ 88 YK GP).');
        return;
      }
      if (Number(totalSeats) <= 0) {
        setError('Please specify total passenger capacity.');
        return;
      }
      setStep(2);
      return;
    }

    // Validate Page 2: Driver Information
    if (step === 2) {
      if (!driverName.trim()) {
        setError('Please enter driver full legal name.');
        return;
      }
      if (!driverPhone.trim()) {
        setError('Please enter driver contact phone number for passengers and WhatsApp.');
        return;
      }
      setStep(3);
      return;
    }

    // Validate Page 3: Pricing & Route
    if (step === 3) {
      if (!originCity.trim() || !destinationCity.trim()) {
        setError('Please provide origin city and destination city.');
        return;
      }
      if (Number(pricePerSeat) <= 0) {
        setError('Please enter a valid price per seat in ZAR.');
        return;
      }
      if (!departureProvince || (serviceType !== 'local' && !destinationProvince)) {
        setError('Please choose the correct province for this route.');
        return;
      }
      if (!departureDate || Number.isNaN(new Date(departureDate).getTime())) {
        setError('Please choose the actual departure date.');
        return;
      }
      if (!departureTime.trim()) {
        setError('Please enter the planned departure time. The shuttle can also leave earlier when full.');
        return;
      }
      if (!originCoordinates || !destinationCoordinates) {
        setError('Set map pins for the route start and destination so GPS can detect arrival.');
        return;
      }
      setStep(4);
      return;
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Final Submission on Page 4
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    setLoading(true);

    try {
      const vehicleTypeFinal = (customCarType.trim() || carType).trim();

      const payload = {
        carType: vehicleTypeFinal,
        plateNumber: plateNumber.trim().toUpperCase(),
        carColor: carColor.trim(),
        carImages: imageUrl.trim() ? [imageUrl.trim()] : [],
        totalSeats: Number(totalSeats),
        availableSeats: Number(totalSeats),
        serviceType,
        departureProvince,
        destinationProvince: serviceType === 'local' ? departureProvince : destinationProvince,
        originCity: originCity.trim(),
        destinationCity: destinationCity.trim(),
        originCoordinates,
        destinationCoordinates,
        pickupStation: pickupStation.trim() || `House-to-house near ${originCity}`,
        dropoffStation: dropoffStation.trim() || `House-to-house near ${destinationCity}`,
        isHouseToHouse,
        dropoffType: isHouseToHouse ? 'house_to_house' : 'station',
        leavesWhenFull,
        departureRule: leavesWhenFull ? 'when_full' : 'scheduled',
        departureDate,
        departureTime: departureTime.trim(),
        pricePerSeat: Number(pricePerSeat),
        freeBagsPerPassenger: 1,
        extraBagPrice: Number(extraBagPrice) || 0,
        maxExtraBagsPerPassenger: 2,
        luggageNotes: luggageNotes.trim(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        // Banking details for direct EFT from passengers
        bankName: bankName.trim(),
        bankAccountHolder: bankAccountHolder.trim() || driverName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankBranchCode: bankBranchCode.trim(),
        bankAccountType: bankAccountType.trim(),
        bankReference: bankReference.trim(),
        features,
        notes: [yearsExperience && `Experience: ${yearsExperience}`, driverHomeTown && `Home base: ${driverHomeTown}${driverHomeProvince ? `, ${driverHomeProvince}` : ''}`].filter(Boolean).join('. ')
      };

      const res = await axios.post(resolveApiUrl('/api/shuttles/create'), payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (res.data?.success) {
        if (onSuccess) onSuccess(res.data.shuttle);
        onClose();
      } else {
        setError(res.data?.message || 'Failed to register shuttle.');
      }
    } catch (err) {
      console.error('Shuttle registration error:', err);
      setError(err.response?.data?.message || 'Could not register shuttle route. Please sign in and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in-quick">
      {/* 100% Real Popup Container (From down and going up + fade-in) */}
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[94vh] animate-slide-up-fade"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-base">
              {step === 1 && <Car className="w-5 h-5" />}
              {step === 2 && <User className="w-5 h-5" />}
              {step === 3 && <DollarSign className="w-5 h-5" />}
              {step === 4 && <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>Register Shuttle & Drive</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold">
                  Step {step} of 4
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {step === 1 && 'Page 1: Vehicle & Car Information'}
                {step === 2 && 'Page 2: Driver Identity & Experience'}
                {step === 3 && 'Page 3: Route, Pricing & House Collection'}
                {step === 4 && 'Page 4: Submit Documents & Photos'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Bar Indicator */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Step Tabs Pills */}
        <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 grid grid-cols-4 gap-1 text-[11px] font-bold text-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-1 rounded-lg transition ${step === 1 ? 'bg-teal-600 text-white shadow-sm' : step > 1 ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}
          >
            1. Car Info
          </button>
          <button
            type="button"
            onClick={() => step > 1 && setStep(2)}
            className={`py-1 rounded-lg transition ${step === 2 ? 'bg-teal-600 text-white shadow-sm' : step > 2 ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}
          >
            2. Driver
          </button>
          <button
            type="button"
            onClick={() => step > 2 && setStep(3)}
            className={`py-1 rounded-lg transition ${step === 3 ? 'bg-teal-600 text-white shadow-sm' : step > 3 ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}
          >
            3. Pricing
          </button>
          <button
            type="button"
            onClick={() => step > 3 && setStep(4)}
            className={`py-1 rounded-lg transition ${step === 4 ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400'}`}
          >
            4. Documents
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ══════════════════════════════════════════════════════════
              PAGE 1: INFORMATION ABOUT THE CAR
          ══════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <Car className="w-4 h-4" />
                <span>Vehicle Specifications & Registration</span>
              </div>

              {/* Transit Scope Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Transit Service Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceType('interprovincial')}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition flex items-center justify-between ${
                      serviceType === 'interprovincial'
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 ring-2 ring-teal-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm">🛣️ Inter-Provincial</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                        Corridor trips (e.g. Gauteng to Limpopo / KZN)
                      </div>
                    </div>
                    {serviceType === 'interprovincial' && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('local')}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition flex items-center justify-between ${
                      serviceType === 'local'
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 ring-2 ring-teal-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm">📍 Local Express</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                        Intra-city or regional express town transfers
                      </div>
                    </div>
                    {serviceType === 'local' && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Car Model Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Car / Minibus Model
                </label>
                <select
                  value={carType}
                  onChange={(e) => setCarType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 mb-2"
                >
                  {COMMON_VEHICLES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                  <option value="Other">Other / Custom Vehicle Model</option>
                </select>

                {carType === 'Other' && (
                  <input
                    type="text"
                    value={customCarType}
                    onChange={(e) => setCustomCarType(e.target.value)}
                    placeholder="Enter custom vehicle make and model (e.g. Ford Transit 18-Seater)"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                )}
              </div>

              {/* Number Plate & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Number Plate with South African visual badge */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Car Number Plate ("Number Belt")
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. DZ 88 YK GP / CA 123-456"
                    required
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold tracking-wider uppercase rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                  {plateNumber.trim() && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400">Preview:</span>
                      <span className="px-2.5 py-0.5 rounded bg-yellow-300 text-gray-950 border border-gray-900 font-mono font-black text-xs tracking-wider">
                        {plateNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Car Color */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Vehicle Color
                  </label>
                  <select
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  >
                    {COMMON_COLORS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Seats Capacity */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Total Passenger Seats
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[7, 10, 14, 15, 16, 22, 35, 60].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTotalSeats(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        Number(totalSeats) === num
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-teal-400'
                      }`}
                    >
                      {num} Seats
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="65"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-20 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
                    placeholder="Custom"
                  />
                </div>
              </div>

              {/* Vehicle Features & Amenities */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Vehicle Amenities & Features
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Air Conditioning',
                    'Luggage Boot / Trailer',
                    'USB Charging Ports',
                    'Bluetooth Music',
                    'Tinted Windows',
                    'Speed Governor (100 km/h)',
                    'Spacious Legroom',
                    'Sanitizer on Board'
                  ].map((feat) => {
                    const active = features.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition flex items-center gap-1 ${
                          active
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-teal-400'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              PAGE 2: INFORMATION ABOUT THE DRIVER
          ══════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <User className="w-4 h-4" />
                <span>Driver Identity & Experience Profile</span>
              </div>

              {/* Driver Full Legal Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Driver Full Legal Name (as printed on your ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Sipho Ndlovu"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Driver Contact Phone (WhatsApp) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone (WhatsApp & Calls)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="e.g. +27 82 555 0192"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Passengers will send trip booking requests to this number.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Alternative / Next of Kin Contact
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={driverAltPhone}
                      onChange={(e) => setDriverAltPhone(e.target.value)}
                      placeholder="e.g. +27 71 555 9876"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Residential Base (Home Town & Province) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Home Base Town / City
                  </label>
                  <input
                    type="text"
                    value={driverHomeTown}
                    onChange={(e) => setDriverHomeTown(e.target.value)}
                    placeholder="e.g. Johannesburg / Pretoria"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Home Province
                  </label>
                  <select
                    value={driverHomeProvince}
                    onChange={(e) => setDriverHomeProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  >
                    {SA_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Licence Number & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Driver's Licence Number
                  </label>
                  <input
                    type="text"
                    value={driverLicenceNumber}
                    onChange={(e) => setDriverLicenceNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. B123456789"
                    className="w-full px-3.5 py-2.5 text-sm uppercase rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Professional Driving Experience
                  </label>
                  <select
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="1-3 years">1 - 3 years</option>
                    <option value="3-5 years">3 - 5 years</option>
                    <option value="5+ years">5+ years (Experienced Professional)</option>
                    <option value="10+ years">10+ years (Master Operator)</option>
                  </select>
                </div>
              </div>

              {/* Verified Trust Assurance */}
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 flex items-center gap-3 text-xs text-teal-900 dark:text-teal-200">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                <span>
                  Uploaded documents are not reviewed or verified by LoopOut. Passengers will be told that verification has not been completed.
                </span>
              </div>

              {/* ── Banking Details Section ───────────────────── */}
              <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  <span>🏦</span>
                  <span>Banking Details (Passengers pay you directly via EFT)</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Passengers will EFT their fare directly to your account. You'll confirm receipt on LoopOut before their ticket is activated.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Bank</option>
                      <option value="ABSA">ABSA</option>
                      <option value="Capitec">Capitec</option>
                      <option value="FNB">FNB (First National Bank)</option>
                      <option value="Nedbank">Nedbank</option>
                      <option value="Standard Bank">Standard Bank</option>
                      <option value="African Bank">African Bank</option>
                      <option value="Discovery Bank">Discovery Bank</option>
                      <option value="TymeBank">TymeBank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                    <select
                      value={bankAccountType}
                      onChange={(e) => setBankAccountType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Savings">Savings Account</option>
                      <option value="Cheque">Cheque / Current Account</option>
                      <option value="Transmission">Transmission Account</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankAccountHolder}
                      onChange={(e) => setBankAccountHolder(e.target.value)}
                      placeholder="Full name as registered with bank"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="e.g. 62012345678"
                      className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Branch / Sort Code</label>
                    <input
                      type="text"
                      value={bankBranchCode}
                      onChange={(e) => setBankBranchCode(e.target.value)}
                      placeholder="e.g. 250655"
                      className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Reference <span className="text-gray-400 font-normal">(optional — your name or preferred ref)</span></label>
                    <input
                      type="text"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      placeholder="e.g. Sipho Shuttle or leave blank (ticket code will be used)"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              PAGE 3: PRICING, ROUTE & HOUSE COLLECTION
          ══════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <DollarSign className="w-4 h-4" />
                <span>Pricing, Route & House-to-House Collection</span>
              </div>

              {/* Route Corridor */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Origin */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      From (Origin City)
                    </label>
                    <input
                      type="text"
                      value={originCity}
                      onChange={(e) => { setOriginCity(e.target.value); setOriginCoordinates(null); }}
                      placeholder="e.g. Johannesburg"
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 mb-1.5"
                    />
                    <select
                      value={departureProvince}
                      onChange={(e) => setDepartureProvince(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <option value="" disabled>Select province</option>
                      {SA_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p} Province</option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      To (Destination City)
                    </label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => { setDestinationCity(e.target.value); setDestinationCoordinates(null); }}
                      placeholder="e.g. Polokwane"
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 mb-1.5"
                    />
                    <select
                      value={destinationProvince}
                      onChange={(e) => setDestinationProvince(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <option value="" disabled>Select province</option>
                      {SA_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p} Province</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ShuttleDestinationPicker value={originCoordinates} onChange={setOriginCoordinates} destinationName={originCity || 'route starting city'} />
                  <ShuttleDestinationPicker value={destinationCoordinates} onChange={setDestinationCoordinates} destinationName={destinationCity || 'destination city'} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Pickup Coverage Area
                  </label>
                  <input
                    type="text"
                    value={pickupStation}
                    onChange={(e) => setPickupStation(e.target.value)}
                    placeholder={`House-to-house near ${originCity || 'the starting city'}`}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">Default pickup is from homes near the route’s starting city. Add covered suburbs if needed; passengers provide their exact address.</p>
                </div>
              </div>

              {/* House-to-House Collection & Dropoff */}
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <HomeIcon className="w-4 h-4 text-emerald-600" />
                      <span>House-to-house pickup & drop-off (default)</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pick up and drop off near the route ends. The driver confirms whether each exact address is within the areas covered.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={isHouseToHouse}
                    onChange={(e) => setIsHouseToHouse(e.target.checked)}
                    className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Drop-off Coverage Area
                  </label>
                  <input
                    type="text"
                    value={dropoffStation}
                    onChange={(e) => setDropoffStation(e.target.value)}
                    placeholder={`House-to-house near ${destinationCity || 'the destination city'}`}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">Default drop-off is near the destination city. Add the suburbs served; passengers provide their exact address.</p>
                </div>
              </div>

              {/* Pricing per Seat & Luggage Policy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Price per seat */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Price per Seat (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">R</span>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={pricePerSeat}
                      onChange={(e) => setPricePerSeat(e.target.value)}
                      required
                      className="w-full pl-8 pr-3 py-2 text-base font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Extra Luggage Fee */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Extra Luggage Fee per Bag (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">R</span>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={extraBagPrice}
                      onChange={(e) => setExtraBagPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-base font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">1 normal bag is always FREE per passenger.</p>
                </div>
              </div>

              {/* Departure Flexibility */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Departure Schedule</span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Can leave early when full</span>
                    <input
                      type="checkbox"
                      checked={leavesWhenFull}
                      onChange={(e) => setLeavesWhenFull(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              PAGE 4: VEHICLE PHOTO & FINAL REVIEW
          ══════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/25">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                <div><p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Driver documents approved</p><p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">Your ID, face photo, and driving licence were reviewed. This vehicle will be submitted under your approved driver profile.</p></div>
              </div>

              {/* Vehicle photo */}
              <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Car" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Car className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      Picture of the Shuttle Car
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {imageUrl ? '✓ Vehicle photo uploaded' : 'Clear front/side photo showing vehicle'}
                    </div>
                  </div>
                </div>

                <label className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm">
                  {uploadingCar ? 'Uploading...' : imageUrl ? 'Change Photo' : 'Upload Car'}
                  <input type="file" accept="image/*" onChange={handleUploadCarPhoto} className="hidden" />
                </label>
              </div>

              {/* Summary Card Before Submission */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-1.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Registration Summary:
                </div>
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                  <span>{carType} ({plateNumber || 'No Plate'})</span>
                  <span className="text-amber-500 font-black">R{pricePerSeat} / seat</span>
                </div>
                <div className="text-gray-500">
                  Driver: {driverName} • Route: {originCity} ➔ {destinationCity}
                </div>
                <div className="text-teal-600 font-semibold text-[11px]">
                  {isHouseToHouse ? '✓ House-to-House Collection & Dropoff Enabled' : 'Station to Station'}
                </div>
              </div>
            </div>
          )}

          {/* Feedback error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <span>Continue to Step {step + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl shadow-teal-600/30 flex items-center gap-2 transition active:scale-95"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Register Shuttle Route</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverShuttleUploadModal;
