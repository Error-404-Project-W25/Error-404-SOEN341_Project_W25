import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
import { Express } from 'express';


/*
    === Testing Chatbot APIs ===
*/
describe('chatbot', () => {
  let server: Express;

  // Setup the server before tests
  beforeAll(async () => {
    server = app as Express;
    await startServer();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  // Cleanup after tests
  afterAll(async () => {
    // Any cleanup logic if needed --> if any DB manipulation
  });


/*
    === Testing sendMessage() ===
*/
  describe('sendPrompt', () => {

    // Test case to check missing required fields
    describe('given missing required fields', () => {
      it('should return 400', async () => {
        const res = await request(server)
          .post('/chatbot/prompt')
          .send({});

        expect(res.status).toEqual(400);
        expect(res.body.error).toBe('Missing required fields');
        console.log('Error:', res.body.error);
      });
    })


    // Test case to check successful response
    describe('given all required fields are provided', () => {
      it('should return 200', async () => {
        const res = await request(server)
          .post('/chatbot/prompt')
          .send({
            prompt: 'What is ChatHaven?',
          });

        expect(res.status).toEqual(200);
        expect(typeof res.body.response).toBe('string');
        expect(res.body.response).toContain('ChatHaven');
        console.log('Prompt sent successfully:', res.body.response);
      });
    });

      // Test case to check error sending
    describe('given an error sending prompt', () => {
      it('should return 500', async () => { //test skipped until implemented
        const res = await request(server)
          .post('/chatbot/prompt')
          .send({ prompt: null });

        expect(res.status).toEqual(500);
        expect(res.body.error).toBe('Error sending prompt');

        // If it doesn't fail, you can skip this case
        if (res.status === 500) {
          expect(res.body).toEqual({ error: 'Error sending prompt' });
        }
      });
    });
  });
});
