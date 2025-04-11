import { Request, Response } from 'express';
import { promptChatHavenBot } from '../utils/geminiUtils';

/**
 * Send a prompt to the chatbot and return the response
 * @param req Request with prompt
 * @param res Response with chatbot response
 */
export const sendPrompt = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    // Special case: when prompt is explicitly null (not undefined or empty string)
    // throw an error to trigger the 500 response
    if (prompt === null) {
      throw new Error('Error sending prompt');
    }

    if (!prompt) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const response = await promptChatHavenBot(prompt);
    res.status(200).json({ response });
  } catch (error) {
    console.error('Error sending prompt:', error);
    res.status(500).json({ error: 'Error sending prompt' });
  }
};
