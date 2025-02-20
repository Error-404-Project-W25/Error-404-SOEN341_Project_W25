import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from "../src/app";
import { Express } from 'express';

/*
    === Testing Users APIs ===
*/
describe('users', () => {

    /*
        Run the app before running the tests
    */  
    let server: Express;
    beforeAll(async () => {
        server = app as Express;
        await startServer();
    });

    /*
        === Test getUserById() ===
    */
   describe ('getUserById', () => {

        /*
            Test Case 1: The user ID cannot be found
            A random user ID is used that does not exist in the database.
            The expected result is a 404 error.
        */
        describe('given the user id cannot be found', () => {
            it("should return a 404", async () => {

                const userId = "userId-doesnotexist-123"; 

                const res = await request(server).get(`/users/${userId}`);

                expect(res.statusCode).toEqual(404);
            });
        });

        /*
            Test Case 2: The user ID is found
            A user ID that exists in the database is used.
            The expected result is a 200 status and the user object.
        */
        describe('given the user id is found', () => {
            it("should return a 200 and the user object", async () => {

                const userId = "JEST-TESTUSERID-123"; 

                const res = await request(server).get(`/users/${userId}`);

                expect(res.status).toEqual(200);
                expect(res.body.user.username).toBe("JEST-USER1");
            });
        });
    });

    /*
        === Test getUserByUsername() ===
    */
    describe('getUserByUsername', () => {

        /*
            Test Case 1: The username cannot be found
            A random username is used that does not exist in the database.
            The expected result is a 404 error.
        */
        describe('given the username cannot be found', () => {
            it("should return an empty array", async () => {

                const username = "username-doesnotexist-123"; 

                const res = await request(server).get(`/users/search/${username}`);

                expect(res.body.users).toHaveLength(0); // returns empty array
                
            });
        });

        /*
            Test Case 2: The username is found
            A username that exists in the database is used.
            The expected result is a 200 status and the user object.
        */
        describe('given the username is found', () => {
            it("should return a 200 and array of matching IUsers", async () => {

                const username = "JEST-USER1"; 

                const res = await request(server).get(`/users/search/${username}`);

                expect(res.status).toEqual(200);
                expect(res.body.users).toHaveLength(1); // returns array of 1
            });
        });
    });
});