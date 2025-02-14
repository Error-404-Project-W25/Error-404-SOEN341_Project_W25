import { describe, test, it, expect } from '@jest/globals';
import request from "supertest";
import { app } from "../src/app";

/*
    Testing Teams APIs
*/
describe('teams', () => { 

    
   describe('getUserTeams', () => {
    /*
        Test Case 1: The user ID cannot be found
    */
        describe('given the user id cannot be found', () => {
            it("should return a 500", async () => {
                const userId = 'userId-doesnotexist-123' // random test userId
                
                const { statusCode } = await request(app).get(`/teams/user/${userId}`)
                
                expect( statusCode ).toBe( 500 );
            })
        })

    /*
        Test Case 2: The user ID can be found
    */
        describe('given the user id can be found', () => {
            it("should return all teams of which the user is a member", async () => {
                

            })
        })
   })
   

    /*
        Test getTeamById()
    */
    describe('getTeamById', () => { 

        /*
            Test Case 1: The team ID does not exist
        */
        describe('given the team does not exist', () => {
            it("should return a 404", async () => {
                const teamId = 'teamId-doesnotexist-123' // random test teamId
                
                const { statusCode } = await request(app).get(`/teams/getTeamById/${teamId}`)
                
                expect( statusCode ).toBe( 404 );
            });
        });

        /*
            Test Case 2: The team ID exists
        */
       describe('given the team does exist', () => {
            it("should return a 200 status and the team object", async () => {
                
                const teamId = "7c4fe90a-4331-4ea8-9918-85ab499ee8fd";
                const teamName = "team1";

                const res = await request(app).get(`/teams/getTeamById/${teamId}`)

                console.log('Response:', res.body.status);
                console.log('Status code:', res.body.team_name);
                
                expect( res.body.status ).toBe(200);
                expect( res.body.teams.team_name ).toBe(teamName);
                
            })
       });
            
    });

});