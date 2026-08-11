import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    location: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    occupation: {
        type: String,
        default: "",
    },
    interests: {
        type: String,
        default: "",
    },
    website: {
        type: String,
        default: "",
    },
    socialMedia: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    favorites: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
        addedAt: { type: Date, default: Date.now }
    }],
    favoriteServices: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        addedAt: { type: Date, default: Date.now }
    }],
    favoriteHelpers: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper' },
        addedAt: { type: Date, default: Date.now }
    }],
    favoriteEvents: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
        addedAt: { type: Date, default: Date.now }
    }],
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    isPromoted: {
      type: Boolean,
      default: false
    },
    promotionPackage: {
      type: String,
      enum: ['standard', 'premium', null],
      default: null
    },
    promotionExpiry: {
      type: Date
    },
    helpers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Helper'
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],

    // Face Recognition Data
    faceData: {
        imageUrl: String,
        descriptor: [Number],
        verified: { type: Boolean, default: false },
        detectedAt: Date,
        method: { type: String, enum: ['camera', 'upload'], default: 'camera' }
    },

    // Add host rating fields
    likeCount: {
        type: Number,
        default: 0
    },
    dislikeCount: {
        type: Number,
        default: 0
    },

    // Add user actions tracking
    ratedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            enum: ['like', 'dislike'],
            required: true
        },
        ratedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    kycStatus: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'rejected'],
        default: 'unverified'
    },
    idDocumentUrl: {
        type: String,
        default: ""
    },
    liveSelfieUrl: {
        type: String,
        default: ""
    },
    coverPhoto: {
        type: String,
        default: ""
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    listingLimit: {
        type: Number,
        default: 1
    },
    contacts: [{
        type: String,
    }],
    accessContacts: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    otpAttempts: {
        type: Number,
        default: 0,
    },
    otpPurpose: {
        type: String,
        enum: ['verify', 'reset', null],
        default: null,
    },
    termsAcceptedAt: {
        type: Date,
    },
    privacyAcceptedAt: {
        type: Date,
    },
    plannerTasks: [{
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
