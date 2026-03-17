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
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
