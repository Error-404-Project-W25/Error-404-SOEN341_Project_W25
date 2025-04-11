import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
import { Express } from 'express';
import { Conversation } from '../src/models/conversationsModel'; // Import your Conversation model
import { User } from '../src/models/userModel'; 
/*
    === Testing Conversations APIs ===
*/

describe('conversations', () => {
  let conversationIdToDelete: string | undefined;
  let directMessageIdToDelete: string | undefined;
  let server: Express; 

  // Setup server

  beforeAll(async () => {

    server = app as Express;
    await startServer();

  // Create a conversation for testing
  const conversation = await Conversation.create({
    conversationId: 'JEST-TESTCONVERSATIONID-123',
    conversationName: 'JEST-CONVERSATIONNAME-456',
    messages: [] // Start with an empty message list
  });
  console.log('Conversation to "get" created:', conversation);

  });
    // Cleanup after tests by removing the conversation and messages
    afterAll(async () => {
      await Conversation.deleteOne({ conversationId: conversationIdToDelete });
      await Conversation.deleteOne({ conversationId: 'JEST-TESTCONVERSATIONID-123' });

      await Conversation.deleteOne({ conversationId: directMessageIdToDelete });
      console.log('Conversation deleted: JEST-TESTDIRECTMESSAGE-123');
      await User.findOneAndUpdate(
        { userId: 'JEST-TESTUSERID-123' },
        { $pull: { directMessages: directMessageIdToDelete } }
      ).exec();
      await User.findOneAndUpdate(
        { userId: 'JEST-TESTUSERID-456' },
        { $pull: { directMessages: directMessageIdToDelete } }
      ).exec();
      
  
    });

    // testing getConversations 
    describe ('getConversations', () => {
      // test case for missing conversation Id 
      describe ('given missing conversation Id', () =>{
        it ("it should return 404 when missing conversationId", async () => {
          const res = await request(server)
          .get('/conversations/undefined');

          expect(res.status).toBe(404);
          expect(res.body).toEqual({ error: 'Conversation not found' });
        });
      });
    }); 

    //test case for conversation not found 
    describe ('given conversation not found', () => {
      it ("it should return 404 when conversation not found", async () => {
        const res = await request(server)
        .get('/conversations/conversationId-doesnot-exist-123');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Conversation not found' });
      });
    });

    // test case for conversation found
    describe ('given conversation found', () => {
      it ("it should return 200 when conversation found", async () => {
        const res = await request(server)
        .get('/conversations/JEST-TESTCONVERSATIONID-123');

        expect(res.status).toBe(200);
        expect(res.body.conversation.conversationName).toEqual('JEST-CONVERSATIONNAME-456');
      });
    });


    // testing createConversation
    describe ('createConversation', () => {
      /*
      Test case 1: The conversation is created successfully
      A conversation name and user ID are provided.
      The expected result is a 201 status and the new conversation object.
      */
      describe('given the conversation is created successfully', () => {
        it('should return a 201 status and the new conversation object', async () => {
          const conversationName = 'JEST-TESTCONVERSATIONNAME-123';
          const creatorId = 'JEST-TESTUSERID-123';
          const addedUserId = 'JEST-TESTUSERID-456';

          const res = await request(server).post('/conversations/create').send({ 
            conversationName: conversationName, 
            creatorId: creatorId,
            addedUserId: addedUserId 
          });

          expect(res.status).toEqual(201);
          expect(res.body.newConversation.conversationId).toBeTruthy();
          conversationIdToDelete = res.body.newConversation.conversationId; // Store the conversation ID for cleanup
        });
      });

      /*
      Test case 2: The conversation is not created
      No inputs are provided.
      The expected result is a 404 status.
      */
      describe('given the conversation is not created', () => {
        it('should return a 500 status', async () => {
          const res = await request(server).post('/conversations/create').send({
            // Send nothing
          });

          expect(res.status).toEqual(500);
        });
      });
    });

    // testing createDirectMessages
    describe ('createDirectMessages', () => {
      /*
      Test case 1: The direct messsage conversation is created successfully
      A conversation name and user ID are provided.
      The expected result is a 201 status and the new conversation object.
      */ 
      describe ('given the direct message conversation is created successfully', () => {
        it ('should return a 201 status and the new conversation object', async () => {
          const conversationName = 'JEST-TESTDIRECTMESSAGE-123';
          const creatorId = 'JEST-TESTUSERID-123';
          const addedUserId = 'JEST-TESTUSERID-456';

          const res = await request(server)
            .post('/conversations/createDirectMessages')
            .send({ 
              conversationName: conversationName,
              creatorId: creatorId,
              addedUserId: addedUserId 
            });
  
          expect(res.status).toEqual(201);
          expect(res.body.newConversation.conversationId).toBeTruthy();
          directMessageIdToDelete = res.body.newConversation.conversationId; // Store the conversation ID for cleanup
        });
      });

      /*
      Test case 2: The direct message conversation is not created
      No inputs are provided.
      The expected result is a 404 status.
      */
      describe ('given missing conversation Id', () =>{
        it ("it should return 500 when missing conversationId", async () => {
          const res = await request(server)
          .post('/conversations/createDirectMessages').send({
            // Send nothing
          });

          expect(res.status).toEqual(500);
          expect(res.body).toEqual({ error: 'Error creating direct messages' });
        });
      });
    });

  });