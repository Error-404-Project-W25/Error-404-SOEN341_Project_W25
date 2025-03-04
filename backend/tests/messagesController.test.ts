import { describe, it, expect, beforeAll } from '@jest/globals';
import * as request from 'supertest'; /*ensures compatibility with the TypeScript compiler*/
import { app, startServer } from "../src/app";
import { Express } from 'express';

/*
    === Testing Messages APIs ===
*/
describe('messages', () => {

  /*
      Run the app before running the tests
  */
  let MessageIdToDelete: string | undefined;
  let server: Express;

  beforeAll(async () => {
    server = app as Express;
    await startServer();
  });

  /*
      Cleanup after the tests:
      Delete the message that was created during sendMessage.
  */
  afterAll(async () => {
    try {
      if (MessageIdToDelete) {
        await request(server).delete('/messages')
          .send({
            conversationId: "JEST-CONVERSATION-123",
            messageId: MessageIdToDelete
          });
        console.log("Message deleted in afterAll, id: ", MessageIdToDelete);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  });

  /*
      === Test sendMessage() ===
  */


  /*
          === Test deleteMessage() ===
      */


  /*
      === Test getMessages() ===
  */


});
