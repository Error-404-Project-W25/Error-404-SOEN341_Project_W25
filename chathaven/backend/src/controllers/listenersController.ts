import { Request, Response } from 'express';
import { Channel } from '../models/channelsModel';
import { Team } from '../models/teamsModel';
import { createSession } from 'better-sse';
import { User } from '../models/userModel';
import { SSEUpdatePayload, SSEUpdateCategory } from '@shared/sse-updates.types';

type WatchPipeline = {
  model: typeof Team | typeof Channel | typeof User;
  category: SSEUpdateCategory;
  match: Record<string, string>;
};

/**
 * Watch for changes in Team, Channel, and User collections in the database
 * Send updates to the client via SSE when the user is involved in the changes
 *
 * @param req userId
 */
export const watchChanges = async (req: Request, res: Response) => {
  try {
    const userId: string = req.body.userId;
    const session = await createSession(req, res);

    const pipelines: WatchPipeline[] = [
      {
        model: Team,
        category: 'team',
        match: { 'fullDocument.members': userId },
      },
      {
        model: Channel,
        category: 'channel',
        match: { 'fullDocument.members': userId },
      },
      {
        model: User,
        category: 'user',
        match: { 'fullDocument.userId': userId },
      },
    ];

    pipelines.forEach(({ model, category, match }) => {
      const pipeline = [
        { $match: match },
        { $project: { 'updateDescription.updatedFields': 1, fullDocument: 1 } },
      ];

      // Based on the structure of the update, extract the type and id of the updated object
      model
        .watch(pipeline, { fullDocument: 'updateLookup' })
        .on('change', (data) => {
          const updateObject = Object.entries(
            data.updateDescription?.updatedFields || {}
          )
            .filter(([key]) => /\.\d+$/.test(key))
            .map(([field, id]) => ({
              field: field.split('.')[0],
              id: id as string,
            }))[0];

          if (!updateObject) return; // Skip if no valid updates are found

          session.push({
            updateCategory: category,
            updatedField: updateObject.field,
            updatedObjectId: updateObject.id,
          } as SSEUpdatePayload);
        });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to listen to changes',
      details: (error as Error).message,
    });
  }
};
