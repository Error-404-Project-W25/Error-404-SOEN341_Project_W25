import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../models/conversationsModel';
import { IMessage } from '@shared/interfaces';
import { io } from '../app';
import { User } from '../models/userModel';
import { Channel } from '../models/channelsModel';

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

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messageId: string = uuidv4();
    const time: string = new Date().toISOString();

    const newMessage: IMessage = {
      messageId: messageId,
      content: content,
      sender: senderId,
      time: time,
    };

    if (quotedMessageId) {
      newMessage.quotedMessageId = quotedMessageId;
    }

    conversation.messages.push(newMessage);
    await conversation.save();
    io.to(conversationId).emit('sendMessage', newMessage);
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
          message.quotedMessageId = undefined;
        }
      });

      await conversation.save();
      io.to(conversationId).emit('deleteMessage', messageId);
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

    console.log('--------- SEARCH REQUEST ---------');
    console.log('Search query:', searchQuery || 'none');
    console.log('Filters:', filters ? JSON.stringify(filters) : 'none');
    console.log('--------------------------------');

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
      
      // Only log timestamps if in development mode
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        console.log('First few message timestamps:');
        messages.slice(0, 5).forEach(msg => {
          try {
            const msgDate = new Date(msg.time);
            if (!isNaN(msgDate.getTime())) {
              console.log(`- ${msg.time} (${msgDate.toISOString()})`);
            } else {
              console.log(`- ${msg.time} (INVALID DATE)`);
            }
          } catch (err: Error | any) {
            console.log(`- ${msg.time} (ERROR: ${err.message})`);
          }
        });
      }
      
      // Before Date: Show messages BEFORE (but not including) the selected date
      if (filters.beforeDate) {
        try {
          const inputDate = filters.beforeDate.split('T')[0];
          console.log(`Processing beforeDate filter with date: ${inputDate}`);
          
          const beforeDate = new Date(`${inputDate}T00:00:00.000Z`);
          
          if (isNaN(beforeDate.getTime())) {
            console.log(`Invalid beforeDate: ${inputDate}`);
          } else {
            console.log(`Filtering messages before ${inputDate} (${beforeDate.toISOString()})`);
            
            const originalCount = messages.length;
            // Log some message times to debug
            messages.slice(0, 3).forEach((msg, i) => {
              try {
                const msgDate = new Date(msg.time);
                const isBeforeFilter = msgDate < beforeDate;
                console.log(`Sample message ${i}: ${msg.time} -> Compare: ${isBeforeFilter}`);
              } catch (err) {}
            });
            
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                // Only include valid dates in the comparison
                return !isNaN(msgDate.getTime()) && msgDate < beforeDate;
              } catch (err: Error | any) {
                console.log(`Error processing message time: ${msg.time}, ${err.message}`);
                return false;
              }
            });
            
            console.log(`Filtered from ${originalCount} to ${messages.length} messages before ${beforeDate.toISOString()}`);
          }
        } catch (err: Error | any) {
          console.log(`Error processing beforeDate filter: ${err.message}`);
        }
      }
      
      // After Date: Show messages AFTER (but not including) the selected date
      if (filters.afterDate) {
        try {
          const inputDate = filters.afterDate.split('T')[0];
          console.log(`Processing afterDate filter with date: ${inputDate}`);
          
          const afterDate = new Date(`${inputDate}T23:59:59.999Z`);
          
          if (isNaN(afterDate.getTime())) {
            console.log(`Invalid afterDate: ${inputDate}`);
          } else {
            console.log(`Filtering messages after ${inputDate} (${afterDate.toISOString()})`);
            
            const originalCount = messages.length;
            messages.slice(0, 3).forEach((msg, i) => {
              try {
                const msgDate = new Date(msg.time);
                const isAfterFilter = msgDate > afterDate;
                console.log(`Sample message ${i}: ${msg.time} -> Compare: ${isAfterFilter}`);
              } catch (err) {}
            });
            
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate > afterDate;
              } catch (err: Error | any) {
                console.log(`Error processing message time: ${msg.time}, ${err.message}`);
                return false;
              }
            });
            
            console.log(`Filtered from ${originalCount} to ${messages.length} messages after ${afterDate.toISOString()}`);
          }
        } catch (err: Error | any) {
          console.log(`Error processing afterDate filter: ${err.message}`);
        }
      }
      
      // During Date: Show messages ONLY from the selected date
      if (filters.duringDate) {
        try {
          const duringDateStr = filters.duringDate; // Should be in YYYY-MM-DD format
          
          const startOfDay = new Date(`${duringDateStr}T00:00:00`);
          const endOfDay = new Date(`${duringDateStr}T23:59:59.999`);
          
          if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
            console.log(`Invalid duringDate: ${duringDateStr}`);
          } else {
            console.log(`Filtering messages during ${duringDateStr} (${startOfDay.toISOString()} to ${endOfDay.toISOString()})`);
            
            const originalCount = messages.length;
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate >= startOfDay && msgDate <= endOfDay;
              } catch (err: Error | any) {
                console.log(`Error processing message time: ${msg.time}, ${err.message}`);
                return false;
              }
            });
            
            console.log(`Filtered from ${originalCount} to ${messages.length} messages during ${duringDateStr}`);
          }
        } catch (err: Error | any) {
          console.log(`Error processing duringDate filter: ${err.message}`);
        }
      }
      
      // Legacy support - keep these if needed
      if (!filters.afterDate && filters.fromDate) {
        try {
          const fromDate = new Date(filters.fromDate);
          if (!isNaN(fromDate.getTime())) {
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate >= fromDate;
              } catch {
                return false;
              }
            });
          }
        } catch (err: Error | any) {
          console.log(`Error processing fromDate filter: ${err.message}`);
        }
      }
      
      if (!filters.beforeDate && filters.toDate) {
        try {
          const toDate = new Date(filters.toDate);
          if (!isNaN(toDate.getTime())) {
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate <= toDate;
              } catch {
                return false;
              }
            });
          }
        } catch (err: Error | any) {
          console.log(`Error processing toDate filter: ${err.message}`);
        }
      }
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Error searching messages' });
  }
};

export const searchChannelMessages = async (req: Request, res: Response) => {
  try {
    const { channelId, searchQuery, filters } = req.body;

    console.log('--------- CHANNEL SEARCH REQUEST ---------');
    console.log('Channel ID:', channelId);
    console.log('Search query:', searchQuery || 'none');
    console.log('Filters:', filters ? JSON.stringify(filters) : 'none');
    console.log('--------------------------------');

    if (!channelId) {
      res.status(400).json({ error: 'Missing channel ID' });
      return;
    }

    // First, get the channel to access its conversationId
    const channel = await Channel.findOne({ channelId });
    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // Use the channel's conversationId to find messages
    const conversation = await Conversation.findOne({ conversationId: channel.conversationId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Start with all messages in the conversation
    let messages = conversation.messages;

    // Filter by search query
    if (searchQuery) {
      messages = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply username filter if provided
    if (filters && filters.username) {
      const usernameQuery = filters.username.toLowerCase();
      // Get all users matching the username
      const matchingUsers = await User.find({
        username: { $regex: usernameQuery, $options: 'i' }
      });
      
      if (matchingUsers.length > 0) {
        const userIds = matchingUsers.map(user => user.userId);
        messages = messages.filter(msg => userIds.includes(msg.sender));
      } else {
        // No matching users, so return no messages
        messages = [];
      }
    }
    
    // Date filters
    if (filters) {
      console.log('Received filters:', filters);
      
      // Only log timestamps if in development mode
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        console.log('First few message timestamps:');
        messages.slice(0, 5).forEach(msg => {
          try {
            const msgDate = new Date(msg.time);
            if (!isNaN(msgDate.getTime())) {
              console.log(`- ${msg.time} (${msgDate.toISOString()})`);
            } else {
              console.log(`- ${msg.time} (INVALID DATE)`);
            }
          } catch (err: Error | any) {
            console.log(`- ${msg.time} (ERROR: ${err.message})`);
          }
        });
      }
      
      // Before Date: Show messages BEFORE (but not including) the selected date
      if (filters.beforeDate) {
        try {
          const inputDate = filters.beforeDate.split('T')[0];
          console.log(`Processing beforeDate filter with date: ${inputDate}`);
          
          const beforeDate = new Date(`${inputDate}T00:00:00.000Z`);
          
          if (isNaN(beforeDate.getTime())) {
            console.log(`Invalid beforeDate: ${inputDate}`);
          } else {
            console.log(`Filtering messages before ${inputDate} (${beforeDate.toISOString()})`);
            
            const originalCount = messages.length;
            // Log some message times to debug
            messages.slice(0, 3).forEach((msg, i) => {
              try {
                const msgDate = new Date(msg.time);
                const isBeforeFilter = msgDate < beforeDate;
                console.log(`Sample message ${i}: ${msg.time} -> Compare: ${isBeforeFilter}`);
              } catch (err) {}
            });
            
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                // Only include valid dates in the comparison
                return !isNaN(msgDate.getTime()) && msgDate < beforeDate;
              } catch (err: Error | any) {
                console.log(`Error processing message time: ${msg.time}, ${err.message}`);
                return false;
              }
            });
            
            console.log(`Filtered from ${originalCount} to ${messages.length} messages before ${beforeDate.toISOString()}`);
          }
        } catch (err: Error | any) {
          console.log(`Error processing beforeDate filter: ${err.message}`);
        }
      }
      
      // After Date: Show messages AFTER (but not including) the selected date
      if (filters.afterDate) {
        try {
          const inputDate = filters.afterDate.split('T')[0];
          console.log(`Processing afterDate filter with date: ${inputDate}`);
          
          const afterDate = new Date(`${inputDate}T23:59:59.999Z`);
          
          if (isNaN(afterDate.getTime())) {
            console.log(`Invalid afterDate: ${inputDate}`);
          } else {
            console.log(`Filtering messages after ${inputDate} (${afterDate.toISOString()})`);
            
            const originalCount = messages.length;
            messages.slice(0, 3).forEach((msg, i) => {
              try {
                const msgDate = new Date(msg.time);
                const isAfterFilter = msgDate > afterDate;
                console.log(`Sample message ${i}: ${msg.time} -> Compare: ${isAfterFilter}`);
              } catch (err) {}
            });
            
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate > afterDate;
              } catch (err: Error | any) {
                console.log(`Error processing message time: ${msg.time}, ${err.message}`);
                return false;
              }
            });
            
            console.log(`Filtered from ${originalCount} to ${messages.length} messages after ${afterDate.toISOString()}`);
          }
        } catch (err: Error | any) {
          console.log(`Error processing afterDate filter: ${err.message}`);
        }
      }
      
      // During Date: Show messages ONLY from the selected date
      if (filters.duringDate) {
        try {
          const duringDateStr = filters.duringDate; // Should be in YYYY-MM-DD format
          
          const startOfDay = new Date(`${duringDateStr}T00:00:00`);
          const endOfDay = new Date(`${duringDateStr}T23:59:59.999`);
          
          if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
            console.log(`Invalid duringDate: ${duringDateStr}`);
          } else {
            console.log(`Filtering messages during ${duringDateStr} (${startOfDay.toISOString()} to ${endOfDay.toISOString()})`);
            
            const originalCount = messages.length;
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate >= startOfDay && msgDate <= endOfDay;
              } catch (err: Error | any) {
                console.log(`Error processing message time: ${msg.time}, ${err.message}`);
                return false;
              }
            });
            
            console.log(`Filtered from ${originalCount} to ${messages.length} messages during ${duringDateStr}`);
          }
        } catch (err: Error | any) {
          console.log(`Error processing duringDate filter: ${err.message}`);
        }
      }
      
      // Legacy support - keep these if needed
      if (!filters.afterDate && filters.fromDate) {
        try {
          const fromDate = new Date(filters.fromDate);
          if (!isNaN(fromDate.getTime())) {
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate >= fromDate;
              } catch {
                return false;
              }
            });
          }
        } catch (err: Error | any) {
          console.log(`Error processing fromDate filter: ${err.message}`);
        }
      }
      
      if (!filters.beforeDate && filters.toDate) {
        try {
          const toDate = new Date(filters.toDate);
          if (!isNaN(toDate.getTime())) {
            messages = messages.filter(msg => {
              try {
                const msgDate = new Date(msg.time);
                return !isNaN(msgDate.getTime()) && msgDate <= toDate;
              } catch {
                return false;
              }
            });
          }
        } catch (err: Error | any) {
          console.log(`Error processing toDate filter: ${err.message}`);
        }
      }
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error searching channel messages:', error);
    res.status(500).json({ error: 'Error searching channel messages' });
  }
};
