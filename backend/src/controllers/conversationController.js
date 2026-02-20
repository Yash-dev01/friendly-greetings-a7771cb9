import Conversation from '../models/Conversation.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'fullName email avatarUrl role company position')
      .sort({ lastMessageTime: -1 });

    res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'fullName email avatarUrl role company position')
      .populate('messages.senderId', 'fullName avatarUrl');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;

    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId] },
    });

    if (existingConversation) {
      return res.json({
        success: true,
        data: existingConversation,
      });
    }

    const conversation = await Conversation.create({
      participants: [req.user._id, otherUserId],
      messages: [],
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'fullName email avatarUrl role company position');

    res.status(201).json({
      success: true,
      data: populatedConversation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }

    const message = {
      senderId: req.user._id,
      content,
    };

    conversation.messages.push(message);
    conversation.lastMessage = content.substring(0, 100);
    conversation.lastMessageTime = new Date();

    await conversation.save();

    const updatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'fullName email avatarUrl role company position')
      .populate('messages.senderId', 'fullName avatarUrl');

    res.status(201).json({
      success: true,
      data: updatedConversation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    conversation.messages.forEach((message) => {
      if (message.senderId.toString() !== req.user._id.toString() && !message.readAt) {
        message.readAt = new Date();
      }
    });

    await conversation.save();

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
