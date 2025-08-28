import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    description: String,
    stops: [{
      location: String,
      date: Date,
      events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      }],
      helpers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Helper'
      }],
      listings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
      }]
    }]
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;