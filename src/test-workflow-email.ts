/**
 * Test client for the complete freight delay notification workflow with email
 *
 * This script tests the end-to-end workflow including:
 * 1. Checking traffic conditions
 * 2. Determining if delay exceeds threshold
 * 3. Generating a notification message
 * 4. Sending an email notification via SendGrid
 *
 * Prerequisites:
 * - Temporal server running (temporal server start-dev)
 * - Worker running (npm run start)
 * - Environment variables configured in .env:
 *   - GOOGLE_MAPS_API_KEY
 *   - SENDGRID_API_KEY
 *   - SENDGRID_FROM_EMAIL
 *
 * Usage: ts-node src/test-workflow-email.ts [recipient-email]
 */

import { Connection, Client } from '@temporalio/client';
import { freightDelayNotification } from './workflows/index';
import 'dotenv/config';
import { nanoid } from 'nanoid';
import type { DeliveryRoute } from './types';
import { DELAY_THRESHOLD_MINUTES } from './constants';
import { validateEnvironment, ENV_SETS } from './utils';

async function run() {
  console.log('='.repeat(80));
  console.log('🚚 FREIGHT DELAY NOTIFICATION WORKFLOW TEST - EMAIL VERSION');
  console.log('='.repeat(80));

  // Validate environment variables
  validateEnvironment(ENV_SETS.ALL, 'the workflow test');

  // Get recipient email from command line or use default
  const recipientEmail = process.argv[2] || process.env.SENDGRID_FROM_EMAIL!;

  console.log(`\n📧 Email will be sent to: ${recipientEmail}`);

  // Example delivery routes
  // Route 1: High traffic route (likely to have delays)
  const routeWithDelay: DeliveryRoute = {
    origin: 'Los Angeles, CA',
    destination: 'San Diego, CA',
    customerName: 'Esteban',
    customerEmail: recipientEmail,
  };

  // Route 2: Low traffic route (unlikely to have delays)
  const routeWithoutDelay: DeliveryRoute = {
    origin: 'Berlin, Germany',
    destination: 'Dresden, Germany',
    customerName: 'Esteban',
    customerEmail: recipientEmail,
  };

  // Choose which route to test (you can modify this)
  const route = routeWithDelay; // Change to routeWithoutDelay to test no-delay scenario

  console.log('\n📍 Route Configuration:');
  console.log(`   Origin: ${route.origin}`);
  console.log(`   Destination: ${route.destination}`);
  console.log(`   Customer: ${route.customerName}`);
  console.log(`   Email: ${route.customerEmail}`);
  console.log(`   Delay Threshold: ${DELAY_THRESHOLD_MINUTES} minutes`);

  // Connect to Temporal
  console.log('\n⚙️  Connecting to Temporal server...');
  const connection = await Connection.connect({ address: 'localhost:7233' });

  const client = new Client({
    connection,
  });

  console.log('✅ Connected to Temporal server');

  // Start the workflow
  const workflowId = 'freight-delay-email-' + nanoid();
  console.log(`\n🚀 Starting workflow: ${workflowId}`);

  const handle = await client.workflow.start(freightDelayNotification, {
    taskQueue: 'freight-delay-notification',
    args: [route],
    workflowId,
  });

  console.log('⏳ Workflow started, waiting for result...\n');

  // Wait for the result
  const result = await handle.result();

  // Display traffic conditions
  console.log('='.repeat(80));
  console.log('📊 TRAFFIC CONDITIONS');
  console.log('='.repeat(80));
  console.log(`Route: ${result.trafficConditions.routeSummary}`);
  console.log(`Distance: ${(result.trafficConditions.distance / 1000).toFixed(2)} km`);
  console.log(
    `Normal duration: ${Math.round(result.trafficConditions.durationWithoutTraffic / 60)} minutes`,
  );
  console.log(
    `Current duration (with traffic): ${Math.round(result.trafficConditions.durationInTraffic / 60)} minutes`,
  );
  console.log(`⏱️  Delay: ${result.trafficConditions.delayInMinutes} minutes`);

  // Display notification decision
  console.log('\n' + '='.repeat(80));
  console.log('🔔 NOTIFICATION DECISION');
  console.log('='.repeat(80));

  if (result.delayDetected) {
    console.log(
      `⚠️  DELAY DETECTED: ${result.trafficConditions.delayInMinutes} minutes exceeds threshold of ${DELAY_THRESHOLD_MINUTES} minutes`,
    );

    if (result.notificationMessage) {
      console.log('\n📝 Generated Message:');
      console.log('─'.repeat(80));
      console.log(result.notificationMessage);
      console.log('─'.repeat(80));

      if (result.notificationSent) {
        console.log(`\n✅ Email notification sent successfully to ${route.customerEmail}`);
        console.log('\n📬 Next steps:');
        console.log(`   1. Check your inbox at ${route.customerEmail}`);
        console.log('   2. If not in inbox, check spam/junk folder');
        console.log('   3. Look for subject: "Delivery Delay Alert"');
      } else {
        console.log(`\n❌ Email notification failed to send`);
        if (result.notificationError) {
          console.log(`   Error: ${result.notificationError}`);
        }
      }
    }
  } else {
    console.log(
      `✅ No significant delay: ${result.trafficConditions.delayInMinutes} minutes is below threshold of ${DELAY_THRESHOLD_MINUTES} minutes`,
    );
    console.log('No notification needed');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ WORKFLOW COMPLETED');
  console.log('='.repeat(80));
  console.log(`Workflow ID: ${workflowId}`);
  console.log(`Delay Detected: ${result.delayDetected ? 'Yes' : 'No'}`);
  console.log(`Notification Sent: ${result.notificationSent ? 'Yes' : 'No'}`);
  console.log('='.repeat(80));
}

// Show usage if --help is passed
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: ts-node src/test-workflow-email.ts [recipient-email]

Examples:
  ts-node src/test-workflow-email.ts
    → Sends email to your verified sender email (from .env)

  ts-node src/test-workflow-email.ts customer@example.com
    → Sends email to customer@example.com

Options:
  -h, --help    Show this help message

Prerequisites:
  1. Temporal server running:
     temporal server start-dev

  2. Worker running in another terminal:
     npm run start

  3. Environment variables configured in .env:
     - GOOGLE_MAPS_API_KEY
     - SENDGRID_API_KEY
     - SENDGRID_FROM_EMAIL

Notes:
  - This tests the complete end-to-end workflow
  - Modify the route in the script to test different scenarios
  - Uses Los Angeles to San Diego route (likely to have delays)
  - Change to Berlin-Dresden route for low delay testing
  `);
  process.exit(0);
}

// Run the test
run().catch((err) => {
  console.error('\n❌ Workflow failed:');
  console.error(err);
  process.exit(1);
});
