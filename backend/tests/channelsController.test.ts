import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from '../src/app';
import { Express } from 'express';

/*
    === Testing Channels APIs ===
*/
describe('channels', () => {
  /*
        Run the app before running the tests
    */
  let server: Express;
  beforeAll(async () => {
    server = app as Express;
    await startServer();
  });

  /*
        Cleanup after the tests:
    */
  afterAll(async () => {});

  describe('createChannel', () => {
    /*
            Test Case 1: The team ID cannot be found
            A random team ID is used that does not exist in the database.
            The expected result is a 404 error.
        */
    describe('given the channel is created successfully', () => {
      it('should return a 201 and the channelId of the created channel', async () => {
        const creatorId = 'JEST-TESTUSERID-123';
        const teamId = 'JEST-TESTTEAMID-123';
        const channelName = 'jest-create-channel';
        const channelDescription = 'jest channel description';

        const res = await request(server).post('/channels/create').send({
          creatorId: creatorId,
          teamId: teamId,
          channelName: channelName,
          channelDescription: channelDescription,
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body.channelId).toBeTruthy(); // Will be a random value, check if exists
      });
    });

    /*
            Test Case 2: The team ID cannot be found
            No inputs are provided.
            The expected result is a 404 error.
        */
    describe('given the channel is not created successfully', () => {
      it('should return a 404', async () => {
        const res = await request(server).post('/channels/create').send({
          // Send nothing
        });

        expect(res.statusCode).toEqual(404);
      });
    });
  });
});
