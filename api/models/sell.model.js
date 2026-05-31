import mongoose from 'mongoose';

const sellSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ['furniture', 'electronics', 'clothes', 'universities', 'books'],
      required: true,
    },
    imageUrls: { type: [String], required: true },
    address: { type: String, required: false },
    contact: { type: String, required: true },
    condition: { type: String, required: false }, // e.g., 'New', 'Used'
    bookAuthor: { type: String, required: false },
    bookYear: { type: String, required: false },
    bookUsageHistory: { type: String, required: false },
  },
  { timestamps: true }
);

const Sell = mongoose.model('Sell', sellSchema);
export default Sell;
