import { Connection, Client } from '@temporalio/client';
import { freightDelayNotification } from './workflows/index';
import 'dotenv/config';
import { nanoid } from 'nanoid';
import type { DeliveryRoute } from './types';
import { DELAY_THRESHOLD_MINUTES } from './constants';
import { validateEnvironment, ENV_SETS } from './utils';

async function run() {
  console.log('='.repeat(80));
  console.log('🚚 FREIGHT DELAY NOTIFICATION SYSTEM');
  console.log('='.repeat(80));

  // Validate environment variables
  validateEnvironment(ENV_SETS.ALL, 'the client');

  // Connect to the Temporal Server
  console.log('\n⚙️  Connecting to Temporal server at localhost:7233...');
  let connection;
  try {
    connection = await Connection.connect({
      address: 'localhost:7233',
    });
    console.log('✅ Connected to Temporal server');
  } catch (error) {
    console.error('\n❌ Failed to connect to Temporal server');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    }
    console.error('\n💡 Make sure the Temporal server is running:');
    console.error('   1. Open a new terminal');
    console.error('   2. Run: temporal server start-dev');
    console.error('   3. Wait for "Temporal server is running" message');
    console.error('   4. Then run this client again');
    process.exit(1);
  }

  // Create Temporal client
  let client;
  try {
    client = new Client({
      connection,
    });
  } catch (error) {
    console.error('\n❌ Failed to create Temporal client');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }

  // Example delivery route
  // Try different routes to test with varying traffic conditions:
  const route: DeliveryRoute = {
    origin: 'Berlin, Germany',
    destination: 'Milan, Italy',
    customerName: 'Esteban',
    // IMPORTANT: Replace with a real email address
    customerEmail: 'estlopacu@gmail.com', // <-- Replace with your email
  };

  console.log('Starting freight delay notification workflow...');
  console.log(`Route: ${route.origin} -> ${route.destination}`);
  console.log(`Delay threshold: ${DELAY_THRESHOLD_MINUTES} minutes\n`);

  const handle = await client.workflow.start(freightDelayNotification, {
    taskQueue: 'freight-delay-notification',
    args: [route],
    workflowId: 'freight-delay-' + nanoid(),
  });

  console.log(`Started workflow ${handle.workflowId}`);

  // Wait for the result
  const result = await handle.result();

  console.log('\n=== Traffic Conditions ===');
  console.log(`Route: ${result.trafficConditions.routeSummary}`);
  console.log(`Distance: ${(result.trafficConditions.distance / 1000).toFixed(2)} km`);
  console.log(`Normal duration: ${Math.round(result.trafficConditions.durationWithoutTraffic / 60)} minutes`);
  console.log(
    `Current duration (with traffic): ${Math.round(result.trafficConditions.durationInTraffic / 60)} minutes`,
  );
  console.log(`Delay: ${result.trafficConditions.delayInMinutes} minutes`);

  console.log('\n=== Notification Decision ===');
  if (result.delayDetected) {
    console.log(
      `⚠️  DELAY DETECTED: ${result.trafficConditions.delayInMinutes} minutes exceeds threshold of ${DELAY_THRESHOLD_MINUTES} minutes`,
    );

    if (result.notificationMessage) {
      console.log('\n=== Notification Message ===');
      console.log(result.notificationMessage);
      if (result.notificationSent) {
        console.log(`\n✅ Email notification sent to ${route.customerEmail}`);
      } else {
        console.log('\n❌ Email notification was not sent.');
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
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
