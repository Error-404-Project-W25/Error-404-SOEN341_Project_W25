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
    const { content, senderId, conversationId, quotedMessageId } = req.body;

    if (!content || !conversationId || !senderId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const messageId: string = uuidv4();
    const time: string = new Date().toISOString();

    const newMessage = new Messages({
      messageId: messageId,
      content: content,
      sender: senderId,
      time: time,
    });

    if (quotedMessageId) {
      newMessage.quotedMessageId = quotedMessageId;
    }

    await newMessage.save();

    const conversation = await Conversation.findOne({ conversationId });
    if (conversation) {
      conversation.messages.push(newMessage as IMessage);
      await conversation.save();
      io.to(conversationId).emit('sendMessage', newMessage as IMessage);
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

      // Remove quotedMessageId field from messages that quote the deleted message
      conversation.messages.forEach((message) => {
        if (message.quotedMessageId === messageId) {
          message.quotedMessageId = '';
        }
      });

      await conversation.save();
      io.to(conversationId).emit('deleteMessage', messageId);
    }

    const message = await Messages.findOne({ messageId });
    if (message) {
      await message.deleteOne();
    }

    // Search for any messages that quote the deleted message
    const messages = await Messages.find({ quotedMessageId: messageId });
    if (messages) {
      messages.forEach(async (message) => {
        // Remove quotedMessageId field
        delete message.quotedMessageId;
        await message.save();
      });
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

/**
 * Search messages in a conversation
 * @param req string conversationId, string searchQuery, object filters
 * @param res returns array of messages
 */
export const searchDirectMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId, searchQuery, filters } = req.body;

    if (!conversationId) {
      res.status(400).json({ error: 'Missing conversation ID' });
      return;
    }

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    let messages = conversation.messages;

    if (searchQuery) {
      messages = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filters) {
      console.log('Received filters:', filters);
      
      // Before Date: Show messages BEFORE (but not including) the selected date
      if (filters.beforeDate) {
        const beforeDate = new Date(filters.beforeDate);
        beforeDate.setHours(0, 0, 0, 0); // Start of the selected day
        messages = messages.filter(msg => new Date(msg.time) < beforeDate);
        console.log(`Filtered to ${messages.length} messages before ${beforeDate.toISOString()}`);
      } 
      
      // After Date: Show messages AFTER (but not including) the selected date
      if (filters.afterDate) {
        const afterDate = new Date(filters.afterDate);
        afterDate.setHours(23, 59, 59, 999); // End of the selected day
        messages = messages.filter(msg => new Date(msg.time) > afterDate);
        console.log(`Filtered to ${messages.length} messages after ${afterDate.toISOString()}`);
      }
      
      // During Date: Show messages ONLY from the selected date
      if (filters.duringDate) {
        const duringDateStr = filters.duringDate; // Should be in YYYY-MM-DD format
        
        const startOfDay = new Date(`${duringDateStr}T00:00:00`);
        const endOfDay = new Date(`${duringDateStr}T23:59:59.999`);
        
        messages = messages.filter(msg => {
          const msgDate = new Date(msg.time);
          return msgDate >= startOfDay && msgDate <= endOfDay;
        });
        console.log(`Filtered to ${messages.length} messages during ${duringDateStr}`);
      }
      
      if (!filters.afterDate && filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        messages = messages.filter(msg => 
          new Date(msg.time) >= fromDate
        );
      }
      
      if (!filters.beforeDate && filters.toDate) {
        const toDate = new Date(filters.toDate); 
        messages = messages.filter(msg => 
          new Date(msg.time) <= toDate
        );
      }
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Error searching messages' });
  }
};
