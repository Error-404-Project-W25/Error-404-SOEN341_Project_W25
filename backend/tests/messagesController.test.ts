import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
import { Express } from 'express';

/*
    === Testing Messages APIs ===
*/
describe('messages', () => {

  let server: Express;
  let conversationId: string;
  let messageId: string| undefined;

  beforeAll(async () => {
    server = app as Express;
    await startServer();

    // Create a conversation for testing with the required 'conversationName'
    const res = await request(server).post('/conversations/create')
      .send({
        creatorId: 'TEST-CREATOR-ID',         // Make sure this is a valid ID
        conversationName: 'Test Conversation'  // Add a valid conversation name
      });
    conversationId = res.body.conversationId;
  });
  afterAll(async () => {
    // Cleanup any created conversation or messages if necessary
    try {
      await request(server).post('/messages/delete')
        .send({
          conversationId: conversationId,
          messageId: messageId
        });
      console.log("Message deleted after all tests.");

      // Delete the conversation after tests
      await request(server).delete('/conversations/delete')
        .send({
          conversationId: conversationId
        });
      console.log("Conversation deleted after all tests.");
    } catch (error) {
      console.error("Error in cleanup: ", error);
    }
  });

  /*
      === Test sendMessage() ===
  */
  describe('sendMessage', () => {

    /*
        Test Case 1: Missing required fields
        If any required field (content, sender, or conversationId) is missing, it should return a 400 status with an error.
    */
    describe('given missing required fields', () => {
      it("should return a 400 error", async () => {
        const res = await request(server)
          .post('/messages/send')
          .send({ content: "Hello", sender: "User1" }); // Missing conversationId

        expect(res.status).toEqual(400);
        expect(res.body.error).toBe('Missing required fields');
      });
    });

    /*
        Test Case 2: Successfully sending a message
        When all required fields are provided, it should return a 200 status with success.
    */
    describe('given all required fields are provided', () => {
      it("should return a 200 success", async () => {
        const res = await request(server)
          .post('/messages/send')
          .send({
            content: "Hello",
            sender: "User1",
            conversationId: "conversation-123"
          });

        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
      });
    });

    /*
        Test Case 3: Conversation not found
        If the conversation does not exist, it should still return a 200 status with success, but no actual message will be sent.
    */
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
      });
    });
  });

  /*
          === Test deleteMessage() ===
      */
  describe('deleteMessage', () => {

    /*
        Test Case 1: Missing required fields
        If conversationId or messageId is missing, it should return a 400 error.
    */
    describe('given missing required fields', () => {
      it("should return a 400 error", async () => {
        const res = await request(server)
          .post('/messages/delete')
          .send({ conversationId: "conversation-123" }); // Missing messageId

        expect(res.status).toEqual(400);
        expect(res.body.error).toBe('Missing required fields');
      });
    });

    /*
        Test Case 2: Successfully deleting a message
        When both fields are provided, it should return a 200 status with success.
    */
    describe('given all required fields are provided', () => {
      it("should return a 200 success", async () => {
        const res = await request(server)
          .post('/messages/delete')
          .send({
            messageId: "message-123",
            conversationId: "conversation-123"
          });

        expect(res.status).toEqual(200);
        expect(res.body.success).toBe(true);
      });
    });
  });

  /*
      === Test getMessages() ===
  */


});
