import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, startServer } from '../src/app';
import { Express } from 'express';
import { Channel } from '../src/models/channelsModel';
import { Team } from '../src/models/teamsModel';

/*
    === Testing Teams APIs ===
*/
describe('teams', () => {
  /*
        Run the app before running the tests
    */
  let TeamIDToDelete: string | undefined;
  let GeneralChannelIdToDelete: string | undefined;
  let server: Express;
  beforeAll(async () => {
    server = app as Express;
    await startServer();
  });

  /*
        Cleanup after the tests:
        Remove the user that was added during addMemberToTeam, and
        Delete the team that was created during createTeam, and
        Delete the general channel and its conversation that was created during createTeam.
    */
  afterAll(async () => {
    try {
      await request(server).post('/teams/removeMember').send({
        teamId: 'JEST-TESTTEAMID-123',
        memberId: 'JEST-TESTUSERID-456',
      });
      console.log('User removed from team in afterAll');

      if (GeneralChannelIdToDelete) {
        const deleteChannelResponse = await request(server).delete('/channels/delete').send({
          channelId: GeneralChannelIdToDelete,
        });
        console.log('Delete channel response:', deleteChannelResponse.body);
      } else {
        console.error("GeneralChannelIdToDelete is undefined.");
      }

      if (TeamIDToDelete) {
        await request(server).delete('/teams/delete').send({
          teamId: TeamIDToDelete,
        });
        console.log('The team was deleted in afterAll, teamId: ', TeamIDToDelete);
      } else {
        console.error("TeamIDToDelete is undefined.");
      }
    


    } catch (error) {
      console.error('Error: ', error);
    }
  });

  /*
        === Test getUserTeams() ===
    */
  describe('getUserTeams', () => {
    /*
        Test Case 1: The user ID cannot be found
        A random user ID is used that does not exist in the database.
        The expected result is an empty array of teams.
    */
    describe('given the user id cannot be found', () => {
      it('should return a 500', async () => {
        const userId = 'userId-doesnotexist-123';

        const res = await request(server).get(`/teams/user/${userId}`);
        expect(res.body.teams).toHaveLength(0);
      });
    });

    /*
        Test Case 2: The user ID can be found
        The user ID is one that exists in the database & used exclusively for testing.
        The expected result is the one team (JEST-TESTTEAMID-123) that the user is a member of.
    */
    describe('given the user id can be found', () => {
      it('should return all teams of which the user is a member', async () => {
        const userId = 'JEST-TESTUSERID-123';

        const res = await request(server).get(`/teams/user/${userId}`);
        expect(res.body.teams[0].teamId).toBe('JEST-TESTTEAMID-123');
        expect(res.body.teams[0].teamName).toBe('TEST TEAM');
      });
    });
  });

  /*
        === Test getTeamById() ===
    */
  describe('getTeamById', () => {
    /*
            Test Case 1: The team ID does not exist
            The team ID used is a random one that does not exist in the database.
            The expected result is a 404 status.
        */
    describe('given the team does not exist', () => {
      it('should return a 404', async () => {
        const teamId = 'teamId-doesnotexist-123';

        const res = await request(server).get(`/teams/getTeamById/${teamId}`);
        expect(res.statusCode).toEqual(404);
      });
    });

    /*
            Test Case 2: The team ID exists
            The team ID used is one that exists in the database & used exclusively for testing.
            The expected result is a 200 status and the team object.
        */
    describe('given the team does exist', () => {
      it('should return a 200 status and the team object', async () => {
        const teamId = 'JEST-TESTTEAMID-123';
        const teamName = 'TEST TEAM';

        const res = await request(server).get(`/teams/getTeamById/${teamId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.team.teamName).toBe(teamName);
      });
    });
  });

  /*
        === Test createTeam() ===
    */
  describe('createTeam', () => {
    /*
            Test Case 1: The team is created successfully
            The team name, description, and user ID are provided.
            The expected result is a 201 status and the new team's ID.
        */
    describe('given the team is created successfully', () => {
      it("should return the new ITeam's id", async () => {
        const teamName = 'jest-create-team';
        const description = 'jest team description';
        const userId = 'JEST-TESTUSERID-456';

        const res = await request(server).post('/teams/create').send({
          userId: userId,
          teamName: teamName,
          description: description,
        });

        console.log('created team is: ', res.body);

        expect(res.statusCode).toEqual(201);
        expect(res.body.teamId).toBeTruthy(); // Will be a random value, check if exists

        TeamIDToDelete = res.body.teamId; // Save the team ID to delete in afterAll

        const teamObject = await Team.findOne({ teamId: TeamIDToDelete });
        if (!teamObject) {
          console.error('Team not found');
          return;
        }

        if (!teamObject.channels || teamObject.channels.length === 0) {
          console.error('No channels found for the team');
          return;
        }
        
        GeneralChannelIdToDelete = teamObject.channels[0];
        console.log("general channel id: ", GeneralChannelIdToDelete);
      });
    });

    /*
            Test Case 2: The team is not created successfully
            No inputs are provided.
            The expected result is a 500 status.
        */
    describe('given the team is not created successfully', () => {
      it('should return a 500', async () => {
        const res = await request(server).post('/teams/create').send({
          // Send nothing
        });

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
                The team ID and member ID are provided, both exist in the DB aand are exclusively for testing.
                The expected result is a success message.
            */
    describe('given the member is added successfully', () => {
      it('should return a success message', async () => {
        const teamId = 'JEST-TESTTEAMID-123';
        const memberId = 'JEST-TESTUSERID-456';

        const res = await request(server).post('/teams/addMember').send({
          teamId: teamId,
          memberId: memberId,
        });

        expect(res.body).toEqual({ success: true });
      });
    });

    /*
                Test Case 2: The member is not added successfully
                No inputs are provided.
                The expected result is a 404 status.
            */
    describe('given the member is not added successfully', () => {
      it('should return a 500', async () => {
        const res = await request(server).post('/teams/addMember').send({
          // send nothing
        });

        expect(res.statusCode).toEqual(404);
      });
    });
  });
});
