export type SSEUpdateCategory = 'user' | 'team' | 'channel';

export type SSEUpdatePayload = {
  updateCategory: SSEUpdateCategory;
  updatedField: string;
  updatedObjectId: string;
};
