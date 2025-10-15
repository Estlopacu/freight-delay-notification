import sgMail from '@sendgrid/mail';

export interface EmailNotificationInput {
  to: string;
  subject: string;
  message: string;
}

/**
 * Sends an email notification using SendGrid.
 *
 * Reads credentials from environment variables:
 * - SENDGRID_API_KEY
 * - SENDGRID_FROM_EMAIL (the 'from' email address)
 */
export async function sendEmailNotification(input: EmailNotificationInput): Promise<void> {
  const { to, subject, message } = input;

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  const missingVars: string[] = [];
  if (!apiKey) missingVars.push('SENDGRID_API_KEY');
  if (!fromEmail) missingVars.push('SENDGRID_FROM_EMAIL');

  if (missingVars.length > 0) {
    // Throw an error that lists exactly which variables are missing
    throw new Error(`Missing SendGrid environment variables: ${missingVars.join(', ')}`);
  }

  // TypeScript needs to know these are not undefined after the check
  sgMail.setApiKey(apiKey!);

  const mailOptions = {
    to,
    from: fromEmail!,
    subject,
    text: message,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #333;">Delivery Delay Notification</h2>
      <p style="color: #666; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This is an automated message from your delivery service.</p>
    </div>`,
  };

  try {
    const response = await sgMail.send(mailOptions);
    console.log(`Email sent successfully to ${to}. Status: ${response[0].statusCode}`);
  } catch (error) {
    console.error('Failed to send email via SendGrid:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown SendGrid error'}`);
  }
}
