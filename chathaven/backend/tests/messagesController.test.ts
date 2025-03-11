import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
import { Express } from 'express';
import { Conversation } from '../src/models/conversationsModel'; // Import your Conversation model
import { Messages } from '../src/models/messagesModel'; // Import your Messages model

/*
    === Testing Messages APIs ===
*/
describe('messages', () => {

  let server: Express;

  // Setup the server and create conversation and message before tests
  beforeAll(async () => {
    server = app as Express;
    await startServer();

    // Create a conversation for testing
    const conversation = await Conversation.create({
      conversationId: 'JEST-TESTCONVERSATIONID-123',
      conversationName: 'JEST-CONVERSATIONNAME-456',
      messages: [] // Start with an empty message list
    });
    console.log('Conversation created:', conversation);

    // Add a message to the conversation to test deletion
    await Messages.create({
      messageId: 'JEST-TESTMESSAGEID-123',
      content: 'Test message',
      sender: 'User1',
      time: new Date().toISOString()
    }).then(async (message) => {
      // Add the message to the conversation's messages
      conversation.messages.push(message);
      await conversation.save();
      console.log('Message created:', message);
      console.log('Message added to conversation:', conversation);
    });
  });

  // Cleanup after tests by removing the conversation and messages
  afterAll(async () => {
    await Conversation.deleteOne({ conversationId: 'JEST-TESTCONVERSATIONID-123' });
    console.log('Conversation deleted: JEST-TESTCONVERSATIONID-123');

    await Messages.deleteOne({ messageId: 'JEST-TESTMESSAGEID-123' });
    console.log('Message deleted: JEST-TESTMESSAGEID-123');
  });

//getMessages
  
  /*
      === Test sendMessage() ===
  */
  describe('sendMessage', () => {

    // Test case to check missing required fields
    describe('given missing required fields', () => {
      it("should return a 400 error", async () => {
        const res = await request(server)
          .post('/messages/send')
          .send({ content: "Hello", sender: "User1" }); // Missing conversationId

        expect(res.status).toEqual(400);
        expect(res.body.error).toBe('Missing required fields');
      });
    });

    // Test case for successfully sending a message
    describe('given all required fields are provided', () => {
      it("should return a 200 success", async () => {
        const res = await request(server)
          .post('/messages/send')
          .send({
            content: "Hello",
            sender: "User1",
            conversationId: "JEST-TESTCONVERSATIONID-123"
          });

        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
        console.log('Message sent successfully:', res.body);
      });
    });

    // Test case when the conversation does not exist
    describe('given the conversation does not exist', () => {
      it("should return a 200 but no action on the conversation", async () => {
        const res = await request(server)
          .post('/messages/send')
          .send({
            content: "Hello",
            sender: "User1",
            conversationId: "nonexistent-conversation"
          });

        expect(res.status).toEqual(200);  // Success even if the conversation doesn't exist
        expect(res.body.success).toBe(true);
        console.log('Attempted to send message to nonexistent conversation');
      });
    });
  });

  /*
      === Test deleteMessage() ===
  */
  describe('deleteMessage', () => {

    // Test case for missing required fields
    describe('given missing required fields', () => {
      it("should return a 400 error", async () => {
        const res = await request(server)
          .post('/messages/delete')
          .send({ conversationId: "JEST-TESTCONVERSATIONID-123" }); // Missing messageId

        expect(res.status).toEqual(400);
        expect(res.body.error).toBe('Missing required fields');
      });
    });

    // Test case for successfully deleting a message
    describe('given all required fields are provided', () => {
      it("should return a 200 success", async () => {
        const res = await request(server)
          .post('/messages/delete')
          .send({
            messageId: "JEST-TESTMESSAGEID-123",
            conversationId: "JEST-TESTCONVERSATIONID-123"
          });

        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
        console.log('Message deleted successfully:', res.body.success);

        // Verify the message has been deleted from the database
        const conversation = await Conversation.findOne({ conversationId: 'JEST-TESTCONVERSATIONID-123' });
        const message = conversation?.messages.find(m => m.messageId === 'JEST-TESTMESSAGEID-123');
        expect(message).toBeUndefined(); // The message should be undefined after deletion
        console.log('Message after deletion:', message);  // Should log 'undefined'
      });
    });
  });
});
