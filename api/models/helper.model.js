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
    type: {
        type: String,
        required: true,
        enum: ['domestic', 'errand', 'tutor', 'chef', 'beauty', 'tattoo', 'barber', 'photography', 'baker', 'sneaker', 'washingmat', 'animals'],
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
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HelperComment'
    }],
    serviceList: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true }
        }
    ]
}, { timestamps: true });

const Helper = mongoose.model('Helper', helperSchema);

export default Helper;