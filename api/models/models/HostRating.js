import mongoose from 'mongoose';

const hostRatingSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    ratings: {
        host_cleanliness: { type: Number, min: 1, max: 5 },
        host_communication: { type: Number, min: 1, max: 5 },
        staff: { type: Number, min: 1, max: 5 },
        location_rating: { type: Number, min: 1, max: 5 }
    },
    averageRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure one rating per user per host per listing
hostRatingSchema.index({ hostId: 1, userId: 1, listingId: 1 }, { unique: true });

// Calculate average rating before saving
hostRatingSchema.pre('save', function(next) {
    const ratings = Object.values(this.ratings).filter(rating => rating > 0);
    if (ratings.length > 0) {
        this.averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }
    next();
});

export default mongoose.model('HostRating', hostRatingSchema);