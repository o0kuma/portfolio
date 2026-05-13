const nodemailer = require('nodemailer');
const { getAccessToken, validateOAuthConfig } = require('./oauth');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}));

jest.mock('./oauth', () => ({
  getAccessToken: jest.fn(),
  validateOAuthConfig: jest.fn()
}));

describe('utils/email', () => {
  const originalEnv = process.env;
  const sendMail = jest.fn();
  const verify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      SMTP_USER: 'owner@example.com',
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      GOOGLE_REFRESH_TOKEN: 'refresh-token'
    };

    getAccessToken.mockResolvedValue('access-token');
    validateOAuthConfig.mockReturnValue(undefined);
    verify.mockResolvedValue(undefined);
    sendMail.mockResolvedValue({ messageId: 'message-id' });
    nodemailer.createTransport.mockReturnValue({ verify, sendMail });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('creates a Nodemailer transport and sends contact emails', async () => {
    const { sendContactEmail } = require('./email');

    const result = await sendContactEmail({
      name: 'Master',
      email: 'master@example.com',
      subject: 'Project inquiry',
      message: 'Hello'
    });

    expect(result).toMatchObject({ success: true });
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'gmail',
        auth: expect.objectContaining({
          type: 'OAuth2',
          user: 'owner@example.com',
          accessToken: 'access-token'
        })
      })
    );
    expect(sendMail).toHaveBeenCalledTimes(2);
  });
});
