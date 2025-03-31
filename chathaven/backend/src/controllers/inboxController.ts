import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Inbox } from '../models/inboxModel';
import { User } from '../models/userModel';
import { Channel } from '../models/channelsModel';

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
            const channel = await Channel.findOne({ channelId });
            if (!channel) {
                res.status(404).json({ error: 'Channel not found' });
                return;
            }      
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
            newInboxEntry.save();

            user.inbox.push(newInboxEntry);
            await user.save();

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
            
            const channelOwner = await User.findOne({ userId: channelOwnerId });
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

            channelOwner.inbox.push(newInboxEntry);
            await channelOwner.save();

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
  try {
    const {userIdInboxBelongsTo, inboxId, decision } = req.body;
    const user = await User.findOne({ userId: userIdInboxBelongsTo });
    if (!user) {  
        res.status(404).json({ error: 'User not found' });
        return;
    }   
    const inboxEntry = user.inbox.find((entry) => entry.inboxId === inboxId);
    if (!inboxEntry) {
        res.status(404).json({ error: 'Inbox entry not found', user });
        return;
    }

    if (decision === 'accept') {
        // Add user to channel using the addUserToChannel function
        const channel = await Channel.findOne({ channelId: inboxEntry.channelId });
        if (!channel) {
            res.status(404).json({ error: 'Channel not found' });
            return;
        }
        channel.members.push(inboxEntry.userIdThatYouWantToAdd);
        await channel.save();
        user.inbox = user.inbox.filter((entry) => entry.inboxId !== inboxId);
        await user.save();
        res.status(201).json({ success: true, message: 'You have accepted. User added to channel successfully' });
      } else {
        // delete the inbox entry from user 
        user.inbox = user.inbox.filter((entry) => entry.inboxId !== inboxId);
        await user.save();
        res.status(201).json({ success: true,  message: 'You have refused. Inbox entry deleted successfully' });
        }
    
        
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({
      success: false,
      error: 'Failed response',
      details: errorMessage,
    });
    console.error('Failed response', errorMessage);
  } 
}