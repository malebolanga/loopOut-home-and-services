import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    near: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    kind: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: false,
    },
    cancel: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    security: {
      type: Boolean,
      required: true,
    },
    pets: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'cleaning', 
        'handyman',
        'maintenance', 
        'moving', 
        'landscaping', 
        'catering', 
        'other',
        'daycare',
        'schoolTransport',
        'carwash' // ✅ NEW: Car wash service type
      ]
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: [String],
      required: true,
    },
    rating: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 5 
    },
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceComment'
    }],
    
    // Daycare fields
    ageGroup: {
      type: String,
      required: function() { return this.type === 'daycare'; }
    },
    licenseNumber: {
      type: String,
      required: function() { return this.type === 'daycare'; }
    },
    capacity: {
      type: String,
      required: function() { return this.type === 'daycare'; }
    },
    meals: {
      type: Boolean,
      required: function() { return this.type === 'daycare'; }
    },
    
    // School transport fields
    vehicleType: {
      type: String,
      required: function() { return this.type === 'schoolTransport'; }
    },
    routeAreas: {
      type: String,
      required: function() { return this.type === 'schoolTransport'; }
    },
    childSeats: {
      type: Boolean,
      required: function() { return this.type === 'schoolTransport'; }
    },
    
    // ✅ NEW: Car Wash specific fields
    carWashPackages: {
      type: String, // Comma-separated: basic,premium,detailing,ceramic
      required: function() { return this.type === 'carwash'; }
    },
    vehicleTypes: {
      type: String, // sedan, suv, van, truck, motorcycle, all
      required: function() { return this.type === 'carwash'; }
    },
    additionalServices: {
      type: String, // Comma-separated additional services
      required: false
    },
    serviceDuration: {
      type: String, // e.g., "30-45 mins", "1-2 hours"
      required: function() { return this.type === 'carwash'; }
    },
    mobileService: {
      type: Boolean,
      default: false,
      required: function() { return this.type === 'carwash'; }
    },
    ecoFriendly: {
      type: Boolean,
      default: false,
      required: false
    },
    additionalPricing: {
      type: String, // Detailed pricing for different packages
      required: false
    },
    serviceList: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    bookingsCount: { type: Number, default: 0 },
    experience: {
      type: String, // e.g., "5 years", "Expert", "Junior"
      required: false
    },
    performers: [
      {
        name: { type: String, required: true },
        image: { type: String, required: true },
        experience: { type: String, required: true },
        rating: { type: Number, default: 5, min: 1, max: 5 },
        ratingsCount: { type: Number, default: 1 }
      }
    ],
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    operatingHours: {
        monday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
        tuesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
        wednesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
        thursday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
        friday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
        saturday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: false } },
        sunday: { open: { type: String, default: '08:00' }, close: { type: String, default: '19:00' }, closed: { type: Boolean, default: true } }
    }
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;