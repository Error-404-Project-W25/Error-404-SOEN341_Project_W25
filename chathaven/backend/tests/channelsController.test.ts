import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from '../src/app';
import { Express } from 'express';
import { Channel } from '../src/models/channelsModel';
import { Conversation } from '../src/models/conversationsModel';

/*
    === Testing Channels APIs ===
*/
describe('channels', () => {
  /*
        Run the app before running the tests
    */
  let channelIdToDelete: string | undefined;
  let server: Express;
  beforeAll(async () => {
    server = app as Express;
    await startServer();

    // Create channel for testing
    const channel = await Channel.create({
      channelId: 'JEST-TESTCHANNELID-123',
      name: 'JEST CHANNEL',
      description: 'JEST CHANNEL DESCRIPTION',
      teamId: 'JEST-TESTTEAMID-123',
      members: [],
      conversationId: 'JEST-TESTCHANNEL-CONVERSATIONID-123'
    })
    console.log('Test channel created:', channel.channelId);
  });

  /*
        Cleanup after the tests:
        Remove the user that was added during addUserToChannel, and
        Delete the channel and conversation that was created during createChannel.
    */
  afterAll(async () => {
    try {

      // Remove the member
      const removeResponse = await request(server).post('/channels/removeMember').send({
        channelId: 'JEST-TESTCHANNELID-123',
        memberId: 'JEST-TESTUSERID-123',
      });
      if (removeResponse.body.success === true) {
        console.log('User removed from channel in afterAll');
      } else {
        console.log('User could not be removed from channel in afterAll');
      }
      
      // Delete the channel and its conversation
      if (channelIdToDelete) {
        const deleteResponse = await request(server).delete('/channels/delete').send({
          channelId: channelIdToDelete,
        });
        if (deleteResponse.body.success === true) {
          console.log(`Channel ${channelIdToDelete} and conversation deleted in afterAll`);
        } else {
          console.error(`Channel ${channelIdToDelete} and conversation could not be deleted in afterAll`);
        }
      } else {
        console.error("ChannelIdToDelete is undefined.");
      }

      // quick fix:
      await Channel.deleteMany({ members: ['JEST-TESTUSERID-456'] });
      await Channel.deleteMany({ members: [ null ] });
      await Channel.deleteOne({ channelId: 'JEST-TESTCHANNELID-123' });
      await Channel.deleteMany({ name: 'jest-create-channel' })
      await Conversation.deleteMany({ conversationName: 'jest-create-channel' })
    
    } catch (error) {
      console.error('Error: ', error);
    }
  });

  /*
      === Test createChannel() ===
  */
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

        console.log('created channel is: ', res.body.channelId);

        expect(res.statusCode).toEqual(201);
        expect(res.body.channelId).toBeTruthy(); // Will be a random value, check if exists

        channelIdToDelete = res.body.channelId; // Save the channel ID to delete in afterAll
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

  /*
      === Test addUserToChannel() ===
  */
  describe('addUserToChannel', () => {
    /*
        Test Case 1: The user is added successfully
        The team ID, channel ID, and user ID are provided, all exist in theDB and are exclusively used for testing.
        The expected result is a 201 status.
    */
    describe('given the user is added to the channel', () => {
      it('should return a 201', async () => {
        const userId = 'JEST-TESTUSERID-123';
        const teamId = 'JEST-TESTTEAMID-123';
        const channelId = 'JEST-TESTCHANNELID-123';

        const res = await request(server).post('/channels/addUser').send({
          userId: userId,
          teamId: teamId,
          channelId: channelId,
        });

        expect(res.statusCode).toEqual(201);
      });
    });

    /*
        Test Case 2: The user is not added to the channel
        No inputs are provided.
        The expected result is a 404 status.
    */
    describe('given the user is not added to the channel', () => {
      it('should return a 404', async () => {
        const res = await request(server).post('/channels/addUser').send({
          // Send nothing
        });

        expect(res.statusCode).toEqual(404);
      });
    });
  });

  /*
      === Test getChannelById() ===
  */
  describe('getChannelById', () => {
    /*
        Test Case 1: The channel ID exists
        A channel ID used exists in the database and used exlusively for testing.
        The expected result is a 200 status and the channel object.
    */
    describe('given the channel is found', () => {
      it('should return a 200 and the channel object', async () => {
        const channelId = 'JEST-TESTCHANNELID-123';
        const teamId = 'JEST-TESTTEAMID-123';

        const res = await request(server)
          .post('/channels/getChannelById')
          .send({
            teamId: teamId,
            channelId: channelId,
          });

        expect(res.statusCode).toEqual(200);
        expect(res.body.channel.name).toBe('JEST CHANNEL');
      });
    });

    /*
        Test Case 2: The channel is not found
        No inputs are provided.
        The expected result is a 404 status.
    */
    describe('given the channel is not found', () => {
      it('should return a 404', async () => {
        const res = await request(server)
          .post('/channels/getChannelById')
          .send({
            // Send nothing
          });

        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
