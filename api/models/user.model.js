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
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing' 
  }],
  services: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service' 
  }],
  helpers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Helper' 
  }],
  events: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  }],
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
    }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;