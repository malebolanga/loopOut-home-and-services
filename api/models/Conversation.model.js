import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isReference: {
      type: Boolean,
      default: false,
    },
    referenceDetails: {
      providerName: { type: String },
      providerType: { type: String },
      providerImage: { type: String },
      providerId: { type: String },
      bookerName: { type: String },
      requesterName: { type: String },
      requesterAvatar: { type: String },
      requesterId: { type: String },
    },
    serviceContext: {
      id: { type: String },
      name: { type: String },
      title: { type: String },
      type: { type: String },
      image: { type: String },
      category: { type: String },
      price: { type: Number },
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
