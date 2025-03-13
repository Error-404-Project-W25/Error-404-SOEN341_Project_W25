import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Inbox } from 'src/models/inboxModel';
import { User } from '../models/userModel';
import { Channel } from '../models/channelsModel';
import { io } from '../app';

/**
 * Request to join a channel
 * @param req type, userIdThatYouWantToAdd, channelId
 * @param res inboxId of the created inbox entry
 */
export const requestToJoin = async (req: Request, res: Response) => { 
    try {
        const{ type, userIdThatYouWantToAdd, channelId } = req.body
        const inboxId = uuidv4();

        // If invite: add to userThatYouWantToAdd's inbox
        if (type === "invite") {       
            const user = await User.findOne({ userId: userIdThatYouWantToAdd });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const newInboxEntry = new Inbox({
                inboxId: inboxId,
                type: type,
                channelId: channelId,
                userIdThatYouWantToAdd: userIdThatYouWantToAdd,
            });

            //user.inbox.push(newInboxEntry);
            //await user.save();

            res.status(201).json({
                message: 'The request to join has been created successfully',
                inboxId: newInboxEntry.inboxId,
            });
        } 

        // If request: add to channelId.owner's inbox
        else if (type === "request") {  
            const channel = await Channel.findOne({ channelId });
            if (!channel) {
                res.status(404).json({ error: 'Channel not found' });
                return;
            }
            const channelOwnerId = channel.members[0]; // first member of the channel is its creator
            
            const channelOwner = await User.findOne({ channelOwnerId });
            if (!channelOwner) {
                res.status(404).json({ error: 'Channel owner not found' });
                return;
            }

            const newInboxEntry = new Inbox({
                inboxId: inboxId,
                type: type,
                channelId: channelId,
                userIdThatYouWantToAdd: userIdThatYouWantToAdd,
            });

            //channelOwner.inbox.push(newInboxEntry);
            //await channelOwner.save();

            res.status(201).json({
                message: 'The request to join has been created successfully',
                inboxId: newInboxEntry.inboxId,
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