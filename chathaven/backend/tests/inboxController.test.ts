import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
import { Express } from 'express';
import { Channel } from '../src/models/channelsModel';
import { Inbox } from '../src/models/inboxModel'; 
import { after } from 'node:test';
import { User } from '../src/models/userModel';

/*
    === Testing inbox controller APIs ===
*/

describe('inbox', () => {
  let server: Express;
  let inviteIdToDelete: string | undefined;
  let requestIdToDelete: string | undefined;
  // Setup server
  beforeAll(async () => {
    server = app as Express;
    await startServer();

    //create a channel for testing 
    const channel = await Channel.create({
      channelId: 'JEST-TESTCHANNELID-123',
      name: 'JEST-CHANNELNAME-456',
      members: ['JEST-TESTUSERID-123'],
      conversationId: 'JEST-TESTCONVERSATIONID-123',
    });
  });
  afterAll(async () => {
    try{
    // cleanup after tests by removing the channel and inbox
    await Inbox.deleteOne({ inboxId: inviteIdToDelete });
    await Channel.deleteOne({ channelId: 'JEST-TESTCHANNELID-123' });
    } catch (error) {
      console.error('Error deleting inbox or channel:', error);
    }
    await User.findOneAndUpdate(
      {userId: 'JEST-TESTUSERID-456'},
      { $pull: { inbox: inviteIdToDelete } }
    ).exec();

    await User.findOneAndUpdate(
      {userId: 'JEST-TESTUSERID-123'},
      { $pull: { inbox: requestIdToDelete } }
    ).exec();
  });

  describe ('requestToJoin', () => {
    // test case for missing userId
    it ('it should return 404 when missing userId', async () => {
      const res = await request(server)
        .post('/inbox/request')
        .send({
          type: 'invite',
          userIdThatYouWantToAdd: "undefined",
          channelId: 'JEST-TESTCHANNELID-123',
        });
      expect(res.status).toBe(404);
    });

    // test case for missing channelId
    it ('it should return 404 when missing channelId', async () => {
      const res = await request(server)
        .post('/inbox/request')
        .send({
          type: 'invite',
          userIdThatYouWantToAdd: 'JEST-TESTUSERID-456',
          channelId: "undefined",
        });
      expect(res.status).toBe(404);
    });

    // test case for missing inbox type
    it ('it should return 404 when missing inbox type', async () => {
      const res = await request(server)
        .post('/inbox/request')
        .send({
          type: undefined,
          userIdThatYouWantToAdd: 'JEST-TESTUSERID-123',
          channelId: 'JEST-TESTCHANNELID-123',
        });

      expect(res.status).toBe(404);
    });

    // test case for successful invite request
    it ('it should return 201 when the invite request is created successfully', async () => {
      const res = await request(server)
        .post('/inbox/request')
        .send({
          type: 'invite',
          userIdThatYouWantToAdd: 'JEST-TESTUSERID-456',
          channelId: 'JEST-TESTCHANNELID-123',
        });

      inviteIdToDelete = res.body.inboxId; // Store the inbox ID for cleanup

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('The request to join has been created successfully');
    });


    // test case for successful request to join
    it ('it should return 201 when the request to join is created successfully', async () => {
      const res = await request(server)
        .post('/inbox/request')
        .send ({
          type: "request",
          userIdThatYouWantToAdd: "JEST-TESTUSERID-456",
          channelId: 'JEST-TESTCHANNELID-123',
        });
        requestIdToDelete = res.body.inboxId; // Store the inbox ID for cleanup
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('The request to join has been created successfully');
      });
  }); 

  /*
      === Test response function ===
  */
  describe ('responseToJoin', () => {
    

    // test case for successful invitation to join
    it ('it should return 200 when the response to join is created successfully', async () => {
      const res = await request(server)
        .post('/inbox/response')
        .send({
          // userIdInboxBelongsTo, inboxId, decision
          userIdInboxBelongsTo: 'JEST-TESTUSERID-456',
          inboxId: inviteIdToDelete,
          decision: 'accept',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('You have accepted. User added to channel successfully');
    });

    // test case to accept a request to join 
    it ('it should return 200 when the response to join is created successfully', async () => {
      const res = await request(server)
        .post('/inbox/response')
        .send({
          userIdInboxBelongsTo: 'JEST-TESTUSERID-123',
          inboxId: requestIdToDelete,
          decision: 'accept',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('You have accepted. User added to channel successfully');
    });
  }); 
});