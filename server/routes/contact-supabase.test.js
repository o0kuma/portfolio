const express = require('express');
const request = require('supertest');

jest.mock('../services/supabaseService', () => ({
  createContact: jest.fn(),
  getContact: jest.fn(),
  getContacts: jest.fn(),
  getCount: jest.fn(),
  updateContactStatus: jest.fn()
}));

jest.mock('../utils/email', () => ({
  sendContactEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../middleware/adminTokenAuth', () => ({
  requireAdminToken: jest.fn((req, res, next) => {
    const auth = req.headers.authorization;
    if (auth === 'Bearer admin-token') return next();
    return res.status(401).json({ error: '액세스 토큰이 필요합니다.' });
  })
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

  test('allows public contact submissions', async () => {
    supabaseService.createContact.mockResolvedValue({ id: 'contact-1' });

    const response = await request(createApp())
      .post('/api/contact')
      .send({
        name: 'Master',
        email: 'master@example.com',
        subject: 'Hello',
        message: 'Test message'
      })
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      contactId: 'contact-1'
    });
    expect(supabaseService.createContact).toHaveBeenCalled();
  });

  test('blocks unauthenticated contact list reads before reaching the database', async () => {
    await request(createApp())
      .get('/api/contact')
      .expect(401);

    expect(supabaseService.getContacts).not.toHaveBeenCalled();
    expect(supabaseService.getCount).not.toHaveBeenCalled();
  });

  test('blocks unauthenticated contact detail reads before reaching the database', async () => {
    await request(createApp())
      .get('/api/contact/contact-1')
      .expect(401);

    expect(supabaseService.getContact).not.toHaveBeenCalled();
  });

  test('GET /:id reads contact details through the Neon service adapter for admins', async () => {
    supabaseService.getContact.mockResolvedValue({
      id: 'contact-1',
      name: 'Master',
      email: 'master@example.com',
      subject: 'Hello',
      message: 'Test message'
    });

    const response = await request(createApp())
      .get('/api/contact/contact-1')
      .set('Authorization', 'Bearer admin-token')
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
      .set('Authorization', 'Bearer admin-token')
      .expect(404);
  });
});
