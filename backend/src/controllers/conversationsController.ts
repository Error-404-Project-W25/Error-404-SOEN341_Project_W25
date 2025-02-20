import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../models/conversationsModel';
import { io } from '../app';

/**
 * create a new conversation 
 * @param req conversationName, messages[]
 * @param res returns the new conversation
 */
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { conversationName, creatorId, addedUserId } = req.body;
    const conversationId: string = uuidv4();

    const newConversation = await new Conversation({
      conversationId: conversationId,
      conversationName: conversationName,
      messages: [],
    }).save();
    io.to(creatorId).emit('joinRoom', { conversationId });
    io.to(addedUserId).emit('joinRoom', { conversationId });
    res.status(201).json({ newConversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Error creating conversation' });
  }
}



/**
 * Getting the conversation with its id 
 * @param req conversationId
 * @param res returns the conversation
 */

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const conversationId: string = req.params.conversationId;
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    res.status(200).json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Error fetching conversation' });
  }
}