import mongoose from 'mongoose';

const goodsOrderSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Sell', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  message: { type: String, trim: true, maxlength: 500, default: '' },
  status: { type: String, enum: ['Requested', 'Accepted', 'Ready for Collection', 'Completed', 'Cancelled'], default: 'Requested' },
  statusHistory: [{ status: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  issueReports: [{
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['Item not as described', 'Collection problem', 'Safety concern', 'Other'], required: true },
    details: { type: String, trim: true, maxlength: 1000, required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

goodsOrderSchema.index({ buyer: 1, createdAt: -1 });
goodsOrderSchema.index({ seller: 1, createdAt: -1 });

export default mongoose.model('GoodsOrder', goodsOrderSchema);
