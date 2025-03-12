import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/userModel';
import { Channel } from '../models/channelsModel';
import { io } from '../app';

/**
 * Request to join
 * @param req type, userIdThatYouWantToAdd, channelId
 * @param res success message or error message
 */
export const requestToJoin = async (req: Request, res: Response) => { 
    try {
        const{ type, userIdThatYouWantToAdd, channelId } = req.body

        // if invite: add to userThatYouWantToAdd inboxes
        if (type === "invite") {       
            const user = await User.findOne({ userIdThatYouWantToAdd });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            //user.inbox[] == newInboxEntry;

            res.status(201).json({
                success: true,
                message:
                  'The request to join has been created successfully',
            });
        } 

        // if request: add to channelId.owner's inbox
        else if (type === "request") {  
            const channel = await Channel.findOne({ channelId });
            if (!channel) {
                res.status(404).json({ error: 'Channel not found' });
                return;
            }
            const channelOwnerId = channel.members[0];
            
            const channelOwner = await User.findOne({ channelOwnerId });
            if (!channelOwner) {
                res.status(404).json({ error: 'Channel owner not found' });
                return;
            }
            //channelOwner.inbox[] == newInboxEntry;

            res.status(201).json({
                success: true,
                message:
                  'The request to join has been created successfully',
            });
        }

        else {
            res.status(404).json({ error: 'Invalid inbox entry type' });
            return;
        }

    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({
          success: false,
          error: 'Failed request to join',
          details: errorMessage,
        });
        console.error('Failed request to join', errorMessage);
    }
}





/**
 * Send response to inbox entry
 * @param req 
 * @param res 
 */
export const response = async (req: Request, res: Response) => { 


    
}