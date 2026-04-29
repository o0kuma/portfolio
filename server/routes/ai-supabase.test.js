jest.mock('../services/supabaseService', () => ({
  getConversationStats: jest.fn(),
  updateConversationSettings: jest.fn(),
  deleteConversation: jest.fn()
}));

jest.mock('../utils/chatbotAI', () => {
  return jest.fn().mockImplementation(() => ({
    checkStatus: jest.fn().mockResolvedValue({ ok: true })
  }));
});

jest.mock('../utils/translationAI', () => {
  return jest.fn().mockImplementation(() => ({
    checkStatus: jest.fn().mockResolvedValue({ ok: true })
  }));
});

const express = require('express');
const request = require('supertest');
const supabaseService = require('../services/supabaseService');
const aiRouter = require('./ai-supabase');

const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

describe('AI Supabase routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns conversation stats through the database service', async () => {
    supabaseService.getConversationStats.mockResolvedValue({ messages: 2 });

    const response = await request(app).get('/api/ai/conversation/session-1/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      sessionId: 'session-1',
      statistics: { messages: 2 }
    });
    expect(supabaseService.getConversationStats).toHaveBeenCalledWith('session-1');
  });

  test('updates conversation settings through the database service', async () => {
    supabaseService.updateConversationSettings.mockResolvedValue({
      selectedTone: '정중하게',
      language: 'ko',
      isActive: false
    });

    const response = await request(app)
      .put('/api/ai/conversation/session-1/settings')
      .send({ selectedTone: '정중하게', isActive: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      sessionId: 'session-1',
      settings: {
        selectedTone: '정중하게',
        language: 'ko',
        isActive: false
      }
    });
    expect(supabaseService.updateConversationSettings).toHaveBeenCalledWith('session-1', {
      selectedTone: '정중하게',
      isActive: false
    });
  });

  test('deletes conversations through the database service', async () => {
    supabaseService.deleteConversation.mockResolvedValue(true);

    const response = await request(app).delete('/api/ai/conversation/session-1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: '대화가 삭제되었습니다.',
      sessionId: 'session-1'
    });
    expect(supabaseService.deleteConversation).toHaveBeenCalledWith('session-1');
  });
});
