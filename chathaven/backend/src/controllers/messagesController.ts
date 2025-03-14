import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Messages } from '../models/messagesModel';
import { Conversation } from '../models/conversationsModel';
import { IMessage } from '@shared/interfaces';
import { io } from '../app';

/**
 * Send a message to a conversation
 * @param req Message message, string conversationId
 * @param res returns boolean success
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, senderId, conversationId } = req.body;
    if (!content || !conversationId || !senderId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const messageId: string = uuidv4();
    const time: string = new Date().toISOString();

    const newMessage: IMessage = await new Messages({
      messageId: messageId,
      content: content,
      sender: senderId,
      time: time,
    }).save();

    const conversation = await Conversation.findOne({ conversationId });
    if (conversation) {
      conversation.messages.push(newMessage);
      await conversation.save();
      io.to(conversationId).emit('sendMessage', newMessage);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, messageId } = req.body;
    if (!conversationId || !messageId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const conversation = await Conversation.findOne({ conversationId });
    if (conversation) {
      conversation.messages = conversation.messages.filter(
        (message) => message.messageId !== messageId
      );
      await conversation.save();
      io.to(conversationId).emit('deleteMessage', messageId);
    }

    const message = await Messages.findOne({ messageId });
    if (message) {
      await message.deleteOne();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message' });
  }
};

/**
 * Get messages for a conversation
 * @param req string conversationId
 * @param res returns array of messages
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    console.log('Received conversationId:', conversationId);  // Debugging line

    if (!conversationId || conversationId === 'undefined') {
      res.status(400).json({ error: 'Missing conversationId' });
      return;
    }

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.status(200).json({ messages: conversation.messages });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
};
