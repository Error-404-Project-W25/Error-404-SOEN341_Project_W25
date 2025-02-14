
import supertest from "supertest";
import { Request, Response, NextFunction } from 'express';
import { BackendService } from "../../frontend/src/services/backend.service";
import { app } from '../src/app';
const request = require('supertest');


/*
    Testing Teams APIs
*/
describe('teams', () => { 

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
                
                await request(app)
                    .get(`/teams/getTeamById/${teamId}`)
                    .expect(404);
            });
        });

        /*
            Test Case 2: The team ID exists
        
       describe('given the team does exist', () => {
            it("should return a 200 status and the team", async () => {
                //const team = await backendService.createTeam(testTeam);

                const teamId = "7c4fe90a-4331-4ea8-9918-85ab499ee8fd";

                const { body, statusCode } = await request(app)
                    .get(`/teams/getTeamById/${teamId}`)
                    .expect(200);
            })
       })
            */
    });
});