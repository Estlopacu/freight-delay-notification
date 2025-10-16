import { sendEmailNotification } from '../activities/send-email-notification.js';
import sgMail from '@sendgrid/mail';

jest.mock('@sendgrid/mail');

const mockSgMail = sgMail as jest.Mocked<typeof sgMail>;

describe('sendEmailNotification Activity', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env = {
      ...originalEnv,
      SENDGRID_API_KEY: 'SG.test-api-key',
      SENDGRID_FROM_EMAIL: 'noreply@example.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should send an email successfully', async () => {
    const mockSend = jest.fn().mockResolvedValue([{ statusCode: 202 }]);
    mockSgMail.send = mockSend;
    mockSgMail.setApiKey = jest.fn();

    const input = {
      to: 'customer@example.com',
      subject: 'Delivery Delay Alert',
      message: 'Your delivery is delayed by 15 minutes.',
    };

    await sendEmailNotification(input);

    expect(mockSgMail.setApiKey).toHaveBeenCalledWith('SG.test-api-key');

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: input.to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: input.subject,
        text: input.message,
        html: expect.stringContaining('Delivery Delay Notification'),
      }),
    );
  });

  it('should throw an error if required environment variables are missing', async () => {
    delete process.env.SENDGRID_API_KEY;

    const input = {
      to: 'customer@example.com',
      subject: 'Test',
      message: 'This should fail.',
    };

    await expect(sendEmailNotification(input)).rejects.toThrow(
      'Missing SendGrid environment variables: SENDGRID_API_KEY',
    );
  });

  it('should throw an error if the SendGrid API call fails', async () => {
    const errorMessage = 'SendGrid API is down';
    const mockSend = jest.fn().mockRejectedValue(new Error(errorMessage));
    mockSgMail.send = mockSend;
    mockSgMail.setApiKey = jest.fn();

    const input = {
      to: 'customer@example.com',
      subject: 'Test',
      message: 'This will also fail.',
    };

    await expect(sendEmailNotification(input)).rejects.toThrow(`Failed to send email: ${errorMessage}`);
  });

  it('should include HTML formatted content', async () => {
    const mockSend = jest.fn().mockResolvedValue([{ statusCode: 202 }]);
    mockSgMail.send = mockSend;
    mockSgMail.setApiKey = jest.fn();

    const input = {
      to: 'customer@example.com',
      subject: 'Delivery Delay Alert',
      message: 'Your delivery is delayed by 15 minutes.\nPlease check the tracking page.',
    };

    await sendEmailNotification(input);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('<br>'),
      }),
    );
  });
});
