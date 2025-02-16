import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
import { Express } from 'express';

/*
    === Testing Teams APIs ===
*/
describe('teams', () => { 

    /*
        Run the app before running the tests
    */
    let server: Express;
    beforeAll(async () => { 
        server = app as Express;
        await startServer();
    });

    /*
        === Test getUserTeams() ===
    */
   describe('getUserTeams', () => {
    /*
        Test Case 1: The user ID cannot be found
    */
        describe('given the user id cannot be found', () => {
            it("should return a 500", async () => {

                const userId = 'userId-doesnotexist-123'; // random test userId
                const res = await request(server).get(`/teams/user/${userId}`);
                expect(res.body.teams).toHaveLength(0); // teams will have an array of 0

            });
        });

    /*
        Test Case 2: The user ID can be found
    */
        describe('given the user id can be found', () => {
            it("should return all teams of which the user is a member", async () => {
                
                const userId = 'xi4Ug88Ft0TfLbKfpFbV1SaLiVw2';
                const res = await request(server).get(`/teams/user/${userId}`);
                expect(res.body.teams).toBeTruthy();

            });
        });
   });
   

    /*
        === Test getTeamById() ===
    */
    describe('getTeamById', () => { 

        /*
            Test Case 1: The team ID does not exist
        */
        describe('given the team does not exist', () => {
            it("should return a 404", async () => {

                const teamId = 'teamId-doesnotexist-123' // random test teamId
                const res = await request(server).get(`/teams/getTeamById/${teamId}`)
                expect(res.statusCode).toEqual(404);
                
            });
        });

        /*
            Test Case 2: The team ID exists
        */
       describe('given the team does exist', () => {
            it("should return a 200 status and the team object", async () => {
                
                const teamId = "7c4fe90a-4331-4ea8-9918-85ab499ee8fd";
                const teamName = "team1";

                const res = await request(server)
                    .get(`/teams/getTeamById/${teamId}`)
                
                expect(res.statusCode).toEqual(200);
                expect(res.body.team.team_name).toBe(teamName);
                
            });
       });
            
    });

    /*
        === Test createTeam() ===
    */
   describe('createTeam', () => { 

        /*
            Test Case 1: The team is created successfully
        */
        describe('given the team is created successfully', () => {
            it("should return the new ITeam's id", async () => {

                const teamName = 'team_jest';
                const description = 'jest desecription';
                const userId = 'xi4Ug88Ft0TfLbKfpFbV1SaLiVw2';

                const res = await request(server)
                    .post('/teams/create')
                    .send({
                        user_id: userId,
                        team_name: teamName,
                        description: description
                    })
                
                expect(res.statusCode).toEqual(201);
                expect(res.body.team_id).toBeTruthy();
                
            });
        });

        /*
            Test Case 2: The team is not created successfully
        */
        describe('given the team is not created successfully (missing team name)', () => {
            it("should return a 500", async () => {

                const description = 'team5 description';
                const userId = 'userId-doesnotexist-123';

                const res = await request(server)
                    .post('/teams/create')
                    .send({
                        user_id: userId,
                        description: description
                    })
                
                expect(res.statusCode).toEqual(500);
                
            });
        });
   });
   
    /*
        === Test addMemberToTeam() ===
    */
   describe('addMemberToTeam', () => {
    
            /*
                Test Case 1: The member is added successfully
            */
            describe('given the member is added successfully', () => {
                it("should return a success message", async () => {
    
                    const teamId = '7c4fe90a-4331-4ea8-9918-85ab499ee8fd';
                    const memberId = 'zLWYEqRcE3MZNwN8uaG1A5iCCp72';
    
                    const res = await request(server)
                        .post('/teams/addMember')
                        .send({
                            team_id: teamId,
                            member_id: memberId
                        })
                    
                    expect(res.body).toEqual('success');
                    
                });
            });
    
            /*
                Test Case 2: The member is not added successfully
            */
            describe('given the member is not added successfully', () => {
                it("should return a 500", async () => {
    
                    const memberId = '123456';
    
                    const res = await request(server)
                        .post('/teams/addMember')
                        .send({
                            member_id: memberId
                        })
                    
                    expect(res.statusCode).toEqual(404);
                    
                });
            });
    });

});