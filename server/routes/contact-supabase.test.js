const express = require('express');
const request = require('supertest');

jest.mock('../services/supabaseService', () => ({
  getContact: jest.fn()
}));

const supabaseService = require('../services/supabaseService');
const contactRouter = require('./contact-supabase');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/contact', contactRouter);
  return app;
}

describe('contact-supabase routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /:id reads contact details through the Neon service adapter', async () => {
    supabaseService.getContact.mockResolvedValue({
      id: 'contact-1',
      name: 'Master',
      email: 'master@example.com',
      subject: 'Hello',
      message: 'Test message'
    });

    const response = await request(createApp())
      .get('/api/contact/contact-1')
      .expect(200);

    expect(supabaseService.getContact).toHaveBeenCalledWith('contact-1');
    expect(response.body).toMatchObject({
      id: 'contact-1',
      email: 'master@example.com'
    });
  });

  test('GET /:id returns 404 when the contact does not exist', async () => {
    supabaseService.getContact.mockResolvedValue(null);

    await request(createApp())
      .get('/api/contact/missing-contact')
      .expect(404);
  });
});
