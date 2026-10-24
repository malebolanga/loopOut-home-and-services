import mongoose from 'mongoose';
import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import User from '../models/user.model.js';
import Helper from '../models/helper.model.js';
import Service from '../models/service.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

export const sendMessage = async (req, res, next) => {
  const { receiverId, content, isReference, referenceDetails, serviceContext, conversationId } = req.body;
  const senderId = req.user.id;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) return next(errorHandler(404, 'User not found!'));

    const sender = await User.findById(senderId);
    if (!sender) return next(errorHandler(404, 'Sender not found!'));

    // Determine if this message is a reference request
    const isRef = Boolean(
      isReference ||
      (content && (
        content.toLowerCase().includes('reference') ||
        content.toLowerCase().includes('recommend them') ||
        (content.toLowerCase().includes('booked') && content.toLowerCase().includes('before'))
      ))
    );

    let providerName = referenceDetails?.providerName || serviceContext?.name || '';
    let providerType = referenceDetails?.providerType || serviceContext?.type || 'domestic';
    let providerImage = referenceDetails?.providerImage || serviceContext?.image || '';
    let providerId = referenceDetails?.providerId || serviceContext?.id || '';

    // Auto-resolve domestic worker / service picture & details if name or ID exists but picture is missing
    if (providerId && !providerImage) {
      try {
        if (mongoose.Types.ObjectId.isValid(providerId)) {
          const helperDoc = await Helper.findById(providerId).select('name imageUrls type');
          if (helperDoc && helperDoc.imageUrls?.length > 0) {
            providerImage = helperDoc.imageUrls[0];
            if (!providerName) providerName = helperDoc.name;
            if (!providerType) providerType = helperDoc.type;
          } else {
            const serviceDoc = await Service.findById(providerId).select('name imageUrls type');
            if (serviceDoc && serviceDoc.imageUrls?.length > 0) {
              providerImage = serviceDoc.imageUrls[0];
              if (!providerName) providerName = serviceDoc.name;
              if (!providerType) providerType = serviceDoc.type;
            }
          }
        }
      } catch (lookupErr) {
        console.error('Error looking up provider by id:', lookupErr);
      }
    }

    if (providerName && !providerImage) {
      try {
        const cleanName = providerName.trim();
        const helperDoc = await Helper.findOne({ name: new RegExp(`^${cleanName}$`, 'i') }).select('name imageUrls type');
        if (helperDoc && helperDoc.imageUrls?.length > 0) {
          providerImage = helperDoc.imageUrls[0];
          if (!providerType) providerType = helperDoc.type;
          if (!providerId) providerId = helperDoc._id.toString();
        } else {
          const serviceDoc = await Service.findOne({ name: new RegExp(`^${cleanName}$`, 'i') }).select('name imageUrls type');
          if (serviceDoc && serviceDoc.imageUrls?.length > 0) {
            providerImage = serviceDoc.imageUrls[0];
            if (!providerType) providerType = serviceDoc.type;
            if (!providerId) providerId = serviceDoc._id.toString();
          }
        }
      } catch (lookupErr) {
        console.error('Error looking up provider by name:', lookupErr);
      }
    }

    const mergedRefDetails = isRef ? {
      providerName: providerName || 'Domestic Worker / Service',
      providerType: providerType || 'domestic',
      providerImage: providerImage || '',
      providerId: providerId || '',
      bookerName: referenceDetails?.bookerName || receiver.username,
      requesterName: sender.username,
      requesterAvatar: sender.avatar,
      requesterId: senderId,
    } : undefined;

    // Find or create conversation
    let conversation = null;
    if (conversationId) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) return res.status(400).json({ message: 'Invalid conversation.' });
      conversation = await Conversation.findOne({ _id: conversationId, participants: { $all: [senderId, receiverId] } });
      if (!conversation) return res.status(403).json({ message: 'You cannot send a message in this conversation.' });
    } else {
      conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        isReference: isRef,
        referenceDetails: mergedRefDetails,
        serviceContext: serviceContext || undefined,
      });
    } else {
      if (isRef && mergedRefDetails) {
        conversation.isReference = true;
        conversation.referenceDetails = {
          ...(conversation.referenceDetails || {}),
          ...mergedRefDetails,
        };
      }
      if (serviceContext) {
        conversation.serviceContext = {
          ...(conversation.serviceContext || {}),
          ...serviceContext,
        };
      }
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      content,
      isReference: isRef,
      referenceDetails: mergedRefDetails || conversation.referenceDetails,
      serviceContext: serviceContext || conversation.serviceContext,
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

    let notifType = isRef ? 'reference' : 'message';
    let notifTitle = isRef
      ? `Reference Request from ${sender.username}`
      : `New message from ${sender.username}`;
    let notifMessage = isRef
      ? (providerName
          ? `${sender.username} is asking for a reference regarding your experience with ${providerName}. Would you recommend them?`
          : `${sender.username} is asking for a reference regarding a domestic service you previously booked.`)
      : (content && content.length > 90 ? `${content.substring(0, 90)}...` : content);

    try {
      const notification = new Notification({
        userId: receiverId,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        data: {
          conversationId: conversation._id.toString(),
          messageId: newMessage._id.toString(),
          senderId: sender._id.toString(),
          senderName: sender.username,
          senderAvatar: sender.avatar,
          isReference: isRef,
          providerName: providerName || 'Domestic Worker / Service',
          providerType: providerType || 'domestic',
          providerImage: providerImage || '',
          providerId: providerId || '',
          bookerName: receiver.username,
          messageContent: content,
          ...(conversation.goodsOrderId ? { goodsOrderId: conversation.goodsOrderId, link: '/my-loopout' } : {}),
        },
      });

      await notification.save();
    } catch (notifErr) {
      console.error('Failed to create notification for message:', notifErr);
    }

    // Populate sender details for immediate display
    await newMessage.populate('sender', 'username avatar email');

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
      .populate('lastMessageSender', 'username avatar')
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
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username avatar email')
      .sort({ createdAt: 1 });

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

    // Also mark matching notifications for this conversation as read
    try {
      const convIdStr = conversationId.toString();
      const matchCriteria = [{ 'data.conversationId': convIdStr }];
      if (mongoose.Types.ObjectId.isValid(conversationId)) {
        matchCriteria.push({ 'data.conversationId': new mongoose.Types.ObjectId(conversationId) });
      }
      await Notification.updateMany(
        { userId, $or: matchCriteria, read: false },
        { $set: { read: true } }
      );
    } catch (notifUpdateErr) {
      console.error('Failed to mark notifications read for conversation:', notifUpdateErr);
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

export const getUnreadMessageCount = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const userConversations = await Conversation.find({
      participants: { $in: [userId] },
    }).select('_id');

    const conversationIds = userConversations.map((c) => c._id);
    if (conversationIds.length === 0) {
      return res.status(200).json({ unreadCount: 0 });
    }

    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      sender: { $ne: userId },
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('getUnreadMessageCount error:', error);
    next(error);
  }
};
