import { config } from 'dotenv';
import { sendEmailNotification } from '../activities/send-email-notification';
import { validateEnvironment, ENV_SETS } from '../utils/env-validation';

config();

async function testEmailNotification() {
  console.log('='.repeat(70));
  console.log('📧 SENDGRID EMAIL NOTIFICATION TEST');
  console.log('='.repeat(70));

  // Validate environment variables
  validateEnvironment(ENV_SETS.EMAIL, 'the email test');

  const apiKey = process.env.SENDGRID_API_KEY!;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL!;

  if (apiKey === 'YOUR_SENDGRID_API_KEY_HERE') {
    console.error('\n❌ You need to replace the placeholder API key with your actual SendGrid API key.');
    process.exit(1);
  }

  const recipientEmail = process.argv[2] || fromEmail;

  try {
    const testInput = {
      to: recipientEmail,
      subject: 'Test: Delivery Delay Notification System',
      message: `Hello!

This is a test email from your Freight Delay Notification system.

If you're receiving this, it means:
✅ Your SendGrid integration is working correctly
✅ Your API key is valid
✅ Your sender email is verified
✅ Emails are being delivered successfully

Test Details:
- From: ${fromEmail}
- To: ${recipientEmail}
- Timestamp: ${new Date().toISOString()}

This is an automated test message. You can safely ignore or delete it.

Best regards,
Freight Delay Notification System`,
    };

    console.log('\n📤 Sending test email...');
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${recipientEmail}`);
    console.log(`   Subject: ${testInput.subject}`);
    console.log('');

    await sendEmailNotification(testInput);

    console.log('\n✅ Email sent successfully!');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ Failed to send email:');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);

      if (error.message.includes('credentials') || error.message.includes('Unauthorized')) {
        console.error('\n💡 Hint: Your API key may be invalid or expired.');
        console.error('   Solution: Create a new API key at https://app.sendgrid.com/settings/api_keys');
      } else if (error.message.includes('from email') || error.message.includes('does not contain a valid address')) {
        console.error('\n💡 Hint: Your sender email address needs to be verified.');
        console.error('   Solution: Verify your email at https://app.sendgrid.com/settings/sender_auth');
      } else if (error.message.includes('limit') || error.message.includes('quota')) {
        console.error('\n💡 Hint: You may have exceeded your daily email limit (100/day).');
        console.error('   Solution: Wait until tomorrow or upgrade your SendGrid plan.');
      } else if (error.message.includes('Permission denied') || error.message.includes('Forbidden')) {
        console.error('\n💡 Hint: Your API key may not have the correct permissions.');
        console.error('   Solution: Create a new API key with "Mail Send" or "Full Access" permissions.');
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}


// Run the test
testEmailNotification();
