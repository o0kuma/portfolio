jest.mock('../services/supabaseService', () => ({
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const supabaseService = require('../services/supabaseService');
const postsRouter = require('./posts-supabase');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postsRouter);
  return app;
}

describe('posts-supabase admin routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_API_TOKEN = 'admin-token';
  });

  afterEach(() => {
    delete process.env.ADMIN_API_TOKEN;
  });

  test('blocks unauthenticated post creation before writing to the database', async () => {
    await request(createApp())
      .post('/api/posts')
      .send({ title: 'T', content: 'Body', author: 'Master' })
      .expect(401);

    expect(supabaseService.createPost).not.toHaveBeenCalled();
  });

  test('blocks non-admin post updates before writing to the database', async () => {
    await request(createApp())
      .put('/api/posts/post-1')
      .set('Authorization', 'Bearer user-token')
      .send({ title: 'Changed' })
      .expect(401);

    expect(supabaseService.updatePost).not.toHaveBeenCalled();
  });

  test('blocks unauthenticated post deletion before deleting from the database', async () => {
    await request(createApp())
      .delete('/api/posts/post-1')
      .expect(401);

    expect(supabaseService.deletePost).not.toHaveBeenCalled();
  });

  test('allows admins to delete posts', async () => {
    supabaseService.deletePost.mockResolvedValue(true);

    await request(createApp())
      .delete('/api/posts/post-1')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(supabaseService.deletePost).toHaveBeenCalledWith('post-1');
  });
});
