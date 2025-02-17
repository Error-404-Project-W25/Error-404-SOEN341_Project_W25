import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../models/conversationsModel';
import { IConversation } from '@shared/interfaces';

/**
 * Create a new conversation
 * @param req conversationName
 * @param res returns the new conversation's ID
 */
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { conversationName } = req.body;

    // Generate a UUID for the conversationId
    const conversationId: string = uuidv4();

    // Create a new conversation document
    const newConversation: IConversation = await new Conversation({
      conversationId,
      conversationName,
      messages: [],
    }).save();

    res.status(201).json({ conversationId });
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    res
      .status(500)
      .json({ error: 'Failed to create conversation', details: errorMessage });
    console.error('Failed to create conversation:', errorMessage);
  }
};

/**
 * Get a conversation by its ID
 * @param req conversationId
 * @param res returns an IConversation object
 */
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const conversationId: string = req.params.conversationId;
    const conversation: IConversation | null = await Conversation.findOne({ conversationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    res.status(200).json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Error fetching conversation' });
  }
};