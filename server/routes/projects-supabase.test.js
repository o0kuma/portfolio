jest.mock('../services/supabaseService', () => ({
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const supabaseService = require('../services/supabaseService');
const projectsRouter = require('./projects-supabase');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/projects', projectsRouter);
  return app;
}

describe('projects-supabase admin routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_API_TOKEN = 'admin-token';
  });

  afterEach(() => {
    delete process.env.ADMIN_API_TOKEN;
  });

  test('blocks unauthenticated project creation before writing to the database', async () => {
    await request(createApp())
      .post('/api/projects')
      .send({ title: 'T', description: 'D', content: 'Body' })
      .expect(401);

    expect(supabaseService.createProject).not.toHaveBeenCalled();
  });

  test('blocks unauthenticated project updates before writing to the database', async () => {
    await request(createApp())
      .put('/api/projects/project-1')
      .send({ title: 'Changed' })
      .expect(401);

    expect(supabaseService.updateProject).not.toHaveBeenCalled();
  });

  test('blocks unauthenticated project deletion before deleting from the database', async () => {
    await request(createApp())
      .delete('/api/projects/project-1')
      .expect(401);

    expect(supabaseService.deleteProject).not.toHaveBeenCalled();
  });

  test('allows admins to delete projects', async () => {
    supabaseService.deleteProject.mockResolvedValue(true);

    await request(createApp())
      .delete('/api/projects/project-1')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(supabaseService.deleteProject).toHaveBeenCalledWith('project-1');
  });
});
