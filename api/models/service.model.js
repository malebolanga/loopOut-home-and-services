import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    creator: {
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
    reviews: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    comments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceComment'
    },
    
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
    }
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;