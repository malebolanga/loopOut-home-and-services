import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
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
        type: String,
        required: true,
    },
    host: {
        type: String,
        required: true,
    },
    providerType: {
        type: String,
        enum: ['individual', 'company'],
    },
    citizenship: {
        type: String,
    },
    type: {
        type: String,
        required: true,
        enum: ['domestic', 'handyman', 'errand', 'tutor', 'chef', 'beauty', 'tattoo', 'barber', 'photography', 'baker', 'sneaker', 'washingmat', 'animals'],
    },
    regularPrice: {
        type: Number,
        required: true,
    },
    kind: {
        type: String,
    },
    period: {
        type: String,
    },
    cancel: {
        type: String,
    },
    security: {
        type: Boolean,
        default: false,
    },
    pets: {
        type: Boolean,
        default: false,
    },
    bedrooms: {
        type: Number,
        default: 1,
    },
    bathrooms: {
        type: Number,
        default: 1,
    },
    // Fields for barber
    specializations: {
        type: String,
    },
    equipment: {
        type: String,
    },
    travelFee: {
        type: Number,
    },
    bookingNotice: {
        type: String,
    },
    additionalPricing: {
        type: String,
    },
    // Fields for photography
    style: {
        type: String,
    },
    sessionDuration: {
        type: String,
    },
    photoDelivery: {
        type: String,
    },
    // Fields for baker
    specialties: {
        type: String,
    },
    dietaryOptions: {
        type: String,
    },
    orderNotice: {
        type: String,
    },
    delivery: {
        type: Boolean,
        default: false,
    },
    // New fields for sneaker cleaner
    shoeTypes: {
        type: String,
    },
    cleaningMethod: {
        type: String,
    },
    turnaroundTime: {
        type: String,
    },
    // New fields for washing mat
    machineType: {
        type: String,
    },
    matTypes: {
        type: String,
    },
    dryingMethod: {
        type: String,
    },
    // New fields for animal care
    animalTypes: {
        type: String,
    },
    servicesOffered: {
        type: String,
    },
    experience: {
        type: String,
    },
    certifications: {
        type: String,
    },
    imageUrls: {
        type: Array,
        required: true,
    },
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5 
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HelperComment'
    }],
    serviceList: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true }
        }
    ],
    bookingsCount: { type: Number, default: 0 },
    responseRate: { type: String, default: 'Usually responds within an hour' },
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
  { timestamps: true });

const Helper = mongoose.model('Helper', helperSchema);

export default Helper;