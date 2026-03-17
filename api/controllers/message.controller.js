import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import { errorHandler } from '../utils/error.js';

export const sendMessage = async (req, res, next) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  try {
    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      content,
    });

    await newMessage.save();

    // Update conversation with last message info
    conversation.lastMessage = content;
    conversation.lastMessageSender = senderId;
    
    // Update unread count for receiver
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);

    await conversation.save();

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate('participants', 'username avatar email')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  try {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // Mark messages as read and reset unread count for current user
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
    const { conversationId } = req.params;
    try {
        await Conversation.findByIdAndDelete(conversationId);
        await Message.deleteMany({ conversationId });
        res.status(200).json('Conversation has been deleted');
    } catch (error) {
        next(error);
    }
}
