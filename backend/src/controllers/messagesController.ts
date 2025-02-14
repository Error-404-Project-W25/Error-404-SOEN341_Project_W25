import {Request, Response} from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Messages } from '../models/messagesModel';
import { Conversation } from '../models/conversationsModel';
import { IMessage } from '@shared/interfaces';

/**
 * Send a message to a conversation
 * @param req Message message, string conversationId 
 * @param res returns boolean success
 */

export const sendMessage = async (req: Request, res: Response) => {
  try { 
    const { content, sender, conversationId } = req.body; 
    if (!content || !conversationId || !sender) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const messageId: string = uuidv4();
    const time: string = new Date().toISOString();

    const newMessage: IMessage = await new Messages({
      messageId: messageId, 
      content: content, 
      sender: sender, 
      time: time
     }).save();

     const conversation = await Conversation.findOne({ conversationId });
     if (conversation){
      conversation.messages.push(newMessage);
     }
     res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
}

export const deleteMessage = async (req: Request, res: Response) => {
  try { 
    const { conversationId, messageId } = req.body;
    if (!conversationId || !messageId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const conversation = await Conversation.findOne({ conversationId });
    if (conversation){
      conversation.messages = conversation.messages.filter((message) => message.messageId !== messageId);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message' });
  }
}