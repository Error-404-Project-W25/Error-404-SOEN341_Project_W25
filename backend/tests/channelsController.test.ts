import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
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
    afterAll(async () => {
        
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
            it("should return a 201 and the channel_id of the created channel", async () => {

                const creator_id = "JEST-TESTUSERID-123";
                const team_id = "JEST-TESTTEAMID-123";
                const channelName = "jest-create-channel";
                const channelDescription = "jest channel description";

                const res = await request(server).post('/channels/create')
                    .send({
                        creator_id: creator_id,
                        team_id: team_id,
                        channelName: channelName,
                        channelDescription: channelDescription
                    });
                
                expect(res.statusCode).toEqual(201);
                expect(res.body.channel_id).toBeTruthy(); // Will be a random value, check if exists
            
            });
        });

        /*
            Test Case 2: The team ID cannot be found
            No inputs are provided.
            The expected result is a 404 error.
        */
       describe('given the channel is not created successfully', () => {
            it("should return a 404", async () => {
               
                const res = await request(server).post('/channels/create')
                    .send({
                        // Send nothing
                    })
                                
                    expect(res.statusCode).toEqual(404);

            });
       });
    });

    describe('addUserToChannel', () => {    
        /*
            Test Case 1: The user is added successfully
            The team ID, channel ID, and user ID are provided, all exist in theDB and are exclusively used for testing.
            The expected result is a 201 status.
        */
        describe('given the user is added to the channel', () => {
            it("should return a 201", async () => {
                
                const user_id = "JEST-TESTUSERID-123";
                const team_id = "JEST-TESTTEAMID-123";
                const channel_id = "JEST-TESTCHANNELID-123";

                const res = await request(server).post('/channels/addUser')
                    .send({
                        user_id: user_id,
                        team_id: team_id,
                        channel_id: channel_id
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
            it("should return a 404", async () => {
                
                const res = await request(server).post('/channels/addUser')
                    .send({
                        // Send nothing
                    })
                                
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
            it("should return a 200 and the channel object", async () => {
                
                const channel_id = "JEST-TESTCHANNELID-123";
                const team_id = "JEST-TESTTEAMID-123";

                const res = await request(server).post('/channels/getChannelById')
                    .send({
                        team_id: team_id,
                        channel_id: channel_id
                    });
                
                expect(res.statusCode).toEqual(200);
                //expect(res.body.channel.channelName).toBe("JEST-TESTCHANNELID-123");

            });
        });

        /*
            Test Case 2: The channel is not found
            No inputs are provided.
            The expected result is a 404 status.
        */
        describe('given the channel is not found', () => {
            it("should return a 404", async () => {
                
                const res = await request(server).post('/channels/getChannelById')
                    .send({
                        // Send nothing
                    })
                                
                    expect(res.statusCode).toEqual(400);

            });
        });
    });


});