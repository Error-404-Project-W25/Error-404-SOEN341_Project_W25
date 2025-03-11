import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../models/conversationsModel';
import { User } from '../models/userModel';
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
};

/**
 * create a new direct message conversation
 * @param req conversationName, creatorId, addedUserId
 * @param res returns the new conversation
 */
export const createDirectMessages = async (req: Request, res: Response) => {
  try {
    const { conversationName, creatorId, addedUserId } = req.body;
    const conversationId: string = uuidv4();

    const newConversation = await new Conversation({
      conversationId: conversationId,
      conversationName: conversationName,
      messages: [],
    }).save();

    // Fetch the users
    const creator = await User.findOne({ userId: creatorId });
    const addedUser = await User.findOne({ userId: addedUserId });

    if (creator && addedUser) {
      // Add conversationId to the directMessages array of both users
      creator.directMessages.push(conversationId);
      addedUser.directMessages.push(conversationId);

      // Save the updated user documents
      await creator.save();
      await addedUser.save();
    }

    io.to(creatorId).emit('joinRoom', { conversationId });
    io.to(addedUserId).emit('joinRoom', { conversationId });
    res.status(201).json({ newConversation });
  } catch (error) {
    console.error('Error creating direct messages:', error);
    res.status(500).json({ error: 'Error creating direct messages' });
  }
};

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
};

/**
 * Delete the conversation with its id
 * @param req conversationId
 * @param res returns boolean (true or false)
 */
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    //const { conversationId } = req.body;

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      console.error({ error: 'Conversation not found' });
      return false;
    }

    // delete the conversation from the database
    await conversation.deleteOne();
    return true;

  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('Failed to delete conversation:', errorMessage);
    return false;
  }
};
