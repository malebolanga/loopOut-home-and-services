import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const sendMessage = async (req, res, next) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) return next(errorHandler(404, 'User not found!'));


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
    if (!(conversation.unreadCount instanceof Map)) {
      conversation.unreadCount = new Map();
    }
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);

    await conversation.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('sendMessage error:', error);
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
    console.error('getConversations error:', error);
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
      if (!(conversation.unreadCount instanceof Map)) {
        conversation.unreadCount = new Map();
      }
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error('getMessages error:', error);
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

export const getOrCreateConversation = async (req, res, next) => {
  const { userId: receiverId } = req.params;
  const senderId = req.user.id;

  if (senderId === receiverId) {
    return next(errorHandler(400, 'You cannot message yourself!'));
  }

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) return next(errorHandler(404, 'User not found!'));


    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate('participants', 'username avatar email');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
      // Populate after creation
      conversation = await Conversation.findById(conversation._id).populate('participants', 'username avatar email');
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    next(error);
  }
};
